import json
import logging
import os
import time
from uuid import uuid4

import boto3
from google import genai
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from agents import draft_resume, refine_resume, review_and_factcheck
from docx_generator import generate_docx
from models import MasterResumeData

load_dotenv()

logging.basicConfig(level=logging.INFO, format="[resume-server:%(name)s] %(message)s")
log = logging.getLogger("main")

genai_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

MODEL_RESUME = os.getenv(
    "GEMINI_MODEL_RESUME", os.getenv("GEMINI_MODEL_DEFAULT", "gemini-2.0-flash")
)
MODEL_REVIEWER = os.getenv(
    "GEMINI_MODEL_REVIEWER", os.getenv("GEMINI_MODEL_DEFAULT", "gemini-2.0-flash")
)
DEV_MODE = os.getenv("DEV_MODE") == "1"
API_KEY = os.getenv("RESUME_API_KEY", "")

if not API_KEY and not DEV_MODE:
    raise RuntimeError(
        "RESUME_API_KEY must be set. Use DEV_MODE=1 only for local unauthenticated development."
    )

app = FastAPI(title="Resume Generation API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    ],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def _get_master_resume() -> dict:
    s3 = boto3.client(
        "s3",
        region_name=os.environ["AWS_REGION"],
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    obj = s3.get_object(Bucket=os.environ["AWS_BUCKET_NAME"], Key="master_data.json")
    return json.loads(obj["Body"].read())


def _model_to_dict(model: BaseModel) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


class GenerateRequest(BaseModel):
    jobDescription: str


@app.post("/generate")
async def generate(
    body: GenerateRequest,
    x_api_key: str = Header(default=""),
):
    request_id = uuid4().hex[:8]
    started_at = time.perf_counter()

    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    job_description = body.jobDescription.strip()
    if not job_description:
        raise HTTPException(status_code=400, detail="jobDescription is required")

    log.info(
        f"[{request_id}] Request received — JD length: {len(job_description)} chars"
    )
    log.info(
        f"[{request_id}] Models — draft/refine: {MODEL_RESUME} | reviewer: {MODEL_REVIEWER}"
    )

    log.info(f"[{request_id}] Fetching master resume from S3...")
    master_data = MasterResumeData.from_s3_dict(_get_master_resume())
    master_data_dict = _model_to_dict(master_data)
    master_data_str = json.dumps(master_data_dict)
    log.info(f"[{request_id}] Master resume loaded.")

    log.info(f"[{request_id}] Agent 1: drafting resume...")
    draft = await draft_resume(
        genai_client, MODEL_RESUME, job_description, master_data_str
    )
    log.info(f"[{request_id}] Draft complete.")

    log.info(
        f"[{request_id}] Agent 2a + 2b: running reviewer and fact-checker concurrently..."
    )
    draft_json = json.dumps(draft, indent=2)
    review_comments, factcheck_comments = await review_and_factcheck(
        genai_client, MODEL_REVIEWER, job_description, draft_json, master_data_str
    )
    log.info(f"[{request_id}] [fact-checker]\n{factcheck_comments}")

    log.info(f"[{request_id}] Agent 3: refining based on feedback...")
    refined = await refine_resume(
        genai_client,
        MODEL_RESUME,
        job_description,
        master_data_str,
        draft_json,
        review_comments,
        factcheck_comments,
    )
    log.info(f"[{request_id}] Refinement complete.")

    final_data = {
        "header": master_data_dict["header"],
        "education": master_data_dict["education"],
        **refined,
    }

    log.info(f"[{request_id}] Generating .docx...")
    docx_bytes = generate_docx(final_data)
    duration = time.perf_counter() - started_at
    log.info(f"[{request_id}] Done in {duration:.2f}s.")

    return Response(
        content=docx_bytes,
        media_type=DOCX_MIME,
        headers={
            "Content-Disposition": 'attachment; filename="zishenchan-resume.docx"'
        },
    )


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app", host="0.0.0.0", port=8000, reload=True, timeout_keep_alive=120
    )

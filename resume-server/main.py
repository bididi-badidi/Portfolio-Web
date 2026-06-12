import json
import logging
import os

import boto3
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from agents import draft_resume, refine_resume, review_and_factcheck
from docx_generator import generate_docx

load_dotenv()

logging.basicConfig(level=logging.INFO, format="[resume-server:%(name)s] %(message)s")
log = logging.getLogger("main")

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

MODEL_RESUME = os.getenv("GEMINI_MODEL_RESUME", os.getenv("GEMINI_MODEL_DEFAULT", "gemini-2.0-flash"))
MODEL_REVIEWER = os.getenv("GEMINI_MODEL_REVIEWER", os.getenv("GEMINI_MODEL_DEFAULT", "gemini-2.0-flash"))
API_KEY = os.getenv("RESUME_API_KEY", "")

app = FastAPI(title="Resume Generation API")

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


class GenerateRequest(BaseModel):
    jobDescription: str


@app.post("/generate")
async def generate(
    body: GenerateRequest,
    x_api_key: str = Header(default=""),
):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    job_description = body.jobDescription.strip()
    if not job_description:
        raise HTTPException(status_code=400, detail="jobDescription is required")

    log.info(f"Request received — JD length: {len(job_description)} chars")
    log.info(f"Models — draft/refine: {MODEL_RESUME} | reviewer: {MODEL_REVIEWER}")

    log.info("Fetching master resume from S3...")
    master_data = _get_master_resume()
    master_data_str = json.dumps(master_data)
    log.info("Master resume loaded.")

    log.info("Agent 1: drafting resume...")
    draft = await draft_resume(MODEL_RESUME, job_description, master_data_str)
    log.info("Draft complete.")

    log.info("Agent 2a + 2b: running reviewer and fact-checker concurrently...")
    draft_json = json.dumps(draft, indent=2)
    review_comments, factcheck_comments = await review_and_factcheck(
        MODEL_REVIEWER, job_description, draft_json, master_data_str
    )
    log.info(f"[fact-checker]\n{factcheck_comments}")

    log.info("Agent 3: refining based on feedback...")
    refined = await refine_resume(
        MODEL_RESUME, job_description, master_data_str, draft_json, review_comments, factcheck_comments
    )
    log.info("Refinement complete.")

    final_data = {
        "header": master_data["header"],
        "education": master_data["education"],
        **refined,
    }

    log.info("Generating .docx...")
    docx_bytes = generate_docx(final_data)
    log.info("Done.")

    return Response(
        content=docx_bytes,
        media_type=DOCX_MIME,
        headers={"Content-Disposition": 'attachment; filename="zishenchan-resume.docx"'},
    )


@app.get("/health")
def health():
    return {"status": "ok"}

import asyncio
import json

from google import genai
from google.genai import types

from models import ResumeDraft
from prompts import (
    DRAFT_SYSTEM_INSTRUCTION,
    FACTCHECK_SYSTEM_INSTRUCTION,
    REFINE_SYSTEM_INSTRUCTION,
    REVIEW_SYSTEM_INSTRUCTION,
    draft_user_prompt,
    factcheck_user_prompt,
    refine_user_prompt,
    review_user_prompt,
)


async def _generate_json(
    client: genai.Client, model_name: str, system_instruction: str, user_prompt: str
) -> dict:
    response = await client.aio.models.generate_content(
        model=model_name,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=ResumeDraft,
        ),
    )
    return json.loads(response.text)


async def _generate_text(
    client: genai.Client, model_name: str, system_instruction: str, user_prompt: str
) -> str:
    response = await client.aio.models.generate_content(
        model=model_name,
        contents=user_prompt,
        config=types.GenerateContentConfig(system_instruction=system_instruction),
    )
    return response.text


async def draft_resume(
    client: genai.Client, model: str, job_description: str, master_data_str: str
) -> dict:
    return await _generate_json(
        client,
        model,
        DRAFT_SYSTEM_INSTRUCTION,
        draft_user_prompt(job_description, master_data_str),
    )


async def review_and_factcheck(
    client: genai.Client,
    model: str,
    job_description: str,
    draft_json: str,
    master_data_str: str,
) -> tuple[str, str]:
    review_task = _generate_text(
        client,
        model,
        REVIEW_SYSTEM_INSTRUCTION,
        review_user_prompt(job_description, draft_json),
    )
    factcheck_task = _generate_text(
        client,
        model,
        FACTCHECK_SYSTEM_INSTRUCTION,
        factcheck_user_prompt(master_data_str, draft_json),
    )
    return await asyncio.gather(review_task, factcheck_task)


async def refine_resume(
    client: genai.Client,
    model: str,
    job_description: str,
    master_data_str: str,
    draft_json: str,
    review_comments: str,
    factcheck_comments: str,
) -> dict:
    return await _generate_json(
        client,
        model,
        REFINE_SYSTEM_INSTRUCTION,
        refine_user_prompt(
            job_description,
            master_data_str,
            draft_json,
            review_comments,
            factcheck_comments,
        ),
    )

import asyncio
import json
from typing import Any

import google.generativeai as genai

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

DRAFT_SCHEMA = {
    "type": "OBJECT",
    "required": ["summary", "work_experiences", "personal_projects", "leadership_experiences", "skills"],
    "properties": {
        "summary": {"type": "STRING"},
        "work_experiences": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "required": ["title", "role", "date", "bullets"],
                "properties": {
                    "title": {"type": "STRING"},
                    "role": {"type": "STRING"},
                    "date": {"type": "STRING"},
                    "bullets": {"type": "ARRAY", "items": {"type": "STRING"}},
                },
            },
        },
        "personal_projects": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "required": ["title", "role", "date", "bullets"],
                "properties": {
                    "title": {"type": "STRING"},
                    "role": {"type": "STRING"},
                    "date": {"type": "STRING"},
                    "bullets": {"type": "ARRAY", "items": {"type": "STRING"}},
                },
            },
        },
        "leadership_experiences": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "required": ["title", "role", "date", "bullets"],
                "properties": {
                    "title": {"type": "STRING"},
                    "role": {"type": "STRING"},
                    "date": {"type": "STRING"},
                    "bullets": {"type": "ARRAY", "items": {"type": "STRING"}},
                },
            },
        },
        "skills": {
            "type": "OBJECT",
            "required": ["Technical"],
            "properties": {"Technical": {"type": "STRING"}},
        },
    },
}


async def _generate_json(model_name: str, system_instruction: str, user_prompt: str, schema: dict) -> Any:
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_instruction,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=schema,
        ),
    )
    response = await asyncio.to_thread(model.generate_content, user_prompt)
    return json.loads(response.text)


async def _generate_text(model_name: str, system_instruction: str, user_prompt: str) -> str:
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_instruction,
    )
    response = await asyncio.to_thread(model.generate_content, user_prompt)
    return response.text


async def draft_resume(model: str, job_description: str, master_data_str: str) -> dict:
    return await _generate_json(
        model,
        DRAFT_SYSTEM_INSTRUCTION,
        draft_user_prompt(job_description, master_data_str),
        DRAFT_SCHEMA,
    )


async def review_and_factcheck(
    model: str, job_description: str, draft_json: str, master_data_str: str
) -> tuple[str, str]:
    review_task = _generate_text(model, REVIEW_SYSTEM_INSTRUCTION, review_user_prompt(job_description, draft_json))
    factcheck_task = _generate_text(model, FACTCHECK_SYSTEM_INSTRUCTION, factcheck_user_prompt(master_data_str, draft_json))
    return await asyncio.gather(review_task, factcheck_task)


async def refine_resume(
    model: str,
    job_description: str,
    master_data_str: str,
    draft_json: str,
    review_comments: str,
    factcheck_comments: str,
) -> dict:
    return await _generate_json(
        model,
        REFINE_SYSTEM_INSTRUCTION,
        refine_user_prompt(job_description, master_data_str, draft_json, review_comments, factcheck_comments),
        DRAFT_SCHEMA,
    )

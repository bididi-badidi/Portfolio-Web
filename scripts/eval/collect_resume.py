from __future__ import annotations

import os
from typing import Any

import requests


def collect_resume_answer(example: dict[str, Any]) -> dict[str, Any]:
    """Collect a resume answer from the eval API, or use offline ground truth."""

    base_url = os.getenv("EVAL_BASE_URL")
    if not base_url:
        return {
            "answer": example["ground_truth"],
            "contexts": example.get("contexts", []),
            "source": "offline-ground-truth",
        }

    response = requests.post(
        f"{base_url.rstrip('/')}/api/eval/resume",
        json={
            "jobDescription": example["question"],
            "contexts": example.get("contexts", []),
        },
        timeout=120,
    )
    response.raise_for_status()
    payload = response.json()

    return {
        "answer": payload.get("answer", ""),
        "contexts": payload.get("contexts") or example.get("contexts", []),
        "source": "api",
    }

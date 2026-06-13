from __future__ import annotations

import os
from dataclasses import dataclass

import google.generativeai as genai


@dataclass
class GeminiJudge:
    """Small Gemini wrapper used by custom eval code and future RAGAS adapters."""

    model_name: str | None = None

    def __post_init__(self) -> None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is required for Gemini judge calls")

        genai.configure(api_key=api_key)
        model_name = (
            self.model_name
            or os.getenv("NEXT_PUBLIC_GEMINI_MODEL_JUDGE")
            or os.getenv("NEXT_PUBLIC_GEMINI_MODEL_REPLY")
            or os.getenv("NEXT_PUBLIC_GEMINI_MODEL_DEFAULT")
            or "gemini-1.5-flash"
        )
        self._model = genai.GenerativeModel(model_name)
        self.model_name = model_name

    def generate(self, prompt: str) -> str:
        response = self._model.generate_content(prompt)
        return getattr(response, "text", "") or ""

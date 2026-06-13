from __future__ import annotations

import os
from typing import Any

import google.generativeai as genai
from langchain_core.language_models.llms import LLM
from pydantic.v1 import PrivateAttr


class GeminiJudge(LLM):
    """LangChain-compatible Gemini judge for RAGAS metric prompts."""

    model_name: str | None = None

    _model: genai.GenerativeModel = PrivateAttr()

    def __init__(self, **data: Any) -> None:
        super().__init__(**data)
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

    @property
    def _llm_type(self) -> str:
        return "gemini-judge"

    @property
    def _identifying_params(self) -> dict[str, Any]:
        return {"model_name": self.model_name}

    def _call(
        self,
        prompt: str,
        stop: list[str] | None = None,
        **_: Any,
    ) -> str:
        response = self._model.generate_content(prompt)
        text = getattr(response, "text", "") or ""
        if stop:
            for token in stop:
                if token in text:
                    text = text.split(token, 1)[0]
        return text

from __future__ import annotations

import gemini_judge


class FakeResponse:
    text = "judge response"


class FakeGenerativeModel:
    def __init__(self, model_name: str) -> None:
        self.model_name = model_name

    def generate_content(self, prompt: str) -> FakeResponse:
        assert prompt == "score this"
        return FakeResponse()


def test_gemini_judge_stores_private_model(monkeypatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("NEXT_PUBLIC_GEMINI_MODEL_JUDGE", "gemini-test")
    monkeypatch.setattr(gemini_judge.genai, "configure", lambda api_key: None)
    monkeypatch.setattr(gemini_judge.genai, "GenerativeModel", FakeGenerativeModel)

    judge = gemini_judge.GeminiJudge()

    assert judge.model_name == "gemini-test"
    assert judge._call("score this") == "judge response"

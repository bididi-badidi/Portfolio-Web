# Session Handover Notes

## Current Context

- Branch: `feat/issue-34`
- Goal: Integrate RAGAS to evaluate chatbot and resume synthesis LLM quality (GitHub issue #34).
- Implementation plan is fully drafted at `.ai/assets/branches/feat-issue-34/plan.md` — covers 4 phases: golden dataset, RAGAS harness, CI integration, documentation.
- No code has been written yet on this branch (clean working tree as of session start).

## Next Steps

- Phase 1: create `.ai/eval/chatbot.jsonl` (≥10 examples), `.ai/eval/resume.jsonl` (≥5 examples), snapshot S3 knowledge fixtures.
- Phase 2: scaffold Python harness in `scripts/eval/` (ragas_eval.py, gemini_judge.py, collect_chatbot.py, collect_resume.py).
- Resolve open question before starting Phase 2: single pyproject.toml vs scripts/eval/requirements.txt.

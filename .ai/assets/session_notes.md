# Session Handover Notes

## Current Context

- Branch: `feat/issue-34`.
- User asked to start implementation from `.ai/assets/branches/feat-issue-34/codex-claude-resume-plan.md`.
- Added experimental Codex + Claude CLI resume workflow under `scripts/codex-claude-resume/`.
- Added `resume:codex-claude` package script and ignored `.ai/runs/`.
- Review and fact-check stages are serialized and stdout-driven: Claude returns comments, then the orchestrator writes `stages.review` / `stages.factcheck`. This avoids Claude Code file-write permission prompts in print mode.
- Codex draft can set top-level `outputFilename`; the DOCX step sanitizes and uses it under `/Users/user/Downloads/` unless `--out` is supplied.

## Verification

- `uv run ruff format .` passed.
- `uv run ruff check . --fix` passed.
- `uv run pytest` still fails because `pytest` is not declared in the uv environment.
- `uv run --with pytest pytest` passed: 3 tests.
- `bunx tsc --noEmit --pretty false` passed.
- `bun test` passed: 112 tests.
- Dry-run passed with local master fixture and wrote state/logs under `/tmp/codex-claude-resume-dry-run`.
- Dry-run after Claude stdout fix passed under `/tmp/codex-claude-resume-claude-stdout-dry-run`.
- Filename dry-run passed under `/tmp/codex-claude-resume-filename-dry-run`; example sanitized `../Zishen AI Engineer Resume!.docx` to `/Users/user/Downloads/Zishen-AI-Engineer-Resume.docx`.

## Next Steps

- Run a real stage with authenticated `codex` and `claude` CLIs, for example:
  `bun run resume:codex-claude -- --jd-file=<path> --master-file=.ai/eval/fixtures/knowledge/master_resume.json --only=draft`
- If a prior run has `stages.review.status = "running"` from the old Claude prompt, rerun with `--only=review --run-dir=<same-run-dir>` to replace it with stdout-captured comments.

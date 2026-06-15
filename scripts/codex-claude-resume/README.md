# Codex + Claude Resume Workflow

Experimental CLI-agent resume runner. It mirrors `scripts/run-agentic-resume.ts`
but stores all handoff data in one inspectable JSON file:

```bash
bun run scripts/codex-claude-resume/run.ts \
  --jd-file=testdata/resume/test-jd.txt \
  --master-file=.ai/eval/fixtures/knowledge/master_resume.json
```

The default master resume source is S3 key `master_data.json`, using the same
AWS environment variables as the existing runner. Pass `--master-file` to run
from a local JSON fixture.

Useful flags:

- `--out=<path>` writes the final DOCX somewhere other than
  the drafter-selected filename under `/Users/user/Downloads/`.
- `--run-dir=<dir>` reuses or writes a specific run directory.
- `--from=draft|review|factcheck|refine|docx` resumes from a stage.
- `--only=draft|review|factcheck|refine|docx` runs one stage and stops.
- `--dry-run` writes the exact subprocess commands to `logs/*.log` without
  spawning Codex or Claude.
- `--codex-model=<model>` and `--claude-model=<model>` override defaults.
  Defaults are `gpt-5.5` for Codex draft/refine and `sonnet` for Claude
  review/fact-check.

Run output:

- `run-state.json` contains the job description, master resume, models, and
  every stage output.
- The Codex draft stage may set top-level `outputFilename`; the DOCX step uses
  that sanitized filename unless `--out` is provided.
- `logs/{draft,review,factcheck,refine}.log` captures subprocess commands and
  stdout/stderr.
- The DOCX step reuses `lib/docx.ts`.
- Claude review/fact-check stages return comments on stdout; the orchestrator
  writes those comments into `run-state.json` to avoid Claude Code file-write
  permission prompts in print mode.

Prerequisites:

- `codex` CLI installed and authenticated.
- `claude` CLI installed and authenticated.
- S3 env vars are required unless `--master-file` is provided.

Note: review and fact-check stages are currently serialized for simpler logs and
resumability.

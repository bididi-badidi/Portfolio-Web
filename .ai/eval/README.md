# RAGAS Evaluation

This directory contains deterministic golden datasets for offline chatbot and
resume quality checks. The runner lives in `scripts/eval/ragas_eval.py`.

## Run Locally

Install Python dependencies when you want RAGAS-backed metrics:

```bash
python -m pip install -r scripts/eval/requirements.txt
```

Run the evaluator:

```bash
python scripts/eval/ragas_eval.py --feature chatbot --out .ai/eval/reports
python scripts/eval/ragas_eval.py --feature resume --out .ai/eval/reports
python scripts/eval/ragas_eval.py --feature all --out .ai/eval/reports
```

Without `EVAL_BASE_URL`, the runner uses each example's `ground_truth` as the
answer. That mode is useful for validating dataset shape, report generation,
and threshold handling without API keys. Reports from that path are marked
`lexical-offline-placeholder` and are not a model-quality signal.

With `EVAL_BASE_URL`, collectors call:

- `POST /api/eval/chatbot`
- `POST /api/eval/resume`

Both routes require `EVAL_MODE=1`. Live/API answers are scored with the actual
`ragas` library. RAGAS judge prompts are sent to Gemini through
`scripts/eval/gemini_judge.py`; metrics that need embeddings use a local
deterministic hashing adapter so the harness does not fall back to OpenAI.

During collection, the runner prints per-example progress for chatbot answers
and resume drafts before RAGAS scoring starts.

## Metrics

| Feature | Metrics |
| --- | --- |
| chatbot | `faithfulness`, `answer_relevancy` |
| resume | `faithfulness`, `answer_relevancy`, `answer_correctness` |

Context precision and context recall are not evaluated — the full knowledge
context is passed directly so retrieval ranking is not in scope.

## Knowledge Context

The chatbot eval route always returns the **full knowledge context** as the
evaluation context, built from two fixture files:

- `fixtures/knowledge/knowledge.json` — chatbot knowledge items (title, summary, content)
- `fixtures/knowledge/master_resume.json` — structured resume data serialised section-by-section

This means `faithfulness` measures whether the chatbot answer is grounded in the
complete knowledge base, not just the chunks it happened to retrieve.

## Sync Fixtures From S3

Before evaluating, pull the latest knowledge and resume data from S3:

```bash
python scripts/eval/sync_fixtures.py
```

The script reads AWS credentials from `.env.local` (then `.env`) and downloads:

| S3 key | Local fixture |
| --- | --- |
| `knowledge.json` | `fixtures/knowledge/knowledge.json` |
| `master_data.json` | `fixtures/knowledge/master_resume.json` |

If credentials are absent or set to placeholder values, the script skips the
download and leaves the committed fixtures unchanged — safe for offline runs.

You can override the S3 key for knowledge via `EVAL_KNOWLEDGE_S3_KEY`, and the
fixture paths via `EVAL_KNOWLEDGE_FIXTURE_PATH` and `EVAL_RESUME_FIXTURE_PATH`.

In CI, the workflow runs `sync_fixtures.py` automatically before the eval step
using `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_BUCKET_NAME` secrets.

## Local Answer Cache

Live/API answers are cached under `.ai/eval/cache/` by default so repeated local
runs do not call the app and Gemini for unchanged examples. The cache key
includes the feature, example id, question, contexts, metadata, eval base URL,
Gemini model env vars, and cache schema version.

Refresh cached answers:

```bash
python scripts/eval/ragas_eval.py --feature all --refresh-cache
```

Disable the answer cache for one run:

```bash
python scripts/eval/ragas_eval.py --feature all --no-cache
```

## Refresh Knowledge Fixtures

The committed files in `.ai/eval/fixtures/knowledge/` are snapshots of the S3
knowledge used for evaluation. To refresh them, run `sync_fixtures.py` (see
above). After syncing:

1. Update JSONL examples if source facts changed.
2. Run `python scripts/eval/ragas_eval.py --feature all`.
3. Rebaseline only after reviewing changed examples and scores.

Generated reports under `.ai/eval/reports/` and cached live answers under
`.ai/eval/cache/` are ignored.

## Add A Golden Example

Add one JSON line to `chatbot.jsonl` or `resume.jsonl` using the schema in
`schema.md`. Keep contexts small and directly relevant. Prefer adding examples
for new project facts, function-call behavior, safety boundaries, and resume
requirements that would be costly to catch manually.

## Thresholds And Baseline

`thresholds.json` defines the minimum aggregate metric scores. The runner exits
non-zero when a metric falls below its threshold.

`baseline.json` currently captures the committed offline placeholder scores.
Because offline mode scores `answer = ground_truth`, all metrics are expected to
be `1.0` and should only be used to validate harness plumbing. Replace it with
a live RAGAS baseline after intentionally accepting model and prompt behavior.
Track that replacement as `TODO(issue-34-follow-up)` when CI has a configured
`GEMINI_API_KEY` and the first API-backed report has been reviewed.

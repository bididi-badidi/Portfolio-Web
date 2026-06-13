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
and threshold handling without API keys. With `EVAL_BASE_URL`, collectors call:

- `POST /api/eval/chatbot`
- `POST /api/eval/resume`

Both routes require `EVAL_MODE=1`.

## Refresh Knowledge Fixtures

The committed files in `.ai/eval/fixtures/knowledge/` are small text snapshots
of the knowledge used by evaluation cases. To refresh them:

1. Export the current S3 knowledge files locally.
2. Replace `knowledge.json` and `master_resume.json`.
3. Update JSONL examples if source facts changed.
4. Run `python scripts/eval/ragas_eval.py --feature all`.
5. Rebaseline only after reviewing changed examples and scores.

Generated reports under `.ai/eval/reports/` are ignored.

## Add A Golden Example

Add one JSON line to `chatbot.jsonl` or `resume.jsonl` using the schema in
`schema.md`. Keep contexts small and directly relevant. Prefer adding examples
for new project facts, function-call behavior, safety boundaries, and resume
requirements that would be costly to catch manually.

## Thresholds And Baseline

`thresholds.json` defines the minimum aggregate metric scores. The runner exits
non-zero when a metric falls below its threshold.

`baseline.json` captures the initial committed reference scores. Update it only
after intentionally accepting new model or prompt behavior.

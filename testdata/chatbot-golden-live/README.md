# Chatbot Golden Live Evals (Real Models)

This suite runs the **real** pipeline stages:

1. function-call detection (`fetchFunctionCalls`)
2. function approval (`fetchExcDecisionStruct`)
3. final answer generation (`fetchChatbotReply`)

## Run

```bash
bun run test:chatbot-golden-live
```

This command sets `CHATBOT_LIVE_EVAL=1` to disable test mocks and run real providers.
It also loads `.env.local` via Bun (`--env-file=.env.local`).

The live eval is skipped during a plain `bun test` run unless `CHATBOT_LIVE_EVAL=1` is set.

### Run a specific JSON file

Use the `CASE` env var to filter by filename substring:

```bash
CASE=security bun run test:chatbot-golden-live
```

Examples:

```bash
CASE=navigate-projects bun run test:chatbot-golden-live
CASE=general.json bun run test:chatbot-golden-live
```

### Run by direct Bun command

```bash
CHATBOT_LIVE_EVAL=1 bun --env-file=.env.local test app/lib/chatbot/__tests__/goldenLive.test.ts
```

## Output

A JSON report is written to:

`testdata/chatbot-golden-live/reports/latest.json`

It includes:

- model names used for each pipeline stage
- discovery counts (`filesFound`, `total`)
- per-case pass/fail
- mismatched expectations
- stage trace (detected function, approval decision/reason, returned function call, final output)
- pass-rate thresholds and per-file summaries

In GitHub Actions, the live eval job uploads `testdata/chatbot-golden-live/reports/*.json` as the
`chatbot-golden-live-report` artifact and writes the high-level result table to the workflow run summary.

## Pass-Rate Thresholds

Thresholds are configured in:

`testdata/chatbot-golden-live/thresholds.json`

Current defaults:

```json
{
  "overallPassRate": 0.8,
  "files": {
    "security.json": 1
  }
}
```

Threshold values can be written either as fractions (`0.8`) or percentages (`80`).

GitHub Actions can override these with env vars:

```bash
GOLDEN_LIVE_PASS_RATE_THRESHOLD=0.8
GOLDEN_LIVE_FILE_THRESHOLDS='{"security.json":1}'
```

`GOLDEN_LIVE_FILE_THRESHOLDS` also supports comma syntax:

```bash
GOLDEN_LIVE_FILE_THRESHOLDS='security.json=1,general.json=0.75'
```

Per-case failures are recorded in the report. The test run fails only when the overall pass rate or a
configured per-file pass rate falls below its threshold.

## Case Notes

- JSON files support both single-case and grouped-by-function formats.
- Grouped format shape:
  - `group`: string
  - `cases`: array of case objects (`id`, `description`, `request`, `expected`)
- Each case supports optional `timeoutMs` (milliseconds). If omitted, default is `45000`.
- These are **draft** examples and may need calibration as prompts/models evolve.
- Keep `messageContains` assertions broad to reduce false failures from wording variance.
- For strict gates, rely more on structured checks:
  - `detectedFunctionName`
  - `approved`
  - `returnedFunctionCallName`
  - `error`
- Ensure required env vars are set for live calls (`GEMINI_API_KEY`, model env vars, and any backend endpoints your flow uses like search/knowledge APIs).

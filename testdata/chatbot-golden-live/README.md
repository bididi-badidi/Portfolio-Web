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

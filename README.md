This website is for personal use only.

## Getting Started

Install dependencies

```bash
bun i
```

Local development

```bash
bun dev
```

## Development

### Adding new Function Call

- Declare and export new function [here](./app/lib/chatbot/functionCalls.ts)
- Declare and export app actions [here](./app/context/AppActionsContext.tsx)
  - AppActionsContextProps
  - Declare function under AppActionsContextProvider
- Declare and export function handlers [here](./app/lib/chatbot/functionHandlers.ts)
- Update system instruction for fetching function [fetchFunctionCalls](./app/lib/chatbot/fetchFunctionCalls.ts)

### Chatbot Live Golden Tests

Run all live golden cases:

```bash
bun run test:chatbot-golden-live
```

Run only a specific JSON test file group (filename filter):

```bash
CASE=navigate-projects bun run test:chatbot-golden-live
CASE=security bun run test:chatbot-golden-live:file
```

Direct command form:

```bash
CHATBOT_LIVE_EVAL=1 bun --env-file=.env.local test app/lib/chatbot/__tests__/goldenLive.test.ts
```

Detailed case format and evaluator setup:

- [testdata/chatbot-golden-live/README.md](./testdata/chatbot-golden-live/README.md)

### Running Agentic Resume Generation

```bash
bun --env-file=.env.local run scripts/run-agentic-resume.ts --jd=
bun --env-file=.env.local run scripts/run-agentic-resume.ts --jd-file=testdata/resume/test-jd.txt
```

### Evaluation

RAGAS-style quality checks for the chatbot and resume generation live in
[`.ai/eval/README.md`](./.ai/eval/README.md). The harness writes JSON, CSV, and
Markdown reports and is wired into `.github/workflows/ragas-eval.yml`.

Run all evaluation cases locally with uv:

```bash
uv run --with-requirements scripts/eval/requirements.txt \
  python scripts/eval/ragas_eval.py --feature all --out .ai/eval/reports
```

For live RAGAS scoring, start the app with `EVAL_MODE=1`, set `EVAL_BASE_URL`
and `GEMINI_API_KEY`, then run the same command. Live answers are cached under
`.ai/eval/cache/`; add `--refresh-cache` to collect fresh answers.

### Unit Tests

Run all tests:

```bash
bun test
```

Run all chatbot unit/integration tests:

```bash
bun test ./app/lib/chatbot/__tests__
```

Run a single test file:

```bash
bun test ./app/lib/chatbot/__tests__/fetchReply.test.ts
```

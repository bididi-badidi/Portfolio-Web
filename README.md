This website is for personal use only.

## Development

Install with `bun install`, then run `bun dev`.

The portfolio chatbot reads `OPENAI_API_KEY` on the server. `OPENAI_MODEL` is optional and defaults to `gpt-5.6-luna`. Neither belongs in a `NEXT_PUBLIC_` variable. Other website features retain their existing environment requirements; see `.env.example`.

Production also requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for the public `/api/chatbot` quota. The per-IP allowance, fixed-window duration, global UTC-day allowance, Redis timeout, trusted client-IP header, and Redis key prefix are configurable through the `CHATBOT_*` variables shown in `.env.example`. Local development and tests skip the quota only when both Redis credentials are absent; production fails closed instead of making an unmetered OpenAI request. The preview `/api/concierge` route is not yet included.

## Chatbot

Both `/api/chatbot` and `/api/concierge` use one agent in `lib/chatbot/agent.ts`. Local keyword retrieval augments the prompt before generation. No remote search service, vector database, embeddings, or model-based action approver is required.

See [the architecture and migration decision](docs/chatbot-architecture.md) for the component layout, tool execution flow, limits, and knowledge maintenance.

## Validation

- `bun run typecheck`
- `bun test lib/chatbot/__tests__/chatbot.test.ts`
- `bun test`
- `bun lint`

Chatbot tests use mocked network responses and dummy credentials. Legacy Gemini tests, paid live golden evaluations, their CI job, and the obsolete TypeScript multi-agent resume CLI have been removed. There is no live-test flag or model-based evaluator. The separately deployed Python resume service and `/api/resume` retain their existing workflow.

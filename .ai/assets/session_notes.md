# Session Handover Notes

## Current State
- **Refactor Branch**: `refactor/chatbot-logic` contains the major chatbot refactoring and the subsequent theme/project updates.
- **Chatbot**: Logic centralized in `GeminiService`. `fetchReply`, `fetchFunctionCalls`, `fetchSearchResults`, etc., are now stateless and use a unified service.
- **Theme**: Semantic tokens (`--color-bg-primary`, `--color-text-body`, etc.) are defined in `globals.css` and mapped in `tailwind.config.ts`. Most hardcoded `slate`, `neutral`, and `zinc` colors have been replaced.
- **Projects**: Three new projects (Telegram Multi-Agent, Deep Research, AI Dashboard) are scaffolded in `app/(pages)/projects/` and linked from the landing page timeline.
- **Surprise Element**: "Built by AI" component added to the root layout footer with a scroll animation.

## Next Steps
- **Project Content**: The 3 new project pages have `TODO` placeholders for Features and TechStack sections. User needs to provide content/assets for these.
- **Asset Integration**: Videos and images for the new projects need to be added to `public/` and linked in their respective components.
- **Theme Audit**: While mass replacements were done, some complex gradients or non-standard color usages might still remain.

## Notable Decisions
- **GeminiService Types**: Used `eslint-disable` for `any` in some places where the Gemini SDK types were too restrictive or complex to map quickly during refactoring.
- **DottedBackground**: Kept the hardcoded SVG hex value as per the plan because CSS variables don't resolve inside data URIs.

## Fix Chatbot Branch (Friday, May 1, 2026)
- **Branch**: `fix/chatbot`
- **Status**: Completed critical bug fixes and testing suite.
- **Key Fix**: The chatbot was previously sending `{}` as knowledge data due to a missing `await`. This is now fixed.
- **Robustness**: Added timeouts (15s per AI call, 30s total client wait) and explicit error states.
- **Tests**: 100% test coverage for `app/lib/chatbot/` logic using `bun:test`.
- **Preload**: Created `bun-test-setup.ts` to handle `server-only` and environment variable mocking for tests.

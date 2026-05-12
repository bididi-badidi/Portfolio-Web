# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design Reference

Read `DESIGN.md` before changing visual design, glass surfaces, navigation, buttons, modals, or project page layouts. It records the portfolio's glass design language and component rules.

## Commands

Use **Bun** as the package manager (bun.lockb is present).

```bash
bun dev        # Start development server (Next.js)
bun build      # Production build
bun start      # Start production server
bun lint       # Run ESLint
```

## File Hygiene Rules

| File                                 | Purpose                                             | Update Trigger                                                          |
| ------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------- |
| `.ai/assets/progress.md`             | High-level phase status and major milestones only   | After every significant milestone                                       |
| `.ai/assets/session_notes.md`        | Context handover between sessions (not a changelog) | Read at session start; rewrite before ending if critical context exists |
| `.ai/assets/task_archive.md`         | Completed tasks, moved out of `progress.md`         | Immediately when a task is marked `[x]`                                 |
| `.ai/assets/backlog.md`              | Future tasks not active this session                | When user mentions out-of-scope work                                    |
| `.ai/assets/branches/<branch-name>/` | Granular sub-tasks for the current branch           | During active branch work; summarise into `progress.md` before merge    |

**Hygiene rules:**

- Keep a maximum of 5 active items under "Current Task" in `progress.md`. If a 6th arrives, ask the user which item to defer before accepting it.
- Move completed tasks (`[x]`) to `task_archive.md` immediately — never leave them in `progress.md`.
- Once all goals for a Phase are met, strip sub-bullets from `progress.md`. Leave only the Phase title, `[x]` status, and a link to the Phase document.
- Session notes are context only — explain _why_ something looks unconventional, flag race conditions, or list next steps if blocked. No "I fixed X" changelogs.
- At session start: read `session_notes.md` fully, extract what you need, _then_ delete the previous agent's notes before writing your own.

---

## Architecture Overview

**Next.js 15 App Router** portfolio site with an AI-powered chatbot, dynamic resume generation, and project showcase.

### Key Technologies

- React 19, TypeScript (strict), Tailwind CSS 4
- Google Gemini API (multi-model) for the chatbot
- AWS S3 for resume PDFs and chatbot knowledge base
- EmailJS for contact form
- Zod + `@t3-oss/env-nextjs` for environment validation (`app/env/`)

### Directory Structure

- `app/` — App Router: pages, server actions, API routes, contexts, hooks, utils
- `app/(pages)/projects/` — Dynamic project detail pages (personal-ai, remainder-api, automation-manager, stock-ai, reminders, shortcuts)
- `app/api/` — Route handlers: `reminderApi.ts`, `sendEmail.ts`, `file/`
- `app/context/` — React Context providers (no Redux/Zustand)
- `app/lib/chatbot/` — All chatbot AI logic (see below)
- `components/` — UI components organized by feature (`Landing/`, `Projects/`, `chatbot/`, `ui/`)
- `lib/` — Shared server utilities: `s3-file-loader.ts`, `gemini.ts`, `docx.ts`

### State Management

Four React Contexts (no external state library):

- **AppActionsContext** — app-wide actions: `addReminderAction`, `sendEmailAction`, `showProjectDemo`, `reminderCounter`
- **UIStateContext** — UI: `isChatOpen`, `allowAnimation`, `scrollToSection`, `scrollTargetList`
- **ModalContext** — modal/dialog management
- **ReminderContext** — reminder-specific state

Custom hooks: `useConversation` (chat history, max 20 messages), `useAppActions`, `useUIState`, `useScrollTargetRegistration`, `useMediaQuery`

### Chatbot Architecture (`app/lib/chatbot/`)

The chatbot is a key feature. Request flow:

1. User message → `fetchChatbotReply()` server action
2. Parallel: function call detection (Gemini) + search query synthesis for S3 knowledge retrieval
3. Function call validation via approval model
4. Final response generation using knowledge context, chat history, and function results

Each Gemini task uses a dedicated model configured via env vars (`NEXT_PUBLIC_GEMINI_MODEL_*`).

**Adding a new chatbot function** requires updating three files:

1. `app/lib/chatbot/functionCalls.ts` — define the function schema
2. `app/context/AppActionsContext.tsx` — implement the action
3. `app/lib/chatbot/functionHandlers.ts` — wire the handler

### Environment Variables

Validated at startup. See `app/env/client.ts` and `app/env/server.ts` for the full list. Key variables:

- `NEXT_PUBLIC_DEV_MODE` — debug toggle
- `NEXT_PUBLIC_GEMINI_MODEL_*` — model names for each AI task
- `NEXT_PUBLIC_EMAILJS_*` — EmailJS credentials
- `NEXT_PUBLIC_AZURE_REMINDER_API_URL` / `NEXT_PUBLIC_LOCAL_REMINDER_API_URL`
- `GEMINI_API_KEY` (server-only)
- AWS credentials (server-only, for S3)

### Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`).

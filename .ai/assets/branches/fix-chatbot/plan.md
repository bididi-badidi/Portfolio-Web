# Plan: Fix Chatbot Chained Fetching & Add Tests

## Context

The chatbot's chained API call flow (`fetchReply.ts`) has several bugs and robustness gaps: a missing `await` on S3 knowledge fetch (meaning chatbot runs with **no knowledge data**), unchecked error states, no timeouts, a `reportError` vs `reportErrorMessage` bug, and client-side issues. Tests don't exist for any chatbot code.

---

## Phase 1 — Critical Bug Fixes

### 1a. Fix missing `await` + add error handling for `getKnowledgeData()`
**File:** `app/lib/chatbot/fetchReply.ts:55`
- Add `await` (currently stringifies a Promise -> `{}`)
- Wrap in try/catch, fallback to empty object so chain continues

### 1b. Fix `reportError` -> `reportErrorMessage`
**File:** `app/lib/chatbot/functionHandlers.ts:116`
- `reportError(errMsg)` is browser built-in (does nothing useful), should be `reportErrorMessage(errMsg)` (shows toast)

### 1c. Remove unnecessary `"use server"` and `async` from `generatePrompt.ts`
**File:** `app/lib/chatbot/generatePrompt.ts`
- Pure string concatenation, no server deps needed

---

## Phase 2 — Chain Robustness

### 2a. Add `functionCallResponse.error` check
**File:** `app/lib/chatbot/fetchReply.ts:34`
- After Promise.all, log warning if function call detection failed
- Already safe by shape (functionCall is undefined on error), but make it explicit

### 2b. Add Gemini per-call timeout
**File:** `app/lib/chatbot/geminiService.ts`
- Wrap each `ai.models.generateContent()` call in `Promise.race` with a 15s timeout
- Timeout triggers retry (existing retry loop handles this)

### 2c. Wire up `fetchSearchResults` or remove dead code
**File:** `app/lib/chatbot/fetchReply.ts`
- `searchQuery` is computed via Gemini but `fetchSearchResults()` is never called
- If `searchQuery.needSearch === true`, call `fetchSearchResults()` with try/catch
- Combine search results with S3 knowledge data in prompt
- Rename `generatePrompt`'s `searchResults` param to `knowledgeContext` for clarity

---

## Phase 3 — Client-Side Error Handling

### 3a. Guard `executeFunctionCall` behind `!reply.error`
**File:** `components/Modal/ModalFooter.tsx:133`
- Don't fire function execution when the reply is an error

### 3b. Add loading timeout (30s)
**File:** `components/Modal/ModalFooter.tsx`
- Wrap `fetchChatbotReply()` in `Promise.race` with timeout
- On timeout, show error reply to user

### 3c. Visual error distinction
**File:** `components/Modal/ModalFooter.tsx`
- Add `isError` flag when creating bot ChatInstance on error reply
- Style error messages differently in chat bubble (requires minor interface/component change)

---

## Phase 4 — Tests

**Framework:** `bun:test` (already in use)
**Location:** `app/lib/chatbot/__tests__/`

### Mocking strategy
- Mock `GeminiService` at module level when testing consumers
- Mock `gemini_client` only when testing `geminiService.ts` itself
- Mock `getKnowledgeData`, `fetchWithRetry`, env vars at module level
- For `functionHandlers`: pass mock objects directly (no React hook mocking needed)

### Test files & key cases

| File | Key test cases |
|------|---------------|
| `geminiService.test.ts` | Success, retry on failure, all retries exhausted, timeout, generateJSON parse/empty |
| `fetchFunctionCalls.test.ts` | Returns function call, no function call, Gemini throws -> fallback |
| `fetchFunctionApproval.test.ts` | Approved, denied, Gemini throws -> safe default |
| `fetchSearchResults.test.ts` | Valid query structure, Gemini fails -> fallback, search success, search fetch error |
| `functionHandlers.test.ts` | Each handler type, unknown function -> toast, handler throws -> `reportErrorMessage`, missing args |
| `fetchReply.test.ts` | Full happy path, with/without function call, each sub-call failing independently, S3 failure, all-fail, parallel failure combos |

---

## Verification

1. `bun test` -- all new tests pass
2. `bun lint` -- no lint errors
3. `bun build` -- builds successfully
4. Manual: send chatbot message, verify response includes knowledge data
5. Manual: toggle function calling on, trigger a navigation, verify it works
6. Manual: kill Gemini API key -> verify graceful error message shown to user

---

## Files Modified (summary)

| File | Change |
|------|--------|
| `app/lib/chatbot/fetchReply.ts` | Fix await, error checks, wire search results |
| `app/lib/chatbot/functionHandlers.ts` | Fix reportError bug |
| `app/lib/chatbot/generatePrompt.ts` | Remove "use server", un-async |
| `app/lib/chatbot/geminiService.ts` | Add per-call timeout |
| `components/Modal/ModalFooter.tsx` | Error guard, loading timeout, error styling |
| `app/lib/chatbot/config.ts` | Add timeout constants |
| `app/interfaces/Chatbot.ts` | Add optional `isError` field |
| `app/lib/chatbot/__tests__/*.test.ts` | 6 new test files |

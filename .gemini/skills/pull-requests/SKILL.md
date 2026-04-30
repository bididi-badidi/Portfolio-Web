---
name: pull-requests
version: 1.0.0
description: "Use this skill whenever the task involves opening, writing, reviewing, or merging GitHub Pull Requests (PRs). Triggers: any mention of 'pull request', 'PR description', 'PR template', 'gh pr create', 'code review', 'request changes', 'merge strategy', 'squash merge', 'draft PR', 'PR checklist', or 'CODEOWNERS'. Also use when the user asks how to link a PR to an issue, choose a merge strategy, or set up PR automation. Do NOT use for commit message writing, branching, or workflow YAML — those have separate skills."
---

# GitHub Pull Requests

## Overview

A Pull Request (PR) is the gate between a feature branch and `main`. It is where code review, CI checks, and discussion happen before code is merged. Well-written PRs speed up review and produce a clean commit history.

---

## Step 1 — Gather Context Before Writing Anything

Before drafting a title or body, run these commands and read the output:

```bash
# What changed?
git diff main...HEAD --stat

# What do the commit messages say?
git log main..HEAD --oneline

# What is the branch name?
git branch --show-current

# Is there a linked issue?
# Check the branch name for a ticket number, e.g. feat/42-add-edit-command → issue #42
```

Use this information to fill in the title and body. Never write a generic title or leave body sections empty.

---

## Step 2 — Writing the PR Title

The PR title becomes the squashed commit message on `main`, so it must be precise and follow Conventional Commits format:

```
<type>(<scope>): <short imperative summary>
```

### Choosing the right type

| Type       | When to use                                                     |
| ---------- | --------------------------------------------------------------- |
| `feat`     | A new capability visible to users or callers                    |
| `fix`      | Corrects a bug or unintended behaviour                          |
| `refactor` | Restructures code without changing behaviour or adding features |
| `perf`     | Improves speed or resource usage without changing behaviour     |
| `test`     | Adds or fixes tests only — no production code changes           |
| `docs`     | Documentation only (README, docstrings, changelogs)             |
| `ci`       | Changes to CI/CD pipeline files                                 |
| `chore`    | Dependency bumps, build config, tooling — nothing users see     |
| `revert`   | Reverts a previous commit                                       |

### Choosing the scope

Scope is the **module, package, or area** most affected. Derive it from:

- The directory of changed files: `src/bot.py` → scope is `bot`
- The feature being modified: `gemini runner` → scope is `gemini`
- Omit scope only when the change is truly cross-cutting

### Writing the summary

- Use the **imperative mood**: "add", "fix", "remove" — not "added", "fixes", "removing"
- State **what** the PR does, not how or why (save that for the body)
- Keep it under 72 characters
- Do not end with a period

### Title decision flowchart

```
Did you add new behaviour the caller can use?
  YES → feat
  NO  → Did you fix a bug?
          YES → fix
          NO  → Did you only move/rename/clean code?
                  YES → refactor
                  NO  → Did you only touch tests?
                          YES → test
                          NO  → docs / ci / chore / perf
```

### Good vs bad titles

| ❌ Bad                        | Why it fails                                   | ✅ Good                                            |
| ----------------------------- | ---------------------------------------------- | -------------------------------------------------- |
| `update stuff`                | No type, no scope, no subject                  | `refactor(bot): simplify command dispatch table`   |
| `fix`                         | No scope or subject at all                     | `fix(gemini): handle empty subprocess stdout`      |
| `WIP`                         | Not a commit message — use draft PR instead    | `feat(bot): add /edit command for gemini CLI`      |
| `PR for review`               | Describes the PR process, not the code change  | `docs: add bot setup instructions to README`       |
| `added the new edit command`  | Past tense, no type, no scope                  | `feat(bot): add /edit command for gemini CLI`      |
| `fixes the bug from issue 12` | Prose sentence; issue link belongs in the body | `fix(parser): prevent crash on empty prompt input` |

---

## Step 3 — Writing the PR Body

Populate every section from the context you gathered in Step 1. Never leave a section as a placeholder comment.

### Template

```markdown
## Summary

<!--
Write 2–4 sentences answering:
  - What does this PR do?
  - Why is this change needed? (what problem does it solve?)
  - What approach did you take, and why this one over alternatives?
Derive this from the commit messages and the issue description.
-->

## Changes

<!--
List every meaningful change. Be specific — name the files, functions, or APIs touched.
Group related changes together.
-->

- `src/bot.py` — added `/edit` command handler that delegates to `gemini_runner.py`
- `src/gemini_runner.py` — new helper module that wraps `gemini -p <prompt>` as a subprocess
- `tests/test_gemini_runner.py` — unit tests covering empty stdout and non-zero exit codes

## Testing

<!--
Describe how the change was verified. Reviewers must be able to reproduce your testing steps.
-->

- [ ] Unit tests added / updated — run with `pytest tests/`
- [ ] Tested locally: started the bot, sent `/edit fix this code`, confirmed response
- [ ] Edge cases covered: empty prompt, gemini not installed, subprocess timeout

## Related Issues

<!--
Use these keywords so GitHub auto-closes the issue when the PR merges:
  Closes #N  |  Fixes #N  |  Resolves #N  |  Part of #N (does not close)
-->

Closes #12

## Screenshots / Output (if applicable)

<!--
Paste terminal output or a screenshot when the change has a visible result.
Delete this section if not applicable.
-->
```

### Rules for filling in the body

1. **Summary** — write it last, after you have written the Changes section. It is easier to summarise once you know exactly what changed.
2. **Changes** — derive this directly from `git diff --stat` and the commit log. Every changed file that matters should appear here with a one-line description of _why_ it changed.
3. **Testing** — never leave the checkboxes unchecked unless the PR is a draft. If a box does not apply, delete it rather than leaving it unchecked.
4. **Related Issues** — always include if a GitHub issue exists. Check the branch name for a number (e.g. `feat/42-add-edit-command` → `Closes #42`).
5. **Screenshots** — include terminal output for CLI changes; include a screenshot for UI changes; delete the section if neither applies.

---

## Creating a PR (CLI — Recommended)

Install the GitHub CLI:

```bash
# macOS / Linux
brew install gh         # or: sudo apt install gh

# Authenticate
gh auth login
```

### Open a PR

```bash
# Push branch first
git push -u origin feat/add-edit-command

# Create PR with all fields inline
gh pr create \
  --title "feat(bot): add /edit command for gemini CLI" \
  --body "## Summary
Adds the /edit Telegram command that invokes gemini CLI as a subprocess.
Needed because users requested in-chat code editing without leaving Telegram.

## Changes
- \`src/bot.py\` — added /edit command handler
- \`src/gemini_runner.py\` — new subprocess wrapper module
- \`tests/test_gemini_runner.py\` — unit tests for subprocess wrapper

## Testing
- [x] Unit tests added — run with \`pytest tests/\`
- [x] Tested locally with live bot

## Related Issues
Closes #12" \
  --base main \
  --head feat/add-edit-command \
  --reviewer github-username \
  --label enhancement
```

### Create a Draft PR (not ready for review yet)

```bash
gh pr create --draft \
  --title "feat(bot): add /edit command [WIP]" \
  --body "## Summary
Work in progress — subprocess wrapper is done, tests not yet written.

## Changes
- \`src/gemini_runner.py\` — subprocess wrapper (done)
- \`tests/test_gemini_runner.py\` — TODO

## Related Issues
Closes #12"
```

### Useful PR CLI commands

```bash
gh pr list                              # list open PRs
gh pr view 42                           # view PR #42 in terminal
gh pr view 42 --web                     # open PR in browser
gh pr view --diff                       # inspect the full diff before submitting
gh pr checkout 42                       # check out PR branch locally
gh pr merge 42 --squash --delete-branch # merge and clean up
gh pr close 42                          # close without merging
gh pr ready 42                          # convert draft to ready for review
```

---

## Merge Strategies

| Strategy         | When to use                                      | Commit history                        |
| ---------------- | ------------------------------------------------ | ------------------------------------- |
| **Squash merge** | Feature branches — keep `main` clean             | One commit per PR on `main`           |
| **Rebase merge** | Small, well-structured branches                  | Linear history, all commits preserved |
| **Merge commit** | Long-lived branches (Gitflow `develop` → `main`) | Preserves full branch topology        |

**Recommended default**: Squash merge for `main`. This is why PR titles must follow Conventional Commits — the title becomes the single commit message.

Configure in **Settings → General → Pull Requests**:

```
☑ Allow squash merging       → default merge message: Pull request title
☐ Allow merge commits        (disable for cleaner history)
☐ Allow rebase merging       (disable unless team is disciplined)
☑ Automatically delete head branches after merge
```

---

## Merge via CLI

```bash
gh pr merge 42 --squash --delete-branch   # squash merge (recommended)
gh pr merge 42 --rebase --delete-branch   # rebase merge
gh pr merge 42 --merge --delete-branch    # standard merge commit
```

---

## Code Review Checklist

### As the PR Author

Before marking a PR as "Ready for review":

- [ ] CI is green (all checks pass)
- [ ] Branch is up to date with `main` (rebased or merged)
- [ ] No debugging code, print statements, or commented-out code left in
- [ ] New code has tests
- [ ] PR title follows Conventional Commits format
- [ ] All body sections are filled in — no placeholder comments remaining
- [ ] Self-reviewed the diff (`gh pr view --diff`)

### As the Reviewer

```bash
gh pr checkout 42     # check out the branch locally
# run the code, run tests
gh pr review 42 --approve --body "LGTM, left minor comment on line 47"
gh pr review 42 --request-changes --body "Please add error handling for empty prompt"
gh pr review 42 --comment --body "Nit: consider renaming this function"
```

---

## CODEOWNERS (Auto-assign Reviewers)

Create `.github/CODEOWNERS`:

```
# Default owner for everything
*                   @your-github-username

# CI/CD files require DevOps review
.github/workflows/  @your-github-username @devops-username

# Bot core logic
src/bot.py          @your-github-username
```

---

## PR Labels

| Label              | Color     | Meaning                        |
| ------------------ | --------- | ------------------------------ |
| `enhancement`      | `#a2eeef` | New feature                    |
| `bug`              | `#d73a4a` | Bug fix                        |
| `documentation`    | `#0075ca` | Docs only                      |
| `ci`               | `#e4e669` | CI/CD changes                  |
| `breaking change`  | `#b60205` | Introduces breaking API change |
| `dependencies`     | `#0366d6` | Dependency update              |
| `work in progress` | `#ededed` | Draft / not ready              |

---

## Automating PR Review with GitHub Actions

### Auto-label PRs based on changed files

```yaml
# .github/workflows/label.yml
name: Auto Label
on: [pull_request]

jobs:
  label:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

Create `.github/labeler.yml`:

```yaml
ci:
  - changed-files:
      - any-glob-to-any-file: ".github/workflows/**"

documentation:
  - changed-files:
      - any-glob-to-any-file: "docs/**"
      - any-glob-to-any-file: "*.md"
```

### Enforce conventional PR titles

```yaml
# .github/workflows/pr-title.yml
name: PR Title Check
on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

jobs:
  check-title:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Common Mistakes

| ❌ Mistake                         | ✅ Fix                                                           |
| ---------------------------------- | ---------------------------------------------------------------- |
| PR title like "fixes" or "update"  | Follow the type/scope/summary format; use the decision flowchart |
| Body left as template comments     | Fill every section from `git diff --stat` and the commit log     |
| Issue link in the title            | Put `Closes #N` in the body under "Related Issues"               |
| Giant PR (500+ line diff)          | Break into smaller PRs per logical change                        |
| Merging before CI passes           | Enable required status checks in branch protection               |
| Merging your own PR without review | Require at least 1 approver in branch protection rules           |
| Forgetting to delete merged branch | Enable "Automatically delete head branches" in repo settings     |
| Opening a PR against wrong base    | Always check `--base main` (or `develop` for Gitflow)            |
| Long-running draft PRs             | Keep PR small or use stacked PRs / feature flags                 |

---

## Full Flow: Feature to Merged PR

```bash
# 1. Branch off main
git switch main && git pull origin main
git switch -c feat/42-add-edit-command

# 2. Code, commit
git add src/bot.py src/gemini_runner.py tests/test_gemini_runner.py
git commit -m "feat(bot): add /edit command for gemini CLI"

# 3. Gather context for the PR
git diff main...HEAD --stat
git log main..HEAD --oneline

# 4. Push
git push -u origin feat/42-add-edit-command

# 5. Open PR — title and body derived from the diff and commit log above
gh pr create \
  --title "feat(bot): add /edit command for gemini CLI" \
  --body "..." \
  --base main

# 6. CI runs automatically — wait for green

# 7. Reviewer approves

# 8. Squash merge + delete branch
gh pr merge --squash --delete-branch

# 9. Update local main
git switch main && git pull origin main
git branch -d feat/42-add-edit-command   # clean up local
```

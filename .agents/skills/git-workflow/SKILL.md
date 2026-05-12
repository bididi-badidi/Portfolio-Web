---
name: git-workflow
version: 2.0.0
description: "Use this skill whenever the task involves any part of the git development lifecycle. Triggers: 'commit message', 'git commit', 'conventional commits', 'create branch', 'git checkout', 'git switch', 'git push', 'feature branch', 'hotfix', 'merge conflict', 'pull request', 'PR description', 'gh pr create', 'code review', 'merge strategy', 'squash merge', 'branching strategy', 'changelog', 'semantic versioning'. Do NOT use for GitHub Actions workflow YAML files — use the github-workflows skill instead."
---

# Git Workflow

## Overview

Covers the full feature lifecycle: branch → commit → push → pull request → merge → cleanup. Commit messages and PR titles follow the same **Conventional Commits** format — defined once below and applied to both.

---

## Branching Strategy

**GitHub Flow** is the recommended default for solo and small teams.

```
main  ──●──────────────────────────────────●── (always deployable)
         \                                /
          ●── feat/add-edit-command ──────●  (short-lived, PR to merge)
```

**Rules:** `main` is always production-ready. Every change gets its own branch. Never commit directly to `main`.

### Branch Naming

```
<type>/<short-description>
<type>/<issue-id>-<short-description>
```

| Prefix      | Example                           | Use For                  |
| ----------- | --------------------------------- | ------------------------ |
| `feat/`     | `feat/add-edit-command`           | New features             |
| `fix/`      | `fix/empty-subprocess-output`     | Bug fixes                |
| `hotfix/`   | `hotfix/crash-on-start`           | Urgent production fixes  |
| `chore/`    | `chore/update-dependencies`       | Maintenance              |
| `docs/`     | `docs/add-setup-guide`            | Documentation only       |
| `ci/`       | `ci/add-ruff-lint-workflow`       | CI/CD changes            |
| `refactor/` | `refactor/extract-gemini-wrapper` | Refactoring              |

All lowercase, hyphens only, under 50 characters. Reference issue numbers when they exist: `fix/42-handle-timeout`.

---

## Conventional Commits Format

Used for **both commit messages and PR titles** — they are the same format.

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

**Rules:**
- `type` and `description` are mandatory.
- `description`: imperative present tense — `add`, not `added`. No capital. No period. ≤ 72 chars total.
- `body`: explain _why_, not _what_. Wrap at 72 characters.
- `footer`: `BREAKING CHANGE: <detail>` or `Closes #N`.

### Type Reference

| Type       | When to Use                                  | SemVer |
| ---------- | -------------------------------------------- | ------ |
| `feat`     | New feature visible to users                 | MINOR  |
| `fix`      | Bug fix visible to users                     | PATCH  |
| `docs`     | Documentation only                           | none   |
| `style`    | Formatting, whitespace — no logic change     | none   |
| `refactor` | Code restructure, no bug fix, no new feature | none   |
| `perf`     | Performance improvement                      | none   |
| `test`     | Adding or correcting tests                   | none   |
| `build`    | Build system, dependency changes             | none   |
| `ci`       | CI/CD config changes                         | none   |
| `chore`    | Maintenance, `.gitignore`, tooling           | none   |
| `revert`   | Reverts a previous commit                    | varies |

> **Priority rule:** favour _purpose_ over _object_. Refactoring a test file → `refactor`, not `test`.

### Quick Decision Tree

```
New user-facing feature?           → feat
Bug users noticed?                 → fix
Docs/comments only?                → docs
Restructure, no behaviour change?  → refactor
Speed improvement?                 → perf
Tests only?                        → test
CI/CD config?                      → ci
Build system or dependencies?      → build
Everything else?                   → chore
```

### Breaking Changes

Mark with `!` after type/scope **and/or** a `BREAKING CHANGE:` footer. Either triggers a MAJOR SemVer bump.

```
feat(api)!: rename /login to /auth/login

BREAKING CHANGE: all clients must update their base URL.
```

---

## Day-to-Day Workflow

### 1. Create a branch off latest `main`

```bash
git switch main
git pull origin main
git switch -c feat/add-edit-command
```

### 2. Stage and commit

```bash
git add src/bot.py                          # prefer specific files over git add .
git commit -m "feat(bot): add /edit command for gemini CLI"
```

Multi-line commit (body + footer):

```bash
git commit
# Opens $EDITOR — write full message, save, close
```

### 3. Push

```bash
git push -u origin feat/add-edit-command    # first push — sets upstream
git push                                    # subsequent pushes
```

### 4. Keep branch up to date with `main`

```bash
git fetch origin
git rebase origin/main    # preferred on short-lived branches (linear history)
# or: git merge origin/main
```

### 5. Open a Pull Request

**Gather context first:**

```bash
git diff main...HEAD --stat      # what files changed?
git log main..HEAD --oneline     # what do commit messages say?
git branch --show-current        # branch name (check for issue number)
```

**PR title** — same format as a commit message. In a squash-merge workflow, this becomes the single commit on `main`:

```
feat(bot): add /edit command for gemini CLI
```

**PR body template:**

```markdown
## Summary
What does this PR do, why is it needed, and what approach was taken?

## Changes
- `src/bot.py` — added `/edit` command handler
- `src/gemini_runner.py` — new subprocess wrapper module
- `tests/test_gemini_runner.py` — unit tests for subprocess wrapper

## Testing
- [ ] Unit tests added — run with `pytest tests/`
- [ ] Tested locally
- [ ] Edge cases covered

## Related Issues
Closes #12
```

Rules: fill every section from `git diff --stat` and the commit log. Never leave placeholder comments. Delete the Screenshots section if not applicable.

**Create via CLI:**

```bash
gh pr create \
  --title "feat(bot): add /edit command for gemini CLI" \
  --body "..." \
  --base main
```

Other useful PR commands:

```bash
gh pr list
gh pr view --diff           # review your own diff before marking ready
gh pr review 42 --approve
gh pr review 42 --request-changes --body "Please add error handling"
gh pr ready 42              # convert draft to ready
```

### 6. Merge and clean up

**Recommended:** squash merge — keeps `main` history clean, one commit per PR.

```bash
gh pr merge --squash --delete-branch
```

Then clean up locally:

```bash
git switch main
git pull origin main
git branch -d feat/add-edit-command
```

---

## Resolving Merge Conflicts

```bash
# During rebase
git rebase origin/main
# CONFLICT — edit the file(s)
git add src/bot.py
git rebase --continue
# To abort: git rebase --abort

# During merge
git merge origin/main
# CONFLICT — edit the file(s)
git add src/bot.py
git commit
# To abort: git merge --abort
```

---

## Merge Strategies

| Strategy         | When to use                          | History                         |
| ---------------- | ------------------------------------ | ------------------------------- |
| **Squash merge** | Feature branches (recommended)       | One commit per PR on `main`     |
| **Rebase merge** | Small, well-structured branches      | Linear, all commits preserved   |
| **Merge commit** | Long-lived branches (Gitflow only)   | Full branch topology preserved  |

Configure in **Settings → General → Pull Requests**: enable squash merging, set default message to "Pull request title", enable auto-delete of head branches.

---

## Common Mistakes

| ❌ Mistake                              | ✅ Fix                                                      |
| --------------------------------------- | ----------------------------------------------------------- |
| `fix: Fixed the bug`                   | `fix: resolve null response in subprocess call`             |
| `feat: stuff`                          | `feat(bot): add /status command`                            |
| `update code`                          | `refactor(gemini): extract prompt builder to helper`        |
| `fix: update dependencies`             | `build: bump python-telegram-bot to 21.0`                   |
| Committing directly to `main`          | Always branch; enable branch protection                     |
| Long-lived branches (weeks)            | Keep branches ≤ a few days; break features into smaller PRs |
| `git add .` blindly                    | Stage specific files; avoid committing debug leftovers      |
| Pushing without pulling first          | `git pull --rebase origin main` before push                 |
| PR title like "fixes" or "update"      | Use the type/scope/description format + decision tree above |
| PR body left as template comments      | Fill every section from `git diff --stat` and commit log    |
| Merging before CI passes               | Enable required status checks in branch protection          |
| Forgetting to delete the merged branch | Enable "Automatically delete head branches" in repo settings|

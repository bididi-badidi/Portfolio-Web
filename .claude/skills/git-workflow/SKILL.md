---
name: git-workflow
version: 1.0.0
description: "Use this skill whenever the task involves writing, generating, linting, or reviewing git commit messages. Triggers: any mention of 'commit message', 'git commit', 'conventional commits', 'commitlint', 'changelog', 'semantic versioning from commits', or 'how to commit'. Also use when the user asks the assistant to stage and commit changes as part of a larger workflow. Do NOT use for GitHub Actions workflows, pull requests, branch management, or git push — those have separate skills."
---

# Git Commit Messages (Conventional Commits)

## Overview

Follow the [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification. It is machine-parseable (enabling auto-changelogs and SemVer bumps) and human-readable at a glance. Adopted by Angular, Vue, semantic-release, and thousands of popular repos.

---

## Commit Message Format

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Rules

- **type** and **description** are mandatory.
- **scope** is optional; it is a noun describing the section of code changed, e.g. `auth`, `api`, `bot`.
- **description**: imperative, present tense — write `add`, not `added` or `adds`. No capital first letter. No period at end.
- **body**: free-form, explain _why_ not _what_. Wrap at 72 characters.
- **footer**: key–value pairs. Token must use `-` in place of spaces (exception: `BREAKING CHANGE`).
- The subject line (type + scope + description) must be ≤ 72 characters.
- Blank lines separate header, body, and footer.

---

## Type Reference

| Type       | When to Use                                  | SemVer Impact |
| ---------- | -------------------------------------------- | ------------- |
| `feat`     | New feature visible to users                 | MINOR         |
| `fix`      | Bug fix visible to users                     | PATCH         |
| `docs`     | Documentation only changes                   | none          |
| `style`    | Formatting, whitespace — no logic change     | none          |
| `refactor` | Code restructure, no bug fix, no new feature | none          |
| `perf`     | Performance improvement                      | none          |
| `test`     | Adding or correcting tests                   | none          |
| `build`    | Build system, dependency changes             | none          |
| `ci`       | CI/CD config changes (GitHub Actions, etc.)  | none          |
| `chore`    | Maintenance tasks, `.gitignore`, tooling     | none          |
| `revert`   | Reverts a previous commit                    | depends       |
| `ops`      | Infrastructure, deployment scripts           | none          |

> **Type priority rule**: when overlap exists, favour _purpose_ over _object_. Refactoring a test file → `refactor`, not `test`.

---

## Breaking Changes

Mark with `!` after type/scope **and/or** a `BREAKING CHANGE:` footer. Either triggers a MAJOR SemVer bump.

```
feat!: drop Python 3.9 support

BREAKING CHANGE: minimum required version is now Python 3.11
```

```
feat(api)!: rename /login to /auth/login
```

---

## Examples

### Simple fix

```
fix(bot): handle empty subprocess output gracefully
```

### Feature with scope and body

```
feat(bot): add /edit command to invoke gemini CLI

Accepts a project name and freeform prompt. Runs gemini -p <prompt>
inside the target project directory using subprocess with cwd set.

Closes #12
```

### Docs-only

```
docs: add venv setup instructions to README
```

### CI change

```
ci: add ruff lint check to pull request workflow
```

### Revert

```
revert: feat(bot): add /edit command to invoke gemini CLI

Reverts commit a3f9c2d. The subprocess approach caused timeout issues
on slow machines. Will revisit with async implementation.
```

### Breaking change (footer style)

```
feat(api)!: switch response format from XML to JSON

BREAKING CHANGE: all API consumers must update their parsers.
The `response.data` field is now a JSON object, not an XML string.
```

---

## Scopes for a Python Bot Project

Suggested scopes (define per project in CONTRIBUTING.md):

| Scope    | Covers                          |
| -------- | ------------------------------- |
| `bot`    | Telegram bot handlers, commands |
| `gemini` | Gemini CLI subprocess wrapper   |
| `config` | Environment variables, settings |
| `deps`   | Dependency updates              |
| `ci`     | GitHub Actions files            |
| `docs`   | README, comments                |

---

## Committing in Practice

### Stage and commit (basic)

```bash
git add <file(s)>
git commit -m "feat(bot): add /edit command for gemini CLI"
```

### Multi-line commit (body + footer)

```bash
git commit
# Opens $EDITOR — write full message, save, and close
```

### Amend last commit (before push)

```bash
git commit --amend
# or change only the message:
git commit --amend -m "fix(bot): correct cwd in subprocess call"
```

### Interactive rebase to fix old commits (before push)

```bash
git rebase -i HEAD~3   # edit last 3 commits
# Change 'pick' to 'reword' on lines you want to fix
```

> For pushing your branch after committing, see the **git-branching** skill.

---

## Enforcement Tools

### commitlint (Node.js, recommended for teams)

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

Run manually:

```bash
echo "feat: add /edit command" | npx commitlint
```

### commitizen (interactive commit prompt)

```bash
pip install commitizen          # Python projects
cz commit                       # guided commit message builder
cz bump                         # auto-bump version from commit history
cz changelog                    # generate CHANGELOG.md
```

`.cz.toml` config:

```toml
[tool.commitizen]
name = "cz_conventional_commits"
version = "0.1.0"
tag_format = "v$version"
```

---

## Common Mistakes

| ❌ Wrong                                               | ✅ Correct                                           | Why                           |
| ------------------------------------------------------ | ---------------------------------------------------- | ----------------------------- |
| `fix: Fixed the bug`                                   | `fix: resolve null response in subprocess call`      | Past tense; vague             |
| `feat: stuff`                                          | `feat(bot): add /status command`                     | Too vague                     |
| `update code`                                          | `refactor(gemini): extract prompt builder to helper` | No type prefix                |
| `fix: update dependencies`                             | `build: bump python-telegram-bot to 21.0`            | Wrong type                    |
| Using `fix` for refactors                              | Use `refactor`                                       | Reserve `fix` for actual bugs |
| Inconsistent scopes (`Auth`, `auth`, `authentication`) | Pick one; document it                                | Breaks tooling                |

---

## Quick Decision Tree

```
Did you add a new user-facing feature?         → feat
Did you fix a bug users noticed?               → fix
Did you only change docs/comments?             → docs
Did you restructure code, no behavior change?  → refactor
Did you improve speed?                         → perf
Did you add/fix tests only?                    → test
Did you change CI/CD config?                   → ci
Did you change build system or dependencies?   → build
Everything else (chores, tooling)?             → chore
```

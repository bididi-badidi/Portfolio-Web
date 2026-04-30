---
name: git-branching
version: 1.0.0
description: "Use this skill whenever the task involves creating branches, switching branches, pushing commits to the correct branch, resolving merge conflicts, or deciding on a branching strategy. Triggers: any mention of 'create branch', 'git checkout', 'git switch', 'git push', 'feature branch', 'hotfix', 'develop branch', 'github flow', 'gitflow', 'trunk-based', 'merge conflict', or 'which branch should I push to'. Do NOT use for writing commit messages (see git-workflow skill) or creating GitHub Actions workflows (see github-workflows skill)."
---

# Git Branching Strategy & Pushing Code

## Overview

Two strategies dominate modern development. Choose based on team size and release cadence:

| Strategy        | Best For                                           | Long-lived Branches                       |
| --------------- | -------------------------------------------------- | ----------------------------------------- |
| **GitHub Flow** | Solo devs, small teams, continuous deployment      | `main` only                               |
| **Gitflow**     | Large teams, versioned releases, scheduled deploys | `main` + `develop`                        |
| **Trunk-Based** | Experienced CI/CD teams, fastest flow              | `main` only (short-lived branches ≤1 day) |

> For a solo or small-team Python project (like the Gemini Telegram bot), **GitHub Flow** is the right default. Simple, clean, CI-friendly.

---

## GitHub Flow (Recommended)

```
main  ──●──────────────────────────────────●── (always deployable)
         \                                /
          ●── feature/add-edit-command ──●  (short-lived, PR to merge)
```

### Rules

1. `main` is always production-ready and deployable.
2. Every change (feature, fix, chore) gets its own branch off `main`.
3. Open a Pull Request to merge back into `main`.
4. Never commit directly to `main`.

---

## Branch Naming Conventions

```
<type>/<short-description>
<type>/<issue-id>-<short-description>
```

| Prefix      | Example                           | Use For                            |
| ----------- | --------------------------------- | ---------------------------------- |
| `feat/`     | `feat/add-edit-command`           | New features                       |
| `fix/`      | `fix/empty-subprocess-output`     | Bug fixes                          |
| `hotfix/`   | `hotfix/crash-on-start`           | Urgent production fixes            |
| `chore/`    | `chore/update-dependencies`       | Maintenance                        |
| `docs/`     | `docs/add-setup-guide`            | Documentation only                 |
| `ci/`       | `ci/add-ruff-lint-workflow`       | CI/CD changes                      |
| `refactor/` | `refactor/extract-gemini-wrapper` | Refactoring                        |
| `release/`  | `release/v1.2.0`                  | Release preparation (Gitflow only) |

**Rules:**

- All lowercase, hyphens only (no underscores or spaces).
- Keep it short and descriptive — under 50 characters total.
- Reference issue numbers when they exist: `fix/42-handle-timeout`.

---

## Day-to-Day Workflow

### 1. Start a new branch from latest `main`

```bash
git checkout main
git pull origin main           # always pull first to stay in sync
git checkout -b feat/add-edit-command
```

Or with the modern `switch` command:

```bash
git switch main
git pull origin main
git switch -c feat/add-edit-command
```

### 2. Make changes and commit

Write and stage your changes, then commit. For commit message format and conventions, follow the **git-workflow** skill.

```bash
# Stage specific files (prefer over `git add .`)
git add src/bot.py

# Or stage all tracked changes
git add -u
```

### 3. Push the branch to GitHub

```bash
# First push — set upstream tracking
git push -u origin feat/add-edit-command

# Subsequent pushes on same branch
git push
```

### 4. Keep your branch up to date with `main`

```bash
# Option A: Rebase (cleaner history, preferred for small branches)
git fetch origin
git rebase origin/main

# Option B: Merge (safer for larger branches)
git fetch origin
git merge origin/main
```

Prefer **rebase** on short-lived feature branches to keep history linear.

### 5. After PR is merged — clean up

```bash
git checkout main
git pull origin main
git branch -d feat/add-edit-command           # delete local branch
git push origin --delete feat/add-edit-command # delete remote branch
```

---

## Push Rules (Which Branch to Push To)

| Situation                     | Target Branch                    | How                                         |
| ----------------------------- | -------------------------------- | ------------------------------------------- |
| New feature or bug fix        | Your feature branch              | `git push origin feat/my-feature`           |
| CI is green, ready for review | Open PR into `main`              | Via GitHub UI or `gh pr create`             |
| Urgent production bug         | `hotfix/<name>` → PR into `main` | Branch off `main`, fix, PR immediately      |
| **Never**                     | Push directly to `main`          | Protect `main` with branch protection rules |

---

## Branch Protection Rules (Set in GitHub Settings)

Go to **Settings → Branches → Add rule** for `main`:

```
☑ Require a pull request before merging
☑ Require approvals: 1
☑ Require status checks to pass before merging
    → Select your CI jobs: "Lint & Format", "Test"
☑ Require branches to be up to date before merging
☑ Do not allow bypassing the above settings
```

This enforces that code is reviewed and CI passes before anything lands on `main`.

---

## Resolving Merge Conflicts

```bash
# During rebase conflict
git rebase origin/main
# CONFLICT — edit the conflicting file(s)
git add src/bot.py             # mark resolved
git rebase --continue

# During merge conflict
git merge origin/main
# CONFLICT — edit the conflicting file(s)
git add src/bot.py
git commit                     # completes the merge
```

### Abort and start over

```bash
git rebase --abort
git merge --abort
```

---

## Gitflow (When You Need It)

Use only if you have scheduled releases or multiple versions in production.

```
main     ──●─────────────────────────────────●── v1.0  v2.0
            \                               /
develop  ────●───────────●─────────────────●──────────
              \         / \               /
feat/A  ───────●───────●   \             /
feat/B  ────────────────────●───────────●
```

### Branch roles

| Branch      | Purpose                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| `main`      | Production-ready code only. Tagged with version.                                                            |
| `develop`   | Integration branch. All features merge here first.                                                          |
| `feat/*`    | Branch off `develop`, merge back into `develop`.                                                            |
| `release/*` | Branch off `develop` when ready for release. Only bug fixes go here. Merges into both `main` and `develop`. |
| `hotfix/*`  | Branch off `main` for urgent production fixes. Merges into both `main` and `develop`.                       |

### Gitflow quick commands

```bash
# Feature
git checkout -b feat/new-feature develop
# ... work ...
git checkout develop
git merge --no-ff feat/new-feature    # --no-ff preserves branch history
git branch -d feat/new-feature

# Release
git checkout -b release/v1.2.0 develop
# ... final tweaks, bump version ...
git checkout main && git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git checkout develop && git merge --no-ff release/v1.2.0
git branch -d release/v1.2.0

# Hotfix
git checkout -b hotfix/crash-on-start main
# ... fix ...
git checkout main && git merge --no-ff hotfix/crash-on-start
git tag -a v1.1.1 -m "Hotfix v1.1.1"
git checkout develop && git merge --no-ff hotfix/crash-on-start
git branch -d hotfix/crash-on-start
```

---

## Tagging Releases

```bash
# Annotated tag (preferred — includes tagger, date, message)
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0

# Push all tags at once
git push origin --tags

# List tags
git tag -l "v*"
```

---

## Useful Alias Setup

```bash
git config --global alias.sw "switch"
git config --global alias.sw-c "switch -c"
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.st "status -sb"
```

---

## Common Mistakes

| ❌ Mistake                           | ✅ Fix                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| Committing directly to `main`        | Always branch; enable branch protection                                             |
| Long-lived feature branches (weeks)  | Keep branches ≤ a few days; break features into smaller pieces                      |
| `git add .` blindly                  | Use `git add -p` or specific files; avoid committing debug leftovers                |
| Pushing without pulling first        | `git pull --rebase origin main` before push to avoid unnecessary merge commits      |
| Force-pushing shared branches        | Only force-push your own feature branches, never `main` or `develop`                |
| Forgetting to delete merged branches | Use GitHub's "Delete branch" button after merge; clean locally with `git branch -d` |

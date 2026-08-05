---
name: git-worktree
version: 1.2.2
description: "Use this skill when creating or preparing an isolated Git worktree with the repository bootstrap script. Triggers: 'create a worktree', 'new worktree', 'set up a worktree', 'work on this in a separate checkout', 'bootstrap worktree', 'copy env files to worktree', 'install dependencies in worktree'. Do NOT use for general Git branching, commits, pull requests, or merge conflict workflows; use git-workflow for those."
---

# Git Worktree Bootstrap

## Overview

Use this skill to create or prepare a Git worktree that is ready for development. Always prefer the bundled script at `scripts/worktree-bootstrap.sh` because it pulls the current checkout from `origin`, creates the worktree, copies git-ignored environment files such as `.env`, and installs dependencies in one repeatable flow. Follow the project tree convention where each repository has a container folder named after the repository, with each worktree below it at `<repo-name>/<branch-name>`. Preserve branch slashes as directories: `main` lives at `repo-name/main`, `dev` lives at `repo-name/dev`, `feat/new-feat` lives at `repo-name/feat/new-feat`, and `ci/github-workflow` lives at `repo-name/ci/github-workflow`.

## Prepare the Worktree Inputs

Before running the script, identify four values:

- `repo_container`: the parent folder that contains all worktrees for this repository.
- `target_path`: the folder where the worktree should be created.
- `branch`: the Git branch to check out or create.
- `env_source`: the directory to copy `.env` and `.env.*` files from. Default to the current repository root unless the user names another source.

Name the branch with the repository's normal branch pattern. Use prefixes such as `feat/`, `fix/`, `docs/`, `chore/`, or `refactor/`, followed by a short lowercase hyphenated description. If the user gives a branch name, use it exactly unless it is unsafe or malformed.

Name the worktree folder from the branch name, preserving branch slashes as directories. Use this structure by default:

```text
<repo-name>/
  main/
  dev/
  feat/
    new-feat/
  ci/
    github-workflow/
```

Use these path rules:

- branch `main` -> `<repo_container>/main`
- branch `dev` -> `<repo_container>/dev`
- branch `feat/new-feat` -> `<repo_container>/feat/new-feat`
- branch `ci/github-workflow` -> `<repo_container>/ci/github-workflow`
- branch `fix/auth-timeout` -> `<repo_container>/fix/auth-timeout`

Set `target_path` to exactly `<repo_container>/<branch>`, where `<branch>` may contain `/`. Do not flatten branches into sibling folders such as `<repo-name>-feat-new-feat` or `<repo-name>-ci-github-workflow`.

If the current checkout path already ends in `main`, treat its parent as `repo_container`. If the current checkout is already under a path matching its branch name, use the nearest ancestor named after the repository as `repo_container`. If the current checkout is a legacy single-checkout folder named `<repo-name>`, do not create worktrees inside that checkout. Ask the user whether to reorganize it to `<repo-name>/main`, or use an explicit target path if they provide one.

Set `script_path` to this skill's bundled bootstrap script before running commands:

```bash
script_path="<skill-directory>/scripts/worktree-bootstrap.sh"
```

## Create a New Worktree

Before creating a new worktree, pull the latest changes from `origin` in the source checkout. The bootstrap script does this automatically by reading `git remote get-url origin`, running `git fetch --prune origin`, and then a fast-forward-only merge from the current branch's upstream or matching `origin/<branch>`. If the source checkout cannot fast-forward, stop and ask the user how to resolve the local divergence before creating the worktree.

Run the bootstrap script from the repository root when the user wants a new worktree:

```bash
"$script_path" add <target_path> <branch>
```

If the branch should start from a specific base ref, pass `--base`:

```bash
"$script_path" add <target_path> <branch> --base <ref>
```

If the branch already exists, do not pass `--base`. The script rejects `--base` for existing branches.

## Replicate Git-Ignored Files

Let the script copy environment files instead of copying them manually. By default, it copies `.env` and `.env.*` from the repository root into the target worktree.

If the user wants to copy ignored files from a different checkout or directory, pass `--env-source`:

```bash
"$script_path" add <target_path> <branch> --env-source <source_dir>
```

Never print secrets from `.env` files. Verify copying by checking filenames only, not file contents.

## Install Dependencies

Leave dependency installation enabled by default. The script detects the package manager from lockfiles when `PACKAGE_MANAGER` is unset or set to `auto`:

- `bun.lockb` or `bun.lock` -> `bun install`
- `pnpm-lock.yaml` -> `pnpm install`
- `yarn.lock` -> `yarn install`
- otherwise -> `npm install`

Use `PACKAGE_MANAGER=<manager>` only when the user explicitly requests a package manager or the repository convention is clear:

```bash
PACKAGE_MANAGER=pnpm "$script_path" add <target_path> <branch>
```

Use `--no-install` only when the user asks to skip installation or the task only needs a checkout:

```bash
"$script_path" setup <target_path> --no-install
```

## Prepare an Existing Worktree

If the target worktree folder already exists and only needs ignored files copied plus dependencies installed, run `setup`:

```bash
"$script_path" setup <target_path>
```

Use `setup` after manually creating a worktree or when the user says the checkout already exists.

## Set Up Git Credentials

Derive the repository path from the target worktree's existing `origin` URL before changing remotes. Do this first instead of starting from a hard-coded owner and repository:

```bash
origin_url="$(git remote get-url origin)"
repo_path="$(printf '%s\n' "$origin_url" | sed -E 's#^git@[^:]+:##; s#^ssh://git@[^/]+/##; s#^https?://[^/]+/##; s#\.git$##')"
test -n "$repo_path"
git remote set-url origin "git@github-bot:${repo_path}.git"
```

If `repo_path` cannot be derived, stop and inspect `origin_url`; do not guess the repository name. Use the `github-bot` SSH host only after the repository path has been derived from the current remote.

Set the local commit identity to the bot account:

```bash
git config --local user.name  "Coding Agent"
git config --local user.email "bot@gmail.com"
```

## Push to Remote

Push the new branch to the remote after the worktree is ready:

```bash
git push origin <new_branch>
```

## Verification

After the script finishes, verify the worktree without exposing secrets:

```bash
git worktree list
test -d <target_path>
find <target_path> -maxdepth 1 -name '.env*' -type f -print
```

If dependency installation ran, report whether it completed successfully. If the script skipped installation because there is no `package.json`, say that clearly.

## Examples

User request:

```text
Create a worktree for feat/new-feat.
```

Response workflow:

```bash
script_path="<skill-directory>/scripts/worktree-bootstrap.sh"
"$script_path" add ../my-repo/feat/new-feat feat/new-feat
```

Expected result: the script pulls the source checkout from `origin`, creates `../my-repo/feat/new-feat`, checks out `feat/new-feat`, copies `.env` files from the repository root, and installs dependencies. The resulting tree includes `my-repo/main`, `my-repo/dev` when created, and `my-repo/feat/new-feat`.

User request:

```text
Set up my existing ../my-repo/dev worktree and copy env files from this checkout.
```

Response workflow:

```bash
script_path="<skill-directory>/scripts/worktree-bootstrap.sh"
"$script_path" setup ../my-repo/dev --env-source .
```

Expected result: the script copies `.env` files into the existing worktree and installs dependencies using the detected package manager.

## Common Mistakes

| Wrong behavior                                                                                   | Correct behavior                                                                                            |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Manually run `git worktree add`, copy `.env`, and install dependencies as separate ad hoc steps. | Use `scripts/worktree-bootstrap.sh` so setup is repeatable.                                                 |
| Create a new worktree from a stale local checkout.                                               | Pull changes from `origin` before creating the worktree; let the script's fast-forward-only sync run first. |
| Print `.env` contents to prove files copied.                                                     | List filenames only. Never display secret values.                                                           |
| Pass `--base` when checking out an existing branch.                                              | Omit `--base` for existing branches.                                                                        |
| Skip dependency installation by default.                                                         | Install dependencies unless the user asks for `--no-install`.                                               |
| Invent a branch name that ignores the user's requested branch.                                   | Use the user's branch name when provided.                                                                   |
| Flatten branch paths into names like `my-repo-feat-new-feat`.                                    | Preserve the project tree: `my-repo/feat/new-feat`.                                                         |

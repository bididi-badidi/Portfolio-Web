---
name: worktree-bootstrap
description: Use when creating or preparing git worktrees for this repository, especially when the user wants to automate git worktree add, copying .env files, and installing dependencies.
---

# Worktree Bootstrap

Use the repository script instead of manually chaining commands.

## Commands

- Create a new worktree, copy `.env*` files from the current repo, and install dependencies:
  `npm run worktree -- add <path> <branch>`
- Create a worktree from a specific base ref:
  `npm run worktree -- add <path> <branch> --base <ref>`
- Add an already-existing local branch as a worktree:
  `npm run worktree -- add <path> <existing-branch>`
- Bootstrap an existing worktree:
  `npm run worktree -- setup <path>`
- Skip dependency install:
  `npm run worktree -- add <path> <branch> --no-install`
- Use a different package manager:
  `PACKAGE_MANAGER=bun npm run worktree -- add <path> <branch>`

## Rules

- Keep `.env*` files uncommitted.
- Prefer sibling worktree paths under `/Users/user/Projects/portfolio/`, matching the user's existing layout.
- Use `--base` only when creating a new branch; existing branches are attached directly.
- Do not delete existing worktrees unless the user explicitly asks.

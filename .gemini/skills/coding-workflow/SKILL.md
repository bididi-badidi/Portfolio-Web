---
name: coding-workflow
version: 1.0.0
description: Use this skill IMMEDIATELY AFTER any coding task, code modification, feature implementation, or bug fix is performed. Trigger this skill whenever you write, edit, or refactor Python code. It enforces the project's mandatory quality checklist: running linting, executing unit tests, and ensuring the .gitignore file is up to date.
---

# Post-Coding Workflow

Whenever you complete a coding task (e.g., writing new code, modifying existing code, or fixing a bug), you MUST follow this exact sequence of validation steps before considering the task finished.

Do not skip these steps, and do not ask the user for permission to run them unless explicitly told otherwise.

## Step 1: Linting and Formatting

Run the project's linter and formatter using `uv` and `ruff`. This ensures the code adheres to the established style guide and catches syntax/import errors.

1. Execute: `uv run ruff format .` to format the files with ruff.
2. Execute: `uv run ruff check . --fix`
3. **Validation**: If the command fails or reports errors that cannot be auto-fixed, you must address those errors manually in the code and re-run the command until it passes cleanly.

## Step 2: Unit Testing

Run the project's test suite to ensure no regressions were introduced and that new functionality works as expected.

1. Execute: `uv run pytest`
2. **Validation**: If any tests fail, investigate the root cause, fix the underlying code (or update the test if the expected behavior changed), and re-run the tests until all of them pass. Do not proceed until the test suite is completely green.

## Step 3: Update .gitignore

Review the workspace for any newly generated files that shouldn't be tracked by version control.

1. Execute `git status` to view untracked files.
2. Identify any new temporary files, cache directories, local environment variables (e.g., `.env`), IDE configs, or build artifacts.
3. If such files exist, append their paths or patterns to `.gitignore`.
4. Do NOT ignore source code, documentation, or configuration files that are meant to be shared.

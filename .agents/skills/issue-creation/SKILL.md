---
name: issue-creation
version: 1.0.0
description: "Use this skill when creating, drafting, or filing GitHub issues from user requests, bugs, feature ideas, TODOs, incidents, or automation tasks. Triggers: 'create an issue', 'open a GitHub issue', 'file this bug', 'turn this into an issue', 'make issues for these tasks', 'add to issues', 'gh issue create'. Also use when the user asks which template or labels should be used for a new issue. Do NOT use for pull requests, commit messages, branch naming, GitHub Actions workflow YAML, or general project planning without issue creation."
---

# Issue Creation

## Overview

Create GitHub issues that follow the repository's templates, use existing labels accurately, and include enough context for a maintainer or agent to act without re-discovery.

## Prepare the Repository Context

Run these checks before drafting or creating an issue:

1. Confirm the repository root with `git rev-parse --show-toplevel`.
2. Check for issue templates under `.github/ISSUE_TEMPLATE/`.
3. Check for legacy issue templates at `.github/ISSUE_TEMPLATE.md` or `.github/issue_template.md`.
4. List available labels from GitHub before choosing labels.
5. Inspect recent similar issues when duplication risk is high.

Use `rg --files .github` when `.github/` exists. Treat "github directory" in user requests as `.github/`.

## Find and Use Issue Templates

Prefer repository templates over a free-form issue body.

| Template file | How to use it |
| --- | --- |
| `.github/ISSUE_TEMPLATE/*.yml` or `*.yaml` | Parse the issue form fields. Fill required fields from user context. Ask for missing required information if it changes the meaning of the issue. |
| `.github/ISSUE_TEMPLATE/*.md` | Use the markdown headings and prompts as the issue body structure. Remove placeholder comments after filling them. |
| `.github/ISSUE_TEMPLATE/config.yml` | Respect `blank_issues_enabled`. If blank issues are disabled and no template fits, ask the user which template to use. |
| `.github/ISSUE_TEMPLATE.md` | Use it as the default issue body when no directory template fits. |

When multiple templates fit, choose by intent:

| User intent | Preferred template signal |
| --- | --- |
| Broken behavior, error, regression, failing test | `bug`, `bug_report`, `defect`, `regression` |
| New capability or UX change | `feature`, `enhancement`, `request` |
| Maintenance, cleanup, dependency, docs, repo work | `task`, `chore`, `maintenance`, `docs` |
| Repeated manual work, scheduled checks, bots, CI-generated work | `automation`, `automate`, `workflow`, `ops` |

If no template fits, draft a concise issue with:

```markdown
## Summary

## Context

## Proposed Work

## Acceptance Criteria

## Notes
```

## Select Labels

Always list labels before applying them.

Prefer:

```bash
gh label list --limit 200 --json name,description,color
```

Fallback when needed:

```bash
gh api repos/:owner/:repo/labels --paginate
```

Apply only labels that already exist. Do not create labels unless the user explicitly asks.

Use label descriptions when available. If descriptions are missing, match conservatively by exact or near-exact label name. Prefer fewer accurate labels over many weak matches.

Apply `automate` when all of these are true:

1. The repository has an `automate` label.
2. The issue asks an agent, script, scheduled job, workflow, or bot to perform or monitor work.
3. The issue is actionable without a human-only decision as its first step.

Do not apply `automate` to broad strategy discussions, product decisions, or tasks that only a human can complete.

## Draft the Issue

Write the title as a short imperative phrase:

```text
Add scheduled cleanup for stale worktrees
Fix install script failure on PowerShell 7
Document issue template usage for agents
```

Write the body so another maintainer can act without searching the conversation. Include:

- The observed problem or requested outcome.
- Relevant files, commands, logs, screenshots, or links.
- A concrete acceptance checklist.
- Any constraints, non-goals, or known unknowns.

For bugs, include expected behavior, actual behavior, reproduction steps, and environment details when known.

For feature or task issues, include motivation, proposed work, acceptance criteria, and implementation notes.

For automation issues, include trigger, cadence or event source, permissions, failure handling, and how success should be reported.

## Create the Issue

Default to drafting in chat when the user asks "what should the issue say" or when required template fields are missing.

Create the issue when the user directly asks to create/open/file it and enough information is available.

Use a body file for non-trivial issues:

```bash
gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "label-a,label-b"
```

When GitHub CLI supports the selected template for the repository, include it:

```bash
gh issue create --template "<template-file>" --title "<title>" --body-file /tmp/issue-body.md --label "label-a,label-b"
```

After creation, report the issue URL, selected template, and labels used. If a recommended label did not exist, say which label was skipped.

## Common Mistakes

| Wrong behavior | Correct behavior |
| --- | --- |
| Creating a free-form issue while templates exist | Inspect `.github/ISSUE_TEMPLATE/` and use the closest template. |
| Applying guessed labels | Fetch labels first and apply only existing labels. |
| Creating the `automate` label automatically | Apply `automate` only if it already exists, unless the user explicitly asks to create labels. |
| Leaving template placeholders in the body | Fill or remove placeholders before creating the issue. |
| Filing vague tasks | Add acceptance criteria and enough context for the next actor to start. |

## Examples

User prompt:

```text
Create an issue to automate checking stale branches every Monday.
```

Correct handling:

1. Inspect `.github/ISSUE_TEMPLATE/` and choose an automation, task, or feature template.
2. Fetch labels with `gh label list`.
3. Apply `automate` if it exists, plus any accurate existing labels such as `maintenance` or `ci`.
4. Create an issue with trigger, cadence, required permissions, success criteria, and failure reporting.

User prompt:

```text
File this bug: install.ps1 fails when PowerShell runs with strict mode.
```

Correct handling:

1. Choose the bug template if present.
2. Fetch labels and apply accurate existing labels such as `bug` or `windows`.
3. Do not apply `automate` unless the requested fix is specifically for an automated agent, script, or scheduled workflow.

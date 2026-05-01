---
name: github-workflows
version: 1.0.0
description: "Use this skill whenever the task involves creating, editing, or debugging GitHub Actions workflow YAML files. Triggers: any mention of '.github/workflows', 'github actions', 'CI pipeline', 'workflow yml', 'actions/checkout', 'actions/setup-python', 'matrix strategy', 'secrets in CI', 'on: push', 'on: pull_request', or 'reusable workflows'. Also use when the user wants to automate linting, testing, or deployment on GitHub. Do NOT use for writing commit messages, branching strategy, or pull request descriptions — those have separate skills."
---

# GitHub Actions CI Workflows

## Overview

Workflows are YAML files stored in `.github/workflows/` at the repository root. GitHub reads them automatically on the configured trigger events. Reference repos: [actions/starter-workflows](https://github.com/actions/starter-workflows), [Real Python Reader](https://github.com/realpython/reader).

---

## Directory Layout (Best Practice)

```
.github/
  workflows/
    ci.yml              # lint + test on every push / PR
    deploy-staging.yml  # deploy on push to develop
    deploy-prod.yml     # deploy on push to main (with approval)
    release.yml         # create GitHub Release on version tag
    security.yml        # weekly dependency audit
  composite-actions/
    setup-python/
      action.yml        # reusable setup steps
```

**Single responsibility per file**: one workflow = one purpose. Easier to re-run and debug independently.

---

## Workflow Anatomy

```yaml
name: CI # shown in GitHub Actions UI

on: # trigger events
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency: # cancel stale runs on same PR
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ startsWith(github.ref, 'refs/pull/') }}

permissions: # least-privilege token
  contents: read

jobs:
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 10 # always set; prevents hung jobs blocking others
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip # built-in pip cache
      - run: pip install ruff
      - run: ruff check .

  test:
    needs: lint # run after lint passes
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
      - run: pip install -r requirements.txt
      - run: pytest --cov
```

---

## Pinning Actions to Commit SHA (Security Best Practice)

Pin third-party actions to a full commit SHA, not a tag or branch. Tags can be moved; SHAs cannot.

```yaml
# ❌ Vulnerable — tag can be force-pushed
- uses: actions/checkout@v4

# ✅ Safe — locked to exact commit
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

Find the SHA on the action's GitHub Releases page. **Exception**: actions you own yourself.

---

## Common Steps Reference

### Python Setup with pip cache

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-python@v5
  with:
    python-version: "3.12"
    cache: pip # caches ~/.cache/pip based on requirements*.txt
```

### Install dependencies

```yaml
- name: Install dependencies
  run: |
    python -m pip install --upgrade pip
    pip install -r requirements.txt
```

### Linting with Ruff (modern, fast)

```yaml
- name: Lint with Ruff
  run: ruff check .

- name: Format check
  run: ruff format --check .
```

### Type checking with mypy

```yaml
- name: Type check
  run: mypy src/
```

### Tests with pytest + coverage

```yaml
- name: Run tests
  run: pytest --cov=src --cov-report=xml

- name: Upload coverage
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: coverage.xml
```

### Security audit

```yaml
- name: Dependency audit
  run: pip install pip-audit && pip-audit
```

---

## Matrix Strategy (Test Multiple Python Versions)

```yaml
jobs:
  test:
    strategy:
      fail-fast: false # don't cancel other versions if one fails
      max-parallel: 3
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
          cache: pip
      - run: pip install -r requirements.txt
      - run: pytest
```

---

## Secrets

Store tokens in **Settings → Secrets and Variables → Actions**. Never hardcode them.

```yaml
- name: Deploy
  env:
    TELEGRAM_TOKEN: ${{ secrets.TELEGRAM_TOKEN }}
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  run: python main.py
```

**Never echo secrets** — GitHub will mask them in logs, but `echo $SECRET` can still leak partial values.

---

## Workflow Triggers Reference

```yaml
on:
  push:
    branches: [main, develop]
    tags: ["v*"] # run on version tags like v1.2.0
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
  schedule:
    - cron: "0 9 * * 1" # every Monday at 09:00 UTC
  workflow_dispatch: # manual trigger button in UI
  workflow_call: # makes this a reusable workflow
    inputs:
      python-version:
        type: string
        default: "3.12"
```

---

## Reusable Workflow Pattern

### Defining a reusable workflow

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Suite
on:
  workflow_call:
    inputs:
      python-version:
        type: string
        default: "3.12"
    secrets:
      CODECOV_TOKEN:
        required: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ inputs.python-version }}
          cache: pip
      - run: pip install -r requirements.txt
      - run: pytest --cov
```

### Calling the reusable workflow

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    uses: ./.github/workflows/reusable-test.yml
    with:
      python-version: "3.12"
    secrets:
      CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
```

---

## Practical CI Workflow for a Python Telegram Bot

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ startsWith(github.ref, 'refs/pull/') }}

permissions:
  contents: read

jobs:
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
      - run: pip install ruff
      - run: ruff check .
      - run: ruff format --check .

  test:
    name: Test (Python ${{ matrix.python-version }})
    needs: lint
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
          cache: pip
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Run tests
        run: pytest -v --tb=short

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
      - run: pip install pip-audit
      - run: pip-audit -r requirements.txt
```

---

## Workflow Permissions (Principle of Least Privilege)

Set permissions at the top level and override per job if needed:

```yaml
permissions:
  contents: read # read repo files
  pull-requests: write # for PR comments (e.g. coverage reports)
  checks: write # for test result annotations
```

Full list: `actions`, `checks`, `contents`, `deployments`, `id-token`, `issues`, `packages`, `pages`, `pull-requests`, `security-events`, `statuses`.

---

## Common Mistakes

| ❌ Wrong                          | ✅ Correct                                              |
| --------------------------------- | ------------------------------------------------------- |
| No `timeout-minutes`              | Always set — prevents hung jobs blocking other PRs      |
| Pinning to tag (`@v4`)            | Pin to full commit SHA for security                     |
| Secrets in `run:` commands        | Use `env:` block; never `echo $SECRET`                  |
| One giant workflow for everything | Split by purpose: `ci.yml`, `deploy.yml`, `release.yml` |
| No `concurrency` block            | Add it — cancels stale PR runs automatically            |
| `pip install` without cache       | Use `cache: pip` in `setup-python`                      |
| `fail-fast: true` in matrix       | Set `fail-fast: false` to see all failures              |

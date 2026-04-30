---
name: task-decompose
version: 1.0.0
description: >
  Use this skill whenever a task is large, complex, multi-step, or vague enough that
  tackling it in one pass would likely produce inconsistent or incomplete results.
  Triggers include: "help me plan", "break this down", "where do I start", "this feels
  overwhelming", "how do I approach this", any request involving multiple systems or
  teams, any project with more than ~3 distinct concerns, or any time the user hands
  you a goal without a clear execution path. Use this skill even if the user doesn't
  explicitly ask for a breakdown — if the goal is complex, decompose first.
---

# Task Decomposer

Break any large or vague goal into a set of clear, ordered, executable subtasks
before doing any actual work.

---

## When to Use This Skill

Invoke this skill when:

- The request contains multiple distinct concerns (e.g. research + write + review)
- The goal is ambiguous or high-level (e.g. "migrate our database", "launch the feature")
- Completing the task in a single step would likely cause lost context or errors
- The user is unsure where to start
- Downstream work depends on decisions made in earlier steps

**Do not invoke** for single-step, clearly scoped tasks (e.g. "fix this typo",
"convert this list to JSON").

---

## Core Principle

> **Plan before you execute.**
> Task decomposition is one level above chain-of-thought reasoning. Instead of
> thinking through _how_ to solve one problem, you are identifying the _multiple
> distinct problems_ that must be solved and organising them into a coherent plan.

---

## Step-by-Step Process

### Step 1 — Restate the Goal

Write one sentence that captures what success looks like. If the goal is ambiguous,
identify what is unclear and resolve it with the user before continuing.

A good goal statement answers:

- What is the final deliverable or outcome?
- Who is it for?
- What constraints exist (time, tools, budget, format)?

### Step 2 — Identify Task Type

Determine how the subtasks relate to each other:

| Type             | Description                                            | Example                                              |
| ---------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **Sequential**   | Each step depends on the previous one                  | Research → Draft → Review                            |
| **Parallel**     | Steps are independent and can run simultaneously       | Write intro + Gather data                            |
| **Hierarchical** | High-level phases each break into lower-level subtasks | Phase: Setup → Subtasks: Install deps, Configure env |
| **Hybrid**       | Mix of the above                                       | Most real-world tasks                                |

### Step 3 — Decompose into Subtasks

For each subtask, define:

```
Subtask N: [Short title]
- Input:   What does this step receive or depend on?
- Action:  What exactly needs to happen?
- Output:  What is produced when this step is done?
- Success: How do you know this step is complete?
- Depends: Which subtask IDs must finish first? (leave blank if none)
```

**Decomposition rules:**

- Each subtask must be executable by a single focused agent or person
- If two people would interpret a subtask differently, break it down further
- A subtask should produce a concrete, verifiable output — not just "think about X"
- Aim for subtasks that take minutes to hours, not days
- Stop decomposing when a subtask is atomic (i.e. it maps directly to a tool call,
  a single document, or a single decision)

### Step 4 — Order and Map Dependencies

Draw or describe the dependency chain. Ask:

- Which subtasks can start immediately (no dependencies)?
- Which subtasks are blocked until another finishes?
- Are there any subtasks that can run in parallel to save time?

Use this notation for dependency mapping:

```
[1] → [2] → [4]
[3] ──────→ [4]
         ↓
        [5]
```

This shows that subtasks 1, 2, and 3 all feed into subtask 4 before 5 can begin.

### Step 5 — Flag Risks and Unknowns

Before execution, surface anything that could block progress:

- Missing information (e.g. "need the API key before step 3")
- Decisions that have not been made yet
- Subtasks that are likely to expand in scope
- Dependencies on external people or systems

### Step 6 — Present the Plan

Output the plan in this structure:

```
GOAL: [One-sentence goal statement]

TASK TYPE: [Sequential / Parallel / Hierarchical / Hybrid]

SUBTASKS:
  [1] Title — Input: X | Output: Y | Depends on: none
  [2] Title — Input: Y | Output: Z | Depends on: [1]
  [3] Title — Input: X | Output: W | Depends on: none  ← runs in parallel with [1]
  [4] Title — Input: Z, W | Output: final | Depends on: [2], [3]

RISKS / UNKNOWNS:
  - [anything that needs resolving before or during execution]

READY TO START: Subtask [1], Subtask [3]
```

Confirm the plan with the user before executing, unless you have been explicitly told
to proceed automatically.

### Step 7 — Execute and Track State

As subtasks complete, maintain a running state block:

```
COMPLETED: [1], [3]
IN PROGRESS: [2]
BLOCKED: [4] (waiting on [2])
PENDING: [5]
```

Pass relevant outputs from completed subtasks as context into the next one.
Do not re-derive information that has already been established.

### Step 8 — Replan if Needed

If a subtask produces an unexpected result or reveals new complexity:

- Pause and surface the issue rather than continuing silently
- Propose a revised plan with new or updated subtasks
- Re-confirm with the user before resuming

---

## Decomposition Depth Guide

| Signal                                         | Action                 |
| ---------------------------------------------- | ---------------------- |
| Subtask still has multiple distinct concerns   | Decompose further      |
| Subtask requires two different tools or skills | Split into two         |
| Two people would interpret it differently      | Refine the description |
| Subtask is a single tool call or document      | Stop — it is atomic    |
| Subtask takes more than ~half a day            | Consider splitting     |

---

## Examples

### Example A — Simple Sequential

**Goal:** Write a blog post about climate change and sea levels.

```
TASK TYPE: Sequential

[1] Research — Input: topic | Output: 5 key facts + 3 sources | Depends on: none
[2] Outline  — Input: facts  | Output: section headers + key points | Depends on: [1]
[3] Draft    — Input: outline | Output: full draft (~800 words) | Depends on: [2]
[4] Edit     — Input: draft  | Output: polished post | Depends on: [3]

READY TO START: [1]
```

### Example B — Hybrid with Parallelism

**Goal:** Launch a new product landing page by end of week.

```
TASK TYPE: Hybrid

[1] Define copy requirements — Input: product brief | Output: copy doc | Depends on: none
[2] Write hero copy         — Input: copy doc | Output: headline + subhead | Depends on: [1]
[3] Write feature sections  — Input: copy doc | Output: 3 feature blurbs   | Depends on: [1]
[4] Design mockup           — Input: copy doc | Output: Figma frame  | Depends on: [1]
[5] Build HTML page         — Input: [2],[3],[4] | Output: live page  | Depends on: [2],[3],[4]
[6] QA and publish          — Input: live page | Output: published URL | Depends on: [5]

PARALLEL OPPORTUNITY: [2], [3], [4] can all run simultaneously after [1].
READY TO START: [1]
```

### Example C — Stopping Rule in Practice

**Bad subtask (too vague):**

> "Handle the database migration"

**Better (still too broad):**

> "Migrate the users table to the new schema"

**Atomic (ready to execute):**

> "Write an ALTER TABLE SQL script to add `last_login TIMESTAMP NULL` to the users
> table; verify with a dry-run on the staging database; output the script file."

---

## Anti-Patterns to Avoid

- **Monolithic execution** — Attempting a complex goal in a single pass without a plan
- **Over-decomposition** — Creating subtasks so small they introduce more coordination overhead than value
- **Missing dependencies** — Starting a subtask before its inputs are ready
- **Vague outputs** — Subtasks that produce "progress" rather than a concrete artefact
- **Silent scope creep** — Absorbing new complexity mid-execution without surfacing it

---

## References

- <https://mbrenndoerfer.com/writing/breaking-down-tasks-task-decomposition-ai-agents>
- <https://oneuptime.com/blog/post/2026-01-30-task-decomposition/view>
- <https://www.agentpatterns.tech/en/agent-patterns/task-decomposition-agent>
- <https://dev.to/imaginex/skills-required-for-building-ai-agents-in-2026-2ed>
- <https://github.com/microsoft/ai-agents-for-beginners/blob/main/07-planning-design/README.md>

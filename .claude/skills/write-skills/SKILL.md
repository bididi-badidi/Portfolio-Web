---
name: skill-writer
version: 1.0.0
description: "Use this skill whenever the user wants to write a new skill from scratch, refine or improve an existing skill, fix a skill that is not triggering correctly, rewrite a skill description, or review a skill for quality. Triggers: any mention of 'write a skill', 'create a skill', 'refine a skill', 'improve a skill', 'fix my skill', 'skill description', 'SKILL.md', or 'the skill is not triggering'. Also use when the user pastes a skill and says something like 'can you improve this' or 'something feels off about this skill'. Do NOT use for general prompt engineering, system prompt writing, or writing GitHub Actions workflows."
---

# Skill Writer

A skill for producing high-quality, well-scoped SKILL.md files — either from scratch or by refining an existing one.

---

## Core Principle

**Never write or rewrite a skill until every Required Criterion is met.** If any criterion is missing, ask the user for it before drafting. Use the question templates in the Intake section. One focused question at a time — do not list every gap at once.

---

## Phase 1 — Intake and Criteria Gating

Before writing a single line of SKILL.md, work through this checklist. Mark each criterion as ✅ (clear from conversation) or ❓ (missing / ambiguous).

### Required Criteria (block writing if missing)

| #   | Criterion                         | What "met" looks like                                                                         | Question to ask if missing                                                                                                 |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Purpose**                       | One sentence stating what the skill enables Claude to do                                      | "What should Claude be able to do with this skill that it can't do well on its own?"                                       |
| R2  | **Trigger conditions**            | At least 3 concrete user phrases or contexts that should activate the skill                   | "What would a user say or do that should trigger this skill? Give me a few examples of exact phrases or situations."       |
| R3  | **Non-trigger conditions**        | At least 1 related context where the skill should NOT fire                                    | "Is there a related topic or phrasing that looks similar but should NOT use this skill?"                                   |
| R4  | **Expected output**               | A description of what the final deliverable looks like (file type, structure, length, format) | "What should the output look like when Claude uses this skill successfully — a file, a code block, a structured response?" |
| R5  | **At least one concrete example** | A real or realistic input/output pair, or a sample prompt Claude should handle                | "Can you give me one example of a prompt a user might send, and roughly what you'd want Claude to produce?"                |

### Recommended Criteria (ask if not naturally covered)

| #   | Criterion                   | Question to ask if missing                                                                  |
| --- | --------------------------- | ------------------------------------------------------------------------------------------- |
| O1  | **Edge cases**              | "Are there any tricky or unusual inputs this skill needs to handle gracefully?"             |
| O2  | **Dependencies**            | "Does this skill rely on specific tools, files, MCPs, or external services?"                |
| O3  | **Out-of-scope boundaries** | "Is there a related skill or task this skill should explicitly hand off to something else?" |

### Intake Decision Logic

```
For each Required Criterion R1–R5:
  If criterion is ❓:
    Ask its question.
    STOP. Wait for user's answer before proceeding.
    Re-evaluate after each answer.

Once all R1–R5 are ✅:
  If the user has given nothing for O1–O3:
    Ask one combined optional question:
    "Before I draft: any edge cases, external dependencies,
     or things this skill should explicitly hand off?"
  Then proceed to Phase 2.
```

**Do not ask all questions at once.** Address one gap per turn.

---

## Phase 2 — Draft the Skill

Once all Required Criteria are met, produce the SKILL.md using this structure:

### YAML Frontmatter

```yaml
---
name: <kebab-case-identifier>
description: "<trigger sentence>"
---
```

**Rules for `name`:**

- Lowercase, hyphens only, no spaces
- Should be a noun phrase describing what the skill does: `pdf-extractor`, `pr-writer`, `skill-writer`

**Rules for `description`:**
The description is the _only_ thing Claude reads to decide whether to consult a skill. It must do three things:

1. **State what the skill does** — one clause
2. **List specific trigger phrases** — explicit keywords and contexts
3. **State what it does NOT cover** — at least one exclusion

Template:

```
"Use this skill when [what it does]. Triggers: [keyword list].
Also use when [edge trigger]. Do NOT use for [exclusions]."
```

Make the description slightly "pushy" — Claude tends to undertrigger, so err toward more inclusive trigger language.

### Skill Body Structure

Use this section order. Only include sections that are relevant — never add a section just to fill space.

```
# <Skill Title>

## Overview
One short paragraph. What it does, when to use it.
No lists here — prose only.

## <Main Workflow Sections>
Name each section after what the user accomplishes, not after a technical step.
E.g.: "Extracting Tables from a PDF" not "Step 3: Run the parser"

## Criteria / Decision Rules
If the skill requires the model to make choices, provide decision tables or flowcharts.

## Examples
At least one good example input → output pair.
If possible, one bad/edge-case example with the correct handling.

## Common Mistakes
A table of ❌ wrong behavior → ✅ correct behavior.
Only include if there are non-obvious failure modes.

## Reference Files (if applicable)
List any bundled reference files and when to read them.
```

### Writing Rules for the Body

These rules apply to every line written inside SKILL.md:

**Instructions must be imperative and specific.**

- ❌ "The model should consider the output format"
- ✅ "Check the output format before writing. If the user asked for a file, use `create_file`. If they asked for inline content, respond in the chat."

**Every decision point must have a resolution.**
If the skill requires a choice (e.g., what file format to use), the skill must tell Claude how to make that choice. Ambiguous instructions produce inconsistent outputs.

**No filler sections.** If a section has nothing concrete to say, delete it. An empty "Testing" section is worse than no Testing section.

**Specificity over brevity for trigger conditions.** It is better to list 8 trigger phrases than 2 vague ones.

**Examples must be realistic.** Do not use `foo`, `bar`, or `example.com`. Use the domain the skill actually serves.

**Length target:** Under 500 lines. If the skill is growing beyond this, add a `references/` directory and move detail there, with a clear pointer in SKILL.md stating when to read each file.

---

## Phase 3 — Self-Review Before Presenting

After drafting, run this checklist internally before showing the skill to the user. Fix any failures silently.

### Quality Rubric

| Check                               | Pass condition                             | Fix if failing                  |
| ----------------------------------- | ------------------------------------------ | ------------------------------- |
| **Description covers R1–R3**        | Trigger phrases present, exclusion present | Rewrite description             |
| **Every instruction is actionable** | All instructions use imperative verbs      | Rewrite passive/vague lines     |
| **Every decision has a resolution** | No "consider X" or "may want to"           | Add decision rules or flowchart |
| **At least one example**            | A real input → output pair exists          | Add an Examples section         |
| **No empty sections**               | Every section has substance                | Delete empty sections           |
| **Name is kebab-case**              | No spaces, no underscores                  | Fix the name                    |
| **Under 500 lines**                 | `wc -l SKILL.md` < 500                     | Move detail to references/      |
| **Non-trigger is explicit**         | "Do NOT use for..." present in description | Add exclusion clause            |

---

## Phase 4 — Refinement Loop

After presenting the draft, ask:

> "Does this look right? A few things to check: (1) would these trigger phrases actually match how your users ask for this? (2) are the steps in the right order for your workflow? (3) anything important that's missing?"

Then iterate based on feedback. For each round of feedback:

1. Identify which criterion the feedback touches (description, steps, examples, etc.)
2. Make targeted edits — do not rewrite the whole skill for a small fix
3. Show the user what changed and why

**When to stop iterating:** When the user confirms the skill is correct, or when two consecutive rounds of feedback produce no substantive changes. At that point, present the final file.

---

## Phase 5 — Refinement Mode (Existing Skill)

If the user provides an existing skill to improve, run the Quality Rubric from Phase 3 against it first. Report findings as a short table:

```
| Check           | Status | Issue found                          |
|-----------------|--------|--------------------------------------|
| Description     | ❌     | No exclusion clause                  |
| Actionable steps| ✅     |                                      |
| Decision rules  | ❌     | "consider X" on line 47 — no resolution |
| Examples        | ❌     | No examples section                  |
| Length          | ✅     | 210 lines                            |
```

Then ask: "I found these issues. Should I fix all of them, or do you want to prioritise some?"

Fix only what the user approves. If the user says "fix everything", fix all ❌ items in one pass and show the result.

### Special case: skill not triggering correctly

If the user says the skill fires too often, too rarely, or on the wrong prompts:

1. Ask: "Can you give me 2–3 examples of prompts where it triggered when it shouldn't (or didn't when it should)?"
2. Identify whether the problem is in the **description** (triggering logic) or the **body** (execution logic)
3. If description: rewrite with tighter or broader trigger phrases and clearer exclusions
4. If body: the skill is triggering fine but executing wrong — treat as a normal refinement

---

## Reference: Anatomy of a Skill File

```
skill-name/
├── SKILL.md              ← required; instructions + frontmatter
└── references/           ← optional; loaded on demand
    ├── detailed-rules.md ← link from SKILL.md with "when to read" note
    └── examples.md
```

**Loading hierarchy (what Claude actually reads):**

- `name` + `description` — always in context; this is the trigger
- `SKILL.md` body — read when skill triggers
- `references/` files — read only when SKILL.md explicitly says to

Keep the most important decision-making content in SKILL.md. Push lookup tables, long examples, and edge case libraries to `references/`.

---

## Quick Reference: Common Skill Antipatterns

| ❌ Antipattern                                | Why it fails                       | ✅ Fix                                   |
| --------------------------------------------- | ---------------------------------- | ---------------------------------------- |
| Description says "use when relevant"          | Too vague to trigger reliably      | List explicit phrases and contexts       |
| Steps say "consider X"                        | Claude will sometimes skip it      | "If X, then do Y. If not X, do Z."       |
| No exclusion in description                   | Skill fires on everything adjacent | Add "Do NOT use for..." clause           |
| Single generic example                        | Doesn't cover real edge cases      | Add a second example with a tricky input |
| Empty Testing or Notes section                | Adds noise, no signal              | Delete unused sections                   |
| Skill body over 500 lines                     | Slow to load, harder to follow     | Split into SKILL.md + references/        |
| Trigger phrases only in body, not description | Skill never fires                  | Move all trigger language to description |

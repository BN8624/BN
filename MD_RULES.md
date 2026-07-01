# MD File Writing Rules

This document defines how project-control Markdown files must be written for this project and future projects.

The user is a vibe coder. The user does not read long project documents.

Markdown files exist primarily to control AI workers, reduce context waste, preserve decisions, and make handoff between sessions reliable.

The goal is not beautiful documentation.

The goal is low-context, high-accuracy AI execution.

---

## 0. Core Rule

Markdown files are not the product.

Markdown files are control surfaces for AI workers.

Keep them few, short, routed, and useful.

Every project should use this principle:

```text
Canon defines the project.
Index routes the AI to the right canon section.
Agent rules control worker behavior.
Handoff resumes the current session.
Checklist prevents repeated mistakes.
```

The user should not need to read long Markdown files.

AI workers must read only the minimum documents needed to act correctly.

---

## 1. Default Operating Sequence

When starting a new project with the user, use this order:

1. Discuss the project with GPT.
2. GPT writes `<PROJECT>_CANON.md`.
3. GPT writes `DOCS_INDEX.md`.
4. GPT writes short `AGENTS.md` and `CLAUDE.md`.
5. The coding agent applies those files to the repository.
6. The coding agent creates or updates `HANDOFF.md`.
7. The coding agent creates or updates `CHECKLIST.md`.
8. The coding agent starts implementation only after the document system is in place.
9. The user receives short reports, not long documents.

Do not start with `AGENTS.md`.

Reason:

- canon defines the project,
- index defines partial reading,
- agent rules point to the canon and index,
- handoff and checklist are current-state files.

---

## 2. Default Project Document Set

Every new project should start with only these project-control documents:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `<PROJECT>_CANON.md`
4. `DOCS_INDEX.md`
5. `HANDOFF.md`
6. `CHECKLIST.md`

Do not create more project-control documents unless the user explicitly approves.

`AGENTS.md` and `CLAUDE.md` must be byte-identical unless the user explicitly says otherwise.

---

## 3. Document Roles

### 3.1 `AGENTS.md` / `CLAUDE.md`

Purpose:

- mandatory AI worker rules,
- reading order,
- repository boundary rules,
- tool usage defaults,
- commit safety,
- reporting format.

This file is not the full design document.

Keep it short.

Target size:

- 100 to 150 lines maximum.

It should answer:

- What must the AI do before work?
- What must the AI never do?
- Which documents should the AI read first?
- How should the AI report?

Do not put detailed design, long rationale, debates, or implementation plans here.

---

### 3.2 `<PROJECT>_CANON.md`

Purpose:

- full project canon,
- project purpose,
- non-goals,
- architecture,
- stable decisions,
- pipeline,
- roles,
- success criteria,
- important constraints.

This is the only long project-control document allowed by default.

The canon may be long, but it must be sectioned with stable numbered headings.

Example:

```md
## §1 Project Purpose
## §2 Non-Goals
## §3 Architecture Overview
## §4 Core Pipeline
## §5 Context Strategy
## §6 Worker / Agent Strategy
## §7 Safety Rules
## §8 Success Criteria
```

Do not require AI workers to read the full canon by default.

The canon is a source of truth, not a default reading file.

---

### 3.3 `DOCS_INDEX.md`

Purpose:

- route the AI to the right canon sections,
- prevent full-canon reading,
- reduce context waste.

This is not a normal table of contents.

It must be a task router.

Example:

```md
## Route: document structure / agent rules

Use this route when modifying:
- AGENTS.md
- CLAUDE.md
- HANDOFF.md
- CHECKLIST.md
- DOCS_INDEX.md

Read:
- <PROJECT>_CANON.md §1 Project Purpose
- <PROJECT>_CANON.md §5 Context Strategy
- <PROJECT>_CANON.md §7 Safety Rules

Do not read:
- Provider sections
- Archive sections
- Unrelated implementation details

Before editing, report:
- selected route
- canon sections read
- files expected to change
```

Every route should say:

1. when to use this route,
2. which canon sections to read,
3. which sections not to read,
4. what to report before editing.

---

### 3.4 `HANDOFF.md`

Purpose:

- current project state,
- last known commit,
- current task,
- next action,
- recent decisions,
- known blockers.

This is the main file for new sessions.

It should be short.

Target size:

- 100 to 150 lines maximum.

It should not contain old history.

It should not contain long debates.

When the session becomes heavy, update `HANDOFF.md` and start a new session.

---

### 3.5 `CHECKLIST.md`

Purpose:

- current task checks,
- repeated mistakes to avoid,
- required test commands,
- commit/push checks,
- files that must not be committed.

This is an active work checklist, not a design document.

Target size:

- 100 lines maximum.

---

## 4. Default Reading Order for AI Workers

At the start of work, AI workers must read only:

1. `AGENTS.md` or `CLAUDE.md`
2. `HANDOFF.md`
3. `CHECKLIST.md`
4. `DOCS_INDEX.md`

Then select the smallest matching route from `DOCS_INDEX.md`.

Do not read `<PROJECT>_CANON.md` top-to-bottom by default.

Read only the canon sections selected by `DOCS_INDEX.md`.

If no route matches:

1. do not read the full canon,
2. read only `§1 Project Purpose`,
3. read the one section whose title best matches the task,
4. report which sections were read.

---

## 5. Context Budget Rules

Context is a limited resource.

AI workers must avoid unnecessary reading.

Do not:

- paste huge documents,
- read the whole canon by default,
- duplicate the same rule in many files,
- preserve long debates in active documents,
- create new docs for every thought,
- summarize history unless it affects the next action.

Prefer:

- short rules,
- stable canon sections,
- route-based reading,
- current-state handoff,
- active checklist,
- concise reports.

If context use becomes high, update `HANDOFF.md` and start a fresh session.

---

## 6. Canon and Index Must Work Together

The canon must have stable numbered sections.

The index must refer to those exact section numbers.

Bad:

```md
Read the relevant parts of the canon.
```

Good:

```md
Read:
- <PROJECT>_CANON.md §1 Project Purpose
- <PROJECT>_CANON.md §4 Core Pipeline
- <PROJECT>_CANON.md §7 Safety Rules
```

The AI must state which route it selected before editing.

---

## 7. No Documentation Sprawl

Do not create extra project-control files such as:

- `PLAN.md`
- `ROADMAP.md`
- `NOTES.md`
- `DECISIONS.md`
- `MEETING.md`
- `SPEC.md`
- `ARCHITECTURE.md`
- `TASKS.md`

unless the user explicitly asks.

If additional material is necessary, first try to place it in one of the default files:

- stable decision → canon,
- route → docs index,
- current state → handoff,
- active check → checklist,
- mandatory rule → AGENTS/CLAUDE.

If a document becomes too long:

1. extract only the stable decision,
2. put it into the canon,
3. update the index if needed,
4. remove stale detail from active files.

---

## 8. Archive Policy

Do not create archives by default.

Archive only when:

- the user asks,
- a long old document must be preserved,
- deletion would lose important historical context.

Archive is not default reading.

AI workers must not read archive files unless explicitly instructed.

---

## 9. User Role Assumption

The user is not expected to read long documents.

The user should receive short reports, not long explanations.

Reports should focus on:

- what changed,
- what was tested,
- what remains risky,
- what decision is needed.

Do not ask the user to inspect long Markdown files unless there is no alternative.

---

## 10. AI Worker Behavior

The AI worker must not treat documents as prose to admire.

The AI worker must treat documents as execution control.

Before editing, the AI worker should know:

1. target repository,
2. selected docs route,
3. relevant canon sections,
4. current handoff state,
5. checklist requirements,
6. files to modify,
7. files not to modify.

If this is unclear, the AI worker must report the ambiguity before editing.

---

## 11. Repository Boundary Rule

If multiple repositories are involved, documents apply only inside their own repository.

Do not mix repositories.

Before editing, run:

```bash
pwd
git remote -v
git status
```

If work affects two repositories, separate:

- commands,
- commits,
- reports,
- handoffs.

Never copy one project’s canon into another project unless the user explicitly asks.

---

## 12. Tool and Harness Rules

If the project has a tool or harness that reduces AI work, using it should be the default for non-trivial work.

Examples:

- HACO,
- project-specific verifier,
- test runner,
- context pack generator,
- log compressor,
- repo map builder.

Skipping a required harness must be approved by the user unless the task is clearly trivial.

The rule is:

```text
Use cheap deterministic tools first.
Use free or low-cost workers second.
Use expensive main-agent reasoning last.
```

---

## 13. Markdown Writing Style

Use short sections.

Use stable headings.

Use lists over paragraphs.

Avoid motivational language.

Avoid repeated explanations.

Avoid long examples unless they are command templates.

Prefer explicit commands and file paths.

Use Korean for user-facing project status if the user prefers Korean.

Use English for machine-oriented stable rule files if that improves tool compatibility, but keep them simple.

---

## 14. Required Report Format

For completed work, report:

```text
Changed:
Tests:
Commit:
Push:
Remaining risk:
Next:
```

For multi-repository work, report each repository separately:

```text
PROJECT A:
- Changed:
- Tests:
- Commit/Push:

PROJECT B:
- Changed:
- Tests:
- Commit/Push:
```

Always be honest about:

- failed tests,
- skipped tests,
- uncommitted files,
- untracked files,
- uncertainty,
- incomplete work.

---

## 15. Minimal New Project Bootstrap

For a new project, the first canon should define:

1. one-line project definition,
2. purpose,
3. non-goals,
4. user role,
5. AI worker role,
6. core pipeline,
7. document system,
8. repository safety,
9. success criteria,
10. next implementation target.

The first index should define at least these routes:

1. document work,
2. architecture/design work,
3. implementation work,
4. testing/debugging work,
5. handoff/session restart work.

---

## 16. Success Criteria

The document system succeeds if:

1. the AI does not read the full canon by default,
2. new sessions can resume from handoff quickly,
3. the user does not need to read long documents,
4. repeated mistakes are caught by checklist,
5. project purpose does not drift,
6. AI workers report concise results,
7. context spent on documentation stays low.

The document system fails if:

1. the AI reads everything every time,
2. documents multiply without approval,
3. AGENTS/CLAUDE become long essays,
4. handoff becomes history,
5. checklist becomes documentation,
6. the user has to read long files to decide what happened.

---

## 17. Final Rule

Markdown files are not the product.

Markdown files are control surfaces for AI workers.

Keep them few, short, routed, and useful.
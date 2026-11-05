# AI Use Declaration

**Project:** CPE 334 Workflow and Approval System | **Last updated:** 5 November 2026

This file lists the AI tools used on the project and the tasks they assisted. It is updated whenever a new kind of AI assistance is used. Full transcripts are not kept in the repository.

## Tools

| Tool | Used for |
|---|---|
| Claude (Anthropic, chat) | Planning, explaining the course documents, drafting documents (see task log) |
| VS Code built-in chat agent | Read-only review of repository documents |

## Task log

| Date | Issue | Tool | Task | Human work and review |
|---|---|---|---|---|
| 5 Nov 2026 | #1 | VS Code chat agent | Read-only review of `docs/sprints/sprint-1/proposed-scope.md` against the Sprint 1 requirements; listed gaps and options. No files were changed. | The team chose the answer to each gap. |
| 5 Nov 2026 | #1 | Claude | Listed the scope questions to decide and formatted the resulting decisions table (D-01 to D-14). | The team made every decision and recorded it in Issue #1. |
| 5 Nov 2026 | #2 | Claude | Drafted `docs/srs.md`, `docs/features.md` and `docs/traceability.md` from the Issue #1 decisions. | The team reviewed the drafts, changed the reviewer-visibility rule (D-14) and approved the rest. |
| 5 Nov 2026 | #3 | Claude | Drafted `docs/system-sds.md` and `docs/sprints/plan.md` from the team's design choices (session design, hashing, enforcement, concurrency, API conventions, deployment plan). | The team chose the options; the drafts are reviewed in the pull request. |
| 5 Nov 2026 | #1 to #3 | Claude | Explained Git, GitHub and VS Code steps (clone, branches, pull requests). | The team ran the commands. |

## Responsibility

Both team members are responsible for the correctness of every document and every line of code in this repository, whether or not AI assisted. AI output is a draft: it is read, changed where needed and reviewed by the teammate in the pull request before it is merged. Test results and completion are shown by executed tests and reviewed pull requests, never by an AI statement.
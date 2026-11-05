# Three-Sprint Plan

**Product:** Workflow and Approval System (university department)
**Version:** 0.1 (draft) | **Date:** 5 November 2026
**Related documents:** `docs/srs.md`, `docs/features.md`, `docs/traceability.md`, `docs/system-sds.md`

## 1. Overview

| Sprint | Goal | Features | Checkpoint |
|---|---|---|---|
| 1 | Small working domain slice with authentication, permissions and persistence | F-01, F-02, F-03, F-04, F-05 | Deliverable 1, 8 Nov |
| 2 | Completed core expansion under engineering contracts | F-06, F-07, F-08 | Deliverable 2, 29 Nov |
| 3 | Remaining features, integration and hardening | F-09, F-10, F-11 | Progress on 29 Nov; complete by 13 Dec |

Together the three sprints cover every FR, BR and NFR in the SRS (see `docs/traceability.md`).

## 2. Sprint 1: small deployable product

**Goal:** a Requester submits a request; a Reviewer claims it and approves or rejects it; the result and its history are saved; access is enforced by the backend, with tests.

**Scope of Sprint 1:**
- F-01 Authentication and access control (login, logout, current user, role and ownership enforcement).
- F-02 Submit and track own requests.
- F-03 Review queue and claim.
- F-04 Decide request and record history.
- F-05 Persistence, seed data and setup (schema, migrations, seed accounts, README).

**Not in Sprint 1:** editing after submission, return and resubmission, filtering and search, history view screens, second-stage approval, summaries. This is the minimum slice the course specification describes for this theme: authentication, authorization, a persisted domain transaction, a business-rule rejection and role-restriction tests.

**Dependencies and build order:**

| Order | Feature | Depends on | Why this order |
|---|---|---|---|
| 1 | F-05 Persistence, seed and setup | none | Every other feature needs the schema and seed accounts. |
| 2 | F-01 Authentication and access control | F-05 | Every protected endpoint needs login and role checks. |
| 3 | F-02 Submit and track own requests | F-01 | Creates the requests that later features act on. |
| 4 | F-03 Review queue and claim | F-01, F-02 | Needs existing requests and the Reviewer role. |
| 5 | F-04 Decide request and record history | F-03 | A decision needs a claimed request. |

Each feature gets its engineering contract (Issue #4) before implementation, then a branch from `sprint-1-staging`, a PR, and a teammate review.

**Completion outcome:** a release on `main` with documented local setup, passing tests (domain rules, persistence, login, unauthenticated and forbidden access, concurrent claim), a normal journey, a business-rule rejection and an access denial that can be demonstrated, with a release tag.

**Feasibility:** Sprint 1 is five small features, the smallest slice that meets the theme example. If time is short, the first things to simplify are the UI polish and the Mine tab (FR-12), never the backend rules or the tests.

## 3. Sprint 2: core expansion

**Goal:** the remaining major workflows, complete and tested.

| Feature | Depends on | Outcome |
|---|---|---|
| F-06 Request history view | F-04 | The detail screen shows the history log (FR-13). |
| F-07 Return and resubmission | F-04 | A Reviewer returns a request with a reason; the Requester edits and resubmits it (FR-14, FR-15, BR-13). Q-01 must be answered before this contract is written. |
| F-08 Filtering and search | F-02, F-03 | Lists filter by status, category, date range and text (FR-16). |

**Completion outcome:** all Sprint 2 features complete under contracts, with AC and tests, reviewed PRs and an integrated release; submitted with Deliverable 2 on 29 Nov. Sprint 1 defects found in Labs 5 and 6 are fixed here.

## 4. Sprint 3: completion and hardening

**Goal:** finish the remaining features and make the product reliable.

| Feature | Depends on | Outcome |
|---|---|---|
| F-09 Second-stage approval | F-04, F-07 | Requests above a threshold need a second, different Reviewer (FR-17, BR-14). Q-02 must be answered before this contract is written. |
| F-10 Decision summary | F-04 | Counts by status, category and Reviewer (FR-18). |
| F-11 Hardening and usability | all | Failure handling, usability fixes, the 500 ms performance check (NFR-05), full regression run. |

**Checkpoint on 29 Nov:** Sprint 3 contracts written, some implementation demonstrated, and an explicit remaining-work list. **Completion outcome (13 Dec):** all features done, regression and UAT defects closed, final release deployed.

## 5. Course labs alongside the sprints

| Lab | Due | How it fits |
|---|---|---|
| Lab 5: Docker, CI/CD, GCP | 15 Nov | Uses the Sprint 1 release; design in `docs/system-sds.md` section 9. |
| Lab 6: cross-team UAT | 22 Nov | Tests a recorded release; defects are fixed in Sprint 2. |
| Lab 7: maintenance change | 29 Nov | Needs an approved change to behavior that is already implemented (a baseline backlog feature does not count). A candidate must be agreed with the instructor or TA. |

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Sprint 1 deadline is 8 Nov | Incomplete slice | Write contracts first, keep Sprint 1 to five features, cut UI polish before rules or tests. |
| Labs 5, 6 and 7 overlap Sprint 2 | Sprint 2 slips | Plan Sprint 2 around the lab due dates; do not start Sprint 3 features until Sprint 2 is merged. |
| Open questions Q-01 and Q-02 | Contracts blocked | Answer Q-01 before the Sprint 2 contracts and Q-02 before the Sprint 3 contracts. |
| Final exams 1 to 11 Dec | Less time before 13 Dec | Aim for a substantially complete product on 29 Nov. |
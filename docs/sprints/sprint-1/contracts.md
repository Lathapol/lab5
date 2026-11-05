# Sprint 1 engineering contracts

Version 0.1, 5 November 2026. Issue #4. Baseline: merged SRS, feature inventory and system SDS. This version defines the contracts and Software Test Specification before implementation. Record later revisions with date, reason and affected IDs.

## Shared behavior

Use the SDS JSON envelopes and error conventions. Derive identity, role and ownership from the authenticated session. Protected routes return 401 for missing or expired sessions, 403 for forbidden roles, and 404 for another Requester's private record. Validate input on the server and return field errors. React forms preserve inputs on validation failure, show pending and failure states, and prevent repeated submissions while busy. Lists show loading, empty and error states. Return only public user fields in request representations.

## F-01 Authentication and access control

FR-01–03, BR-11–12, NFR-01–03. Depends on F-05 schema and seed data.

Login screen submits username and password to POST /api/auth/login. Success returns the public user (ID, username and role) and sets the SDS session cookie. Invalid credentials return a generic 401. GET /api/auth/me returns the same public user. POST /api/auth/logout deletes the current Session, clears the cookie and returns success. The UI returns to login and clears cached private state. Session rows reference User and expire after eight hours by default without renewal. Use bcrypt and the SDS cookie flags. Authorization and record filtering apply server-side.

| Acceptance criterion | Test ID and level | Preconditions and action | Expected result |
| --- | --- | --- | --- |
| AC-01-01 Valid and invalid credentials are handled safely | TEST-01-01 API/DB | Seed both roles. Log in with valid credentials, then with a wrong password and unknown username. | Valid logins set the protected cookie and return the correct role. Both invalid attempts return generic 401 and create no session. Stored passwords are salted bcrypt hashes. |
| AC-01-02 Identity comes from the session | TEST-01-02 API/DB | Call /me with a valid session; try protected routes without a cookie and with an expired cookie. | Valid /me returns only public user fields. Every unauthenticated call returns 401 with no private data. The expired session is deleted. |
| AC-01-03 Logout revokes access | TEST-01-03 UI/API | Log in, log out, then replay the old cookie. | UI returns to login, cookie is cleared, Session row is deleted and replay gets 401. |
| AC-01-04 Roles and ownership are enforced | TEST-01-04 API/DB | Requester A tries a review operation and reads B's detail; Reviewer attempts submission. Include forged role/user inputs. | 403 for wrong role, 404 for B's detail, no private data or mutation. Each seeded user has one role. |

## F-02 Submit and track requests

FR-04–06, BR-01–02, BR-08, NFR-08. Depends on F-01 and F-05.

POST /api/requests accepts title, category, positive THB amount and justification. Category must be Funding, Purchase, Travel or Reimbursement. Trim text and reject blanks. Store amount as a decimal using the SDS schema precision. Return the created request with status 201. The backend supplies requester ID, Pending state and a null reviewer ID. GET /api/requests returns the Requester's own list. GET /api/requests/:id returns the fields, state, reviewer and decision reason for an accessible record. Requesters use a submission form and own list/detail screens. Sprint 1 exposes no edit action or route.

| Acceptance criterion | Test ID and level | Preconditions and action | Expected result |
| --- | --- | --- | --- |
| AC-02-01 Valid submission persists | TEST-02-01 API/DB | Log in as a Requester, submit a valid request and fetch it again. | 201, one stored Pending row owned by that account, no reviewer. List and detail show the saved request. |
| AC-02-02 Invalid fields are rejected | TEST-02-02 Unit/API/UI | Submit blank text, invalid category, zero or negative amount, and an out-of-range amount. | Validation rejects each invalid field; no row is written. Form shows field errors and keeps input. |
| AC-02-03 Submitted requests are read-only | TEST-02-03 API/DB | Seed requests for two Requesters. List as one, then attempt to edit an owned request. | List includes only owned records. Edit fails and stored fields remain unchanged. |

## F-03 Review queue and claim

FR-07–08, FR-12, BR-03–04, BR-06, NFR-06. Depends on F-01, F-02 and the history persistence in F-05.

Reviewers can read all request details. GET /api/requests supports state=PENDING and mine=true for the Queue and Mine tabs. POST /api/requests/:id/claim returns the updated request. Atomically change Pending with null reviewer to In Review with the authenticated Reviewer assigned, and append a history row in the same transaction. Return 404 for unknown ID, 403 for self-claim and 409 for an invalid state or lost race. Show Claim only for Pending requests. On a conflict, refresh and display the current status.

| Acceptance criterion | Test ID and level | Preconditions and action | Expected result |
| --- | --- | --- | --- |
| AC-03-01 Queue and Mine reflect persisted assignment | TEST-03-01 API/DB | Seed Pending and claimed requests; list all and queue, claim a Pending request, then list Mine and fetch detail. | Reviewer can read any detail. Queue contains only Pending records. Claim assigns the caller, moves it to In Review, writes one history row and moves it from Queue to Mine. |
| AC-03-02 Exactly one concurrent claim succeeds | TEST-03-02 concurrent API/DB | Two Reviewers send claim requests for the same Pending record. | One succeeds, one gets 409, and exactly one reviewer and one claim history entry persist. |
| AC-03-03 Forbidden and invalid claims leave data unchanged | TEST-03-03 unit/API/DB | Attempt self-claim in the service with a synthetic same-ID actor, claim a non-Pending request via API, and claim an unknown ID. | Self-claim denied, invalid state gets 409 and missing ID gets 404. No state or history mutation. |

## F-04 Decide requests and record history

FR-09–11, BR-03, BR-05–07, BR-09–10. Depends on F-03 and F-05.

POST /api/requests/:id/approve accepts an optional reason. POST /api/requests/:id/reject requires a nonblank reason. Both return the updated request. Only the assigned Reviewer can decide an In Review request. Return 404 for unknown ID, 403 for an unrelated Reviewer or self-decision, and 409 for a terminal request when attempted by the assigned Reviewer. Atomically persist the outcome and reason and append actor, time, previous state, new state and reason to RequestHistory. History has no mutation route. The Reviewer detail shows decision controls only for their own In Review requests. Requester detail shows the saved outcome and reason.

| Acceptance criterion | Test ID and level | Preconditions and action | Expected result |
| --- | --- | --- | --- |
| AC-04-01 Approve and reject persist outcomes and history | TEST-04-01 API/DB | Assigned Reviewer approves one In Review request and rejects another with a reason. Fetch both as their owner. | Correct terminal states and reasons are retrieved. Each decision appends exactly one matching history row. |
| AC-04-02 Decisions require assignment and valid input | TEST-04-02 unit/API/DB | Try blank rejection reason, an unrelated Reviewer, a decision before claiming, and self-decision with a synthetic same-ID actor. | Field validation rejects blank reason. Unauthorized decisions are denied. No mutation or history entry occurs. |
| AC-04-03 Final decisions are immutable | TEST-04-03 API/DB | Retry a decision on a terminal request, race approve against reject on another, and try to edit/delete history. | Terminal retry gets 409. One racing decision wins. Original outcomes and history remain unchanged by failed operations. |
| AC-04-04 Critical journey works through the UI | TEST-04-04 end-to-end | Requester submits, Reviewer claims and rejects with a reason, then Requester reopens their request. | UI shows the saved final outcome and reason after a fresh login. |

## F-05 Persistence, seed data and setup

NFR-04, NFR-07. PostgreSQL migrations provision User, Session, Request and RequestHistory with foreign keys and the SDS constraints. Pending requests have no reviewer. Claimed and decided requests have exactly one. Use a reproducible seed with two Requesters and two Reviewers and synthetic requests. Read the seed password from environment configuration. GET /api/health reports service readiness without exposing configuration. Document configuration, migrations, seeding and build/test commands.

| Acceptance criterion | Test ID and level | Preconditions and action | Expected result |
| --- | --- | --- | --- |
| AC-05-01 Data survives restart | TEST-05-01 API/DB | Save a request and decisions, stop and restart the backend with the same database, then retrieve it. | Request, reviewer, decision and history persist. |
| AC-05-02 Fresh setup is reproducible | TEST-05-02 manual | Teammate follows README from a fresh clone against a clean local database. | Migrations, seed, app, health check, build and test commands work. No real credentials enter Git. |

## Product Definition of Done

Each contract and test design is versioned before implementation. Requirements trace to acceptance criteria and test IDs. Each completed feature is linked to its Issue and reviewed PR into sprint-1-staging. Record failing-before/passing-after evidence for a meaningful rule test, then verify the integrated release. Record test commands, files, outcomes and exact tested commit. Keep setup reproducible and report incomplete, failed or skipped work. The release PR receives teammate review before merging to main.

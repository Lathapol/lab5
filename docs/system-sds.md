# System-Level Software Design Specification

**Product:** Workflow and Approval System (university department)
**Version:** 0.1 (draft) | **Date:** 5 November 2026
**Related documents:** `docs/srs.md` (FR, BR, NFR, decisions), `docs/features.md`, `docs/traceability.md`

## 1. Architecture and stack

### 1.1 Stack and rationale

| Layer | Technology | Responsibility |
|---|---|---|
| UI | React, TypeScript, Vite, React Router, Bootstrap | Screens, navigation, form validation messages, calling the API. Contains no authoritative business rules. |
| API / application | Node.js, Express, TypeScript | HTTP endpoints, authentication, authorization, business rules, transactions. |
| Database | PostgreSQL with Prisma ORM | Durable storage, schema, constraints, migrations, seed data. |
| Testing | Vitest, Supertest, Playwright | Unit tests, API/database integration tests, UI component tests, end-to-end journeys. |

The product is a modular monolith: one Express application serves the API (and, once deployed, the built UI). This stack was chosen for continuity with the team's earlier coursework, which keeps setup short and lets the team spend time on rules, tests and delivery.

### 1.2 Components and communication

```mermaid
flowchart LR
  Browser["React UI (Vite)"] -- "HTTPS, JSON, session cookie" --> API["Express API"]
  subgraph API_internal["Express application"]
    R["Routes"] --> M["Auth and role middleware"] --> S["Service layer (business rules)"] --> P["Prisma data access"]
  end
  API --- API_internal
  P --> DB[("PostgreSQL")]
```

- The UI calls the API under `/api` with JSON. In development the Vite dev server proxies `/api` to the Express server so the session cookie is same-origin.
- **Where rules are enforced:** all business rules (BR-01 to BR-14) and all authorization checks live in the service layer and middleware on the backend. The UI hides or disables controls for convenience only. Database constraints are a second line of defence (see 2.2).

### 1.3 Backend layering

| Layer | Responsibility |
|---|---|
| Routes | Parse the request, call one service function, map the result or error to a status code. |
| Middleware | Read the session cookie, load the current user, reject unauthenticated (401) or wrong-role (403) requests. |
| Services | Validate input, enforce state transitions and ownership, run each change in a database transaction, write history entries. |
| Data access | Prisma queries only; no business rules. |

## 2. Data model

### 2.1 Entities

```mermaid
erDiagram
  USER ||--o{ SESSION : has
  USER ||--o{ REQUEST : "submits (requester)"
  USER ||--o{ REQUEST : "claims (reviewer)"
  USER ||--o{ REQUEST_HISTORY : "acts in"
  REQUEST ||--o{ REQUEST_HISTORY : logs
```

**User**

| Field | Type | Notes |
|---|---|---|
| id | integer, primary key | |
| username | text, unique, not null | |
| passwordHash | text, not null | bcrypt hash (NFR-03) |
| displayName | text, not null | |
| role | enum REQUESTER, REVIEWER, not null | One role per account (BR-12) |
| createdAt | timestamp | |

**Session**

| Field | Type | Notes |
|---|---|---|
| id | text, primary key | Random 256-bit value, also the cookie value |
| userId | integer, foreign key to User, not null | |
| createdAt | timestamp | |
| expiresAt | timestamp, not null | createdAt + 8 hours |

**Request**

| Field | Type | Notes |
|---|---|---|
| id | integer, primary key | |
| title | text, not null | |
| category | enum FUNDING, PURCHASE, TRAVEL, REIMBURSEMENT, not null | Fixed list (D-02) |
| amount | decimal(12,2), not null | THB |
| justification | text, not null | |
| state | enum PENDING, IN_REVIEW, APPROVED, REJECTED, not null | Default PENDING |
| requesterId | integer, foreign key to User, not null | Ownership link |
| reviewerId | integer, foreign key to User, null | Set on claim |
| decisionReason | text, null | Required when REJECTED |
| createdAt, updatedAt | timestamp | |
| decidedAt | timestamp, null | Set on approve or reject |

**RequestHistory** (append-only, BR-10)

| Field | Type | Notes |
|---|---|---|
| id | integer, primary key | |
| requestId | integer, foreign key to Request, not null | |
| actorId | integer, foreign key to User, not null | |
| fromState | enum, null | Null for the initial submission |
| toState | enum, not null | |
| reason | text, null | |
| createdAt | timestamp, not null | |

### 2.2 Database constraints (backstop for the service layer)

| Constraint | Backs rule |
|---|---|
| `amount > 0` check | BR-01 |
| `title`, `justification` not null and non-blank (check on trimmed length) | BR-01 |
| `reviewerId IS NULL` when state is PENDING, `NOT NULL` otherwise | BR-02, BR-04 |
| `reviewerId <> requesterId` check | BR-06 |
| `decisionReason` non-blank when state is REJECTED | BR-07 |
| Foreign keys from Request, Session and RequestHistory | ownership, BR-11 |
| `username` unique | login identity |

### 2.3 Setup, migrations and seed data

- Schema changes are Prisma migrations committed to the repository; a fresh database is created with `npx prisma migrate dev` (development) or `npx prisma migrate deploy` (deployment).
- `npx prisma db seed` creates two Requesters, two Reviewers and a small set of requests covering every state, so every demo and test starts from the same data. The seed password is read from the `SEED_PASSWORD` environment variable and is never committed. All names and data are synthetic.
- Data is stored in PostgreSQL, so it survives an application restart (NFR-04).

## 3. UI structure and conventions

### 3.1 Screens and navigation

| Screen | Role | Purpose |
|---|---|---|
| Login | anonymous | Username and password; redirects by role after login. |
| My Requests | Requester | List of own requests with status. |
| New Request | Requester | Form: title, category, amount, justification. |
| Request Detail | Requester (own), Reviewer (any) | Fields, status, reviewer, decision and reason. |
| All Requests | Reviewer | All requests, with a Queue tab for Pending ones and a Mine tab for claimed ones. |
| Request Detail actions | Reviewer | Claim (Pending), Approve and Reject with reason (claimed by me, In Review). |

A header shows the current user and a Logout button. Route guards redirect to Login when the API returns 401.

### 3.2 Shared UI behavior

- **Validation:** each invalid field shows its own message and keeps the entered values (NFR-08).
- **Loading:** lists and detail views show a loading indicator while the API call is pending.
- **Empty states:** an empty list shows a short message (for example "No requests yet").
- **Errors:** API errors show a banner with the server's message; the UI never shows stack traces.
- Buttons that the current user may not use are hidden or disabled; this is convenience only, the backend always enforces the rule.

## 4. API conventions

- Base path `/api`; JSON request and response bodies; state-changing endpoints require `Content-Type: application/json`.
- Identity and role always come from the session, never from the request body, URL or a client-selected value.
- Success responses return the resource (or a list) as JSON.
- **Error shape:** `{ "error": { "code": "STRING_CODE", "message": "human readable" } }`, with field details in `error.fields` for validation errors.

| Status | Meaning |
|---|---|
| 400 | Validation failure (BR-01, BR-07) |
| 401 | Not logged in, session expired, or bad credentials |
| 403 | Logged in but the role or ownership rule forbids the operation |
| 404 | Resource does not exist, or belongs to another Requester (existence is not revealed) |
| 409 | Invalid state transition, or lost the claim race (BR-03, BR-04, BR-09) |

- **Safe error handling:** unexpected errors return 500 with a generic message and are logged on the server only. Responses never include passwords, hashes, session IDs or stack traces.
- Login failures return the same 401 message for unknown user and wrong password.

**Endpoint overview** (full request/response shapes are in the feature contracts):

| Method and path | Purpose | Feature |
|---|---|---|
| POST `/api/auth/login` | Log in | F-01 |
| POST `/api/auth/logout` | Log out | F-01 |
| GET `/api/auth/me` | Current user | F-01 |
| POST `/api/requests` | Submit a request | F-02 |
| GET `/api/requests` | Requester: own list. Reviewer: all (`?state=PENDING` for the queue, `?mine=true` for claimed) | F-02, F-03 |
| GET `/api/requests/:id` | Request detail | F-02, F-03 |
| POST `/api/requests/:id/claim` | Claim a Pending request | F-03 |
| POST `/api/requests/:id/approve` | Approve | F-04 |
| POST `/api/requests/:id/reject` | Reject, body `{ "reason": "..." }` | F-04 |
| GET `/api/health` | Health check for deployment | F-05 |

## 5. Role and permission matrix

| Operation | Anonymous | Requester | Reviewer |
|---|---|---|---|
| Log in | allowed | allowed | allowed |
| Log out, current user | 401 | allowed | allowed |
| Submit a request | 401 | allowed (becomes owner) | 403 |
| List requests | 401 | own requests only | all requests, read-only |
| View a request | 401 | own only (another Requester's: 404) | any request, read-only |
| Claim a request | 401 | 403 | only a Pending request not submitted by self; otherwise 409 (not Pending or race lost) or 403 (own request) |
| Approve a request | 401 | 403 | only the claiming Reviewer of an In Review request; other Reviewer 403; wrong state 409 |
| Reject a request (reason required) | 401 | 403 | same as Approve, plus 400 if the reason is blank |
| Edit a submitted request | 401 | not allowed in Sprint 1 | 403 |
| Edit or delete history entries | not available | not available | not available |

## 6. Authentication and session design

- **Credentials:** username and password. Passwords are hashed with bcrypt (cost factor set by `BCRYPT_ROUNDS`, 12 in normal use). Plaintext passwords are never stored or logged.
- **Session creation:** on valid login the server creates a Session row (random 256-bit ID, `expiresAt` = now + 8 hours) and sets a cookie with that ID: `HttpOnly`, `SameSite=Lax`, `Secure` in production, path `/`.
- **Expiry:** the 8 hour lifetime is fixed from login (no sliding renewal). An expired session is rejected with 401 and its row is deleted.
- **Current user:** `GET /api/auth/me` and every protected endpoint read the cookie, load the session and its user, and reject with 401 if the session is missing or expired.
- **Logout:** deletes the Session row and clears the cookie. A later request with the old cookie gets 401.
- **Cross-site protection:** the `SameSite=Lax` cookie and the JSON-only requirement on state-changing endpoints.
- Seeded accounts are enough for Sprint 1; there is no self-registration or password recovery.

## 7. Business-rule enforcement and concurrency

State changes are single conditional updates inside a transaction that also inserts the history entry:

| Operation | Conditional update | Result |
|---|---|---|
| Claim | set reviewer and state IN_REVIEW where id matches and state is PENDING | 1 row changed: success. 0 rows changed: 409. |
| Approve or reject | set state and reason where id matches, state is IN_REVIEW and reviewerId is the caller | 1 row changed: success. 0 rows: look up the request to return 404, 403 or 409. |

Because the database applies the condition atomically, two simultaneous claims cannot both succeed: exactly one updates a row and gets a history entry, the other gets 409 (BR-04, NFR-06). No priority or fairness rule is needed; whichever claim the database processes first wins.

## 8. Configuration and secrets

| Variable | Purpose | Example in `.env.example` |
|---|---|---|
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:password@localhost:5432/approvals` |
| PORT | API port | `3000` |
| NODE_ENV | development, test or production | `development` |
| SESSION_TTL_HOURS | Session lifetime | `8` |
| BCRYPT_ROUNDS | bcrypt cost factor | `12` |
| SEED_PASSWORD | Password for seeded demo accounts | `change-me-locally` |
| CLIENT_ORIGIN | Allowed UI origin in development | `http://localhost:5173` |

Real values live only in a local, git-ignored `.env` file or in the deployment secret store. `.env.example` contains placeholders only. No secret appears in client code.

## 9. Planned deployment (GCP)

This is a plan; the actual set-up happens in Lab 5 using the access details provided there.

| Concern | Plan |
|---|---|
| Packaging | One Docker image built in two stages: build the React UI, then run Express serving the static UI and `/api`. Three logical layers do not need three containers. |
| Hosting | Cloud Run runs the container. |
| Database | Cloud SQL for PostgreSQL; durable storage, so data survives restarts and redeployments. |
| Secrets | Secret Manager supplies `DATABASE_URL` and `SEED_PASSWORD` as environment variables. |
| Migrations | `prisma migrate deploy` runs on release before the new version takes traffic. |
| Delivery | A GitHub Actions pipeline builds and tests on pull requests, blocks merging on failure, and deploys accepted releases from `main`. |
| Health | `/api/health` is used for deployment checks. |

## 10. Test approach

| Level | Tool | Used for |
|---|---|---|
| Unit | Vitest | Validation rules, the state-transition table. |
| API and database integration | Supertest with a test database | Persistence, authentication, role and ownership checks, concurrent claims. |
| UI component | Vitest | Form validation messages. |
| End-to-end | Playwright | The submit, claim, approve and reject journeys and a forbidden-access case. |

## 11. Design decisions

| ID | Decision | Resolves |
|---|---|---|
| DD-01 | Server-side session stored in PostgreSQL, ID in an HttpOnly cookie. | Q-03 |
| DD-02 | Session lifetime 8 hours, absolute. | Q-03 |
| DD-03 | bcrypt for password hashing. | Q-03 |
| DD-04 | Business rules in a backend service layer; database constraints as a backstop. | BR-01 to BR-14 |
| DD-05 | Claims and decisions use a conditional update, checked by affected row count. | BR-04, NFR-06 |
| DD-06 | JSON REST under `/api` with a fixed error shape and status codes. | NFR-01, NFR-02 |
| DD-07 | Another Requester's request returns 404; role violations return 403. | NFR-02 |
| DD-08 | One container on Cloud Run with Cloud SQL and Secret Manager. | Deployment plan |
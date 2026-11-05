# Software Requirements Specification

## Sprint 1 Resolved decisions

Theme: 5. Workflow and Approval System. Context: a university department
handling internal requests.

| # | Decision | Resolution |
|---|----------|------------|
| D-01 | Roles | Requester and Reviewer. One role per account. |
| D-02 | Request categories | Fixed list: Funding, Purchase, Travel, Reimbursement. |
| D-03 | Request fields | Title, category, amount, justification. |
| D-04 | Reviewer assignment | Reviewers claim requests from a queue of unassigned requests. Claiming assigns the request to that reviewer. Each request has exactly one reviewer. |
| D-05 | Self-approval | A claim or decision is rejected if the reviewer is the request's requester (business rule). No account has both roles. |
| D-06 | Editing after submission | Locked in Sprint 1. Return and resubmission are Sprint 2. |
| D-07 | History | Append-only log entry per transition: actor, time, from-state, to-state, reason. |
| D-08 | Rejection reason | Required on Reject, optional on Approve. |
| D-09 | Sprint 1 states | Pending (unassigned), In Review, Approved, Rejected. Valid: Pending→In Review, In Review→Approved, In Review→Rejected. Everything else is rejected. |
| D-10 | Seed data | Two requesters and two reviewers. |
| D-11 | Stack | Frontend: React, TypeScript, Vite, React Router, Bootstrap. Backend: Node.js, Express, TypeScript. Database: PostgreSQL with Prisma ORM. Testing: Vitest and Supertest (unit, API/database integration, UI), Playwright (end-to-end). |
| D-12 | Terminology | "Reviewer" (matches the spec), not "approver". |
| D-13 | Unclaimed or unrelated decision | A reviewer who has not claimed a request cannot approve or reject it (403, no state change). |

Sprint 1 tests required: self-approval, unrelated/unclaimed reviewer
decision, requester using review operations, another requester's request,
invalid transition, concurrent claim.
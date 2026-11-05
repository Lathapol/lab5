# Feature Inventory

**Product:** Workflow and Approval System (university department) | **Version:** 0.1 | **Date:** 5 November 2026

Sprint 1 is deliberately grouped into four features plus one system responsibility, so that each Sprint 1 feature gets one complete engineering contract.

| ID | Feature / responsibility | Description | Requirements | Depends on | Sprint |
|---|---|---|---|---|---|
| F-01 | Authentication and access control | Login, logout, current user, role and ownership enforcement on the backend. | FR-01, FR-02, FR-03, BR-11, BR-12, NFR-01, NFR-02, NFR-03 | none | 1 |
| F-02 | Submit and track own requests | Requester submits a validated request and views their own list and detail. | FR-04, FR-05, FR-06, BR-01, BR-02, BR-08, NFR-08 | F-01 | 1 |
| F-03 | Review queue and claim | Reviewer views all requests read-only (with a queue view of Pending ones), claims a Pending request, lists their claimed requests. | FR-07, FR-08, FR-12, BR-03, BR-04, BR-06, NFR-06 | F-01, F-02 | 1 |
| F-04 | Decide request and record history | Assigned Reviewer approves or rejects (reason on reject); every transition is logged. | FR-09, FR-10, FR-11, BR-03, BR-05, BR-06, BR-07, BR-09, BR-10 | F-03 | 1 |
| F-05 | Persistence, seed data and setup (system responsibility) | PostgreSQL schema and migrations, reproducible seed accounts and requests, README setup. | NFR-04, NFR-07 | none | 1 |
| F-06 | Request history view | Detail view shows the history log. | FR-13 | F-04 | 2 |
| F-07 | Return and resubmission | Reviewer returns a request with a reason; Requester edits and resubmits. | FR-14, FR-15, BR-13 | F-04 | 2 |
| F-08 | Filtering and search | Filter and search lists by status, category, date range and text. | FR-16 | F-02, F-03 | 2 |
| F-09 | Second-stage approval | Requests above a threshold need a second, different Reviewer. | FR-17, BR-14 | F-04, F-07 | 3 |
| F-10 | Decision summary | Counts by status, category and Reviewer. | FR-18 | F-04 | 3 |
| F-11 | Hardening and usability | Failure handling, usability fixes, performance check, regression pass. | NFR-05, NFR-08 | all | 3 |
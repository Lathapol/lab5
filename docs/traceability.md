# Requirements Traceability

**Product:** Workflow and Approval System (university department) | **Version:** 0.1 | **Date:** 5 November 2026

Sprint 1 AC and TEST IDs are assigned in the Sprint 1 engineering contracts (Part E) and filled into the last column when those contracts are written. Later-sprint rows only need a feature and sprint now.

## Functional requirements

| Requirement | Feature | Sprint | Planned verification (level) | AC / TEST IDs |
|---|---|---|---|---|
| FR-01 | F-01 | 1 | API test: valid and invalid login | TBD in Part E |
| FR-02 | F-01 | 1 | API test: access rejected after logout | TBD in Part E |
| FR-03 | F-01 | 1 | API test: current-user response | TBD in Part E |
| FR-04 | F-02 | 1 | API/database test plus UI journey | TBD in Part E |
| FR-05 | F-02 | 1 | API test: own requests only | TBD in Part E |
| FR-06 | F-02 | 1 | API test: own detail; UI journey | TBD in Part E |
| FR-07 | F-03 | 1 | API test: Reviewer lists all requests; queue view shows Pending only | TBD in Part E |
| FR-08 | F-03 | 1 | API/database test plus UI journey | TBD in Part E |
| FR-09 | F-04 | 1 | API/database test plus UI journey | TBD in Part E |
| FR-10 | F-04 | 1 | API/database test: reason required | TBD in Part E |
| FR-11 | F-04 | 1 | Integration test: one history entry per transition | TBD in Part E |
| FR-12 | F-03 | 1 | API test: claimed list | TBD in Part E |
| FR-13 | F-06 | 2 | Specified in Sprint 2 contract | Sprint 2 |
| FR-14 | F-07 | 2 | Specified in Sprint 2 contract | Sprint 2 |
| FR-15 | F-07 | 2 | Specified in Sprint 2 contract | Sprint 2 |
| FR-16 | F-08 | 2 | Specified in Sprint 2 contract | Sprint 2 |
| FR-17 | F-09 | 3 | Specified in Sprint 3 contract | Sprint 3 |
| FR-18 | F-10 | 3 | Specified in Sprint 3 contract | Sprint 3 |

## Business rules

| Requirement | Feature | Sprint | Planned verification (level) | AC / TEST IDs |
|---|---|---|---|---|
| BR-01 | F-02 | 1 | Unit test (validation) and API test | TBD in Part E |
| BR-02 | F-02 | 1 | API/database test: initial state | TBD in Part E |
| BR-03 | F-03, F-04 | 1 | Unit test: transition table; API test: invalid transition | TBD in Part E |
| BR-04 | F-03 | 1 | Concurrent integration test | TBD in Part E |
| BR-05 | F-04 | 1 | API test: unclaimed Reviewer rejected | TBD in Part E |
| BR-06 | F-03, F-04 | 1 | Unit/API test: self-claim and self-decision rejected | TBD in Part E |
| BR-07 | F-04 | 1 | Unit test and API test: reject without reason | TBD in Part E |
| BR-08 | F-02 | 1 | API test: edit of submitted request rejected | TBD in Part E |
| BR-09 | F-04 | 1 | API test: second decision rejected, result unchanged | TBD in Part E |
| BR-10 | F-04 | 1 | Integration test: no edit/delete route for history | TBD in Part E |
| BR-11 | F-01 | 1 | API tests: cross-requester access denied; Reviewer can read but not claim or decide another Reviewer's request | TBD in Part E |
| BR-12 | F-01 | 1 | Seed/data test: one role per account | TBD in Part E |
| BR-13 | F-07 | 2 | Specified in Sprint 2 contract | Sprint 2 |
| BR-14 | F-09 | 3 | Specified in Sprint 3 contract | Sprint 3 |

## Non-functional requirements

| Requirement | Feature | Sprint | Planned verification (level) | AC / TEST IDs |
|---|---|---|---|---|
| NFR-01 | F-01 | 1 | API test over all protected endpoints | TBD in Part E |
| NFR-02 | F-01 | 1 | API tests: role and ownership denial | TBD in Part E |
| NFR-03 | F-01 | 1 | Integration test inspecting stored passwords | TBD in Part E |
| NFR-04 | F-05 | 1 | Integration test plus manual restart check | TBD in Part E |
| NFR-05 | F-11 | 3 | Timed API test with 1,000 seeded requests | Sprint 3 |
| NFR-06 | F-03 | 1 | Concurrent integration test | TBD in Part E |
| NFR-07 | F-05 | 1 | Fresh-clone dry run (manual, documented) | TBD in Part E |
| NFR-08 | F-02, F-11 | 1, 3 | UI component test and one end-to-end test | TBD in Part E |

## Coverage and changes

- **Uncovered requirements:** none. Every FR, BR and NFR maps to a feature and a sprint.
- **Approved changes since baseline:** none (baseline version 0.1).
- **Open questions affecting later rows:** Q-01 (resubmission routing, F-07) and Q-02 (second-stage threshold, F-09); see the SRS.
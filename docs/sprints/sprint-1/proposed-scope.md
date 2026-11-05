# Workflow and Approval System

The assigned theme is Workflow and Approval System. This proposed Sprint 1 scope should be checked against the course group specification.

A requester submits a request with a title and justification. The system saves it as Pending and lets the requester retrieve it and see its status. An approver can open a pending request and approve or reject it. The system saves the decision and the identity of the approver. The requester can then retrieve the updated status.

| Operation | Requester | Approver |
| --- | --- | --- |
| Submit a request | Yes | Outside this proposed slice |
| View requests | Own requests | Requests awaiting review |
| Decide a request | Forbidden | Pending requests only |

The backend derives identity and role from authentication and checks access on every protected operation. Only Pending requests can transition to Approved or Rejected. A second decision must fail without changing the saved result, including when two decisions race.

Sprint 1 verification covers login and logout, successful submission and retrieval, a saved decision, a rejected second decision, and denied access when a requester attempts to decide a request or read another requester's record.

The request category, approver assignment rules and technical stack are open decisions. Confirm these against the group specification before finalizing the feature contracts.

# A-16V - A-16R Execution Retry Requirements

## Status

A16V_A16R_EXECUTION_RETRY_REQUIREMENTS_STATUS=READY_FOR_FUTURE_RETRY_AFTER_APPLY_VERIFY

A-16V does not run A-16R. It only defines the requirements for a future retry after the A-16V SQL candidate is manually applied and verified.

## Required Future Marker

Future A-16R retry still requires this exact marker in a fresh owner prompt:

`APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

No other session id is accepted.

## Required Evidence Before Retry

- A16V_STATUS=CANDIDATE_READY_NOT_APPLIED for this phase.
- A16V apply/verify future phase must record PASS.
- Session id: `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Staging people: 102.
- Staging relationships: 134.
- Validation errors: 0.
- Dry-run blockers: 0.
- Duplicate unresolved: 0.
- Duplicate needs_review: 0.
- Duplicate create_new: 8.
- Production UI visible at `/admin/exports/import`.
- A-16T audit/rollback/idempotency schema verified PASS.
- A-16U locked runtime wiring still present.

## Runtime Gate

Current runtime gate remains closed:

- `canRunOfficialImport=false`
- Official import button disabled.
- `A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED`
- No RPC call.
- No `POST /official-import` call that reaches real import execution.
- No real genealogy writes.

## Retry Stop Conditions

Stop a future retry immediately if:

- Any verification evidence is stale or missing.
- The session id changes.
- Any duplicate returns to unresolved or needs_review.
- Any validation error or dry-run blocker reappears.
- The audit batch already exists in a non-completed/non-voided state.
- The owner marker is missing, mistyped or references a different session.
- The UI or API reports `canRunOfficialImport=false` for any blocker other than an explicitly understood pre-execution state.

## Current Phase Boundary

A-16V prepared the branch candidate only. It did not run SQL, did not call RPC, did not call `POST /official-import`, did not write people/relationships/families/layout/tree/revision/profile data, did not deploy and did not push.

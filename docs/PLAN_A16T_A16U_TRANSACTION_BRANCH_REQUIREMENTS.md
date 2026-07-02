# A-16T - A-16U Transaction Branch Requirements

Status: `A16T_A16U_REQUIREMENTS_STATUS=READY_FOR_A16U_AFTER_SCHEMA_APPLY_VERIFY`

Marker: `A-16T-A16U-TRANSACTION-BRANCH-REQUIREMENTS`

## Goal

This document defines what A-16U must prove before the official Gia Pha 4 import
transaction execution branch can be opened.

## A-16U Preconditions

A-16U must not start unless:

- A-16T SQL candidate has been owner-applied and verified in a separate phase.
- Verification SQL reports PASS for tables, columns, RLS, no anon/public access,
  no auto import trigger and idempotency guards.
- Runtime still starts fail-closed before the owner provides a new execution
  marker.
- Session-specific preflight is revalidated for
  `2af4bfb6-a20e-453e-9804-1b8c0afbdd68` or the exact future session.

## Transaction Branch Requirements

A-16U must implement or verify:

```text
A16U_REQUIREMENT_ALL_OR_NOTHING_TRANSACTION=YES
A16U_REQUIREMENT_IDEMPOTENCY_BY_IMPORT_SESSION_ID=YES
A16U_REQUIREMENT_AUDIT_BATCH_INSERT=YES
A16U_REQUIREMENT_ROLLBACK_MANIFEST_INSERT=YES
A16U_REQUIREMENT_IMPORT_COMPLETION_MARKER=YES
A16U_REQUIREMENT_POST_IMPORT_COUNTS=YES
```

Function/route result must include:

- `created_people_count`;
- `created_relationship_count`;
- `audit_record_count`;
- `rollback_manifest_count`;
- `import_session_status`.

## Runtime Gate Requirements

A-16U must keep official import blocked unless all gates pass:

- confirm marker matches the session;
- confirm session id matches route/body;
- validation errors are zero;
- dry-run blockers are zero;
- duplicate unresolved is zero;
- duplicate needs_review is zero;
- manifest hash matches;
- session belongs to current owner;
- session has not already completed import;
- idempotency guard has no existing running/completed batch.

## Retry and Failure Rules

- Do not blindly retry after failure.
- If a batch is `running` or `completed`, reject repeated execution.
- If a batch is `failed` or `rollback_required`, require owner review before
  any new attempt.
- If rollback manifest is missing, block execution.

## Boundary

A-16T does not implement the A-16U transaction branch. It only creates the
schema candidate and requirements.

```text
A16T_A16U_RPC_CALLED=NO
A16T_A16U_OFFICIAL_IMPORT_POST_CALLED=NO
A16T_A16U_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16T_A16U_CAN_RUN_OFFICIAL_IMPORT=false
A16T_A16U_OFFICIAL_IMPORT_BUTTON=DISABLED
```

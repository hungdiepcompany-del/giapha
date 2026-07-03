# A-16U - Verify Runbook

Status: `A16U_VERIFY_RUNBOOK_STATUS=READY`

Marker: `A-16U-VERIFY-RUNBOOK`

## Purpose

This runbook defines what must be verified before a later A-16R-RUN-RETRY phase
may execute the official Gia Pha 4 import exactly once. This document is not an
execution approval and does not run import.

## Preconditions Before A-16R-RUN-RETRY

```text
A16U_RUNBOOK_A16T_APPLY_VERIFY_PASS_REQUIRED=YES
A16U_RUNBOOK_A16U_BRANCH_READY_REQUIRED=YES
A16U_RUNBOOK_SESSION_PREFLIGHT_PASS_REQUIRED=YES
A16U_RUNBOOK_SESSION_ID_REQUIRED=2af4bfb6-a20e-453e-9804-1b8c0afbdd68
A16U_RUNBOOK_MARKER_REQUIRED=APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68
```

Session preflight evidence expected before execution:

```text
A16U_RUNBOOK_STAGING_PEOPLE=102
A16U_RUNBOOK_STAGING_RELATIONSHIPS=134
A16U_RUNBOOK_VALIDATION_ERRORS=0
A16U_RUNBOOK_DRY_RUN_BLOCKERS=0
A16U_RUNBOOK_DUPLICATE_UNRESOLVED=0
A16U_RUNBOOK_DUPLICATE_NEEDS_REVIEW=0
A16U_RUNBOOK_DUPLICATE_CREATE_NEW=8
```

## One-Time Execution Checklist

The later execution phase must:

- use only session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`;
- require the exact A-16R marker;
- confirm validation errors = 0;
- confirm dry-run blockers = 0;
- confirm duplicate unresolved = 0;
- confirm duplicate needs_review = 0;
- verify manifest hash before writing;
- create or reuse the idempotency batch safely;
- reject already running/completed batches;
- record `official_import_batches`;
- record `official_import_rollback_manifests`;
- return `audit_batch_id`, `rollback_manifest_id`, `created_people_count` and
  `created_relationship_count`.

## Post-Import Verification Checklist

After a future real execution, verify:

- import session status changed only once;
- created people count matches expected;
- created relationship count matches expected;
- audit batch status is `completed`;
- rollback manifest exists and references the batch/session;
- idempotency key prevents rerun;
- no duplicate unresolved/needs_review blocker reappears;
- no raw personal rows were printed to logs.

## Failure Handling

If post-verify fails:

- do not retry blindly;
- mark the batch as failed or rollback_required according to the result;
- inspect rollback manifest before any manual remediation;
- stop and request owner review;
- do not run deploy/push as part of remediation.

## Boundary

```text
A16U_RUNBOOK_RPC_CALLED=NO
A16U_RUNBOOK_OFFICIAL_IMPORT_POST_CALLED=NO
A16U_RUNBOOK_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16U_RUNBOOK_DB_PUSH_STATUS=NOT_RUN
A16U_RUNBOOK_MIGRATION_REPAIR_STATUS=NOT_RUN
A16U_RUNBOOK_SEED_STATUS=NOT_RUN
A16U_RUNBOOK_DEPLOY_STATUS=NOT_DEPLOYED
A16U_RUNBOOK_PUSH_STATUS=NOT_PUSHED
```

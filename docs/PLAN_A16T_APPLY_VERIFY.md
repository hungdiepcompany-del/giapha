# A-16T-APPLY-VERIFY - Manual Apply Verification

Status: `A16T_APPLY_VERIFY_STATUS=BLOCKED_NO_ANON_PUBLIC_GRANT_FAILED_PENDING_HARDENING_FIX`

Marker: `A-16T-APPLY-VERIFY`

## Scope

This phase records the manual apply/verify gate for the A-16T official import
audit, rollback and idempotency schema. It does not apply SQL and does not run
official import.

This document also records the grant/RLS hardening blocker after owner supplied
A-16T verification output. The schema exists and core checks passed, but
`A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT` failed because inherited/default table
grants still exist for anon/PUBLIC.

## Baseline

```text
A16T_BASELINE_COMMIT=fa8a21d
A16T_BASELINE_STATUS=A16T_STATUS=CANDIDATE_READY_NOT_APPLIED
A16T_SQL_CANDIDATE_PATH=db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_SUPABASE_MIRROR_PATH=supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_VERIFICATION_SQL_PATH=db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql
```

## Owner Evidence Status

Owner evidence now identifies the remaining blocker:

```text
A16T_OWNER_APPLY_EVIDENCE_STATUS=OWNER_MANUAL_APPLY_REPORTED
A16T_OWNER_VERIFY_EVIDENCE_STATUS=PARTIAL_PASS_WITH_GRANT_BLOCKER
A16T_OWNER_VERIFICATION_RESULT=BLOCKED_FORBIDDEN_GRANTS
A16T_TABLES_EXIST=PASS
A16T_BATCH_REQUIRED_COLUMNS_EXIST=PASS
A16T_ROLLBACK_REQUIRED_COLUMNS_EXIST=PASS
A16T_IDEMPOTENCY_UNIQUE_GUARD_EXISTS=PASS
A16T_ROLLBACK_MANIFEST_UNIQUE_GUARD_EXISTS=PASS
A16T_RLS_ENABLED=PASS
A16T_AUTHENTICATED_POLICIES_EXIST=PASS
A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT=FAIL
A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT_DETAILS={"forbidden_grant_count":14,"forbidden_policy_count":0}
A16T_NO_AUTO_IMPORT_TRIGGER=PASS
A16T_RPC_EXISTS_BUT_EXECUTION_NOT_VERIFIED_BY_THIS_CHECK=PASS
A16T_APPLY_VERIFY_DO_NOT_FAKE_PASS=YES
```

Because anon/PUBLIC grants still exist, this phase cannot record
`A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED`.

## Required Owner Evidence

Owner must manually apply:

```text
db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
```

Then owner must run:

```text
db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql
```

Only owner-provided verification output can promote this phase to:

```text
A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED
```

## Verification Checklist

Current evidence status:

```text
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BATCHES_VERIFIED=YES
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_ROLLBACK_MANIFESTS_VERIFIED=YES
A16T_APPLY_VERIFY_IDEMPOTENCY_GUARD_VERIFIED=YES
A16T_APPLY_VERIFY_IDEMPOTENCY_KEY_VERIFIED=YES
A16T_APPLY_VERIFY_RLS_ENABLED_VERIFIED=YES
A16T_APPLY_VERIFY_AUTHENTICATED_POLICIES_VERIFIED=YES
A16T_APPLY_VERIFY_NO_ANON_PUBLIC_VERIFIED=NO_FORBIDDEN_GRANT_COUNT_14
A16T_APPLY_VERIFY_FORBIDDEN_POLICY_COUNT=0
A16T_APPLY_VERIFY_NO_AUTO_IMPORT_TRIGGER_VERIFIED=YES
A16T_APPLY_VERIFY_RPC_EXECUTION_OPENED=NO
A16T_APPLY_VERIFY_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
```

Required PASS evidence later must include:

- `official_import_batches` exists.
- `official_import_rollback_manifests` exists.
- idempotency unique guard exists.
- `idempotency_key` exists or equivalent constraint/index is present.
- RLS is enabled for the new tables.
- no anon/public grants or policies exist.
- no auto import trigger exists.
- RPC execution is not opened.
- no real people/relationships/families/layout/tree/revision/profile writes.

## Runtime State

Runtime remains fail-closed:

```text
A16T_APPLY_VERIFY_RUNTIME_FAIL_CLOSED=YES
A16T_APPLY_VERIFY_CAN_RUN_OFFICIAL_IMPORT=false
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BUTTON=DISABLED
A16T_APPLY_VERIFY_RPC_CALLED=NO
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_POST_CALLED=NO
```

## A-16U Bundle Stop

A-16U did not start because A-16T still has the grant/RLS hardening blocker:

```text
A16U_STATUS=NOT_STARTED_A16T_GRANT_RLS_BLOCKED
A16U_PHASES_STARTED=NO
A16U_SQL_CANDIDATE_CREATED=NO
A16U_SQL_CANDIDATE_PATH=N/A_A16T_GRANT_RLS_BLOCKED
A16U_SQL_MIRROR_BYTE_FOR_BYTE=N/A_A16T_GRANT_RLS_BLOCKED
A16U_RUNTIME_WIRING_STATUS=NOT_STARTED_A16T_GRANT_RLS_BLOCKED
A16U_VERIFY_RUNBOOK_STATUS=NOT_STARTED_A16T_GRANT_RLS_BLOCKED
```

## Hardening Candidate

The hardening fix candidate is ready but not applied:

```text
A16T_GRANT_RLS_HARDENING_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED
A16T_GRANT_RLS_HARDENING_FIX_SQL_CANDIDATE_PATH=db/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql
A16T_GRANT_RLS_HARDENING_FIX_SUPABASE_MIRROR_PATH=supabase/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql
A16T_GRANT_RLS_HARDENING_FIX_VERIFICATION_SQL_PATH=db/checks/20260702_check_a16t_grant_rls_hardening_fix.sql
```

## Boundary

```text
A16T_APPLY_VERIFY_SQL_RUN_BY_CODEX=NO
A16T_APPLY_VERIFY_DB_PUSH_STATUS=NOT_RUN
A16T_APPLY_VERIFY_MIGRATION_REPAIR_STATUS=NOT_RUN
A16T_APPLY_VERIFY_SEED_STATUS=NOT_RUN
A16T_APPLY_VERIFY_DEPLOY_STATUS=NOT_DEPLOYED
A16T_APPLY_VERIFY_PUSH_STATUS=NOT_PUSHED
A16T_APPLY_VERIFY_EXCEL_STATUS=NOT_COMMITTED
A16T_APPLY_VERIFY_SECRET_STORAGE_STATE_STATUS=NOT_COMMITTED
```

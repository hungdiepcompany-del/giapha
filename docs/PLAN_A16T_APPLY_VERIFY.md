# A-16T-APPLY-VERIFY - Manual Apply Verification

Status: `A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED`

Marker: `A-16T-APPLY-VERIFY-PASS`

## Scope

This phase records owner-confirmed manual apply and verification PASS for the
A-16T official import audit, rollback and idempotency schema plus the A-16T
grant/RLS hardening fix. Codex did not run SQL, did not DB push and did not run
official import.

## Baseline

```text
A16T_BASELINE_COMMIT=fa8a21d
A16T_BASELINE_STATUS=A16T_STATUS=CANDIDATE_READY_NOT_APPLIED
A16T_SQL_CANDIDATE_PATH=db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_SUPABASE_MIRROR_PATH=supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_VERIFICATION_SQL_PATH=db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql
A16T_GRANT_RLS_HARDENING_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED
A16T_GRANT_RLS_HARDENING_FIX_SQL_CANDIDATE_PATH=db/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql
A16T_GRANT_RLS_HARDENING_FIX_SUPABASE_MIRROR_PATH=supabase/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql
A16T_GRANT_RLS_HARDENING_FIX_VERIFICATION_SQL_PATH=db/checks/20260702_check_a16t_grant_rls_hardening_fix.sql
```

## Owner Evidence Status

Owner reported manual apply in Supabase SQL Editor:

```text
A16T_OWNER_APPLY_EVIDENCE_STATUS=PASS_OWNER_MANUAL_APPLY_REPORTED
A16T_OWNER_VERIFY_EVIDENCE_STATUS=PASS_OWNER_VERIFICATION_OUTPUT_PROVIDED
A16T_OWNER_VERIFICATION_RESULT=PASS
A16T_OWNER_EVIDENCE_PLACEHOLDER_DETECTED=NO
A16T_APPLY_VERIFY_DO_NOT_FAKE_PASS=YES
```

Owner applied:

- `db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql`
- `db/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql`

Owner ran:

- `db/checks/20260702_check_a16t_grant_rls_hardening_fix.sql`
- `db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql`

The PASS evidence includes an idempotency unique guard and `idempotency_key`
for the official import batch table.

## Verification Evidence

Grant/RLS hardening verification:

```text
A16T_GRANT_FIX_TABLES_EXIST=PASS details={"table_count":2}
A16T_GRANT_FIX_NO_ANON_PUBLIC_TABLE_GRANTS=PASS details={"forbidden_table_grant_count":0}
A16T_GRANT_FIX_NO_ANON_PUBLIC_SEQUENCE_GRANTS=PASS details={"related_sequence_count":0,"forbidden_sequence_grant_count":0}
A16T_GRANT_FIX_NO_ANON_PUBLIC_POLICIES=PASS details={"forbidden_policy_count":0}
A16T_GRANT_FIX_RLS_STILL_ENABLED=PASS details={"rls_enabled_count":2}
A16T_GRANT_FIX_AUTHENTICATED_POLICIES_STILL_EXIST=PASS details={"authenticated_policy_count":6}
A16T_GRANT_FIX_NO_AUTO_IMPORT_TRIGGER=PASS details={"trigger_count":0}
A16T_GRANT_FIX_RPC_EXECUTION_STILL_NOT_PUBLIC=PASS details={"forbidden_rpc_execute_grant_count":0}
```

Audit/rollback/idempotency schema verification:

```text
A16T_TABLES_EXIST=PASS details={"table_count":2}
A16T_BATCH_REQUIRED_COLUMNS_EXIST=PASS details={"matched_column_count":19}
A16T_ROLLBACK_REQUIRED_COLUMNS_EXIST=PASS details={"matched_column_count":12}
A16T_IDEMPOTENCY_UNIQUE_GUARD_EXISTS=PASS details={"unique_indexes":["official_import_batches_idempotency_key_unique_idx","official_import_batches_import_session_unique_idx","official_import_batches_pkey"]}
A16T_ROLLBACK_MANIFEST_UNIQUE_GUARD_EXISTS=PASS details={"unique_indexes":["official_import_rollback_batch_unique_idx","official_import_rollback_manifests_pkey","official_import_rollback_session_unique_idx"]}
A16T_RLS_ENABLED=PASS details={"rls_enabled_count":2}
A16T_AUTHENTICATED_POLICIES_EXIST=PASS details={"policy_count":6}
A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT=PASS details={"forbidden_grant_count":0,"forbidden_policy_count":0}
A16T_NO_AUTO_IMPORT_TRIGGER=PASS details={"trigger_count":0}
A16T_RPC_EXISTS_BUT_EXECUTION_NOT_VERIFIED_BY_THIS_CHECK=PASS details={"rpc_count":1}
```

## Verification Checklist

```text
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BATCHES_VERIFIED=YES
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_ROLLBACK_MANIFESTS_VERIFIED=YES
A16T_APPLY_VERIFY_IDEMPOTENCY_GUARD_VERIFIED=YES
A16T_APPLY_VERIFY_IDEMPOTENCY_KEY_VERIFIED=YES
A16T_APPLY_VERIFY_RLS_ENABLED_VERIFIED=YES
A16T_APPLY_VERIFY_AUTHENTICATED_POLICIES_VERIFIED=YES
A16T_APPLY_VERIFY_NO_ANON_PUBLIC_VERIFIED=YES
A16T_APPLY_VERIFY_FORBIDDEN_GRANT_COUNT=0
A16T_APPLY_VERIFY_FORBIDDEN_POLICY_COUNT=0
A16T_APPLY_VERIFY_NO_AUTO_IMPORT_TRIGGER_VERIFIED=YES
A16T_APPLY_VERIFY_RPC_EXECUTION_OPENED=NO
A16T_APPLY_VERIFY_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
```

## Runtime State

Runtime remains fail-closed:

```text
A16T_APPLY_VERIFY_RUNTIME_FAIL_CLOSED=YES
A16T_APPLY_VERIFY_CAN_RUN_OFFICIAL_IMPORT=false
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BUTTON=DISABLED
A16T_APPLY_VERIFY_RPC_CALLED=NO
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_POST_CALLED=NO
```

## A-16U Bundle Handoff

A-16T PASS allows A-16U candidate preparation, but does not run import:

```text
A16T_PASS_TO_A16U_BUNDLE_STATUS=PASS_A16T_VERIFIED_A16U_LOCKED_BRANCH_READY
A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED
A16U_SQL_CANDIDATE_REQUIRED=NO
A16U_SQL_CANDIDATE_CREATED=NO
A16U_SQL_CANDIDATE_PATH=N/A_SQL_NOT_REQUIRED_A16T_SCHEMA_VERIFIED
A16U_SQL_MIRROR_BYTE_FOR_BYTE=N/A_SQL_NOT_REQUIRED_A16T_SCHEMA_VERIFIED
A16U_RUNTIME_WIRING_STATUS=LOCKED_FAIL_CLOSED
A16U_VERIFY_RUNBOOK_STATUS=READY
```

## Boundary

```text
A16T_APPLY_VERIFY_SQL_RUN_BY_CODEX=NO
A16T_APPLY_VERIFY_DB_PUSH_STATUS=NOT_RUN
A16T_APPLY_VERIFY_MIGRATION_REPAIR_STATUS=NOT_RUN
A16T_APPLY_VERIFY_SEED_STATUS=NOT_RUN
A16T_APPLY_VERIFY_RPC_CALLED=NO
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_POST_CALLED=NO
A16T_APPLY_VERIFY_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16T_APPLY_VERIFY_DEPLOY_STATUS=NOT_DEPLOYED
A16T_APPLY_VERIFY_PUSH_STATUS=NOT_PUSHED
A16T_APPLY_VERIFY_EXCEL_STATUS=NOT_COMMITTED
A16T_APPLY_VERIFY_SECRET_STORAGE_STATE_STATUS=NOT_COMMITTED
```

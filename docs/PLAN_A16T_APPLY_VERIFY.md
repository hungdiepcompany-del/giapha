# A-16T-APPLY-VERIFY - Manual Apply Verification

Status: `A16T_APPLY_VERIFY_STATUS=BLOCKED_MISSING_OWNER_APPLY_VERIFY_EVIDENCE`

Marker: `A-16T-APPLY-VERIFY`

## Scope

This phase records the manual apply/verify gate for the A-16T official import
audit, rollback and idempotency schema. It does not apply SQL and does not run
official import.

## Baseline

```text
A16T_BASELINE_COMMIT=fa8a21d
A16T_BASELINE_STATUS=A16T_STATUS=CANDIDATE_READY_NOT_APPLIED
A16T_SQL_CANDIDATE_PATH=db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_SUPABASE_MIRROR_PATH=supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_VERIFICATION_SQL_PATH=db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql
```

## Owner Evidence Status

Owner evidence has not been provided in this prompt.

```text
A16T_OWNER_APPLY_EVIDENCE_STATUS=MISSING
A16T_OWNER_VERIFY_EVIDENCE_STATUS=MISSING
A16T_OWNER_VERIFICATION_RESULT=NOT_PROVIDED
A16T_APPLY_VERIFY_DO_NOT_FAKE_PASS=YES
```

Because there is no owner-run verification evidence, this phase cannot record
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
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BATCHES_VERIFIED=NO_OWNER_EVIDENCE
A16T_APPLY_VERIFY_OFFICIAL_IMPORT_ROLLBACK_MANIFESTS_VERIFIED=NO_OWNER_EVIDENCE
A16T_APPLY_VERIFY_IDEMPOTENCY_GUARD_VERIFIED=NO_OWNER_EVIDENCE
A16T_APPLY_VERIFY_IDEMPOTENCY_KEY_VERIFIED=NO_OWNER_EVIDENCE
A16T_APPLY_VERIFY_RLS_ENABLED_VERIFIED=NO_OWNER_EVIDENCE
A16T_APPLY_VERIFY_NO_ANON_PUBLIC_VERIFIED=NO_OWNER_EVIDENCE
A16T_APPLY_VERIFY_NO_AUTO_IMPORT_TRIGGER_VERIFIED=NO_OWNER_EVIDENCE
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

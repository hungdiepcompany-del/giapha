# A-16T - Schema Apply / Verify Runbook

Status: `A16T_SCHEMA_APPLY_VERIFY_STATUS=READY_FOR_OWNER_REVIEW_NOT_APPLIED`

Marker: `A-16T-SCHEMA-APPLY-VERIFY-RUNBOOK`

## Scope

This runbook is for a later owner-approved manual apply/verify phase. A-16T
does not apply SQL.

## Candidate Files

```text
A16T_SQL_CANDIDATE_PATH=db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_SUPABASE_MIRROR_PATH=supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql
A16T_SQL_MIRROR_BYTE_FOR_BYTE=PASS
A16T_VERIFICATION_SQL_PATH=db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql
```

## Future Apply Preconditions

Before any future apply:

- owner must approve a separate A-16T apply phase;
- target Supabase project must be confirmed;
- backup/rollback readiness must be confirmed;
- candidate and mirror must remain byte-for-byte identical;
- SQL must be reviewed for no destructive data operations;
- no DB push, migration repair or seed should be inferred from this phase.

## Verification SQL

`db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql`
is SELECT-only and is intended for owner-run post-apply verification. It checks:

- candidate tables exist;
- required columns exist;
- unique/idempotency constraints exist;
- rollback manifest unique guards exist;
- RLS is enabled;
- authenticated policies exist;
- no anon/public policies or grants exist;
- no auto official import trigger exists;
- RPC execution is not opened by this schema candidate.

```text
A16T_VERIFICATION_SQL_SELECT_ONLY=YES
A16T_SQL_APPLY_STATUS=NOT_RUN
A16T_SQL_VERIFY_STATUS=NOT_RUN_IN_THIS_PHASE
```

## No-go Conditions

Do not apply if:

- candidate and mirror differ;
- SQL includes destructive data operations;
- anon/public grants appear;
- broad grants appear;
- RLS disable appears;
- service-role bypass is required;
- owner marker/target/backup is missing.

## Boundary

```text
A16T_SCHEMA_APPLY_DB_PUSH_STATUS=NOT_RUN
A16T_SCHEMA_APPLY_MIGRATION_REPAIR_STATUS=NOT_RUN
A16T_SCHEMA_APPLY_SEED_STATUS=NOT_RUN
A16T_SCHEMA_APPLY_RPC_CALLED=NO
A16T_SCHEMA_APPLY_OFFICIAL_IMPORT_POST_CALLED=NO
A16T_SCHEMA_APPLY_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16T_SCHEMA_APPLY_DEPLOY_STATUS=NOT_DEPLOYED
A16T_SCHEMA_APPLY_PUSH_STATUS=NOT_PUSHED
```

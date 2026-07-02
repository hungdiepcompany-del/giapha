# A-16S - SQL Apply / Verify Runbook

Status: `A16S_SQL_APPLY_VERIFY_STATUS=SAFE_BLOCKED_NO_SQL_CANDIDATE`

Marker: `A-16S-SQL-APPLY-VERIFY-RUNBOOK`

## Result

A-16S did not create a SQL candidate, so there is nothing to apply or verify in
this phase.

```text
A16S_SQL_CANDIDATE_CREATED=NO
A16S_SQL_CANDIDATE_PATH=NOT_CREATED_BECAUSE_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT
A16S_SUPABASE_MIRROR_PATH=NOT_CREATED_BECAUSE_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT
A16S_SQL_MIRROR_BYTE_FOR_BYTE=N/A_SAFE_BLOCKED_NO_SQL_CANDIDATE
A16S_SQL_APPLY_STATUS=NOT_RUN
A16S_SQL_VERIFY_STATUS=NOT_RUN_NO_SQL_CANDIDATE
```

## Future Apply Preconditions

Do not apply any A-16S SQL until a separate future phase provides:

- a real NOT_APPLIED SQL candidate;
- byte-for-byte `db/migrations` and `supabase/migrations` mirror;
- owner review and explicit manual apply marker;
- target Supabase project confirmation;
- backup and rollback readiness;
- read-only verification SQL;
- no anon/public execute grant;
- no broad grant;
- no RLS disable;
- no `SECURITY DEFINER` unless a separate security review blocks or approves it
  explicitly.

## Required Future Verification

If a future SQL candidate exists, verification must prove:

- function exists;
- function remains `SECURITY INVOKER` unless separately approved;
- fixed `search_path`;
- no `EXECUTE` for anon/public;
- idempotency guard by `import_session_id`;
- audit/revision persistence;
- rollback manifest persistence;
- import completion marker;
- no automatic execution trigger.

## Boundary

```text
A16S_SQL_RUN_STATUS=NOT_RUN
A16S_DB_PUSH_STATUS=NOT_RUN
A16S_MIGRATION_REPAIR_STATUS=NOT_RUN
A16S_SEED_STATUS=NOT_RUN
A16S_RPC_CALLED=NO
A16S_OFFICIAL_IMPORT_POST_CALLED=NO
A16S_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
A16S_DEPLOY_STATUS=NOT_DEPLOYED
A16S_PUSH_STATUS=NOT_PUSHED
```

# A-16T-GRANT-RLS-HARDENING-FIX

Status: `A16T_GRANT_RLS_HARDENING_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED`

Marker: `A-16T-GRANT-RLS-HARDENING-FIX`

## Goal

Create a NOT_APPLIED SQL candidate that removes anon/PUBLIC table grants from
the two A-16T official import audit/rollback tables after owner verification
reported the remaining grant/RLS blocker.

This phase does not run SQL and does not run official import.

## Owner Verification Baseline

Owner reported:

```text
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
```

Meaning:

- A-16T schema, columns, unique guards, RLS and authenticated policies are
  present.
- There are no forbidden anon/public policies.
- Remaining blocker is anon/PUBLIC grants on:
  - `public.official_import_batches`
  - `public.official_import_rollback_manifests`

## Candidate Artifacts

```text
A16T_GRANT_RLS_HARDENING_FIX_SQL_CANDIDATE_CREATED=YES
A16T_GRANT_RLS_HARDENING_FIX_SQL_CANDIDATE_PATH=db/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql
A16T_GRANT_RLS_HARDENING_FIX_SUPABASE_MIRROR_PATH=supabase/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql
A16T_GRANT_RLS_HARDENING_FIX_SQL_MIRROR_BYTE_FOR_BYTE=PASS
A16T_GRANT_RLS_HARDENING_FIX_VERIFICATION_SQL_PATH=db/checks/20260702_check_a16t_grant_rls_hardening_fix.sql
```

The SQL candidate contains:

```text
A16T_GRANT_RLS_HARDENING_FIX_CANDIDATE
SQL_CANDIDATE_STATUS=NOT_APPLIED
DO_NOT_RUN_AUTOMATICALLY
OWNER_MANUAL_REVIEW_REQUIRED
```

## Grant Fix

The candidate revokes anon/PUBLIC table privileges only:

```text
A16T_GRANT_RLS_HARDENING_FIX_REVOKE_ANON_PUBLIC_COVERED=YES
A16T_GRANT_RLS_HARDENING_FIX_REVOKE_BATCHES_ANON_PUBLIC=YES
A16T_GRANT_RLS_HARDENING_FIX_REVOKE_ROLLBACK_ANON_PUBLIC=YES
A16T_GRANT_RLS_HARDENING_FIX_AUTHENTICATED_POLICIES_PRESERVED=YES
A16T_GRANT_RLS_HARDENING_FIX_NO_NEW_GRANT=YES
```

The A-16T tables use UUID primary keys with `gen_random_uuid()`, so no
table-owned identity/serial sequence is expected. The verification SQL still
checks for related sequences and anon/PUBLIC sequence grants if a future schema
revision introduces them.

## Verification

`db/checks/20260702_check_a16t_grant_rls_hardening_fix.sql` is SELECT-only and
checks:

- no anon/PUBLIC table grants remain on both A-16T tables;
- no anon/PUBLIC sequence grants remain on related table-owned sequences, if
  such sequences exist;
- forbidden policy count remains zero;
- RLS remains enabled;
- authenticated policies still exist;
- no auto import trigger exists;
- RPC execution remains not public.

```text
A16T_GRANT_RLS_HARDENING_FIX_VERIFICATION_SQL_SELECT_ONLY=YES
A16T_GRANT_RLS_HARDENING_FIX_SQL_VERIFY_STATUS=NOT_RUN_IN_THIS_PHASE
```

## Runtime State

Runtime remains locked:

```text
A16T_GRANT_RLS_HARDENING_FIX_RUNTIME_FAIL_CLOSED=YES
A16T_GRANT_RLS_HARDENING_FIX_CAN_RUN_OFFICIAL_IMPORT=false
A16T_GRANT_RLS_HARDENING_FIX_OFFICIAL_IMPORT_BUTTON=DISABLED
A16T_GRANT_RLS_HARDENING_FIX_RPC_CALLED=NO
A16T_GRANT_RLS_HARDENING_FIX_OFFICIAL_IMPORT_POST_CALLED=NO
A16T_GRANT_RLS_HARDENING_FIX_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE
```

## Boundary

```text
A16T_GRANT_RLS_HARDENING_FIX_SQL_RUN_STATUS=NOT_RUN
A16T_GRANT_RLS_HARDENING_FIX_DB_PUSH_STATUS=NOT_RUN
A16T_GRANT_RLS_HARDENING_FIX_MIGRATION_REPAIR_STATUS=NOT_RUN
A16T_GRANT_RLS_HARDENING_FIX_SEED_STATUS=NOT_RUN
A16T_GRANT_RLS_HARDENING_FIX_DEPLOY_STATUS=NOT_DEPLOYED
A16T_GRANT_RLS_HARDENING_FIX_PUSH_STATUS=NOT_PUSHED
A16T_GRANT_RLS_HARDENING_FIX_EXCEL_STATUS=NOT_COMMITTED
A16T_GRANT_RLS_HARDENING_FIX_SECRET_STORAGE_STATE_STATUS=NOT_COMMITTED
```

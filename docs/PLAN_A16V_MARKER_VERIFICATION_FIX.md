# A-16V-MARKER-VERIFICATION-FIX

## Status

A16V_MARKER_VERIFICATION_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED

A16V_APPLY_VERIFY_STATUS=BLOCKED_A16V_MARKER_FAIL_PENDING_FIX

## Owner Verification Evidence

Owner ran the A-16V verification after manual apply of the 0016 candidate. Only one row failed:

- `A16V marker = FAIL`

All other transaction, schema and security checks reported PASS:

- all-or-nothing batch branch;
- completed batch branch;
- people insert branch;
- family insert branch;
- family parents insert branch;
- family children insert branch;
- revision audit branch;
- rollback manifest;
- idempotency guard;
- idempotency unique guard;
- rollback unique guard;
- not `SECURITY DEFINER`;
- fixed `search_path=public, pg_temp`;
- no anon/public execute grants;
- no auto import trigger;
- `official_import_batches` exists;
- `official_import_rollback_manifests` exists.

Because the marker row is still FAIL, this phase must not record A-16V apply/verify PASS.

## Cause

The verification SQL checked the marker using `pg_get_functiondef(...)`. The exact token `A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_CANDIDATE` was present in the SQL file header, but SQL file header comments are not persisted in database metadata after apply. The existing function comment did not contain the exact marker token either.

## Fix

Chosen fix: `COMMENT ON FUNCTION`.

New candidate:

`db/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql`

Supabase mirror:

`supabase/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql`

The 0017 candidate only updates function metadata/comment so the marker is persisted in the database and can be read by `obj_description(...)`. It does not change transaction logic, permissions, RLS, grants, triggers or data.

The A-16V verification SQL was updated to read the marker from either:

- `pg_get_functiondef(...)`; or
- `obj_description(function_oid, 'pg_proc')`.

The verification SQL remains SELECT-only and does not call the function/RPC.

## Boundary

This phase did not run SQL, did not DB push, did not migration repair, did not seed, did not call RPC, did not POST `/official-import`, did not run official import, did not retry import, did not write people/relationships/families/layout/tree/revision/profile data, did not deploy and did not push.

Official import remains locked:

- `canRunOfficialImport=false`;
- official import button disabled;
- runtime remains fail-closed.

## Owner Next Step

After owner manually applies 0017 in Supabase SQL Editor, rerun:

`db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql`

Only after all rows PASS may a later phase record A-16V apply/verify PASS. A-16R must not be retried from this phase.

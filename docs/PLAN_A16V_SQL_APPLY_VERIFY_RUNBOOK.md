# A-16V - SQL Apply Verify Runbook

## Status

A16V_SQL_APPLY_VERIFY_RUNBOOK_STATUS=READY_FOR_OWNER_REVIEW_NOT_APPLIED

This runbook is documentation only. A-16V did not run SQL, did not run `supabase db push`, did not call RPC, did not call `POST /official-import`, did not run official import, did not deploy and did not push.

## Candidate Files

- Source SQL candidate: `db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql`
- Supabase mirror: `supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql`
- SELECT-only verification SQL: `db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql`

The source and Supabase mirror must stay byte-for-byte identical.

## Manual Apply Conditions

Owner must explicitly approve a later apply/verify phase before running the candidate SQL.

Before manual apply:

- Confirm production is stable.
- Confirm backup/rollback plan has been reviewed.
- Confirm A-16T audit/rollback/idempotency schema is applied and verified PASS.
- Confirm no concurrent official import is running.
- Confirm the candidate SQL still targets `public.a16p_tx_execute_giapha4_official_import`.
- Confirm no anon/public EXECUTE grant will be opened.
- Confirm no service role key is pasted into app code or docs.

## Verification After Manual Apply

After owner manually applies the SQL in Supabase SQL Editor, run:

`db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql`

Required PASS evidence:

- Canonical RPC exists.
- Function is not `SECURITY DEFINER`.
- Function has fixed `search_path=public, pg_temp`.
- No anon/public EXECUTE grant.
- `official_import_batches` exists.
- `official_import_rollback_manifests` exists.
- Idempotency unique guard exists.
- Rollback unique guard exists.
- Candidate function body contains audit batch, rollback manifest, people/family/revision insert branch tokens.
- No auto import trigger.

If any verification row fails, stop and do not retry A-16R.

## No-Go Checklist

Do not continue if:

- Verification SQL is not PASS.
- A-16T status is not PASS.
- Runtime still reports an unexpected blocker other than the intentional A-16V apply/verify blocker.
- Session id is not exactly `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.
- Validation errors are not 0.
- Dry-run blockers are not 0.
- Duplicate unresolved or needs_review is not 0.
- Owner has not re-issued the exact A-16R execution marker in a new prompt.

## Current Phase Result

A16V_APPLY_VERIFY_STATUS=NOT_RUN_CANDIDATE_ONLY

Official import remains locked. `canRunOfficialImport=false`. The official import button remains disabled.

# A-16V-APPLY-VERIFY

## Status

A16V_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED

A16V_REAL_TRANSACTION_BRANCH_READY=YES

A16R_RETRY_ALLOWED_AFTER_A16V=YES

This phase records owner-provided manual apply and verification evidence for the A-16V real transaction branch candidate and the 0017 marker verification fix. It is verification/readiness only, not official import execution.

Codex did not run SQL, did not run `supabase db push`, did not run migration repair, did not seed, did not call RPC, did not call `POST /official-import`, did not run official import, did not retry A-16R, did not write people/relationships/families/layout/tree/revision/profile data, did not deploy and did not push.

## Owner Evidence

Owner reported manual apply on Supabase for:

- `db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql`
- `db/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql`

Owner reran:

`db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql`

Raw owner verification output:

```csv
verification_scope,check_name,result
A16V_REAL_TRANSACTION_BRANCH_VERIFY,A16V marker,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,all or nothing batch,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,completed batch branch,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,family children insert branch,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,family insert branch,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,family parents insert branch,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,fixed search_path public pg_temp,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,idempotency guard,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,idempotency unique guard exists,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,no anon/public execute grants,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,no auto import trigger,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,not security definer,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,official_import_batches exists,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,official_import_rollback_manifests exists,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,people insert branch,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,revision audit branch,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,rollback manifest,PASS
A16V_REAL_TRANSACTION_BRANCH_VERIFY,rollback unique guard exists,PASS
```

## PASS Evidence Matrix

- A16V marker: PASS
- all or nothing batch: PASS
- completed batch branch: PASS
- people insert branch: PASS
- family insert branch: PASS
- family parents insert branch: PASS
- family children insert branch: PASS
- revision audit branch: PASS
- rollback manifest: PASS
- idempotency guard: PASS
- idempotency unique guard exists: PASS
- rollback unique guard exists: PASS
- no anon/public execute grants: PASS
- no auto import trigger: PASS
- not security definer: PASS
- fixed search_path public pg_temp: PASS
- official_import_batches exists: PASS
- official_import_rollback_manifests exists: PASS

## Readiness Result

A-16V is now verified as ready for a future A-16R retry gate:

- A16V_REAL_TRANSACTION_BRANCH_READY=YES
- A16R_RETRY_ALLOWED_AFTER_A16V=YES

This does not run A-16R and does not execute official import. The future A-16R retry still requires a separate owner prompt with the exact session-specific marker:

`APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68`

## Runtime Boundary

Current application runtime remains guarded:

- Official import was not called in this phase.
- RPC was not called in this phase.
- Real genealogy tables were not written in this phase.
- Official import button was not used for execution in this phase.

Next safe step: a separate A-16R retry prompt may be prepared only after owner explicitly provides the required session marker again.

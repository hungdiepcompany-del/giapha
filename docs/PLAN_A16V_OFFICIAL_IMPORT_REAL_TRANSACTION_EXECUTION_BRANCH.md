# A-16V - Official Import Real Transaction Execution Branch Candidate

## Status

A16V_STATUS=CANDIDATE_READY_NOT_APPLIED

This phase creates a reviewable SQL candidate and runtime fail-closed contract for the real Gia Pha 4 official import transaction branch.

No SQL was run in this phase. No `supabase db push` was run. No RPC was called. No `POST /official-import` was called. No people, relationships, families, layout, tree, revision or profile rows were written by this phase. No deploy or push was performed.

## Scope

- Candidate SQL: `db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql`
- Supabase mirror: `supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql`
- Verification SQL: `db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql`
- Canonical RPC name: `public.a16p_tx_execute_giapha4_official_import`
- Runtime remains fail-closed with `canRunOfficialImport=false`.
- Official import button remains disabled.

## Preflight Evidence Carried Forward

- Session id: `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`
- Staging people: 102
- Staging relationships: 134
- Validation errors: 0
- Dry-run blockers: 0
- Duplicate unresolved: 0
- Duplicate needs_review: 0
- Duplicate create_new: 8
- Production UI visible at `/admin/exports/import`
- A-16T apply/verify: PASS
- A-16U locked transaction branch: ready but not executed
- A-16R retry status: blocked at execution gate because the real transaction branch was not ready

## Candidate Contract

The A-16V SQL candidate upgrades the existing canonical RPC contract instead of creating a parallel RPC.

Required properties:

- All-or-nothing transaction behavior through a single PostgreSQL function call.
- Idempotency guard via `official_import_batches.import_session_id` and `idempotency_key`.
- Audit batch persistence in `official_import_batches`.
- Rollback manifest persistence in `official_import_rollback_manifests`.
- Created IDs captured for people, families, family parents, family children and revisions.
- No `SECURITY DEFINER`.
- Fixed `search_path=public, pg_temp`.
- No anon/public EXECUTE grant.
- No auto import trigger.
- Runtime blocker remains `A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED` until owner manual apply and verification PASS happen in a later phase.

## Runtime Boundary

The runtime source now exposes the A-16V candidate in the blocked response contract:

- `A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_CANDIDATE`
- `A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED`
- `canRunOfficialImport=false`
- `official import button disabled`

The service and route still do not call `.rpc(...)` and still do not write real genealogy tables.

## Safety Notes

The candidate SQL contains the future write branch, but this phase did not execute it. Applying and verifying this SQL requires a separate owner-approved A-16V apply/verify phase.

Next safe phase: A-16V-APPLY-VERIFY, followed only then by a renewed A-16R execution retry if owner provides the exact session-specific execution marker again.

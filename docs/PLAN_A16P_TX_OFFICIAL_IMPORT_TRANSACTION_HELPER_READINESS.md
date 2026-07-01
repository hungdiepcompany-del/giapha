# PLAN A-16P-TX - Official Import Transaction Helper / RPC Schema Readiness

Marker: `A-16P-TX`

Status: `A16P_TX_STATUS=PASS_WITH_BLOCKER_TRANSACTION_NOT_APPLIED`

SQL status: `SQL_CANDIDATE_READY_NOT_APPLIED`

## Current Blocker

A-16P currently blocks official Gia Phả 4 import with:

`A16P_BLOCKED_TRANSACTION_HELPER_MISSING`

A-16P-TX resolves the design gap only as a reviewed SQL/RPC candidate and
readiness package. It does not apply DB and does not run official import.

## SQL Candidate

Canonical candidate:

`db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql`

Supabase mirror:

`supabase/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql`

Verification SQL:

`db/checks/20260701_check_a16p_tx_official_import_transaction_helper.sql`

The canonical and Supabase mirror files must stay byte-for-byte identical.

Candidate header includes:

- `A-16P-TX - Official Import Transaction Helper / RPC Schema Readiness`.
- `SQL_CANDIDATE_STATUS=NOT_APPLIED`.
- `DO_NOT_RUN_AUTOMATICALLY`.
- `OWNER_MANUAL_REVIEW_REQUIRED`.

## RPC / Function Contract

Candidate function:

`public.a16p_tx_execute_giapha4_official_import`

Inputs:

- `p_import_session_id uuid`.
- `p_confirm_marker text`.
- `p_confirm_manifest_hash text default null`.
- `p_confirm_review_pack_hash text default null`.
- `p_confirm_validation_errors_resolved boolean default false`.
- `p_confirm_rollback_reviewed boolean default false`.
- `p_confirm_audit_reviewed boolean default false`.
- `p_dry_run_only boolean default true`.

Return shape is JSONB:

- `ok`.
- `status`.
- `import_session_id`.
- `can_run_official_import`.
- `blocked_reasons`.
- `would_create_people_count`.
- `would_create_relationship_count`.
- `created_people_count`.
- `created_relationship_count`.
- `rollback_manifest_preview`.
- `audit_manifest_preview`.
- `pii_printed`.

## Transaction Status

Candidate is fail-closed:

- `p_dry_run_only` defaults to true.
- If `p_dry_run_only=false`, the function still returns blocker
  `REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX`.
- `can_run_official_import=false`.
- `created_people_count=0`.
- `created_relationship_count=0`.
- No real execution branch is open in A-16P-TX.

Status:

`PASS_WITH_BLOCKER_TRANSACTION_NOT_APPLIED`

## No-Go Conditions

The candidate records or blocks on:

- session id missing.
- session not found or not owned by current profile.
- user/profile missing.
- permission missing.
- future execution marker missing:
  `APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`.
- validation errors not confirmed resolved.
- rollback review not confirmed.
- audit review not confirmed.
- session already imported/completed/cancelled/expired-like.
- manifest hash mismatch.
- unresolved parser/validation blockers.
- duplicate candidates unresolved.
- parent-child relationship candidates unresolved.
- parent self-reference.
- relationship target missing.
- review pack hash present but not enforceable by schema.
- real execution branch requested in A-16P-TX.

## Permission Boundary

Candidate uses existing permission helpers only:

- `public.current_profile_id()`.
- `public.has_permission('imports.create')`.
- `public.has_permission('people.create')`.
- `public.has_permission('relationships.create')`.
- `public.has_permission('permissions.manage')`.

No new permission seed is created. If a separate official-import permission is
needed, future phase must record:

`A16P_TX_PERMISSION_SEED_REQUIRED`

## Relationship Policy

- Only parent-child relationships from `Mã GP Bố` / `Mã GP Mẹ` are in scope.
- No spouse/couple creation from `Hôn nhân`.
- No duplicate relationship creation.
- No self-parent.
- No relationship when parent or child is unresolved.

## People Import Policy

- Future official import may create new people from staged candidates only after
  owner-approved path is explicit.
- No update existing person unless a future explicit owner-decision field exists.
- No auto merge duplicate.
- Duplicate candidates without owner decision block import.

## Rollback / Audit Contract

Detailed contract:

`docs/PLAN_A16P_TX_ROLLBACK_AUDIT_MANIFEST_CONTRACT.md`

Current blockers:

- `A16P_TX_AUDIT_TABLE_OR_SERVICE_MISSING`.
- `A16P_TX_AUDIT_OR_ROLLBACK_PERSISTENCE_MISSING`.
- `A16P_TX_SCHEMA_INSUFFICIENT_FOR_SAFE_TRANSACTION`.

Schema has `import_write_manifests.rollback_plan` and `created_record_ids`, but
A-16P-TX does not write them. Existing `revisions.action` does not include an
official import batch action, so the candidate does not fake audit safety.

## Runtime Alignment

Runtime candidate now records the contract name:

`public.a16p_tx_execute_giapha4_official_import`

Runtime remains locked:

- POST route remains gated by `A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED`.
- Default is false.
- No validation script calls POST official import.
- No validation script calls RPC.
- `canRunOfficialImport=false`.
- UI button disabled.
- A-16P blocker remains visible and adds:
  `BLOCKED_TRANSACTION_HELPER_NOT_APPLIED`.

## Manual Apply Instructions

Future manual apply requires a new phase and explicit marker:

`APPROVE_A16P_TX_RPC_MANUAL_SQL_APPLY`

Owner/operator steps in that future phase:

1. Review the canonical SQL candidate.
2. Confirm the Supabase target project and account.
3. Apply manually via Supabase SQL Editor only if approved.
4. Do not run `supabase db push`.
5. Do not run `supabase db push --dry-run`.
6. Do not run `supabase migration repair`.
7. After apply, run the SELECT-only verification SQL.
8. Record verification output without secrets or PII.

Future session-specific execution requires a separate later marker:

`APPROVE_A16Q_OFFICIAL_IMPORT_SESSION_EXECUTION`

## SQL Candidate Rollback Plan

If the candidate is manually applied in a future phase and must be reverted:

- Drop only function `public.a16p_tx_execute_giapha4_official_import(...)`.
- Do not drop real data tables.
- Do not delete people/person records.
- Do not delete relationships/families.
- Do not drop import staging tables.

## Guardrails Held

- No DB apply in A-16P-TX.
- No SQL run in A-16P-TX.
- No `supabase db push`.
- No `supabase db push --dry-run`.
- No `supabase migration repair`.
- No seed.
- No official import execution.
- No POST official import call.
- No RPC call.
- No people/person writes.
- No relationship/family writes.
- No layout/tree/revision writes.
- No deploy.
- No push.
- No Excel/storage state/cookie/token/secret committed.
- No raw personal rows logged.

## Next Phase

Owner review SQL candidate. If approved, provide:

`APPROVE_A16P_TX_RPC_MANUAL_SQL_APPLY`

Then open a separate apply/verify phase:

`A-16P-TX-APPLY-VERIFY`

Only after apply and SELECT-only verification PASS should the team consider
`A-16Q` session-specific execution approval.

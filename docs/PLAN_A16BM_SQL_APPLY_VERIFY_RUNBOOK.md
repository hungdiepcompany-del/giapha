# A-16BM - SQL Apply Verify Runbook

Status:
`A16BM_RUNBOOK_STATUS=OWNER_REVIEW_REQUIRED_NOT_APPLIED`.

Candidate:
`A16BM_RUNBOOK_MIGRATION_CANDIDATE=db/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql`.

Verification SQL:
`A16BM_RUNBOOK_VERIFICATION_SQL=db/checks/20260711_check_a16bm_official_import_row_lock_rls_fix.sql`.

A-16R retry:
`A16BM_A16R_RETRY_NEXT=NO`.

## Owner apply boundary

This runbook is for a later, separate owner-approved SQL apply/verify phase.
A-16BM only creates the candidate and verification SQL. It does not run SQL,
does not apply the migration, and does not retry the import.

Required owner approval marker for a later apply phase:
`APPROVE_A16BM_APPLY_ROW_LOCK_RLS_FIX_CANDIDATE`.

## Safe verification expectations

The SELECT-only verification SQL must return these booleans:

- `authenticated_has_select_on_import_sessions`
- `authenticated_has_update_on_import_sessions`
- `authenticated_has_select_on_import_write_manifests`
- `authenticated_has_update_on_import_write_manifests`
- `import_sessions_rls_enabled`
- `import_write_manifests_rls_enabled`
- `import_sessions_force_rls`
- `import_write_manifests_force_rls`
- `existing_preview_policy_preserved`
- `new_import_sessions_official_update_policy_exists`
- `new_session_policy_includes_owner_approved_and_write_completed`
- `new_session_policy_owner_profile_scoped`
- `new_manifest_update_policy_exists`
- `new_manifest_policy_includes_required_states`
- `new_manifest_policy_parent_session_owner_scoped`
- `no_anon_or_public_policies`
- `no_anon_or_public_table_grants`
- `rpc_remains_security_invoker`
- `no_automatic_import_trigger`
- `a16bm_row_lock_rls_fix_verified`

Expected verification classification after apply:
`A16BM_EXPECTED_POST_APPLY_VERIFY=a16bm_row_lock_rls_fix_verified_TRUE`.

## Not allowed in this runbook

`A16BM_RUNBOOK_POST_OFFICIAL_IMPORT_ALLOWED=NO`.

`A16BM_RUNBOOK_IMPORT_RPC_ALLOWED=NO`.

`A16BM_RUNBOOK_SELECT_FOR_UPDATE_ALLOWED=NO`.

`A16BM_RUNBOOK_SESSION_STATE_CHANGE_ALLOWED=NO`.

`A16BM_RUNBOOK_REAL_GENEALOGY_WRITE_ALLOWED=NO`.

`A16BM_RUNBOOK_SUPABASE_DB_PUSH_ALLOWED=NO`.

`A16BM_RUNBOOK_MIGRATION_REPAIR_ALLOWED=NO`.

`A16BM_RUNBOOK_SEED_ALLOWED=NO`.

`A16BM_RUNBOOK_DEPLOY_ALLOWED=NO`.

## Next gate after successful apply/verify

If the owner separately approves and applies the candidate, and if the
SELECT-only verification returns `a16bm_row_lock_rls_fix_verified=true`, the
next phase should still be read-only:

`A16BM_NEXT_PHASE_AFTER_APPLY_VERIFY=A16BN_POST_APPLY_READ_ONLY_RLS_AND_DOWNSTREAM_RPC_RISK_RECONCILIATION_NO_IMPORT`.

That phase should verify the downstream genealogy-table INSERT grant/RLS risks
before any separate A-16R retry is considered.

# A-16BO - SQL Apply Verify Runbook

Status:
`A16BO_RUNBOOK_STATUS=OWNER_REVIEW_REQUIRED_NOT_APPLIED`.

Candidate:
`A16BO_RUNBOOK_MIGRATION_CANDIDATE=db/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql`.

Verification SQL:
`A16BO_RUNBOOK_VERIFICATION_SQL=db/checks/20260711_check_a16bo_revoke_anon_import_staging_grants_and_policy_scope.sql`.

A-16R retry:
`A16R_IMPORT_RETRY_NEXT=NO`.

Required owner approval marker for a later apply phase:
`APPROVE_A16BO_APPLY_REVOKE_ANON_IMPORT_STAGING_GRANTS`.

## Owner apply boundary

This runbook is for a later, separate owner-approved SQL apply/verify phase.
A-16BO only creates a candidate and SELECT-only verification SQL. It does not
run SQL, apply the migration, or retry the import.

## Safe verification expectations

The SELECT-only verification SQL must return:

- `forbidden_anon_public_table_grant_count`
- `forbidden_anon_public_policy_count`
- `no_anon_or_public_table_grants`
- `no_anon_or_public_policies`
- `authenticated_has_select_on_import_sessions`
- `authenticated_has_update_on_import_sessions`
- `authenticated_has_select_on_import_write_manifests`
- `authenticated_has_update_on_import_write_manifests`
- `import_sessions_rls_enabled`
- `import_write_manifests_rls_enabled`
- `a16bm_import_sessions_policy_exists`
- `a16bm_import_write_manifests_policy_exists`
- `a16bm_session_policy_semantics_pass`
- `a16bm_manifest_policy_semantics_pass`
- `rpc_remains_security_invoker`
- `no_automatic_import_trigger`
- `a16bo_revoke_anon_import_staging_grants_verified`

Expected verification classification after apply:
`A16BO_EXPECTED_POST_APPLY_VERIFY=a16bo_revoke_anon_import_staging_grants_verified_TRUE`.

Policy deparser tolerance:
`A16BO_POLICY_VERIFICATION_NORMALIZATION=PG_POLICIES_DEPARSE_TOLERANT_NO_PUBLIC_PREFIX_NO_IN_TEXT_DEPENDENCY`.

## Not allowed in this runbook

`A16BO_RUNBOOK_POST_OFFICIAL_IMPORT_ALLOWED=NO`.

`A16BO_RUNBOOK_IMPORT_RPC_ALLOWED=NO`.

`A16BO_RUNBOOK_SELECT_FOR_UPDATE_ALLOWED=NO`.

`A16BO_RUNBOOK_SESSION_STATE_CHANGE_ALLOWED=NO`.

`A16BO_RUNBOOK_REAL_GENEALOGY_WRITE_ALLOWED=NO`.

`A16BO_RUNBOOK_SUPABASE_DB_PUSH_ALLOWED=NO`.

`A16BO_RUNBOOK_MIGRATION_REPAIR_ALLOWED=NO`.

`A16BO_RUNBOOK_SEED_ALLOWED=NO`.

`A16BO_RUNBOOK_DEPLOY_ALLOWED=NO`.

## Next gate after successful apply/verify

If the owner separately approves and applies the candidate, and if the
SELECT-only verification returns
`a16bo_revoke_anon_import_staging_grants_verified=true`, the next phase should
still be read-only:

`A16BO_NEXT_PHASE_AFTER_APPLY_VERIFY=A16BP_POST_APPLY_READ_ONLY_RECONCILIATION_NO_IMPORT`.

That phase should reconcile downstream official-import write RLS and idempotency
state before any separate A-16R retry is considered.

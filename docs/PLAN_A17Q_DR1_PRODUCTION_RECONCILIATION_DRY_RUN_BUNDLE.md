# A-17Q-DR1 - Production Reconciliation Dry-Run Bundle

Date: 2026-07-13

Status:
`A17Q_DR1_STATUS=PASS_PRODUCTION_DRY_RUN_BUNDLE_PREPARED_NOT_EXECUTED`

## Scope

This phase prepares the exact owner-reviewable production dry-run SQL statement
and post-dry-run SELECT-only verifier for
`public.execute_admin_a17q_legacy_family_reconciliation`.

Codex did not execute SQL, call the RPC, mutate data, run reconciliation, change
runtime code, deploy or push.

## Baseline

- `TX1R_EVIDENCE_COMMIT=e04238c`
- `MIGRATION_SHA256=9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66`
- `EXECUTOR_EXISTS=YES`
- `SELECT_ONLY_VERIFIER_PASSED=YES_OWNER_PROVIDED`
- `COMPLETED_RECONCILIATION_BATCH_COUNT=0`
- `RECONCILIATION_EXECUTED=NO`

## RPC Signature

- `RPC_NAME=public.execute_admin_a17q_legacy_family_reconciliation`
- `RPC_SIGNATURE=p_owner_approval_marker text, p_decision_pack_sha256 text, p_approved_group_plan_sha256 text, p_role_correction_plan_sha256 text, p_excluded_scope_sha256 text, p_forecast_sha256 text, p_idempotency_key text, p_confirm_backup_reviewed boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_confirm_excluded_scope_reviewed boolean, p_dry_run_only boolean`
- `RPC_RETURN_TYPE=jsonb`
- `RPC_SECURITY_MODE=SECURITY_INVOKER`
- `RPC_SEARCH_PATH=public, auth, pg_temp`

## Dry-Run SQL

- `DRY_RUN_SQL_FILE=db/manual/20260713_a17q_dr1_production_reconciliation_dry_run.sql`
- `DRY_RUN_CALL_COUNT=1`
- `DRY_RUN_FLAG_TRUE=YES`
- `NON_DRY_RUN_CALL_PRESENT=NO`
- `OWNER_APPROVAL_MARKER=A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED`
- `DECISION_PACK_SHA256=777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0`
- `APPROVED_GROUP_PLAN_SHA256=7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740`
- `ROLE_CORRECTION_PLAN_SHA256=ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f`
- `EXCLUDED_SCOPE_SHA256=7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61`
- `FORECAST_SHA256=4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3`
- `DRY_RUN_IDEMPOTENCY_KEY=A17Q_DR1_DRY_RUN_20260713_E04238C_001`
- `CONFIRM_BACKUP_REVIEWED=TRUE`
- `CONFIRM_ROLLBACK_REVIEWED=TRUE`
- `CONFIRM_AUDIT_REVIEWED=TRUE`
- `CONFIRM_EXCLUDED_SCOPE_REVIEWED=TRUE`

The static checker verifies the dry-run branch returns before any
`family_reconciliation_batches`, rollback manifest, revision audit or genealogy
mutation statement can run.

## Post-Dry-Run Verifier

- `POST_DRY_RUN_VERIFIER_FILE=db/checks/20260713_check_a17q_dr1_post_production_reconciliation_dry_run.sql`
- `POST_DRY_RUN_VERIFIER_SELECT_ONLY=YES`
- `POST_DRY_RUN_VERIFIER_CALLS_EXECUTOR=NO`
- `UUID_ARRAY_OPERATOR_FIX=A17Q_DR2_FIX1`

The verifier checks:

- `COMPLETED_RECONCILIATION_BATCH_COUNT_REMAINS=0`
- `DECISION_PACK_BATCH_COUNT_REMAINS=0`
- `ROLLBACK_MANIFEST_COUNT_REMAINS=0`
- `A17Q_AUDIT_REVISION_COUNT_REMAINS=0`
- `DRY_RUN_IDEMPOTENCY_STATE_COUNT_REMAINS=0`
- `GENEALOGY_BASELINE_REMAINS=74/140/73`
- `EXCLUDED_SCOPE_UNCHANGED=YES`
- `DELETED_SCOPE_UNCHANGED=YES`

A-17Q-DR2-FIX1 corrected the excluded-family UUID membership predicate after
the first authenticated dry-run found PostgreSQL error `42883`:
`operator does not exist: uuid = uuid[]`. The verifier now uses
`ANY(COALESCE((select excluded_family_ids from expected), ARRAY[]::uuid[]))`
instead of a scalar UUID comparison against a UUID-array subquery. The verifier
remains SELECT-only and still does not call the reconciliation executor.

## Expected Dry-Run Result

- `EXECUTION_ALLOWED=true`
- `DRY_RUN=true`
- `MUTATION_APPLIED=false`
- `APPROVED_GROUP_COUNT=21`
- `APPROVED_FAMILY_COUNT=57`
- `SURVIVOR_COUNT=21`
- `VOID_FAMILY_COUNT=36`
- `CHILD_MEMBERSHIP_MOVE_COUNT=36`
- `CHILD_MEMBERSHIP_PRESERVED_COUNT=57`
- `CHILD_MEMBERSHIP_LOST_COUNT=0`
- `PARENT_MEMBERSHIP_DEACTIVATION_COUNT=72`
- `ROLE_CORRECTION_PLAN_COUNT=36`
- `ROLE_CORRECTION_APPLIED_TO_SURVIVOR_COUNT=16`
- `ROLE_CORRECTION_SUPERSEDED_BY_VOID_COUNT=20`
- `EXPECTED_ACTIVE_POST_STATE=38/68/73`
- `EXPECTED_FORECAST=74/140/73_TO_38/68/73`

## Safety

- `SQL_EXECUTED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`
- `RECONCILIATION_EXECUTED=NO`
- `RUNTIME_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Validation

- `VALIDATION_SUMMARY=PASS`
- `npm.cmd run check:a17q-dr1-production-reconciliation-dry-run-bundle` - PASS
- Targeted A17Q/A17P checks - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `git diff --check` - PASS
- `git diff --cached --check` - PASS

## Next Action

`NEXT_ACTION=A17Q_DR2_OWNER_REVIEW_AND_MANUAL_PRODUCTION_DRY_RUN`

`EXPECTED_SUCCESS_STATUS=PASS_PRODUCTION_DRY_RUN_BUNDLE_PREPARED_NOT_EXECUTED`

# A-17O-TX1R - Grouped Import Executor Manual Apply Verification

## Status

- `A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED`
- `A17SQL_O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY`
- `SOURCE_COMMIT=0f02c93`
- `MIGRATION_FILE=db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql`
- `SUPABASE_MIRROR_FILE=supabase/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql`
- `MIGRATION_SHA256=87EE4675746D948C3B32E8E7809A5945F8EA153EC2A6107355EF3E271E3DD4B2`
- `MIRROR_MATCH=YES`
- `MIGRATION_APPLIED=YES_OWNER_MANUAL_PRODUCTION`
- `MANUAL_PRODUCTION_APPLY_RECORDED=YES`

## Production Verifier Evidence

- `VERIFIER_FILE=db/checks/20260713_check_a17o_tx1_grouped_official_import_transaction_executor.sql`
- `VERIFIER_SELECT_ONLY=YES`
- `VERIFIER_ALL_REQUIRED_CHECKS_PASS=YES`
- `VERIFIER_EXECUTED_BY_OWNER=YES`
- `SQL_EXECUTED_BY_PHASE=NO`
- `VERIFIER_RERUN_BY_CODEX=NO`

Owner-provided production verifier results record that the SELECT-only verifier
passed after the owner manually applied migration 0025 to the correct Gia Pha
Supabase production project. This repository phase records that evidence only.
It does not execute SQL, rerun the verifier, call RPCs, deploy, or change
runtime importer code.

## Function And Grant Results

- `NEW_GROUPED_EXECUTOR_NAME=public.a17o_tx_execute_grouped_giapha4_official_import`
- `NEW_GROUPED_EXECUTOR_EXISTS=YES`
- `OLD_EXECUTOR_NAME=public.a16p_tx_execute_giapha4_official_import`
- `OLD_EXECUTOR_PRESERVED=YES`
- `OLD_EXECUTOR_SIGNATURE_UNCHANGED=YES`
- `SECURITY_MODE=SECURITY_INVOKER`
- `SECURITY_INVOKER=YES`
- `FIXED_SEARCH_PATH=YES`
- `RETURN_TYPE=jsonb`
- `VOLATILITY=VOLATILE`
- `AUTHENTICATED_EXECUTE_COUNT=1`
- `ANON_EXECUTE_COUNT=0`
- `PUBLIC_EXECUTE_COUNT=0`

Grouped executor signature:

```text
p_import_session_id uuid,
p_confirm_marker text,
p_confirm_manifest_hash text,
p_confirm_review_pack_hash text,
p_grouped_plan jsonb,
p_idempotency_key text,
p_mutation_plan_hash text,
p_confirm_validation_errors_resolved boolean,
p_confirm_rollback_reviewed boolean,
p_confirm_audit_reviewed boolean,
p_dry_run_only boolean
```

## Safeguards

- `GROUPED_PAYLOAD_CONTRACT_PRESENT=YES`
- `IDEMPOTENCY_TABLE_EXISTS=YES`
- `IDEMPOTENCY_RLS_ENABLED=YES`
- `IDEMPOTENCY_POLICIES_EXIST=YES`
- `IDEMPOTENCY_CONSTRAINTS_EXIST=YES`
- `MUTATION_PLAN_HASH_CONSTRAINT_EXISTS=YES`
- `ROLLBACK_GROUPED_SUMMARY_CONTRACT_EXISTS=YES`
- `COMPLETED_PRODUCTION_SESSION_STILL_NON_EXECUTABLE=YES`

## Production Baseline

- `ACTIVE_FAMILY_COUNT_AFTER=74`
- `ACTIVE_PARENT_MEMBERSHIP_COUNT_AFTER=140`
- `ACTIVE_CHILD_MEMBERSHIP_COUNT_AFTER=73`
- `ACTIVE_FAMILY_COUNT=74`
- `ACTIVE_PARENT_MEMBERSHIP_COUNT=140`
- `ACTIVE_CHILD_MEMBERSHIP_COUNT=73`
- `GROUPED_BATCH_COUNT=0`
- `IDEMPOTENCY_ROW_COUNT=0`
- `GROUPED_EXECUTOR_REVISION_COUNT=0`
- `GROUPED_ROLLBACK_MANIFEST_COUNT=0`
- `CANONICAL_KEY_BACKFILL_COUNT=0`

## Safety Boundary

- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `PRODUCTION_IMPORT_EXECUTED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `A17O_IMPORTER_RUNTIME_ACTIVE=NO`
- `RUNTIME_CHANGED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_CHANGED=NO`
- `DEPLOY=NO`
- `PACKAGE_DEPENDENCY_INSTALLED=NO`

## Runtime Readiness

- `A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED`
- `NEXT_ACTION=START_A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION`

## Validation

- `VALIDATION_SUMMARY=PASS`
- `npm.cmd run check:a17o-tx1r-grouped-import-executor-manual-apply-verification` - PASS
- `npm.cmd run check:a17o-tx1-grouped-official-import-transaction-executor-candidate` - PASS
- `npm.cmd run check:a17o-importer-canonical-family-grouping` - PASS
- `npm.cmd run check:a16r-import-completed-post-import-verification` - PASS
- `npm.cmd run check:a17n-dr-deploy-production-no-mutation-smoke-evidence` - PASS
- `npm.cmd run check:a17n-r-admin-parent-child-runtime-integration` - PASS
- `npm.cmd run check:a17n-tx1-admin-canonical-family-transaction-executor-candidate` - PASS
- `npm.cmd run check:a17n-tx2f-post-apply-verifier-active-scope-correction` - PASS
- `npm.cmd run check:a17n-admin-parent-child-canonical-write-path` - PASS
- `npm.cmd run check:a17m-canonical-family-domain-service` - PASS
- `npm.cmd run check:a17a-tree-baseline-evidence` - PASS
- `npm.cmd run check:a17b-canonical-family-unit-design` - PASS
- `npm.cmd run check:a17c-phatue-oriented-tree-ux-contract` - PASS
- `npm.cmd run check:a17d-canonical-tree-graph-contract` - PASS
- `npm.cmd run check:a17e-family-duplicate-read-only-audit` - PASS
- `npm.cmd run check:a17f-family-reconciliation-dry-run` - PASS
- `npm.cmd run check:a17g-family-reconciliation-rollback-design` - PASS
- `npm.cmd run check:a17h-canonical-family-schema-foundation-candidate` - PASS
- `npm.cmd run check:a17i-canonical-family-schema-post-apply-verification` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:relationships` - PASS
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `git diff --check` - pending
- `git diff --cached --check` - pending until staging

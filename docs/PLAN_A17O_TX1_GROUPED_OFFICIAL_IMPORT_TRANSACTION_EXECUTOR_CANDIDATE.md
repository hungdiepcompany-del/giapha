# A-17O-TX1 - Grouped Official Import Transaction Executor Candidate

## Status

- `A17O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED`
- `A17SQL_O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY`
- `A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED`
- `PRECONDITION_BRANCH_MAIN=YES`
- `PRECONDITION_WORKTREE_CLEAN_BEFORE_PHASE=YES`
- `PRECONDITION_REMOTE_SYNC_BEFORE_PHASE=0_0`
- `PRECONDITION_ORIGIN_MAIN_CONTAINS_A17O_49E95A8=YES`
- `PRECONDITION_ORIGIN_MAIN_CONTAINS_A17N_DR_0D0F665=YES`
- `PRECONDITION_ORIGIN_MAIN_CONTAINS_A17N_R_256D746=YES`
- `MIGRATION_FILE=db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql`
- `SUPABASE_MIRROR_FILE=supabase/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql`
- `DB_MIGRATION_SHA256=87EE4675746D948C3B32E8E7809A5945F8EA153EC2A6107355EF3E271E3DD4B2`
- `SUPABASE_MIRROR_SHA256=87EE4675746D948C3B32E8E7809A5945F8EA153EC2A6107355EF3E271E3DD4B2`
- `MIRROR_MATCH=YES`
- `SOURCE_COMMIT=0f02c93`
- `MIGRATION_APPLIED=YES_OWNER_MANUAL_PRODUCTION`
- `MANUAL_PRODUCTION_APPLY_RECORDED=YES`
- `VERIFIER_ALL_REQUIRED_CHECKS_PASS=YES`
- `A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED`

## Candidate Contract

- `OLD_EXECUTOR_NAME=public.a16p_tx_execute_giapha4_official_import`
- `OLD_EXECUTOR_SIGNATURE_CHANGED=NO`
- `OLD_EXECUTOR_DROPPED=NO`
- `OLD_COMPLETED_IMPORT_COMPATIBILITY_PRESERVED=YES`
- `NEW_GROUPED_EXECUTOR_NAME=public.a17o_tx_execute_grouped_giapha4_official_import`
- `GROUPED_EXECUTOR_CREATED=YES`
- `SECURITY_MODE=SECURITY_INVOKER`
- `FIXED_SEARCH_PATH=YES`
- `AUTH_UID_REQUIRED=YES`
- `ACTOR_PROFILE_VALIDATED=YES`
- `PERMISSION_VALIDATED=YES`
- `SERVICE_ROLE_REQUIRED=NO`
- `PUBLIC_EXECUTE_GRANTED=NO`
- `ANON_EXECUTE_GRANTED=NO`
- `AUTHENTICATED_EXECUTE_GRANTED=YES`
- `GROUPED_PAYLOAD_SUPPORT=YES`
- `ONE_FAMILY_MULTIPLE_CHILDREN_SUPPORTED=YES`
- `ONE_PARENT_GROUPING_SUPPORTED=YES`
- `CREATE_CANONICAL_FAMILY_SUPPORTED=YES`
- `REUSE_CANONICAL_FAMILY_SUPPORTED=YES`
- `IDEMPOTENCY_REQUIRED=YES`
- `MUTATION_PLAN_HASH_REQUIRED=YES`
- `ROW_LOCKS_PRESENT=YES`
- `COMPLETED_SESSION_GUARD_PRESENT=YES`
- `OWNER_APPROVED_MANIFEST_REQUIRED=YES`
- `LEGACY_DUPLICATE_REVIEW_GUARD_PRESENT=YES`
- `CANONICAL_KEY_VALIDATED=YES`
- `ROLLBACK_DISTINGUISHES_CREATED_VS_PREEXISTING=YES`

The candidate adds a new versioned executor RPC and a narrow
`official_import_grouped_execution_idempotency` table for future approved
official imports. The payload contract contains `people`, `familyGroups`,
`parentMemberships`, `childMemberships`, `idempotencyKey`, and
`mutationPlanHash`. A family group may create or reuse one canonical family and
attach multiple child memberships in the same transaction.

The existing A-16/A-16BU official import executor is intentionally preserved
for historical compatibility and completed import evidence. Runtime code does
not call the new executor in this phase.

## Safety Boundary

- `A17O_IMPORTER_RUNTIME_ACTIVE=NO`
- `A17O_TX1_RUNTIME_CALLER_CREATED=NO`
- `OFFICIAL_IMPORT_COMPLETED_SESSION_REOPENED=NO`
- `NEGATIVE_TEST_ONLY_COMPLETED_PRODUCTION_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`
- `COMPLETED_PRODUCTION_SESSION_REOPENED=NO`
- `PRODUCTION_IMPORT_ENDPOINT_CALLED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `CANONICAL_KEY_BACKFILL_EXECUTED=NO`
- `FAMILY_RECONCILIATION_EXECUTED=NO`
- `SQL_EXECUTED_BY_CODEX=NO`
- `SQL_EXECUTED_BY_PHASE=NO`
- `MIGRATION_APPLIED=YES_OWNER_MANUAL_PRODUCTION`
- `DEPLOY=NO`
- `PUSH=NO`

The production completed session UUID is retained only as a negative verifier
target. It is not embedded as executable logic in the candidate function; the
generic session and audit-batch guards reject completed or already-executed
imports.

## Post-Apply Verifier

- `POST_APPLY_VERIFIER_CREATED=YES`
- `POST_APPLY_VERIFIER_EXECUTED=YES_OWNER_MANUAL_PRODUCTION`
- `POST_APPLY_VERIFIER_FILE=db/checks/20260713_check_a17o_tx1_grouped_official_import_transaction_executor.sql`
- `POST_APPLY_VERIFIER_SELECT_ONLY=YES`
- `POST_APPLY_VERIFIER_CALLS_RPC=NO`
- `POST_APPLY_VERIFIER_LOCKS_ROWS=NO`
- `VERIFIER_ALL_REQUIRED_CHECKS_PASS=YES`

The verifier checks function metadata, exact argument contract, SECURITY
INVOKER, fixed search path, execute grants, old executor preservation,
idempotency table RLS/policies/grants, new batch and rollback columns, no
seeded grouped idempotency rows, unchanged active family graph counts, no
grouped executor side-effect rows from apply, and the completed production
session guard.

## Owner Gate

- `OWNER_REVIEW_MARKER_REQUIRED=SATISFIED_BY_OWNER_MANUAL_PRODUCTION_APPLY`
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
- `git diff --check` - PASS
- `git diff --cached --check` - pending until staging

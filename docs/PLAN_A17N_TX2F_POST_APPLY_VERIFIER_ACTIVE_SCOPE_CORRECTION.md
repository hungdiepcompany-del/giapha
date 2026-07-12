# A-17N-TX2F - Post-Apply Verifier Active-Scope Correction

## Status

- `A17N_TX2F_STATUS=PASS_STATIC_CORRECTION_DB_EXECUTION_SAFE_SKIP`
- `A17N_TX2_STATUS=SAFE_SKIP_CORRECTED_VERIFIER_NOT_EXECUTED_LINKED_ACCESS_UNAVAILABLE`
- `A17N_TX2_INITIAL_RESULT=FALSE_NEGATIVE_COUNT_SCOPE_BUG`
- `INITIAL_FAILURE_CLASSIFICATION=FALSE_NEGATIVE_COUNT_SCOPE_BUG`
- `PRODUCTION_DATA_DRIFT=NO`
- `MIGRATION_0024_DATA_MUTATION=NO`
- `TRANSACTION_EXECUTOR_CALLED=NO`

## Corrected Scope

- `CORRECTED_ACTIVE_SCOPE=active family + active membership + active owning family`
- `ACTIVE_FAMILY_COUNT=74`
- `ACTIVE_PARENT_MEMBERSHIP_COUNT=140`
- `ACTIVE_CHILD_MEMBERSHIP_COUNT=73`

The corrected verifier aligns with the A-17A/A-17E active graph scope. It no
longer compares total physical rows to the active baseline.

## Informational Metrics

- `TOTAL_FAMILY_ROWS=75`
- `TOTAL_PARENT_MEMBERSHIP_ROWS=142`
- `TOTAL_CHILD_MEMBERSHIP_ROWS=74`
- `DELETED_FAMILY_COUNT=1`

These physical counts are informational only. The deleted legacy family is
recorded as a data-quality context item, not active production drift.

## Advisory Metrics

- `ORPHAN_ACTIVE_PARENT_MEMBERSHIP_UNDER_DELETED_FAMILY_COUNT=2`
- `ORPHAN_ACTIVE_CHILD_MEMBERSHIP_UNDER_DELETED_FAMILY_COUNT=0`
- `DO_NOT_DELETE_ORPHAN_ACTIVE_ROWS_IN_THIS_PHASE=YES`
- `DO_NOT_RESTORE_DELETED_FAMILY_IN_THIS_PHASE=YES`
- `DEFER_CLEANUP_TO_RECONCILIATION_DATA_QUALITY=YES`

The orphan-active parent memberships are deferred to later
reconciliation/data-quality work. This phase does not delete those rows, restore
the deleted family, repair memberships, backfill canonical keys or reconcile
legacy families.

## Function And Security Results

- `FUNCTION_EXISTS=YES`
- `EXACT_ARGUMENT_TYPES_MATCH=YES`
- `RETURN_TYPE_JSONB=YES`
- `VOLATILITY_VOLATILE=YES`
- `SECURITY_INVOKER=YES`
- `FIXED_SEARCH_PATH=YES`
- `AUTHENTICATED_EXECUTE_GRANT=YES`
- `ANON_EXECUTE_COUNT=0`
- `PUBLIC_EXECUTE_COUNT=0`
- `IDEMPOTENCY_TABLE_EXISTS=YES`
- `IDEMPOTENCY_RLS_ENABLED=YES`
- `IDEMPOTENCY_ROW_COUNT=0`
- `CANONICAL_KEY_BACKFILL_COUNT=0`
- `OWNER_DECISION_ROW_COUNT=0`
- `RECONCILIATION_BATCH_ROW_COUNT=0`
- `ROLLBACK_MANIFEST_ROW_COUNT=0`

## Safety

- `A17N_R_REMAINS_BLOCKED_UNTIL_CORRECTED_POST_APPLY_VERIFIER_PASSES=YES`
- `A17N_R_READINESS=BLOCKED_CORRECTED_VERIFIER_NOT_RERUN_BY_CODEX`
- `MIGRATION_CREATED=NO`
- `MIGRATION_0024_CHANGED=NO`
- `SQL_MUTATION_EXECUTED=NO`
- `RPC_CALLED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Validation

- `CORRECTED_POST_APPLY_VERIFIER_EXECUTED=SAFE_SKIP`
- `CORRECTED_POST_APPLY_VERIFIER_RESULT=SAFE_SKIP_LINKED_ACCESS_UNAVAILABLE`
- `SAFE_SKIP_REASON=SUPABASE_CONNECTOR_USAGE_LIMIT`
- `VALIDATION_SUMMARY=PASS_STATIC_VALIDATION_DB_VERIFIER_SAFE_SKIP_LINKED_ACCESS_UNAVAILABLE`
- `npm.cmd run check:a17n-tx2f-post-apply-verifier-active-scope-correction` - PASS
- `CORRECTED_A17N_TX2_POST_APPLY_VERIFIER_DB_RUN` - SAFE_SKIP (`SAFE_SKIP_REASON=SUPABASE_CONNECTOR_USAGE_LIMIT`)
- `npm.cmd run check:a17n-tx1-admin-canonical-family-transaction-executor-candidate` - PASS
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
- `npm.cmd run check:a16r-import-completed-post-import-verification` - PASS
- `npm.cmd run check:relationships` - PASS
- `npm.cmd run check:tree-editor` - PASS
- `npm.cmd run check:tree-viewer` - PASS
- `npm.cmd run check:public-privacy` - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `git diff --check` - PASS

## Next

- `NEXT_ACTION=RESTORE_LINKED_SUPABASE_ACCESS_AND_RUN_CORRECTED_VERIFIER_BEFORE_A17N_R`

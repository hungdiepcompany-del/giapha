# A-17N-TX2F - Post-Apply Verifier Active-Scope Correction

## Status

- `A17N_TX2R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_VERIFIER_RECORDED`
- `OWNER_MANUAL_PRODUCTION_VERIFIER_EVIDENCE_RECORDED=YES`
- `A17N_TX2F_STATUS=PASS_ACTIVE_SCOPE_CORRECTION_VERIFIED`
- `A17N_TX2_STATUS=PASS_CORRECTED_ACTIVE_SCOPE_POST_APPLY_VERIFIED`
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
- `ORPHAN_ACTIVE_PARENT_MEMBERSHIP_COUNT=2`
- `ORPHAN_ACTIVE_CHILD_MEMBERSHIP_COUNT=0`
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
- `TRANSACTION_EXECUTOR_REVISION_COUNT=0`
- `CANONICAL_KEY_BACKFILL_COUNT=0`
- `OWNER_DECISION_ROW_COUNT=0`
- `RECONCILIATION_BATCH_ROW_COUNT=0`
- `ROLLBACK_MANIFEST_ROW_COUNT=0`
- `RECONCILIATION_ROWS_CREATED=0`

## Safety

- `A17N_R_REMAINS_BLOCKED_UNTIL_CORRECTED_POST_APPLY_VERIFIER_PASSES=YES`
- `A17N_R_READINESS=READY_POST_APPLY_VERIFIER_PASS_RECORDED`
- `MIGRATION_CREATED=NO`
- `MIGRATION_0024_CHANGED=NO`
- `SQL_EXECUTED=NO`
- `SQL_MUTATION_EXECUTED=NO`
- `RPC_CALLED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RUNTIME_CHANGED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Validation

- `CORRECTED_POST_APPLY_VERIFIER_EXECUTED=OWNER_MANUAL_PRODUCTION_SELECT_ONLY`
- `CORRECTED_POST_APPLY_VERIFIER_RESULT=PASS`
- `VALIDATION_SUMMARY=PASS_OWNER_MANUAL_PRODUCTION_VERIFIER_EVIDENCE_RECORDED`
- `npm.cmd run check:a17n-tx2f-post-apply-verifier-active-scope-correction` - PASS
- `CORRECTED_A17N_TX2_POST_APPLY_VERIFIER_DB_RUN` - PASS owner manual production SELECT-only
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
- Direct `npm.cmd run build` - FAIL before compile on known Windows `.next`
  artifact ACL lock.
- Clean temp-copy `npm.cmd run build` under `.tmp\a17n-tx2r-build-20260712` -
  PASS.
- `git diff --check` - PASS

## Next

- `NEXT_ACTION=START_SEPARATE_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION`

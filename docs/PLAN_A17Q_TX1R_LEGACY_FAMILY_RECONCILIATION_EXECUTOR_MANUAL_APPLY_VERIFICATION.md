# A-17Q-TX1R - Legacy Family Reconciliation Executor Manual Apply Verification

Date: 2026-07-13

Status:
`A17Q_TX1R_STATUS=PASS_MANUAL_APPLY_VERIFICATION_EVIDENCE_RECORDED`
`A17Q_TX1_MANUAL_APPLY_STATUS=PASS_MIGRATION_APPLIED_AND_SELECT_ONLY_VERIFIED_NO_RECONCILIATION`

## Scope

This phase records owner-provided production evidence that migration 0026 was
manually applied to the Gia Pha Supabase production project and that the
SELECT-only verifier passed. Codex did not execute SQL, rerun the verifier,
call the reconciliation executor, run a dry-run, mutate genealogy data, deploy
or push.

Migration-history reconciliation remains a separate phase.

## Source Authority

- `TARGET_PROJECT_REF=frkyeuxrlcflmsxxsolp`
- `MIGRATION_FILE=db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql`
- `SUPABASE_MIRROR_FILE=supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql`
- `MIGRATION_SHA256=9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66`
- `MIRROR_MATCH=YES`
- `MIGRATION_APPLIED=YES_OWNER_MANUAL_PRODUCTION`
- `DATABASE_SCHEMA_CHANGED=YES`

## Verifier Evidence

- `VERIFIER_FILE=db/checks/20260713_check_a17q_tx1_legacy_family_reconciliation_executor_candidate.sql`
- `VERIFIER_SELECT_ONLY=YES`
- `VERIFIER_ALL_REQUIRED_CHECKS_PASS=YES`
- `VERIFIER_EXECUTED_BY_OWNER=YES`
- `VERIFIER_RERUN_BY_CODEX=NO`
- `SELECT_ONLY_VERIFIER_STATUS=PASS_ALL_CONTRACT_FIELDS_TRUE`
- `SQL_EXECUTED=YES`
- `SQL_SCOPE=MIGRATION_0026_AND_SELECT_ONLY_VERIFIER`
- `SQL_EXECUTED_BY_CODEX=NO`

Owner-provided verifier results:

- `FUNCTION_EXISTS=YES`
- `RETURN_TYPE=jsonb`
- `FUNCTION_SECURITY_MODE=SECURITY_INVOKER`
- `FUNCTION_SEARCH_PATH=public, auth, pg_temp`
- `PUBLIC_EXECUTE_ALLOWED=NO`
- `ANON_EXECUTE_ALLOWED=NO`
- `AUTHENTICATED_EXECUTE_GRANT=YES`
- `ALL_EMBEDDED_HASHES_MATCH=YES`
- `DECISION_PACK_SHA256_MATCH=YES`
- `APPROVED_GROUP_PLAN_SHA256_MATCH=YES`
- `ROLE_CORRECTION_PLAN_SHA256_MATCH=YES`
- `EXCLUDED_SCOPE_SHA256_MATCH=YES`
- `FORECAST_SHA256_MATCH=YES`
- `FIX3_SOURCE_CONTRACT_PRESENT=YES`
- `SUCCESS_RESULT_STORAGE_PRESENT=YES`
- `SUCCESS_RESULT_SHA256_STORAGE_PRESENT=YES`

## No-Reconciliation Evidence

- `DECISION_PACK_BATCH_COUNT=0`
- `COMPLETED_RECONCILIATION_BATCH_COUNT=0`
- `ROLLBACK_MANIFEST_COUNT=0`
- `GENEALOGY_DATA_MUTATED=NO`
- `RPC_CALLED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `RECONCILIATION_EXECUTOR_CALLED=NO`
- `PRODUCTION_DRY_RUN_EXECUTED=NO`
- `FAMILY_VOIDED=NO`
- `MEMBERSHIP_MOVED=NO`
- `RELATIONSHIP_ROLE_CHANGED=NO`
- `RUNTIME_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

The zero batch and rollback counts record that the transaction executor has not
been called and no reconciliation run exists after schema apply.

## Readiness

- `FUNCTION_CONTRACT_STATUS=PASS`
- `A17Q_TX1R_STATUS=PASS_MANUAL_APPLY_VERIFICATION_EVIDENCE_RECORDED`
- `EXPECTED_SUCCESS_STATUS=PASS_MANUAL_APPLY_VERIFICATION_EVIDENCE_RECORDED`
- `NEXT_ACTION=A17Q_DRY_RUN_PREPARE_PRODUCTION_RECONCILIATION`

## Validation

- `VALIDATION_SUMMARY=PASS`
- `npm.cmd run check:a17q-tx1r-legacy-family-reconciliation-executor-manual-apply-verification` - PASS
- A17Q FIX3/FIX2/FIX1/base checkers - PASS
- A17P authority checkers - PASS
- `npm.cmd run check:migrations` - PASS
- `npm.cmd run check:env:safe` - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `git diff --check` - PASS
- `git diff --cached --check` - PASS

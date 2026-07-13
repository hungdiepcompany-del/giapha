# A-17Q-TX1 - Legacy Family Reconciliation Transaction Executor Candidate

Date: 2026-07-13

Status:
`A17P_R_STATUS=PASS_IMMUTABLE_OWNER_DECISION_PACK_FINALIZED`
`A17Q_TX1_STATUS=PASS_TRANSACTION_EXECUTOR_CANDIDATE_CREATED_NOT_APPLIED`
`A17Q_TX1_FIX1_STATUS=PASS_HARDENED_TRANSACTION_EXECUTOR_CANDIDATE_NOT_APPLIED`
`A17Q_TX1_FIX2_STATUS=PASS_EXACT_POST_STATE_RECONCILIATION_CONTRACT_READY_NOT_APPLIED`

## Scope

A-17Q-TX1 creates a not-applied database migration candidate for the exact
immutable A-17P-R owner decision pack. The candidate adds one narrow
`SECURITY INVOKER` RPC that can validate the committed decision pack, perform a
SELECT-backed dry-run, and, only after a future explicit owner apply/execution
phase, reconcile the 21 approved legacy duplicate-family groups in one
transaction.

This phase does not run SQL, apply a migration, query production, call an RPC,
deploy, push, change runtime application code, or execute reconciliation.

## Source Authority

- `DECISION_PACK_FILE=docs/evidence/A17P_OWNER_DECISION_PACK.json`
- `DECISION_PACK_SHA256=777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0`
- `APPROVED_GROUP_PLAN_SHA256=7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740`
- `ROLE_CORRECTION_PLAN_SHA256=ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f`
- `EXCLUDED_SCOPE_SHA256=7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61`
- `FORECAST_SHA256=4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3`
- `OWNER_APPROVAL_MARKER=A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED`

The SQL manifest is embedded from the decision pack and the checker verifies it
matches the committed JSON exactly. Production display names are not committed.

## Candidate Artifacts

- `MIGRATION_CANDIDATE_CREATED=YES`
- `MIGRATION_FILE=db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql`
- `SUPABASE_MIRROR_FILE=supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql`
- `A17Q_TX1_OLD_SHA256_SUPERSEDED=696441637B308257ED8B45991EAD2542B4A5A14A648BBE0CCC2D5E996DD18D3B`
- `A17Q_TX1_FIX2_OLD_SHA256_SUPERSEDED=B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934`
- `A17Q_TX1_FIX2_NEW_SHA256=AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D`
- `DB_MIGRATION_SHA256=AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D`
- `SUPABASE_MIRROR_SHA256=AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D`
- `MIRROR_MATCH=YES`
- `SELECT_ONLY_VERIFIER_CREATED=YES`
- `SELECT_ONLY_VERIFIER_FILE=db/checks/20260713_check_a17q_tx1_legacy_family_reconciliation_executor_candidate.sql`
- `CHECKER_CREATED=YES`
- `CHECKER_FILE=scripts/check-a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate.cjs`
- `FIX1_CHECKER_FILE=scripts/check-a17q-tx1-fix1-hardened-reconciliation-executor.cjs`
- `FIX2_CHECKER_FILE=scripts/check-a17q-tx1-fix2-exact-post-state-reconciliation-contract.cjs`

The superseded SHAs must never be applied. Migration 0026 is still not applied
after FIX2; no migration 0027 was created.

## RPC Contract

- `RPC_NAME=public.execute_admin_a17q_legacy_family_reconciliation`
- `RPC_SIGNATURE=p_owner_approval_marker text, p_decision_pack_sha256 text, p_approved_group_plan_sha256 text, p_role_correction_plan_sha256 text, p_excluded_scope_sha256 text, p_forecast_sha256 text, p_idempotency_key text, p_confirm_backup_reviewed boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_confirm_excluded_scope_reviewed boolean, p_dry_run_only boolean`
- `RPC_RETURN_TYPE=jsonb`
- `RPC_SECURITY_MODE=SECURITY_INVOKER`
- `RPC_SEARCH_PATH=public, auth, pg_temp`
- `SERVICE_ROLE_REQUIRED=NO`
- `PUBLIC_EXECUTE_GRANTED=NO`
- `ANON_EXECUTE_GRANTED=NO`
- `AUTHENTICATED_EXECUTE_GRANTED=YES`
- `AUTH_UID_REQUIRED=YES`
- `PROFILE_REQUIRED=YES`
- `PERMISSION_MODEL=relationships.update plus permissions.manage`
- `DECISION_PACK_SHA256_EMBEDDED=YES`
- `APPROVED_GROUP_PLAN_SHA256_EMBEDDED=YES`
- `ROLE_CORRECTION_PLAN_SHA256_EMBEDDED=YES`
- `EXCLUDED_SCOPE_SHA256_EMBEDDED=YES`
- `FORECAST_SHA256_EMBEDDED=YES`

## Approved Scope

- `APPROVED_GROUP_COUNT=21`
- `APPROVED_CANDIDATE_FAMILY_COUNT=57`
- `SURVIVOR_FAMILY_COUNT=21`
- `VOID_FAMILY_COUNT=36`
- `CHILD_MEMBERSHIP_MOVE_COUNT=36`
- `CHILD_MEMBERSHIP_PRESERVED_COUNT=57`
- `CHILD_MEMBERSHIP_LOST_COUNT=0`
- `PARENT_MEMBERSHIP_DEACTIVATION_COUNT=72`
- `ROLE_CORRECTION_PLAN_COUNT=36`
- `ROLE_CORRECTION_APPLIED_TO_SURVIVORS_COUNT=16`
- `ROLE_CORRECTION_SUPERSEDED_BY_VOID_COUNT=20`

## Excluded Scope

- `EXCLUDED_GROUP_COUNT=1`
- `EXCLUDED_GROUP_REF=721e2ae3d95dd418af40b6459531b870`
- `EXCLUDED_GROUP_CANDIDATE_COUNT=3`
- `EXCLUDED_SCOPE_EXECUTABLE=NO`
- `DELETED_FAMILY_ADVISORY_COUNT=1`
- `DELETED_FAMILY_REF=990de69e-2239-4a00-995c-6292ce4a814a`
- `DELETED_SAFE_FAMILY_REF=16ead1f516a885724a2bddd11e14472b`
- `DELETED_FAMILY_EXECUTABLE=NO`

## Safety Contract

- `DRY_RUN_SUPPORTED=YES`
- `ROLLBACK_MANIFEST_SUPPORTED=YES`
- `IDEMPOTENCY_SUPPORTED=YES`
- `ADVISORY_LOCK_SUPPORTED=YES`
- `ROW_LOCKING_SUPPORTED=YES`
- `GRAPH_VALIDATION_SUPPORTED=YES`
- `FAIL_CLOSED_PRECONDITIONS=YES`
- `IDEMPOTENCY_REPLAY_CONTRACT_IMPLEMENTED=YES`
- `PRECONDITION_REVIEW_COMPLETE=YES`
- `MUTATION_ORDER_CONTRACT_MATCHES_REVIEW=YES`
- `AUDIT_PRE_MUTATION_PRESENT=YES`
- `POST_STATE_VERIFIED_BEFORE_COMPLETED=YES`
- `EXACT_CHILD_POST_STATE_CONTRACT=YES`
- `EXACT_PARENT_ROLE_POST_STATE_CONTRACT=YES`
- `EXACT_FAMILY_CANONICAL_POST_STATE_CONTRACT=YES`
- `EXACT_GRAPH_POST_STATE_CONTRACT=YES`
- `REPLAY_SAFE_SUCCESS_RESULT_CONTRACT=YES`
- `ACTIVE_RUNTIME_CALLER_COUNT=0`
- `RECONCILIATION_AUTHORIZED_FOR_DESIGN_ONLY=YES`
- `RECONCILIATION_EXECUTION_AUTHORIZED=NO`
- `MIGRATION_APPLY_AUTHORIZED=NO`
- `MIGRATION_0026_APPLIED=NO`
- `MIGRATION_0027_CREATED=NO`
- `PRODUCTION_DRY_RUN_AUTHORIZED=NO`
- `PRODUCTION_EXECUTION_AUTHORIZED=NO`
- `OWNER_REVIEW_REQUIRED_AGAIN=YES`

The candidate rejects hash/marker mismatch, unauthenticated callers, missing
profile context, missing permissions, concurrent execution, existing running or
completed batch for the decision pack, excluded/deleted family leakage into the
executable scope, baseline drift, unexpected layout references, stale role
states, duplicate child memberships, self parent/child rows, and inactive
touched people.

FIX1 hardens the review-blocked areas:

- idempotency replay now returns only a stored completed success for the same
  key, same hashes and same marker; conflicting keys or incomplete batches fail
  closed.
- dry-run returns `DRY_RUN_NOT_CONSUMED` and never inserts a reconciliation
  batch.
- `RUNNING_BATCH_INSERT` occurs only after full precondition validation.
- `PRE_MUTATION_AUDIT_BEFORE_GENEALOGY_MUTATION` is written before the first
  genealogy mutation.
- mutation row counts are captured from the mutation CTE and checked before any
  completed result is stored.
- `REAL_POST_STATE_VALIDATION` verifies counts, unchanged people/layout/excluded
  and deleted-family hashes, and graph constraints before
  `STORE_COMPLETE_SUCCESS_RESULT`.
- graph validation is never hardcoded to pass.

FIX2 completes the remaining owner-review blockers without applying migration
0026:

- `success_result jsonb` is added to `family_reconciliation_batches` in the
  not-applied migration and constrained to JSON objects when present.
- replay requires `success_result` to exist and match the completed decision
  pack, hashes and owner marker; a completed batch without durable success JSON
  fails closed as recovery-required.
- `EXACT_EXPECTED_POST_STATE_SNAPSHOT` creates locked temporary snapshots for
  normalized parent sets, expected child final mappings, expected parent final
  states and void-to-survivor mappings.
- safe group refs are recomputed with the A-17P parent-set rule and canonical
  keys are computed with the A-17N serialized parent identity contract.
- genealogy mutations read from the expected-state snapshots, then
  `EXACT_POST_STATE_VALIDATION` anti-joins actual rows back to those snapshots.
- child, parent/role, family/canonical and graph failures have separate
  fail-closed exception classes.
- the pre-mutation audit now records actor, hashes, expected snapshot counts,
  manifest hashes and validation pass evidence before the first genealogy
  mutation.
- `SUCCESS_RESULT_PERSISTED_BEFORE_COMPLETION` persists and rereads the success
  result while the batch is still `running`; only then does
  `BATCH_COMPLETED_UPDATE_AFTER_SUCCESS_RESULT` mark the batch completed.

## Boundary Evidence

- `SQL_EXECUTED=NO`
- `PRODUCTION_QUERIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`
- `RECONCILIATION_EXECUTED=NO`
- `FAMILY_VOIDED=NO`
- `MEMBERSHIP_MOVED=NO`
- `RELATIONSHIP_ROLE_CHANGED=NO`
- `MIGRATION_APPLIED=NO`
- `RUNTIME_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `PACKAGE_DEPENDENCY_INSTALLED=NO`

## Validation

- `VALIDATION_SUMMARY=PASS`
- `npm.cmd run check:a17q-tx1-fix2-exact-post-state-reconciliation-contract` - PASS
- `npm.cmd run check:a17q-tx1-fix1-hardened-reconciliation-executor` - PASS
- `npm.cmd run check:a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate` - PASS
- `npm.cmd run check:a17p-r-immutable-owner-decision-pack` - PASS
- A-17P manual/FIX2/FIX3/base owner-review checkers - PASS
- A-17A through A-17I, A-17M, A-17N and A-17O related checkers - PASS
- Relationship, tree viewer/editor, public privacy, export/backup, migration and env-safe checks - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `git diff --check` - PASS

## Next Action

`NEXT_ACTION=A17Q_TX1_FIX2_OWNER_REVIEW_BEFORE_APPLY`

## A-17Q-TX1-FIX1 Owner Review

- `A17Q_TX1_FIX1_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED`
- `REVIEWED_COMMIT=842e7b4`
- `REVIEWED_MIGRATION_SHA256=B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934`
- `REVIEW_EVIDENCE_FILE=docs/PLAN_A17Q_TX1_FIX1_OWNER_REVIEW_HARDENED_RECONCILIATION_EXECUTOR_CANDIDATE.md`
- `FIX1_OWNER_REVIEW_CHECKER=scripts/check-a17q-tx1-fix1-owner-review.cjs`
- `BLOCKER_COUNT=10`
- `MIGRATION_APPLY_AUTHORIZED=NO`
- `PRODUCTION_DRY_RUN_AUTHORIZED=NO`
- `PRODUCTION_EXECUTION_AUTHORIZED=NO`

The review records that FIX1 improved replay, dry-run, precondition order,
pre-mutation audit order, mutation counts and aggregate post-state checks, but
the hardened migration is still not approved for apply. A-17Q-TX1-FIX2 must
prove exact child, parent, role, family, canonical and graph post-state contracts
and store the durable success result before marking the batch completed.

A-17Q-TX1-FIX2 source correction records those contracts in migration 0026 and
keeps apply unauthorized until a separate owner review/manual apply phase.

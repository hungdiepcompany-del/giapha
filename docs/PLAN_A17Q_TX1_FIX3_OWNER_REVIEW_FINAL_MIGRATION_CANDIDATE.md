# A-17Q-TX1-FIX3-REVIEW - Final Owner Review Before Manual Apply

Date: 2026-07-13

Status:
`A17Q_TX1_FIX3_REVIEW_STATUS=PASS_OWNER_REVIEW_APPROVED_FINAL_MIGRATION_FOR_MANUAL_APPLY_CANDIDATE`

## Scope

This review inspected the A-17Q-TX1-FIX3 migration candidate directly from
source before any manual apply. It did not execute SQL, run the SELECT-only
verifier, query production, call the reconciliation executor, apply migration
0026, change runtime code, deploy or push.

PASS in this review approves only the source candidate for a later owner
manual apply and SELECT-only verification phase. It does not authorize apply,
production dry-run or production execution.

## Source Authority

- `REVIEWED_COMMIT=3066ea9`
- `REVIEWED_MIGRATION_FILE=db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql`
- `REVIEWED_MIGRATION_SHA256=9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66`
- `SUPABASE_MIRROR_SHA256=9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66`
- `MIRROR_MATCH=YES`
- `MIGRATION_0026_APPLIED=NO`
- `MIGRATION_0027_CREATED=NO`

Preconditions verified:

- `BRANCH=main`
- `WORKTREE_CLEAN_AT_REVIEW_START=YES`
- `REVIEWED_COMMIT_MATCH=YES`
- `MIGRATION_SHA256_MATCH=YES`

## Preserved Contract Review

Result: `SECURITY_AND_GRANT_REVIEW=PASS`

Evidence:

- Function remains `SECURITY INVOKER` with fixed
  `set search_path = public, auth, pg_temp`.
- Owner marker and immutable A-17P-R decision-pack hashes remain embedded.
- Public and anon EXECUTE remain revoked; authenticated EXECUTE remains granted.
- No runtime caller is present in `app`, `components`, `lib`, `server` or
  `services`.
- Locking, dry-run purity, rollback, pre-mutation audit, excluded/deleted scope
  guards and exact post-state contracts inherited from FIX1/FIX2 remain present.

## Canonical Uniqueness Review

Result: `CANONICAL_UNIQUENESS_REVIEW=PASS`

Evidence:

- `GLOBAL_DUPLICATE_ACTIVE_CANONICAL_KEY_CHECK=YES`
- `APPROVED_CANONICAL_KEY_OWNER_CHECK=YES`
- `APPROVED_CANONICAL_KEY_OWNER_COUNT_CHECK=YES`
- `VOID_FAMILY_CANONICAL_ACTIVE_CHECK=YES`
- `CANONICAL_UNIQUENESS_FAILS_CLOSED=YES`

The post-state source directly computes
`v_global_duplicate_active_canonical_key_count` from active non-merged and
non-voided families grouped by `canonical_key`. It separately verifies that each
of the 21 approved canonical keys has exactly one active owner, that the active
owner is the configured survivor, and that no void family remains
canonical-active. Any failure raises
`A17Q_EXACT_FAMILY_CANONICAL_POST_STATE_VALIDATION_FAILED` before graph success
or completion.

## Global Graph Membership Integrity Review

Result: `GLOBAL_MEMBERSHIP_INTEGRITY_REVIEW=PASS`
Result: `GRAPH_COMPLETION_GATE_REVIEW=PASS`

Evidence:

- `GLOBAL_DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_CHECK=YES`
- `GLOBAL_DUPLICATE_ACTIVE_CHILD_MEMBERSHIP_CHECK=YES`
- `GLOBAL_PARENT_CHILD_OVERLAP_CHECK=YES`
- `ANCESTRY_CYCLE_CHECK_REMAINS_PRESENT=YES`
- `APPROVED_SCOPE_GRAPH_CHECK_REMAINS_PRESENT=YES`
- `GRAPH_SUCCESS_ASSIGNED_AFTER_ALL_CHECKS_PASS=YES`

The post-state source checks duplicate active parent memberships by
`family_id/person_id`, duplicate active child memberships by
`family_id/person_id`, and same-family active parent/child overlap across the
resulting active genealogy graph. The recursive ancestry-cycle check and
approved-scope graph checks remain enforced. `v_graph_validation_passed := true`
appears only after exact family/canonical and graph failure checks.

## Stored Success-Result Integrity Review

Result: `FRESH_SUCCESS_RESULT_INTEGRITY_REVIEW=PASS`
Result: `COMPLETED_REPLAY_INTEGRITY_REVIEW=PASS`
Result: `SUCCESS_PERSISTENCE_ORDER_REVIEW=PASS`

Evidence:

- `SUCCESS_RESULT_SHA256_STORAGE=YES`
- `FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION=YES`
- `SUCCESS_RESULT_PERSISTED_BEFORE_COMPLETION=YES`
- `STORED_RESULT_READ_BACK_BEFORE_COMPLETION=YES`
- `STORED_RESULT_BATCH_ID_VERIFIED=YES`
- `STORED_RESULT_DECISION_PACK_HASH_VERIFIED=YES`
- `STORED_RESULT_SHA256_RECOMPUTED_AND_VERIFIED=YES`
- `STORED_JSON_EQUALS_FRESH_JSON=YES`
- `BATCH_COMPLETED_AFTER_SUCCESS_RESULT_VERIFIED=YES`
- `COMPLETED_REPLAY_INTEGRITY_VERIFIED=YES`
- `REPLAY_MUTATION_PATH_COUNT=0`
- `REPLAY_REQUIRES_RECOVERY_ON_NULL_MALFORMED_OR_MISMATCHED_EVIDENCE=YES`

Fresh execution builds the actual success JSON, verifies batch ID and
decision-pack hash, computes SHA-256, stores `success_result` plus
`success_result_sha256` while the batch is still `running`, reads the stored
values back, recomputes the stored JSON SHA-256, verifies stored batch ID,
decision-pack hash, stored SHA-256 and JSON equality, and only then marks the
batch completed. The completed return value comes from stored JSON.

Completed replay reads the stored result, verifies batch ID, decision-pack hash
and recomputed stored-result SHA-256, returns a replay JSON with
`mutation_applied=false` and `replay_mutation_path_count=0`, and raises
`A17Q_RECONCILIATION_BATCH_REQUIRES_RECOVERY` when durable stored evidence is
null, malformed or mismatched. The replay return occurs before
`FIRST_GENEALOGY_MUTATION`.

## SELECT-Only Verifier Review

Result: `SELECT_ONLY_VERIFIER_REVIEW=PASS`

Evidence:

- `SELECT_ONLY_VERIFIER=YES`
- `SELECT_ONLY_VERIFIER_CALLS_EXECUTOR=NO`
- `SELECT_ONLY_VERIFIER_LOCKS_ROWS=NO`
- `SELECT_ONLY_VERIFIER_FIX3_CANONICAL_EVIDENCE=YES`
- `SELECT_ONLY_VERIFIER_FIX3_GLOBAL_MEMBERSHIP_EVIDENCE=YES`
- `SELECT_ONLY_VERIFIER_FIX3_STORED_RESULT_EVIDENCE=YES`
- `SELECT_ONLY_VERIFIER_PERSISTENCE_BEFORE_COMPLETION_EVIDENCE=YES`

The verifier source is a SELECT-only metadata/source-evidence query. It does not
call `execute_admin_a17q_legacy_family_reconciliation`, does not lock rows, and
includes evidence fields for FIX3 canonical uniqueness, global membership
integrity, stored-result SHA-256 integrity and persistence-before-completion
ordering.

## Review Result

- `A17Q_TX1_FIX3_REVIEW_STATUS=PASS_OWNER_REVIEW_APPROVED_FINAL_MIGRATION_FOR_MANUAL_APPLY_CANDIDATE`
- `CANONICAL_UNIQUENESS_REVIEW=PASS`
- `GLOBAL_MEMBERSHIP_INTEGRITY_REVIEW=PASS`
- `GRAPH_COMPLETION_GATE_REVIEW=PASS`
- `FRESH_SUCCESS_RESULT_INTEGRITY_REVIEW=PASS`
- `COMPLETED_REPLAY_INTEGRITY_REVIEW=PASS`
- `SUCCESS_PERSISTENCE_ORDER_REVIEW=PASS`
- `SELECT_ONLY_VERIFIER_REVIEW=PASS`
- `BLOCKER_COUNT=0`
- `BLOCKERS=NONE`

## Boundaries

- `MIGRATION_APPLY_AUTHORIZED=NO`
- `PRODUCTION_DRY_RUN_AUTHORIZED=NO`
- `PRODUCTION_EXECUTION_AUTHORIZED=NO`
- `SQL_EXECUTED=NO`
- `PRODUCTION_QUERIED=NO`
- `RPC_CALLED=NO`
- `DATABASE_MUTATION=NO`
- `MIGRATION_APPLIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RUNTIME_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

## Validation

- `VALIDATION_SUMMARY=PASS`
- `npm.cmd run check:a17q-tx1-fix3-owner-review` - PASS
- `npm.cmd run check:a17q-tx1-fix3-final-integrity-contract` - PASS
- `npm.cmd run check:a17q-tx1-fix2-exact-post-state-reconciliation-contract` - PASS
- `npm.cmd run check:a17q-tx1-fix2-owner-review` - PASS
- `npm.cmd run check:a17q-tx1-fix1-owner-review` - PASS
- `npm.cmd run check:a17q-tx1-fix1-hardened-reconciliation-executor` - PASS
- `npm.cmd run check:a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate` - PASS
- A-17P authority checkers - PASS
- Migration, env-safe, relationship/graph/tree/privacy/export checks - PASS
- `npm.cmd run typecheck` - PASS
- `npm.cmd run lint` - PASS
- `npm.cmd run build` - PASS
- `git diff --check` - PASS
- `git diff --cached --check` - PASS

`check:tree-relationship-picker-ux` was intentionally not used for this PASS
gate because it is an unrelated Plan A-01 advisory.

## Next Action

`NEXT_ACTION=A17Q_TX1_MANUAL_MIGRATION_APPLY_AND_SELECT_ONLY_VERIFICATION`

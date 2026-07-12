# A-17N-TX1 - Admin Canonical Family Transaction Executor Candidate

## Status

- `A17N_TX1_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED`
- `PRECONDITION_A17N_FOUNDATION_PRESENT=YES`
- `WORKTREE_CLEAN_BEFORE_PHASE=YES`
- `REMOTE_SYNC_BEFORE_PHASE=LOCAL_AHEAD_3_NO_DIVERGENCE`
- `MIGRATION_FILE=db/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql`
- `SUPABASE_MIRROR_FILE=supabase/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql`
- `DB_MIGRATION_SHA256=43D9D40C509D8088230E688D76146A93CFBB00332E449E2F4A3DE784367B7BE9`
- `SUPABASE_MIRROR_SHA256=43D9D40C509D8088230E688D76146A93CFBB00332E449E2F4A3DE784367B7BE9`
- `MIRROR_MATCH=YES`
- `PRIOR_MIGRATIONS_UNCHANGED=YES`

## Candidate Contract

- `TRANSACTION_EXECUTOR_CREATED=YES`
- `SUPPORTED_OPERATION_ADD_PARENT=YES`
- `SUPPORTED_OPERATION_ADD_CHILD=YES`
- `UNSUPPORTED_IMPORTER_OPERATION=YES`
- `UNSUPPORTED_ADD_SPOUSE_OPERATION=YES`
- `UNSUPPORTED_RECONCILIATION_OPERATION=YES`
- `SECURITY_MODE=SECURITY_INVOKER`
- `FIXED_SEARCH_PATH=YES`
- `AUTH_UID_REQUIRED=YES`
- `ACTOR_PROFILE_VALIDATED=YES`
- `PERMISSION_VALIDATED=YES`
- `SERVICE_ROLE_REQUIRED=NO`
- `PUBLIC_EXECUTE_GRANTED=NO`
- `ANON_EXECUTE_GRANTED=NO`
- `IDEMPOTENCY_REQUIRED=YES`
- `MUTATION_PLAN_HASH_REQUIRED=YES`
- `ROW_LOCKS_PRESENT=YES`
- `CONCURRENCY_VERSION_CHECK_PRESENT=YES`
- `CANONICAL_UNIQUENESS_PROTECTED=YES`
- `FAMILY_STATUS_GUARDS_PRESENT=YES`
- `PERSON_REFERENCE_GUARDS_PRESENT=YES`
- `SELF_RELATIONSHIP_BLOCKED=YES`
- `CYCLE_GUARD_PRESENT=YES`
- `FAMILY_CREATE_ATOMIC=YES`
- `FAMILY_REUSE_ATOMIC=YES`
- `PARENT_MEMBERSHIP_ATOMIC=YES`
- `CHILD_MEMBERSHIP_ATOMIC=YES`
- `AUDIT_ATOMIC=YES`
- `PARTIAL_WRITE_POSSIBLE=NO`

The candidate creates `public.execute_admin_canonical_family_parent_child_write`
as a `SECURITY INVOKER` RPC and a narrow
`public.admin_canonical_family_write_idempotency` table. The function requires
an authenticated user, a matching `current_profile_id()`, `relationships.create`
and `relationships.update`, a stable idempotency key, and a mutation-plan hash.
It is scoped to admin parent/child canonical family writes only.

The candidate does not create a production caller. It does not reuse or broaden
the A-16 official-import transaction helper, and it does not add importer,
add-spouse, public-tree, graph-layout or reconciliation behavior.

## Runtime Boundary

- `ADMIN_PARENT_ACTION_INTEGRATED=NO`
- `ADMIN_CHILD_ACTION_INTEGRATED=NO`
- `CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=0`
- `IMPORTER_RUNTIME_CHANGED=NO`
- `ADD_SPOUSE_RUNTIME_CHANGED=NO`
- `PUBLIC_TREE_RUNTIME_CHANGED=NO`
- `GRAPH_LAYOUT_RUNTIME_CHANGED=NO`

A-17N remains blocked until this candidate is owner-reviewed, manually applied
in a separate phase, and verified with the SELECT-only post-apply verifier.
Future A-17N-R may integrate the verified executor into admin parent/child
actions. A-17O must not start before A-17N-R is complete.

## Verification Boundary

- `POST_APPLY_VERIFIER_CREATED=YES`
- `POST_APPLY_VERIFIER_EXECUTED=NO`
- `SQL_EXECUTED=NO`
- `MIGRATION_APPLIED=NO`
- `PRODUCTION_FAMILY_CREATED=NO`
- `PRODUCTION_MEMBERSHIP_CREATED=NO`
- `EXISTING_FAMILY_ROWS_UPDATED=NO`
- `CANONICAL_KEYS_BACKFILLED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

The verifier is
`db/checks/20260712_check_a17n_tx1_admin_canonical_family_transaction_executor.sql`.
It is SELECT-only and must be executed only after a future owner manual apply.

## Owner Gate

- `OWNER_REVIEW_MARKER_REQUIRED=APPROVE_A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_CANDIDATE`
- `NEXT_ACTION=OWNER_REVIEW_A17N_TX1_THEN_RUN_SEPARATE_A17SQL_N_TX1_MANUAL_APPLY`

## Validation

- `VALIDATION_SUMMARY=PASS`
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

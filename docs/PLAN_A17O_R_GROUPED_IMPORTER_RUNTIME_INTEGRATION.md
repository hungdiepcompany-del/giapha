# A-17O-R - Grouped Official Importer Runtime Integration

Date: 2026-07-13

Status: `A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_SOURCE_INTEGRATED`

## Preconditions

- `PRECONDITION_A17O_TX1R_PASS=YES`
- `WORKTREE_CLEAN_BEFORE_PHASE=YES`
- `REMOTE_SYNC_BEFORE_PHASE=0_0`
- `ORIGIN_MAIN_CONTAINS_1204739=YES`
- `ORIGIN_MAIN_CONTAINS_0F02C93=YES`
- `ORIGIN_MAIN_CONTAINS_49E95A8=YES`
- `A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED`
- `A17SQL_O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY`
- `A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED`

## Runtime Change

- `GROUPED_EXECUTOR_ADAPTER_CREATED=YES`
- `GROUPED_EXECUTOR_NAME=public.a17o_tx_execute_grouped_giapha4_official_import`
- `GROUPED_EXECUTOR_ARGUMENTS_EXACT=YES`
- `END_USER_SERVER_CONTEXT_USED=YES`
- `SERVICE_ROLE_USED=NO`
- `CANONICAL_GROUPING_RUNTIME_ACTIVE=YES`
- `GROUPED_PLAN_NORMALIZED=YES`
- `GROUPED_PLAN_CONTRACT_VERSION=1`
- `CHILD_ID_INCLUDED_IN_GROUP_KEY=NO`
- `PARENT_INPUT_ORDER_AFFECTS_GROUP_KEY=NO`

The official import service now builds an A-17O grouped plan from the validated
manifest, runs the A-16BF same-run identity precheck, and then calls the narrow
grouped executor adapter exactly once for eligible future sessions. The adapter
uses the authenticated end-user server Supabase client and calls only
`a17o_tx_execute_grouped_giapha4_official_import`.

The old A-16P/A-16BU executor remains in database history and migration files
for completed import compatibility, but the active future import source path no
longer calls it.

## Grouped Plan Contract

- `FUTURE_IMPORT_CALLS_GROUPED_EXECUTOR=YES`
- `ACTIVE_FUTURE_IMPORT_CALLS_OLD_EXECUTOR=NO`
- `OLD_EXECUTOR_FALLBACK_PRESENT=NO`
- `SEQUENTIAL_MUTATION_FALLBACK_PRESENT=NO`
- `DIRECT_DATABASE_WRITES_ADDED=NO`
- `OLD_EXECUTOR_DATABASE_OBJECT_PRESERVED=YES`

The grouped plan contains only the SQL-approved envelope:

```text
contractVersion
sessionId
approvalMarker
actorProfileId
idempotencyKey
mutationPlanHash
people
familyGroups
auditSummary
```

The plan normalizes canonical groups, parent memberships, child memberships and
safe source-reference hashes before hashing. No raw source names, notes, places,
cookies, tokens or service-role details are included in plan diagnostics.

## Preview And Dry-Run

- `IMPORT_PREVIEW_GROUP_COUNTS_UPDATED=YES`
- `IMPORT_DRY_RUN_GROUP_COUNTS_UPDATED=YES`
- `ROLLBACK_GROUPING_UPDATED=YES`
- `AUDIT_GROUPING_UPDATED=YES`
- `IDEMPOTENCY_GROUPING_UPDATED=YES`
- `DRY_RUN_SOURCE_ONLY=YES`
- `DRY_RUN_GROUPED_EXECUTOR_MUTATION_CALL=NO`

Preview and review-pack summaries now report:

```text
sourceChildRelationshipCount
canonicalFamilyGroupCount
plannedNewFamilyCount
plannedReusedFamilyCount
plannedParentMembershipCount
plannedChildMembershipCount
duplicateParentRowsRemoved
duplicateChildRowsRemoved
ownerReviewFamilyGroupCount
blockedFamilyGroupCount
```

Vietnamese preview copy:

```text
Các anh, chị, em có cùng cha mẹ sẽ được nhập vào cùng một gia đình.
```

For the deterministic fixture with two parents and eight children:

- `SOURCE_CHILD_RELATIONSHIP_COUNT=8`
- `CANONICAL_FAMILY_GROUP_COUNT=1`
- `PLANNED_FAMILY_COUNT=1`
- `PLANNED_PARENT_MEMBERSHIP_COUNT=2`
- `PLANNED_CHILD_MEMBERSHIP_COUNT=8`

The SQL contract returns `DRY_RUN_ONLY_TRUE` when `p_dry_run_only=true`, so the
runtime dry-run remains source-only and does not call the grouped executor for
mutation or dry-run simulation.

## Guards

- `COMPLETED_OFFICIAL_IMPORT_REJECTED_BEFORE_RPC=YES`
- `COMPLETED_PRODUCTION_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68`
- `COMPLETED_PRODUCTION_SESSION_GROUPED_RPC_CALL_COUNT=0`
- `COMPLETED_PRODUCTION_SESSION_OLD_RPC_CALL_COUNT=0`
- `APPROVAL_MARKER_VALIDATION_PRESERVED=YES`
- `MANIFEST_HASH_VALIDATION_PRESERVED=YES`
- `REVIEW_PACK_HASH_VALIDATION_PRESERVED=YES`
- `VALIDATION_CONFIRMATION_PRESERVED=YES`
- `ROLLBACK_CONFIRMATION_PRESERVED=YES`
- `AUDIT_CONFIRMATION_PRESERVED=YES`

The completed Gia Pha 4 production session stays a negative guard target only.
It is not retried, reopened or submitted to either executor. Completed,
consumed, expired or otherwise ineligible session states fail before the runtime
builds an executable RPC command.

## Result Handling

- `GROUPED_RPC_RESULT_VALIDATED=YES`
- `INVALID_RPC_RESULT_FAILS_CLOSED=YES`
- `PLAN_HASH_MISMATCH_FAILS_CLOSED=YES`
- `IDEMPOTENT_REPLAY_HANDLED=YES`
- `SAME_KEY_DIFFERENT_HASH_BLOCKED=YES`
- `RPC_FAILURE_NO_FALLBACK=YES`

The adapter validates contract version, session id, mutation plan hash, approved
success or replay status, grouped family count, created/reused family counts,
parent membership counts and child membership counts before returning success to
the application.

## Fixture Evidence

- `ONE_CHILD_ONE_FAMILY_TEST=PASS`
- `TWO_SIBLINGS_ONE_FAMILY_TEST=PASS`
- `EIGHT_SIBLINGS_ONE_FAMILY_TEST=PASS`
- `NINTH_SIBLING_FAMILY_COUNT_UNCHANGED_TEST=PASS`
- `REVERSED_INPUT_ORDER_SAME_PLAN_TEST=PASS`
- `DUPLICATE_PARENT_ROW_DEDUP_TEST=PASS`
- `DUPLICATE_CHILD_ROW_DEDUP_TEST=PASS`
- `DIFFERENT_SPOUSE_DIFFERENT_FAMILY_TEST=PASS`
- `LEGACY_DUPLICATE_FAIL_CLOSED_TEST=PASS`
- `EXACT_GROUPED_RPC_TEST=PASS`
- `END_USER_CONTEXT_TEST=PASS`
- `NO_SERVICE_ROLE_TEST=PASS`
- `RPC_FAILURE_NO_FALLBACK_TEST=PASS`
- `INVALID_RPC_RESULT_FAIL_CLOSED_TEST=PASS`
- `IDEMPOTENT_REPLAY_TEST=PASS`
- `SAME_KEY_DIFFERENT_HASH_BLOCKED_TEST=PASS`
- `COMPLETED_SESSION_RETRY_BLOCKED_TEST=PASS`
- `EIGHT_CHILD_PREVIEW_COUNT_TEST=PASS`

## Boundaries

- `OFFICIAL_IMPORT_COMPLETED_SESSION_REOPENED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `PRODUCTION_IMPORT_EXECUTED=NO`
- `PRODUCTION_MUTATION_SMOKE_EXECUTED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `ADMIN_PARENT_CHILD_RUNTIME_CHANGED=NO`
- `ADD_SPOUSE_RUNTIME_CHANGED=NO`
- `PUBLIC_TREE_RUNTIME_CHANGED=NO`
- `GRAPH_LAYOUT_RUNTIME_CHANGED=NO`
- `TRANSACTION_EXECUTOR_SQL_CHANGED=NO`
- `MIGRATION_CREATED=NO`
- `SQL_EXECUTED=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `PACKAGE_DEPENDENCY_INSTALLED=NO`

Runtime worker guardrail review:

- `MAIN_WORKER_TOUCHED=YES`
- `RUNTIME_DEPENDENCY_ADDED=NO`
- `NEW_SERVICE_WORKER_CREATED=NO`
- `OPENNEXT_WRANGLER_CONFIG_CHANGED=NO`
- `WORKER_SIZE_RISK=NO`
- `SERVICE_BOUNDARY_RECOMMENDATION=NONE`

## Validation

- `VALIDATION_SUMMARY=PASS_PENDING_FINAL_FULL_RUN`
- `CHECKER=scripts/check-a17o-r-grouped-importer-runtime-integration.cjs`
- `PACKAGE_SCRIPT=check:a17o-r-grouped-importer-runtime-integration`

## Next

- `NEXT_ACTION=OWNER_REVIEW_A17O_R_THEN_SEPARATE_PUSH_DEPLOY_AND_PRODUCTION_NO_IMPORT_MUTATION_SMOKE`

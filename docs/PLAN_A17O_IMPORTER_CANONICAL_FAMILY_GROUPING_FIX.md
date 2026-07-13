# A-17O - Official Importer Canonical Family Grouping Fix

Date: 2026-07-13

Status: `A17O_STATUS=BLOCKED_IMPORT_TRANSACTION_EXECUTOR_GROUPED_FAMILY_SUPPORT_REQUIRED`

## Scope

A-17O inspected the official Gia Pha 4 import path and added a dormant source
grouping foundation so future imports can group siblings by canonical parent
set. Runtime activation is intentionally blocked because the applied official
import transaction executor still creates one family per child.

## Preconditions

- `PRECONDITION_A17N_DEPLOY_SMOKE_PASS=YES`
- `A17N_DR_EVIDENCE_COMMIT_FOUND=YES`
- `WORKTREE_CLEAN_BEFORE_PHASE=YES`
- `REMOTE_SYNC_BEFORE_PHASE=YES`
- `A17O_READINESS=READY_A17N_DEPLOY_SMOKE_EVIDENCE_RECORDED`

## Current Import Path Finding

- `CURRENT_PER_CHILD_FAMILY_CREATION_LOCATED=YES`
- `PER_CHILD_FAMILY_CREATION_FILE=db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql`
- `PER_CHILD_FAMILY_CREATION_CTE=clear_children`
- `PER_CHILD_FAMILY_CREATION_PATTERN=gen_random_uuid() as family_id grouped by related_person_fingerprint`
- `EXISTING_IMPORT_TRANSACTION_EXECUTOR_SUPPORTS_GROUPED_FAMILIES=NO`
- `BLOCKED_IMPORT_TRANSACTION_EXECUTOR_GROUPED_FAMILY_SUPPORT_REQUIRED=YES`

The runtime `POST /official-import` route calls
`public.a16p_tx_execute_giapha4_official_import`. The RPC builds family rows
from `import_relationship_candidates` internally, with a generated `family_id`
per child fingerprint, and does not accept a grouped family payload, group key,
or one-family-many-children plan from application code.

## Dormant Grouping Foundation

- `CANONICAL_IMPORT_GROUPING_CREATED=YES`
- `CANONICAL_GROUP_KEY_VERSION=a17o-import-family-group:v1`
- `CHILD_ID_INCLUDED_IN_GROUP_KEY=NO`
- `PARENT_INPUT_ORDER_AFFECTS_GROUP_KEY=NO`
- `SIBLINGS_GROUPED_BY_PARENT_SET=YES`
- `ONE_PARENT_GROUPING_SUPPORTED=YES`
- `MULTIPLE_SPOUSE_CONTEXT_SEPARATED=YES`
- `DUPLICATE_PARENT_ROWS_DEDUPLICATED=YES`
- `DUPLICATE_CHILD_ROWS_DEDUPLICATED=YES`
- `AMBIGUOUS_PARENT_SET_FAILS_CLOSED=YES`
- `LEGACY_DUPLICATE_REQUIRES_REVIEW=YES`
- `IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE=NO`

The foundation lives in
`lib/import/giapha4/canonical-family-grouping.ts`. It is pure, fixture-testable
code with no production caller. It does not call Supabase, execute SQL, read
production rows, or call import endpoints.

## Runtime Surfaces

- `IMPORT_PREVIEW_GROUP_COUNTS_UPDATED=NO`
- `IMPORT_DRY_RUN_GROUP_COUNTS_UPDATED=NO`
- `ROLLBACK_GROUPING_UPDATED=NO`
- `AUDIT_GROUPING_UPDATED=NO`
- `IDEMPOTENCY_GROUPING_UPDATED=NO`

These remain unchanged because grouped-family support must first be added to a
separate transaction executor/RPC candidate. Activating preview, dry-run,
rollback, audit or idempotency counts against the current executor would create
a misleading app-side plan that the database transaction cannot honor.

## Fixture Tests

- `ONE_CHILD_ONE_FAMILY_TEST=PASS`
- `TWO_SIBLINGS_ONE_FAMILY_TEST=PASS`
- `EIGHT_SIBLINGS_ONE_FAMILY_TEST=PASS`
- `NINTH_SIBLING_FAMILY_COUNT_UNCHANGED_TEST=PASS`
- `DIFFERENT_SPOUSE_DIFFERENT_FAMILY_TEST=PASS`
- `REVERSED_INPUT_ORDER_SAME_PLAN_TEST=PASS`
- `DUPLICATE_CHILD_ROW_DEDUP_TEST=PASS`
- `DUPLICATE_PARENT_ROW_DEDUP_TEST=PASS`
- `LEGACY_DUPLICATE_FAIL_CLOSED_TEST=PASS`
- `AMBIGUOUS_PARENT_SET_FAILS_CLOSED_TEST=PASS`
- `COMPLETED_OFFICIAL_IMPORT_RETRY_BLOCKED_TEST=PASS`

## Safety

- `OFFICIAL_IMPORT_COMPLETED_SESSION_REOPENED=NO`
- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `PRODUCTION_IMPORT_EXECUTED=NO`
- `PRODUCTION_MUTATION_SMOKE_EXECUTED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `ADMIN_PARENT_CHILD_RUNTIME_CHANGED=NO`
- `ADD_SPOUSE_RUNTIME_CHANGED=NO`
- `PUBLIC_TREE_RUNTIME_CHANGED=NO`
- `GRAPH_LAYOUT_RUNTIME_CHANGED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `MIGRATION_CREATED=NO`
- `SQL_EXECUTED=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `PACKAGE_DEPENDENCY_INSTALLED=NO`

## Validation

- `npm.cmd run check:a17o-importer-canonical-family-grouping` - PASS
- A-17N-DR checker - PASS
- A-17N-R checker - PASS
- A-17M checker - PASS
- A-17A through A-17I relevant checkers - PASS
- A-16R post-import checker - PASS
- relationship/tree/privacy/env/migration checks - PASS
- `typecheck`, `lint`, `build` - PASS
- `git diff --check` - PASS

## Next

- `NEXT_ACTION=START_SEPARATE_A17O_TX1_GROUPED_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE`
- `IF_GROUPED_TRANSACTION_SUPPORT_MISSING_NEXT_ACTION=START_SEPARATE_A17O_TX1_GROUPED_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE`
- `IF_GROUPED_TRANSACTION_SUPPORT_PRESENT_NEXT_ACTION=SEPARATE_A17O_DEPLOY_AND_NO_IMPORT_MUTATION_SMOKE`

# A-17P - Legacy Reconciliation Audit, Dry-Run And Owner Review Pack

Date: 2026-07-13

Status:
`A17P_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK_READY`
`A17P_FIX1_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_AGGREGATION_GROUP_MAPPING_CORRECTED`

## Scope

A-17P prepares the next legacy family reconciliation review layer after all
known write paths were fixed and deployed. It creates a SELECT-only production
audit query for later owner execution, a pure in-memory dry-run planner, a
synthetic fixture suite and an owner review pack template.

This phase does not query production, execute SQL, call import RPCs, create a
migration, change runtime behavior, deploy, push, modify genealogy rows, assign
canonical keys, merge, void or reconcile families.

## Preconditions

- `PRECONDITION_A17O_DR_PASS=YES`
- `A17O_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_IMPORT_MUTATION_SMOKE_RECORDED`
- `A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_DEPLOYED_AND_VERIFIED`
- `A17_LEGACY_RECONCILIATION_READINESS=READY_ALL_KNOWN_WRITE_PATHS_FIXED_AND_DEPLOYED`
- `A17O_DR_EVIDENCE_COMMIT_FOUND_ON_ORIGIN_MAIN=YES`
- `WORKTREE_CLEAN_BEFORE_PHASE=YES`
- `REMOTE_SYNC_BEFORE_PHASE=0_0`
- `ORIGIN_MAIN_CONTAINS_E8DEF2F=YES`
- `ORIGIN_MAIN_CONTAINS_9FED9FB=YES`

## Current Baseline

- `CURRENT_BASELINE_ACTIVE_FAMILIES=74`
- `CURRENT_BASELINE_ACTIVE_PARENT_MEMBERSHIPS=140`
- `CURRENT_BASELINE_ACTIVE_CHILD_MEMBERSHIPS=73`
- `TOTAL_FAMILY_ROWS=75`
- `TOTAL_PARENT_MEMBERSHIP_ROWS=142`
- `TOTAL_CHILD_MEMBERSHIP_ROWS=74`
- `EXPECTED_DUPLICATE_PARENT_SET_GROUP_COUNT=22`
- `REDUNDANT_FAMILY_ESTIMATE=38`
- `FAMILIES_WITH_MULTIPLE_CHILDREN=0`
- `DELETED_FAMILY_COUNT=1`
- `ORPHAN_ACTIVE_PARENT_MEMBERSHIP_COUNT_EXPECTED=2`
- `ORPHAN_ACTIVE_CHILD_MEMBERSHIP_COUNT_EXPECTED=0`

These values are recorded evidence from A-17A, A-17E/A-17F, A-17I, A-17N
post-apply verification and A-17O-DR. They are not a production refresh and do
not authorize mutation.

## Source Of Truth

- `ACTIVE_FAMILY_SCOPE=families.deleted_at is null`
- `ACTIVE_MEMBERSHIP_SCOPE=membership.deleted_at is null plus owning family deleted_at is null`
- `ROW_LEVEL_ACTIVE_MEMBERSHIP_SCOPE=membership.deleted_at is null`
- `CANONICAL_FAMILY_IDENTITY=sorted active parent person IDs plus optional union context and relationship period`
- `MERGED_VOIDED_DELETED_STATE=families.canonical_status plus merged_into_family_id plus deleted_at`
- `PARENT_MEMBERSHIP_IDENTITY=family_parents.family_id plus person_id, parent_role and relationship_type`
- `CHILD_MEMBERSHIP_IDENTITY=family_children.family_id plus person_id and child_relationship_type`
- `LAYOUT_REFERENCE_OWNERSHIP=tree_layout_nodes.family_id where node_kind='family' and deleted_at is null`
- `REVISION_AUDIT_REFERENCE=revisions.entity_type/entity_id and revision_items.revision_id`
- `ROLLBACK_REPRESENTATION=family_reconciliation_rollback_manifests JSON pre-state arrays from A-17H`
- `GRAPH_VALIDATION=tree graph builder filters active visible people/families/memberships and represents family nodes as family:*`
- `EXPORT_BACKUP_CONTRACT=export collector reads family, membership, couple, layout and lineage rows with privacy-mode filtering`

## Fragmentation Finding

- `CURRENT_DUPLICATE_PARENT_SET_GROUP_COUNT_EXPECTED=22`
- `CURRENT_REDUNDANT_FAMILY_ESTIMATE_EXPECTED=38`
- `CURRENT_FAMILIES_WITH_MULTIPLE_CHILDREN_EXPECTED=0`
- `ONE_FAMILY_PER_CHILD_IMPORT_BEHAVIOR_CONFIRMED=YES`
- `ADMIN_WRITE_PATH_FRAGMENTATION_REPAIRED_AND_DEPLOYED=YES`
- `FAMILY_RECORDS_SHARING_IDENTICAL_PARENT_SETS=YES`
- `CHILD_MEMBERSHIP_DISTRIBUTION_ACROSS_FRAGMENTED_FAMILIES=YES`
- `DUPLICATE_PARENT_MEMBERSHIPS_ACROSS_FRAGMENTED_FAMILIES=YES`
- `LAYOUT_RECORDS_REFER_TO_INDIVIDUAL_FRAGMENTED_FAMILIES=YES`

The current fragmentation is consistent with the historic Gia Pha 4 official
import path that created a family per child, plus older admin parent/child
write paths that could create new family rows. A-17N-DR and A-17O-DR now record
that known future write paths are fixed and deployed before reconciliation
planning begins.

## Legacy Group Identity

- `LEGACY_GROUP_IDENTITY_CREATED=YES`
- `GROUP_IDENTITY_CONTRACT_VERSION=1`
- `GROUP_IDENTITY_PREFIX=a17p-legacy-family-reconciliation:v1`
- `CHILD_ID_INCLUDED_IN_GROUP_IDENTITY=NO`
- `PARENT_INPUT_ORDER_AFFECTS_GROUP_IDENTITY=NO`
- `DISPLAY_NAME_INCLUDED_IN_GROUP_IDENTITY=NO`
- `PERSON_NAME_INCLUDED_IN_GROUP_IDENTITY=NO`
- `BIRTH_DATE_INCLUDED_IN_GROUP_IDENTITY=NO`
- `SOURCE_ROW_ORDER_INCLUDED_IN_GROUP_IDENTITY=NO`
- `RANDOM_UUID_INCLUDED_IN_GROUP_IDENTITY=NO`

The group identity uses normalized active parent person IDs, sorted parent
order, optional union/spouse context, optional relationship-period context and
an explicit reconciliation contract version.

Risk classes:

```text
SAFE_AFTER_OWNER_APPROVAL
OWNER_DECISION_REQUIRED
BLOCKED_DATA_CONFLICT
BLOCKED_GRAPH_INVARIANT
EXCLUDED_NON_DUPLICATE
```

No group is executable without an owner decision.

## SELECT-Only Audit SQL

- `SELECT_ONLY_AUDIT_FILE=db/checks/20260713_check_a17p_legacy_family_reconciliation_audit.sql`
- `SELECT_ONLY_AUDIT_STATIC_CHECK=PASS`
- `AUDIT_SQL_RPC_CALL_COUNT=0`
- `AUDIT_SQL_MUTATION_STATEMENT_COUNT=0`
- `AUDIT_SQL_EXECUTED=NO`

The generated SQL returns structured JSON payloads for:

- global baseline;
- duplicate-group summary;
- candidate-family detail;
- membership detail;
- deleted-family advisory.

It does not call RPCs and contains no mutation statement. Owner may run it later
and paste sanitized aggregate/group evidence into the review pack. Production
names must stay out of committed docs and logs.

## A-17P-FIX1 Corrected Audit Aggregation

- `A17P_FIX1_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_AGGREGATION_GROUP_MAPPING_CORRECTED`
- `AUDIT_QUERY_CORRECTED=YES`
- `EXACT_PARENT_SET_GROUP_MAPPING=YES`
- `JOIN_FAN_OUT_REMOVED=YES`
- `CANDIDATE_CHILD_COUNTS_CORRECTED=YES`
- `DUPLICATE_CHILD_COUNTS_CORRECTED=YES`
- `MEMBERSHIP_DETAIL_GROUP_MAPPING_CORRECTED=YES`
- `LAYOUT_COUNTS_CORRECTED=YES`
- `REVISION_COUNTS_CORRECTED=YES`
- `DELETED_FAMILY_SCOPE_CORRECTED=YES`
- `AUDIT_INTEGRITY_RESULT_SET_ADDED=YES`

Owner-observed production output from the first A-17P SELECT-only run remains
read-only evidence:

- `DUPLICATE_GROUP_COUNT=22`
- `EXPECTED_CANDIDATE_FAMILY_COUNT=60`
- `REDUNDANT_FAMILY_FORECAST=38`
- `TWO_PARENT_CANDIDATE_COUNT=57`
- `ONE_PARENT_CANDIDATE_COUNT=3`
- `EACH_CANDIDATE_FAMILY_HAS_ONE_DISTINCT_CHILD=YES`
- `EXPECTED_PARENT_MEMBERSHIP_DETAIL_ROWS=117`
- `EXPECTED_CHILD_MEMBERSHIP_DETAIL_ROWS=60`
- `PRODUCTION_MUTATION_OCCURRED=NO`

The corrected audit builds duplicate groups from the complete normalized parent
set only. A family is never associated with a group through a single shared
parent. Parent counts, child counts, layout references, revision references and
deleted-family advisory counts are calculated in independent aggregate CTEs
before they are joined to group output.

The corrected duplicate-child semantics count the same child person appearing
across more than one candidate family inside the same exact reconciliation
group. Distinct siblings in separate one-child legacy families do not create a
duplicate-child finding. Duplicate-parent semantics use exact parent person,
role and relationship type within candidate families.

The SQL now also returns `result_set='audit_integrity'` with these fields:

```text
candidate_group_count
candidate_family_count
candidate_pair_uniqueness_pass
membership_pairs_subset_of_candidate_pairs_pass
candidate_child_counts_match_detail_pass
candidate_parent_counts_match_group_identity_pass
duplicate_child_count_semantics_pass
duplicate_parent_count_semantics_pass
deleted_family_advisory_matches_global_scope_pass
layout_counts_not_join_multiplied_pass
revision_counts_not_join_multiplied_pass
```

For the current manual rerun, the expected aggregate evidence is:

```text
EXPECTED_GROUP_COUNT=22
EXPECTED_CANDIDATE_FAMILY_COUNT=60
EXPECTED_REDUNDANT_FAMILY_FORECAST=38
```

These are current production evidence expectations only, not permanent schema
invariants.

## Dry-Run Planner

- `DRY_RUN_PLANNER_CREATED=YES`
- `DRY_RUN_PLANNER_FILE=scripts/a17p-legacy-reconciliation-planner.cjs`
- `DRY_RUN_ONLY=YES`
- `DRY_RUN_DATABASE_CALL_COUNT=0`
- `DRY_RUN_RPC_CALL_COUNT=0`
- `GENEALOGY_MUTATION_COUNT=0`
- `RECONCILIATION_EXECUTED=NO`

The planner accepts audit-model input, normalizes candidates, deduplicates
parent and child memberships, detects data and graph blockers, proposes a
non-executing survivor only when evidence is compatible, forecasts membership
moves, represents layout/audit/revision impact, builds before/after counts and
produces rollback forecast data.

## Survivor Proposal Rules

- `SURVIVOR_PROPOSAL_RULES_CREATED=YES`
- `ARBITRARY_ID_SURVIVOR_SELECTION_PRESENT=NO`
- `SURVIVOR_SELECTED_BY_LOWEST_UUID=NO`
- `SURVIVOR_SELECTED_BY_QUERY_ROW_ORDER=NO`
- `SURVIVOR_SELECTED_BY_EARLIEST_CREATED_AT_ONLY=NO`
- `OWNER_REVIEW_REQUIRED_FOR_ALL_GROUPS=YES`

Evidence factors may include active state, compatible canonical metadata,
reference coverage, stable layout ownership, audit lineage and absence of
conflicting union/period/role/graph data. If those do not produce exactly one
safe proposal, the planner returns `PROPOSED_SURVIVOR_FAMILY_ID=null` and
`RISK_CLASS=OWNER_DECISION_REQUIRED` or a blocker class.

Each proposal includes:

```text
WHY_THIS_SURVIVOR_IS_PROPOSED
WHY_EACH_OTHER_FAMILY_WOULD_BE_VOIDED
WHAT_DATA_WOULD_MOVE
WHAT_DATA_WOULD_NOT_CHANGE
WHAT_OWNER_MUST_VERIFY
```

## Forecasts

- `MEMBERSHIP_MOVE_FORECAST_CREATED=YES`
- `GRAPH_INVARIANT_ANALYSIS_CREATED=YES`
- `LAYOUT_REFERENCE_ANALYSIS_CREATED=YES`
- `AUDIT_REVISION_IMPACT_ANALYSIS_CREATED=YES`
- `BEFORE_AFTER_FORECAST_CREATED=YES`
- `ROLLBACK_FORECAST_CREATED=YES`

Membership invariants:

```text
ONE_ACTIVE_PARENT_MEMBERSHIP_PER_PARENT_PER_FAMILY
ONE_ACTIVE_CHILD_MEMBERSHIP_PER_CHILD_PER_FAMILY
NO_CHILD_LOST
NO_PARENT_LOST
NO_DUPLICATE_MEMBERSHIP_CREATED
```

Count forecast rules:

- `PEOPLE_COUNT_CHANGE_EXPECTED=0`
- `UNIQUE_CHILD_COUNT_CHANGE_EXPECTED=0`
- `UNIQUE_PARENT_COUNT_CHANGE_EXPECTED=0`

The recorded estimate of 38 redundant families remains advisory and is not an
authorized deletion, merge or void count.

## Graph, Layout, Audit And Export Impact

Graph blockers:

```text
A17P_BLOCKED_CYCLE_RISK
A17P_BLOCKED_CONFLICTING_PARENT_SET
A17P_BLOCKED_MULTIPLE_UNION_CONTEXTS
A17P_BLOCKED_PARENT_ROLE_CONFLICT
A17P_BLOCKED_CHILD_RELATIONSHIP_CONFLICT
A17P_BLOCKED_INACTIVE_SURVIVOR
A17P_OWNER_REVIEW_SURVIVOR_AMBIGUOUS
```

Layout output fields:

```text
LAYOUT_MIGRATION_REQUIRED
LAYOUT_REFERENCES_AFFECTED
LAYOUT_REFERENCE_CONFLICT
LAYOUT_RESET_RECOMMENDED
```

Historical revisions and audit rows are preserved as history by default.
Active references needing future migration are forecast but not rewritten in
this phase. Export and backup impact is represented by keeping family,
membership, couple and layout pre-state in rollback forecast.

## Deleted-Family Advisory

- `DELETED_FAMILY_ANALYZED=YES`
- `DELETED_FAMILY_HASH=16ead1f516a885724a2bddd11e14472b`
- `ACTIVE_PARENT_MEMBERSHIPS_UNDER_DELETED_FAMILY=2`
- `ACTIVE_CHILD_MEMBERSHIPS_UNDER_DELETED_FAMILY=0`
- `DELETED_FAMILY_ACTION=SEPARATE_OWNER_DECISION_REQUIRED`
- `DELETED_FAMILY_AUTOMATIC_ACTION_PLANNED=NO`

The known deleted family is separate from the main duplicate execution batch
unless a later owner decision explicitly includes it with a reason. A-17P does
not restore, deactivate, migrate or delete it.

## Owner Review Pack

- `OWNER_REVIEW_PACK_CREATED=YES`
- `OWNER_REVIEW_PACK_TEMPLATE_CREATED=YES`
- `OWNER_REVIEW_PACK_FILE=docs/PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md`
- `OWNER_REVIEW_PACK_TEMPLATE_FILE=docs/templates/A17P_LEGACY_RECONCILIATION_OWNER_REVIEW_PACK_TEMPLATE.md`
- `OWNER_AUTO_APPROVAL_PRESENT=NO`
- `DECISION_PACK_FINALIZED=NO`
- `DECISION_PACK_VERSION=NOT_ASSIGNED`
- `DECISION_PACK_HASH=NOT_CREATED`
- `OWNER_APPROVAL_MARKER=NOT_CREATED`
- `EXECUTION_BATCH_ID=NOT_CREATED`
- `DECISION_PACK_HASH_CREATED=NO`
- `OWNER_APPROVAL_RECORDED=NO`

Owner decision options:

```text
APPROVE_PROPOSED_SURVIVOR
SELECT_DIFFERENT_SURVIVOR
EXCLUDE_GROUP
BLOCK_DATA_CONFLICT
REQUEST_MORE_EVIDENCE
```

## Synthetic Fixtures

- `SYNTHETIC_FIXTURE_COUNT=30`
- `TWO_FAMILY_FRAGMENTATION_TEST=PASS`
- `EIGHT_FAMILY_FRAGMENTATION_TEST=PASS`
- `AMBIGUOUS_SURVIVOR_REQUIRES_OWNER_TEST=PASS`
- `MULTIPLE_UNION_CONTEXT_BLOCK_TEST=PASS`
- `CYCLE_RISK_BLOCK_TEST=PASS`
- `DELETED_FAMILY_SEPARATE_DECISION_TEST=PASS`
- `NO_CHILD_LOST_FORECAST_TEST=PASS`
- `ROLLBACK_RESTORES_ORIGINAL_STATE_TEST=PASS`

All fixtures use synthetic IDs and no production names or row snapshots.

## Safety

- `OFFICIAL_IMPORT_RPC_CALLED=NO`
- `GROUPED_IMPORT_RPC_CALLED=NO`
- `LEGACY_IMPORT_RPC_CALLED=NO`
- `PRODUCTION_SQL_EXECUTED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `CANONICAL_BACKFILL_EXECUTED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `RUNTIME_CHANGED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_CHANGED=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `PACKAGE_DEPENDENCY_INSTALLED=NO`
- `SERVICE_ROLE_USED=NO`

## Validation

- `CHECKER=scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs`
- `PACKAGE_SCRIPT=check:a17p-legacy-reconciliation-audit-dry-run-owner-review-pack`
- `DIRECT_WORKTREE_BUILD_STATUS=PASS`
- `TEMP_COPY_BUILD_STATUS=NOT_REQUIRED`
- `VALIDATION_SUMMARY=PASS`

A-17P-FIX1 static tests added:

- two families sharing only father but different mothers remain separate;
- two families sharing only mother but different fathers remain separate;
- child counts are not multiplied by two parents;
- revision counts are not multiplied by candidate-family count;
- layout counts are not multiplied by membership joins;
- membership detail cannot contain a non-candidate family;
- duplicate child count remains zero when siblings are distinct;
- deleted-family advisory and global orphan scope agree.

## Next

- `NEXT_ACTION=OWNER_RERUN_CORRECTED_A17P_SELECT_ONLY_AUDIT`
- `EXPECTED_SUCCESS_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK_READY`

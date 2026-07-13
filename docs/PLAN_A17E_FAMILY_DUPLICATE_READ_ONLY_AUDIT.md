# A-17E - Family Duplicate Read-Only Audit

Date: 2026-07-12

Status: `A17E_STATUS=PASS_READ_ONLY_FAMILY_DUPLICATE_AUDIT_RECORDED`

## Scope

A-17E audits the current production family structure with SELECT-only SQL. It
does not create schema, modify production rows, execute reconciliation, create
an RPC, retry official import, deploy or push.

Verifier:

- `A17E_SQL=db/checks/20260712_check_a17e_family_duplicate_read_only_audit.sql`
- `A17E_SQL_SCOPE=SELECT_ONLY_STRUCTURAL_AUDIT_NO_PII_OUTPUT`
- `PRODUCTION_AUDIT_QUERY_STATUS=PASS_READ_ONLY`

Privacy:

- `PII_OUTPUT=NO`
- `RAW_UUID_OUTPUT=NO`
- `RAW_GENEALOGY_ROWS_OUTPUT=NO`
- `ANONYMIZED_GROUP_HASH_OUTPUT=YES`

## Production Metrics

| Metric | Value |
| --- | ---: |
| `people_count` | 110 |
| `current_family_count` | 74 |
| `family_parent_membership_count` | 140 |
| `family_child_membership_count` | 73 |
| `couple_relationship_count` | 3 |
| `normalized_parent_set_count` | 35 |
| `duplicate_parent_set_group_count` | 22 |
| `redundant_family_count` | 38 |
| `safe_automatic_group_count` | 0 |
| `owner_review_group_count` | 22 |
| `blocked_ambiguous_group_count` | 0 |
| `non_duplicate_group_count` | 13 |
| `families_with_zero_parents` | 1 |
| `families_with_one_parent` | 6 |
| `families_with_two_parents` | 67 |
| `families_with_more_than_two_parents` | 0 |
| `families_with_zero_children` | 1 |
| `families_with_one_child` | 73 |
| `families_with_multiple_children` | 0 |
| `children_in_multiple_families_count` | 2 |
| `children_in_equivalent_families_count` | 0 |
| `couple_relationship_without_matching_family_count` | 3 |
| `family_parent_pair_without_matching_couple_count` | 67 |
| `invalid_person_reference_count` | 2 |
| `connected_component_count` | 5 |
| `largest_component_people_count` | 99 |
| `people_outside_largest_component_count` | 11 |
| `fully_unconnected_people_count` | 3 |
| `layout_records_referencing_duplicate_families_count` | 3 |
| `inactive_or_soft_deleted_membership_count` | 1 |

## Classification Result

- `SAFE_AUTOMATIC_CANDIDATE_GROUPS=0`
- `OWNER_REVIEW_REQUIRED_GROUPS=22`
- `BLOCKED_AMBIGUOUS_GROUPS=0`
- `NOT_A_DUPLICATE_GROUPS=13`

All duplicate parent-set groups are owner-review required. Most two-parent
duplicate groups differ in family metadata, while the one-parent duplicate group
has layout references. No group is safe for automatic merge in this phase.

Blocking evidence for later production reconciliation:

- `OWNER_REVIEW_GROUP_COUNT_GREATER_THAN_ZERO=YES`
- `INVALID_PERSON_REFERENCE_COUNT_GREATER_THAN_ZERO=YES`
- `LAYOUT_REFERENCES_AFFECTED_COUNT=3`
- `CURRENT_WRITE_PATHS_STILL_UNSAFE=YES`

## A-17P Follow-Up

- `A17P_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK_READY`
- `A17P_EXPECTED_DUPLICATE_PARENT_SET_GROUP_COUNT=22`
- `A17P_REDUNDANT_FAMILY_ESTIMATE=38`
- `A17P_OWNER_REVIEW_REQUIRED=YES`
- `A17P_SAFE_AUTOMATIC_GROUP_COUNT=0`

A-17P supersedes the old "write paths still unsafe" blocker with recorded
A-17N-DR and A-17O-DR deploy evidence, but keeps all duplicate parent-set groups
owner-reviewed and non-executable.

## Duplicate-Group Distinctions

The SQL distinguishes:

1. `EXACTLY_EQUAL_TWO_PARENT_SETS`
2. `EXACTLY_EQUAL_ONE_PARENT_SETS`
3. `EMPTY_PARENT_FAMILIES`
4. `FAMILIES_WITH_MORE_THAN_TWO_PARENTS`
5. `SAME_PARENTS_DIFFERENT_FAMILY_STATUS_OR_VISIBILITY`
6. `SAME_PARENTS_DIFFERENT_MEANINGFUL_RELATIONSHIP_PERIODS`
7. `SAME_PARENTS_DIFFERENT_SOURCE_PROVENANCE`
8. `SAME_PARENTS_WITH_CONFLICTING_COUPLE_METADATA`
9. `SAME_CHILD_INTENTIONALLY_BELONGING_TO_DIFFERENT_FAMILIES`
10. `SAME_CHILD_ACCIDENTALLY_BELONGING_TO_EQUIVALENT_FAMILIES`
11. `FAMILY_WITH_NO_CHILDREN`
12. `FAMILY_WITH_INVALID_OR_MISSING_PERSON_REFERENCES`
13. `SOFT_DELETED_FAMILY_OR_MEMBERSHIP_RECORDS`
14. `REPEATED_RELATIONSHIP_WITH_THE_SAME_SPOUSE`
15. `REMARRIAGE_OR_SEPARATE_MEANINGFUL_UNIONS_NOT_TO_MERGE`

## Safety

- `SQL_EXECUTED=YES_READ_ONLY_SELECT_ONLY`
- `MUTATION_SQL_EXECUTED=NO`
- `SCHEMA_CREATED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_APPLIED=NO`
- `GENEALOGY_ROWS_MODIFIED=NO`
- `RECONCILIATION_RPC_CREATED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `DEPLOY=NO`
- `PUSH=NO`

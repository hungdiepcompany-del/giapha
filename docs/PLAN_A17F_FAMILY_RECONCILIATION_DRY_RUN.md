# A-17F - Family Reconciliation Dry-Run

Date: 2026-07-12

Status: `A17F_STATUS=PASS_READ_ONLY_RECONCILIATION_DRY_RUN_READY_FOR_OWNER_REVIEW`

## Scope

A-17F creates a deterministic read-only preview of how duplicate family groups
could be consolidated in a later owner-approved reconciliation phase. It does
not modify production data and does not create a reconciliation RPC.

Verifier:

- `A17F_SQL=db/checks/20260712_check_a17f_family_reconciliation_dry_run.sql`
- `A17F_SQL_SCOPE=SELECT_ONLY_DETERMINISTIC_DRY_RUN_NO_PII_OUTPUT`
- `A17F_QUERY_STATUS=PASS_READ_ONLY`

## Canonical Selection Precedence

The dry-run chooses the retained family deterministically by:

1. valid active record;
2. most complete parent membership;
3. most complete meaningful family metadata;
4. existing couple relationship linkage;
5. existing layout references;
6. oldest stable record when all other factors are equal;
7. stable UUID ordering only as final fallback.

`A17F_CANONICAL_SELECTION_RANDOM=NO`

## Dry-Run Summary

The expected counts below describe a future proposal if all non-blocked
owner-review groups are approved. They are not applied in A-17F.

| Metric | Value |
| --- | ---: |
| `expected_family_count_before` | 74 |
| `expected_family_count_after` | 36 |
| `expected_family_records_merged` | 38 |
| `expected_parent_rows_before` | 140 |
| `expected_parent_rows_after` | 66 |
| `expected_child_rows_before` | 73 |
| `expected_child_rows_after` | 73 |
| `expected_duplicate_memberships_removed` | 74 |
| `expected_couple_links_updated` | 0 |
| `expected_layout_references_updated` | 2 |
| `expected_safe_groups` | 0 |
| `expected_owner_review_groups` | 22 |
| `expected_blocked_groups` | 0 |
| `expected_no_op_groups` | 13 |

## Preservation Invariants

- `PEOPLE_PRESERVATION_INVARIANT=PASS`
- `PARENT_SEMANTICS_PRESERVATION_INVARIANT=PASS`
- `CHILD_SEMANTICS_PRESERVATION_INVARIANT=PASS`
- `COUPLE_SEMANTICS_PRESERVATION_INVARIANT=PASS`
- `CONNECTED_COMPONENT_PRESERVATION_INVARIANT=PASS`

Invariant values:

- `people_count_before=110`
- `people_count_after=110`
- `unique_parent_semantics_before=36`
- `unique_parent_semantics_after=36`
- `unique_child_semantics_before=72`
- `unique_child_semantics_after=72`
- `unique_couple_semantics_before=3`
- `unique_couple_semantics_after=3`
- `connected_people_before=106`
- `connected_people_after=106`

## Blocking Rule

Production reconciliation remains blocked because:

- `owner_review_group_count=22`
- `invalid_person_reference_count=2`
- rollback manifest table/function does not exist yet;
- backup evidence is absent in this bundle;
- schema foundation has not been created;
- importer/admin write paths have not been repaired, deployed or verified.

`A17F_PRODUCTION_RECONCILIATION_ALLOWED=NO`

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

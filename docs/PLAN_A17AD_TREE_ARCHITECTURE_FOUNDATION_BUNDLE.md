# A-17A to A-17D - Tree Architecture Foundation Bundle

Date: 2026-07-12

Status: `A17AD_BUNDLE_STATUS=OWNER_APPROVED_READY_FOR_SEPARATE_A17E_A17G`

Owner approval:

- `A17_OWNER_APPROVAL_RECORDED=YES`
- `A17_OWNER_APPROVAL_MARKER=APPROVE_A17_CANONICAL_FAMILY_AND_TREE_UX_DESIGN`

## Phase Status

- `A17A_STATUS=PASS_READ_ONLY_BASELINE_RECORDED`
- `A17B_STATUS=CANONICAL_FAMILY_DESIGN_READY_FOR_OWNER_REVIEW`
- `A17C_STATUS=PHATUE_ORIENTED_UX_CONTRACT_READY_FOR_OWNER_REVIEW`
- `A17D_STATUS=CANONICAL_GRAPH_CONTRACT_READY_FOR_OWNER_REVIEW`

## Baseline Summary

Read-only production baseline:

- `people_count=110`
- `families_count=74`
- `family_parents_count=140`
- `family_children_count=73`
- `couple_relationships_count=3`
- `duplicate_parent_set_group_count=22`
- `redundant_family_count_estimate=38`
- `families_with_multiple_children=0`
- `connected_component_count=5`
- `largest_connected_component_people_count=99`
- `saved_tree_layout_count=1`
- `saved_tree_layout_node_count=13`
- `locked_layout_node_count=0`

The current data shape supports the architecture concern: many family rows look
child-scoped, while target behavior should be one meaningful canonical family
unit per parent or union context.

## Source Behavior Summary

- `IMPORTER_PER_CHILD_FAMILY_BEHAVIOR_CONFIRMED=YES`
- `ADMIN_ADD_PARENT_CREATES_NEW_FAMILY_CONFIRMED=YES`
- `ADMIN_ADD_CHILD_CREATES_NEW_FAMILY_CONFIRMED=YES`
- `ADD_SPOUSE_CREATES_COUPLE_WITHOUT_CANONICAL_FAMILY_LINK_CONFIRMED=YES`
- `COUPLE_AND_FAMILY_RENDER_DUPLICATION_RISK_CONFIRMED=YES`
- `GENERIC_ELK_LAYOUT_CONFIRMED=YES`
- `SAVED_LAYOUT_OVERWRITE_RISK_CONFIRMED=YES`
- `VIEWER_VIETNAMESE_SEARCH_NORMALIZATION_GAP_CONFIRMED=YES`

## Contract Summary

Canonical family:

- Not child-keyed.
- Based on normalized active parent IDs plus union identity, period, status,
  provenance and legacy exceptions.
- Uses merge classes `SAFE_AUTOMATIC_CANDIDATE`,
  `OWNER_REVIEW_REQUIRED`, `BLOCKED_AMBIGUOUS`, and `NOT_A_DUPLICATE`.

UX:

- Default view should focus a selected person or component.
- View modes are `Gia đình trực tiếp`, `Tổ tiên`, `Hậu duệ`,
  `Toàn bộ cây`, `Theo chi/nhánh`, and `Người chưa kết nối`.
- Family units should be compact junction nodes.
- Search must normalize Vietnamese diacritics consistently.

Graph:

- `TreePersonNode`, `TreeFamilyUnit`, `TreeGraphEdge` and `TreeGraphContext`
  define the target graph boundary.
- Saved layout priority is locked saved, saved, generated, fallback.
- Diagnostics must be counts/codes only, never private data.

## Explicit Non-Actions

- `SQL_MUTATION_EXECUTED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_APPLIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `RPC_MUTATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `OFFICIAL_IMPORT_RETRY=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `PACKAGE_DEPENDENCY_INSTALLED=NO`
- `RUNTIME_CODE_CHANGED=NO`

## Owner Review Marker

Owner marker recorded:

`APPROVE_A17_CANONICAL_FAMILY_AND_TREE_UX_DESIGN`

Next action:

`RUN_SEPARATE_A17E_A17G_READ_ONLY_AUDIT_DRY_RUN_BUNDLE`

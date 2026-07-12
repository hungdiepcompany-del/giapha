# A-17A - Tree Baseline Evidence

Date: 2026-07-12

Status: `A17A_STATUS=PASS_READ_ONLY_BASELINE_RECORDED`

## Scope

A-17A records the current production tree structure and current source-code
behavior before any canonical-family schema, reconciliation, migration, runtime
or UI implementation work.

Safety:

- `SQL_EXECUTED=YES_READ_ONLY_SELECT_ONLY`
- `MUTATION_SQL_EXECUTED=NO`
- `MIGRATION_CREATED=NO`
- `MIGRATION_APPLIED=NO`
- `RECONCILIATION_EXECUTED=NO`
- `RPC_MUTATION_EXECUTED=NO`
- `IMPORT_RPC_CALLED=NO`
- `OFFICIAL_IMPORT_RETRY=NO`
- `DEPLOY=NO`
- `PUSH=NO`
- `PRODUCTION_ROWS_PRINTED=NO`
- `PII_OUTPUT=NO`

Verifier:

- `A17A_TREE_BASELINE_SQL=db/checks/20260712_check_a17a_tree_baseline_evidence.sql`
- `A17A_TREE_BASELINE_SQL_SCOPE=SELECT_ONLY_STRUCTURAL_BASELINE_NO_PII_OUTPUT`
- `A17A_TREE_BASELINE_RESULT=PASS_READ_ONLY`

## Production Baseline Metrics

The verifier uses active rows only and returns aggregate counts, structural
booleans and a generation-number distribution. It does not print person names,
dates, home towns, private notes, emails, auth IDs, raw genealogy records or raw
import payloads.

| Metric | Value |
| --- | ---: |
| `people_count` | 110 |
| `families_count` | 74 |
| `family_parents_count` | 140 |
| `family_children_count` | 73 |
| `couple_relationships_count` | 3 |
| `distinct_parent_set_count` | 35 |
| `duplicate_parent_set_group_count` | 22 |
| `redundant_family_count_estimate` | 38 |
| `families_with_zero_parents` | 1 |
| `families_with_one_parent` | 6 |
| `families_with_two_parents` | 67 |
| `families_with_more_than_two_parents` | 0 |
| `families_with_zero_children` | 1 |
| `families_with_one_child` | 73 |
| `families_with_multiple_children` | 0 |
| `child_membership_count` | 73 |
| `children_in_multiple_equivalent_families_count` | 0 |
| `people_without_any_family_membership_count` | 4 |
| `connected_component_count` | 5 |
| `largest_connected_component_people_count` | 99 |
| `unconnected_people_count` | 3 |
| `explicit_generation_number_distribution` | `{"1":"4","2":"2","3":"12","4":"10","6":"32","7":"18"}` |
| `people_without_generation_number_count` | 32 |
| `saved_tree_layout_count` | 1 |
| `saved_tree_layout_node_count` | 13 |
| `locked_layout_node_count` | 0 |
| `couple_relationship_without_matching_family_count` | 3 |
| `family_parent_pair_without_matching_couple_relationship_count` | 67 |

Baseline interpretation:

- Current production has `74` active family units but every active child family
  has at most one child: `families_with_one_child=73` and
  `families_with_multiple_children=0`.
- The read-only parent-set audit found `22` duplicate parent-set groups and a
  `redundant_family_count_estimate=38`. This supports the importer-review
  hypothesis that current family rows are often child-scoped rather than
  canonical union-scoped.
- Couple records and family parent memberships are not aligned today:
  `couple_relationships_count=3`,
  `couple_relationship_without_matching_family_count=3`, and
  `family_parent_pair_without_matching_couple_relationship_count=67`.
- Saved layout exists (`saved_tree_layout_count=1`,
  `saved_tree_layout_node_count=13`), but `locked_layout_node_count=0`, so the
  next contract must define whether saved positions outrank auto-layout.

## Parent-Set Normalization For Audit

Read-only audit normalization:

- `A17A_PARENT_SET_NORMALIZATION=sorted_active_parent_person_ids`
- `A17A_EQUAL_PARENT_SET_SAFE_TO_MERGE_AUTOMATICALLY=NO`

The audit distinguishes:

- `EXACTLY_EQUIVALENT_PARENT_SETS`: same sorted active parent IDs.
- `SAME_PARENT_SET_DIFFERENT_MEANINGFUL_UNION_IDENTITY`: repeated relationship,
  remarriage context, status difference, period difference or source-provenance
  difference may require separate family units.
- `SINGLE_PARENT_FAMILY`: one known parent, not automatically incomplete.
- `EMPTY_PARENT_FAMILY`: no active parent membership, needs owner review.
- `AMBIGUOUS_REMARRIAGE_OR_REPEATED_UNION`: same people can still represent
  different meaningful contexts.
- `INACTIVE_OR_DELETED_MEMBERSHIP`: excluded from the active baseline and must
  be checked separately before reconciliation.

## Source Baseline Findings

| Layer | Source | Function / Area | Current behavior | Structural risk | Proposed target |
| --- | --- | --- | --- | --- | --- |
| Data/import | `db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql` | official import family CTEs | Importer creates a `family_id` per child mapping before inserting family, parent and child rows. | Shared siblings can become separate family rows with identical parent sets. | Import or later reconciliation must use `findOrCreateCanonicalFamily` instead of child-keyed family creation. |
| Domain service | `lib/family/relationship-service.ts` | `createFamily`, `addParentToFamily`, `addChildToFamily`, `createCoupleRelationship` | Family creation and membership attachment are caller-directed; no canonical lookup or merge safety class. | Admin actions can create duplicates even after import cleanup. | Introduce canonical-family operations and owner-review merge classification. |
| Admin action | `app/(admin)/admin/tree/edit/actions.ts` | `addParentFromTreeAction`, `addChildFromTreeAction`, `createPersonAndAttachFromTreeAction` | Parent/child edits create a new family before attaching both sides. | Manual edits can multiply equivalent family units. | Reuse an existing canonical family when the normalized identity matches and is safe. |
| Admin action | `app/(admin)/admin/tree/edit/actions.ts` | `addSpouseFromTreeAction` | Adds a couple relationship without linking or creating a family unit. | Spouse union and family unit can render as separate concepts. | Couple metadata should attach to the canonical family when applicable. |
| Graph | `lib/family/tree-graph-builder.ts` | `buildFamilyTreeGraph`, `toFamilyNode` | Family rows become visible `family:*` card nodes; couple rows become separate `couple` edges. | Equivalent family rows and couple edges can duplicate one union. | Graph should expose compact `family_unit` nodes and suppress duplicate couple rendering when represented by the unit. |
| Graph | `lib/family/tree-graph-builder.ts` | parent/child edge mapping | Edge labels are raw relationship enums such as `parent_role` and `child_relationship_type`. | Technical English values may leak into the user interface. | Graph contract should provide Vietnamese display labels and keep raw values internal. |
| Layout | `lib/family/tree-layout-elk.ts` | `layoutFamilyTreeGraph` | Uses generic ELK layered layout with `DOWN` direction. | Spouses are not guaranteed on the same rank; siblings are not guaranteed to share one trunk. | Layout must be generation-aware, family-unit-centered, sibling-group aware and component aware. |
| Layout fallback | `lib/family/tree-layout-elk.ts` | catch fallback | On ELK error, returns graph positions unchanged. | Nodes can stack at `(0,0)` when no prior layout exists. | Fallback must produce deterministic non-overlapping rows and safe diagnostics. |
| UI/viewer | `components/tree/family-tree-viewer.tsx` | mount layout and `fitView` | Viewer runs auto-layout after graph load and fits the whole graph. | Initial viewport can become a global overview instead of selected-person context. | Initial view should center a focus person or component, with explicit whole-tree mode. |
| UI/editor | `components/tree/family-tree-editor.tsx` | mount layout | Editor auto-layouts after receiving graph even when server applied saved layout. | Saved positions can be overwritten after mount. | Saved layout must outrank auto-layout unless owner chooses relayout. |
| UI/node | `components/tree/family-node-card.tsx` | family node card | Family node appears as a visible card with technical summary. | Union junction dominates the canvas and looks like an entity record. | Family unit should be a compact junction with clear Vietnamese tooltip/details. |
| UI/node | `components/tree/family-node-card.tsx` | person/family handles | Person and family handles are top/bottom only. | Spouse/union edges cannot express horizontal semantics. | Person nodes need side handles for union/spouse context and vertical handles for lineage. |
| Public projection | `lib/family/public-family-service.ts`, `lib/privacy/privacy-service.ts` | public tree graph | Public graph is server-projected and privacy-filtered before graph build/sanitize. | Same graph duplication/layout issues can affect public pages. | Public projection should consume the same canonical graph with privacy-safe fields only. |
| Admin projection | `app/(admin)/admin/tree/edit/page.tsx`, `lib/family/tree-layout-service.ts` | saved layout loading/application | Server applies saved layout by node id; client editor relayout can override it. | Owner manual layout loses priority. | Define `saved`, `locked`, `generated`, and `missing-node` layout precedence. |
| Search | `components/tree/family-tree-viewer.tsx`, `components/tree/tree-editor-side-panel.tsx` | search normalization | Side panel normalizes Vietnamese diacritics; viewer search only lowercases. | Search is inconsistent for Vietnamese names. | Shared Vietnamese normalization must power viewer, editor and picker search. |
| Components | `components/tree/family-tree-viewer.tsx`, `components/tree/family-tree-editor.tsx` | connected components | Components are not separated before fit/layout. | Small disconnected groups can compress or hide the main family context. | Graph contract should expose connected components, focus component and unconnected people mode. |

## Confirmed Current Behavior

- `IMPORTER_PER_CHILD_FAMILY_BEHAVIOR_CONFIRMED=YES`
- `ADMIN_ADD_PARENT_CREATES_NEW_FAMILY_CONFIRMED=YES`
- `ADMIN_ADD_CHILD_CREATES_NEW_FAMILY_CONFIRMED=YES`
- `ADD_SPOUSE_CREATES_COUPLE_WITHOUT_CANONICAL_FAMILY_LINK_CONFIRMED=YES`
- `COUPLE_AND_FAMILY_RENDER_DUPLICATION_RISK_CONFIRMED=YES`
- `GENERIC_ELK_LAYOUT_CONFIRMED=YES`
- `SAVED_LAYOUT_OVERWRITE_RISK_CONFIRMED=YES`
- `GLOBAL_FITVIEW_BEHAVIOR_CONFIRMED=YES`
- `VIEWER_VIETNAMESE_SEARCH_NORMALIZATION_GAP_CONFIRMED=YES`
- `TECHNICAL_ENUM_LABEL_LEAK_RISK_CONFIRMED=YES`

## Validation

- `npx.cmd --yes supabase db query --linked --file db/checks/20260712_check_a17a_tree_baseline_evidence.sql`: PASS
- `npm.cmd run check:a17a-tree-baseline-evidence`: PASS after checker creation

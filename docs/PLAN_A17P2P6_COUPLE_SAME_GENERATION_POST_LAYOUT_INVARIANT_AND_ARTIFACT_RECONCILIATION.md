# A17P2P6 Couple Same-Generation Post-Layout Invariant And Artifact Reconciliation

PHASE=A17P2P6_COUPLE_SAME_GENERATION_POST_LAYOUT_INVARIANT_AND_ARTIFACT_RECONCILIATION

STATUS=SOURCE_VALIDATED_LOCAL_BROWSER_SMOKE_BLOCKED_HTTP_500_OWNER_ARTIFACT_SMOKE_REQUIRED

PRE_PHASE_HEAD=e6d4e066938982b7abec9cf00c088228ef46ed18

## Scope

- Keep `ACTIVE_PRINT_DIRECTION=LARGE_FORMAT_SINGLE_ARTBOARD`.
- Keep `OFFICE_TILED_MODE=RETIRED`.
- Keep SVG as the authoritative vector master.
- Keep browser PDF as native browser print, secondary to SVG.
- Do not commit, push, deploy, run migrations, mutate production data, change Auth/OAuth, change permissions, change `_guard`, add dependencies, or restore tiled runtime.

## Owner Artifact Finding

A17P2P5 source validation PASS but owner visual artifact smoke FAIL. Owner artifacts showed that spouse or couple endpoints could appear on different generation lanes in both true orientations:

- landscape top-to-bottom: couple endpoints must share the Y generation axis;
- portrait left-to-right: couple endpoints must share the X generation axis.

The A17P2P5 source tests only proved selected fixture pairs. They did not scan every semantic spouse relation across solve, layout, packing and pre-export stages.

## Root Cause

ROOT_CAUSE_CATEGORY=A17P2P5_SEMANTIC_SPOUSE_GROUP_INCOMPLETE

ROOT_CAUSE_FILE=lib/family/print/tree-print-layout-orientation.ts

ROOT_CAUSE_FUNCTION=buildRelationshipMaps / solveGenerations / createTreePrintLayoutCandidate

The A17P2P5 solver condensed spouse groups only from rendered `relationshipKind="couple"` edges. The upstream graph builder intentionally skips rendered couple edges when a `couple_relationship` is attached to an existing `family_id`, because the family junction already represents the local family unit. In that common case, the semantic spouse or co-parent relation exists as multiple `parent_to_family` edges pointing to the same family junction.

Because shared-family parents were not part of the spouse union-find, parent-child propagation could move one spouse group to a later print generation while the other co-parent stayed in the older lane. Layout and component packing had no mandatory invariant validator, so the bad candidate could still reach SVG/PDF eligibility.

## Source Fix

SOURCE_FIX=YES

SOLVER_STRATEGY=SEMANTIC_COUPLE_GROUP_CONDENSATION_WITH_DETERMINISTIC_UNION_FIND

SPOUSE_GROUP_CONDENSATION=EXPLICIT_COUPLE_EDGE_PLUS_SHARED_FAMILY_PARENTS

Added `lib/family/print/tree-print-couple-invariants.ts`:

- `collectTreePrintSemanticCoupleRelations()`.
- `validateCoupleGenerationInvariant()`.
- `validateCoupleLayoutAxisInvariant()`.
- `validateCoupleComponentInvariant()`.
- Diagnostic codes:
  - `A17P2P6_COUPLE_GENERATION_MISMATCH`.
  - `A17P2P6_COUPLE_LAYOUT_AXIS_MISMATCH`.
  - `A17P2P6_COUPLE_POST_PACKING_AXIS_MISMATCH`.
  - `A17P2P6_COUPLE_CROSS_COMPONENT_INVALID`.
  - `A17P2P6_PRINT_LAYOUT_INVALID_COORDINATE`.
  - `A17P2P6_GENERATION_CONSTRAINT_CYCLE`.

Added layout algorithm version:

- `TREE_PRINT_LAYOUT_ALGORITHM_VERSION=A17P2P6_SEMANTIC_COUPLE_INVARIANT_V1`.

Large-format export stays version-compatible with A17P2P5 while carrying the new layout version separately.

## Invariant Contract

COUPLE_GENERATION_INVARIANT=post-solve semantic couple endpoints must share `layoutGenerationIndex`.

TOP_DOWN_LAYOUT_AXIS_INVARIANT=landscape/top-to-bottom semantic couple endpoints must share generation-axis Y.

LEFT_RIGHT_LAYOUT_AXIS_INVARIANT=portrait/left-to-right semantic couple endpoints must share generation-axis X.

POST_PACKING_INVARIANT=component packing must not split semantic couple endpoints or apply non-uniform translation inside a component.

PRE_EXPORT_FAIL_CLOSED=large-format plan adds blockers for every A17P2P6 invariant violation before SVG download or browser PDF print can proceed.

## Viewport Containment

VIEWPORT_CONTAINMENT=A17P2P6_PRINT_WORKSPACE_DOCUMENT_OVERFLOW

The print workspace separates physical export dimensions from UI preview dimensions:

- export SVG keeps `width="${exportWidthMm}mm"` and `height="${exportHeightMm}mm"`;
- screen preview uses a dedicated viewport with `min-width: 0`, `max-width: 100%` and internal `overflow-auto`;
- large-format screen SVG uses pixel preview size from visual scale, not physical millimeters;
- `calculateTreePrintPreviewScale()` uses `min(availableViewportWidth / artboardLogicalWidth, availableViewportHeight / artboardLogicalHeight)`;
- diagnostics panel is bounded, sticky on desktop, scrollable, and collapsible;
- desktop grid uses `minmax(0,1fr)` for the preview column and bounded diagnostics column.

The UI controls now include:

- `Vua man hinh` / fit-to-screen mode;
- `100% preview`;
- zoom in;
- zoom out;
- diagnostics panel collapse.

## Files Changed

- `app/globals.css`.
- `components/tree-print/tree-print-diagnostics-panel.tsx`.
- `components/tree-print/tree-print-toolbar.tsx`.
- `components/tree-print/tree-print-workspace.tsx`.
- `lib/family/print/tree-print-component-packing.ts`.
- `lib/family/print/tree-print-couple-invariants.ts`.
- `lib/family/print/tree-print-large-format.ts`.
- `lib/family/print/tree-print-layout-orientation.ts`.
- `lib/family/print/tree-print-preview-scale.ts`.
- `lib/family/print/tree-print-types.ts`.
- `package.json`.
- `scripts/check-a17p2p6-couple-generation-layout-invariant.cjs`.
- `scripts/test-a17p2p6-couple-solver.cjs`.
- `scripts/test-a17p2p6-order-independence.cjs`.
- `scripts/test-a17p2p6-layout-axis.cjs`.
- `scripts/test-a17p2p6-packing.cjs`.
- `scripts/test-a17p2p6-fail-closed.cjs`.
- `scripts/test-a17p2p6-export-regression.cjs`.

## Test Matrix

- CHECK_A17R=PASS.
- CHECK_A17R1=PASS.
- CHECK_A17P0=PASS.
- TEST_A17P0_PRINT=PASS.
- CHECK_A17P0U1=PASS.
- TEST_A17P0U1_TOOLBAR=PASS.
- CHECK_A17P1=PASS.
- TEST_A17P1_PRINT_EXPORT=PASS.
- CHECK_A17P1R=PASS.
- TEST_A17P1R_PRINT_SINGLETON=PASS.
- CHECK_A17P2P=PASS.
- TEST_A17P2P_RETIREMENT=PASS.
- TEST_A17P2P_GEOMETRY=PASS.
- TEST_A17P2P_SVG=PASS.
- TEST_A17P2P_ELIGIBILITY=PASS.
- TEST_A17P2P_BRANCH=PASS.
- CHECK_A17P2P5=PASS.
- TEST_A17P2P5_ORIENTATION=PASS.
- TEST_A17P2P5_LAYOUT=PASS.
- TEST_A17P2P5_PACKING=PASS.
- TEST_A17P2P5_SCALING=PASS.
- TEST_A17P2P5_EXPORT=PASS.
- CHECK_A17P2P6=PASS.
- TEST_A17P2P6_SOLVER=PASS.
- TEST_A17P2P6_ORDER_INDEPENDENCE=PASS.
- TEST_A17P2P6_LAYOUT_AXIS=PASS.
- TEST_A17P2P6_PACKING=PASS.
- TEST_A17P2P6_FAIL_CLOSED=PASS.
- TEST_A17P2P6_EXPORT_REGRESSION=PASS.
- TYPECHECK=PASS.
- LINT=PASS.
- BUILD=PASS.
- GIT_DIFF_CHECK=PASS_WITH_CRLF_WARNINGS_ONLY_FOR_INHERITED_DIRTY_DOCS_GUARD_FILES.
- LOCAL_HTTP_ROOT_SMOKE=BLOCKED_HTTP_500.
- LOCAL_HTTP_PRINT_ROUTE_SMOKE=BLOCKED_HTTP_500.
- IN_APP_BROWSER_PRINT_WORKSPACE_SMOKE=BLOCKED_NAV_ERR_BLOCKED_BY_CLIENT_AND_NO_PRINT_DOM.
- OWNER_ARTIFACT_SMOKE=NOT_RUN.

## Artifact Smoke Instructions

After source validation, owner must generate and inspect:

- `A17P2P6_TRUE_ORIENTATION_FULL_TREE_LANDSCAPE.svg`.
- `A17P2P6_TRUE_ORIENTATION_FULL_TREE_LANDSCAPE_BROWSER.pdf`.
- `A17P2P6_TRUE_ORIENTATION_FULL_TREE_PORTRAIT.svg`.
- `A17P2P6_TRUE_ORIENTATION_FULL_TREE_PORTRAIT_BROWSER.pdf`.

Owner acceptance requires every semantic couple endpoint to share the correct generation lane in both orientations and after component packing, with SVG vector, browser custom-size PDF, physical scale 1:1 and page count 1.

## Known Limitations

- Source validation cannot prove owner visual artifact PASS without new owner screenshots/artifacts.
- Local browser smoke could not prove the print DOM because the local dev server returned HTTP 500 for both `/` and `/admin/tree/print`; the in-app browser navigation also reported `net::ERR_BLOCKED_BY_CLIENT` and found no print workspace DOM.
- Browser PDF remains browser-native and environment-dependent.

## Commit Gate

COMMIT_STATUS=NOT_CREATED_OWNER_ARTIFACT_SMOKE_REQUIRED

Do not commit, push or deploy until owner artifact smoke PASS is supplied in a separate closeout phase.

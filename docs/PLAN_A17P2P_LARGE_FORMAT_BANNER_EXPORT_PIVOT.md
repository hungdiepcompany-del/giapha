# A17P2P Large-Format Banner Export Pivot

PROGRAM=A17P2P_LARGE_FORMAT_BANNER_EXPORT_PIVOT_AND_TILED_RUNTIME_RETIREMENT
STATUS=SOURCE_IMPLEMENTED_VALIDATION_PENDING_OWNER_LARGE_FORMAT_ARTIFACT_SMOKE_REQUIRED

## Direction

PRIMARY_OUTPUT=ONE_CONTINUOUS_LARGE_FORMAT_VECTOR_ARTBOARD
ACTIVE_PRINT_DIRECTION=LARGE_FORMAT_SINGLE_ARTBOARD
OFFICE_TILED_DIRECTION=RETIRED
OFFICE_TILED_MODE=RETIRED
ACTIVE_ORIENTATION_MODEL=TRUE_LAYOUT_BASED_ORIENTATION
NEXT_PHASE=OWNER_TRUE_ORIENTATION_ARTIFACT_SMOKE

A17P2P replaces the uncommitted office-paper tiled runtime with a production-oriented banner/roll-media workflow. The supported print modes are:

- `LARGE_FORMAT_FULL_TREE`: default production mode for the complete print snapshot.
- `LARGE_FORMAT_BRANCH`: production mode using the runtime-neutral branch-scope engine.
- `ONE_PAGE_OVERVIEW`: A17P1 compatibility mode for technical overview only.

The old office-tiled implementation is not retained as a hidden runtime path.

## A17P2P5_TRUE_ORIENTATION_RECONCILIATION

STATUS=SOURCE_VALIDATED_OWNER_TRUE_ORIENTATION_ARTIFACT_SMOKE_REQUIRED

A17P2P5 reconciles the large-format banner model with real physical orientation:

- `ACTIVE_PRINT_DIRECTION=LARGE_FORMAT_SINGLE_ARTBOARD`.
- `ACTIVE_ORIENTATION_MODEL=TRUE_LAYOUT_BASED_ORIENTATION`.
- `OFFICE_TILED_MODE=RETIRED`.
- `NEXT_PHASE=OWNER_TRUE_ORIENTATION_ARTIFACT_SMOKE`.

Runtime architecture:

- `lib/family/print/tree-print-orientation.ts` owns requested artboard orientation, resolved orientation, layout flow labels and the width/height invariant.
- `lib/family/print/tree-print-layout-orientation.ts` builds print-only layout candidates for `top-to-bottom` landscape and `left-to-right` portrait instead of rotating the SVG globally.
- `lib/family/print/tree-print-component-packing.ts` packs disconnected print components deterministically and reports packing efficiency, internal whitespace and overlap diagnostics.
- `lib/family/print/tree-print-large-format.ts` version is `A17P2P5_TRUE_ORIENTATION_V1` and emits the selected print document, requested/resolved orientation, layout flow, candidate diagnostics and scores.

Orientation contract:

- Landscape means `finishedWidthMm > finishedHeightMm` and layout flow `top-to-bottom`.
- Portrait means `finishedHeightMm > finishedWidthMm` and layout flow `left-to-right`.
- Auto compares valid candidate plans and stores `orientationResolution`.
- The print SVG keeps text upright with `TREE_ROTATION_DEGREES=0` and `PERSON_CARD_TEXT_ROTATION_DEGREES=0`.
- Browser PDF page style uses the resolved export width/height in millimeters.

Component and scale contract:

- `COMPONENT_PACKING=PRINT_ONLY_DETERMINISTIC`.
- Component packing is print-only and does not mutate saved layout or viewer/editor layout.
- Node overlap, component overlap, missing nodes/edges, dangling edges, invalid paths and edge-card intersections are surfaced in diagnostics.
- Full-tree large format defaults to full roll width.
- Branch large format defaults to target font size 18pt with no-upscale protection and a 24pt recommended maximum.
- SVG remains the authoritative master; browser PDF remains native and secondary.

## Runtime Contract

- SVG is the authoritative master export.
- Browser PDF remains secondary and browser-native.
- No bitmap PDF, canvas capture, headless browser, external PDF service, server PDF runtime, database write, saved-layout mutation, viewer/editor layout change, Auth/OAuth change, guard change, migration, push or deploy is part of this phase.
- The print DOM still uses one print root and one print document.
- Large-format export sets physical SVG `width` and `height` in `mm`.
- `PAGE_COUNT=1`.
- `SCALE=1_TO_1`.
- `COLOR_MODEL=RGB`.
- `VECTOR_TREE=YES`.
- `TEXT_OUTLINED=NO_UNLESS_VERIFIED`.

## Physical Model

The shared model is `lib/family/print/tree-print-large-format.ts`.

Roll/media widths:

- 1000mm
- 1200mm
- 1500mm
- 1800mm
- 2000mm
- custom 500-5000mm

Sizing strategies:

- `USE_FULL_ROLL_WIDTH`
- `TARGET_FONT_SIZE`

Length modes:

- `AUTO_FROM_CONTENT`
- `CUSTOM_LENGTH`

Safe margin presets:

- 20mm
- 30mm
- 50mm
- 75mm
- 100mm
- custom 0-300mm

Bleed presets:

- 0mm
- 10mm
- 20mm
- 30mm
- 50mm
- custom 0-200mm

## Retirement Evidence

Office-tiled runtime files retired from current runtime:

- `lib/family/print/tree-print-tiling.ts`
- `components/tree-print/tree-print-page-map.tsx`
- old page-local SVG, page-map, page-loop and continuation-marker code paths
- A17P2/A17P2R/A17P2R1 checker and tiled tests
- obsolete package scripts for A17P2/A17P2R/A17P2R1

Salvaged runtime-neutral code:

- `lib/family/print/tree-print-branch-scope.ts`
- shared SVG serialization
- shared print document lifecycle
- shared unit conversion and A17P1 one-page overview compatibility

## Validation Plan

Source validation:

- `npm.cmd run check:a17r`
- `npm.cmd run check:a17r1`
- `npm.cmd run check:a17p0`
- `npm.cmd run test:a17p0:print`
- `npm.cmd run check:a17p0u1`
- `npm.cmd run test:a17p0u1:toolbar`
- `npm.cmd run check:a17p1`
- `npm.cmd run test:a17p1:print-export`
- `npm.cmd run check:a17p1r`
- `npm.cmd run test:a17p1r:print-singleton`
- `npm.cmd run check:a17p2p`
- `npm.cmd run test:a17p2p:retirement`
- `npm.cmd run test:a17p2p:geometry`
- `npm.cmd run test:a17p2p:svg`
- `npm.cmd run test:a17p2p:eligibility`
- `npm.cmd run test:a17p2p:branch`
- `npm.cmd run check:a17p2p5`
- `npm.cmd run test:a17p2p5:orientation`
- `npm.cmd run test:a17p2p5:layout`
- `npm.cmd run test:a17p2p5:packing`
- `npm.cmd run test:a17p2p5:scaling`
- `npm.cmd run test:a17p2p5:export`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

Owner artifact gate:

- 1500mm full-tree SVG.
- 2000mm full-tree SVG.
- one branch SVG.
- one browser PDF attempt.
- owner visual confirmation that portrait export is physically taller than wide when requested/resolved as portrait.
- owner visual confirmation that unrelated components are not spread across excessive blank roll space.

Do not commit until owner-generated large-format artifacts are inspected.

## A17P2P5 Validation Result

SOURCE_VALIDATION=PASS
BROWSER_VISUAL_SMOKE=BLOCKED_ROUTE_GRAPH_PREVIEW_SAFE_ERROR
OWNER_TRUE_ORIENTATION_ARTIFACT_SMOKE=PENDING_OWNER_UPLOAD
COMMIT_STATUS=NOT_CREATED_OWNER_ARTIFACT_SMOKE_REQUIRED
PUSH_STATUS=NOT_RUN
DEPLOY_STATUS=NOT_RUN

Validated commands:

- `npm.cmd run check:a17r`
- `npm.cmd run check:a17r1`
- `npm.cmd run check:a17p0`
- `npm.cmd run test:a17p0:print`
- `npm.cmd run check:a17p0u1`
- `npm.cmd run test:a17p0u1:toolbar`
- `npm.cmd run check:a17p1`
- `npm.cmd run test:a17p1:print-export`
- `npm.cmd run check:a17p1r`
- `npm.cmd run test:a17p1r:print-singleton`
- `npm.cmd run check:a17p2p`
- `npm.cmd run test:a17p2p:retirement`
- `npm.cmd run test:a17p2p:geometry`
- `npm.cmd run test:a17p2p:svg`
- `npm.cmd run test:a17p2p:eligibility`
- `npm.cmd run test:a17p2p:branch`
- `npm.cmd run check:a17p2p5`
- `npm.cmd run test:a17p2p5:orientation`
- `npm.cmd run test:a17p2p5:layout`
- `npm.cmd run test:a17p2p5:packing`
- `npm.cmd run test:a17p2p5:scaling`
- `npm.cmd run test:a17p2p5:export`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- clean `npm.cmd run build`
- `git diff --check`

Local browser route smoke:

- `LOCAL_SERVER_URL=http://127.0.0.1:3000`.
- `LOCAL_PRINT_ROUTE=http://127.0.0.1:3000/admin/tree/print`.
- Route reached with `HTTP_STATUS=200`.
- In-app browser URL stayed `/admin/tree/print`.
- Authenticated admin shell was visible.
- `TREE_PRINT_WORKSPACE_RENDERED=false`.
- Route content showed safe error: `Không thể tạo bản xem trước cây gia phả.`
- Export DOM selectors were therefore not available for visual smoke.

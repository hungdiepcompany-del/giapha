# A17P2P6R1 diagnostic overlay, edge style, and mojibake reconciliation

## Baseline

- `PHASE=A17P2P6R1_DIAGNOSTIC_OVERLAY_EDGE_STYLE_AND_REMAINING_MOJIBAKE_RECONCILIATION`
- `PRE_PHASE_HEAD=e6d4e066938982b7abec9cf00c088228ef46ed18`
- `BRANCH=main`
- `SNAPSHOT_PATH=D:\CODE\GIA PHẢ\.phase_backups\A17P2P6R1_20260802_104708`
- `COMMIT_STATUS=NOT_CREATED_OWNER_ARTIFACT_SMOKE_REQUIRED`

## Owner Artifact Findings

- A17P2P6/A17P2P6R source and local browser gates proved route render, viewport containment, diagnostics collapse, true orientation, vector SVG, one physical artboard, scale 1:1, couple generation invariant, layout-axis invariant, and post-packing invariant.
- Remaining owner blockers were visible mojibake in print workspace labels and inconsistent red/green edge styling between landscape and portrait artifacts.
- This phase does not change generation solving, component packing, physical SVG dimensions, PDF dimensions, or office-tiled retirement.

## Edge Style Root Cause

`ROOT_CAUSE_CATEGORY=DIAGNOSTIC_STATE_MUTATES_SEMANTIC_EDGE_STYLE`

`ROOT_CAUSE_FILE=components/tree-print/tree-print-svg.tsx`

`ROOT_CAUSE_FUNCTION=TreePrintSvg`

Before A17P2P6R1, `TreePrintSvg` built an `intersects` set from `document.diagnostics.issues` and applied red stroke directly to the semantic relationship `<path>`. That logic ran regardless of `showDiagnostics`, so the print/export SVG with `showDiagnostics={false}` could still serialize diagnostic red strokes into production output.

Landscape and portrait use the same relationship graph and stable edge IDs, but their route geometry differs. Portrait/left-to-right can produce different `edge-card` or `long-edge` diagnostic issue sets than landscape/top-to-bottom. Because diagnostic state mutated semantic edge style, the same relationship could be green in one orientation and red in another.

## Edge Color Contract

`EDGE_COLOR_GREEN_MEANING=semantic parent-child and family-junction relationship edges`

`EDGE_COLOR_RED_MEANING=diagnostic error overlay only; never default production semantic edge style`

`EDGE_COLOR_GRAY_MEANING=semantic couple relationship edge, dashed`

`EDGE_STYLE_SOURCE_OF_TRUTH=lib/family/print/tree-print-edge-style.ts`

Semantic relationship styles are now centralized:

- `parent-child`: green solid, used for `family_to_child`.
- `family-junction`: green solid, used for `parent_to_family`.
- `couple`: gray-brown dashed, used for `couple`.
- `other`: neutral gray dashed fallback.
- `diagnostic-warning` and `diagnostic-error`: overlay-only styles.

`ORIENTATION_AFFECTS_SEMANTIC_STYLE=NO`

Orientation may change coordinates, path geometry, generation axis, spouse axis, and artboard dimensions. It must not change relationship kind, visual role, diagnostic-only flag, export eligibility, stroke, stroke width, dash pattern, opacity, or marker behavior.

## Diagnostic Overlay Contract

`DIAGNOSTIC_OVERLAY_MODEL=separate preview layer with diagnosticOnly=true and exportEligible=false`

`DIAGNOSTIC_OVERLAY_MUTATES_SEMANTIC_EDGE=NO`

Diagnostics have three separate states:

- Diagnostics metadata is always computed in the document diagnostics.
- Diagnostics panel visibility is controlled by `showDiagnosticsPanel`.
- Preview overlay visibility is controlled by `showDiagnostics`.

When `showDiagnostics=true`, edge diagnostics render in a separate SVG group with:

- `data-tree-print-diagnostics="true"`
- `data-tree-print-diagnostic-layer="true"`
- `data-tree-print-diagnostic-only="true"` on overlay paths
- `data-tree-print-export-exclude="true"`

`DIAGNOSTIC_OVERLAY_EXCLUDED_FROM_SVG=PASS`

`DIAGNOSTIC_OVERLAY_EXCLUDED_FROM_PDF=PASS`

The production print layer passes `showDiagnostics={false}` and the serializer removes diagnostic-only/export-excluded elements. If diagnostic-only elements remain, serialization fails closed with `A17P2P6R1_DIAGNOSTIC_OVERLAY_LEAKED_TO_EXPORT`.

## Orientation Style Parity

`validateTreePrintOrientationEdgeStyleParity()` compares landscape and portrait by stable edge ID and ignores path geometry. It compares:

- semantic type
- visual role
- stroke
- stroke width
- dash array
- opacity
- diagnostic-only flag
- preview/export eligibility

Diagnostic codes:

- `A17P2P6R1_EDGE_STYLE_ORIENTATION_MISMATCH`
- `A17P2P6R1_EDGE_SEMANTIC_TYPE_CHANGED_BY_ORIENTATION`
- `A17P2P6R1_PRODUCTION_EDGE_COUNT_MISMATCH`

Large-format plan creation fail-closes if orientation style parity fails.

## Mojibake Root Cause

`MOJIBAKE_ROOT_CAUSE_CATEGORY=DOUBLE_ENCODED_SOURCE_LITERAL_IN_PRINT_SCOPE`

The exact source-level scan found remaining double-encoded literals in:

- `components/tree-print/tree-print-toolbar.tsx`: diagnostics panel status chip.
- `lib/family/print/tree-print-large-format.ts`: six A17P2P6 fail-closed safe-error messages.

The scan deliberately avoids broad false positives against valid Vietnamese characters and only flags known mojibake codepoint patterns such as U+00C3, U+00C2, U+00C4, U+00C6, U+FFFD, and split UTF-8 tone-byte sequences.

Verified labels include:

- Bảng chẩn đoán: Hiện
- Bảng chẩn đoán: Ẩn
- Hiện bảng chẩn đoán
- Ẩn bảng chẩn đoán
- Chẩn đoán bật
- Chẩn đoán tắt
- Vừa màn hình
- Phóng to
- Thu nhỏ
- Tải SVG khổ bạt
- Thử In / Lưu PDF
- Hướng thực tế
- Bố trí thế hệ
- Khoảng trống
- Cụm
- Khổ cuộn dùng
- Mật độ

## Files Changed

- `lib/family/print/tree-print-edge-style.ts`
- `components/tree-print/tree-print-svg.tsx`
- `components/tree-print/tree-print-legend.tsx`
- `components/tree-print/tree-print-toolbar.tsx`
- `lib/family/print/tree-print-large-format.ts`
- `lib/family/print/tree-print-svg-export.ts`
- `scripts/check-a17p2p6r1-diagnostic-edge-style-mojibake-reconciliation.cjs`
- `scripts/test-a17p2p6r1-edge-style-parity.cjs`
- `scripts/test-a17p2p6r1-diagnostic-overlay.cjs`
- `scripts/test-a17p2p6r1-export-exclusion.cjs`
- `scripts/test-a17p2p6r1-mojibake.cjs`
- `scripts/test-a17p2p6r1-export-regression.cjs`
- `package.json`

## Test Matrix

- `npm.cmd run check:a17p2p6r1`
- `npm.cmd run test:a17p2p6r1:edge-style-parity`
- `npm.cmd run test:a17p2p6r1:diagnostic-overlay`
- `npm.cmd run test:a17p2p6r1:export-exclusion`
- `npm.cmd run test:a17p2p6r1:mojibake`
- `npm.cmd run test:a17p2p6r1:export-regression`
- Inherited A17R/A17R1/A17P0/A17P0U1/A17P1/A17P1R/A17P2P/A17P2P5/A17P2P6 gates.
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- clean `npm.cmd run build`
- `git diff --check`

## Browser Smoke Instructions

Use `http://localhost:3000/admin/tree/print` after source validation.

Verify:

- HTTP 200 for `/` and `/admin/tree/print`.
- Print workspace renders without safe error.
- Print workspace text has no mojibake or replacement character.
- Document-level horizontal overflow remains contained.
- Diagnostics panel remains visible and collapsible.
- Diagnostic overlay toggles independently from panel visibility.
- Production SVG/PDF layer excludes diagnostic-only overlay.
- Landscape/portrait semantic edge styles remain identical by stable edge ID.

2026-08-02 local smoke result:

- In-app browser reached `/admin/tree/print` but did not render the workspace because that browser session had no roles.
- Chrome profile smoke rendered the OWNER print workspace.
- Document-level horizontal overflow PASS.
- Diagnostics panel visible/sticky/within viewport PASS.
- Diagnostics panel collapse PASS.
- DOM mojibake marker scan PASS.
- Production SVG dimensions remained `11940mm x 1500mm` while screen preview used pixel-scaled dimensions PASS.
- Production print layer diagnostic-only count was `0` PASS.
- Sampled semantic edge strokes contained no red/orange diagnostic styling PASS.

## Artifact Smoke Instructions

Owner must generate and upload:

- `A17P2P6R1_FULL_TREE_LANDSCAPE.svg`
- `A17P2P6R1_FULL_TREE_LANDSCAPE_BROWSER.pdf`
- `A17P2P6R1_FULL_TREE_PORTRAIT.svg`
- `A17P2P6R1_FULL_TREE_PORTRAIT_BROWSER.pdf`
- workspace screenshots with diagnostics visible/hidden and edge-style details.

`OWNER_ARTIFACT_SMOKE=PENDING`

Do not mark owner visual PASS until those artifacts prove no mojibake, no diagnostic overlay in SVG/PDF, style parity between orientations, couple invariants, vector output, one artboard, and scale 1:1.

## Commit Gate

- No commit in this phase.
- No push.
- No deploy.
- Commit is reserved for a later owner artifact closeout phase.

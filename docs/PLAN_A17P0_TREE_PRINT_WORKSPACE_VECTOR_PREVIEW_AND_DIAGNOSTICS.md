# PLAN A17P0 tree print workspace vector preview and diagnostics

## 1. Owner problem statement

Owner needs an admin-only workspace that shows the complete current family tree in a scalable vector surface. The immediate goal is global inspection, deep zoom without bitmap blur, and layout diagnostics before any PDF/export phase.

## 2. Why React Flow viewport is insufficient

React Flow is optimized for interactive local navigation and editing. It is not a print preview contract, and a screenshot of its viewport would crop or rasterize the tree. A17P0 therefore renders a separate SVG document from the baseline graph positions.

## 3. Scope and non-goals

Scope: `/admin/tree/print`, read-only SVG preview, pan/zoom, page-frame reference, density presets and deterministic diagnostics.

Non-goals: PDF export, browser print, bitmap export, React Flow screenshotting, saved-layout migration, generation-lane snapping, spouse block reordering, subtree layout replacement, editor drag changes and A17S features.

## 4. Print architecture

```text
Current family data
-> getAdminFamilyTreeGraph()
-> baseline layoutFamilyTreeGraph()
-> createTreePrintDocument()
-> TreePrintSvg
-> read-only print workspace
```

## 5. Print graph model

The print model lives under `lib/family/print/*` and contains only admin tree graph fields already safe for tree display: display name, optional secondary name, generation label, life-year label and living status. It does not include private notes, biography, raw auth identity or private metadata.

## 6. Baseline-layout reuse policy

`PRINT_LAYOUT_SOURCE=BASELINE_LAYOUT_SNAPSHOT`. The print route uses the same A17R baseline ELK layout helper to create a snapshot. Existing `/admin/tree`, `/admin/tree/edit` and public tree layout behavior are not changed.

## 7. SVG rendering

The renderer outputs native SVG elements: `<svg>`, `<g>`, `<rect>`, `<path>`, `<circle>` and `<text>`. It does not use canvas, PNG, screenshots, PDF libraries or browser print.

## 8. Diagnostics

Diagnostics are deterministic and computed from print geometry:

- person/family/edge counts
- connected-component count
- full bounds and tree width/height
- person-card overlap count
- edge-card intersection count
- max horizontal/vertical edge span
- out-of-bounds node count

The technical overlay can show bounding boxes, truncated node/family IDs, component labels and highlighted problematic edges/cards.

## 9. Security and privacy

The print route requires `tree.view`, same as the admin tree viewer. It uses no public route, external image/PDF service, upload, analytics payload or console family-data logging. Query failures are mapped to safe Vietnamese UI messages.

## 10. Files changed

- `app/(admin)/admin/tree/print/page.tsx`
- `app/(admin)/admin/tree/print/loading.tsx`
- `app/(admin)/admin/tree/page.tsx`
- `components/tree-print/*`
- `lib/family/print/*`
- `scripts/check-a17p0-tree-print-workspace-vector-preview-diagnostics.cjs`
- `scripts/test-a17p0-tree-print-contracts.cjs`
- `package.json`

## 11. Tests

`test:a17p0:print` uses an anonymized synthetic fixture with 4 generations, 15+ people, multiple siblings/couples, a single-parent family, two connected components, long names, a deliberate overlap and a deliberate edge-card crossing.

## 12. Build evidence

To be filled after validation gates run:

```text
A17R_STATIC_CHECKER=PASS
A17R1_EVIDENCE_CHECKER=PASS
A17P0_STATIC_CHECKER=PASS
A17P0_PRINT_CONTRACT_TESTS=PASS
TYPECHECK=PASS
LINT=PASS
CLEAN_BUILD=PASS
GIT_DIFF_CHECK=PASS_CRLF_WARNINGS_ONLY
```

## 13. Browser visual evidence

Local route smoke reached `/admin/tree/print`, but the browser session had zero permissions and rendered the safe error state instead of the SVG workspace. Owner screenshot evidence from an authorized `tree.view` session is required before marking visual PASS or committing.

Owner closeout evidence received on 2026-07-29:

```text
OWNER_AUTHORIZED_BROWSER_SESSION=YES
OWNER_BROWSER_VISUAL_SMOKE=PASS
FIT_TREE_VISUAL=PASS
FIT_WIDTH_VISUAL=PASS
CUSTOM_MODE_VISUAL=PASS
PAGE_FRAME_TOGGLE_VISUAL=PASS
DIAGNOSTICS_TOGGLE_VISUAL=PASS
STATUS_BAR_VISUAL=PASS
SCREENSHOT_STATE_OBSERVABLE=PASS

PERSON_COUNT=110
FAMILY_COUNT=37
EDGE_COUNT=145
CONNECTED_COMPONENT_COUNT=4
TREE_WIDTH=11182
TREE_HEIGHT=4170
NODE_OVERLAP_COUNT=0
EDGE_CARD_INTERSECTION_COUNT=3
MAX_EDGE_SPAN=3316x432
```

Owner accepted the active-toolbar evidence without committing screenshots because
the screenshots contain real family data. Observed states included dark teal
active fit buttons with white text and a check mark, mutually exclusive
fit-to-tree and fit-width states, custom mode after zoom or pan, visible zoom
percentage updates, teal page-frame toggle, amber diagnostics toggle, status
badges for view mode, scale, paper preset, diagnostics and card density, and
separated toolbar groups for `KHUNG NHÌN`, `LỚP HIỂN THỊ` and `BẢN IN`.

## 14. Known limitations

P0 is an observability layer. It surfaces baseline layout problems but does not correct them. Page frames are visual references only and do not export or crop.

## 15. A17P1 readiness

`A17P1_READINESS=READY_FOR_PLANNING` after owner-authorized A17P0/A17P0U1 visual evidence passed. A17P1 remains a separate phase and must not start from this closeout.

## 16. Commit/push/deploy status

```text
COMMIT_STATUS=READY_FOR_SCOPED_LOCAL_COMMIT_AFTER_FINAL_VALIDATION
PUSH_STATUS=NOT_RUN
DEPLOY_STATUS=NOT_RUN
SQL_RUN=NO
MIGRATION_CREATED=NO
PRODUCTION_DATA_MUTATION=NO
```

## 17. A17P0U1 active controls and screenshot observability

A17P0U1 keeps the existing print graph, SVG geometry, diagnostics algorithms and
route boundary unchanged. It only improves the print workspace controls so a
single screenshot can show the active viewport state.

Implemented source contract:

- Explicit toolbar viewport model: `fit-tree`, `fit-width`, `custom` and
  `default`.
- Fit-to-tree and fit-width are mutually exclusive active modes.
- Zoom, wheel zoom and pan move the viewport into `custom`.
- Reset returns the viewport to `default` and gives transient action feedback.
- Page-frame and diagnostics toggles use visible active styles plus
  `aria-pressed`.
- The toolbar has grouped controls for viewport, display layers and print
  presets, with wrapping layout for narrow screenshots.
- The persistent status row exposes view mode, zoom percent, page-frame state,
  paper preset, diagnostics state and card density.

Validation additions:

```text
A17P0U1_STATIC_CHECKER=PASS
A17P0U1_TOOLBAR_STATE_TESTS=PASS
TYPECHECK=PASS
LINT=PASS
CLEAN_BUILD=PASS
GIT_DIFF_CHECK=PASS_CRLF_WARNINGS_ONLY
BROWSER_ROUTE_REACHED=YES
BROWSER_VISUAL_STATE=BLOCKED_AUTHZ_SAFE_ERROR
OWNER_BROWSER_VISUAL_SMOKE=BLOCKED_OWNER_SCREENSHOT_REQUIRED
```

Non-blocking observations:

- The tree is substantially wider than the available viewport.
- Fit toàn cây and Fit chiều rộng both produced approximately 10% scale in the
  observed desktop viewport.
- This is not considered an A17P0U1 toolbar-state defect.
- Three edge-card intersections remain as layout diagnostics for future work.
- Four connected components are present.
- PDF export has not been implemented.
- A17P1 remains a separate phase.

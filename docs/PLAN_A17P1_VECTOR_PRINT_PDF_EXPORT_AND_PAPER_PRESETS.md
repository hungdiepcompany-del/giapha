# PLAN A17P1 Vector Print PDF Export And Paper Presets

## 1. Owner Goal

A17P1 extends the accepted A17P0 `/admin/tree/print` workspace so the owner can choose ISO paper presets, inspect print scale/readability, download a complete vector SVG, and use the browser print dialog to save a vector PDF.

## 2. A17P0 Baseline

- Route: `/admin/tree/print`.
- Guard: existing `tree.view` permission.
- Source graph: `getAdminFamilyTreeGraph()` plus `layoutFamilyTreeGraph()`.
- Renderer: native SVG, not React Flow screenshot.
- Accepted owner metrics: `PERSON_COUNT=110`, `FAMILY_COUNT=37`, `EDGE_COUNT=145`, `CONNECTED_COMPONENT_COUNT=4`, `NODE_OVERLAP_COUNT=0`, `EDGE_CARD_INTERSECTION_COUNT=3`.

## 3. Scope And Non-Goals

In scope:

- A4, A3, A2, A1, A0 paper presets.
- Portrait and landscape orientation.
- Symmetric margins from 5mm to 30mm.
- Fit-page, fit-width, and manual print scale.
- Readability warning from estimated printed font size.
- Client-side SVG download.
- Browser-native `window.print()` path for Save as PDF.

Out of scope:

- Tiled multi-page print.
- Continuation markers.
- Branch page maps.
- Server-side Chromium.
- External PDF services.
- Screenshot, canvas, PNG, or bitmap PDF export.
- Database persistence for print settings.
- Tree layout algorithm changes.

## 4. Vector-First Export Architecture

```text
Print graph document
  -> Native SVG rendering
  -> Paper/readability calculation
  -> SVG download
  -> Browser print / Save as PDF
```

The screen viewport zoom remains independent from print scale. The downloadable SVG serializes the print SVG node, not the toolbar, diagnostics panel, admin shell, browser UI, or auth/session state.

## 5. Paper Presets

`lib/family/print/tree-print-paper.ts` is the print-domain source of truth:

- A4: 210 x 297 mm.
- A3: 297 x 420 mm.
- A2: 420 x 594 mm.
- A1: 594 x 841 mm.
- A0: 841 x 1189 mm.

Orientation deterministically swaps width and height.

## 6. Unit Conversion

`lib/family/print/tree-print-units.ts` centralizes:

- `1 in = 25.4 mm`.
- `1 CSS px = 1/96 in`.
- `1 pt = 1/72 in`.
- `mmToCssPx()`, `cssPxToMm()`, `layoutUnitToMm()`, `fontLayoutUnitToPt()`.

## 7. Margin Calculation

A17P1 uses symmetric margins:

```text
printableWidthMm = paperWidthMm - marginMm * 2
printableHeightMm = paperHeightMm - marginMm * 2
```

Invalid manual values are clamped to the nearest allowed preset. The printable area is never allowed to become zero or negative.

## 8. Print-Scale Calculation

`lib/family/print/tree-print-scale.ts` calculates:

- `fitWidthScale`.
- `fitHeightScale`.
- `fitPageScale`.
- `printScale`.
- `printScalePercent`.
- final card width/height in mm.
- final font size in pt.

The UI exposes both `VIEWPORT_ZOOM` and `PRINT_SCALE`.

## 9. Readability Thresholds

Deterministic thresholds:

- `GOOD`: font size >= 9 pt.
- `ACCEPTABLE`: font size >= 7 pt and < 9 pt.
- `WARNING`: font size >= 5.5 pt and < 7 pt.
- `UNREADABLE`: font size < 5.5 pt.

The print summary panel shows a Vietnamese warning instead of silently fitting unreadable content.

## 10. SVG Download

`lib/family/print/tree-print-svg-export.ts`:

- clones the SVG node;
- adds SVG namespace/version attributes;
- removes scripts, event handlers, interactive attributes and diagnostic overlays by default;
- preserves Vietnamese text;
- uses a safe filename: `gia-pha-toan-cay-YYYYMMDD-HHmm.svg`;
- creates a local `image/svg+xml;charset=utf-8` Blob and revokes the object URL.

No SVG content is logged or uploaded.

## 11. Browser Print / PDF Behavior

The primary action is labeled `In / Lưu PDF`.

The app does not generate a PDF in source code. It prepares print-only vector content, applies print CSS and calls `window.print()`. The owner uses the browser Save as PDF option.

## 12. Dynamic @page Handling

`buildTreePrintPageStyle()` creates a validated dynamic style from the selected preset only. The CSS includes `@page` size and print-specific sheet dimensions. The selected margin is represented as a print-only CSS variable and as vector geometry in the SVG.

## 13. Privacy And Security

- Route remains admin-only.
- No private notes, short biographies, auth data, cookie data, permission internals or raw UUIDs are added to export helpers.
- No external image/PDF/API service is called.
- Downloaded SVG and browser-generated PDF stay local to the owner.

## 14. Performance And Worker Size

- Print graph document remains memoized.
- Paper/readability calculation is pure and recomputed only when print settings change.
- No runtime dependency was added.
- No heavy PDF library or headless browser was added.
- OpenNext and Wrangler config are unchanged.

## 15. Test Fixtures

The A17P1 contract tests use synthetic dimensions and strings only. They cover paper dimensions, orientations, margins, fit modes, manual bounds, readability thresholds, Vietnamese SVG text, filename safety and banned export paths.

## 16. Validation Evidence

Completed in this phase:

- `npm.cmd run check:a17r`: PASS.
- `npm.cmd run check:a17r1`: PASS.
- `npm.cmd run check:a17p0`: PASS.
- `npm.cmd run test:a17p0:print`: PASS.
- `npm.cmd run check:a17p0u1`: PASS.
- `npm.cmd run test:a17p0u1:toolbar`: PASS.
- `npm.cmd run check:a17p1`: PASS.
- `npm.cmd run test:a17p1:print-export`: PASS.
- `npm.cmd run typecheck`: PASS.
- `npm.cmd run lint`: PASS.
- `npm.cmd run build`: PASS.
- `git diff --check`: PASS with CRLF warnings only in preserved existing dirty files/docs.

## 17. Browser Evidence

Chrome source smoke reached `http://localhost:3000/admin/tree/print` with an authorized session and observed:

- workspace rendered;
- toolbar rendered;
- two SVG roots rendered;
- paper, margin and density controls present;
- `Tải SVG` and `In / Lưu PDF` actions present;
- A4 portrait 5mm showed `PRINT_SCALE=6,8%` and unreadable warning;
- A4 landscape 10mm showed `PRINT_SCALE=9,4%`;
- A3 landscape 10mm showed `PRINT_SCALE=13,5%`;
- A0 landscape compact 30mm showed `PRINT_SCALE=38,2%`;
- print-only root is hidden on screen.

Owner browser print/PDF visual smoke is still required before commit. Source validation and DOM smoke alone must not be reported as visual PASS.

Required owner evidence:

- A4 unreadable warning.
- A0 readability state.
- SVG opened locally.
- Browser print preview.
- Saved PDF zoomed in.

## 18. Known Limitations

A17P1 is one-page vector print only. If the full tree is too dense for a readable one-page export, the UI recommends a larger paper size, compact card density, or the future multi-page mode.

## 19. A17P2 Readiness

A17P2 may plan tiled or branch-based multipage output only after A17P1 owner print/PDF smoke passes. No A17P2 runtime feature is included here.

## 20. Commit Push Deploy Status

- Commit: not allowed until owner browser print/PDF smoke passes.
- Push: not run.
- Deploy: not run.
- Screenshots/SVG/PDF generated from owner data: not committed.

## 21. A17P1R Duplicate PDF Page Fix

Owner supplied the A17P1 manual evidence:

- `OWNER_SVG_SMOKE=PASS`.
- `OWNER_PDF_VECTOR_QUALITY=PASS`.
- `OWNER_PDF_PAGE_COUNT=FAIL_2_IDENTICAL_PAGES`.
- `PDF_PAGE_1_EQUALS_PAGE_2=YES_EXACT`.
- `PDF_PAGE_SIZE=A0_LANDSCAPE`.
- `PDF_FOOTER_BOTH_PAGES=Trang 1/1`.
- Readability remains expected unreadable for the current full-tree one-page scope: `A4=UNREADABLE`, `A3=UNREADABLE`, `A0=UNREADABLE`.

Root cause:

- `ROOT_CAUSE=print CSS used visibility hiding for the full admin/screen layout, so invisible preview/admin content still participated in print pagination while a fixed print root repeated the same paper document on every generated page`.

Fix:

- Add stable print DOM selectors: `data-tree-print-page`, `data-tree-print-screen-preview`, `data-tree-print-route-content`, `data-tree-print-root`, `data-tree-print-document-root`, `data-tree-print-document`, `data-tree-print-page-style` and `data-tree-print-primary-content`.
- Keep one dedicated print document and one print SVG in the workspace.
- Remove the screen preview, route header, admin header and sidebar from print layout flow.
- Change the print root from fixed positioning to a singleton in-flow print document.
- Keep the dynamic `@page` style as one stable React style node.

Print singleton contract:

- SCREEN: screen preview visible, print document hidden.
- PRINT: screen preview hidden, print document visible.
- `PRINT_VISIBLE_DOCUMENT_COUNT=1`.
- `PRINT_VISIBLE_SVG_COUNT=1`.
- `WINDOW_PRINT_CALL_COUNT=1`.
- `DYNAMIC_PAGE_STYLE_COUNT=1`.
- `TEMP_PRINT_ROOT=NOT_USED`.

Status:

- `SOURCE_FIX=IMPLEMENTED`.
- `SOURCE_VALIDATION=PASS`.
- `LOCAL_ROUTE_HTTP_STATUS=200`.
- `LOCAL_DOM_SINGLETON_SMOKE=BLOCKED_AUTHORIZED_WORKSPACE_NOT_RENDERED`.
- `OWNER_RETEST_STATUS=REQUIRED_BEFORE_COMMIT`.
- The duplicate PDF page is a separate A17P1 defect. It does not invalidate SVG/PDF vector quality and it remains evidence that A17P2 tiled/branch printing is needed after A17P1R closeout.

## 22. A17P1/A17P1R Owner Evidence Closeout

Owner authorized browser session and artifact review:

- `OWNER_AUTHORIZED_BROWSER_SESSION=YES`.
- `OWNER_MANUAL_PDF_RETEST=PASS`.
- `OWNER_MANUAL_SVG_REGRESSION=PASS`.
- `OWNER_BROWSER_PRINT_SMOKE=PASS`.

Original defect:

- `ORIGINAL_PDF_PAGE_COUNT=2`.
- `ORIGINAL_PDF_PAGE_1_EQUALS_PAGE_2=YES_EXACT`.
- `ROOT_CAUSE_PRIMARY=visibility-hidden screen/admin layout remained in print pagination flow while the fixed print root repeated on each generated page`.
- `ROOT_CAUSE_SECONDARY=screen/admin route shell was not removed from print layout flow`.
- `FIX=screen/admin layout removed from print flow and one in-flow singleton print document retained`.

New PDF result:

- `NEW_PDF_PAGE_COUNT=1`.
- `NEW_PDF_DUPLICATE_PAGE=NO`.
- `NEW_PDF_PAGE_SIZE=A0_LANDSCAPE`.
- `NEW_PDF_VECTOR_QUALITY=PASS`.
- `NEW_PDF_RASTER_IMAGE_COUNT=0`.
- `NEW_PDF_PRINT_TREE_COUNT=1`.
- `NEW_PDF_HEADER_COUNT=1`.
- `NEW_PDF_LEGEND_COUNT=1`.
- `NEW_PDF_FOOTER_COUNT=1`.
- `NEW_PDF_FOOTER_LABEL=Trang 1/1`.

New SVG result:

- `NEW_SVG_ROOT_COUNT=1`.
- `NEW_SVG_DUPLICATE_TREE=NO`.
- `NEW_SVG_VECTOR_QUALITY=PASS`.
- `NEW_SVG_BITMAP_IMAGE_COUNT=0`.
- `NEW_SVG_FOREIGN_OBJECT_COUNT=0`.
- `NEW_SVG_SCRIPT_COUNT=0`.
- `NEW_SVG_VIETNAMESE_TEXT_PRESERVED=YES`.
- `NEW_SVG_TOOLBAR_EXCLUDED=YES`.
- `NEW_SVG_ADMIN_UI_EXCLUDED=YES`.

Readability:

- `A4=UNREADABLE_EXPECTED`.
- `A3=UNREADABLE_EXPECTED`.
- `A0=UNREADABLE_EXPECTED`.
- `A0_FONT_SIZE_PT=4.1_APPROX`.

Decision:

- One-page full-tree vector export remains supported as an overview.
- It must continue showing the unreadable-scale warning.
- Readability thresholds must not be weakened.
- A17P2 is required for readable multi-page and branch printing.
- A17P2 has not started.
- Owner PDF and SVG artifacts are not committed because they contain real family data.

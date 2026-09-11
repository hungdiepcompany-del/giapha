const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
let hasError = false;

function fail(message) {
  console.error(`[A17P2P Checker] FAIL: ${message}`);
  hasError = true;
}

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function assertIncludes(haystack, token, label) {
  if (!haystack.includes(token)) fail(`${label} missing ${token}`);
}

const requiredFiles = [
  "components/tree-print/tree-print-workspace.tsx",
  "components/tree-print/tree-print-toolbar.tsx",
  "components/tree-print/tree-print-svg.tsx",
  "components/tree-print/tree-print-diagnostics-panel.tsx",
  "lib/family/print/tree-print-large-format.ts",
  "lib/family/print/tree-print-orientation.ts",
  "lib/family/print/tree-print-layout-orientation.ts",
  "lib/family/print/tree-print-component-packing.ts",
  "lib/family/print/tree-print-eligibility.ts",
  "lib/family/print/tree-print-branch-scope.ts",
  "lib/family/print/tree-print-svg-export.ts",
  "scripts/test-a17p2p-retirement-contracts.cjs",
  "scripts/test-a17p2p-large-format-geometry.cjs",
  "scripts/test-a17p2p-large-format-svg.cjs",
  "scripts/test-a17p2p-large-format-eligibility.cjs",
  "scripts/test-a17p2p-large-format-branch.cjs",
  "docs/PLAN_A17P2P_LARGE_FORMAT_BANNER_EXPORT_PIVOT.md",
];

for (const file of requiredFiles) read(file);

const packageJson = read("package.json");
const workspace = read("components/tree-print/tree-print-workspace.tsx");
const toolbar = read("components/tree-print/tree-print-toolbar.tsx");
const svg = read("components/tree-print/tree-print-svg.tsx");
const diagnosticsPanel = read("components/tree-print/tree-print-diagnostics-panel.tsx");
const largeFormat = read("lib/family/print/tree-print-large-format.ts");
const orientationModel = read("lib/family/print/tree-print-orientation.ts");
const layoutOrientation = read("lib/family/print/tree-print-layout-orientation.ts");
const componentPacking = read("lib/family/print/tree-print-component-packing.ts");
const eligibility = read("lib/family/print/tree-print-eligibility.ts");
const branchScope = read("lib/family/print/tree-print-branch-scope.ts");
const pageStyle = read("lib/family/print/tree-print-page-style.ts");
const globals = read("app/globals.css");
const plan = read("docs/PLAN_A17P2P_LARGE_FORMAT_BANNER_EXPORT_PIVOT.md");
const runtime = [
  workspace,
  toolbar,
  svg,
  diagnosticsPanel,
  largeFormat,
  orientationModel,
  layoutOrientation,
  componentPacking,
  eligibility,
  branchScope,
  pageStyle,
  globals,
  packageJson,
].join("\n");

for (const script of [
  '"check:a17p2p"',
  '"test:a17p2p:retirement"',
  '"test:a17p2p:geometry"',
  '"test:a17p2p:svg"',
  '"test:a17p2p:eligibility"',
  '"test:a17p2p:branch"',
]) {
  assertIncludes(packageJson, script, "package.json");
}

for (const obsoleteScript of [
  '"check:a17p2"',
  '"test:a17p2:tiling"',
  '"test:a17p2:print-pages"',
  '"check:a17p2r"',
  '"test:a17p2r:markers"',
  '"check:a17p2r1"',
]) {
  if (packageJson.includes(obsoleteScript)) fail(`obsolete package script remained: ${obsoleteScript}`);
}

for (const token of [
  "LARGE_FORMAT_FULL_TREE",
  "LARGE_FORMAT_BRANCH",
  "ONE_PAGE_OVERVIEW",
  "Bạt khổ lớn - toàn cây",
  "Bạt khổ lớn - theo nhánh",
  "Tổng quan kỹ thuật",
  "TREE_PRINT_LARGE_FORMAT_ALGORITHM_VERSION",
  "A17P2P5_TRUE_ORIENTATION_V1",
  "requestedOrientation",
  "resolvedOrientation",
  "layoutFlow",
  "orientationResolution",
  "TREE_PRINT_DEFAULT_PRODUCTION_MODE",
  "TREE_PRINT_DEFAULT_BRANCH_SIZING",
  "TREE_PRINT_DEFAULT_BRANCH_TARGET_FONT_SIZE_PT",
  "TREE_PRINT_BRANCH_MAX_RECOMMENDED_UPSCALE_FONT_PT",
  "TREE_PRINT_MEDIA_WIDTH_OPTIONS",
  "TREE_PRINT_LARGE_FORMAT_TARGET_FONT_OPTIONS",
  "TREE_PRINT_SAFE_MARGIN_OPTIONS",
  "TREE_PRINT_BLEED_OPTIONS",
  "AUTO_FROM_CONTENT",
  "CUSTOM_LENGTH",
  "USE_FULL_ROLL_WIDTH",
  "TARGET_FONT_SIZE",
  "ORIENTATION_DIMENSION_MISMATCH",
  "REQUESTED_ORIENTATION_UNAVAILABLE",
  "TREE_OUTSIDE_SAFE_AREA",
  "contentOffsetLayoutUnits",
  "viewBox",
  "pageCount: 1",
]) {
  assertIncludes(largeFormat, token, "large-format model");
}

for (const token of [
  "type TreePrintArtboardOrientation",
  '"auto"',
  '"landscape"',
  '"portrait"',
  "type TreePrintLayoutFlow",
  '"top-to-bottom"',
  '"left-to-right"',
  "artboardOrientationMatchesDimensions",
]) {
  assertIncludes(orientationModel, token, "orientation model");
}

for (const token of [
  "createTreePrintLayoutCandidates",
  "createTreePrintLayoutCandidate",
  "layoutFlow",
  "top-to-bottom",
  "left-to-right",
  "TEXT_UPRIGHT: true",
  "TREE_ROTATION_DEGREES: 0",
]) {
  assertIncludes(layoutOrientation, token, "print layout orientation");
}

for (const token of [
  "packTreePrintComponents",
  "COMPONENT_PACKING_EFFICIENCY",
  "INTERNAL_WHITESPACE_RATIO",
  "COMPONENT_OVERLAP_COUNT",
  "PACKED_COMPONENT_COUNT",
]) {
  assertIncludes(componentPacking, token, "component packing");
}

for (const token of [
  "type TreePrintExportEligibility",
  "canExportSvg",
  "canPrintPdf",
  "svgBlockers",
  "pdfBlockers",
  "warnings",
  "BROWSER_PDF_CAPABILITY_UNKNOWN",
]) {
  assertIncludes(eligibility, token, "eligibility");
}

for (const token of [
  "data-tree-print-large-format-artboard",
  "fileNamePrefix: prefix",
  "window.print()",
  "width={`${exportWidthMm}mm`}",
  "height={`${exportHeightMm}mm`}",
  "previewDocument",
  "PAGE_COUNT=1",
  "TEXT_OUTLINED",
]) {
  assertIncludes(workspace, token, "workspace");
}

for (const token of [
  "Khổ cuộn / cạnh ngắn",
  "Tải SVG khổ bạt",
  "Thử In / Lưu PDF",
  "CAN_EXPORT_SVG",
  "CAN_PRINT_PDF",
  "PDF_CAPABILITY",
]) {
  if (token.includes("cuá»™n /") || token.includes("cuộn /")) {
    assertIncludes(toolbar, "Khổ cuộn máy in", "toolbar");
    continue;
  }
  assertIncludes(toolbar, token, "toolbar");
}

for (const token of [
  "Hướng yêu cầu",
  "Hướng thực tế",
  "Bố trí thế hệ",
  "Không phóng vượt cỡ chữ mục tiêu",
]) {
  assertIncludes(toolbar, token, "toolbar");
}

for (const token of [
  "Finished size",
  "Export size",
  "Bàn giao nhà in",
  "Text outlined",
  "SVG master",
]) {
  assertIncludes(diagnosticsPanel, token, "diagnostics panel");
}

for (const token of [
  "scopeTreePrintDocument",
  "searchTreePrintPeople",
  "DESCENDANTS",
  "ANCESTORS",
  "CONNECTED_COMPONENT",
]) {
  assertIncludes(branchScope, token, "branch scope");
}

for (const token of [
  "ACTIVE_PRINT_DIRECTION=LARGE_FORMAT_SINGLE_ARTBOARD",
  "OFFICE_TILED_DIRECTION=RETIRED",
  "ONE_CONTINUOUS_LARGE_FORMAT_VECTOR_ARTBOARD",
  "TEXT_OUTLINED=NO_UNLESS_VERIFIED",
]) {
  assertIncludes(plan, token, "A17P2P plan");
}

for (const retiredFile of [
  "components/tree-print/tree-print-page-map.tsx",
  "lib/family/print/tree-print-tiling.ts",
  "scripts/check-a17p2-tiled-multipage-branch-print.cjs",
  "docs/PLAN_A17P2_TILED_MULTIPAGE_AND_BRANCH_PRINT.md",
]) {
  if (fs.existsSync(path.join(root, retiredFile))) fail(`retired file still exists: ${retiredFile}`);
}

for (const token of [
  "TILED_FULL_TREE",
  "OFFICE_TILED",
  "tree-print-tiling",
  "pageMap",
  "PAGE_MAP",
  "rawTile",
  "printablePage",
  "continuationMarker",
  "Nối sang Trang",
  "Từ Trang",
  "tree-print-print-page-last",
  "tree-print-print-page-svg",
]) {
  if (runtime.includes(token)) fail(`retired tiled runtime token remained: ${token}`);
}

if ((workspace.match(/window\.print\(\)/g) ?? []).length !== 1) {
  fail("window.print() must have exactly one call path");
}

for (const token of [
  "toDataURL",
  "html2canvas",
  "jspdf",
  "pdf-lib",
  "puppeteer",
  "playwright",
  "chromium",
  "external pdf service",
]) {
  if (runtime.toLowerCase().includes(token.toLowerCase())) {
    fail(`forbidden bitmap/heavy/external PDF token found: ${token}`);
  }
}

for (const token of ["insert(", "update(", "delete(", "upsert(", "rpc("]) {
  if (runtime.toLowerCase().includes(token)) {
    fail(`database write token found in print runtime: ${token}`);
  }
}

for (const forbiddenImport of ["app/auth/", "components/auth/", "lib/auth/", "lib/supabase/", "lib/permissions/", "_guard/"]) {
  if (runtime.includes(forbiddenImport)) {
    fail(`print runtime imports forbidden scope token: ${forbiddenImport}`);
  }
}

const dependencySnapshot = JSON.parse(packageJson);
const allDependencies = {
  ...dependencySnapshot.dependencies,
  ...dependencySnapshot.devDependencies,
};
for (const dependency of ["html2canvas", "jspdf", "pdf-lib", "puppeteer", "playwright", "chromium"]) {
  if (Object.prototype.hasOwnProperty.call(allDependencies, dependency)) {
    fail(`heavy PDF/bitmap dependency must not be added: ${dependency}`);
  }
}

if (hasError) process.exit(1);
console.log("[A17P2P Checker] PASS");

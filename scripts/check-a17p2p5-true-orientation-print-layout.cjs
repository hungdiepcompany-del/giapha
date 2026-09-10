const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
let hasError = false;

function fail(message) {
  console.error(`[A17P2P5 Checker] FAIL: ${message}`);
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
  "lib/family/print/tree-print-orientation.ts",
  "lib/family/print/tree-print-layout-orientation.ts",
  "lib/family/print/tree-print-component-packing.ts",
  "lib/family/print/tree-print-large-format.ts",
  "lib/family/print/tree-print-page-style.ts",
  "components/tree-print/tree-print-workspace.tsx",
  "components/tree-print/tree-print-toolbar.tsx",
  "components/tree-print/tree-print-svg.tsx",
  "components/tree-print/tree-print-diagnostics-panel.tsx",
  "scripts/a17p2p5-test-utils.cjs",
  "scripts/test-a17p2p5-orientation-contracts.cjs",
  "scripts/test-a17p2p5-print-layout-flows.cjs",
  "scripts/test-a17p2p5-component-packing.cjs",
  "scripts/test-a17p2p5-physical-scaling.cjs",
  "scripts/test-a17p2p5-svg-pdf-orientation.cjs",
  "docs/PLAN_A17P2P_LARGE_FORMAT_BANNER_EXPORT_PIVOT.md",
];

for (const file of requiredFiles) read(file);

const packageJson = read("package.json");
const orientation = read("lib/family/print/tree-print-orientation.ts");
const layout = read("lib/family/print/tree-print-layout-orientation.ts");
const packing = read("lib/family/print/tree-print-component-packing.ts");
const largeFormat = read("lib/family/print/tree-print-large-format.ts");
const pageStyle = read("lib/family/print/tree-print-page-style.ts");
const workspace = read("components/tree-print/tree-print-workspace.tsx");
const toolbar = read("components/tree-print/tree-print-toolbar.tsx");
const svg = read("components/tree-print/tree-print-svg.tsx");
const diagnostics = read("components/tree-print/tree-print-diagnostics-panel.tsx");
const plan = read("docs/PLAN_A17P2P_LARGE_FORMAT_BANNER_EXPORT_PIVOT.md");
const runtime = [
  orientation,
  layout,
  packing,
  largeFormat,
  pageStyle,
  workspace,
  toolbar,
  svg,
  diagnostics,
].join("\n");

for (const script of [
  '"check:a17p2p5"',
  '"test:a17p2p5:orientation"',
  '"test:a17p2p5:layout"',
  '"test:a17p2p5:packing"',
  '"test:a17p2p5:scaling"',
  '"test:a17p2p5:export"',
]) {
  assertIncludes(packageJson, script, "package.json");
}

for (const token of [
  "A17P2P5_TRUE_ORIENTATION_V1",
  "requestedOrientation",
  "resolvedOrientation",
  "orientationResolution",
  "layoutFlow",
  "allCandidateDiagnostics",
  "candidateScores",
  "document: TreePrintDocument",
  "ORIENTATION_DIMENSION_MISMATCH",
  "REQUESTED_ORIENTATION_UNAVAILABLE",
  "TREE_OUTSIDE_SAFE_AREA",
  "BRANCH_UPSCALE_EXCEEDS_RECOMMENDED_MAX",
  "TREE_PRINT_DEFAULT_BRANCH_NO_UPSCALE",
]) {
  assertIncludes(largeFormat, token, "large-format plan");
}

for (const token of [
  'export type TreePrintArtboardOrientation',
  '"auto"',
  '"landscape"',
  '"portrait"',
  'export type TreePrintLayoutFlow',
  '"top-to-bottom"',
  '"left-to-right"',
  "layoutFlowForResolvedOrientation",
  "resolvedOrientationForLayoutFlow",
  "artboardOrientationMatchesDimensions",
]) {
  assertIncludes(orientation, token, "orientation model");
}

for (const token of [
  "createTreePrintLayoutCandidates",
  "solveGenerations",
  "spouseGroups",
  "parentGroup",
  "childGroup",
  "positionPeople",
  "positionFamilies",
  "routeEdges",
  "packTreePrintComponents",
  "TEXT_UPRIGHT: true",
  "TREE_ROTATION_DEGREES: 0",
  "PERSON_CARD_TEXT_ROTATION_DEGREES: 0",
]) {
  assertIncludes(layout, token, "print layout orientation engine");
}

for (const token of [
  "packTreePrintComponents",
  "packHorizontalShelves",
  "packVerticalShelves",
  "COMPONENT_PACKING_EFFICIENCY",
  "INTERNAL_WHITESPACE_RATIO",
  "BASELINE_INTERNAL_WHITESPACE_RATIO",
  "COMPONENT_OVERLAP_COUNT",
]) {
  assertIncludes(packing, token, "component packing");
}

for (const token of [
  "previewDocument",
  "largeFormatPlan?.document ?? activeDocument",
  "contentOffset={largeFormatPlan?.contentOffsetLayoutUnits}",
  "buildTreePrintPageStyle({ widthMm: exportWidthMm, heightMm: exportHeightMm",
  'width={`${exportWidthMm}mm`}',
  'height={`${exportHeightMm}mm`}',
  "largeFormatPlan.resolvedOrientation",
  "branchNoUpscale",
]) {
  assertIncludes(workspace, token, "workspace");
}

for (const token of [
  "requestedOrientation",
  "resolvedOrientation",
  "layoutFlow",
  "componentPackingEfficiency",
  "internalWhitespaceRatio",
  "Không phóng",
]) {
  assertIncludes(toolbar, token, "toolbar");
}

for (const token of [
  "getTreePrintLargeFormatResolvedOrientationLabel",
  "getTreePrintLargeFormatLayoutFlowLabel",
  "requestedOrientation",
  "resolvedOrientation",
  "layoutFlow",
  "componentPackingEfficiency",
  "internalWhitespaceRatio",
]) {
  assertIncludes(diagnostics, token, "diagnostics panel");
}

assertIncludes(svg, 'preserveAspectRatio="xMidYMid meet"', "SVG");
assertIncludes(svg, 'data-tree-print-vector-root="true"', "SVG");
assertIncludes(pageStyle, "@page { size:", "page style");

for (const token of [
  "A17P2P5_TRUE_ORIENTATION_RECONCILIATION",
  "ACTIVE_PRINT_DIRECTION=LARGE_FORMAT_SINGLE_ARTBOARD",
  "ACTIVE_ORIENTATION_MODEL=TRUE_LAYOUT_BASED_ORIENTATION",
  "OFFICE_TILED_MODE=RETIRED",
  "NEXT_PHASE=OWNER_TRUE_ORIENTATION_ARTIFACT_SMOKE",
  "TRUE_LAYOUT_BASED_ORIENTATION",
  "COMPONENT_PACKING",
]) {
  assertIncludes(plan, token, "A17P2P plan");
}

for (const token of [
  "rotate(90",
  "rotate(270",
  "html2canvas",
  "jspdf",
  "pdf-lib",
  "puppeteer",
  "playwright",
  "chromium",
  "tree-print-tiling",
  "pageMap",
  "continuationMarker",
]) {
  if (runtime.toLowerCase().includes(token.toLowerCase())) {
    fail(`forbidden print runtime token found: ${token}`);
  }
}

for (const token of ["insert(", "update(", "delete(", "upsert(", "rpc("]) {
  if (runtime.toLowerCase().includes(token)) {
    fail(`database write token found in print runtime: ${token}`);
  }
}

for (const forbiddenImport of ["app/auth/", "components/auth/", "lib/auth/", "lib/supabase/", "lib/permissions/", "_guard/"]) {
  if (runtime.includes(forbiddenImport)) {
    fail(`forbidden scope import token in print runtime: ${forbiddenImport}`);
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
console.log("[A17P2P5 Checker] PASS");

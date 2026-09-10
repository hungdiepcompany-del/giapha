const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
let hasError = false;

function fail(message) {
  console.error(`[A17P2P6 Checker] FAIL: ${message}`);
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
  "lib/family/print/tree-print-couple-invariants.ts",
  "lib/family/print/tree-print-preview-scale.ts",
  "lib/family/print/tree-print-layout-orientation.ts",
  "lib/family/print/tree-print-component-packing.ts",
  "lib/family/print/tree-print-large-format.ts",
  "components/tree-print/tree-print-workspace.tsx",
  "components/tree-print/tree-print-toolbar.tsx",
  "components/tree-print/tree-print-diagnostics-panel.tsx",
  "app/globals.css",
  "scripts/test-a17p2p6-couple-solver.cjs",
  "scripts/test-a17p2p6-order-independence.cjs",
  "scripts/test-a17p2p6-layout-axis.cjs",
  "scripts/test-a17p2p6-packing.cjs",
  "scripts/test-a17p2p6-fail-closed.cjs",
  "scripts/test-a17p2p6-export-regression.cjs",
  "docs/PLAN_A17P2P6_COUPLE_SAME_GENERATION_POST_LAYOUT_INVARIANT_AND_ARTIFACT_RECONCILIATION.md",
];

for (const file of requiredFiles) read(file);

const packageJson = read("package.json");
const invariants = read("lib/family/print/tree-print-couple-invariants.ts");
const previewScale = read("lib/family/print/tree-print-preview-scale.ts");
const layout = read("lib/family/print/tree-print-layout-orientation.ts");
const packing = read("lib/family/print/tree-print-component-packing.ts");
const largeFormat = read("lib/family/print/tree-print-large-format.ts");
const workspace = read("components/tree-print/tree-print-workspace.tsx");
const toolbar = read("components/tree-print/tree-print-toolbar.tsx");
const diagnosticsPanel = read("components/tree-print/tree-print-diagnostics-panel.tsx");
const globals = read("app/globals.css");
const plan = read("docs/PLAN_A17P2P6_COUPLE_SAME_GENERATION_POST_LAYOUT_INVARIANT_AND_ARTIFACT_RECONCILIATION.md");
const runtime = [
  invariants,
  previewScale,
  layout,
  packing,
  largeFormat,
  workspace,
  toolbar,
  diagnosticsPanel,
  globals,
].join("\n");

for (const script of [
  '"check:a17p2p6"',
  '"test:a17p2p6:solver"',
  '"test:a17p2p6:order"',
  '"test:a17p2p6:layout-axis"',
  '"test:a17p2p6:packing"',
  '"test:a17p2p6:fail-closed"',
  '"test:a17p2p6:export"',
]) {
  assertIncludes(packageJson, script, "package.json");
}

for (const token of [
  "collectTreePrintSemanticCoupleRelations",
  "EXPLICIT_COUPLE_EDGE",
  "SHARED_FAMILY_PARENTS",
  "validateCoupleGenerationInvariant",
  "validateCoupleLayoutAxisInvariant",
  "validateCoupleComponentInvariant",
  "A17P2P6_COUPLE_GENERATION_MISMATCH",
  "A17P2P6_COUPLE_LAYOUT_AXIS_MISMATCH",
  "A17P2P6_COUPLE_POST_PACKING_AXIS_MISMATCH",
  "A17P2P6_COUPLE_CROSS_COMPONENT_INVALID",
  "A17P2P6_PRINT_LAYOUT_INVALID_COORDINATE",
  "A17P2P6_GENERATION_CONSTRAINT_CYCLE",
]) {
  assertIncludes(invariants, token, "couple invariant helper");
}

for (const token of [
  "TREE_PRINT_LAYOUT_ALGORITHM_VERSION",
  "A17P2P6_SEMANTIC_COUPLE_INVARIANT_V1",
  "collectTreePrintSemanticCoupleRelations(document)",
  "generationViolations",
  "postLayoutAxisValidation",
  "postPackingAxisValidation",
  "SEMANTIC_COUPLE_RELATION_COUNT",
  "COUPLE_GENERATION_MISMATCH_COUNT",
  "COUPLE_LAYOUT_AXIS_MISMATCH_COUNT",
  "COUPLE_POST_PACKING_AXIS_MISMATCH_COUNT",
  "COUPLE_CROSS_COMPONENT_INVALID_COUNT",
  "GENERATION_CONSTRAINT_CYCLE_COUNT",
]) {
  assertIncludes(layout, token, "layout orientation engine");
}

for (const token of [
  "NON_UNIFORM_COMPONENT_TRANSLATION_COUNT",
  "countNonUniformComponentTranslations",
  "sameTranslation",
]) {
  assertIncludes(packing, token, "component packing");
}

for (const token of [
  "layoutAlgorithmVersion",
  "A17P2P6_COUPLE_GENERATION_MISMATCH",
  "A17P2P6_COUPLE_LAYOUT_AXIS_MISMATCH",
  "A17P2P6_COUPLE_POST_PACKING_AXIS_MISMATCH",
  "A17P2P6_COUPLE_CROSS_COMPONENT_INVALID",
  "A17P2P6_PRINT_LAYOUT_INVALID_COORDINATE",
]) {
  assertIncludes(largeFormat, token, "large-format fail-closed plan");
}

for (const token of [
  "calculateTreePrintPreviewScale",
  "availableViewportWidth / Math.max(1, input.artboardLogicalWidth)",
  "availableViewportHeight / Math.max(1, input.artboardLogicalHeight)",
  "Math.min(widthScale, heightScale)",
]) {
  assertIncludes(previewScale, token, "preview scale helper");
}

for (const token of [
  "data-tree-print-preview-viewport",
  "tree-print-preview-viewport",
  "screenGridClassName",
  "lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]",
  "min-w-0 max-w-full overflow-hidden",
  "overflow-auto",
  "showDiagnosticsPanel",
  "screenSvgWidth",
  "screenSvgHeight",
  'width={screenSvgWidth}',
  'height={screenSvgHeight}',
  'width={`${exportWidthMm}mm`}',
  'height={`${exportHeightMm}mm`}',
]) {
  assertIncludes(workspace, token, "workspace viewport containment");
}

for (const token of [
  "100% preview",
  "showDiagnosticsPanel",
  "onToggleDiagnosticsPanel",
]) {
  assertIncludes(toolbar, token, "toolbar viewport controls");
}

for (const token of [
  "tree-print-diagnostics-panel",
  "lg:w-[340px]",
  "lg:max-w-[340px]",
  "lg:overflow-y-auto",
  "Semantic couples",
  "Couple generation mismatch",
]) {
  assertIncludes(diagnosticsPanel, token, "diagnostics panel containment");
}

for (const token of [
  ".tree-print-preview-viewport",
  ".tree-print-preview-svg",
  "min-width: 0",
  "max-width: 100%",
  "contain: layout paint",
]) {
  assertIncludes(globals, token, "global viewport CSS");
}

for (const token of [
  "ROOT_CAUSE_CATEGORY=A17P2P5_SEMANTIC_SPOUSE_GROUP_INCOMPLETE",
  "VIEWPORT_CONTAINMENT=A17P2P6_PRINT_WORKSPACE_DOCUMENT_OVERFLOW",
  "A17P2P5 source validation PASS but owner visual artifact smoke FAIL",
  "OWNER_ARTIFACT_SMOKE_REQUIRED",
]) {
  assertIncludes(plan, token, "A17P2P6 plan");
}

for (const forbidden of [
  "app/auth/",
  "components/auth/",
  "lib/auth/",
  "lib/supabase/",
  "lib/permissions/",
  "_guard/",
  "html2canvas",
  "jspdf",
  "pdf-lib",
  "puppeteer",
  "playwright",
  "pageMap",
  "continuationMarker",
]) {
  if (runtime.toLowerCase().includes(forbidden.toLowerCase())) {
    fail(`forbidden token found in A17P2P6 runtime: ${forbidden}`);
  }
}

if (/body\s*\{[^}]*overflow-x\s*:\s*hidden/i.test(globals)) {
  fail("viewport containment must not hide body horizontal overflow as a workaround");
}

if (hasError) process.exit(1);
console.log("[A17P2P6 Checker] PASS");

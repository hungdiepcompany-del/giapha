const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
let hasError = false;

function fail(message) {
  console.error(`[A17P0 Checker] FAIL: ${message}`);
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

const requiredFiles = [
  "app/(admin)/admin/tree/print/page.tsx",
  "components/tree-print/tree-print-workspace.tsx",
  "components/tree-print/tree-print-toolbar.tsx",
  "components/tree-print/tree-print-svg.tsx",
  "components/tree-print/tree-print-diagnostics-panel.tsx",
  "components/tree-print/tree-print-page-frame.tsx",
  "components/tree-print/tree-print-legend.tsx",
  "lib/family/print/tree-print-types.ts",
  "lib/family/print/tree-print-model.ts",
  "lib/family/print/tree-print-layout-snapshot.ts",
  "lib/family/print/tree-print-diagnostics.ts",
  "lib/family/print/tree-print-bounds.ts",
  "scripts/test-a17p0-tree-print-contracts.cjs",
  "docs/PLAN_A17P0_TREE_PRINT_WORKSPACE_VECTOR_PREVIEW_AND_DIAGNOSTICS.md",
];

for (const file of requiredFiles) {
  read(file);
}

const packageJson = read("package.json");
const a17p1Enabled =
  packageJson.includes('"check:a17p1"') &&
  fs.existsSync(path.join(root, "docs/PLAN_A17P1_VECTOR_PRINT_PDF_EXPORT_AND_PAPER_PRESETS.md"));
const route = read("app/(admin)/admin/tree/print/page.tsx");
const svg = read("components/tree-print/tree-print-svg.tsx");
const workspace = read("components/tree-print/tree-print-workspace.tsx");
const diagnostics = read("lib/family/print/tree-print-diagnostics.ts");
const model = read("lib/family/print/tree-print-layout-snapshot.ts");
const adminTreePage = read("app/(admin)/admin/tree/page.tsx");
const viewer = read("components/tree/family-tree-viewer.tsx");
const editor = read("components/tree/family-tree-editor.tsx");

if (!packageJson.includes('"check:a17p0"')) fail("package.json missing check:a17p0 script");
if (!packageJson.includes('"test:a17p0:print"')) fail("package.json missing test:a17p0:print script");
if (!route.includes('permissions.includes("tree.view")')) fail("print route must guard with tree.view");
if (!route.includes("layoutFamilyTreeGraph")) fail("print route must reuse baseline layout snapshot");
if (!route.includes("TreePrintWorkspace")) fail("print route must render TreePrintWorkspace");
if (!adminTreePage.includes('/admin/tree/print')) fail("admin tree page must link to print route");

for (const token of ["<svg", "<g", "<rect", "<path", "<circle", "<text"]) {
  if (!svg.includes(token)) fail(`SVG renderer missing ${token}`);
}

const bannedP0RuntimeTokens = [
  "html2canvas",
  "toDataURL",
  "canvas",
  "png",
  "jspdf",
  "pdf-lib",
];
if (!a17p1Enabled) {
  bannedP0RuntimeTokens.push("window.print", "Xuất PDF");
}

for (const banned of bannedP0RuntimeTokens) {
  const haystack = `${route}\n${svg}\n${workspace}\n${model}`;
  if (haystack.toLowerCase().includes(banned.toLowerCase())) {
    fail(`P0 must not introduce screenshot/bitmap/PDF/print behavior: ${banned}`);
  }
}

for (const token of [
  "NODE_OVERLAP_COUNT",
  "EDGE_CARD_INTERSECTION_COUNT",
  "CONNECTED_COMPONENT_COUNT",
  "MAX_HORIZONTAL_EDGE_SPAN",
  "MAX_VERTICAL_EDGE_SPAN",
]) {
  if (!diagnostics.includes(token)) fail(`diagnostics missing ${token}`);
}

for (const privateField of ["notes_private", "short_bio", "birth_place", "home_town"]) {
  if (model.includes(privateField) || svg.includes(privateField)) {
    fail(`print model must not include private field ${privateField}`);
  }
}

for (const phrase of ["focus mode", "A17S", "generation lane", "subtree"]) {
  const runtime = `${route}\n${svg}\n${workspace}\n${model}`;
  if (runtime.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`A17P0 runtime must not introduce later feature phrase: ${phrase}`);
  }
}

if (!viewer.includes("ReactFlow") || !editor.includes("ReactFlow")) {
  fail("viewer/editor baseline files should remain React Flow based");
}

if (hasError) {
  process.exit(1);
}

console.log("[A17P0 Checker] PASS");

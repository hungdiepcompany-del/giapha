const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
let hasError = false;

function fail(message) {
  console.error(`[A17P0U1 Checker] FAIL: ${message}`);
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

const packageJson = read("package.json");
const a17p1Enabled =
  packageJson.includes('"check:a17p1"') &&
  fs.existsSync(path.join(root, "docs/PLAN_A17P1_VECTOR_PRINT_PDF_EXPORT_AND_PAPER_PRESETS.md"));
const toolbar = read("components/tree-print/tree-print-toolbar.tsx");
const workspace = read("components/tree-print/tree-print-workspace.tsx");
const state = read("lib/family/print/tree-print-toolbar-state.ts");
const test = read("scripts/test-a17p0u1-toolbar-state-contracts.cjs");

if (!packageJson.includes('"check:a17p0u1"')) fail("package.json missing check:a17p0u1 script");
if (!packageJson.includes('"test:a17p0u1:toolbar"')) {
  fail("package.json missing test:a17p0u1:toolbar script");
}
if (!test.includes("[A17P0U1 Toolbar State Tests] PASS")) {
  fail("toolbar state test must expose a deterministic PASS marker");
}

for (const token of [
  "TreePrintViewMode",
  '"fit-tree"',
  '"fit-width"',
  '"default"',
  '"custom"',
  "TreePrintViewportOperation",
  "nextTreePrintViewMode",
  "fitModesAreMutuallyExclusive",
  "buildTreePrintToolbarStatus",
]) {
  if (!state.includes(token)) fail(`toolbar state helper missing ${token}`);
}

for (const token of [
  "useState<TreePrintViewMode>",
  'nextTreePrintViewMode("fit-tree")',
  'nextTreePrintViewMode("fit-width")',
  'nextTreePrintViewMode("zoom-in")',
  'nextTreePrintViewMode("zoom-out")',
  'nextTreePrintViewMode("wheel-zoom")',
  'nextTreePrintViewMode("pan")',
  'nextTreePrintViewMode("reset")',
  "lastAction",
  "flashAction",
]) {
  if (!workspace.includes(token)) fail(`workspace missing viewport state token ${token}`);
}

for (const token of [
  "aria-pressed",
  "focus-visible:ring-2",
  "focus-within:ring-2",
  "ToolbarGroup",
  "ModeButton",
  "ActionButton",
  "ToggleButton",
  "StatusBadge",
  "buildTreePrintToolbarStatus",
  "isFitModeActive",
  "Trạng thái",
  "Khung nhìn",
  "Lớp hiển thị",
  "Bản in",
  "flex-wrap",
]) {
  if (!toolbar.includes(token)) fail(`toolbar missing observable UI token ${token}`);
}

if (a17p1Enabled) {
  for (const token of ["Zoom màn hình:", "PRINT_SCALE:", "Mật độ:", "Tỷ lệ in"]) {
    if (!toolbar.includes(token)) fail(`A17P1 toolbar status missing ${token}`);
  }
} else {
  for (const token of ["Chế độ xem:", "Tỷ lệ:", "Khung trang:", "Mật độ thẻ:"]) {
    if (!toolbar.includes(token)) fail(`A17P0U1 toolbar status missing ${token}`);
  }
}

for (const token of [
  "bg-teal-700",
  "text-white",
  "border-teal-700",
  "shadow-sm",
  "bg-teal-50",
  "border-teal-300",
  "bg-amber-50",
  "border-amber-300",
]) {
  if (!toolbar.includes(token)) fail(`toolbar missing active style token ${token}`);
}

const u1ControlRuntime = `${toolbar}\n${workspace}\n${state}`;
const bannedU1ControlRuntimeTokens = [
  "toDataURL",
  "html2canvas",
  "jspdf",
  "pdf-lib",
  "canvas",
  "png",
  "ReactFlow",
  "generation lane",
  "subtree",
];
if (!a17p1Enabled) {
  bannedU1ControlRuntimeTokens.push("window.print");
}

for (const banned of bannedU1ControlRuntimeTokens) {
  if (u1ControlRuntime.toLowerCase().includes(banned.toLowerCase())) {
    fail(`A17P0U1 must not introduce out-of-scope runtime token: ${banned}`);
  }
}

for (const [label, source] of [["toolbar", toolbar], ["toolbar state", state]]) {
  if (source.includes("layoutFamilyTreeGraph") || source.includes("tree-layout-elk")) {
    fail(`A17P0U1 ${label} must not own ELK layout execution`);
  }
}

if (!workspace.includes('"use client"') || !workspace.includes("layoutFamilyTreeGraph(graph)")) {
  fail("A17P0U1 must prove ELK layout stays in the client workspace boundary");
}

if (hasError) process.exit(1);

console.log("[A17P0U1 Checker] PASS");

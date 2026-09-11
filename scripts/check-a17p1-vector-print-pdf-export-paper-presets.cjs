const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.join(__dirname, "..");
let hasError = false;

function fail(message) {
  console.error(`[A17P1 Checker] FAIL: ${message}`);
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
  "lib/family/print/tree-print-paper.ts",
  "lib/family/print/tree-print-scale.ts",
  "lib/family/print/tree-print-units.ts",
  "lib/family/print/tree-print-svg-export.ts",
  "lib/family/print/tree-print-page-style.ts",
  "scripts/test-a17p1-print-export-contracts.cjs",
  "docs/PLAN_A17P1_VECTOR_PRINT_PDF_EXPORT_AND_PAPER_PRESETS.md",
];

for (const file of requiredFiles) {
  read(file);
}

const packageJson = read("package.json");
const route = read("app/(admin)/admin/tree/print/page.tsx");
const workspace = read("components/tree-print/tree-print-workspace.tsx");
const toolbar = read("components/tree-print/tree-print-toolbar.tsx");
const svg = read("components/tree-print/tree-print-svg.tsx");
const pageFrame = read("components/tree-print/tree-print-page-frame.tsx");
const panel = read("components/tree-print/tree-print-diagnostics-panel.tsx");
const paper = read("lib/family/print/tree-print-paper.ts");
const scale = read("lib/family/print/tree-print-scale.ts");
const units = read("lib/family/print/tree-print-units.ts");
const svgExport = read("lib/family/print/tree-print-svg-export.ts");
const pageStyle = read("lib/family/print/tree-print-page-style.ts");
const globals = read("app/globals.css");

if (!packageJson.includes('"check:a17p1"')) fail("package.json missing check:a17p1 script");
if (!packageJson.includes('"test:a17p1:print-export"')) fail("package.json missing test:a17p1:print-export script");
if (!route.includes('permissions.includes("tree.view")')) fail("print route must remain admin/tree.view guarded");

for (const token of ['"A4"', '"A3"', '"A2"', '"A1"', '"A0"', "210", "297", "420", "594", "841", "1189"]) {
  if (!paper.includes(token)) fail(`paper preset model missing ${token}`);
}
for (const token of ['"portrait"', '"landscape"', "orientation ===", "Math.max", "Math.min"]) {
  if (!paper.includes(token)) fail(`orientation model missing ${token}`);
}
for (const token of ["5", "10", "15", "20", "25", "30", "calculateTreePrintPrintableArea", "normalizeTreePrintMargin"]) {
  if (!paper.includes(token)) fail(`margin model missing ${token}`);
}

for (const token of [
  "mmToCssPx",
  "cssPxToMm",
  "layoutUnitToMm",
  "fontLayoutUnitToPt",
  "25.4",
  "96",
  "72",
]) {
  if (!units.includes(token)) fail(`unit conversion helper missing ${token}`);
}

for (const token of [
  '"fit-page"',
  '"fit-width"',
  '"manual"',
  "fitPageScale",
  "fitWidthScale",
  "manualScalePercent",
  "cardFontSizePt",
  "cardWidthMm",
  "cardHeightMm",
  "readabilityLevel",
  "READABILITY_THRESHOLDS",
  "GOOD",
  "ACCEPTABLE",
  "WARNING",
  "UNREADABLE",
]) {
  if (!scale.toUpperCase().includes(token.toUpperCase())) fail(`print scale/readability model missing ${token}`);
}

for (const token of [
  "downloadTreePrintSvg",
  "window.print()",
  "showPrintHeader",
  "showPrintFooter",
  "showPrintLegend",
  "printContentOffset",
  "buildTreePrintPageStyle",
  '"ONE_PAGE_OVERVIEW"',
  "Trang 1/1",
]) {
  if (!workspace.includes(token)) fail(`workspace missing ${token}`);
}
if (!`${toolbar}\n${panel}`.includes("VIEWPORT_ZOOM")) fail("UI must distinguish VIEWPORT_ZOOM");
if (!toolbar.includes("PRINT_SCALE")) fail("UI must distinguish PRINT_SCALE");

for (const token of [
  "In / Lưu PDF",
  "Tải SVG",
  "Khổ giấy",
  "Chiều giấy",
  "Lề",
  "Tỷ lệ in",
]) {
  if (!toolbar.includes(token)) fail(`toolbar missing Vietnamese copy token ${token}`);
}
for (const token of ["Dọc", "Ngang"]) {
  if (!`${toolbar}\n${paper}`.includes(token)) fail(`orientation UI/helper missing ${token}`);
}
for (const token of ["Vừa một trang", "Vừa chiều rộng", "Tùy chỉnh"]) {
  if (!`${toolbar}\n${scale}`.includes(token)) fail(`print scale UI/helper missing ${token}`);
}

for (const token of [
  "Cỡ chữ dự kiến",
  "Mức độ dễ đọc",
  "Vùng in",
  "Nội dung vượt vùng in",
  "1 trang nhưng chữ quá nhỏ",
]) {
  if (!panel.includes(token)) fail(`print summary panel missing ${token}`);
}

for (const token of ["TreePrintPageFrame", "printableWidthLayoutUnits", "printableHeightLayoutUnits", "marginLayoutUnits"]) {
  if (!pageFrame.includes(token)) fail(`page frame preview missing shared calculation token ${token}`);
}

for (const token of [
  "XMLSerializer",
  "cloneNode",
  "xmlns",
  "Blob",
  "image/svg+xml;charset=utf-8",
  "URL.createObjectURL",
  "URL.revokeObjectURL",
  "data-tree-print-diagnostics",
  "data-tree-print-export-exclude",
  "gia-pha-toan-cay",
]) {
  if (!svgExport.includes(token)) fail(`SVG serializer/download utility missing ${token}`);
}
if (!svg.includes("<svg") || !svg.includes("viewBox") || !svg.includes("<text")) {
  fail("SVG renderer must remain native vector SVG");
}
if (!pageStyle.includes("@page") || !globals.includes("@media print") || !globals.includes(".tree-print-print-root")) {
  fail("dynamic page style and print CSS must be present");
}
if (!globals.includes("body *") || !globals.includes("visibility: hidden")) {
  fail("print mode must hide controls and admin sidebars");
}

const runtime = [workspace, toolbar, svg, pageFrame, panel, paper, scale, units, svgExport, pageStyle, globals].join("\n");
for (const banned of [
  "toDataURL",
  "html2canvas",
  "jspdf",
  "pdf-lib",
  "puppeteer",
  "playwright",
  "chromium",
  "server-side browser",
  "external pdf service",
  "ReactFlow",
]) {
  if (runtime.toLowerCase().includes(banned.toLowerCase())) {
    fail(`forbidden bitmap/heavy/external export token found: ${banned}`);
  }
}
for (const banned of ["insert(", "update(", "delete(", "upsert(", "rpc("]) {
  if (runtime.toLowerCase().includes(banned)) {
    fail(`database write token found in print runtime: ${banned}`);
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

try {
  const layoutStatus = execFileSync(
    "git",
    [
      "status",
      "--short",
      "--",
      "app/(admin)/admin/tree/page.tsx",
      "app/(admin)/admin/tree/edit",
      "components/tree/family-tree-viewer.tsx",
      "components/tree/family-tree-editor.tsx",
    ],
    { cwd: root, encoding: "utf8" },
  ).trim();
  if (layoutStatus) {
    fail(`viewer/editor layout files must remain unchanged:\n${layoutStatus}`);
  }
} catch (error) {
  fail(`Unable to verify viewer/editor status: ${error.message}`);
}

if (hasError) process.exit(1);

console.log("[A17P1 Checker] PASS");

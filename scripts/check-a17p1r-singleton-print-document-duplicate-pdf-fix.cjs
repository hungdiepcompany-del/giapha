const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
let hasError = false;

function fail(message) {
  console.error(`[A17P1R Checker] FAIL: ${message}`);
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

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const requiredFiles = [
  "app/(admin)/admin/tree/print/page.tsx",
  "app/globals.css",
  "components/tree-print/tree-print-workspace.tsx",
  "components/tree-print/tree-print-svg.tsx",
  "lib/family/print/tree-print-dom-contract.ts",
  "lib/family/print/tree-print-page-style.ts",
  "lib/family/print/tree-print-svg-export.ts",
  "lib/family/print/tree-print-paper.ts",
  "lib/family/print/tree-print-scale.ts",
  "scripts/test-a17p1r-print-singleton-contracts.cjs",
  "docs/PLAN_A17P1_VECTOR_PRINT_PDF_EXPORT_AND_PAPER_PRESETS.md",
];

for (const file of requiredFiles) read(file);

const packageJson = read("package.json");
const page = read("app/(admin)/admin/tree/print/page.tsx");
const globals = read("app/globals.css");
const workspace = read("components/tree-print/tree-print-workspace.tsx");
const svg = read("components/tree-print/tree-print-svg.tsx");
const contract = read("lib/family/print/tree-print-dom-contract.ts");
const pageStyle = read("lib/family/print/tree-print-page-style.ts");
const svgExport = read("lib/family/print/tree-print-svg-export.ts");
const scale = read("lib/family/print/tree-print-scale.ts");
const runtime = [page, globals, workspace, svg, contract, pageStyle, svgExport, scale].join("\n");

if (!packageJson.includes('"check:a17p1r"')) fail("package.json missing check:a17p1r script");
if (!packageJson.includes('"test:a17p1r:print-singleton"')) fail("package.json missing test:a17p1r:print-singleton script");
if (!contract.includes('export type TreePrintSurface = "screen-preview" | "print-document"')) fail("pure print surface contract missing");
if (!contract.includes("TREE_PRINT_SINGLETON_CONTRACT")) fail("singleton visibility contract missing");
if (!contract.includes("hasForcedTreePrintPageBreak")) fail("page-break guard helper missing");

if (count(page, "data-tree-print-page=") !== 1) fail("route must expose exactly one print page scope");
if (!page.includes("data-tree-print-route-content=")) fail("route content wrapper must be explicitly scoped");
if (count(workspace, "data-tree-print-root=") !== 1) fail("workspace must expose exactly one tree print root");
if (count(workspace, "data-tree-print-document-root=") !== 1) fail("workspace must expose exactly one print document root");
if (count(workspace, "data-tree-print-document=") !== 1) fail("workspace must render exactly one print document");
if (count(workspace, "className=\"tree-print-print-svg\"") !== 1) fail("print document must contain exactly one print SVG");
if (count(workspace, "window.print()") !== 1) fail("one click path must call window.print exactly once");
if (count(workspace, "data-tree-print-page-style=") !== 1) fail("dynamic @page style must be one stable style node");
if (!svg.includes("data-tree-print-primary-content")) fail("SVG primary content marker missing");

if (!globals.includes("@media screen")) fail("screen media contract missing");
if (!globals.includes("@media print")) fail("print media contract missing");
if (!globals.includes("[data-tree-print-document]")) fail("print document selector missing from CSS");
if (!globals.includes("[data-tree-print-screen-preview]")) fail("screen preview selector missing from CSS");
if (!globals.includes("[data-tree-print-screen-preview]") || !globals.includes("display: none !important")) fail("screen preview must be removed from print layout");
if (!globals.includes("body:has([data-tree-print-page]) aside")) fail("admin sidebar must be removed from print layout");
if (!globals.includes("header:not(.tree-print-print-header)")) fail("admin header must be removed without hiding print header");
if (!globals.includes("[data-tree-print-route-content]")) fail("route content margin normalization missing");
if (/\.tree-print-print-root\s*\{[^}]*position:\s*fixed/i.test(globals)) fail("print root must not be fixed because fixed roots repeat on each printed page");
if (globals.includes(".tree-print-print-page-last")) fail("retired multi-page print selector must not remain");
if (globals.includes("break-after: page")) fail("single-artboard print flow must not force page breaks");
if (globals.includes("page-break-after: always")) fail("single-artboard print flow must not use legacy forced page breaks");

for (const token of ["beforeprint", "afterprint", "matchMedia", "createPortal"]) {
  if (runtime.includes(token)) fail(`duplicate lifecycle path token found: ${token}`);
}
if (workspace.includes("appendChild") || workspace.includes("cloneNode")) fail("workspace must not create temporary/duplicated print DOM");
if (!svgExport.includes("cloneNode") || !svgExport.includes("sanitizeSerializedTreePrintSvg")) fail("SVG export serializer regression");
if (count(pageStyle, "@page") !== 1 || !pageStyle.includes(".tree-print-print-sheet")) fail("dynamic @page style must remain a singleton sheet rule");
if (!scale.includes("readabilityMessage") || !scale.includes("unreadable")) fail("readability warning contract must remain unchanged");
if (!workspace.includes("Trang 1/1")) fail("A17P1 singleton footer must remain Trang 1/1");

for (const banned of ["toDataURL", "html2canvas", "jspdf", "pdf-lib", "puppeteer", "playwright", "chromium"]) {
  if (runtime.toLowerCase().includes(banned.toLowerCase())) fail(`forbidden bitmap/heavy export token found: ${banned}`);
}
for (const banned of ["insert(", "update(", "delete(", "upsert(", "rpc("]) {
  if (runtime.toLowerCase().includes(banned)) fail(`database write token found in print runtime: ${banned}`);
}

if (hasError) process.exit(1);
console.log("[A17P1R Checker] PASS");

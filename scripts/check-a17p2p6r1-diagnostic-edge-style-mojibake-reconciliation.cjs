const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
let hasError = false;

function fail(message) {
  console.error(`[A17P2P6R1 Checker] FAIL: ${message}`);
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

function assertExcludes(haystack, token, label) {
  if (haystack.includes(token)) fail(`${label} still contains forbidden token ${token}`);
}

const requiredFiles = [
  "lib/family/print/tree-print-edge-style.ts",
  "components/tree-print/tree-print-svg.tsx",
  "components/tree-print/tree-print-legend.tsx",
  "components/tree-print/tree-print-toolbar.tsx",
  "components/tree-print/tree-print-workspace.tsx",
  "lib/family/print/tree-print-large-format.ts",
  "lib/family/print/tree-print-svg-export.ts",
  "scripts/test-a17p2p6r1-edge-style-parity.cjs",
  "scripts/test-a17p2p6r1-diagnostic-overlay.cjs",
  "scripts/test-a17p2p6r1-export-exclusion.cjs",
  "scripts/test-a17p2p6r1-mojibake.cjs",
  "scripts/test-a17p2p6r1-export-regression.cjs",
  "docs/PLAN_A17P2P6R1_DIAGNOSTIC_OVERLAY_EDGE_STYLE_AND_REMAINING_MOJIBAKE_RECONCILIATION.md",
];

for (const file of requiredFiles) read(file);

const packageJson = read("package.json");
const edgeStyle = read("lib/family/print/tree-print-edge-style.ts");
const svg = read("components/tree-print/tree-print-svg.tsx");
const legend = read("components/tree-print/tree-print-legend.tsx");
const toolbar = read("components/tree-print/tree-print-toolbar.tsx");
const largeFormat = read("lib/family/print/tree-print-large-format.ts");
const svgExport = read("lib/family/print/tree-print-svg-export.ts");
const plan = read("docs/PLAN_A17P2P6R1_DIAGNOSTIC_OVERLAY_EDGE_STYLE_AND_REMAINING_MOJIBAKE_RECONCILIATION.md");

for (const script of [
  '"check:a17p2p6r1"',
  '"test:a17p2p6r1:edge-style-parity"',
  '"test:a17p2p6r1:diagnostic-overlay"',
  '"test:a17p2p6r1:export-exclusion"',
  '"test:a17p2p6r1:mojibake"',
  '"test:a17p2p6r1:export-regression"',
]) {
  assertIncludes(packageJson, script, "package.json");
}

for (const token of [
  "TreePrintEdgeVisualRole",
  "diagnostic-warning",
  "diagnostic-error",
  "getTreePrintSemanticEdgeVisual",
  "getTreePrintDiagnosticEdgeVisual",
  "validateTreePrintOrientationEdgeStyleParity",
  "A17P2P6R1_EDGE_STYLE_ORIENTATION_MISMATCH",
  "A17P2P6R1_EDGE_SEMANTIC_TYPE_CHANGED_BY_ORIENTATION",
  "A17P2P6R1_PRODUCTION_EDGE_COUNT_MISMATCH",
]) {
  assertIncludes(edgeStyle, token, "edge style source of truth");
}

for (const token of [
  "getTreePrintSemanticEdgeVisual(edge)",
  "getTreePrintDiagnosticEdgeVisual(edge, issue)",
  'data-tree-print-diagnostic-layer="true"',
  'data-tree-print-diagnostic-only="true"',
  'data-tree-print-export-exclude="true"',
  'data-tree-print-export-eligible="true"',
  "showDiagnostics && overlaps.has(person.id)",
]) {
  assertIncludes(svg, token, "TreePrintSvg diagnostic overlay separation");
}

for (const forbidden of [
  "intersects.has(edge.id)",
  "stroke={isProblem ?",
  "const isProblem",
]) {
  assertExcludes(svg, forbidden, "TreePrintSvg semantic edge rendering");
}

assertIncludes(legend, "TREE_PRINT_EDGE_VISUAL_STYLES", "TreePrintLegend style map usage");
assertIncludes(toolbar, "Bảng chẩn đoán: {showDiagnosticsPanel ? \"Hiện\" : \"Ẩn\"}", "toolbar mojibake fix");
assertIncludes(largeFormat, "validateTreePrintOrientationEdgeStyleParity", "large format pre-export parity");
assertIncludes(largeFormat, "Kiểu hiển thị quan hệ không nhất quán giữa bản ngang và bản dọc.", "large format safe parity error");
assertIncludes(svgExport, "stripTreePrintDiagnosticElements", "SVG export diagnostic stripping");
assertIncludes(svgExport, "A17P2P6R1_DIAGNOSTIC_OVERLAY_LEAKED_TO_EXPORT", "SVG export fail-closed code");

for (const token of [
  "ROOT_CAUSE_CATEGORY=DIAGNOSTIC_STATE_MUTATES_SEMANTIC_EDGE_STYLE",
  "EDGE_COLOR_GREEN_MEANING=",
  "EDGE_COLOR_RED_MEANING=",
  "EDGE_COLOR_GRAY_MEANING=",
  "DIAGNOSTIC_OVERLAY_EXCLUDED_FROM_SVG=PASS",
  "MOJIBAKE_ROOT_CAUSE_CATEGORY=DOUBLE_ENCODED_SOURCE_LITERAL_IN_PRINT_SCOPE",
  "OWNER_ARTIFACT_SMOKE=PENDING",
]) {
  assertIncludes(plan, token, "A17P2P6R1 plan");
}

const printScope = [
  "components/tree-print",
  "lib/family/print",
  "app/(admin)/admin/tree/print",
];
const forbiddenPatterns = [
  { name: "LATIN1_UTF8_LEAD_C3", re: /\u00c3/ },
  { name: "LATIN1_UTF8_LEAD_C2", re: /\u00c2/ },
  { name: "LATIN1_UTF8_LEAD_C4", re: /\u00c4/ },
  { name: "LATIN1_UTF8_LEAD_C6", re: /\u00c6/ },
  { name: "REPLACEMENT_CHARACTER", re: /\ufffd/ },
  { name: "VIETNAMESE_TONE_BYTES_SPLIT", re: /\u00e1[\u00ba\u00bb]/ },
  { name: "SMART_PUNCTUATION_MOJIBAKE", re: /\u00e2(?:\u20ac|\u0153|\u201d|\u201c|\u201e|\u2014)/ },
];

for (const file of printScope.flatMap(walk).sort()) {
  read(file).split(/\r?\n/).forEach((line, index) => {
    for (const pattern of forbiddenPatterns) {
      if (pattern.re.test(line)) {
        fail(`${file}:${index + 1} contains ${pattern.name}`);
      }
    }
  });
}

const runtime = [
  edgeStyle,
  svg,
  legend,
  toolbar,
  largeFormat,
  svgExport,
].join("\n");

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
    fail(`forbidden token found in A17P2P6R1 runtime: ${forbidden}`);
  }
}

if (hasError) process.exit(1);
console.log("[A17P2P6R1 Checker] PASS");

function walk(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) return walk(relativePath);
    if (!/\.(?:ts|tsx|cjs|mjs|css|json)$/.test(entry.name)) return [];
    return [relativePath];
  });
}

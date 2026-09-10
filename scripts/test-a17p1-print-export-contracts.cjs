const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.join(__dirname, "..");
const moduleCache = new Map();

function resolveTsPath(specifier) {
  if (!specifier.startsWith("@/")) return null;

  const base = path.join(root, specifier.slice(2));
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(`Cannot resolve ${specifier}`);
}

function loadTsModule(filename) {
  const fullPath = path.resolve(filename);
  if (moduleCache.has(fullPath)) return moduleCache.get(fullPath).exports;

  const source = fs.readFileSync(fullPath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  moduleCache.set(fullPath, loadedModule);

  function localRequire(specifier) {
    const resolved = resolveTsPath(specifier);
    if (resolved) return loadTsModule(resolved);
    if (specifier.startsWith(".")) {
      const base = path.resolve(path.dirname(fullPath), specifier);
      for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, "index.ts")]) {
        if (fs.existsSync(candidate)) return loadTsModule(candidate);
      }
    }
    return require(specifier);
  }

  const execute = new Function("require", "module", "exports", output);
  execute(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function nearlyEqual(actual, expected, epsilon = 0.0001) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} should be close to ${expected}`);
}

const paperModule = loadTsModule(path.join(root, "lib/family/print/tree-print-paper.ts"));
const scaleModule = loadTsModule(path.join(root, "lib/family/print/tree-print-scale.ts"));
const unitModule = loadTsModule(path.join(root, "lib/family/print/tree-print-units.ts"));
const exportModule = loadTsModule(path.join(root, "lib/family/print/tree-print-svg-export.ts"));
const pageStyleModule = loadTsModule(path.join(root, "lib/family/print/tree-print-page-style.ts"));

const {
  calculateTreePrintPrintableArea,
  getTreePrintPaperPreset,
  normalizeTreePrintMargin,
  TREE_PRINT_MARGIN_OPTIONS,
  TREE_PRINT_ORIENTATION_OPTIONS,
  TREE_PRINT_PAPER_SIZE_OPTIONS,
  TREE_PRINT_PAPER_SIZES_MM,
} = paperModule;
const {
  calculateTreePrintScale,
  TREE_PRINT_MAX_MANUAL_SCALE_PERCENT,
  TREE_PRINT_MIN_MANUAL_SCALE_PERCENT,
} = scaleModule;
const { layoutUnitToMm, fontLayoutUnitToPt } = unitModule;
const {
  buildTreePrintSvgFileName,
  sanitizeSerializedTreePrintSvg,
  TREE_PRINT_SVG_FILENAME_PREFIX,
} = exportModule;
const { buildTreePrintPageStyle } = pageStyleModule;

assert.deepEqual(TREE_PRINT_PAPER_SIZE_OPTIONS, ["A4", "A3", "A2", "A1", "A0"]);
assert.deepEqual(TREE_PRINT_ORIENTATION_OPTIONS.sort(), ["landscape", "portrait"].sort());
assert.deepEqual(TREE_PRINT_MARGIN_OPTIONS, [5, 10, 15, 20, 25, 30]);
assert.deepEqual(TREE_PRINT_PAPER_SIZES_MM.A4, { widthMm: 210, heightMm: 297 });
assert.deepEqual(TREE_PRINT_PAPER_SIZES_MM.A3, { widthMm: 297, heightMm: 420 });
assert.deepEqual(TREE_PRINT_PAPER_SIZES_MM.A2, { widthMm: 420, heightMm: 594 });
assert.deepEqual(TREE_PRINT_PAPER_SIZES_MM.A1, { widthMm: 594, heightMm: 841 });
assert.deepEqual(TREE_PRINT_PAPER_SIZES_MM.A0, { widthMm: 841, heightMm: 1189 });

const a4Portrait = getTreePrintPaperPreset("A4", "portrait");
const a4Landscape = getTreePrintPaperPreset("A4", "landscape");
const a3Landscape = getTreePrintPaperPreset("A3", "landscape");
const a0Landscape = getTreePrintPaperPreset("A0", "landscape");

assert.deepEqual(a4Portrait, { size: "A4", orientation: "portrait", widthMm: 210, heightMm: 297, label: "A4 dọc" });
assert.equal(a4Landscape.widthMm, 297);
assert.equal(a4Landscape.heightMm, 210);
assert.equal(a3Landscape.widthMm, 420);
assert.equal(a3Landscape.heightMm, 297);
assert.equal(a0Landscape.widthMm, 1189);
assert.equal(a0Landscape.heightMm, 841);

assert.equal(normalizeTreePrintMargin(1), 5);
assert.equal(normalizeTreePrintMargin(28), 30);
assert.deepEqual(calculateTreePrintPrintableArea(a4Portrait, 10), {
  paperWidthMm: 210,
  paperHeightMm: 297,
  marginMm: 10,
  printableWidthMm: 190,
  printableHeightMm: 277,
});
assert.equal(calculateTreePrintPrintableArea(a4Portrait, 30).printableWidthMm, 150);

const fitPage = calculateTreePrintScale({
  treeWidthLayoutUnits: 1000,
  treeHeightLayoutUnits: 600,
  paper: a4Landscape,
  marginMm: 10,
  mode: "fit-page",
  manualScalePercent: 25,
  cardFontSizeLayoutUnits: 14,
  cardWidthLayoutUnits: 190,
  cardHeightLayoutUnits: 118,
});
const expectedFitWidth = 277 / layoutUnitToMm(1000);
const expectedFitHeight = 190 / layoutUnitToMm(600);
nearlyEqual(fitPage.fitWidthScale, expectedFitWidth);
nearlyEqual(fitPage.fitPageScale, Math.min(expectedFitWidth, expectedFitHeight));
nearlyEqual(fitPage.printScale, fitPage.fitPageScale);

const fitWidth = calculateTreePrintScale({
  treeWidthLayoutUnits: 1000,
  treeHeightLayoutUnits: 600,
  paper: a4Landscape,
  marginMm: 10,
  mode: "fit-width",
  manualScalePercent: 25,
  cardFontSizeLayoutUnits: 14,
  cardWidthLayoutUnits: 190,
  cardHeightLayoutUnits: 118,
});
nearlyEqual(fitWidth.printScale, fitWidth.fitWidthScale);

const boundedLowManual = calculateTreePrintScale({
  treeWidthLayoutUnits: 1000,
  treeHeightLayoutUnits: 600,
  paper: a4Landscape,
  marginMm: 10,
  mode: "manual",
  manualScalePercent: -10,
  cardFontSizeLayoutUnits: 14,
});
const boundedHighManual = calculateTreePrintScale({
  treeWidthLayoutUnits: 1000,
  treeHeightLayoutUnits: 600,
  paper: a4Landscape,
  marginMm: 10,
  mode: "manual",
  manualScalePercent: 240,
  cardFontSizeLayoutUnits: 14,
});
assert.equal(boundedLowManual.manualScalePercent, TREE_PRINT_MIN_MANUAL_SCALE_PERCENT);
assert.equal(boundedHighManual.manualScalePercent, TREE_PRINT_MAX_MANUAL_SCALE_PERCENT);
nearlyEqual(boundedHighManual.printScale, 1);

const viewportZoomOne = calculateTreePrintScale({
  treeWidthLayoutUnits: 1400,
  treeHeightLayoutUnits: 700,
  paper: a0Landscape,
  marginMm: 10,
  mode: "fit-page",
  manualScalePercent: 25,
  cardFontSizeLayoutUnits: 14,
});
const viewportZoomTwo = calculateTreePrintScale({
  treeWidthLayoutUnits: 1400,
  treeHeightLayoutUnits: 700,
  paper: a0Landscape,
  marginMm: 10,
  mode: "fit-page",
  manualScalePercent: 25,
  cardFontSizeLayoutUnits: 14,
});
assert.deepEqual(viewportZoomOne, viewportZoomTwo);

nearlyEqual(fontLayoutUnitToPt(16, 0.5), 6);
assert.equal(
  calculateTreePrintScale({ treeWidthLayoutUnits: 1000, treeHeightLayoutUnits: 600, paper: a0Landscape, marginMm: 10, mode: "manual", manualScalePercent: 100, cardFontSizeLayoutUnits: 12 }).readabilityLevel,
  "good",
);
assert.equal(
  calculateTreePrintScale({ treeWidthLayoutUnits: 1000, treeHeightLayoutUnits: 600, paper: a0Landscape, marginMm: 10, mode: "manual", manualScalePercent: 80, cardFontSizeLayoutUnits: 12 }).readabilityLevel,
  "acceptable",
);
assert.equal(
  calculateTreePrintScale({ treeWidthLayoutUnits: 1000, treeHeightLayoutUnits: 600, paper: a0Landscape, marginMm: 10, mode: "manual", manualScalePercent: 65, cardFontSizeLayoutUnits: 12 }).readabilityLevel,
  "warning",
);
assert.equal(
  calculateTreePrintScale({ treeWidthLayoutUnits: 1000, treeHeightLayoutUnits: 600, paper: a0Landscape, marginMm: 10, mode: "manual", manualScalePercent: 50, cardFontSizeLayoutUnits: 12 }).readabilityLevel,
  "unreadable",
);

const sameTreeA4 = calculateTreePrintScale({
  treeWidthLayoutUnits: 900,
  treeHeightLayoutUnits: 450,
  paper: a4Landscape,
  marginMm: 10,
  mode: "fit-page",
  manualScalePercent: 25,
  cardFontSizeLayoutUnits: 14,
});
const sameTreeA0 = calculateTreePrintScale({
  treeWidthLayoutUnits: 900,
  treeHeightLayoutUnits: 450,
  paper: a0Landscape,
  marginMm: 10,
  mode: "fit-page",
  manualScalePercent: 25,
  cardFontSizeLayoutUnits: 14,
});
assert.ok(sameTreeA0.printScale > sameTreeA4.printScale);
assert.ok(sameTreeA0.cardFontSizePt > sameTreeA4.cardFontSizePt);

const serializedSvg = `
<svg viewBox="0 0 100 100">
  <script>alert("bad")</script>
  <g data-tree-print-export-exclude="true"><text>toolbar admin sidebar</text></g>
  <g data-tree-print-diagnostics="true"><text>diagnostics</text></g>
  <text>Tên tiếng Việt giữ nguyên</text>
  <text onclick="bad()">Tên khác</text>
</svg>`;
const safeDefaultSvg = sanitizeSerializedTreePrintSvg(serializedSvg);
assert.ok(safeDefaultSvg.includes("Tên tiếng Việt giữ nguyên"));
assert.ok(!safeDefaultSvg.includes("<script"));
assert.ok(!safeDefaultSvg.includes("onclick"));
assert.ok(!safeDefaultSvg.includes("toolbar admin sidebar"));
assert.ok(!safeDefaultSvg.includes("diagnostics"));
assert.ok(sanitizeSerializedTreePrintSvg(serializedSvg, { includeDiagnostics: true }).includes("diagnostics"));

const fileName = buildTreePrintSvgFileName(new Date("2026-07-29T11:12:00"));
assert.equal(fileName, `${TREE_PRINT_SVG_FILENAME_PREFIX}-20260729-1112.svg`);
assert.ok(!fileName.toLowerCase().includes("nguyen"));
assert.ok(!fileName.toLowerCase().includes("person"));

const pageStyle = buildTreePrintPageStyle({ paper: a4Landscape, marginMm: 10 });
assert.ok(pageStyle.includes("@page"));
assert.ok(pageStyle.includes("297mm 210mm"));
assert.ok(pageStyle.includes("--tree-print-selected-margin: 10mm"));
assert.ok(!pageStyle.includes("url("));

const runtime = [
  "components/tree-print/tree-print-workspace.tsx",
  "components/tree-print/tree-print-toolbar.tsx",
  "components/tree-print/tree-print-svg.tsx",
  "components/tree-print/tree-print-diagnostics-panel.tsx",
  "lib/family/print/tree-print-paper.ts",
  "lib/family/print/tree-print-scale.ts",
  "lib/family/print/tree-print-svg-export.ts",
  "app/globals.css",
].map(read).join("\n");

for (const token of ["toDataURL", "html2canvas", "jspdf", "pdf-lib", "puppeteer", "playwright", "chromium"]) {
  assert.equal(runtime.toLowerCase().includes(token.toLowerCase()), false, `Forbidden bitmap/heavy export token: ${token}`);
}
for (const token of ["fetch(", "XMLHttpRequest", "axios", "external pdf", "third-party"]) {
  assert.equal(runtime.toLowerCase().includes(token.toLowerCase()), false, `Forbidden external export token: ${token}`);
}
assert.ok(runtime.includes("window.print()"));
assert.ok(runtime.includes("@media print"));
assert.ok(runtime.includes(".tree-print-print-root"));
assert.ok(runtime.includes("body *"));
assert.ok(runtime.includes('"ONE_PAGE_OVERVIEW"'));
assert.ok(runtime.includes("Trang 1/1"));

console.log("[A17P1 Print Export Contracts] PASS");

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

const eligibilityModule = loadTsModule(path.join(root, "lib/family/print/tree-print-eligibility.ts"));
const { evaluateTreePrintExportEligibility } = eligibilityModule;

const cleanPlan = {
  pageCount: 1,
  vectorTree: true,
  blockers: [],
  warnings: [
    { code: "TEXT_NOT_OUTLINED", severity: "warning", message: "font warning" },
  ],
};

const clean = evaluateTreePrintExportEligibility({
  mode: "LARGE_FORMAT_FULL_TREE",
  largeFormatPlan: cleanPlan,
  pdfCapability: "unknown",
});
assert.equal(clean.canExportSvg, true);
assert.equal(clean.canPrintPdf, true);
assert.ok(clean.warnings.some((issue) => issue.code === "TEXT_NOT_OUTLINED"));
assert.ok(clean.warnings.some((issue) => issue.code === "BROWSER_PDF_CAPABILITY_UNKNOWN"));

const pdfBlocked = evaluateTreePrintExportEligibility({
  mode: "LARGE_FORMAT_FULL_TREE",
  largeFormatPlan: cleanPlan,
  pdfCapability: "unreliable",
});
assert.equal(pdfBlocked.canExportSvg, true);
assert.equal(pdfBlocked.canPrintPdf, false);
assert.ok(pdfBlocked.pdfBlockers.some((issue) => issue.code === "BROWSER_PDF_CAPABILITY_UNRELIABLE"));

const blockedPlan = evaluateTreePrintExportEligibility({
  mode: "LARGE_FORMAT_FULL_TREE",
  largeFormatPlan: {
    ...cleanPlan,
    blockers: [{ code: "ARTBOARD_TOO_SHORT", severity: "blocker", message: "too short" }],
  },
  pdfCapability: "likely_supported",
});
assert.equal(blockedPlan.canExportSvg, false);
assert.equal(blockedPlan.canPrintPdf, false);
assert.ok(blockedPlan.svgBlockers.some((issue) => issue.code === "ARTBOARD_TOO_SHORT"));

const overview = evaluateTreePrintExportEligibility({
  mode: "ONE_PAGE_OVERVIEW",
  onePageSummary: {
    paperWidthMm: 1000,
    paperHeightMm: 1000,
    isReadable: false,
    readabilityMessage: "small",
    overflowsWidth: true,
    overflowsHeight: false,
  },
  pdfCapability: "likely_supported",
});
assert.equal(overview.canExportSvg, true);
assert.equal(overview.canPrintPdf, true);
assert.ok(overview.warnings.some((issue) => issue.code === "ONE_PAGE_READABILITY_WARNING"));

console.log("[A17P2P Large Format Eligibility] PASS");

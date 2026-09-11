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
    return require(specifier);
  }

  const execute = new Function("require", "module", "exports", output);
  execute(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const {
  buildTreePrintToolbarStatus,
  fitModesAreMutuallyExclusive,
  isFitModeActive,
  nextTreePrintViewMode,
} = loadTsModule(path.join(root, "lib/family/print/tree-print-toolbar-state.ts"));

assert.equal(nextTreePrintViewMode("fit-tree"), "fit-tree");
assert.equal(nextTreePrintViewMode("fit-width"), "fit-width");
assert.equal(nextTreePrintViewMode("zoom-in"), "custom");
assert.equal(nextTreePrintViewMode("zoom-out"), "custom");
assert.equal(nextTreePrintViewMode("wheel-zoom"), "custom");
assert.equal(nextTreePrintViewMode("pan"), "custom");
assert.equal(nextTreePrintViewMode("reset"), "default");

for (const mode of ["fit-tree", "fit-width", "default", "custom"]) {
  assert.equal(fitModesAreMutuallyExclusive(mode), true);
}

assert.equal(isFitModeActive("fit-tree", "fit-tree"), true);
assert.equal(isFitModeActive("fit-tree", "fit-width"), false);
assert.equal(isFitModeActive("fit-width", "fit-tree"), false);
assert.equal(isFitModeActive("fit-width", "fit-width"), true);

const status = buildTreePrintToolbarStatus({
  viewMode: "fit-tree",
  scale: 0.97,
  showPageFrame: true,
  showDiagnostics: true,
  density: "standard",
  pageFrame: "a0-landscape",
  lastAction: null,
});

assert.deepEqual(status, {
  viewModeLabel: "Fit toàn cây",
  zoomLabel: "97%",
  pageFrameLabel: "A0 ngang",
  diagnosticsLabel: "Chẩn đoán bật",
  densityLabel: "Tiêu chuẩn",
});

const pageFrameOffStatus = buildTreePrintToolbarStatus({
  viewMode: "fit-width",
  scale: 1.234,
  showPageFrame: false,
  showDiagnostics: false,
  density: "compact",
  pageFrame: "a3-landscape",
  lastAction: "zoom-in",
});

assert.equal(pageFrameOffStatus.viewModeLabel, "Fit chiều rộng");
assert.equal(pageFrameOffStatus.zoomLabel, "123%");
assert.equal(pageFrameOffStatus.pageFrameLabel, "Khung trang tắt");
assert.equal(pageFrameOffStatus.diagnosticsLabel, "Chẩn đoán tắt");
assert.equal(pageFrameOffStatus.densityLabel, "Tối giản");

const customNoneStatus = buildTreePrintToolbarStatus({
  viewMode: "custom",
  scale: 1,
  showPageFrame: true,
  showDiagnostics: false,
  density: "compact",
  pageFrame: "none",
  lastAction: null,
});

assert.equal(customNoneStatus.viewModeLabel, "Tùy chỉnh");
assert.equal(customNoneStatus.pageFrameLabel, "Khung trang tắt");

console.log("[A17P0U1 Toolbar State Tests] PASS");

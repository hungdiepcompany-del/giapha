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

function person(id, x, y) {
  return {
    id: `person:${id}`,
    kind: "person",
    personId: id,
    fullName: `Người ${id}`,
    displayName: null,
    birthYear: "1900",
    deathYear: null,
    isLiving: true,
    branchName: null,
    generationNumber: 1,
    lineageClanName: null,
    lineageBranchName: null,
    lineageMembershipType: null,
    lineageVisibility: null,
    visibility: "private",
    position: { x, y },
  };
}

function family(id, x, y) {
  return {
    id: `family:${id}`,
    kind: "family",
    familyId: id,
    label: `Gia đình ${id}`,
    visibility: "private",
    position: { x, y },
  };
}

const { createTreePrintDocument } = loadTsModule(path.join(root, "lib/family/print/tree-print-layout-snapshot.ts"));
const largeFormat = loadTsModule(path.join(root, "lib/family/print/tree-print-large-format.ts"));

const graph = {
  nodes: [
    person("a", 0, 0),
    person("b", 520, 0),
    family("f", 260, 180),
    person("c", 260, 420),
  ],
  edges: [
    { id: "couple", kind: "couple", source: "person:a", target: "person:b", sourceHandle: null, targetHandle: null, label: null, sourceEntityId: "couple" },
    { id: "pa", kind: "family_unit", source: "person:a", target: "family:f", sourceHandle: null, targetHandle: null, label: null, sourceEntityId: "pa" },
    { id: "pb", kind: "family_unit", source: "person:b", target: "family:f", sourceHandle: null, targetHandle: null, label: null, sourceEntityId: "pb" },
    { id: "child", kind: "parent_child", source: "family:f", target: "person:c", sourceHandle: null, targetHandle: null, label: null, sourceEntityId: "child" },
  ],
  meta: { mode: "admin", personCount: 3, familyCount: 1, coupleCount: 1 },
};
const document = createTreePrintDocument(graph, { density: "standard" });

const baseInput = {
  document,
  mode: "LARGE_FORMAT_FULL_TREE",
  mediaWidthPreset: 1500,
  customMediaWidthMm: 1500,
  orientation: "landscape",
  sizingStrategy: "USE_FULL_ROLL_WIDTH",
  lengthMode: "AUTO_FROM_CONTENT",
  customLengthMm: 3000,
  targetFontSizePt: 14,
  safeMarginPreset: 50,
  customSafeMarginMm: 50,
  bleedPreset: 0,
  customBleedMm: 0,
};

const fullWidth = largeFormat.createTreePrintLargeFormatPlan(baseInput);
assert.equal(fullWidth.algorithmVersion, "A17P2P5_TRUE_ORIENTATION_V1");
assert.equal(fullWidth.mode, "LARGE_FORMAT_FULL_TREE");
assert.equal(fullWidth.resolvedOrientation, "landscape");
assert.equal(fullWidth.layoutFlow, "top-to-bottom");
assert.equal(fullWidth.pageCount, 1);
assert.equal(fullWidth.vectorTree, true);
assert.equal(fullWidth.finishedHeightMm, 1500);
assert.ok(fullWidth.finishedWidthMm > fullWidth.finishedHeightMm);
assert.equal(fullWidth.exportHeightMm, 1500);
assert.equal(fullWidth.finishedWidthMm % 10, 0);
assert.equal(fullWidth.blockers.length, 0);
assert.ok(fullWidth.actualFontSizePt > 8);
assert.ok(fullWidth.viewBox.width > 0);
assert.ok(fullWidth.contentOffsetLayoutUnits.x >= 0);

const withBleed = largeFormat.createTreePrintLargeFormatPlan({
  ...baseInput,
  bleedPreset: 20,
});
assert.equal(withBleed.exportWidthMm, withBleed.finishedWidthMm + 40);
assert.equal(withBleed.exportHeightMm, withBleed.finishedHeightMm + 40);
assert.equal(withBleed.safeRectMm.xMm, 70);

const targetFont = largeFormat.createTreePrintLargeFormatPlan({
  ...baseInput,
  sizingStrategy: "TARGET_FONT_SIZE",
  targetFontSizePt: 16,
});
assert.ok(targetFont.actualFontSizePt >= 15.95);

const portrait = largeFormat.createTreePrintLargeFormatPlan({
  ...baseInput,
  orientation: "portrait",
});
assert.equal(portrait.resolvedOrientation, "portrait");
assert.equal(portrait.layoutFlow, "left-to-right");
assert.equal(portrait.finishedWidthMm, 1500);
assert.ok(portrait.finishedHeightMm > portrait.finishedWidthMm);
assert.equal(portrait.orientationResolution.orientationMatchesArtboard, true);

const tooShort = largeFormat.createTreePrintLargeFormatPlan({
  ...baseInput,
  lengthMode: "CUSTOM_LENGTH",
  customLengthMm: 500,
});
assert.ok(tooShort.blockers.some((issue) => issue.code === "CUSTOM_LENGTH_BELOW_AUTO_LENGTH" || issue.code === "ORIENTATION_DIMENSION_MISMATCH"));

assert.equal(largeFormat.getTreePrintProductionModeLabel("LARGE_FORMAT_FULL_TREE"), "Bạt khổ lớn - toàn cây");
assert.equal(largeFormat.getTreePrintProductionModeLabel("LARGE_FORMAT_BRANCH"), "Bạt khổ lớn - theo nhánh");
assert.equal(largeFormat.getTreePrintProductionModeLabel("ONE_PAGE_OVERVIEW"), "Tổng quan kỹ thuật");

console.log("[A17P2P Large Format Geometry] PASS");

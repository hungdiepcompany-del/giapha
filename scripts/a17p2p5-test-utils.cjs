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

function person(id, x, y, generationNumber = null, displayName = null) {
  return {
    id: `person:${id}`,
    kind: "person",
    personId: id,
    fullName: displayName ?? `Person ${id}`,
    displayName,
    birthYear: "1900",
    deathYear: null,
    isLiving: true,
    branchName: null,
    generationNumber,
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
    label: `Family ${id}`,
    visibility: "private",
    position: { x, y },
  };
}

function edge(id, kind, source, target) {
  return { id, kind, source, target, sourceHandle: null, targetHandle: null, label: null, sourceEntityId: id };
}

function graph(nodes, edges) {
  return {
    nodes,
    edges,
    meta: {
      mode: "admin",
      personCount: nodes.filter((node) => node.kind === "person").length,
      familyCount: nodes.filter((node) => node.kind === "family").length,
      coupleCount: edges.filter((item) => item.kind === "couple").length,
    },
  };
}

function createDocument(inputGraph, density = "standard") {
  const { createTreePrintDocument } = loadTsModule(path.join(root, "lib/family/print/tree-print-layout-snapshot.ts"));
  return createTreePrintDocument(inputGraph, { density });
}

function baseLargeFormatInput(document, overrides = {}) {
  return {
    document,
    mode: "LARGE_FORMAT_FULL_TREE",
    mediaWidthPreset: 1500,
    customMediaWidthMm: 1500,
    orientation: "auto",
    sizingStrategy: "USE_FULL_ROLL_WIDTH",
    lengthMode: "AUTO_FROM_CONTENT",
    customLengthMm: 3000,
    targetFontSizePt: 14,
    safeMarginPreset: 50,
    customSafeMarginMm: 50,
    bleedPreset: 0,
    customBleedMm: 0,
    ...overrides,
  };
}

module.exports = {
  baseLargeFormatInput,
  createDocument,
  edge,
  family,
  graph,
  loadTsModule,
  person,
  root,
};

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.join(__dirname, "..");
const moduleCache = new Map();

function resolveTsPath(specifier) {
  if (!specifier.startsWith("@/")) {
    return null;
  }

  const base = path.join(root, specifier.slice(2));
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Cannot resolve ${specifier}`);
}

function loadTsModule(filename) {
  const fullPath = path.resolve(filename);
  if (moduleCache.has(fullPath)) {
    return moduleCache.get(fullPath).exports;
  }

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
    if (resolved) {
      return loadTsModule(resolved);
    }
    return require(specifier);
  }

  const execute = new Function("require", "module", "exports", output);
  execute(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { createTreePrintDocument } = loadTsModule(
  path.join(root, "lib/family/print/tree-print-layout-snapshot.ts"),
);

function person(id, x, y, name, generationNumber = null) {
  return {
    id: `person:${id}`,
    kind: "person",
    personId: id,
    fullName: name,
    displayName: null,
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
    notes_private: "SHOULD_NOT_APPEAR",
    short_bio: "SHOULD_NOT_APPEAR",
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

const people = [
  person("p01", 0, 0, "Tên ẩn danh đời một", 1),
  person("p02", 260, 0, "Tên ẩn danh đời một rất dài", 1),
  person("p03", 120, 190, "Tên ẩn danh đời hai", 2),
  person("p04", 360, 190, "Tên ẩn danh đời hai", 2),
  person("p05", 600, 190, "Tên ẩn danh đời hai", 2),
  person("p06", 120, 380, "Tên ẩn danh đời ba", 3),
  person("p07", 360, 380, "Tên ẩn danh đời ba", 3),
  person("p08", 600, 380, "Tên ẩn danh đời ba", 3),
  person("p09", 850, 380, "Tên ẩn danh đời ba", 3),
  person("p10", 120, 570, "Tên ẩn danh đời bốn", 4),
  person("p11", 360, 570, "Tên ẩn danh đời bốn", 4),
  person("p12", 600, 570, "Tên ẩn danh đời bốn", 4),
  person("p13", 1120, 0, "Cụm phụ một", 1),
  person("p14", 1380, 0, "Cụm phụ hai", 1),
  person("p15", 1240, 210, "Cụm phụ con", 2),
  person("p16", 122, 572, "Tên chồng lên để test", 4),
];
const families = [
  family("f01", 230, 110),
  family("f02", 230, 300),
  family("f03", 490, 300),
  family("f04", 230, 500),
  family("f05", 1250, 120),
  family("f06", 900, 40),
];
const edges = [
  { id: "e01", kind: "couple", source: "person:p01", target: "person:p02" },
  { id: "e02", kind: "family_unit", source: "person:p01", target: "family:f01" },
  { id: "e03", kind: "family_unit", source: "person:p02", target: "family:f01" },
  { id: "e04", kind: "parent_child", source: "family:f01", target: "person:p03" },
  { id: "e05", kind: "parent_child", source: "family:f01", target: "person:p04" },
  { id: "e06", kind: "parent_child", source: "family:f01", target: "person:p05" },
  { id: "e07", kind: "family_unit", source: "person:p03", target: "family:f02" },
  { id: "e08", kind: "parent_child", source: "family:f02", target: "person:p06" },
  { id: "e09", kind: "parent_child", source: "family:f02", target: "person:p07" },
  { id: "e10", kind: "family_unit", source: "person:p05", target: "family:f03" },
  { id: "e11", kind: "parent_child", source: "family:f03", target: "person:p08" },
  { id: "e12", kind: "parent_child", source: "family:f03", target: "person:p09" },
  { id: "e13", kind: "family_unit", source: "person:p06", target: "family:f04" },
  { id: "e14", kind: "parent_child", source: "family:f04", target: "person:p10" },
  { id: "e15", kind: "parent_child", source: "family:f04", target: "person:p11" },
  { id: "e16", kind: "parent_child", source: "family:f04", target: "person:p12" },
  { id: "e17", kind: "couple", source: "person:p13", target: "person:p14" },
  { id: "e18", kind: "family_unit", source: "person:p13", target: "family:f05" },
  { id: "e19", kind: "parent_child", source: "family:f05", target: "person:p15" },
  { id: "e20", kind: "family_unit", source: "person:p01", target: "family:f06" },
  { id: "e21", kind: "parent_child", source: "family:f06", target: "person:p15" },
];

const fixtureGraph = {
  nodes: [...people, ...families],
  edges: edges.map((edge) => ({
    ...edge,
    sourceHandle: null,
    targetHandle: null,
    label: null,
    sourceEntityId: edge.id,
  })),
  meta: {
    mode: "admin",
    personCount: people.length,
    familyCount: families.length,
    coupleCount: 2,
  },
};

const document = createTreePrintDocument(fixtureGraph, { density: "standard" });
const documentAgain = createTreePrintDocument(fixtureGraph, { density: "standard" });
const compact = createTreePrintDocument(fixtureGraph, { density: "compact" });
const empty = createTreePrintDocument({
  nodes: [],
  edges: [],
  meta: { mode: "admin", personCount: 0, familyCount: 0, coupleCount: 0 },
});
const single = createTreePrintDocument({
  nodes: [person("single", 0, 0, "Tên tiếng Việt giữ nguyên", 1)],
  edges: [],
  meta: { mode: "admin", personCount: 1, familyCount: 0, coupleCount: 0 },
});

assert.equal(document.people.length, 16);
assert.equal(document.families.length, 6);
assert.equal(document.edges.length, 21);
assert.equal(document.diagnostics.PERSON_COUNT, 16);
assert.equal(document.diagnostics.FAMILY_COUNT, 6);
assert.equal(document.diagnostics.EDGE_COUNT, 21);
assert.equal(document.diagnostics.CONNECTED_COMPONENT_COUNT, 2);
assert.ok(document.bounds.width > 0);
assert.ok(document.bounds.height > 0);
assert.equal(document.bounds.padding, 96);
assert.deepEqual(document, documentAgain);
assert.ok(compact.people[0].height < document.people[0].height);
assert.ok(document.diagnostics.NODE_OVERLAP_COUNT >= 1);
assert.ok(document.diagnostics.EDGE_CARD_INTERSECTION_COUNT >= 1);
assert.ok(document.diagnostics.MAX_HORIZONTAL_EDGE_SPAN > 0);
assert.equal(empty.people.length, 0);
assert.ok(empty.bounds.width > 0);
assert.equal(single.people[0].displayName, "Tên tiếng Việt giữ nguyên");
assert.ok(!JSON.stringify(document).includes("SHOULD_NOT_APPEAR"));

console.log("[A17P0 Print Contracts] PASS");

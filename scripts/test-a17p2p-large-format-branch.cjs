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

function person(id, x, y, generationNumber = null) {
  return {
    id: `person:${id}`,
    kind: "person",
    personId: id,
    fullName: `Tên nhánh ${id}`,
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

function edge(id, kind, source, target) {
  return { id, kind, source, target, sourceHandle: null, targetHandle: null, label: null, sourceEntityId: id };
}

const { createTreePrintDocument } = loadTsModule(path.join(root, "lib/family/print/tree-print-layout-snapshot.ts"));
const branchModulePath = path.join(root, "lib/family/print/tree-print-branch-scope.ts");
const branchSource = fs.readFileSync(branchModulePath, "utf8");
const branchModule = loadTsModule(branchModulePath);
const { scopeTreePrintDocument, searchTreePrintPeople, getTreePrintBranchScopeLabel } = branchModule;

assert.equal(branchSource.includes("tree-print-tiling"), false);
assert.equal(branchSource.includes("continuationMarker"), false);
assert.equal(branchSource.includes("pageMap"), false);
assert.equal(branchSource.includes("insert("), false);
assert.equal(branchSource.includes("update("), false);
assert.equal(branchSource.includes("delete("), false);

const nodes = [
  person("grand-a", 0, 0, 1),
  person("grand-b", 260, 0, 1),
  family("f-grand", 230, 130),
  person("parent", 120, 280, 2),
  person("parent-spouse", 380, 280, 2),
  family("f-parent", 250, 420),
  person("child-a", 120, 580, 3),
  person("child-b", 380, 580, 3),
  person("unrelated-a", 1200, 0, 1),
  person("unrelated-b", 1460, 0, 1),
  family("f-unrelated", 1330, 130),
  person("unrelated-child", 1320, 280, 2),
];
const edges = [
  edge("e-grand-couple", "couple", "person:grand-a", "person:grand-b"),
  edge("e-grand-parent-a", "family_unit", "person:grand-a", "family:f-grand"),
  edge("e-grand-parent-b", "family_unit", "person:grand-b", "family:f-grand"),
  edge("e-parent-child", "parent_child", "family:f-grand", "person:parent"),
  edge("e-parent-couple", "couple", "person:parent", "person:parent-spouse"),
  edge("e-parent-unit", "family_unit", "person:parent", "family:f-parent"),
  edge("e-spouse-unit", "family_unit", "person:parent-spouse", "family:f-parent"),
  edge("e-child-a", "parent_child", "family:f-parent", "person:child-a"),
  edge("e-child-b", "parent_child", "family:f-parent", "person:child-b"),
  edge("e-unrelated-couple", "couple", "person:unrelated-a", "person:unrelated-b"),
  edge("e-unrelated-unit", "family_unit", "person:unrelated-a", "family:f-unrelated"),
  edge("e-unrelated-child", "parent_child", "family:f-unrelated", "person:unrelated-child"),
  edge("e-cycle", "parent_child", "family:f-parent", "person:parent"),
];
const graph = {
  nodes,
  edges,
  meta: { mode: "admin", personCount: nodes.filter((node) => node.kind === "person").length, familyCount: 3, coupleCount: 3 },
};
const document = createTreePrintDocument(graph, { density: "standard" });

assert.equal(getTreePrintBranchScopeLabel("DESCENDANTS"), "Hậu duệ");
assert.ok(searchTreePrintPeople(document, "nhanh parent").some((personNode) => personNode.id === "person:parent"));

const descendants = scopeTreePrintDocument(document, "DESCENDANTS", "person:parent");
assert.equal(descendants.diagnostics.ROOT_PERSON_INCLUDED, true);
assert.equal(descendants.diagnostics.DANGLING_EDGE_COUNT, 0);
assert.equal(descendants.diagnostics.DUPLICATE_PERSON_COUNT, 0);
assert.equal(descendants.diagnostics.DESCENDANT_TRAVERSAL_CYCLE_SAFE, true);
assert.ok(descendants.document.people.some((personNode) => personNode.id === "person:child-a"));
assert.ok(descendants.document.people.some((personNode) => personNode.id === "person:parent-spouse"));
assert.equal(descendants.document.people.some((personNode) => personNode.id === "person:grand-a"), false);
assert.equal(descendants.document.people.some((personNode) => personNode.id === "person:unrelated-a"), false);

const ancestors = scopeTreePrintDocument(document, "ANCESTORS", "person:child-a");
assert.equal(ancestors.diagnostics.ROOT_PERSON_INCLUDED, true);
assert.equal(ancestors.diagnostics.DANGLING_EDGE_COUNT, 0);
assert.ok(ancestors.document.people.some((personNode) => personNode.id === "person:grand-a"));
assert.ok(ancestors.document.people.some((personNode) => personNode.id === "person:parent-spouse"));
assert.equal(ancestors.document.people.some((personNode) => personNode.id === "person:child-b"), false);
assert.equal(ancestors.document.people.some((personNode) => personNode.id === "person:unrelated-child"), false);

const connected = scopeTreePrintDocument(document, "CONNECTED_COMPONENT", "person:unrelated-a");
assert.equal(connected.componentCount, 2);
assert.equal(connected.componentIndex, 2);
assert.equal(connected.diagnostics.ALL_INCLUDED_EDGES_HAVE_INCLUDED_ENDPOINTS, true);
assert.ok(connected.document.people.some((personNode) => personNode.id === "person:unrelated-child"));
assert.equal(connected.document.people.some((personNode) => personNode.id === "person:parent"), false);

console.log("[A17P2P Large Format Branch Contracts] PASS");

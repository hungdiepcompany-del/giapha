const assert = require("node:assert/strict");
const path = require("node:path");

const {
  createDocument,
  edge,
  family,
  graph,
  loadTsModule,
  person,
  root,
} = require("./a17p2p5-test-utils.cjs");

const layout = loadTsModule(path.join(root, "lib/family/print/tree-print-layout-orientation.ts"));

function sourceGraph(reverse = false) {
  const nodes = [
    person("a", 0, 0),
    family("fa", 120, 180),
    person("b", 120, 420),
    person("c", 380, 420),
    person("d", 640, 420),
    family("fb", 360, 620),
    person("e", 360, 860),
  ];
  const edges = [
    edge("a-fa", "family_unit", "person:a", "family:fa"),
    edge("fa-b", "parent_child", "family:fa", "person:b"),
    edge("b-fb", "family_unit", "person:b", "family:fb"),
    edge("c-fb", "family_unit", "person:c", "family:fb"),
    edge("d-couple", "couple", "person:c", "person:d"),
    edge("fb-e", "parent_child", "family:fb", "person:e"),
  ];
  return graph(reverse ? nodes.slice().reverse() : nodes, reverse ? edges.slice().reverse() : edges);
}

function generationMap(candidate) {
  return Object.fromEntries(
    candidate.document.people
      .map((node) => [node.id, node.layoutGenerationIndex])
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

function axisMap(candidate) {
  return Object.fromEntries(
    candidate.document.people
      .map((node) => [node.id, node.layoutGenerationAxisAnchor])
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

const normal = layout.createTreePrintLayoutCandidates(createDocument(sourceGraph(false)));
const reversed = layout.createTreePrintLayoutCandidates(createDocument(sourceGraph(true)));

assert.deepEqual(generationMap(normal.landscape), generationMap(reversed.landscape));
assert.deepEqual(generationMap(normal.portrait), generationMap(reversed.portrait));
assert.deepEqual(axisMap(normal.landscape), axisMap(reversed.landscape));
assert.deepEqual(axisMap(normal.portrait), axisMap(reversed.portrait));
assert.equal(normal.landscape.diagnostics.COUPLE_GENERATION_MISMATCH_COUNT, 0);
assert.equal(reversed.landscape.diagnostics.COUPLE_GENERATION_MISMATCH_COUNT, 0);
assert.equal(normal.portrait.diagnostics.COUPLE_GENERATION_MISMATCH_COUNT, 0);
assert.equal(reversed.portrait.diagnostics.COUPLE_GENERATION_MISMATCH_COUNT, 0);

console.log("[A17P2P6 Order Independence] PASS");

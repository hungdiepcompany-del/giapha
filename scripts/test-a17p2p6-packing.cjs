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

function sourceGraph() {
  const nodes = [
    person("a-parent", 0, 0),
    person("a-spouse", 260, 0),
    family("a-family", 120, 180),
    person("a-child", 120, 420),
    person("b-parent", 9200, 6500),
    person("b-spouse", 9460, 6500),
    family("b-family", 9320, 6680),
    person("b-child", 9320, 6920),
  ];
  const edges = [
    edge("a-parent-family", "family_unit", "person:a-parent", "family:a-family"),
    edge("a-spouse-family", "family_unit", "person:a-spouse", "family:a-family"),
    edge("a-child", "parent_child", "family:a-family", "person:a-child"),
    edge("b-parent-family", "family_unit", "person:b-parent", "family:b-family"),
    edge("b-spouse-family", "family_unit", "person:b-spouse", "family:b-family"),
    edge("b-child", "parent_child", "family:b-family", "person:b-child"),
  ];
  return graph(nodes, edges);
}

const document = createDocument(sourceGraph());
assert.equal(document.diagnostics.CONNECTED_COMPONENT_COUNT, 2);

const candidates = layout.createTreePrintLayoutCandidates(document);

for (const candidate of [candidates.landscape, candidates.portrait]) {
  assert.equal(candidate.components.length, 2);
  assert.equal(candidate.componentPacking.PACKED_COMPONENT_COUNT, 2);
  assert.equal(candidate.componentPacking.COMPONENT_OVERLAP_COUNT, 0);
  assert.equal(candidate.componentPacking.NON_UNIFORM_COMPONENT_TRANSLATION_COUNT, 0);
  assert.equal(candidate.diagnostics.COUPLE_CROSS_COMPONENT_INVALID_COUNT, 0);
  assert.equal(candidate.diagnostics.COUPLE_POST_PACKING_AXIS_MISMATCH_COUNT, 0);
  assert.equal(candidate.diagnostics.NON_UNIFORM_COMPONENT_TRANSLATION_COUNT, 0);
}

console.log("[A17P2P6 Packing] PASS");

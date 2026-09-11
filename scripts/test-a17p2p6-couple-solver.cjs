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
    person("grand-parent", 0, 0),
    family("grand-family", 120, 180),
    person("child-parent", 120, 420),
    person("child-parent-spouse", 380, 420),
    family("child-family", 240, 620),
    person("grand-child", 240, 860),
  ];
  const edges = [
    edge("grand-parent-family", "family_unit", "person:grand-parent", "family:grand-family"),
    edge("child-from-grand", "parent_child", "family:grand-family", "person:child-parent"),
    edge("child-parent-family", "family_unit", "person:child-parent", "family:child-family"),
    edge("spouse-shared-family", "family_unit", "person:child-parent-spouse", "family:child-family"),
    edge("grand-child-edge", "parent_child", "family:child-family", "person:grand-child"),
  ];
  return graph(nodes, edges);
}

function byId(document, id) {
  const node = document.people.find((personNode) => personNode.id === id);
  assert.ok(node, `missing ${id}`);
  return node;
}

const document = createDocument(sourceGraph());
const candidates = layout.createTreePrintLayoutCandidates(document);

const landscapeParent = byId(candidates.landscape.document, "person:child-parent");
const landscapeSpouse = byId(candidates.landscape.document, "person:child-parent-spouse");
const landscapeGrandParent = byId(candidates.landscape.document, "person:grand-parent");
const landscapeGrandChild = byId(candidates.landscape.document, "person:grand-child");

assert.equal(landscapeParent.layoutGenerationIndex, 1);
assert.equal(landscapeSpouse.layoutGenerationIndex, 1);
assert.equal(landscapeParent.y, landscapeSpouse.y);
assert.ok(landscapeGrandParent.y < landscapeParent.y);
assert.ok(landscapeGrandChild.y > landscapeParent.y);
assert.equal(candidates.landscape.diagnostics.SEMANTIC_COUPLE_RELATION_COUNT, 1);
assert.equal(candidates.landscape.diagnostics.COUPLE_GENERATION_MISMATCH_COUNT, 0);
assert.equal(candidates.landscape.diagnostics.COUPLE_LAYOUT_AXIS_MISMATCH_COUNT, 0);
assert.equal(candidates.landscape.diagnostics.COUPLE_POST_PACKING_AXIS_MISMATCH_COUNT, 0);

const portraitParent = byId(candidates.portrait.document, "person:child-parent");
const portraitSpouse = byId(candidates.portrait.document, "person:child-parent-spouse");
const portraitGrandParent = byId(candidates.portrait.document, "person:grand-parent");
const portraitGrandChild = byId(candidates.portrait.document, "person:grand-child");

assert.equal(portraitParent.layoutGenerationIndex, 1);
assert.equal(portraitSpouse.layoutGenerationIndex, 1);
assert.equal(portraitParent.x, portraitSpouse.x);
assert.ok(portraitGrandParent.x < portraitParent.x);
assert.ok(portraitGrandChild.x > portraitParent.x);
assert.equal(candidates.portrait.diagnostics.SEMANTIC_COUPLE_RELATION_COUNT, 1);
assert.equal(candidates.portrait.diagnostics.COUPLE_GENERATION_MISMATCH_COUNT, 0);
assert.equal(candidates.portrait.diagnostics.COUPLE_LAYOUT_AXIS_MISMATCH_COUNT, 0);
assert.equal(candidates.portrait.diagnostics.COUPLE_POST_PACKING_AXIS_MISMATCH_COUNT, 0);

console.log("[A17P2P6 Couple Solver] PASS");

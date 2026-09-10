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
const invariants = loadTsModule(path.join(root, "lib/family/print/tree-print-couple-invariants.ts"));

function sourceGraph() {
  const nodes = [
    person("explicit-a", 0, 0),
    person("explicit-b", 260, 0),
    person("parent", 0, 420),
    person("shared-spouse", 260, 420),
    family("shared-family", 120, 620),
    person("child", 120, 860),
  ];
  const edges = [
    edge("explicit-couple", "couple", "person:explicit-a", "person:explicit-b"),
    edge("parent-family", "family_unit", "person:parent", "family:shared-family"),
    edge("shared-spouse-family", "family_unit", "person:shared-spouse", "family:shared-family"),
    edge("child-edge", "parent_child", "family:shared-family", "person:child"),
  ];
  return graph(nodes, edges);
}

const sourceDocument = createDocument(sourceGraph());
const semanticCouples = invariants.collectTreePrintSemanticCoupleRelations(sourceDocument);
assert.equal(semanticCouples.length, 2);
assert.equal(semanticCouples.some((relation) => relation.source === "EXPLICIT_COUPLE_EDGE"), true);
assert.equal(semanticCouples.some((relation) => relation.source === "SHARED_FAMILY_PARENTS"), true);

const candidates = layout.createTreePrintLayoutCandidates(sourceDocument);
const landscape = invariants.validateCoupleLayoutAxisInvariant({
  people: candidates.landscape.document.people,
  coupleRelations: semanticCouples,
  layoutFlow: "top-to-bottom",
  stage: "test-landscape",
});
const portrait = invariants.validateCoupleLayoutAxisInvariant({
  people: candidates.portrait.document.people,
  coupleRelations: semanticCouples,
  layoutFlow: "left-to-right",
  stage: "test-portrait",
});

assert.equal(landscape.valid, true);
assert.equal(portrait.valid, true);
assert.equal(candidates.landscape.diagnostics.COUPLE_LAYOUT_AXIS_MISMATCH_COUNT, 0);
assert.equal(candidates.portrait.diagnostics.COUPLE_LAYOUT_AXIS_MISMATCH_COUNT, 0);

console.log("[A17P2P6 Layout Axis] PASS");

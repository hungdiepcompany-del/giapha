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
    person("grand-a", 0, 0),
    person("grand-b", 260, 0),
    family("grand-family", 120, 170),
    person("parent", 0, 390),
    person("parent-spouse", 260, 390),
    family("parent-family", 120, 560),
    person("child-a", 0, 780),
    person("child-b", 260, 780),
  ];
  const edges = [
    edge("grand-couple", "couple", "person:grand-a", "person:grand-b"),
    edge("grand-a-family", "family_unit", "person:grand-a", "family:grand-family"),
    edge("grand-b-family", "family_unit", "person:grand-b", "family:grand-family"),
    edge("parent-from-grand", "parent_child", "family:grand-family", "person:parent"),
    edge("parent-couple", "couple", "person:parent", "person:parent-spouse"),
    edge("parent-family-a", "family_unit", "person:parent", "family:parent-family"),
    edge("parent-family-b", "family_unit", "person:parent-spouse", "family:parent-family"),
    edge("child-a", "parent_child", "family:parent-family", "person:child-a"),
    edge("child-b", "parent_child", "family:parent-family", "person:child-b"),
  ];
  return graph(nodes, edges);
}

function byId(collection, id) {
  const value = collection.find((item) => item.id === id);
  assert.ok(value, `missing ${id}`);
  return value;
}

function assertCandidateIntegrity(candidate, source) {
  assert.equal(candidate.document.people.length, source.people.length);
  assert.equal(candidate.document.families.length, source.families.length);
  assert.equal(candidate.document.edges.length, source.edges.length);
  assert.equal(candidate.diagnostics.MISSING_PERSON_COUNT, 0);
  assert.equal(candidate.diagnostics.DUPLICATE_PERSON_COUNT, 0);
  assert.equal(candidate.diagnostics.MISSING_FAMILY_COUNT, 0);
  assert.equal(candidate.diagnostics.DUPLICATE_FAMILY_COUNT, 0);
  assert.equal(candidate.diagnostics.MISSING_EDGE_COUNT, 0);
  assert.equal(candidate.diagnostics.DUPLICATE_EDGE_COUNT, 0);
  assert.equal(candidate.diagnostics.DANGLING_EDGE_COUNT, 0);
  assert.equal(candidate.diagnostics.ZERO_LENGTH_EDGE_COUNT, 0);
  assert.equal(candidate.diagnostics.INVALID_EDGE_PATH_COUNT, 0);
  assert.equal(candidate.diagnostics.NODE_OVERLAP_COUNT, 0);
  assert.equal(candidate.diagnostics.TEXT_UPRIGHT, true);
  assert.equal(candidate.diagnostics.TREE_ROTATION_DEGREES, 0);
  assert.equal(candidate.diagnostics.PERSON_CARD_TEXT_ROTATION_DEGREES, 0);
  assert.ok(candidate.diagnostics.TOTAL_EDGE_LENGTH > 0);
  assert.ok(candidate.diagnostics.EDGE_CARD_INTERSECTION_COUNT >= 0);
}

function assertEdgePaths(candidate) {
  for (const renderedEdge of candidate.document.edges) {
    assert.ok(renderedEdge.points.length >= 2, `${renderedEdge.id} has at least two points`);
    for (const point of renderedEdge.points) {
      assert.equal(Number.isFinite(point.x), true, `${renderedEdge.id} x finite`);
      assert.equal(Number.isFinite(point.y), true, `${renderedEdge.id} y finite`);
    }
  }
}

const sourceDocument = createDocument(sourceGraph());
const candidates = layout.createTreePrintLayoutCandidates(sourceDocument);

assert.equal(candidates.landscape.id, "print-layout-landscape-top-to-bottom");
assert.equal(candidates.landscape.orientation, "landscape");
assert.equal(candidates.landscape.layoutFlow, "top-to-bottom");
assertCandidateIntegrity(candidates.landscape, sourceDocument);
assertEdgePaths(candidates.landscape);

const landscapeGrandA = byId(candidates.landscape.document.people, "person:grand-a");
const landscapeGrandB = byId(candidates.landscape.document.people, "person:grand-b");
const landscapeParent = byId(candidates.landscape.document.people, "person:parent");
const landscapeChild = byId(candidates.landscape.document.people, "person:child-a");
const landscapeFamily = byId(candidates.landscape.document.families, "family:grand-family");
assert.equal(landscapeGrandA.y, landscapeGrandB.y);
assert.ok(landscapeParent.y > landscapeGrandA.y);
assert.ok(landscapeChild.y > landscapeParent.y);
assert.ok(landscapeFamily.y > landscapeGrandA.y + landscapeGrandA.height);
assert.ok(landscapeFamily.y < landscapeParent.y);

assert.equal(candidates.portrait.id, "print-layout-portrait-left-to-right");
assert.equal(candidates.portrait.orientation, "portrait");
assert.equal(candidates.portrait.layoutFlow, "left-to-right");
assertCandidateIntegrity(candidates.portrait, sourceDocument);
assertEdgePaths(candidates.portrait);

const portraitGrandA = byId(candidates.portrait.document.people, "person:grand-a");
const portraitGrandB = byId(candidates.portrait.document.people, "person:grand-b");
const portraitParent = byId(candidates.portrait.document.people, "person:parent");
const portraitChild = byId(candidates.portrait.document.people, "person:child-a");
const portraitFamily = byId(candidates.portrait.document.families, "family:grand-family");
assert.equal(portraitGrandA.x, portraitGrandB.x);
assert.ok(portraitParent.x > portraitGrandA.x);
assert.ok(portraitChild.x > portraitParent.x);
assert.ok(portraitFamily.x > portraitGrandA.x + portraitGrandA.width);
assert.ok(portraitFamily.x < portraitParent.x);

assert.equal(layout.getTreePrintLayoutFlowForOrientation("landscape"), "top-to-bottom");
assert.equal(layout.getTreePrintLayoutFlowForOrientation("portrait"), "left-to-right");

console.log("[A17P2P5 Print Layout Flows] PASS");

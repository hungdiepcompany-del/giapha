const assert = require("node:assert/strict");
const path = require("node:path");

const {
  baseLargeFormatInput,
  createDocument,
  edge,
  family,
  graph,
  loadTsModule,
  person,
  root,
} = require("./a17p2p5-test-utils.cjs");

const largeFormat = loadTsModule(path.join(root, "lib/family/print/tree-print-large-format.ts"));
const orientation = loadTsModule(path.join(root, "lib/family/print/tree-print-orientation.ts"));

function sourceGraph() {
  const nodes = [
    person("father", 0, 0),
    person("mother", 260, 0),
    family("parents", 120, 190),
    person("child-a", 0, 430),
    person("child-b", 260, 430),
    person("same-generation-unrelated", 900, 0),
  ];
  const edges = [
    edge("couple-parents", "couple", "person:father", "person:mother"),
    edge("father-family", "family_unit", "person:father", "family:parents"),
    edge("mother-family", "family_unit", "person:mother", "family:parents"),
    edge("child-a-edge", "parent_child", "family:parents", "person:child-a"),
    edge("child-b-edge", "parent_child", "family:parents", "person:child-b"),
  ];
  return graph(nodes, edges);
}

function byId(document, id) {
  const node = document.people.find((personNode) => personNode.id === id);
  assert.ok(node, `missing ${id}`);
  return node;
}

function blockers(plan, code) {
  return plan.blockers.some((issue) => issue.code === code);
}

const document = createDocument(sourceGraph());

const landscape = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  orientation: "landscape",
}));
assert.equal(landscape.algorithmVersion, "A17P2P5_TRUE_ORIENTATION_V1");
assert.equal(landscape.requestedOrientation, "landscape");
assert.equal(landscape.resolvedOrientation, "landscape");
assert.equal(landscape.orientation, "landscape");
assert.equal(landscape.layoutFlow, "top-to-bottom");
assert.equal(landscape.finishedWidthMm > landscape.finishedHeightMm, true);
assert.equal(landscape.orientationResolution.orientationMatchesArtboard, true);
assert.equal(blockers(landscape, "ORIENTATION_DIMENSION_MISMATCH"), false);
assert.equal(orientation.artboardOrientationMatchesDimensions("landscape", landscape.finishedWidthMm, landscape.finishedHeightMm), true);

const landscapeFather = byId(landscape.document, "person:father");
const landscapeMother = byId(landscape.document, "person:mother");
const landscapeChild = byId(landscape.document, "person:child-a");
const landscapeUnrelated = byId(landscape.document, "person:same-generation-unrelated");
assert.equal(landscapeFather.y, landscapeMother.y, "spouses stay on the same generation row");
assert.ok(landscapeChild.y > landscapeFather.y, "child is one generation below parent in landscape flow");
assert.equal(
  landscapeUnrelated.x > Math.min(landscapeFather.x, landscapeMother.x) &&
    landscapeUnrelated.x < Math.max(landscapeFather.x, landscapeMother.x),
  false,
  "unrelated person is not inserted between spouses",
);

const portrait = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  orientation: "portrait",
}));
assert.equal(portrait.requestedOrientation, "portrait");
assert.equal(portrait.resolvedOrientation, "portrait");
assert.equal(portrait.orientation, "portrait");
assert.equal(portrait.layoutFlow, "left-to-right");
assert.equal(portrait.finishedHeightMm > portrait.finishedWidthMm, true);
assert.equal(portrait.orientationResolution.orientationMatchesArtboard, true);
assert.equal(blockers(portrait, "ORIENTATION_DIMENSION_MISMATCH"), false);
assert.equal(orientation.artboardOrientationMatchesDimensions("portrait", portrait.finishedWidthMm, portrait.finishedHeightMm), true);

const portraitFather = byId(portrait.document, "person:father");
const portraitMother = byId(portrait.document, "person:mother");
const portraitChild = byId(portrait.document, "person:child-a");
assert.equal(portraitFather.x, portraitMother.x, "spouses stay on the same generation column");
assert.ok(portraitChild.x > portraitFather.x, "child is one generation to the right in portrait flow");
assert.notEqual(portraitFather.y, portraitMother.y, "spouses use adjacent lanes instead of overlap");

const autoPlan = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  orientation: "auto",
}));
assert.equal(autoPlan.requestedOrientation, "auto");
assert.ok(["landscape", "portrait"].includes(autoPlan.resolvedOrientation));
assert.equal(autoPlan.orientationResolution.resolvedOrientation, autoPlan.resolvedOrientation);
assert.equal(autoPlan.orientationResolution.layoutFlow, autoPlan.layoutFlow);
assert.equal(autoPlan.orientationResolution.orientationMatchesArtboard, true);
assert.ok(["AUTO_WIDE_CONTENT_LANDSCAPE", "AUTO_TALL_CONTENT_PORTRAIT"].includes(autoPlan.orientationResolution.reasonCode));

assert.deepEqual(orientation.TREE_PRINT_ARTBOARD_ORIENTATION_OPTIONS, ["auto", "landscape", "portrait"]);
assert.equal(orientation.layoutFlowForResolvedOrientation("landscape"), "top-to-bottom");
assert.equal(orientation.layoutFlowForResolvedOrientation("portrait"), "left-to-right");
assert.equal(orientation.resolvedOrientationForLayoutFlow("top-to-bottom"), "landscape");
assert.equal(orientation.resolvedOrientationForLayoutFlow("left-to-right"), "portrait");

console.log("[A17P2P5 Orientation Contracts] PASS");

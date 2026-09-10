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

const edgeStyle = loadTsModule(path.join(root, "lib/family/print/tree-print-edge-style.ts"));
const largeFormat = loadTsModule(path.join(root, "lib/family/print/tree-print-large-format.ts"));
const pageStyle = loadTsModule(path.join(root, "lib/family/print/tree-print-page-style.ts"));

function sourceGraph() {
  const nodes = [
    person("p1", 0, 0),
    person("p2", 260, 0),
    family("f1", 120, 180),
    person("c1", 120, 420),
  ];
  const edges = [
    edge("p1-p2", "couple", "person:p1", "person:p2"),
    edge("p1-family", "family_unit", "person:p1", "family:f1"),
    edge("p2-family", "family_unit", "person:p2", "family:f1"),
    edge("child", "parent_child", "family:f1", "person:c1"),
  ];
  return graph(nodes, edges);
}

const document = createDocument(sourceGraph());
const landscape = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  orientation: "landscape",
  lengthMode: "CUSTOM_LENGTH",
  customLengthMm: 11940,
  mediaWidthPreset: 1500,
  safeMarginPreset: 50,
  bleedPreset: 0,
}));
const portrait = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  orientation: "portrait",
  lengthMode: "CUSTOM_LENGTH",
  customLengthMm: 7500,
  mediaWidthPreset: 1500,
  safeMarginPreset: 50,
  bleedPreset: 0,
}));

assert.equal(landscape.exportWidthMm, 11940);
assert.equal(landscape.exportHeightMm, 1500);
assert.equal(portrait.exportWidthMm, 1500);
assert.equal(portrait.exportHeightMm, 7500);
assert.equal(landscape.pageCount, 1);
assert.equal(portrait.pageCount, 1);
assert.equal(landscape.vectorTree, true);
assert.equal(portrait.vectorTree, true);
assert.equal(landscape.document.edges.length, portrait.document.edges.length);
assert.equal(landscape.blockers.some((issue) => issue.code.startsWith("A17P2P6R1_")), false);
assert.equal(portrait.blockers.some((issue) => issue.code.startsWith("A17P2P6R1_")), false);

const parity = edgeStyle.validateTreePrintOrientationEdgeStyleParity({
  landscapeEdges: landscape.document.edges,
  portraitEdges: portrait.document.edges,
});
assert.equal(parity.valid, true);
assert.equal(parity.violations.length, 0);

const landscapeStyle = pageStyle.buildTreePrintPageStyle({
  widthMm: landscape.exportWidthMm,
  heightMm: landscape.exportHeightMm,
  marginMm: 0,
});
const portraitStyle = pageStyle.buildTreePrintPageStyle({
  widthMm: portrait.exportWidthMm,
  heightMm: portrait.exportHeightMm,
  marginMm: 0,
});
assert.ok(landscapeStyle.includes("@page { size: 11940mm 1500mm; margin: 0; }"));
assert.ok(portraitStyle.includes("@page { size: 1500mm 7500mm; margin: 0; }"));

console.log("[A17P2P6R1 Export Regression] PASS");

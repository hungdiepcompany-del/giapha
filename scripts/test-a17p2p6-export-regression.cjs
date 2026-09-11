const assert = require("node:assert/strict");
const fs = require("node:fs");
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
const pageStyle = loadTsModule(path.join(root, "lib/family/print/tree-print-page-style.ts"));
const previewScale = loadTsModule(path.join(root, "lib/family/print/tree-print-preview-scale.ts"));

function sourceGraph() {
  const nodes = [
    person("p1", 0, 0),
    person("p2", 260, 0),
    family("f1", 120, 180),
    person("c1", 120, 420),
  ];
  const edges = [
    edge("p1-family", "family_unit", "person:p1", "family:f1"),
    edge("p2-family", "family_unit", "person:p2", "family:f1"),
    edge("child", "parent_child", "family:f1", "person:c1"),
  ];
  return graph(nodes, edges);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const document = createDocument(sourceGraph());
const plan = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  orientation: "landscape",
  lengthMode: "CUSTOM_LENGTH",
  customLengthMm: 11940,
  mediaWidthPreset: 1500,
  safeMarginPreset: 50,
  bleedPreset: 0,
}));
const fitScale = previewScale.calculateTreePrintPreviewScale({
  availableViewportWidth: 1200,
  availableViewportHeight: 700,
  artboardLogicalWidth: plan.viewBox.width,
  artboardLogicalHeight: plan.viewBox.height,
});
const style = pageStyle.buildTreePrintPageStyle({
  widthMm: plan.exportWidthMm,
  heightMm: plan.exportHeightMm,
  marginMm: 0,
});

assert.equal(plan.exportWidthMm, 11940);
assert.equal(plan.exportHeightMm, 1500);
assert.equal(plan.finishedWidthMm, 11940);
assert.equal(plan.finishedHeightMm, 1500);
assert.equal(plan.pageCount, 1);
assert.equal(plan.vectorTree, true);
assert.equal(plan.textOutlined, "NO_UNLESS_VERIFIED");
assert.equal(fitScale < 1, true);
assert.equal(plan.exportWidthMm, 11940);
assert.equal(plan.exportHeightMm, 1500);
assert.ok(style.includes("@page { size: 11940mm 1500mm; margin: 0; }"));
assert.ok(style.includes("width: 11940mm; height: 1500mm;"));

const workspace = read("components/tree-print/tree-print-workspace.tsx");
const globals = read("app/globals.css");
assert.ok(workspace.includes("data-tree-print-preview-viewport"));
assert.ok(workspace.includes("screenSvgWidth"));
assert.ok(workspace.includes("screenSvgHeight"));
assert.ok(workspace.includes('width={`${exportWidthMm}mm`}'));
assert.ok(workspace.includes('height={`${exportHeightMm}mm`}'));
assert.ok(globals.includes(".tree-print-preview-viewport"));
assert.ok(globals.includes("min-width: 0"));
assert.ok(globals.includes("max-width: 100%"));

console.log("[A17P2P6 Export Regression] PASS");

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

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function sourceGraph() {
  const nodes = [
    person("p1", 0, 0),
    person("p2", 260, 0),
    family("f1", 120, 180),
    person("c1", 120, 420),
  ];
  const edges = [
    edge("couple", "couple", "person:p1", "person:p2"),
    edge("family-p1", "family_unit", "person:p1", "family:f1"),
    edge("family-p2", "family_unit", "person:p2", "family:f1"),
    edge("child", "parent_child", "family:f1", "person:c1"),
  ];
  return graph(nodes, edges);
}

const document = createDocument(sourceGraph());
const landscape = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  orientation: "landscape",
  bleedPreset: 20,
}));
const portrait = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, {
  orientation: "portrait",
  bleedPreset: 20,
}));

assert.equal(landscape.exportWidthMm > landscape.exportHeightMm, true);
assert.equal(portrait.exportHeightMm > portrait.exportWidthMm, true);
assert.equal(landscape.exportWidthMm, landscape.finishedWidthMm + 40);
assert.equal(landscape.exportHeightMm, landscape.finishedHeightMm + 40);
assert.equal(portrait.exportWidthMm, portrait.finishedWidthMm + 40);
assert.equal(portrait.exportHeightMm, portrait.finishedHeightMm + 40);

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
assert.ok(landscapeStyle.includes(`@page { size: ${landscape.exportWidthMm}mm ${landscape.exportHeightMm}mm; margin: 0; }`));
assert.ok(portraitStyle.includes(`@page { size: ${portrait.exportWidthMm}mm ${portrait.exportHeightMm}mm; margin: 0; }`));
assert.ok(landscapeStyle.includes(`width: ${landscape.exportWidthMm}mm; height: ${landscape.exportHeightMm}mm;`));
assert.ok(portraitStyle.includes(`width: ${portrait.exportWidthMm}mm; height: ${portrait.exportHeightMm}mm;`));

const workspace = read("components/tree-print/tree-print-workspace.tsx");
const svg = read("components/tree-print/tree-print-svg.tsx");
const exportRuntime = read("lib/family/print/tree-print-svg-export.ts");
const printRuntime = [
  workspace,
  svg,
  exportRuntime,
  read("lib/family/print/tree-print-page-style.ts"),
  read("lib/family/print/tree-print-large-format.ts"),
].join("\n");

assert.ok(workspace.includes("previewDocument"));
assert.ok(workspace.includes("buildTreePrintPageStyle({ widthMm: exportWidthMm, heightMm: exportHeightMm"));
assert.ok(workspace.includes('width={`${exportWidthMm}mm`}'));
assert.ok(workspace.includes('height={`${exportHeightMm}mm`}'));
assert.ok(workspace.includes('largeFormatPlan.resolvedOrientation === "landscape" ? "ngang" : "doc"'));
assert.ok(svg.includes('preserveAspectRatio="xMidYMid meet"'));
assert.ok(svg.includes('data-tree-print-vector-root="true"'));
assert.ok(exportRuntime.includes("sanitizeSerializedTreePrintSvg"));

for (const token of [
  "rotate(90",
  "rotate(270",
  "TREE_PRINT_PAGE_MAP",
  "TreePrintPageMap",
  "continuationMarker",
  "html2canvas",
  "jspdf",
  "pdf-lib",
  "puppeteer",
  "playwright",
]) {
  assert.equal(printRuntime.toLowerCase().includes(token.toLowerCase()), false, `forbidden export token remained: ${token}`);
}

console.log("[A17P2P5 SVG/PDF Orientation] PASS");

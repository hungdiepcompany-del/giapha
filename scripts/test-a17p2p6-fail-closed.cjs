const assert = require("node:assert/strict");
const path = require("node:path");

const {
  baseLargeFormatInput,
  createDocument,
  edge,
  graph,
  loadTsModule,
  person,
  root,
} = require("./a17p2p5-test-utils.cjs");

const largeFormat = loadTsModule(path.join(root, "lib/family/print/tree-print-large-format.ts"));
const eligibility = loadTsModule(path.join(root, "lib/family/print/tree-print-eligibility.ts"));

function invalidCrossComponentDocument() {
  const source = createDocument(graph(
    [
      person("a", 0, 0),
      person("b", 260, 0),
    ],
    [
      edge("couple-cross-component", "couple", "person:a", "person:b"),
    ],
  ));

  return {
    ...source,
    people: source.people.map((node) =>
      node.id === "person:b" ? { ...node, componentId: "C2" } : node,
    ),
  };
}

function blockerCodes(plan) {
  return new Set(plan.blockers.map((issue) => issue.code));
}

const plan = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(invalidCrossComponentDocument(), {
  orientation: "landscape",
}));
const exportEligibility = eligibility.evaluateTreePrintExportEligibility({
  mode: "LARGE_FORMAT_FULL_TREE",
  largeFormatPlan: plan,
  pdfCapability: "likely_supported",
});

assert.equal(blockerCodes(plan).has("A17P2P6_COUPLE_CROSS_COMPONENT_INVALID"), true);
assert.equal(plan.layoutCandidateDiagnostics.COUPLE_CROSS_COMPONENT_INVALID_COUNT > 0, true);
assert.equal(exportEligibility.canExportSvg, false);
assert.equal(exportEligibility.canPrintPdf, false);
assert.equal(exportEligibility.svgBlockers.some((issue) => issue.code === "A17P2P6_COUPLE_CROSS_COMPONENT_INVALID"), true);
assert.equal(exportEligibility.pdfBlockers.some((issue) => issue.code === "A17P2P6_COUPLE_CROSS_COMPONENT_INVALID"), true);

console.log("[A17P2P6 Fail Closed] PASS");

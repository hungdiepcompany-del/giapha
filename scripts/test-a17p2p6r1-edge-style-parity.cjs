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

function sourceGraph() {
  const nodes = [
    person("father", 0, 0),
    person("mother", 260, 0),
    family("parents", 120, 190),
    person("child", 120, 420),
  ];
  const edges = [
    edge("parents-couple", "couple", "person:father", "person:mother"),
    edge("father-family", "family_unit", "person:father", "family:parents"),
    edge("mother-family", "family_unit", "person:mother", "family:parents"),
    edge("child-edge", "parent_child", "family:parents", "person:child"),
  ];
  return graph(nodes, edges);
}

const document = createDocument(sourceGraph());
const landscapePlan = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, { orientation: "landscape" }));
const portraitPlan = largeFormat.createTreePrintLargeFormatPlan(baseLargeFormatInput(document, { orientation: "portrait" }));

const parity = edgeStyle.validateTreePrintOrientationEdgeStyleParity({
  landscapeEdges: landscapePlan.document.edges,
  portraitEdges: portraitPlan.document.edges,
});
assert.equal(parity.valid, true);
assert.equal(parity.violations.length, 0);

const visuals = new Map(edgeStyle.buildTreePrintSemanticEdgeVisuals(document.edges).map((item) => [item.edgeId, item]));
assert.equal(visuals.get("parents-couple").visualRole, "couple");
assert.equal(visuals.get("parents-couple").style.stroke, "#7c6f5f");
assert.equal(visuals.get("parents-couple").style.strokeDasharray, "10 8");
assert.equal(visuals.get("father-family").visualRole, "family-junction");
assert.equal(visuals.get("father-family").style.stroke, "#245744");
assert.equal(visuals.get("child-edge").visualRole, "parent-child");
assert.equal(visuals.get("child-edge").style.stroke, "#245744");

const changedPortrait = document.edges.map((item) =>
  item.id === "child-edge" ? { ...item, relationshipKind: "other" } : item,
);
const mismatch = edgeStyle.validateTreePrintOrientationEdgeStyleParity({
  landscapeEdges: document.edges,
  portraitEdges: changedPortrait,
});
assert.equal(mismatch.valid, false);
assert.equal(
  mismatch.violations.some((violation) =>
    violation.diagnosticCode === "A17P2P6R1_EDGE_SEMANTIC_TYPE_CHANGED_BY_ORIENTATION",
  ),
  true,
);

console.log("[A17P2P6R1 Edge Style Parity] PASS");

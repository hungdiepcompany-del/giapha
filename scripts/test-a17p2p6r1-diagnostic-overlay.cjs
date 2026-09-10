const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  edge,
  family,
  graph,
  loadTsModule,
  person,
  root,
} = require("./a17p2p5-test-utils.cjs");

const edgeStyle = loadTsModule(path.join(root, "lib/family/print/tree-print-edge-style.ts"));

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const svgSource = read("components/tree-print/tree-print-svg.tsx");

assert.ok(svgSource.includes("getTreePrintSemanticEdgeVisual(edge)"));
assert.ok(svgSource.includes("getTreePrintDiagnosticEdgeVisual(edge, issue)"));
assert.ok(svgSource.includes('data-tree-print-diagnostic-layer="true"'));
assert.ok(svgSource.includes('data-tree-print-diagnostic-only="true"'));
assert.ok(svgSource.includes('data-tree-print-export-exclude="true"'));
assert.ok(!svgSource.includes('stroke={isProblem ? "#dc2626"'));
assert.ok(!svgSource.includes("intersects.has(edge.id)"));

const sampleEdge = {
  id: "child-edge",
  sourceId: "family:f1",
  targetId: "person:c1",
  relationshipKind: "family_to_child",
  points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
};
const semantic = edgeStyle.getTreePrintSemanticEdgeVisual(sampleEdge);
const warningOverlay = edgeStyle.getTreePrintDiagnosticEdgeVisual(sampleEdge, { severity: "WARNING" });
const errorOverlay = edgeStyle.getTreePrintDiagnosticEdgeVisual(sampleEdge, { severity: "ERROR" });

assert.equal(semantic.visualRole, "parent-child");
assert.equal(semantic.diagnosticOnly, false);
assert.equal(semantic.exportEligible, true);
assert.equal(semantic.style.stroke, "#245744");
assert.equal(warningOverlay.visualRole, "diagnostic-warning");
assert.equal(warningOverlay.diagnosticOnly, true);
assert.equal(warningOverlay.exportEligible, false);
assert.equal(errorOverlay.visualRole, "diagnostic-error");
assert.equal(errorOverlay.style.stroke, "#dc2626");

const nodes = [
  person("a", 0, 0),
  person("b", 260, 0),
  family("f1", 120, 190),
];
const edges = [
  edge("couple", "couple", "person:a", "person:b"),
  edge("family", "family_unit", "person:a", "family:f1"),
];
const source = graph(nodes, edges);
assert.equal(source.edges.length, 2);

console.log("[A17P2P6R1 Diagnostic Overlay] PASS");

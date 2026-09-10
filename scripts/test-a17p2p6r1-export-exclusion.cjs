const assert = require("node:assert/strict");
const path = require("node:path");

const {
  loadTsModule,
  root,
} = require("./a17p2p5-test-utils.cjs");

const svgExport = loadTsModule(path.join(root, "lib/family/print/tree-print-svg-export.ts"));
const edgeStyle = loadTsModule(path.join(root, "lib/family/print/tree-print-edge-style.ts"));

const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  '<path data-tree-print-edge-id="semantic" data-tree-print-diagnostic-only="false" d="M 0 0 L 10 10" stroke="#245744" />',
  '<g data-tree-print-diagnostics="true" data-tree-print-diagnostic-layer="true" data-tree-print-export-exclude="true">',
  '<path data-tree-print-diagnostic-only="true" d="M 0 10 L 10 0" stroke="#dc2626" />',
  "</g>",
  '<text data-tree-print-diagnostics="true">debug</text>',
  '<path data-tree-print-diagnostic-only="true" d="M 1 1 L 2 2" stroke="#f59e0b" />',
  "</svg>",
].join("");

const sanitized = svgExport.sanitizeSerializedTreePrintSvg(svg, { includeDiagnostics: false });

assert.ok(sanitized.includes('data-tree-print-diagnostic-only="false"'));
assert.ok(sanitized.includes('stroke="#245744"'));
assert.equal(sanitized.includes("debug"), false);
assert.equal(sanitized.includes('data-tree-print-diagnostics="true"'), false);
assert.equal(sanitized.includes('data-tree-print-diagnostic-only="true"'), false);
assert.equal(sanitized.includes("#dc2626"), false);
assert.equal(sanitized.includes("#f59e0b"), false);
assert.equal(edgeStyle.countTreePrintDiagnosticOnlyElements(sanitized), 0);

console.log("[A17P2P6R1 Export Exclusion] PASS");

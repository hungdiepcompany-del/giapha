const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const svg = read("components/tree-print/tree-print-svg.tsx");
const workspace = read("components/tree-print/tree-print-workspace.tsx");
const serializer = read("lib/family/print/tree-print-svg-export.ts");

assert.ok(svg.includes('data-tree-print-vector-root="true"'));
assert.ok(workspace.includes('data-tree-print-large-format-artboard={largeFormatPlan ? "true" : undefined}'));
assert.ok(workspace.includes('width={`${exportWidthMm}mm`}'));
assert.ok(workspace.includes('height={`${exportHeightMm}mm`}'));
assert.ok(workspace.includes("fileNamePrefix: prefix"));
assert.ok(serializer.includes("fileNamePrefix"));

for (const token of [
  "TreePrintContinuationMarker",
  "TreePrintPageEdgeSegment",
  "continuationMarkers",
  "edgeSegments",
  "clipRect",
  "current-page",
  "tree-print-current-page",
]) {
  assert.equal(`${svg}\n${workspace}`.includes(token), false, `retired SVG/page token remained: ${token}`);
}

console.log("[A17P2P Large Format SVG] PASS");

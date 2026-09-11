const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

for (const deletedFile of [
  "components/tree-print/tree-print-page-map.tsx",
  "components/tree-print/tree-print-workspace (1).tsx",
  "lib/family/print/tree-print-tiling.ts",
  "scripts/check-a17p2-tiled-multipage-branch-print.cjs",
  "scripts/test-a17p2-tiling-contracts.cjs",
  "scripts/test-a17p2-print-page-contracts.cjs",
  "scripts/check-a17p2r-sparse-tile-pruning-marker-pairing-svg-fix.cjs",
  "scripts/test-a17p2r-sparse-print-pages.cjs",
  "scripts/test-a17p2r-marker-pairing.cjs",
  "scripts/test-a17p2r-current-page-svg.cjs",
  "scripts/check-a17p2r1-mode-aware-print-eligibility.cjs",
  "scripts/test-a17p2r1-print-eligibility-contracts.cjs",
  "docs/PLAN_A17P2_TILED_MULTIPAGE_AND_BRANCH_PRINT.md",
]) {
  assert.equal(exists(deletedFile), false, `retired file still exists: ${deletedFile}`);
}

const packageJson = read("package.json");
for (const obsoleteScript of [
  '"check:a17p2"',
  '"test:a17p2:tiling"',
  '"test:a17p2:print-pages"',
  '"check:a17p2r"',
  '"test:a17p2r:markers"',
  '"check:a17p2r1"',
]) {
  assert.equal(packageJson.includes(obsoleteScript), false, `obsolete package script remained: ${obsoleteScript}`);
}

const runtimeFiles = [
  "app/globals.css",
  "components/tree-print/tree-print-workspace.tsx",
  "components/tree-print/tree-print-toolbar.tsx",
  "components/tree-print/tree-print-svg.tsx",
  "components/tree-print/tree-print-diagnostics-panel.tsx",
  "lib/family/print/tree-print-branch-scope.ts",
  "lib/family/print/tree-print-eligibility.ts",
  "lib/family/print/tree-print-large-format.ts",
  "lib/family/print/tree-print-page-style.ts",
  "package.json",
];
const runtime = runtimeFiles.map(read).join("\n");

for (const token of [
  "TILED_FULL_TREE",
  "OFFICE_TILED",
  "tree-print-tiling",
  "pageMap",
  "PAGE_MAP",
  "rawTile",
  "printablePage",
  "continuationMarker",
  "Nối sang Trang",
  "Từ Trang",
  "tree-print-print-page-last",
  "tree-print-print-page-svg",
]) {
  assert.equal(runtime.includes(token), false, `office-tiled runtime token remained: ${token}`);
}

console.log("[A17P2P Retirement Contracts] PASS");

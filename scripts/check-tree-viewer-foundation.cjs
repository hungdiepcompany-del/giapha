const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "lib/family/tree-types.ts",
  "lib/family/tree-graph-builder.ts",
  "lib/family/tree-service.ts",
  "lib/family/tree-layout-elk.ts",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "app/(admin)/admin/tree/page.tsx",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

if (!packageJson.dependencies?.["@xyflow/react"]) {
  missing.push("package.json dependencies.@xyflow/react");
}

if (!packageJson.dependencies?.elkjs) {
  missing.push("package.json dependencies.elkjs");
}

if (!packageJson.scripts?.["check:tree-viewer"]) {
  missing.push("package.json scripts.check:tree-viewer");
}

const treeService = fs.readFileSync(
  path.join(root, "lib/family/tree-service.ts"),
  "utf8",
);

if (!treeService.includes("tree.view")) {
  missing.push("tree-service tree.view permission");
}

const treeViewer = fs.readFileSync(
  path.join(root, "components/tree/family-tree-viewer.tsx"),
  "utf8",
);

if (!treeViewer.includes("@xyflow/react")) {
  missing.push("family-tree-viewer @xyflow/react import");
}

if (missing.length > 0) {
  console.error("Tree viewer foundation check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Tree viewer foundation check passed.");

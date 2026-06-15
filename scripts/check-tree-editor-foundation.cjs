const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "db/migrations/20260614_0005_tree_layout_foundation.sql",
  "lib/family/tree-layout-service.ts",
  "app/(admin)/admin/tree/edit/page.tsx",
  "app/(admin)/admin/tree/edit/actions.ts",
  "components/tree/family-tree-editor.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

if (!packageJson.scripts?.["check:tree-editor"]) {
  missing.push("package.json scripts.check:tree-editor");
}

const migration = fs.readFileSync(
  path.join(root, "db/migrations/20260614_0005_tree_layout_foundation.sql"),
  "utf8",
);

for (const tableName of ["tree_layouts", "tree_layout_nodes"]) {
  if (!migration.includes(`public.${tableName}`)) {
    missing.push(`migration table ${tableName}`);
  }
}

for (const permission of ["tree.view", "tree.edit_layout"]) {
  if (!migration.includes(permission)) {
    missing.push(`migration permission ${permission}`);
  }
}

const service = fs.readFileSync(
  path.join(root, "lib/family/tree-layout-service.ts"),
  "utf8",
);

for (const exportedName of [
  "getDefaultTreeLayout",
  "saveTreeNodePositions",
  "resetTreeLayout",
  "applySavedLayoutToGraph",
]) {
  if (!service.includes(exportedName)) {
    missing.push(`tree-layout-service ${exportedName}`);
  }
}

if (missing.length > 0) {
  console.error("Tree editor foundation check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Tree editor foundation check passed.");

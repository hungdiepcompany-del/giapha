const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "lib/family/import-types.ts",
  "lib/family/json-import-validator.ts",
  "lib/family/json-import-preview-service.ts",
  "app/(admin)/admin/exports/import/page.tsx",
  "app/(admin)/admin/exports/import/actions.ts",
  "app/(admin)/admin/exports/import/state.ts",
  "components/imports/json-import-preview-form.tsx",
  "docs/06_EXPORT_BACKUP_MODEL.md",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

if (!packageJson.scripts?.["check:import-json"]) {
  missing.push("package.json scripts.check:import-json");
}

const validator = fs.readFileSync(
  path.join(root, "lib/family/json-import-validator.ts"),
  "utf8",
);

for (const token of [
  "parseFamilyJsonImport",
  "schema_version",
  "duplicate_id",
  "missing_full_name",
  "missing_family_reference",
  "missing_person_reference",
  "ancestor_cycle",
]) {
  if (!validator.includes(token)) {
    missing.push(`json-import-validator ${token}`);
  }
}

const previewService = fs.readFileSync(
  path.join(root, "lib/family/json-import-preview-service.ts"),
  "utf8",
);

for (const token of [
  "imports.create",
  "previewFamilyJsonImport",
  "maybeCreateAdminSupabaseClient",
  "people",
  "families",
  "tree_layouts",
]) {
  if (!previewService.includes(token)) {
    missing.push(`json-import-preview-service ${token}`);
  }
}

const importPage = fs.readFileSync(
  path.join(root, "app/(admin)/admin/exports/import/page.tsx"),
  "utf8",
);

for (const token of [
  "imports.create",
  "JsonImportPreviewForm",
  "không ghi dữ liệu",
]) {
  if (!importPage.includes(token)) {
    missing.push(`import page ${token}`);
  }
}

const importAction = fs.readFileSync(
  path.join(root, "app/(admin)/admin/exports/import/actions.ts"),
  "utf8",
);

if (!importAction.includes("previewImportAction")) {
  missing.push("import actions previewImportAction");
}

const exportPage = fs.readFileSync(
  path.join(root, "app/(admin)/admin/exports/page.tsx"),
  "utf8",
);

if (!exportPage.includes("/admin/exports/import")) {
  missing.push("exports page import link");
}

if (missing.length > 0) {
  console.error("Import JSON foundation check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Import JSON foundation check passed.");

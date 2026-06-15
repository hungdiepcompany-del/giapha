const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const requiredPaths = [
  "lib/family/export-types.ts",
  "lib/family/export-collector.ts",
  "lib/family/json-exporter.ts",
  "lib/family/gedcom-exporter.ts",
  "lib/family/checksum.ts",
  "lib/family/zip-backup-exporter.ts",
  "app/(admin)/admin/exports/page.tsx",
  "app/(admin)/admin/exports/download/json/route.ts",
  "app/(admin)/admin/exports/download/gedcom/route.ts",
  "app/(admin)/admin/exports/download/zip/route.ts",
  "db/migrations/20260614_0006_export_backup_foundation.sql",
  "docs/06_EXPORT_BACKUP_MODEL.md",
  "docs/99_NEXT_AI_HANDOFF.md",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(root, relativePath));
});

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

if (!packageJson.scripts?.["check:export-backup"]) {
  missing.push("package.json scripts.check:export-backup");
}

if (!packageJson.dependencies?.jszip) {
  missing.push("package.json dependencies.jszip");
}

const exportTypes = fs.readFileSync(
  path.join(root, "lib/family/export-types.ts"),
  "utf8",
);

for (const name of [
  "FamilyJsonExport",
  "FamilyJsonManifest",
  "GedcomExportResult",
  "BackupManifest",
  "ExportBuildOptions",
]) {
  if (!exportTypes.includes(name)) {
    missing.push(`export-types ${name}`);
  }
}

const collector = fs.readFileSync(
  path.join(root, "lib/family/export-collector.ts"),
  "utf8",
);

for (const tableName of [
  "people",
  "families",
  "family_parents",
  "family_children",
  "couple_relationships",
  "tree_layouts",
  "tree_layout_nodes",
]) {
  if (!collector.includes(tableName)) {
    missing.push(`export-collector ${tableName}`);
  }
}

if (!collector.includes("exports.download")) {
  missing.push("export-collector exports.download permission");
}

if (missing.length > 0) {
  console.error("Export/backup foundation check failed. Missing:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Export/backup foundation check passed.");

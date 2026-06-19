const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = readFile(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

function gitOutput(args) {
  try {
    return childProcess.execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`git ${args.join(" ")} failed`);
    return "";
  }
}

function gitStatus(...pathspecs) {
  return gitOutput(["status", "--short", "--", ...pathspecs]);
}

function gitShowHead(relativePath) {
  try {
    return childProcess.execFileSync("git", ["show", `HEAD:${relativePath}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

const packageJson = readJson("package.json");
const exportTypes = readFile("lib/family/export-types.ts");
const collector = readFile("lib/family/export-collector.ts");
const jsonExporter = readFile("lib/family/json-exporter.ts");
const jsonRoute = readFile("app/(admin)/admin/exports/download/json/route.ts");
const doc = readFile("docs/126_SMALL_JSON_EXPORT_SMOKE_REVIEW.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "FAMILY_EXPORT_SCHEMA_VERSION",
  "FAMILY_EXPORT_APP_EXPORT_VERSION",
  "ExportScope",
  "export_scope",
  "privacy_scope",
  "FamilyJsonManifest",
  "clan_count",
  "clan_branch_count",
  "generation_rule_count",
  "person_branch_membership_count",
]) {
  requireIncludes(exportTypes, token, `export metadata type ${token}`);
}

for (const token of [
  "schema_version: FAMILY_EXPORT_SCHEMA_VERSION",
  "app_export_version: FAMILY_EXPORT_APP_EXPORT_VERSION",
  "export_scope: exportScope(privacyMode)",
  "privacy_scope: privacyMode",
  "exported_at: exportedAt",
  "clans: collection.data.clans",
  "clan_branches: collection.data.clan_branches",
  "generation_rules: collection.data.generation_rules",
  "person_branch_memberships: collection.data.person_branch_memberships",
  "familyJson.data.clans.length",
  "familyJson.data.clan_branches.length",
  "familyJson.data.generation_rules.length",
  "familyJson.data.person_branch_memberships.length",
]) {
  requireIncludes(jsonExporter, token, `json exporter smoke token ${token}`);
}

for (const token of [
  ".from(\"clans\")",
  ".from(\"clan_branches\")",
  ".from(\"generation_rules\")",
  ".from(\"person_branch_memberships\")",
  "sanitizePersonForMode",
  "canExportVisibility",
  "notes_private: null",
  "source_note: null",
  "created_by: null",
  "updated_by: null",
  "deleted_by: null",
  "tree_layouts:",
  "privacyMode === \"admin\" ? activeOnly(treeLayouts.data, includeDeleted) : []",
  "tree_layout_nodes:",
]) {
  requireIncludes(collector, token, `collector smoke token ${token}`);
}

for (const token of [
  "buildFamilyJsonFile({ action: \"download\" })",
  "X-Checksum-SHA256",
  "Content-Disposition",
]) {
  requireIncludes(jsonRoute, token, `json route token ${token}`);
}

const runtimeExportContent = [exportTypes, collector, jsonExporter, jsonRoute].join("\n");
for (const token of [
  "person_media",
  "person_names",
  "person_life_events",
  "person_burials",
  "persistent_warning",
  "data_quality_warnings",
  "quality_warnings",
  ".storage.from(",
  "createSignedUrl",
  "signedUrl",
  "SUPABASE_SERVICE_ROLE_KEY",
  "sb_secret_",
]) {
  rejectIncludes(runtimeExportContent, token, `forbidden export runtime token ${token}`);
}

for (const token of [
  "Status: `PASS_LOCAL_STATIC_SMOKE`",
  "Smoke/Review Scope",
  "Export Metadata Review",
  "Privacy Review",
  "Lineage Review",
  "Runtime Boundary Review",
  "Checker Result",
  "Validation Results",
  "Explicitly Deferred Items",
  "Recommended next phase",
  "No migration.",
  "No `.sql` file.",
  "No DB apply.",
  "No SQL mutation.",
  "No seed/backfill.",
  "No large JSON export runtime.",
  "No GEDCOM runtime.",
  "No ZIP runtime.",
  "No import parser runtime.",
  "No media export/import.",
  "No backup/restore runtime.",
  "No Worker created.",
  "No OpenNext/Wrangler config change.",
  "No runtime dependency added.",
  "No deploy.",
  "No push.",
]) {
  requireIncludes(doc, token, `Phase 126 doc token ${token}`);
}

for (const token of [
  "126_SMALL_JSON_EXPORT_SMOKE_REVIEW.md",
  "Phase 126 - Small JSON Export Smoke Review",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(
  workLog,
  "Phase 126 - Small JSON Export Smoke, Privacy Review, and Handoff Hardening",
  "work log entry",
);
requireIncludes(decisionLog, "Decision 148", "decision log entry");
requireIncludes(
  handoff,
  "Phase 126 - Small JSON Export Smoke Review completed",
  "handoff entry",
);

if (
  packageJson?.scripts?.["check:small-json-export-smoke"] !==
  "node scripts/check-small-json-export-smoke.cjs"
) {
  failures.push("package.json missing check:small-json-export-smoke script");
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  if (
    JSON.stringify(previousPackage.dependencies || {}) !==
    JSON.stringify(packageJson.dependencies || {})
  ) {
    failures.push("runtime dependencies changed");
  }
  if (
    JSON.stringify(previousPackage.devDependencies || {}) !==
    JSON.stringify(packageJson.devDependencies || {})
  ) {
    failures.push("devDependencies changed");
  }
}

const status = gitOutput(["status", "--short"]);
for (const line of status.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  if (file.toLowerCase().endsWith(".sql")) {
    failures.push(`SQL file changed or added: ${file}`);
  }
}

for (const [label, pathspecs] of [
  ["migration files changed", ["db/migrations"]],
  [
    "GEDCOM/ZIP/import/media/backup runtime changed",
    [
      "lib/family/gedcom-exporter.ts",
      "lib/family/zip-backup-exporter.ts",
      "lib/family/json-import-validator.ts",
      "lib/family/json-import-preview-service.ts",
      "app/(admin)/admin/exports/download/gedcom/route.ts",
      "app/(admin)/admin/exports/download/zip/route.ts",
      "app/(admin)/admin/exports/import",
    ],
  ],
  [
    "Worker/config/deploy surface changed",
    [
      "services",
      "wrangler.toml",
      "open-next.config.ts",
      "next.config.ts",
      ".github/workflows",
    ],
  ],
  ["PLANNING.MD touched", ["PLANNING.MD"]],
]) {
  const pathStatus = gitStatus(...pathspecs);
  if (pathStatus.trim()) failures.push(`${label}: ${pathStatus.trim()}`);
}

if (failures.length > 0) {
  console.error("Small JSON export smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Small JSON export smoke check passed.");

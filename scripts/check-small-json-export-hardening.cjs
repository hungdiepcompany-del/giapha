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
const doc = readFile("docs/125_SMALL_JSON_EXPORT_HARDENING.md");
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
  "clan_count",
  "clan_branch_count",
  "generation_rule_count",
  "person_branch_membership_count",
  "clans",
  "clan_branches",
  "generation_rules",
  "person_branch_memberships",
]) {
  requireIncludes(exportTypes, token, `export-types token ${token}`);
}

for (const token of [
  "CLAN_EXPORT_SELECT",
  "CLAN_BRANCH_EXPORT_SELECT",
  "GENERATION_RULE_EXPORT_SELECT",
  "PERSON_BRANCH_MEMBERSHIP_EXPORT_SELECT",
  ".from(\"clans\")",
  ".from(\"clan_branches\")",
  ".from(\"generation_rules\")",
  ".from(\"person_branch_memberships\")",
  "sanitizePersonForMode",
  "notes_private: null",
  "source_note: null",
  "canExportVisibility",
  "privacyMode === \"admin\" ? activeOnly(treeLayouts.data, includeDeleted) : []",
]) {
  requireIncludes(collector, token, `collector token ${token}`);
}

for (const token of [
  "app_export_version",
  "export_scope",
  "privacy_scope",
  "exportScope(privacyMode)",
  "clan_count: data.clans.length",
  "clan_branch_count: data.clan_branches.length",
  "generation_rule_count: data.generation_rules.length",
  "person_branch_membership_count: data.person_branch_memberships.length",
  "clans: collection.data.clans",
  "clan_branches: collection.data.clan_branches",
  "generation_rules: collection.data.generation_rules",
  "person_branch_memberships: collection.data.person_branch_memberships",
]) {
  requireIncludes(jsonExporter, token, `json-exporter token ${token}`);
}

for (const token of [
  "Status: `IMPLEMENTED_SMALL_JSON_ONLY`",
  "Owner Approval Scope",
  "Existing Export Surface Reviewed",
  "JSON Export Hardening Result",
  "Schema/Version Metadata Result",
  "Privacy Behavior",
  "Lineage Export Behavior",
  "Explicitly Deferred Items",
  "Worker/Runtime Impact",
  "Validation Results",
  "No migration.",
  "No `.sql` file.",
  "No DB apply.",
  "No SQL mutation.",
  "No seed/backfill.",
  "No large JSON export runtime.",
  "No GEDCOM heavy runtime.",
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
  requireIncludes(doc, token, `Phase 125 doc token ${token}`);
}

for (const token of [
  "125_SMALL_JSON_EXPORT_HARDENING.md",
  "Phase 125 - Small Main-App JSON Export Hardening",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(
  workLog,
  "Phase 125 - Small Main-App JSON Export Hardening",
  "work log entry",
);
requireIncludes(decisionLog, "Decision 147", "decision log entry");
requireIncludes(
  handoff,
  "Phase 125 - Small Main-App JSON Export Hardening completed",
  "handoff entry",
);

if (
  packageJson?.scripts?.["check:small-json-export-hardening"] !==
  "node scripts/check-small-json-export-hardening.cjs"
) {
  failures.push("package.json missing check:small-json-export-hardening script");
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

const runtimeExportFiles = [
  "lib/family/export-types.ts",
  "lib/family/export-collector.ts",
  "lib/family/json-exporter.ts",
];
const runtimeExportContent = runtimeExportFiles.map(readFile).join("\n");

for (const token of [
  "person_media",
  "person_names",
  "person_life_events",
  "person_burials",
  "persistent_warning",
  "warning_findings",
]) {
  rejectIncludes(runtimeExportContent, token, `unsupported runtime table ${token}`);
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
    "GEDCOM/ZIP runtime changed",
    [
      "lib/family/gedcom-exporter.ts",
      "lib/family/zip-backup-exporter.ts",
      "app/(admin)/admin/exports/download/gedcom/route.ts",
      "app/(admin)/admin/exports/download/zip/route.ts",
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
  console.error("Small JSON export hardening check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Small JSON export hardening check passed.");

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

const PHASE_125_ALLOWED_RUNTIME_FILES = new Set([
  "lib/family/export-types.ts",
  "lib/family/export-collector.ts",
  "lib/family/json-exporter.ts",
]);

function filterAllowedStatus(statusText, allowedFiles) {
  return statusText
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => {
      const file = line.slice(3).trim().replaceAll("\\", "/");
      return !allowedFiles.has(file);
    })
    .join("\n");
}

const packageJson = readJson("package.json");
const exportDoc = readFile("docs/122B_EXPORT_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md");
const importDoc = readFile("docs/123B_IMPORT_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md");
const portabilityDoc = readFile("docs/124B_PORTABILITY_BACKUP_TEST_CONTRACT_EXAMPLES.md");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "Static examples status: `DESIGN_ONLY`",
  "Example `family.json` Export Shape",
  "\"schema_version\"",
  "\"exported_at\"",
  "\"people\"",
  "\"families\"",
  "\"family_parents\"",
  "\"family_children\"",
  "\"couple_relationships\"",
  "\"clans\"",
  "\"clan_branches\"",
  "\"generation_rules\"",
  "\"person_branch_memberships\"",
  "\"tree_layouts\"",
  "revisions_summary",
  "privacy_metadata",
  "Public Export",
  "Family/Internal Export",
  "Admin Full Backup Export",
  "Example GEDCOM Mapping Notes",
  "Example ZIP Bundle Manifest",
  "Unsafe Export Cases That Must Be Rejected",
  "Future Export-Service Acceptance Checklist",
  "Future GEDCOM/ZIP Acceptance Checklist",
]) {
  requireIncludes(exportDoc, token, `Phase 122B token ${token}`);
}

for (const token of [
  "Static examples status: `DESIGN_ONLY`",
  "Valid Small `family.json`",
  "Missing `schema_version`",
  "Duplicate Person Candidate",
  "Invalid Relationship",
  "Missing Parent Reference",
  "Clan Branch Mismatch",
  "Generation Conflict",
  "Privacy Visibility Conflict",
  "Unsupported GEDCOM Extension",
  "ZIP Manifest Checksum Mismatch",
  "Example Import Preview Result",
  "\"accepted_rows\"",
  "\"warnings\"",
  "\"blocking_errors\"",
  "\"conflict_candidates\"",
  "\"owner_approval_required\"",
  "Example Apply Gate",
  "Future Import-Service Acceptance Checklist",
  "Future Large Import Acceptance Checklist",
]) {
  requireIncludes(importDoc, token, `Phase 123B token ${token}`);
}

for (const token of [
  "Static test contract status: `DESIGN_ONLY`",
  "Example Portability Checks",
  "Stable IDs preserved",
  "References resolve",
  "Schema version known",
  "Unknown future fields",
  "Required sections",
  "Example Backup Manifest",
  "\"backup_id\"",
  "\"created_at\"",
  "\"app_version\"",
  "\"schema_version\"",
  "\"file_list\"",
  "\"checksums\"",
  "\"export_scope\"",
  "\"privacy_scope\"",
  "Example Restore Dry-Run Report",
  "\"files_detected\"",
  "\"checksums_verified\"",
  "\"schema_compatibility_result\"",
  "\"relationship_validation_result\"",
  "\"lineage_validation_result\"",
  "\"warning_summary\"",
  "\"no_mutation_result\"",
  "Backward Compatibility Examples",
  "Forward Compatibility Examples",
  "No-Go Conditions Before Restore/Apply",
  "Future Backup-Service Acceptance Checklist",
  "Future Import-Service Acceptance Checklist",
]) {
  requireIncludes(portabilityDoc, token, `Phase 124B token ${token}`);
}

for (const doc of [exportDoc, importDoc, portabilityDoc]) {
  for (const token of [
    "No migration.",
    "No `.sql` file.",
    "No DB apply.",
    "No SQL mutation.",
    "No seed/backfill.",
    "No Worker created.",
    "No OpenNext/Wrangler config change.",
    "No runtime dependency added.",
    "No deploy.",
    "No push.",
  ]) {
    requireIncludes(doc, token, `explicit no-go ${token}`);
  }
  for (const token of [
    "Status: `IMPLEMENTED`",
    "Status: `READY_FOR_DB_APPLY`",
    "supabase db push",
    "wrangler deploy",
    "CREATE TABLE",
    "ALTER TABLE",
    "INSERT INTO",
    "UPDATE public.",
    "DELETE FROM",
  ]) {
    rejectIncludes(doc, token, `implementation token ${token}`);
  }
}

for (const token of [
  "122B_EXPORT_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md",
  "123B_IMPORT_STATIC_EXAMPLES_ACCEPTANCE_CHECKLIST.md",
  "124B_PORTABILITY_BACKUP_TEST_CONTRACT_EXAMPLES.md",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(
  workLog,
  "Phase 122B-124B Export/Import Static Examples And Test Contracts",
  "work log entry",
);
requireIncludes(decisionLog, "Decision 145", "decision log entry");
requireIncludes(
  handoff,
  "Phase 122B-124B Export/Import Static Examples And Test Contracts completed",
  "handoff entry",
);

if (
  packageJson?.scripts?.["check:export-import-static-examples"] !==
  "node scripts/check-export-import-static-examples.cjs"
) {
  failures.push("package.json missing check:export-import-static-examples script");
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
  ["runtime app surface changed", ["app", "components", "lib", "server"]],
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
  const filteredStatus =
    label === "runtime app surface changed"
      ? filterAllowedStatus(pathStatus, PHASE_125_ALLOWED_RUNTIME_FILES)
      : pathStatus;
  if (filteredStatus.trim()) failures.push(`${label}: ${filteredStatus.trim()}`);
}

if (failures.length > 0) {
  console.error("Export/import static examples check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Export/import static examples check passed.");

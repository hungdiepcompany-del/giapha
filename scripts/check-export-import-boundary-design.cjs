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

const A17Q_TX1_ALLOWED_SQL_FILES = new Set([
  "db/checks/20260713_check_a17q_tx1_legacy_family_reconciliation_executor_candidate.sql",
  "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
  "supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
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
const exportDoc = readFile("docs/122A_EXPORT_BOUNDARY_DESIGN.md");
const importDoc = readFile("docs/123A_IMPORT_BOUNDARY_DESIGN.md");
const portabilityDoc = readFile(
  "docs/124A_DATA_PORTABILITY_BACKUP_COMPATIBILITY_CONTRACT.md",
);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`",
  "Current Export Foundation Review",
  "Why Large Export Must Stay Out Of The Main Worker",
  "`family.json`",
  "GEDCOM",
  "ZIP Bundle",
  "Media Bundle Later",
  "`people`",
  "`families`",
  "`clans`",
  "`clan_branches`",
  "`generation_rules`",
  "`person_branch_memberships`",
  "`tree_layouts`",
  "`revisions`",
  "Living-person handling",
  "Private notes and internal source notes",
  "genealogy-export-service",
  "Approval Gate Before Export-Service Worker",
  "Approval Gate Before ZIP/GEDCOM Expansion",
  "No large JSON/GEDCOM/ZIP export runtime.",
]) {
  requireIncludes(exportDoc, token, `Phase 122A token ${token}`);
}

for (const token of [
  "Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`",
  "Current Import Foundation Review",
  "`family.json`",
  "GEDCOM Later",
  "ZIP Bundle Later",
  "Media Restore Later",
  "upload/receive",
  "parse",
  "validate",
  "preview",
  "conflict detection",
  "owner approval",
  "apply",
  "rollback/no-go",
  "person identity",
  "relationship consistency",
  "clan, branch and generation membership",
  "privacy visibility",
  "duplicate candidates",
  "missing required relationships",
  "genealogy-import-service",
  "No Direct Production Mutation Without Approval Gate",
  "Approval Gate Before Import-Service Worker",
  "Approval Gate Before Large Import Runtime",
  "No import parser runtime.",
]) {
  requireIncludes(importDoc, token, `Phase 123A token ${token}`);
}

for (const token of [
  "Status: `DESIGN_ONLY_LOCAL_STATIC_VALIDATED`",
  "Long-Term Portability Goals",
  "Canonical `family.json` Contract Direction",
  "Stable IDs And References",
  "Schema Versioning",
  "Backward Compatibility",
  "Forward Compatibility",
  "Restore Dry-Run Expectations",
  "Backup Manifest Expectations",
  "Clan/Branch/Generation Compatibility",
  "Future Media Compatibility",
  "Future Warnings Compatibility",
  "Privacy-Safe Export Contract",
  "What Must Be Included Now",
  "What Must Be Deferred",
  "Approval Gates Before Runtime/Service Changes",
  "`schema_version`",
  "`clans`",
  "`clan_branches`",
  "`generation_rules`",
  "`person_branch_memberships`",
]) {
  requireIncludes(portabilityDoc, token, `Phase 124A token ${token}`);
}

for (const doc of [exportDoc, importDoc, portabilityDoc]) {
  for (const token of [
    "No migration.",
    "No `.sql` file.",
    "No DB apply.",
    "No SQL mutation.",
    "No seed/backfill.",
    "No Worker",
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
    "wrangler deploy",
    "supabase db push",
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
  "122A_EXPORT_BOUNDARY_DESIGN.md",
  "123A_IMPORT_BOUNDARY_DESIGN.md",
  "124A_DATA_PORTABILITY_BACKUP_COMPATIBILITY_CONTRACT.md",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(
  workLog,
  "Phase 122A-124A Export/Import Boundary And Portability Contract",
  "work log entry",
);
requireIncludes(decisionLog, "Decision 144", "decision log entry");
requireIncludes(
  handoff,
  "Phase 122A-124A Export/Import Boundary And Portability Contract completed",
  "handoff entry",
);

if (
  packageJson?.scripts?.["check:export-import-boundary-design"] !==
  "node scripts/check-export-import-boundary-design.cjs"
) {
  failures.push("package.json missing check:export-import-boundary-design script");
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
  if (file.toLowerCase().endsWith(".sql") && !A17Q_TX1_ALLOWED_SQL_FILES.has(file)) {
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
      : label === "migration files changed"
        ? filterAllowedStatus(pathStatus, A17Q_TX1_ALLOWED_SQL_FILES)
        : pathStatus;
  if (filteredStatus.trim()) failures.push(`${label}: ${filteredStatus.trim()}`);
}

if (failures.length > 0) {
  console.error("Export/import boundary design check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Export/import boundary design check passed.");

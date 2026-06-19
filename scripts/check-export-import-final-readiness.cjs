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
const exportDoc = readFile("docs/122C_EXPORT_COMPATIBILITY_MATRIX.md");
const importDoc = readFile("docs/123C_IMPORT_COMPATIBILITY_MATRIX.md");
const readinessDoc = readFile(
  "docs/124C_PORTABILITY_BACKUP_FINAL_READINESS_GATE.md",
);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const [label, doc] of [
  ["Phase 122C", exportDoc],
  ["Phase 123C", importDoc],
  ["Phase 124C", readinessDoc],
]) {
  requireIncludes(doc, "DESIGN_ONLY", `${label} design-only marker`);
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
    requireIncludes(doc, token, `${label} explicit no-go ${token}`);
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
    rejectIncludes(doc, token, `${label} implementation token ${token}`);
  }
}

for (const token of [
  "Export Format Matrix",
  "Data Compatibility Matrix",
  "Public/Family/Admin Export Matrix",
  "Living-Person Handling Matrix",
  "Backward Compatibility Expectations",
  "Forward Compatibility Expectations",
  "No-Go Export Cases",
  "Export-Service Readiness Status",
  "`family.json`",
  "GEDCOM",
  "ZIP bundle",
  "media bundle later",
  "`people`",
  "`families`",
  "`family_parents`",
  "`family_children`",
  "`couple_relationships`",
  "`clans`",
  "`clan_branches`",
  "`generation_rules`",
  "`person_branch_memberships`",
  "`tree_layouts`",
  "`revisions`",
  "future media",
  "future warnings",
  "privacy-sensitive",
]) {
  requireIncludes(exportDoc, token, `Phase 122C token ${token}`);
}

for (const token of [
  "Import Source Matrix",
  "Validation Matrix",
  "Conflict Handling Matrix",
  "Import Preview Compatibility Expectations",
  "Restore/Import Apply Gate",
  "No-Go Import Cases",
  "Import-Service Readiness Status",
  "`family.json` current version",
  "`family.json` older version",
  "`family.json` future version",
  "GEDCOM",
  "ZIP bundle",
  "Media bundle later",
  "identity",
  "relationships",
  "lineage",
  "tree layout",
  "privacy",
  "duplicates",
  "unsupported fields",
  "checksums",
  "require owner decision",
  "block import",
]) {
  requireIncludes(importDoc, token, `Phase 123C token ${token}`);
}

for (const token of [
  "Final Readiness Status For Docs/Contracts/Examples",
  "What Is Ready",
  "What Is Not Ready",
  "Decision Matrix",
  "A. Defer implementation",
  "B. Start export-service design phase",
  "C. Start import-service design phase",
  "D. Start backup/restore dry-run runtime candidate",
  "E. Start small main-app JSON export hardening only",
  "F. Start GEDCOM/ZIP runtime only after service boundary approval",
  "Required Owner Approvals Before Runtime",
  "No-Go Conditions Before Runtime",
  "Privacy/Security Notes",
  "Worker/Runtime Impact",
  "Default recommendation: A. Defer implementation, or E. small main-app JSON export hardening only",
  "export-service Worker",
  "import-service Worker",
  "backup-service runtime expansion",
  "GEDCOM/ZIP heavy export",
  "restore/apply mutation",
  "media bundle export/import",
]) {
  requireIncludes(readinessDoc, token, `Phase 124C token ${token}`);
}

for (const token of [
  "122C_EXPORT_COMPATIBILITY_MATRIX.md",
  "123C_IMPORT_COMPATIBILITY_MATRIX.md",
  "124C_PORTABILITY_BACKUP_FINAL_READINESS_GATE.md",
]) {
  requireIncludes(index, token, `index token ${token}`);
}

requireIncludes(
  workLog,
  "Phase 122C-124C Export/Import Final Readiness Matrix",
  "work log entry",
);
requireIncludes(decisionLog, "Decision 146", "decision log entry");
requireIncludes(
  handoff,
  "Phase 122C-124C Export/Import Final Readiness Matrix completed",
  "handoff entry",
);

if (
  packageJson?.scripts?.["check:export-import-final-readiness"] !==
  "node scripts/check-export-import-final-readiness.cjs"
) {
  failures.push("package.json missing check:export-import-final-readiness script");
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
  if (pathStatus.trim()) failures.push(`${label}: ${pathStatus.trim()}`);
}

if (failures.length > 0) {
  console.error("Export/import final readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Export/import final readiness check passed.");

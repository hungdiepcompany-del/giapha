const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const executionDocPath = "docs/113_VIETNAMESE_GENEALOGY_MIGRATION_APPLY_EXECUTION.md";
const migrationPath = "db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql";
const expectedMigrationSha256 =
  "522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F";
const targetProjectRef = "frkyeuxrlcflmsxxsolp";

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

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function gitStatus(pathspec) {
  try {
    return childProcess.execFileSync("git", ["status", "--short", "--", pathspec], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`git status failed for ${pathspec}`);
    return "";
  }
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

function fileSha256(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return "";
  return crypto.createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex").toUpperCase();
}

const executionDoc = readFile(executionDocPath);
const migration = readFile(migrationPath);
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "# Phase 113 - Vietnamese Genealogy Migration Apply Execution",
  "OWNER_ACTION_REQUIRED_MANUAL_DASHBOARD_APPLY",
  "Apply status: `LOCAL_APPLY_NOT_RUN`",
  "DB verification status: `NOT_RUN_APPLY_NOT_CONFIRMED`",
  "Approval status: `RECEIVED`",
  targetProjectRef,
  "DB backup/snapshot: `DONE`",
  migrationPath,
  expectedMigrationSha256,
  "Actual SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`",
  "Supabase CLI in PATH: `NO`",
  "Local Supabase project ref file: `frkyeuxrlcflmsxxsolp`",
  "Local apply decision: `BLOCKED_NO_SAFE_LOCAL_APPLY_TOOLING`",
  "Apply method selected: `MANUAL_SUPABASE_DASHBOARD_OWNER_OPERATOR`",
  "Apply result: `OWNER_ACTION_REQUIRED`",
  "DB verification result: `NOT_RUN_APPLY_NOT_CONFIRMED`",
  "Static RLS review: `PASS`",
  "DB RLS verification: `NOT_RUN_APPLY_NOT_CONFIRMED`",
  "Main Worker touched: NO",
  "Runtime app code changed: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "Deploy run: NO",
  "Phase 113A - Owner Manual Apply Result Capture And Read-Only Verification",
]) {
  requireIncludes(executionDoc, token, `execution doc token ${token}`);
}

for (const token of [
  "`clans` exists",
  "`clan_branches` exists",
  "`generation_rules` exists",
  "`person_branch_memberships` exists",
  "`person_names`",
  "`person_life_events`",
  "`person_burials`",
  "`person_media`",
  "No seed data.",
  "No production data mutation.",
  "No automatic backfill from `people.branch_name`.",
  "No automatic backfill from `people.generation_number`.",
]) {
  requireIncludes(executionDoc, token, `scope/verification token ${token}`);
}

for (const token of [
  "VIETNAMESE_GENEALOGY_PHASE_111_REAL_MIGRATION",
  "OWNER_APPROVED_FILE_CREATION_ONLY",
  "DO_NOT_APPLY_WITHOUT_SEPARATE_PHASE_113_APPROVAL",
]) {
  requireIncludes(migration, token, `migration marker ${token}`);
}

const actualMigrationSha256 = fileSha256(migrationPath);
if (actualMigrationSha256 !== expectedMigrationSha256) {
  failures.push(
    `migration checksum changed: expected ${expectedMigrationSha256}, got ${actualMigrationSha256 || "missing"}`,
  );
}

for (const pattern of [
  /\bsupabase\s+db\s+(?:push|reset|migration|remote|link)\b/i,
  /\bpsql\b/i,
  /\bwrangler\s+deploy\b/i,
  /\bopennextjs-cloudflare\s+deploy\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+public\.people\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bTRUNCATE\b/i,
]) {
  rejectPattern(executionDoc, pattern, `unsafe execution instruction in Phase 113 doc ${pattern}`);
}

requireIncludes(workLog, "Phase 113 Vietnamese Genealogy Migration Apply Execution", "work log entry");
requireIncludes(workLog, "OWNER_ACTION_REQUIRED_MANUAL_DASHBOARD_APPLY", "work log manual action status");
requireIncludes(decisionLog, "Decision 133", "decision log entry");
requireIncludes(handoff, "Phase 113 Vietnamese Genealogy Migration Apply Execution recorded", "handoff entry");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:vietnamese-genealogy-migration-apply-execution"] !==
    "node scripts/check-vietnamese-genealogy-migration-apply-execution.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-migration-apply-execution script");
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  const previousDeps = JSON.stringify(previousPackage.dependencies || {});
  const previousDevDeps = JSON.stringify(previousPackage.devDependencies || {});
  const currentDeps = JSON.stringify(packageJson.dependencies || {});
  const currentDevDeps = JSON.stringify(packageJson.devDependencies || {});

  if (previousDeps !== currentDeps) failures.push("runtime dependencies changed in Phase 113");
  if (previousDevDeps !== currentDevDeps) failures.push("devDependencies changed in Phase 113");
}

const migrationStatus = gitStatus("db/migrations");
if (migrationStatus.trim()) {
  failures.push(`migration file changed in Phase 113: ${migrationStatus.trim()}`);
}

const runtimeStatuses = [
  gitStatus("app"),
  gitStatus("components"),
  gitStatus("lib"),
  gitStatus("server"),
  gitStatus("services"),
  gitStatus("wrangler.toml"),
  gitStatus("open-next.config.ts"),
  gitStatus("next.config.ts"),
].join("");

if (runtimeStatuses.trim()) {
  failures.push(`runtime or deploy surface changed in Phase 113: ${runtimeStatuses.trim()}`);
}

const stagedPlanning = childProcess.execFileSync("git", ["diff", "--cached", "--name-only", "--", "PLANNING.MD"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (stagedPlanning.trim()) failures.push("PLANNING.MD is staged");

if (failures.length > 0) {
  console.error("Vietnamese genealogy migration apply execution check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy migration apply execution check passed.");

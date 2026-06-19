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

const doc = readFile("docs/113C_VIETNAMESE_GENEALOGY_MANUAL_SQL_DIAGNOSTIC_PASS.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "# Phase 113C - Vietnamese Genealogy Manual SQL Diagnostic PASS",
  "Status: `PASS_MANUAL_SQL_DIAGNOSTIC`",
  "Final DB verification status: `PASS_MANUAL_SQL_DIAGNOSTIC`",
  "Credential verifier status: `REST_VERIFIER_NOT_USED_FOR_PASS`",
  "Phase 114-117 readiness: `READY_FOR_GROUPED_PHASE_114_117`",
  "owner/operator manual Supabase Dashboard SQL Editor",
  "Target project ref: `frkyeuxrlcflmsxxsolp`",
  "db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql",
  "## Required Tables Result",
  "Result: `PASS`",
  "`clans`",
  "`clan_branches`",
  "`generation_rules`",
  "`person_branch_memberships`",
  "## Excluded Tables Result",
  "`person_names`",
  "`person_life_events`",
  "`person_burials`",
  "`person_media`",
  "## Existing Core Tables Result",
  "`people`",
  "`families`",
  "`family_parents`",
  "`family_children`",
  "`couple_relationships`",
  "## RLS Result",
  "`clans`: `true`",
  "`clan_branches`: `true`",
  "`generation_rules`: `true`",
  "`person_branch_memberships`: `true`",
  "## Policies Result",
  "policies exist for all four new lineage tables",
  "## No Seed/Backfill Result",
  "`clans`: `0`",
  "`clan_branches`: `0`",
  "`generation_rules`: `0`",
  "`person_branch_memberships`: `0`",
  "rotated or revoked",
  "Codex DB verification run: NO",
  "REST verifier used for PASS: NO",
  "Main Worker touched: NO",
  "Runtime dependency added: NO",
  "Grouped Phase 114-117 can start",
]) {
  requireIncludes(doc, token, `Phase 113C doc token ${token}`);
}

for (const token of [
  "Codex ran DB verification",
  "Codex executed SQL",
  "REST verifier PASS",
  "REST verifier used for PASS: YES",
]) {
  rejectIncludes(doc, token, `false verification claim ${token}`);
}

requireIncludes(workLog, "Phase 113C Vietnamese Genealogy Manual SQL Diagnostic PASS", "work log Phase 113C entry");
requireIncludes(decisionLog, "Decision 137", "decision log Phase 113C entry");
requireIncludes(handoff, "Phase 113C Vietnamese Genealogy Manual SQL Diagnostic PASS recorded", "handoff Phase 113C entry");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:vietnamese-genealogy-manual-sql-diagnostic-pass"] !==
    "node scripts/check-vietnamese-genealogy-manual-sql-diagnostic-pass.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-manual-sql-diagnostic-pass script");
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  if (JSON.stringify(previousPackage.dependencies || {}) !== JSON.stringify(packageJson.dependencies || {})) {
    failures.push("runtime dependencies changed");
  }
  if (JSON.stringify(previousPackage.devDependencies || {}) !== JSON.stringify(packageJson.devDependencies || {})) {
    failures.push("devDependencies changed");
  }
}

const migrationStatus = gitStatus("db/migrations");
if (migrationStatus.trim()) failures.push(`migration files changed: ${migrationStatus.trim()}`);

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
if (runtimeStatuses.trim()) failures.push(`runtime or deploy surface changed: ${runtimeStatuses.trim()}`);

const stagedPlanning = childProcess.execFileSync("git", ["diff", "--cached", "--name-only", "--", "PLANNING.MD"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (stagedPlanning.trim()) failures.push("PLANNING.MD is staged");

if (failures.length > 0) {
  console.error("Vietnamese genealogy manual SQL diagnostic PASS check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy manual SQL diagnostic PASS check passed.");

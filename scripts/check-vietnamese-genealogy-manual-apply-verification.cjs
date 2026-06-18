const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/113A_VIETNAMESE_GENEALOGY_MANUAL_APPLY_VERIFICATION.md";
const migrationPath = "db/migrations/20260618_0008_vietnamese_genealogy_first_migration.sql";
const expectedMigrationSha256 =
  "522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F";

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

const doc = readFile(docPath);
const verifier = readFile("scripts/verify-vietnamese-genealogy-migration-post-apply.cjs");
const checker = readFile("scripts/check-vietnamese-genealogy-manual-apply-verification.cjs");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "# Phase 113A - Vietnamese Genealogy Manual Apply Verification",
  "OWNER_CONFIRMED_APPLIED_VERIFICATION_SAFE_SKIPPED",
  "Apply status: `OWNER_CONFIRMED_APPLIED`",
  "DB verification status: `SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS`",
  "Owner Confirmation Received",
  "frkyeuxrlcflmsxxsolp",
  migrationPath,
  expectedMigrationSha256,
  "Actual SHA256: `522B11AF4D8BDA4F1E29AB63C49C9718129ADF1B27F3F2119BB40D9F7214EA5F`",
  "`Supabase Dashboard SQL Editor`",
  "## RLS/Policy Verification Status",
  "## Excluded Scope Verification Status",
  "## Runtime And Worker Impact",
  "Main Worker touched: NO",
  "Runtime app code changed: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "Deploy run: NO",
  "Phase 113B - Credential-Assisted Vietnamese Genealogy Read-Only DB Verification",
]) {
  requireIncludes(doc, token, `Phase 113A doc token ${token}`);
}

for (const token of [
  "VIET_GENEALOGY_VERIFY_SUPABASE_URL",
  "VIET_GENEALOGY_VERIFY_SUPABASE_SERVER_KEY",
  "VIET_GENEALOGY_VERIFY_MODE=read_only",
  "SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS",
  "No Supabase client created",
  "clans",
  "clan_branches",
  "generation_rules",
  "person_branch_memberships",
  "person_names",
  "person_life_events",
  "person_burials",
  "person_media",
]) {
  requireIncludes(verifier, token, `verifier token ${token}`);
}

requireIncludes(checker, docPath, "checker references Phase 113A doc");
requireIncludes(workLog, "Phase 113A Vietnamese Genealogy Manual Apply Verification", "work log entry");
requireIncludes(decisionLog, "Decision 134", "decision log entry");
requireIncludes(handoff, "Phase 113A Vietnamese Genealogy Manual Apply Verification recorded", "handoff entry");

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
  /\bUPDATE\s+public\./i,
  /\bDELETE\s+FROM\b/i,
  /\bTRUNCATE\b/i,
]) {
  rejectPattern(doc, pattern, `unsafe Phase 113A doc instruction ${pattern}`);
  rejectPattern(verifier, pattern, `unsafe verifier instruction ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["verify:vietnamese-genealogy-migration:post-apply"] !==
    "node scripts/verify-vietnamese-genealogy-migration-post-apply.cjs"
  ) {
    failures.push("package.json missing verify:vietnamese-genealogy-migration:post-apply script");
  }
  if (
    scripts["check:vietnamese-genealogy-manual-apply-verification"] !==
    "node scripts/check-vietnamese-genealogy-manual-apply-verification.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-manual-apply-verification script");
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  const previousDeps = JSON.stringify(previousPackage.dependencies || {});
  const previousDevDeps = JSON.stringify(previousPackage.devDependencies || {});
  const currentDeps = JSON.stringify(packageJson.dependencies || {});
  const currentDevDeps = JSON.stringify(packageJson.devDependencies || {});

  if (previousDeps !== currentDeps) failures.push("runtime dependencies changed in Phase 113A");
  if (previousDevDeps !== currentDevDeps) failures.push("devDependencies changed in Phase 113A");
}

const migrationStatus = gitStatus("db/migrations");
if (migrationStatus.trim()) failures.push(`migration files changed in Phase 113A: ${migrationStatus.trim()}`);

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
  failures.push(`runtime or deploy surface changed in Phase 113A: ${runtimeStatuses.trim()}`);
}

const stagedPlanning = childProcess.execFileSync("git", ["diff", "--cached", "--name-only", "--", "PLANNING.MD"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (stagedPlanning.trim()) failures.push("PLANNING.MD is staged");

if (failures.length > 0) {
  console.error("Vietnamese genealogy manual apply verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy manual apply verification check passed.");

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/113B_VIETNAMESE_GENEALOGY_CREDENTIAL_VERIFICATION.md";

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

const doc = readFile(docPath);
const verifier = readFile("scripts/verify-vietnamese-genealogy-migration-post-apply.cjs");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "# Phase 113B - Vietnamese Genealogy Credential Verification",
  "Final verification status: `PASS_WITH_SAFE_SKIP`",
  "## Verification Env Mode",
  "## Target Project Ref/Host Sanitized",
  "## Required Tables Verification",
  "## RLS Verification",
  "## Policy Verification",
  "## Excluded Scope Verification",
  "## No Seed/Backfill Verification",
  "## Existing Table Safety Verification",
  "## Worker/Runtime Impact",
  "SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS",
  "frkyeuxrlcflmsxxsolp",
  "NOT_AVAILABLE_SAFE_SKIP",
  "Main Worker touched: NO",
  "Runtime app code changed: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "Deploy run: NO",
]) {
  requireIncludes(doc, token, `Phase 113B doc token ${token}`);
}

for (const token of [
  "`clans`",
  "`clan_branches`",
  "`generation_rules`",
  "`person_branch_memberships`",
  "`person_names`",
  "`person_life_events`",
  "`person_burials`",
  "`person_media`",
  "`people`",
  "`families`",
  "`family_parents`",
  "`family_children`",
  "`couple_relationships`",
  "`people.branch_name`",
  "`people.generation_number`",
]) {
  requireIncludes(doc, token, `verification target ${token}`);
}

for (const token of [
  "VIET_GENEALOGY_VERIFY_SUPABASE_URL",
  "VIET_GENEALOGY_VERIFY_SUPABASE_SERVER_KEY",
  "VIET_GENEALOGY_VERIFY_MODE=read_only",
  "SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS",
  "No Supabase client created",
]) {
  requireIncludes(verifier, token, `verifier token ${token}`);
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
  /\bDROP\s+TABLE\b/i,
]) {
  rejectPattern(doc, pattern, `unsafe Phase 113B doc instruction ${pattern}`);
  rejectPattern(verifier, pattern, `unsafe verifier instruction ${pattern}`);
}

requireIncludes(workLog, "Phase 113B Vietnamese Genealogy Credential Verification", "work log entry");
requireIncludes(decisionLog, "Decision 135", "decision log entry");
requireIncludes(handoff, "Phase 113B Vietnamese Genealogy Credential Verification recorded", "handoff entry");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:vietnamese-genealogy-credential-verification"] !==
    "node scripts/check-vietnamese-genealogy-credential-verification.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-credential-verification script");
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  const previousDeps = JSON.stringify(previousPackage.dependencies || {});
  const previousDevDeps = JSON.stringify(previousPackage.devDependencies || {});
  const currentDeps = JSON.stringify(packageJson.dependencies || {});
  const currentDevDeps = JSON.stringify(packageJson.devDependencies || {});

  if (previousDeps !== currentDeps) failures.push("runtime dependencies changed in Phase 113B");
  if (previousDevDeps !== currentDevDeps) failures.push("devDependencies changed in Phase 113B");
}

const migrationStatus = gitStatus("db/migrations");
if (migrationStatus.trim()) failures.push(`migration files changed in Phase 113B: ${migrationStatus.trim()}`);

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
  failures.push(`runtime or deploy surface changed in Phase 113B: ${runtimeStatuses.trim()}`);
}

const stagedPlanning = childProcess.execFileSync("git", ["diff", "--cached", "--name-only", "--", "PLANNING.MD"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (stagedPlanning.trim()) failures.push("PLANNING.MD is staged");

if (failures.length > 0) {
  console.error("Vietnamese genealogy credential verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy credential verification check passed.");

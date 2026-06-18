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

const docPath = "docs/110B_VIETNAMESE_GENEALOGY_FIRST_MIGRATION_SCOPE.md";
const doc = readFile(docPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "# Phase 110B - Vietnamese Genealogy First Migration Scope",
  "PHASE_111_NOT_APPROVED",
  "OWNER_APPROVAL_REQUIRED_BEFORE_PHASE_111_REAL_MIGRATION_FILE=true",
  "## Summary",
  "## Final Proposed First Migration Scope",
  "## Tables Allowed In Phase 111",
  "## Tables Explicitly Deferred",
  "## Optional Table Decision: `person_names`",
  "## Owner Questions",
  "## Privacy/RLS Requirements",
  "## Export/Import Compatibility Notes",
  "## Worker/Runtime Impact Notes",
  "## No-Go Conditions",
  "## Approval Marker Required Before Phase 111",
]) {
  requireIncludes(doc, token, `scope doc token ${token}`);
}

for (const token of [
  "`clans`",
  "`clan_branches`",
  "`generation_rules`",
  "`person_branch_memberships`",
]) {
  requireIncludes(doc, token, `allowed first migration table ${token}`);
}

for (const token of [
  "`person_life_events`",
  "`person_burials`",
  "`person_media`",
  "media processing",
  "large export/import/GEDCOM/ZIP work",
  "runtime app changes",
  "Worker or service creation",
  "DB apply",
  "automatic backfill from `people.branch_name`",
]) {
  requireIncludes(doc, token, `deferred item ${token}`);
}

for (const token of [
  "`person_names` is optional and not approved by default",
  "Owner decision required",
  "All allowed Phase 111 tables must have RLS enabled from creation",
  "Public clients must not receive",
  "`family.json`",
  "GEDCOM compatibility remains partial",
  "docs/RUNTIME_WORKER_GUARDRAIL.md",
  "docs/SERVICE_BOUNDARY_ROADMAP.md",
  "Main Worker touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "Runtime app change authorized by Phase 110B: NO",
]) {
  requireIncludes(doc, token, `scope guardrail token ${token}`);
}

for (const pattern of [
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bDROP\s+COLUMN\b/i,
  /\bTRUNCATE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+public\./i,
  /\bDELETE\s+FROM\b/i,
  /\bsupabase\s+db\s+push\b/i,
  /\bpsql\b/i,
  /\bwrangler\s+deploy\b/i,
  /\bopennextjs-cloudflare\s+deploy\b/i,
]) {
  rejectPattern(doc, pattern, `SQL/runtime execution instruction ${pattern}`);
}

requireIncludes(index, "110B_VIETNAMESE_GENEALOGY_FIRST_MIGRATION_SCOPE.md", "index entry");
requireIncludes(workLog, "Phase 110B Vietnamese Genealogy First Migration Scope", "work log entry");
requireIncludes(decisionLog, "Decision 130", "decision log entry");
requireIncludes(handoff, "Phase 110B Vietnamese Genealogy First Migration Scope completed", "handoff entry");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:vietnamese-genealogy-first-migration-scope"] !==
    "node scripts/check-vietnamese-genealogy-first-migration-scope.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-first-migration-scope script");
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  const previousDeps = JSON.stringify(previousPackage.dependencies || {});
  const previousDevDeps = JSON.stringify(previousPackage.devDependencies || {});
  const currentDeps = JSON.stringify(packageJson.dependencies || {});
  const currentDevDeps = JSON.stringify(packageJson.devDependencies || {});

  if (previousDeps !== currentDeps) failures.push("runtime dependencies changed in Phase 110B");
  if (previousDevDeps !== currentDevDeps) failures.push("devDependencies changed in Phase 110B");
}

const migrationStatus = gitStatus("db/migrations");
if (migrationStatus.trim()) {
  failures.push(`db/migrations changed in Phase 110B: ${migrationStatus.trim()}`);
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
  failures.push(`runtime or deploy surface changed in Phase 110B: ${runtimeStatuses.trim()}`);
}

if (failures.length > 0) {
  console.error("Vietnamese genealogy first migration scope check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy first migration scope check passed.");

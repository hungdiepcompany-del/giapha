const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const docPath = "docs/113B_FIX_VIETNAMESE_GENEALOGY_VERIFICATION_DIAGNOSTIC.md";

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
function allowsPhase114RuntimeStatus(status) {
  const lines = status.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return true;

  const phase114Doc = path.join(root, "docs/114_117_VIETNAMESE_GENEALOGY_DOMAIN_UI_INTEGRATION.md");
  if (!fs.existsSync(phase114Doc)) return false;

  const doc = fs.readFileSync(phase114Doc, "utf8");
  if (
    !doc.includes("Status: `COMPLETED_LOCAL_STATIC_VALIDATED`") ||
    !doc.includes("No migration created") ||
    !doc.includes("Worker/runtime impact")
  ) {
    return false;
  }

  const allowedFiles = new Set([
    "app/(admin)/admin/people/[id]/page.tsx",
    "components/layout/admin-shell.tsx",
    "components/tree/family-node-card.tsx",
    "lib/family/tree-graph-builder.ts",
    "lib/family/tree-service.ts",
    "lib/family/tree-types.ts",
    "lib/privacy/privacy-service.ts",
  ]);
  const allowedPrefixes = [
    "app/(admin)/admin/genealogy/",
    "components/genealogy/",
    "lib/family/lineage-",
  ];

  return lines.every((line) => {
    const statusPath = line.slice(2).trim().replaceAll("\\", "/");
    return allowedFiles.has(statusPath) || allowedPrefixes.some((prefix) => statusPath.startsWith(prefix));
  });
}

const packageJson = readJson("package.json");

for (const token of [
  "# Phase 113B-fix - Vietnamese Genealogy Verification Diagnostic",
  "Current verification status: `NOT_VERIFIED`",
  "service role key",
  "rotate or revoke",
  "migration_not_applied",
  "wrong_project_ref",
  "rest_metadata_not_available",
  "insufficient_metadata_access",
  "insufficient_verifier_design",
  "## Manual Supabase Dashboard SQL Checks",
  "### A. Required Tables Exist",
  "### B. Excluded Tables Do Not Exist",
  "### C. Existing Core Tables Still Exist",
  "### D. RLS Enabled",
  "### E. Policies Exist",
  "### F. No Seed/Backfill Rows",
  "information_schema.tables",
  "pg_class",
  "pg_policies",
  "count(*) as row_count",
  "No-Go Conditions Before Phase 114-117",
  "Worker/Runtime Impact",
]) {
  requireIncludes(doc, token, `diagnostic doc token ${token}`);
}

for (const token of [
  "verification_env_missing",
  "table_missing_or_not_in_rest_schema_cache",
  "rest_metadata_not_available",
  "insufficient_metadata_access",
  "wrong_project_ref",
  "verification_incomplete",
]) {
  requireIncludes(doc, token, `diagnostic classification ${token}`);
}

for (const token of [
  "classifyTableError",
  "expectedProjectRef",
  "projectRefCheck",
  "existingCoreTables",
  "NOT_VERIFIED_BY_REST_ONLY_VERIFIER_REQUIRES_SQL_METADATA",
  "INCOMPLETE_REQUIRES_SQL_METADATA_FOR_RLS_POLICY",
  "No Supabase client created",
]) {
  requireIncludes(verifier, token, `verifier hardening token ${token}`);
}

requireIncludes(workLog, "Phase 113B-fix Vietnamese Genealogy Verification Diagnostic", "work log entry");
requireIncludes(decisionLog, "Decision 136", "decision log entry");
requireIncludes(handoff, "Phase 113B-fix Vietnamese Genealogy Verification Diagnostic completed", "handoff entry");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:vietnamese-genealogy-verification-diagnostic"] !==
    "node scripts/check-vietnamese-genealogy-verification-diagnostic.cjs"
  ) {
    failures.push("package.json missing check:vietnamese-genealogy-verification-diagnostic script");
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  const previousDeps = JSON.stringify(previousPackage.dependencies || {});
  const previousDevDeps = JSON.stringify(previousPackage.devDependencies || {});
  const currentDeps = JSON.stringify(packageJson.dependencies || {});
  const currentDevDeps = JSON.stringify(packageJson.devDependencies || {});
  if (previousDeps !== currentDeps) failures.push("runtime dependencies changed");
  if (previousDevDeps !== currentDevDeps) failures.push("devDependencies changed");
}

for (const pattern of [
  /\bsupabase\s+db\s+(?:push|reset|migration|remote|link)\b/i,
  /\bwrangler\s+deploy\b/i,
  /\bopennextjs-cloudflare\s+deploy\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+public\./i,
  /\bDELETE\s+FROM\b/i,
  /\bTRUNCATE\b/i,
  /\bDROP\s+TABLE\b/i,
]) {
  rejectPattern(verifier, pattern, `unsafe verifier token ${pattern}`);
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
if (runtimeStatuses.trim() && !allowsPhase114RuntimeStatus(runtimeStatuses)) failures.push(`runtime or deploy surface changed: ${runtimeStatuses.trim()}`);

const stagedPlanning = childProcess.execFileSync("git", ["diff", "--cached", "--name-only", "--", "PLANNING.MD"], {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (stagedPlanning.trim()) failures.push("PLANNING.MD is staged");

if (failures.length > 0) {
  console.error("Vietnamese genealogy verification diagnostic check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Vietnamese genealogy verification diagnostic check passed.");

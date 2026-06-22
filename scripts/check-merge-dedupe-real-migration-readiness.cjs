const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const migrationPath =
  "db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql";
const draftPath = "scripts/merge-dedupe-schema-candidate.sql.draft";
const checkSqlPath = "db/checks/check_merge_dedupe_schema.sql";
const docPath = "docs/PLAN_A12_MERGE_DEDUPE_REAL_MIGRATION_APPLY_PLAN.md";
const expectedSha256 =
  "5ADECCDAA0396E42CFDED01574B6FCD785617CF01CDCD7F894ECEEF3824A525C";

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

function stripSqlComments(content) {
  return content
    .replace(/--[^\r\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function normalizeSchema(content, removeTransactionWrapper = false) {
  let normalized = stripSqlComments(content);
  if (removeTransactionWrapper) {
    normalized = normalized.replace(/^\s*begin\s*;/i, "");
    normalized = normalized.replace(/commit\s*;\s*$/i, "");
  }
  return normalized.replace(/\s+/g, " ").trim();
}

const migration = readFile(migrationPath);
const draft = readFile(draftPath);
const checkSql = readFile(checkSqlPath);
const doc = readFile(docPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const marker of [
  "A12_MERGE_DEDUPE_REAL_MIGRATION_CANDIDATE",
  "OWNER_APPROVED_FILE_CREATION_ONLY",
  "APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_GRANTED_FOR_FILE_CREATION_ONLY",
  "DO_NOT_APPLY_WITHOUT_APPROVE_A12_MERGE_DEDUPE_DB_APPLY",
  "RUNTIME_MERGE_DEDUPE_REMAINS_CLOSED",
]) {
  requireIncludes(migration, marker, `migration marker ${marker}`);
}

const tables = [
  "merge_dedupe_candidates",
  "merge_dedupe_sessions",
  "merge_dedupe_field_decisions",
  "merge_dedupe_impact_snapshots",
  "merge_dedupe_audit_events",
  "merge_dedupe_rollback_manifests",
];
for (const table of tables) {
  requireIncludes(migration, `create table if not exists public.${table}`, `table ${table}`);
  requireIncludes(
    migration,
    `alter table public.${table} enable row level security`,
    `RLS ${table}`,
  );
}

for (const token of [
  "merge_dedupe_sessions_version_actor_time_check",
  "merge_dedupe_sessions_conflict_actor_time_check",
  "merge_dedupe_sessions_graph_actor_time_check",
  "merge_dedupe_sessions_version_tokens_not_blank",
  "merge_dedupe_sessions_conflict_checksum_not_blank",
  "merge_dedupe_sessions_impact_checksum_not_blank",
  "merge_dedupe_sessions_approval_marker_not_blank",
  "merge_dedupe_sessions_graph_passed_result_check",
  "merge_dedupe_sessions_ready_state_check",
  "merge_dedupe_audit_events_reason_not_blank",
  "merge_dedupe_audit_events_session_merge_fk",
  "merge_dedupe_rollback_manifests_session_merge_fk",
  "references public.merge_dedupe_sessions(id, merge_id)",
  "source_person_snapshot",
  "relationships_snapshot",
  "layout_snapshot",
  "membership_lineage_snapshot",
  "visibility_privacy_snapshot",
  "revision_snapshot",
  "'relationship', 'layout', 'membership_lineage'",
  "'visibility_privacy', 'export'",
]) {
  requireIncludes(migration, token, `migration safety/coverage ${token}`);
}

const migrationCode = stripSqlComments(migration);
for (const pattern of [
  /\bdrop\s+(?:table|column|schema)\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\binsert\s+into\b/i,
  /\bupdate\s+[^\s;]+/i,
  /\bmerge\s+into\b/i,
  /\bcopy\s+[^\s;]+/i,
  /\balter\s+table\b[^;\n]*(?:drop|rename|alter\s+column)\b/i,
  /\bcreate\s+(?:or\s+replace\s+)?(?:function|procedure)\b/i,
  /\bcreate\s+trigger\b/i,
  /\bcreate\s+policy\b/i,
  /\bgrant\s+/i,
  /\balter\s+default\s+privileges\b/i,
  /\bpeople\.merge\.(?:suggest|review|approve|execute|rollback)\b/i,
]) {
  rejectPattern(migrationCode, pattern, `unsafe migration SQL ${pattern}`);
}

if (normalizeSchema(migration) !== normalizeSchema(draft, true)) {
  failures.push("real migration schema body drifted from approved A-11 draft");
}

if (migration) {
  const actualSha256 = crypto
    .createHash("sha256")
    .update(Buffer.from(migration, "utf8"))
    .digest("hex")
    .toUpperCase();
  if (actualSha256 !== expectedSha256) {
    failures.push(`migration SHA256 mismatch: expected ${expectedSha256}, got ${actualSha256}`);
  }
  requireIncludes(doc, expectedSha256, "reviewed migration SHA256 in apply plan");
}

for (const token of [
  "A12_MERGE_DEDUPE_POST_APPLY_READ_ONLY_CHECK",
  "information_schema.tables",
  "information_schema.columns",
  "pg_constraint",
  "pg_class",
  "relrowsecurity",
  "pg_policies",
  "pg_trigger",
  "pg_proc",
  "required_tables_exist",
  "required_columns_exist",
  "required_constraints_exist",
  "rls_enabled_fail_closed",
  "no_merge_dedupe_policies",
  "no_merge_dedupe_triggers",
  "no_merge_dedupe_routines",
  "audit_rollback_composite_fk",
  "impact_scope_coverage",
  "Expected result: 9 rows and every passed value is true.",
]) {
  requireIncludes(checkSql, token, `check SQL coverage ${token}`);
}

const checkSqlCode = stripSqlComments(checkSql);
for (const pattern of [
  /\binsert\s+into\b/i,
  /\bupdate\s+[^\s;]+/i,
  /\bdelete\s+from\b/i,
  /\btruncate\b/i,
  /\bdrop\s+/i,
  /\bcreate\s+/i,
  /\balter\s+/i,
  /\bgrant\s+/i,
  /\brevoke\s+/i,
  /\bcopy\s+/i,
]) {
  rejectPattern(checkSqlCode, pattern, `non-read-only check SQL ${pattern}`);
}

for (const token of [
  "# Plan A-12 - Merge/Dedupe Real Migration Candidate + Check SQL + Apply Plan",
  "Status: `REAL_MIGRATION_CANDIDATE_CREATED_NOT_APPLIED`",
  "Apply status: `NOT_APPLIED`",
  "## A-12A - Real migration candidate",
  "## A-12B - Check SQL",
  "## A-12C - Static checker",
  "## A-12D - Owner apply plan",
  "### 1. Pre-apply checks",
  "### 2. Backup/snapshot before apply",
  "### 3. Apply migration command",
  "### 4. Post-apply check SQL command",
  "### 5. Expected PASS output",
  "### 6. Rollback plan if apply fails",
  "### 7. Required owner marker",
  "APPROVE_A12_MERGE_DEDUPE_DB_APPLY",
  "Runtime merge/dedupe remains closed",
]) {
  requireIncludes(doc, token, `A-12 doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A12_MERGE_DEDUPE_REAL_MIGRATION_APPLY_PLAN.md", "index entry"],
  [workLog, "A-12 Bundle - Merge/Dedupe Real Migration Candidate", "work log"],
  [handoff, "A-12 Bundle - Merge/Dedupe Real Migration Candidate", "handoff"],
  [decisionLog, "Decision 165 - A-12 creates a real migration candidate without DB apply", "Decision 165"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:merge-dedupe-real-migration-readiness"] !==
  "node scripts/check-merge-dedupe-real-migration-readiness.cjs"
) {
  failures.push("package.json missing A-12 checker script");
}

const packageHead = gitShowHead("package.json");
if (packageHead && packageJson) {
  const previousPackage = JSON.parse(packageHead);
  if (
    JSON.stringify(previousPackage.dependencies || {}) !==
      JSON.stringify(packageJson.dependencies || {}) ||
    JSON.stringify(previousPackage.devDependencies || {}) !==
      JSON.stringify(packageJson.devDependencies || {})
  ) {
    failures.push("dependency drift in A-12");
  }
}

const migrationStatus = gitOutput(["status", "--short", "--", "db/migrations"]);
for (const line of migrationStatus.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  if (file !== migrationPath) failures.push(`unexpected migration change: ${file}`);
}

const runtimeStatus = gitOutput([
  "status",
  "--short",
  "--",
  "app",
  "components",
  "lib",
  "server",
  "services",
  "wrangler.toml",
  "open-next.config.ts",
  "next.config.ts",
  ".github/workflows",
]);
if (runtimeStatus.trim()) failures.push(`runtime/config drift: ${runtimeStatus.trim()}`);

const status = gitOutput(["status", "--short", "--untracked-files=all"]);
if (status.split(/\r?\n/).some((line) => line.slice(3).trim() === "PLANNING.MD")) {
  failures.push("PLANNING.MD changed or staged");
}

if (failures.length > 0) {
  console.error("Merge/dedupe real migration readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Merge/dedupe real migration readiness check passed.");

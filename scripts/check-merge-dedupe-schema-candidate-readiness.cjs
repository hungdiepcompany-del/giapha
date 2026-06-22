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

const docPath = "docs/PLAN_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_READINESS.md";
const sqlPath = "scripts/merge-dedupe-schema-candidate.sql.draft";
const doc = readFile(docPath);
const sql = readFile(sqlPath);
const packageJson = readJson("package.json");
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const marker of [
  "A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_ONLY",
  "NOT_A_REAL_MIGRATION",
  "DO_NOT_APPLY_TO_ANY_DATABASE",
  "APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN_GRANTED_FOR_A11_CANDIDATE_ONLY",
  "REQUIRES_APPROVE_A11_MERGE_DEDUPE_SCHEMA_BEFORE_REAL_MIGRATION",
  "RUNTIME_MERGE_DEDUPE_REMAINS_CLOSED",
]) {
  requireIncludes(sql, marker, `SQL marker ${marker}`);
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
  requireIncludes(sql, `create table if not exists public.${table}`, `table ${table}`);
  requireIncludes(
    sql,
    `alter table public.${table} enable row level security`,
    `RLS ${table}`,
  );
}

for (const token of [
  "person_a_id",
  "person_b_id",
  "person_a_id < person_b_id",
  "source_person_id",
  "target_person_id",
  "source_person_id <> target_person_id",
  "confidence_level in ('strong', 'medium', 'weak')",
  "source_person_updated_at",
  "target_person_updated_at",
  "source_person_version_token",
  "target_person_version_token",
  "version_check_status",
  "conflict_review_status",
  "graph_validation_status",
  "graph_validation_result",
  "field_name",
  "source_value",
  "target_value",
  "resolution",
  "provenance_json",
  "'relationship', 'layout', 'membership_lineage'",
  "'visibility_privacy', 'export'",
  "before_json",
  "proposed_after_json",
  "requested_by",
  "requested_at",
  "approved_by",
  "approved_at",
  "executed_by",
  "executed_at",
  "field_impact",
  "relationship_impact",
  "layout_impact",
  "membership_lineage_impact",
  "visibility_privacy_impact",
  "export_impact",
  "source_person_snapshot",
  "target_person_snapshot",
  "relationships_snapshot",
  "layout_snapshot",
  "membership_lineage_snapshot",
  "visibility_privacy_snapshot",
  "revision_snapshot",
  "export_snapshot",
  "manifest_checksum",
  "approval_marker_code",
  "approval_granted_by",
  "approval_granted_at",
  "idempotency_key",
  "merge_dedupe_sessions_ready_state_check",
  "merge_dedupe_sessions_executed_state_check",
  "merge_dedupe_audit_events_session_merge_fk",
  "merge_dedupe_rollback_manifests_session_merge_fk",
  "references public.merge_dedupe_sessions(id, merge_id)",
  "merge_dedupe_rollback_manifests_verified_state_check",
  "merge_dedupe_rollback_manifests_used_state_check",
]) {
  requireIncludes(sql, token, `schema coverage ${token}`);
}

for (const pattern of [
  /\bdrop\s+table\b/i,
  /\bdrop\s+column\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\binsert\s+into\b/i,
  /\bupdate\s+public\./i,
  /\balter\s+table\b[^;\n]*(?:drop|rename|alter\s+column)\b/i,
  /\bcreate\s+(?:or\s+replace\s+)?(?:function|procedure)\b/i,
  /\bcreate\s+policy\b/i,
  /\binsert\s+into\s+public\.permissions\b/i,
  /\bpeople\.merge\.(?:suggest|review|approve|execute|rollback)\b/i,
  /\bsupabase\s+db\s+(?:push|reset)\b/i,
  /\bpsql\b/i,
]) {
  rejectPattern(sql, pattern, `SQL execution/runtime pattern ${pattern}`);
}

for (const token of [
  "# Plan A-11 - Merge/Dedupe Schema Candidate Readiness",
  "Status: `PASS_LOCAL_STATIC_CANDIDATE_NOT_APPLIED`",
  "## A-11A - Schema candidate design",
  "## A-11B - SQL draft",
  "## A-11C - Static checker",
  "## A-11D - Decision and handoff",
  "## A-11E - Validation",
  "## A-11F - Commit boundary",
  "APPROVE_A10_MERGE_DEDUPE_RUNTIME_DESIGN",
  "APPROVE_A11_MERGE_DEDUPE_SCHEMA",
  "APPROVE_A12_MERGE_DEDUPE_RUNTIME",
  "DB apply",
  "Runtime merge/dedupe remains closed",
]) {
  requireIncludes(doc, token, `A-11 doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_READINESS.md", "index entry"],
  [workLog, "A-11 Bundle - Merge/Dedupe Schema Candidate Readiness", "work log"],
  [handoff, "A-11 Bundle - Merge/Dedupe Schema Candidate Readiness", "handoff"],
  [decisionLog, "Decision 163 - A-11 remains schema candidate only", "Decision 163"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:merge-dedupe-schema-candidate-readiness"] !==
  "node scripts/check-merge-dedupe-schema-candidate-readiness.cjs"
) {
  failures.push("package.json missing A-11 checker script");
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
    failures.push("dependency drift in A-11");
  }
}

const migrationStatus = gitOutput(["status", "--short", "--", "db/migrations"]);
if (migrationStatus.trim()) failures.push(`real migration changed: ${migrationStatus.trim()}`);

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
  console.error("Merge/dedupe schema candidate readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Merge/dedupe schema candidate readiness check passed.");

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
  "REQUIRES_APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE_BEFORE_REAL_MIGRATION",
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
  "conflict_review_checksum",
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
  "merge_dedupe_sessions_version_tokens_not_blank",
  "merge_dedupe_sessions_idempotency_key_not_blank",
  "merge_dedupe_sessions_impact_checksum_not_blank",
  "merge_dedupe_sessions_conflict_checksum_not_blank",
  "merge_dedupe_sessions_approval_marker_not_blank",
  "merge_dedupe_sessions_graph_passed_result_check",
  "merge_dedupe_audit_events_reason_not_blank",
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
  /\bupdate\s+[^\s;]+/i,
  /\bmerge\s+into\b/i,
  /\bcopy\s+[^\s;]+/i,
  /\balter\s+table\b[^;\n]*(?:drop|rename|alter\s+column)\b/i,
  /\bcreate\s+(?:or\s+replace\s+)?(?:function|procedure)\b/i,
  /\bcreate\s+trigger\b/i,
  /\bcreate\s+policy\b/i,
  /\bgrant\s+/i,
  /\balter\s+default\s+privileges\b/i,
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
  "APPROVE_A11_MERGE_DEDUPE_SCHEMA_CANDIDATE",
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
for (const line of migrationStatus.split(/\r?\n/).filter(Boolean)) {
  const file = line.slice(3).trim().replaceAll("\\", "/");
  const approvedA12Path =
    "db/migrations/20260622_0009_merge_dedupe_schema_candidate.sql";
  const content = file === approvedA12Path ? readFile(file) : "";
  if (
    file !== approvedA12Path ||
    !content.includes("A12_MERGE_DEDUPE_REAL_MIGRATION_CANDIDATE") ||
    !content.includes("DO_NOT_APPLY_WITHOUT_APPROVE_A12_MERGE_DEDUPE_DB_APPLY")
  ) {
    failures.push(`unexpected real migration change: ${file}`);
  }
}

const allowedA14UiRuntimeFiles = new Set([
  "app/(admin)/admin/people/page.tsx",
  "app/(admin)/admin/relationships/page.tsx",
  "app/(admin)/admin/revisions/page.tsx",
  "app/(admin)/admin/system/status/page.tsx",
  "app/(admin)/admin/tree/edit/actions.ts",
  "app/(public)/people/[slug]/page.tsx",
  "app/auth/login/page.tsx",
  "app/globals.css",
  "components/auth/login-form.tsx",
  "components/imports/json-import-preview-form.tsx",
  "components/layout/admin-shell.tsx",
  "components/layout/public-shell.tsx",
  "components/people/person-form.tsx",
  "components/people/person-list.tsx",
  "components/public/public-home.tsx",
  "components/public/public-person-profile.tsx",
  "components/public/public-tree-shell.tsx",
  "components/relationships/couple-form.tsx",
  "components/relationships/relationship-form.tsx",
  "components/relationships/relationship-summary.tsx",
  "components/tree/family-node-card.tsx",
  "components/tree/family-tree-empty-state.tsx",
  "components/tree/family-tree-error-state.tsx",
  "components/tree/family-tree-toolbar.tsx",
  "components/tree/family-tree-viewer.tsx",
  "components/tree/tree-editor-side-panel.tsx",
  "components/tree/tree-editor-toolbar.tsx",
  "components/ui/action-link.tsx",
  "components/ui/empty-state.tsx",
  "components/ui/page-header.tsx",
  "components/ui/section-card.tsx",
  "app/(admin)/admin/page.tsx",
  "components/ui/status-callout.tsx",
]);

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
const unexpectedRuntimeStatus = runtimeStatus
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => !allowedA14UiRuntimeFiles.has(line.slice(3).trim().replaceAll("\\", "/")));
if (unexpectedRuntimeStatus.length > 0) {
  failures.push(`runtime/config drift: ${unexpectedRuntimeStatus.join("; ")}`);
}

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

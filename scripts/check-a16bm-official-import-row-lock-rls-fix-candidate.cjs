#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const dbMigrationPath =
  "db/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql";
const verifySqlPath =
  "db/checks/20260711_check_a16bm_official_import_row_lock_rls_fix.sql";
const docPath = "docs/PLAN_A16BM_OFFICIAL_IMPORT_ROW_LOCK_RLS_FIX_CANDIDATE.md";
const runbookPath = "docs/PLAN_A16BM_SQL_APPLY_VERIFY_RUNBOOK.md";
const checkerPath =
  "scripts/check-a16bm-official-import-row-lock-rls-fix-candidate.cjs";
const packagePath = "package.json";
const rpcMigrationPath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const stagingRlsPath =
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql";
const a16tPath =
  "supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function git(args) {
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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const dbMigration = read(dbMigrationPath);
const supabaseMigration = read(supabaseMigrationPath);
const verifySql = read(verifySqlPath);
const doc = read(docPath);
const runbook = read(runbookPath);
const checker = read(checkerPath);
const packageJson = readJson(packagePath);
const rpcMigration = read(rpcMigrationPath);
const stagingRls = read(stagingRlsPath);
const a16t = read(a16tPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

if (dbMigration !== supabaseMigration) {
  failures.push("db and supabase migration mirrors differ");
}

for (const token of [
  "A16BM_OFFICIAL_IMPORT_ROW_LOCK_RLS_FIX_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "NO_POST_OFFICIAL_IMPORT",
  "NO_IMPORT_RPC",
  "NO_SERVICE_ROLE_EXECUTION",
  "NO_SECURITY_DEFINER_SWITCH",
  "NO_RLS_DISABLE",
  "NO_ANON_OR_PUBLIC_GRANT",
  "PRESERVE_SELECT_FOR_UPDATE_CONCURRENCY_LOCK",
  "grant select, update on table public.import_sessions to authenticated;",
  "grant select, update on table public.import_write_manifests to authenticated;",
  "a16bm_import_sessions_update_official_import_owner_lock",
  "status = 'owner_approved_for_db_write'",
  "status = 'write_completed'",
  "a16bm_import_write_manifests_update_official_import_owner_lock",
  "status in ('owner_approved', 'ready_for_apply')",
  "from public.import_sessions owned_session",
  "owned_session.created_by = public.current_profile_id()",
]) {
  requireIncludes(dbMigration, token, `migration token ${token}`);
}

for (const token of [
  "A16BM_OFFICIAL_IMPORT_ROW_LOCK_RLS_FIX_SELECT_ONLY_VERIFY",
  "SQL_CHECK_STATUS=SELECT_ONLY",
  "authenticated_has_select_on_import_sessions",
  "authenticated_has_update_on_import_sessions",
  "authenticated_has_select_on_import_write_manifests",
  "authenticated_has_update_on_import_write_manifests",
  "import_sessions_rls_enabled",
  "import_write_manifests_rls_enabled",
  "existing_preview_policy_preserved",
  "new_import_sessions_official_update_policy_exists",
  "new_session_policy_includes_owner_approved_and_write_completed",
  "new_session_policy_owner_profile_scoped",
  "new_manifest_update_policy_exists",
  "new_manifest_policy_includes_required_states",
  "new_manifest_policy_parent_session_owner_scoped",
  "no_anon_or_public_policies",
  "no_anon_or_public_table_grants",
  "rpc_remains_security_invoker",
  "no_automatic_import_trigger",
  "a16bm_row_lock_rls_fix_verified",
]) {
  requireIncludes(verifySql, token, `verification SQL token ${token}`);
}

for (const token of [
  "A16BM_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED",
  "A16BM_ROOT_CAUSE=CONFIRMED_BY_OWNER_SELECT_ONLY_METADATA",
  "A16BM_A16R_RETRY_NEXT=NO",
  `A16BM_MIGRATION_CANDIDATE=${dbMigrationPath}`,
  `A16BM_SUPABASE_MIRROR=${supabaseMigrationPath}`,
  "A16BM_MIRROR_MATCH=BYTE_FOR_BYTE_REQUIRED_BY_CHECKER",
  `A16BM_VERIFICATION_SQL=${verifySqlPath}`,
  "A16BM_IMPORT_SESSIONS_POLICY_SCOPE=AUTHENTICATED_IMPORTS_CREATE_OWNER_PROFILE_APPROVED_ROW_OWNER_APPROVED_FOR_DB_WRITE_TO_WRITE_COMPLETED_ONLY",
  "A16BM_IMPORT_WRITE_MANIFESTS_POLICY_SCOPE=AUTHENTICATED_IMPORTS_CREATE_PARENT_SESSION_OWNER_SCOPED_OWNER_APPROVED_OR_READY_FOR_APPLY_TO_WRITE_COMPLETED_ONLY",
  "A16BM_GRANT_SCOPE=GRANT_SELECT_UPDATE_TO_AUTHENTICATED_ON_IMPORT_SESSIONS_AND_IMPORT_WRITE_MANIFESTS_ONLY",
  "A16BM_EXISTING_POLICIES_PRESERVED=YES_PREVIEW_STATE_POLICIES_NOT_REMOVED_OR_REPLACED",
  "A16BM_REAL_GENEALOGY_INSERT_RLS_REVIEW=INDEPENDENT_DOWNSTREAM_GRANT_RLS_RISK_NOT_CHANGED_IN_A16BM",
  "A16BM_BLOCKER=OWNER_REVIEW_AND_MANUAL_APPLY_VERIFY_REQUIRED_BEFORE_ANY_SEPARATE_RETRY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16BM_RUNBOOK_STATUS=OWNER_REVIEW_REQUIRED_NOT_APPLIED",
  "APPROVE_A16BM_APPLY_ROW_LOCK_RLS_FIX_CANDIDATE",
  "A16BM_RUNBOOK_POST_OFFICIAL_IMPORT_ALLOWED=NO",
  "A16BM_RUNBOOK_IMPORT_RPC_ALLOWED=NO",
  "A16BM_RUNBOOK_SELECT_FOR_UPDATE_ALLOWED=NO",
  "A16BM_NEXT_PHASE_AFTER_APPLY_VERIFY=A16BN_POST_APPLY_READ_ONLY_RLS_AND_DOWNSTREAM_RPC_RISK_RECONCILIATION_NO_IMPORT",
]) {
  requireIncludes(runbook, token, `runbook token ${token}`);
}

for (const [content, token, label] of [
  [rpcMigration, "security invoker", "RPC security invoker source"],
  [rpcMigration, "from public.import_sessions", "RPC locks import_sessions"],
  [rpcMigration, "from public.official_import_batches", "RPC locks official_import_batches"],
  [rpcMigration, "from public.import_write_manifests", "RPC locks import_write_manifests"],
  [rpcMigration, "set status = 'write_completed'", "RPC writes write_completed"],
  [stagingRls, "a16sql_import_sessions_update_own_preview", "preview update policy preserved source"],
  [a16t, "a16t_official_import_batches_update_own", "A16T batch update policy source"],
  [a16t, "a16t_official_import_rollback_insert_own", "A16T rollback insert policy source"],
  [index, "PLAN_A16BM_OFFICIAL_IMPORT_ROW_LOCK_RLS_FIX_CANDIDATE.md", "index A-16BM candidate"],
  [index, "PLAN_A16BM_SQL_APPLY_VERIFY_RUNBOOK.md", "index A-16BM runbook"],
  [workLog, "A-16BM - Official import row-lock RLS schema fix candidate", "work log A-16BM"],
  [decisionLog, "Decision 313 - A-16BM adds a not-applied row-lock RLS schema fix candidate", "decision A-16BM"],
  [handoff, "A16BM_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED", "handoff A-16BM"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16bm-official-import-row-lock-rls-fix-candidate"
  ] !== "node scripts/check-a16bm-official-import-row-lock-rls-fix-candidate.cjs"
) {
  failures.push("missing package A-16BM check script");
}

rejectPattern(dbMigration, /\bgrant\b[\s\S]{0,120}\bto\s+(anon|public)\b/i, "candidate must not grant anon/public");
rejectPattern(dbMigration, /\bcreate\s+policy\b[\s\S]{0,240}\bto\s+(anon|public)\b/i, "candidate must not create anon/public policy");
rejectPattern(dbMigration, /using\s*\(\s*true\s*\)|with\s+check\s*\(\s*true\s*\)/i, "candidate must not use broad true policy");
rejectPattern(dbMigration, /disable\s+row\s+level\s+security/i, "candidate must not disable RLS");
rejectPattern(dbMigration, /security\s+definer/i, "candidate must not add SECURITY DEFINER");
rejectPattern(dbMigration, /\bservice_role\b\s*=/i, "candidate must not configure service role");
rejectPattern(dbMigration, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "candidate must not invoke import RPC");
rejectPattern(dbMigration, /\b(insert|update|delete)\s+public\.(people|families|family_parents|family_children|couple_relationships|revisions)\b/i, "candidate must not write genealogy tables");

rejectPattern(verifySql, /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/im, "verification SQL must remain SELECT-only");
rejectPattern(verifySql, /\bfor\s+update\b/i, "verification SQL must not lock production rows");
rejectPattern(verifySql, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "verification SQL must not invoke import RPC");
rejectPattern(doc + runbook, /A16R_IMPORT_RETRY_NEXT=YES|A16BM_A16R_RETRY_NEXT=YES/i, "docs must keep A-16R retry NO");
rejectPattern(wrangler, /A16BM|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BM|official-import/i, "app layout must not change");
rejectPattern(doc + runbook + dbMigration + verifySql + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  dbMigrationPath,
  supabaseMigrationPath,
  verifySqlPath,
  docPath,
  runbookPath,
  checkerPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16bl-import-session-for-update-rls-lock-visibility-diagnosis.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16t-official-import-audit-rollback-idempotency-schema.cjs",
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden changed file ${file}`);
  }
  if (file.startsWith(".tmp/") || file.startsWith(".tmp\\")) {
    failures.push(`forbidden raw temp evidence file ${file}`);
  }
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`forbidden raw data/evidence file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16BM row-lock RLS fix candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BM row-lock RLS fix candidate check passed.");

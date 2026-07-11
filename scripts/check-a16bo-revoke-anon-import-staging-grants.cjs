#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const migration0018Db =
  "db/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql";
const migration0018Supabase =
  "supabase/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql";
const expected0018Sha =
  "7D62C16E201D452FD73B4E06C8F140361873C0C054A876EDDBFF28DD55FACC42";
const dbMigrationPath =
  "db/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260711_0019_a16bo_revoke_anon_import_staging_grants.sql";
const verifySqlPath =
  "db/checks/20260711_check_a16bo_revoke_anon_import_staging_grants_and_policy_scope.sql";
const docPath = "docs/PLAN_A16BO_REVOKE_ANON_IMPORT_STAGING_GRANTS.md";
const runbookPath = "docs/PLAN_A16BO_SQL_APPLY_VERIFY_RUNBOOK.md";
const checkerPath = "scripts/check-a16bo-revoke-anon-import-staging-grants.cjs";
const packagePath = "package.json";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readBuffer(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return Buffer.from("");
  }
  return fs.readFileSync(absolutePath);
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

function sha256Hex(relativePath) {
  return crypto.createHash("sha256").update(readBuffer(relativePath)).digest("hex").toUpperCase();
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

const migration0018DbSql = read(migration0018Db);
const migration0018SupabaseSql = read(migration0018Supabase);
const dbMigration = read(dbMigrationPath);
const supabaseMigration = read(supabaseMigrationPath);
const verifySql = read(verifySqlPath);
const doc = read(docPath);
const runbook = read(runbookPath);
const checker = read(checkerPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

if (sha256Hex(migration0018Db) !== expected0018Sha) {
  failures.push("db migration 0018 SHA256 changed");
}
if (sha256Hex(migration0018Supabase) !== expected0018Sha) {
  failures.push("supabase migration 0018 SHA256 changed");
}
if (migration0018DbSql !== migration0018SupabaseSql) {
  failures.push("migration 0018 mirrors differ");
}
if (dbMigration !== supabaseMigration) {
  failures.push("db and supabase migration 0019 mirrors differ");
}

for (const token of [
  "A16BO_REVOKE_ANON_IMPORT_STAGING_GRANTS",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "NO_POST_OFFICIAL_IMPORT",
  "NO_IMPORT_RPC",
  "NO_POLICY_CHANGE",
  "NO_RLS_CHANGE",
  "revoke all privileges on table public.import_sessions from anon;",
  "revoke all privileges on table public.import_sessions from public;",
  "revoke all privileges on table public.import_write_manifests from anon;",
  "revoke all privileges on table public.import_write_manifests from public;",
]) {
  requireIncludes(dbMigration, token, `migration 0019 token ${token}`);
}

for (const token of [
  "A16BO_REVOKE_ANON_IMPORT_STAGING_GRANTS_SELECT_ONLY_VERIFY",
  "SQL_CHECK_STATUS=SELECT_ONLY",
  "regexp_replace",
  "normalized_qual",
  "normalized_with_check",
  "lower(grantee) in ('anon', 'public')",
  "forbidden_anon_public_table_grant_count",
  "forbidden_anon_public_policy_count",
  "no_anon_or_public_table_grants",
  "no_anon_or_public_policies",
  "authenticated_has_select_on_import_sessions",
  "authenticated_has_update_on_import_sessions",
  "authenticated_has_select_on_import_write_manifests",
  "authenticated_has_update_on_import_write_manifests",
  "a16bm_import_sessions_policy_exists",
  "a16bm_import_write_manifests_policy_exists",
  "a16bm_session_policy_semantics_pass",
  "a16bm_manifest_policy_semantics_pass",
  "created_by = current_profile_id()",
  "approved_by = current_profile_id()",
  "has_permission(''imports.create'')",
  "owner_approved_for_db_write",
  "owner_approved",
  "ready_for_apply",
  "write_completed",
  "from import_sessions owned_session",
  "rpc_remains_security_invoker",
  "no_automatic_import_trigger",
  "a16bo_revoke_anon_import_staging_grants_verified",
]) {
  requireIncludes(verifySql, token, `verification SQL token ${token}`);
}

for (const token of [
  "A16BO_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED",
  `A16BO_MIGRATION_0018_IMMUTABLE_SHA256=${expected0018Sha}`,
  "A16BO_FORBIDDEN_ANON_GRANT_STATUS=CONFIRMED_14_PENDING_REVOKE",
  "A16BO_A16BM_POLICIES_SEMANTIC_STATUS=PASS_PRODUCTION_METADATA_CONFIRMED",
  `A16BO_MIGRATION_0019=${dbMigrationPath}`,
  `A16BO_SUPABASE_MIRROR=${supabaseMigrationPath}`,
  "A16BO_MIRROR_MATCH=BYTE_FOR_BYTE_REQUIRED_BY_CHECKER",
  `A16BO_VERIFICATION_SQL=${verifySqlPath}`,
  "A16BO_ANON_REVOKE_SCOPE=REVOKE_ALL_PRIVILEGES_ON_IMPORT_SESSIONS_AND_IMPORT_WRITE_MANIFESTS_FROM_ANON",
  "A16BO_PUBLIC_REVOKE_SCOPE=REVOKE_ALL_PRIVILEGES_ON_IMPORT_SESSIONS_AND_IMPORT_WRITE_MANIFESTS_FROM_PUBLIC",
  "A16BO_AUTHENTICATED_GRANTS_PRESERVED=SELECT_UPDATE_ON_IMPORT_SESSIONS_AND_IMPORT_WRITE_MANIFESTS",
  "A16BO_POLICIES_UNCHANGED=YES_NO_ALTER_DROP_CREATE_POLICY",
  "A16BO_POLICY_VERIFICATION_NORMALIZATION=PG_POLICIES_DEPARSE_TOLERANT_NO_PUBLIC_PREFIX_NO_IN_TEXT_DEPENDENCY",
  "A16BO_BLOCKER=OWNER_REVIEW_AND_MANUAL_APPLY_VERIFY_REQUIRED_BEFORE_ANY_SEPARATE_RETRY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16BO_RUNBOOK_STATUS=OWNER_REVIEW_REQUIRED_NOT_APPLIED",
  "APPROVE_A16BO_APPLY_REVOKE_ANON_IMPORT_STAGING_GRANTS",
  "A16BO_RUNBOOK_POST_OFFICIAL_IMPORT_ALLOWED=NO",
  "A16BO_RUNBOOK_IMPORT_RPC_ALLOWED=NO",
  "A16BO_RUNBOOK_SELECT_FOR_UPDATE_ALLOWED=NO",
  "A16BO_RUNBOOK_SUPABASE_DB_PUSH_ALLOWED=NO",
  "A16BO_EXPECTED_POST_APPLY_VERIFY=a16bo_revoke_anon_import_staging_grants_verified_TRUE",
  "A16BO_NEXT_PHASE_AFTER_APPLY_VERIFY=A16BP_POST_APPLY_READ_ONLY_RECONCILIATION_NO_IMPORT",
]) {
  requireIncludes(runbook, token, `runbook token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16BO_REVOKE_ANON_IMPORT_STAGING_GRANTS.md", "index A-16BO plan"],
  [index, "PLAN_A16BO_SQL_APPLY_VERIFY_RUNBOOK.md", "index A-16BO runbook"],
  [workLog, "A-16BO - Post-apply anon grant hardening and policy deparser verification", "work log A-16BO"],
  [decisionLog, "Decision 315 - A-16BO revokes anonymous import staging grants without changing policies", "decision A-16BO"],
  [handoff, "A16BO_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED", "handoff A-16BO"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16bo-revoke-anon-import-staging-grants"] !==
  "node scripts/check-a16bo-revoke-anon-import-staging-grants.cjs"
) {
  failures.push("missing package A-16BO check script");
}

rejectPattern(dbMigration, /\b(alter|create|drop)\s+policy\b/i, "migration 0019 must not alter/create/drop policies");
rejectPattern(dbMigration, /\b(row\s+level\s+security|enable\s+row|disable\s+row)\b/i, "migration 0019 must not change RLS");
rejectPattern(dbMigration, /\bgrant\b/i, "migration 0019 must not add grants");
rejectPattern(dbMigration, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "migration 0019 must not invoke import RPC");
rejectPattern(dbMigration, /\b(insert|update|delete|truncate)\s+public\.(people|families|family_parents|family_children|couple_relationships|revisions)\b/i, "migration 0019 must not write genealogy tables");

rejectPattern(verifySql, /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/im, "verification SQL must remain SELECT-only");
rejectPattern(verifySql, /\bfor\s+update\b/i, "verification SQL must not lock production rows");
rejectPattern(verifySql, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "verification SQL must not invoke import RPC");
rejectPattern(verifySql, /public\.current_profile_id\(\)/i, "verification SQL must not require public.current_profile_id textual prefix");
rejectPattern(verifySql, /from\s+public\.import_sessions\s+owned_session/i, "verification SQL must not require public.import_sessions textual prefix");
rejectPattern(verifySql, /status\s+in\s*\(/i, "verification SQL must not depend on IN text remaining unchanged");
rejectPattern(doc + runbook + workLog + handoff, /A16R_IMPORT_RETRY_NEXT=YES|A16BO_A16R_RETRY_NEXT=YES/i, "docs must keep A-16R retry NO");
rejectPattern(wrangler, /A16BO|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BO|official-import/i, "app layout must not change");
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
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === migration0018Db || file === migration0018Supabase) {
    failures.push(`migration 0018 must remain immutable: ${file}`);
  }
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
  console.error("A-16BO revoke anon import staging grants check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BO revoke anon import staging grants check passed.");

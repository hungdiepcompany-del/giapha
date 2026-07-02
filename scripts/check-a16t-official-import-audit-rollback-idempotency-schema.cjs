const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA.md";
const runbookDocPath = "docs/PLAN_A16T_SCHEMA_APPLY_VERIFY_RUNBOOK.md";
const requirementsDocPath = "docs/PLAN_A16T_A16U_TRANSACTION_BRANCH_REQUIREMENTS.md";
const applyVerifyDocPath = "docs/PLAN_A16T_APPLY_VERIFY.md";
const dbMigrationPath =
  "db/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";
const verifySqlPath =
  "db/checks/20260702_check_a16t_official_import_audit_rollback_idempotency_schema.sql";
const grantFixDocPath = "docs/PLAN_A16T_GRANT_RLS_HARDENING_FIX.md";
const grantFixDbMigrationPath =
  "db/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql";
const grantFixSupabaseMigrationPath =
  "supabase/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql";
const grantFixVerifySqlPath = "db/checks/20260702_check_a16t_grant_rls_hardening_fix.sql";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";

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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
const runbookDoc = readFile(runbookDocPath);
const requirementsDoc = readFile(requirementsDocPath);
const dbMigration = readFile(dbMigrationPath);
const supabaseMigration = readFile(supabaseMigrationPath);
const verifySql = readFile(verifySqlPath);
const packageJson = readJson(packagePath);
const service = readFile(servicePath);
const panel = readFile(panelPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16T-OFFICIAL-IMPORT-AUDIT-ROLLBACK-IDEMPOTENCY-SCHEMA",
  "A16T_STATUS=CANDIDATE_READY_NOT_APPLIED",
  "A16T_SQL_CANDIDATE_CREATED=YES",
  dbMigrationPath,
  supabaseMigrationPath,
  "A16T_SQL_MIRROR_BYTE_FOR_BYTE=PASS",
  verifySqlPath,
  "A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "DO_NOT_RUN_AUTOMATICALLY",
  "OWNER_MANUAL_REVIEW_REQUIRED",
  "A16T_REVISION_ACTION_STRATEGY=SEPARATE_OFFICIAL_IMPORT_BATCH_TABLE",
  "A16T_AUDIT_BATCH_PERSISTENCE=YES",
  "A16T_AUDIT_BATCH_TABLE=official_import_batches",
  "A16T_ROLLBACK_MANIFEST_PERSISTENCE=YES",
  "A16T_ROLLBACK_MANIFEST_TABLE=official_import_rollback_manifests",
  "A16T_IDEMPOTENCY_GUARD=YES",
  "A16T_IDEMPOTENCY_KEY=import_session_id",
  "A16T_RLS_ENABLED=YES",
  "A16T_NO_ANON_PUBLIC_GRANT=YES",
  "A16T_NO_BROAD_GRANT=YES",
  "A16T_NO_RLS_DISABLE=YES",
  "A16T_RUNTIME_FAIL_CLOSED=YES",
  "A16T_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16T_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16T_RPC_CALLED=NO",
  "A16T_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16T_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16T_SCHEMA_APPLY_VERIFY_STATUS=READY_FOR_OWNER_REVIEW_NOT_APPLIED",
  "A16T_A16U_REQUIREMENTS_STATUS=READY_FOR_A16U_AFTER_SCHEMA_APPLY_VERIFY",
]) {
  requireIncludes(runbookDoc + requirementsDoc, token, `paired doc token ${token}`);
}

if (dbMigration !== supabaseMigration) {
  failures.push("A-16T db/supabase migration mirror mismatch");
}

for (const token of [
  "A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "official_import_batches",
  "official_import_rollback_manifests",
  "unique index if not exists official_import_batches_import_session_unique_idx",
  "unique index if not exists official_import_batches_idempotency_key_unique_idx",
  "idempotency_key = import_session_id::text",
  "rollback_manifest_count",
  "audit_record_count",
  "alter table public.official_import_batches enable row level security",
  "alter table public.official_import_rollback_manifests enable row level security",
  "to authenticated",
  "public.has_permission('imports.create')",
  "public.current_profile_id()",
  "NO_ANON_OR_PUBLIC_GRANT",
  "NO_BROAD_GRANT",
  "NO_RLS_DISABLE",
]) {
  requireIncludes(dbMigration, token, `migration token ${token}`);
}

rejectPattern(dbMigration, /\b(drop\s+table|truncate\s+table|delete\s+from)\b/i, "destructive data/schema operation");
rejectPattern(dbMigration, /\bgrant\s+(select|insert|update|delete|all|usage|execute)\b/i, "grant statement");
rejectPattern(dbMigration, /\bto\s+(anon|public)\b/i, "anon/public policy target");
rejectPattern(dbMigration, /disable\s+row\s+level\s+security/i, "RLS disable");
rejectPattern(dbMigration, /security\s+definer/i, "SECURITY DEFINER");
rejectPattern(dbMigration, /create\s+(or\s+replace\s+)?function/i, "function/RPC creation");
rejectPattern(dbMigration, /create\s+trigger/i, "auto import trigger");

for (const token of [
  "SELECT_ONLY_VERIFICATION",
  "A16T_TABLES_EXIST",
  "A16T_IDEMPOTENCY_UNIQUE_GUARD_EXISTS",
  "A16T_ROLLBACK_MANIFEST_UNIQUE_GUARD_EXISTS",
  "A16T_RLS_ENABLED",
  "A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT",
  "A16T_NO_AUTO_IMPORT_TRIGGER",
]) {
  requireIncludes(verifySql, token, `verify SQL token ${token}`);
}
rejectPattern(
  verifySql,
  /^\s*(insert|update|delete|create|alter|drop|truncate|grant|revoke)\b/im,
  "verification SQL must be SELECT-only",
);

if (
  packageJson?.scripts?.["check:a16t-official-import-audit-rollback-idempotency-schema"] !==
  "node scripts/check-a16t-official-import-audit-rollback-idempotency-schema.cjs"
) {
  failures.push("missing package script check:a16t-official-import-audit-rollback-idempotency-schema");
}

for (const [content, token, label] of [
  [index, "PLAN_A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA.md", "index A-16T schema entry"],
  [workLog, "A16T_STATUS=CANDIDATE_READY_NOT_APPLIED", "work log A-16T status"],
  [decisionLog, "Decision 235", "decision log A-16T entry"],
  [handoff, "A16T_STATUS=CANDIDATE_READY_NOT_APPLIED", "handoff A-16T status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA_MARKER",
  "A16T_SCHEMA_CANDIDATE_NOT_APPLIED_BLOCKER",
  "A16T_BLOCKED_SCHEMA_CANDIDATE_NOT_APPLIED",
  "status: \"BLOCKED\"",
  "canRunOfficialImport: false",
  "importedPeopleCount: 0",
  "importedRelationshipCount: 0",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of ["disabled", "aria-disabled=\"true\""]) {
  requireIncludes(panel, token, `official button disabled token ${token}`);
}

rejectPattern(service, /\.rpc\s*\(/i, "official import service must not call RPC");
rejectPattern(
  service,
  /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
  "official import service must not write real genealogy tables",
);

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  runbookDocPath,
  requirementsDocPath,
  dbMigrationPath,
  supabaseMigrationPath,
  verifySqlPath,
  "scripts/check-a16t-official-import-audit-rollback-idempotency-schema.cjs",
  "scripts/check-a16t-schema-apply-verify-runbook.cjs",
  "scripts/check-a16t-a16u-transaction-branch-requirements.cjs",
  applyVerifyDocPath,
  "scripts/check-a16t-apply-verify.cjs",
  grantFixDocPath,
  grantFixDbMigrationPath,
  grantFixSupabaseMigrationPath,
  grantFixVerifySqlPath,
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  servicePath,
  "scripts/check-a16s-official-import-transaction-execution-branch.cjs",
  "scripts/check-a16s-transaction-audit-rollback-idempotency-contract.cjs",
  "scripts/check-a16s-sql-apply-verify-runbook.cjs",
  "CHECK_CLOUDFLARE_ACCOUNT.bat",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not change");
  if (file.startsWith("supabase/.temp/")) failures.push(`supabase temp must not change ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`spreadsheet/csv must not change ${file}`);
}

const stagedFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`staged data file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16T audit/rollback/idempotency schema check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16T audit/rollback/idempotency schema check passed.");

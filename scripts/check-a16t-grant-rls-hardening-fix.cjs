const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16T_GRANT_RLS_HARDENING_FIX.md";
const applyVerifyDocPath = "docs/PLAN_A16T_APPLY_VERIFY.md";
const dbMigrationPath =
  "db/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql";
const verifySqlPath = "db/checks/20260702_check_a16t_grant_rls_hardening_fix.sql";
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
const applyVerifyDoc = readFile(applyVerifyDocPath);
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
  "A-16T-GRANT-RLS-HARDENING-FIX",
  "A16T_GRANT_RLS_HARDENING_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED",
  "A16T_TABLES_EXIST=PASS",
  "A16T_RLS_ENABLED=PASS",
  "A16T_AUTHENTICATED_POLICIES_EXIST=PASS",
  "A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT=FAIL",
  "A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT_DETAILS={\"forbidden_grant_count\":14,\"forbidden_policy_count\":0}",
  dbMigrationPath,
  supabaseMigrationPath,
  "A16T_GRANT_RLS_HARDENING_FIX_SQL_MIRROR_BYTE_FOR_BYTE=PASS",
  verifySqlPath,
  "A16T_GRANT_RLS_HARDENING_FIX_REVOKE_ANON_PUBLIC_COVERED=YES",
  "A16T_GRANT_RLS_HARDENING_FIX_AUTHENTICATED_POLICIES_PRESERVED=YES",
  "A16T_GRANT_RLS_HARDENING_FIX_NO_NEW_GRANT=YES",
  "A16T_GRANT_RLS_HARDENING_FIX_RUNTIME_FAIL_CLOSED=YES",
  "A16T_GRANT_RLS_HARDENING_FIX_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16T_GRANT_RLS_HARDENING_FIX_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16T_GRANT_RLS_HARDENING_FIX_RPC_CALLED=NO",
  "A16T_GRANT_RLS_HARDENING_FIX_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16T_GRANT_RLS_HARDENING_FIX_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16T_GRANT_RLS_HARDENING_FIX_SQL_RUN_STATUS=NOT_RUN",
  "A16T_GRANT_RLS_HARDENING_FIX_DB_PUSH_STATUS=NOT_RUN",
  "A16T_GRANT_RLS_HARDENING_FIX_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16T_GRANT_RLS_HARDENING_FIX_SEED_STATUS=NOT_RUN",
  "A16T_GRANT_RLS_HARDENING_FIX_DEPLOY_STATUS=NOT_DEPLOYED",
  "A16T_GRANT_RLS_HARDENING_FIX_PUSH_STATUS=NOT_PUSHED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16T_GRANT_RLS_HARDENING_FIX_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "DO_NOT_RUN_AUTOMATICALLY",
  "OWNER_MANUAL_REVIEW_REQUIRED",
  "revoke all on table public.official_import_batches from anon;",
  "revoke all on table public.official_import_batches from public;",
  "revoke all on table public.official_import_rollback_manifests from anon;",
  "revoke all on table public.official_import_rollback_manifests from public;",
]) {
  requireIncludes(dbMigration, token, `migration token ${token}`);
}

if (dbMigration !== supabaseMigration) {
  failures.push("A-16T grant/RLS hardening db/supabase migration mirror mismatch");
}

rejectPattern(dbMigration, /^\s*grant\b/im, "grant statement");
rejectPattern(dbMigration, /^\s*(drop|truncate|delete|insert|update)\b/im, "data/destructive statement");
rejectPattern(dbMigration, /disable\s+row\s+level\s+security/i, "RLS disable");
rejectPattern(dbMigration, /\.rpc\s*\(/i, "RPC call");
rejectPattern(dbMigration, /official-import/i, "POST official import wording");
rejectPattern(dbMigration, /create\s+(or\s+replace\s+)?function/i, "function/RPC creation");
rejectPattern(dbMigration, /create\s+trigger/i, "auto import trigger");

for (const token of [
  "SELECT_ONLY_VERIFICATION",
  "A16T_GRANT_FIX_NO_ANON_PUBLIC_TABLE_GRANTS",
  "A16T_GRANT_FIX_NO_ANON_PUBLIC_SEQUENCE_GRANTS",
  "A16T_GRANT_FIX_NO_ANON_PUBLIC_POLICIES",
  "A16T_GRANT_FIX_RLS_STILL_ENABLED",
  "A16T_GRANT_FIX_AUTHENTICATED_POLICIES_STILL_EXIST",
  "A16T_GRANT_FIX_NO_AUTO_IMPORT_TRIGGER",
  "A16T_GRANT_FIX_RPC_EXECUTION_STILL_NOT_PUBLIC",
]) {
  requireIncludes(verifySql, token, `verify SQL token ${token}`);
}
rejectPattern(
  verifySql,
  /^\s*(insert|update|delete|create|alter|drop|truncate|grant|revoke)\b/im,
  "verification SQL must be SELECT-only",
);

if (
  !applyVerifyDoc.includes(
    "A16T_APPLY_VERIFY_STATUS=BLOCKED_NO_ANON_PUBLIC_GRANT_FAILED_PENDING_HARDENING_FIX",
  ) &&
  !applyVerifyDoc.includes(
    "A16T_APPLY_VERIFY_STATUS=BLOCKED_VERIFY_EVIDENCE_INSUFFICIENT_OR_FAILED",
  ) &&
  !applyVerifyDoc.includes(
    "A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED",
  )
) {
  failures.push("missing apply verify doc blocked status");
}

if (
  packageJson?.scripts?.["check:a16t-grant-rls-hardening-fix"] !==
  "node scripts/check-a16t-grant-rls-hardening-fix.cjs"
) {
  failures.push("missing package script check:a16t-grant-rls-hardening-fix");
}

for (const [content, token, label] of [
  [index, "PLAN_A16T_GRANT_RLS_HARDENING_FIX.md", "index A-16T grant fix entry"],
  [workLog, "A16T_GRANT_RLS_HARDENING_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED", "work log A-16T grant fix status"],
  [decisionLog, "Decision 238", "decision log A-16T grant fix entry"],
  [handoff, "A16T_GRANT_RLS_HARDENING_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED", "handoff A-16T grant fix status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
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

for (const [content, label] of [
  [doc, docPath],
  [dbMigration, dbMigrationPath],
  [verifySql, verifySqlPath],
  [readFile("scripts/check-a16t-grant-rls-hardening-fix.cjs"), "scripts/check-a16t-grant-rls-hardening-fix.cjs"],
]) {
  rejectPattern(content, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, `${label} secret assignment`);
  rejectPattern(content, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, `${label} secret-like token`);
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  applyVerifyDocPath,
  dbMigrationPath,
  supabaseMigrationPath,
  verifySqlPath,
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16t-official-import-audit-rollback-idempotency-schema.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "docs/PLAN_A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH.md",
  "docs/PLAN_A16U_LOCKED_RUNTIME_WIRING.md",
  "docs/PLAN_A16U_VERIFY_RUNBOOK.md",
  "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE.md",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs",
  servicePath,
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "CHECK_CLOUDFLARE_ACCOUNT.bat",
  "GUARD.bat",
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
  console.error("A-16T grant/RLS hardening fix check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16T grant/RLS hardening fix check passed.");

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16T_APPLY_VERIFY.md";
const schemaDocPath = "docs/PLAN_A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA.md";
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
const schemaDoc = readFile(schemaDocPath);
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
  "A-16T-APPLY-VERIFY",
  "A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED",
  "A16T_BASELINE_COMMIT=fa8a21d",
  "A16T_BASELINE_STATUS=A16T_STATUS=CANDIDATE_READY_NOT_APPLIED",
  dbMigrationPath,
  supabaseMigrationPath,
  verifySqlPath,
  "A16T_GRANT_RLS_HARDENING_FIX_SQL_CANDIDATE_PATH=db/migrations/20260702_0015_a16t_grant_rls_hardening_fix_candidate.sql",
  "A16T_PASS_TO_A16U_BUNDLE_STATUS=PASS_A16T_VERIFIED_A16U_LOCKED_BRANCH_READY",
  "A16T_OWNER_APPLY_EVIDENCE_STATUS=PASS_OWNER_MANUAL_APPLY_REPORTED",
  "A16T_OWNER_VERIFY_EVIDENCE_STATUS=PASS_OWNER_VERIFICATION_OUTPUT_PROVIDED",
  "A16T_OWNER_VERIFICATION_RESULT=PASS",
  "A16T_OWNER_EVIDENCE_PLACEHOLDER_DETECTED=NO",
  "A16T_APPLY_VERIFY_DO_NOT_FAKE_PASS=YES",
  "official_import_batches",
  "official_import_rollback_manifests",
  "idempotency unique guard",
  "idempotency_key",
  "A16T_TABLES_EXIST=PASS",
  "A16T_BATCH_REQUIRED_COLUMNS_EXIST=PASS",
  "A16T_ROLLBACK_REQUIRED_COLUMNS_EXIST=PASS",
  "A16T_IDEMPOTENCY_UNIQUE_GUARD_EXISTS=PASS",
  "A16T_ROLLBACK_MANIFEST_UNIQUE_GUARD_EXISTS=PASS",
  "A16T_RLS_ENABLED=PASS",
  "A16T_AUTHENTICATED_POLICIES_EXIST=PASS",
  "A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT=PASS",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BATCHES_VERIFIED=YES",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_ROLLBACK_MANIFESTS_VERIFIED=YES",
  "A16T_APPLY_VERIFY_IDEMPOTENCY_GUARD_VERIFIED=YES",
  "A16T_APPLY_VERIFY_IDEMPOTENCY_KEY_VERIFIED=YES",
  "A16T_APPLY_VERIFY_RLS_ENABLED_VERIFIED=YES",
  "A16T_APPLY_VERIFY_AUTHENTICATED_POLICIES_VERIFIED=YES",
  "A16T_APPLY_VERIFY_NO_ANON_PUBLIC_VERIFIED=YES",
  "A16T_APPLY_VERIFY_FORBIDDEN_GRANT_COUNT=0",
  "A16T_APPLY_VERIFY_FORBIDDEN_POLICY_COUNT=0",
  "A16T_APPLY_VERIFY_NO_AUTO_IMPORT_TRIGGER_VERIFIED=YES",
  "A16T_APPLY_VERIFY_RUNTIME_FAIL_CLOSED=YES",
  "A16T_APPLY_VERIFY_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16T_APPLY_VERIFY_RPC_CALLED=NO",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16T_APPLY_VERIFY_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED",
  "A16U_SQL_CANDIDATE_REQUIRED=NO",
  "A16U_SQL_CANDIDATE_CREATED=NO",
  "A16U_SQL_CANDIDATE_PATH=N/A_SQL_NOT_REQUIRED_A16T_SCHEMA_VERIFIED",
  "A16U_SQL_MIRROR_BYTE_FOR_BYTE=N/A_SQL_NOT_REQUIRED_A16T_SCHEMA_VERIFIED",
  "A16T_GRANT_RLS_HARDENING_FIX_STATUS=CANDIDATE_READY_NOT_APPLIED",
  "A16T_APPLY_VERIFY_SQL_RUN_BY_CODEX=NO",
  "A16T_APPLY_VERIFY_DB_PUSH_STATUS=NOT_RUN",
  "A16T_APPLY_VERIFY_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16T_APPLY_VERIFY_SEED_STATUS=NOT_RUN",
  "A16T_APPLY_VERIFY_DEPLOY_STATUS=NOT_DEPLOYED",
  "A16T_APPLY_VERIFY_PUSH_STATUS=NOT_PUSHED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

const currentStatus = doc.match(/^Status:\s+`([^`]+)`/m)?.[1] ?? "";
if (currentStatus === "A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED") {
  for (const token of [
    "A16T_OWNER_APPLY_EVIDENCE_STATUS=PASS_OWNER_MANUAL_APPLY_REPORTED",
    "A16T_OWNER_VERIFY_EVIDENCE_STATUS=PASS_OWNER_VERIFICATION_OUTPUT_PROVIDED",
    "A16T_OWNER_VERIFICATION_RESULT=PASS",
    "A16T_OWNER_EVIDENCE_PLACEHOLDER_DETECTED=NO",
    "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BATCHES_VERIFIED=YES",
    "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_ROLLBACK_MANIFESTS_VERIFIED=YES",
    "A16T_APPLY_VERIFY_IDEMPOTENCY_GUARD_VERIFIED=YES",
    "A16T_APPLY_VERIFY_NO_ANON_PUBLIC_VERIFIED=YES",
    "A16T_APPLY_VERIFY_FORBIDDEN_GRANT_COUNT=0",
    "A16T_APPLY_VERIFY_FORBIDDEN_POLICY_COUNT=0",
    "A16T_APPLY_VERIFY_NO_AUTO_IMPORT_TRIGGER_VERIFIED=YES",
  ]) {
    requireIncludes(doc, token, `PASS evidence token ${token}`);
  }
} else if (
  !doc.includes("A16T_OWNER_APPLY_EVIDENCE_STATUS=CLAIMED_WITHOUT_VERIFICATION_OUTPUT")
) {
  failures.push("missing explicit owner evidence status for non-PASS state");
}

requireIncludes(schemaDoc, "A16T_STATUS=CANDIDATE_READY_NOT_APPLIED", "A-16T baseline status");
if (dbMigration !== supabaseMigration) {
  failures.push("A-16T db/supabase migration mirror mismatch");
}
requireIncludes(verifySql, "SELECT_ONLY_VERIFICATION", "verification SQL remains SELECT-only");

if (
  packageJson?.scripts?.["check:a16t-apply-verify"] !==
  "node scripts/check-a16t-apply-verify.cjs"
) {
  failures.push("missing package script check:a16t-apply-verify");
}

for (const [content, token, label] of [
  [index, "PLAN_A16T_APPLY_VERIFY.md", "index A-16T apply verify entry"],
  [workLog, "A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED", "work log A-16T apply verify status"],
  [decisionLog, "Decision 240", "decision log A-16U latest entry"],
  [handoff, "A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED", "handoff A-16T apply verify status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
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

for (const [content, label] of [
  [doc, docPath],
  [readFile("scripts/check-a16t-apply-verify.cjs"), "scripts/check-a16t-apply-verify.cjs"],
]) {
  rejectPattern(content, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, `${label} secret assignment`);
  rejectPattern(content, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, `${label} secret-like token`);
  rejectPattern(content, /fetch\s*\([^)]*official-import/i, `${label} POST official import call`);
  rejectPattern(content, /\.rpc\s*\(/i, `${label} RPC call`);
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  "scripts/check-a16t-apply-verify.cjs",
  packagePath,
  "docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md",
  "scripts/check-a16r-github-actions-linux-deploy-smoke.cjs",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "docs/PLAN_A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE.md",
  "scripts/check-a16r-authenticated-official-import-gate-smoke.cjs",
  "docs/PLAN_A16R_AUTHENTICATED_OWNER_IMPORT_GATE_SMOKE_RETRY.md",
  "scripts/check-a16r-authenticated-owner-import-gate-smoke-retry.cjs",
  "docs/PLAN_A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS.md",
  "scripts/check-a16r-owner-admin-import-permission-diagnosis.cjs",
  "docs/PLAN_A16R_OWNER_AUTH_GATE_SMOKE_AND_EVIDENCE_BUNDLE.md",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16t-official-import-audit-rollback-idempotency-schema.cjs",
  grantFixDocPath,
  grantFixDbMigrationPath,
  grantFixSupabaseMigrationPath,
  grantFixVerifySqlPath,
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
  "docs/PLAN_A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH.md",
  "docs/PLAN_A16U_LOCKED_RUNTIME_WIRING.md",
  "docs/PLAN_A16U_VERIFY_RUNBOOK.md",
  "docs/PLAN_A16U_PRODUCTION_IMPORT_UI_DEPLOY_SMOKE.md",
  "docs/PLAN_A16U_PRODUCTION_IMPORT_UI_POST_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_RUN_RETRY_OFFICIAL_IMPORT_BUNDLE.md",
  "docs/PLAN_A16R_RUN_RETRY_POST_IMPORT_VERIFY.md",
  "docs/PLAN_A16R_AFTER_A16V_OFFICIAL_IMPORT_EXECUTION_BUNDLE.md",
  "docs/PLAN_A16R_AFTER_A16V_POST_IMPORT_VERIFY.md",
  "docs/PLAN_A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION.md",
  "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE.md",
  "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW.md",
  "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY.md",
  "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md",
  "docs/PLAN_A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE.md",
  "docs/PLAN_A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH.md",
  "docs/PLAN_A16V_SQL_APPLY_VERIFY_RUNBOOK.md",
  "docs/PLAN_A16V_A16R_EXECUTION_RETRY_REQUIREMENTS.md",
  "docs/PLAN_A16V_MARKER_VERIFICATION_FIX.md",
  "docs/PLAN_A16V_APPLY_VERIFY.md",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "scripts/check-a16u-production-import-ui-deploy-smoke.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
  "scripts/check-a16v-sql-apply-verify-runbook.cjs",
  "scripts/check-a16v-a16r-execution-retry-requirements.cjs",
  "scripts/check-a16v-marker-verification-fix.cjs",
  "scripts/check-a16v-apply-verify.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs",
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql",
  "db/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql",
  "supabase/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql",
  "scripts/check-a16u-production-import-ui-post-deploy-smoke.cjs",
  "scripts/check-a16r-run-retry-official-import-bundle.cjs",
  "scripts/check-a16r-run-retry-post-import-verify.cjs",
  "scripts/check-a16r-after-a16v-official-import-execution-bundle.cjs",
  "scripts/check-a16r-after-a16v-post-import-verify.cjs",
  "scripts/check-a16v-production-runtime-evidence-reconciliation.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  servicePath,
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "components/imports/import-session-manifest-panel.tsx",
  "CHECK_CLOUDFLARE_ACCOUNT.bat",
  "GUARD.bat",
  "GIA_PHA_GITHUB_MENU.bat",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not change");
  if (
    file.startsWith("db/migrations/") &&
    file !== grantFixDbMigrationPath &&
    file !== "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql" &&
    file !== "db/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql"
  ) {
    failures.push(`migration must not change in A-16T-APPLY-VERIFY ${file}`);
  }
  if (
    file.startsWith("supabase/migrations/") &&
    file !== grantFixSupabaseMigrationPath &&
    file !== "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql" &&
    file !== "supabase/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql"
  ) {
    failures.push(`supabase migration must not change in A-16T-APPLY-VERIFY ${file}`);
  }
  if (
    file.startsWith("db/checks/") &&
    file !== grantFixVerifySqlPath &&
    file !== "db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql"
  ) {
    failures.push(`SQL check must not change in A-16T-APPLY-VERIFY ${file}`);
  }
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
  console.error("A-16T apply verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16T apply verification check passed.");

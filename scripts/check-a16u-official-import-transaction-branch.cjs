const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH.md";
const applyVerifyDocPath = "docs/PLAN_A16T_APPLY_VERIFY.md";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const packagePath = "package.json";
const sqlCandidatePath =
  "db/migrations/20260702_0016_a16u_official_import_transaction_branch_candidate.sql";
const supabaseSqlCandidatePath =
  "supabase/migrations/20260702_0016_a16u_official_import_transaction_branch_candidate.sql";

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
const service = readFile(servicePath);
const route = readFile(routePath);
const panel = readFile(panelPath);
const packageJson = readJson(packagePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16U-OFFICIAL-IMPORT-TRANSACTION-BRANCH-CANDIDATE",
  "A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED",
  "A16T_PASS_TO_A16U_BUNDLE_STATUS=PASS_A16T_VERIFIED_A16U_LOCKED_BRANCH_READY",
  "A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED",
  "A16T_TABLES_EXIST=PASS",
  "A16T_BATCH_REQUIRED_COLUMNS_EXIST=PASS",
  "A16T_ROLLBACK_REQUIRED_COLUMNS_EXIST=PASS",
  "A16T_IDEMPOTENCY_UNIQUE_GUARD_EXISTS=PASS",
  "A16T_ROLLBACK_MANIFEST_UNIQUE_GUARD_EXISTS=PASS",
  "A16T_RLS_ENABLED=PASS",
  "A16T_AUTHENTICATED_POLICIES_EXIST=PASS",
  "A16T_NO_ANON_OR_PUBLIC_POLICY_OR_GRANT=PASS",
  "A16T_APPLY_VERIFY_FORBIDDEN_GRANT_COUNT=0",
  "A16T_APPLY_VERIFY_FORBIDDEN_POLICY_COUNT=0",
  "A16T_NO_AUTO_IMPORT_TRIGGER=PASS",
  "A16T_RPC_EXISTS_BUT_EXECUTION_NOT_VERIFIED_BY_THIS_CHECK=PASS",
  "A16T_APPLY_VERIFY_RPC_EXECUTION_OPENED=NO",
  "A16U_SQL_CANDIDATE_REQUIRED=NO",
  "A16U_SQL_CANDIDATE_CREATED=NO",
  "A16U_SQL_CANDIDATE_PATH=N/A_SQL_NOT_REQUIRED_A16T_SCHEMA_VERIFIED",
  "A16U_SQL_MIRROR_BYTE_FOR_BYTE=N/A_SQL_NOT_REQUIRED_A16T_SCHEMA_VERIFIED",
  "A16U_TRANSACTION_BRANCH_ALL_OR_NOTHING=YES",
  "A16U_TRANSACTION_BRANCH_NO_PARTIAL_WRITE=YES",
  "A16U_TRANSACTION_BRANCH_IDEMPOTENCY_GUARD=import_session_id",
  "A16U_TRANSACTION_BRANCH_AUDIT_BATCH_TABLE=official_import_batches",
  "A16U_TRANSACTION_BRANCH_ROLLBACK_MANIFEST_TABLE=official_import_rollback_manifests",
  "A16U_TRANSACTION_BRANCH_COUNT_EVIDENCE=created_people_count,created_relationship_count,audit_batch_id,rollback_manifest_id",
  "A16U_PREFLIGHT_STAGING_PEOPLE=102",
  "A16U_PREFLIGHT_STAGING_RELATIONSHIPS=134",
  "A16U_PREFLIGHT_VALIDATION_ERRORS=0",
  "A16U_PREFLIGHT_DRY_RUN_BLOCKERS=0",
  "A16U_PREFLIGHT_DUPLICATE_UNRESOLVED=0",
  "A16U_PREFLIGHT_DUPLICATE_NEEDS_REVIEW=0",
  "A16U_PREFLIGHT_DUPLICATE_CREATE_NEW=8",
  "A16U_RUNTIME_FAIL_CLOSED=YES",
  "A16U_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16U_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16U_RPC_CALLED=NO",
  "A16U_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16U_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH_MARKER",
  "A16U_LOCKED_RUNTIME_GUARD",
  "A16U_REQUIRED_SESSION_ID",
  "A16U_REQUIRED_A16R_RETRY_MARKER",
  "A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED",
  "transactionBranchContract",
  "allOrNothing: true",
  "idempotencyGuard: \"import_session_id\"",
  "auditBatchTable: \"official_import_batches\"",
  "rollbackManifestTable: \"official_import_rollback_manifests\"",
  "canRunOfficialImport: false",
  "auditBatchContract",
  "rollbackManifestContract",
  "importedPeopleCount: 0",
  "importedRelationshipCount: 0",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "A16T_APPLY_VERIFY_STATUS=PASS_OWNER_APPLIED_AND_VERIFIED",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_BATCHES_VERIFIED=YES",
  "A16T_APPLY_VERIFY_OFFICIAL_IMPORT_ROLLBACK_MANIFESTS_VERIFIED=YES",
  "A16T_APPLY_VERIFY_IDEMPOTENCY_GUARD_VERIFIED=YES",
  "A16T_APPLY_VERIFY_NO_ANON_PUBLIC_VERIFIED=YES",
  "A16T_APPLY_VERIFY_FORBIDDEN_GRANT_COUNT=0",
  "A16T_APPLY_VERIFY_FORBIDDEN_POLICY_COUNT=0",
  "A16T_APPLY_VERIFY_NO_AUTO_IMPORT_TRIGGER_VERIFIED=YES",
]) {
  requireIncludes(applyVerifyDoc, token, `apply verify token ${token}`);
}

if (fs.existsSync(path.join(root, sqlCandidatePath))) {
  failures.push("A-16U SQL candidate should not exist when A16U_SQL_CANDIDATE_REQUIRED=NO");
}
if (fs.existsSync(path.join(root, supabaseSqlCandidatePath))) {
  failures.push("A-16U Supabase SQL candidate should not exist when SQL is not required");
}

if (
  packageJson?.scripts?.["check:a16u-official-import-transaction-branch"] !==
  "node scripts/check-a16u-official-import-transaction-branch.cjs"
) {
  failures.push("missing package script check:a16u-official-import-transaction-branch");
}

for (const [content, token, label] of [
  [index, "PLAN_A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH.md", "index A-16U branch entry"],
  [workLog, "A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED", "work log A-16U branch status"],
  [decisionLog, "Decision 240", "decision log A-16U entry"],
  [handoff, "A16U_STATUS=A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED", "handoff A-16U branch status"],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [servicePath, service],
  [routePath, route],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call RPC`);
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}

requireIncludes(panel, "disabled", "official import button disabled");
requireIncludes(panel, "aria-disabled=\"true\"", "official import aria disabled");
rejectPattern(doc + service + route, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + service + route, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
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
  applyVerifyDocPath,
  servicePath,
  routePath,
  "components/imports/import-session-manifest-panel.tsx",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
  "scripts/check-a16t-official-import-audit-rollback-idempotency-schema.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "scripts/check-a16u-production-import-ui-deploy-smoke.cjs",
  "scripts/check-a16u-production-import-ui-post-deploy-smoke.cjs",
  "scripts/check-a16r-run-retry-official-import-bundle.cjs",
  "scripts/check-a16r-run-retry-post-import-verify.cjs",
  "scripts/check-a16r-after-a16v-official-import-execution-bundle.cjs",
  "scripts/check-a16r-after-a16v-post-import-verify.cjs",
  "scripts/check-a16v-production-runtime-evidence-reconciliation.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs",
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
  "scripts/check-a16v-sql-apply-verify-runbook.cjs",
  "scripts/check-a16v-a16r-execution-retry-requirements.cjs",
  "scripts/check-a16v-marker-verification-fix.cjs",
  "scripts/check-a16v-apply-verify.cjs",
  "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql",
  "db/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql",
  "supabase/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql",
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
  "CHECK_CLOUDFLARE_ACCOUNT.bat",
  "GUARD.bat",
  "GIA_PHA_GITHUB_MENU.bat",
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
  console.error("A-16U official import transaction branch check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16U official import transaction branch check passed.");

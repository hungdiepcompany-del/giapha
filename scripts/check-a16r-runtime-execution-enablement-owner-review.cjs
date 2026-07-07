const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW.md";
const gateDocPath = "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE.md";
const reconciliationDocPath = "docs/PLAN_A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION.md";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const packagePath = "package.json";

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

const doc = read(docPath);
const gateDoc = read(gateDocPath);
const reconciliationDoc = read(reconciliationDocPath);
const service = read(servicePath);
const route = read(routePath);
const panel = read(panelPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-RUNTIME-EXECUTION-ENABLEMENT-OWNER-REVIEW",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW_STATUS=PASS_MARKER_PRESENT_VALID_BUT_STILL_FAIL_CLOSED",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_MARKER_PRESENT=YES",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_MARKER_VALID=YES",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_A16R_RETRY_NOW=NO",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "The session run marker is not a substitute for the runtime enablement marker.",
  "OWNER_APPLIED_VERIFIED",
  "A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION_STATUS=PASS_RECONCILED_RUNTIME_EVIDENCE_MISMATCH",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE_STATUS=READY_FAIL_CLOSED",
  "runtimeExecutionEnablementGate",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_POST_DEPLOY_SMOKE_REQUIRED=YES",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_MARKER_PRESENT_VALID=YES",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_FAIL_CLOSED_WITHOUT_FINAL_EVIDENCE=YES",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_BUTTON_MAY_ENABLE_AFTER_DEPLOY_SMOKE=YES_FUTURE_PHASE_ONLY",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_A16R_RETRY_NOW=NO_POST_DEPLOY_SMOKE_AND_FINAL_EXECUTION_GATE_REQUIRED",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_RPC_DIRECT_CALLED=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REAL_GENEALOGY_WRITE=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_DEPLOY_RUN=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_PUSH_RUN=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_SQL_RUN=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_DB_PUSH_RUN=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_MIGRATION_REPAIR_RUN=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_SEED_RUN=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE_STATUS=READY_FAIL_CLOSED",
  "A16R_RUNTIME_EXECUTION_CAN_RUN_OFFICIAL_IMPORT=false",
]) {
  requireIncludes(gateDoc, token, `gate doc token ${token}`);
}

for (const token of [
  "A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION_STATUS=PASS_RECONCILED_RUNTIME_EVIDENCE_MISMATCH",
  "A16V_PRODUCTION_RUNTIME_SOURCE_SQL_CANDIDATE_STATUS=OWNER_APPLIED_VERIFIED",
]) {
  requireIncludes(reconciliationDoc, token, `reconciliation doc token ${token}`);
}

for (const token of [
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "confirmRuntimeExecutionEnablementMarker",
  "runtimeExecutionEnablementGate",
  "canRunOfficialImport: false",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER",
  "confirmRuntimeExecutionEnablementMarker",
  "canRunOfficialImport: false",
  "getOfficialImportRuntimeCandidate",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of ["disabled", "aria-disabled=\"true\""]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16r-runtime-execution-enablement-owner-review"] !==
  "node scripts/check-a16r-runtime-execution-enablement-owner-review.cjs"
) {
  failures.push("missing package script check:a16r-runtime-execution-enablement-owner-review");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW.md", "index owner review entry"],
  [workLog, "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW_STATUS=PASS_MARKER_PRESENT_VALID_BUT_STILL_FAIL_CLOSED", "work log owner review status"],
  [decisionLog, "A-16R runtime execution owner review accepts marker but keeps import closed", "decision log owner review decision"],
  [handoff, "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW_STATUS=PASS_MARKER_PRESENT_VALID_BUT_STILL_FAIL_CLOSED", "handoff owner review status"],
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
  rejectPattern(content, /canRunOfficialImport:\s*true/, `${label} must not open canRunOfficialImport`);
}

rejectPattern(doc + gateDoc + reconciliationDoc + service + route + panel, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + gateDoc + reconciliationDoc + service + route + panel, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY.md",
  "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md",
  "docs/PLAN_A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE.md",
  packagePath,
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16v-production-runtime-evidence-reconciliation.cjs",
  "scripts/check-a16r-after-a16v-official-import-execution-bundle.cjs",
  "scripts/check-a16r-after-a16v-post-import-verify.cjs",
  "scripts/check-a16r-run-retry-official-import-bundle.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
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
  "docs/PLAN_A16R_PRODUCTION_UI_GATE_STATE_RECONCILIATION.md",
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`forbidden spreadsheet/csv ${file}`);
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden staged outside-scope file ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-16R runtime execution enablement owner review check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R runtime execution enablement owner review check passed.");

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE.md";
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
const service = read(servicePath);
const route = read(routePath);
const panel = read(panelPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-RUNTIME-EXECUTION-ENABLEMENT-GATE",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE_STATUS=READY_FAIL_CLOSED",
  "A16V_PRODUCTION_RUNTIME_ROOT_CAUSE=EVIDENCE_READER_MISMATCH",
  "A16R_RUNTIME_EXECUTION_A16V_SQL_CANDIDATE_STATUS=OWNER_APPLIED_VERIFIED",
  "A16R_RUNTIME_EXECUTION_A16V_RECONCILIATION_STATUS=PASS_RECONCILED_RUNTIME_EVIDENCE_MISMATCH",
  "A16R_RUNTIME_EXECUTION_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_RUNTIME_EXECUTION_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_ENABLEMENT_APPROVAL_MISSING",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER_MATCHED=NO",
  "A16R_RUNTIME_EXECUTION_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16R_RUNTIME_EXECUTION_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_RUNTIME_EXECUTION_RPC_DIRECT_CALLED=NO",
  "A16R_RUNTIME_EXECUTION_REAL_GENEALOGY_WRITE=NO",
  "A16R_RUNTIME_EXECUTION_DEPLOY_RUN=NO",
  "A16R_RUNTIME_EXECUTION_PUSH_RUN=NO",
  "A16R_RUNTIME_EXECUTION_SQL_RUN=NO",
  "A16R_RUNTIME_EXECUTION_DB_PUSH_RUN=NO",
  "A16R_RUNTIME_EXECUTION_MIGRATION_REPAIR_RUN=NO",
  "A16R_RUNTIME_EXECUTION_SEED_RUN=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_APPROVAL_MISSING_BLOCKER",
  "A16R_BLOCKED_RUNTIME_EXECUTION_ENABLEMENT_APPROVAL_MISSING",
  "confirmRuntimeExecutionEnablementMarker",
  "runtimeExecutionEnablementGate",
  "requiredMarker: A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER",
  "evidenceStatus: \"A16V_OWNER_APPLIED_VERIFIED_RECONCILED\"",
  "productionDeployEvidenceRequired: true",
  "const canRunOfficialImport = reasons.length === 0",
  "approvalMarkerMatched: runtimeEnablementApproved",
  "status: \"BLOCKED\"",
  "sqlCandidateStatus: \"OWNER_APPLIED_VERIFIED\"",
  "verificationEvidenceSource: \"docs/PLAN_A16V_APPLY_VERIFY.md\"",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER",
  "confirmRuntimeExecutionEnablementMarker",
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "lockedResponse",
  "canRunOfficialImport: false",
  "getOfficialImportRuntimeCandidate",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of [
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER",
  "Marker bật runtime execution sau A-16V",
  "disabled",
  "aria-disabled=\"true\"",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16r-runtime-execution-enablement-gate"] !==
  "node scripts/check-a16r-runtime-execution-enablement-gate.cjs"
) {
  failures.push("missing package script check:a16r-runtime-execution-enablement-gate");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE.md", "index enablement gate entry"],
  [workLog, "A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE_STATUS=READY_FAIL_CLOSED", "work log enablement status"],
  [decisionLog, "A-16R runtime execution enablement requires a separate owner marker", "decision log enablement decision"],
  [handoff, "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY", "handoff enablement marker"],
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

rejectPattern(doc + service + route + panel, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + service + route + panel, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  "docs/PLAN_A16R_PRODUCTION_UI_GATE_STATE_RECONCILIATION.md",
  "docs/PLAN_A16R_OWNER_AUTH_GATE_SMOKE_AND_EVIDENCE_BUNDLE.md",
  "docs/PLAN_A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE.md",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION.md",
  "docs/PLAN_A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH.md",
  "docs/PLAN_A16K_OWNER_DRY_RUN_GATE_APPROVAL_AFTER_A16R_FIX.md",
  "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW.md",
  "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY.md",
  "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md",
  "docs/PLAN_A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE.md",
  servicePath,
  routePath,
  panelPath,
  packagePath,
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs",
  "scripts/check-a16r-official-import-session-id-reconciliation.cjs",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  "scripts/check-a16k-owner-dry-run-gate-approval-after-a16r-fix.cjs",
  "lib/import/giapha4/import-dry-run-approval-gate.ts",
  "app/api/admin/import-sessions/[sessionId]/dry-run-gate/route.ts",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "docs/PLAN_A16AF_RUNTIME_IMPORT_ENABLEMENT_CANDIDATE_PRODUCTION_SMOKE.md",
  "scripts/check-a16af-runtime-import-enablement-candidate-production-smoke.cjs",
  "scripts/check-a16ac-import-retry-execution-final-gate.cjs",
  "scripts/check-a16ad-runtime-official-import-enablement-blocker-diagnosis.cjs",
  "scripts/check-a16v-apply-verify.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs",
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
  "docs/PLAN_A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION.md",
  "docs/PLAN_A16R_AFTER_A16V_OFFICIAL_IMPORT_EXECUTION_BUNDLE.md",
  "docs/PLAN_A16R_AFTER_A16V_POST_IMPORT_VERIFY.md",
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
  console.error("A-16R runtime execution enablement gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R runtime execution enablement gate check passed.");

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md";
const deploySmokeDocPath = "docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md";
const ownerReviewDocPath = "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW.md";
const afterA16VBundleDocPath = "docs/PLAN_A16R_AFTER_A16V_OFFICIAL_IMPORT_EXECUTION_BUNDLE.md";
const afterA16VPostVerifyDocPath = "docs/PLAN_A16R_AFTER_A16V_POST_IMPORT_VERIFY.md";
const gateRoutePath = "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts";
const gateServicePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const manifestReadServicePath = "lib/import/giapha4/manifest-read-service.ts";
const postRoutePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const officialImportServicePath = "lib/import/giapha4/official-import-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const packagePath = "package.json";
const wranglerPath = "wrangler.toml";

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
const deploySmokeDoc = read(deploySmokeDocPath);
const ownerReviewDoc = read(ownerReviewDocPath);
const afterA16VBundleDoc = read(afterA16VBundleDocPath);
const afterA16VPostVerifyDoc = read(afterA16VPostVerifyDocPath);
const gateRoute = read(gateRoutePath);
const gateService = read(gateServicePath);
const manifestReadService = read(manifestReadServicePath);
const postRoute = read(postRoutePath);
const officialImportService = read(officialImportServicePath);
const panel = read(panelPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-OFFICIAL-IMPORT-GATE-READINESS-DIAGNOSIS",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS_STATUS=DIAGNOSED_AUTH_REQUIRED_AND_SOURCE_FAIL_CLOSED",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_CLASSIFICATION=UNKNOWN_NEEDS_AUTHENTICATED_SMOKE",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED",
  "HEAD_EQUALS_ORIGIN_MAIN=YES",
  "WORKING_TREE_CLEAN=YES",
  "4f1635b94c7a884e5b3624768b1cb13939ba1bdb",
  "docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md",
  "Cloudflare Deploy",
  "28656644567",
  "cee98384e7df6b6fc3c6703c1ff523b844d89254",
  "4e7841b6-62ca-4b71-a46c-ccc21ad6cefc",
  "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_RESULT=PASS",
  "A16R_GITHUB_ACTIONS_LINUX_PRODUCTION_SMOKE_RESULT=PASS_REQUIRED_GET_ROUTES_NO_500",
  "A16R_GITHUB_ACTIONS_LINUX_ROLLBACK_RESULT=NOT_RUN_NO_PRODUCTION_BREAKING_500",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_GET_STATUS=401",
  "A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE",
  "readOnly=true",
  "canOpenOfficialImport=false",
  "officialImportEnabled=false",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>",
  "NOT_READY",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_GUARDED_401_EXPECTED_AUTH_BEHAVIOR=YES",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_SMOKE_AUTH_CONTEXT=UNAUTHENTICATED_GET_ONLY",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_AUTH_TOKEN_OR_COOKIE_PRESENT=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_AUTHENTICATED_GATE_STATE=UNKNOWN_NOT_TESTED",
  "buildOfficialImportPreflightGateFromManifest()",
  "canOpenOfficialImport: false",
  "officialImportEnabled: false",
  "previewOnly: true",
  "canImport: false",
  "dbWrite: false",
  "peopleWrite: false",
  "relationshipWrite: false",
  "canRunOfficialImport: false",
  "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "disabled",
  "aria-disabled=\"true\"",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_401_IS_AUTH_REQUIRED_ONLY_FOR_UNAUTHENTICATED_GET=YES",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_CAN_RUN_OFFICIAL_IMPORT=false_SOURCE_STATIC",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_OFFICIAL_IMPORT_BUTTON=DISABLED_SOURCE_STATIC",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=SOURCE_MARKER_PRESENT_NOT_AUTHENTICATED_RUNTIME_PROVEN",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_SESSION_RUN_MARKER_STATUS=REQUIRED_BUT_NOT_USED_FOR_EXECUTION",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_A16V_RECONCILIATION_EVIDENCE=SOURCE_REFERENCES_OWNER_APPLIED_VERIFIED",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_POST_DEPLOY_SMOKE_SUFFICIENT_FOR_IMPORT=NO_PUBLIC_GET_ONLY_AND_AUTH_REQUIRED",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_STATIC_BLOCKER=SOURCE_STILL_FAIL_CLOSED_CAN_RUN_FALSE",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_AUTHENTICATED_SMOKE_REQUIRED=YES",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_NEXT_ALLOWED_ACTION=RUN_AUTHENTICATED_ADMIN_READ_ONLY_GATE_AND_UI_SMOKE_NO_POST",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_DEPLOY_RUN=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_DIRECT_RPC_CALLED=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_REAL_GENEALOGY_WRITE=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_SQL_RUN=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_DB_PUSH_RUN=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_MIGRATION_REPAIR_RUN=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_SEED_RUN=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_SESSION_RUN_MARKER_USED_TO_EXECUTE_IMPORT=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_FAIL_CLOSED_GUARDS_WEAKENED=NO",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_WRANGLER_TOML_CHANGED=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "No real genealogy data write.",
  "No SQL, Supabase DB push, migration repair or seed.",
  "Main Worker source touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "NONE_FOR_THIS_PHASE_AUTHENTICATED_READ_ONLY_GATE_SMOKE_NEXT",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [deploySmokeDoc, "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_RESULT=PASS", "deploy smoke PASS"],
  [deploySmokeDoc, "A16R_GITHUB_ACTIONS_LINUX_OFFICIAL_IMPORT_GATE_GET_STATUS=PASS_GUARDED_401", "deploy smoke guarded 401"],
  [ownerReviewDoc, "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_CAN_RUN_OFFICIAL_IMPORT=false", "owner review canRun false"],
  [afterA16VBundleDoc, "A16R_AFTER_A16V_RUNTIME_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "after A16V runtime blocker"],
  [afterA16VPostVerifyDoc, "A16R_AFTER_A16V_POST_IMPORT_VERIFY_STATUS=NOT_RUN_IMPORT_NOT_CALLED", "post verify not run"],
  [gateRoute, "export async function GET", "official import gate GET route"],
  [gateRoute, "getOfficialImportPreflightGate", "gate route preflight call"],
  [gateService, "canOpenOfficialImport: false", "gate service canOpen false"],
  [gateService, "officialImportEnabled: false", "gate service enabled false"],
  [manifestReadService, "status: httpStatus === 401 ? \"unauthenticated\" : \"forbidden\"", "manifest unauthenticated branch"],
  [manifestReadService, "context.permissions.includes(\"imports.create\")", "manifest imports.create requirement"],
  [postRoute, "export async function POST", "official import POST route exists"],
  [postRoute, "confirmRuntimeExecutionEnablementMarker", "POST route runtime marker parse"],
  [officialImportService, "canRunOfficialImport: false", "official import service fail closed"],
  [officialImportService, "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "official import service runtime blocker"],
  [panel, "aria-disabled=\"true\"", "official import UI disabled"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16r-official-import-gate-readiness-diagnosis"] !==
  "node scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs"
) {
  failures.push("missing package script check:a16r-official-import-gate-readiness-diagnosis");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md", "index diagnosis entry"],
  [workLog, "A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS_STATUS=DIAGNOSED_AUTH_REQUIRED_AND_SOURCE_FAIL_CLOSED", "work log diagnosis status"],
  [decisionLog, "A-16R official import gate readiness needs authenticated read-only smoke", "decision log diagnosis decision"],
  [handoff, "A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS_STATUS=DIAGNOSED_AUTH_REQUIRED_AND_SOURCE_FAIL_CLOSED", "handoff diagnosis status"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(doc, /\.rpc\s*\(/i, "doc must not call RPC");
rejectPattern(doc, /fetch\s*\([\s\S]{0,240}\/official-import/i, "doc must not call official import");
rejectPattern(doc, /canRunOfficialImport:\s*true/, "doc must not open canRunOfficialImport");
rejectPattern(doc, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  "docs/PLAN_A16R_UI_COPY_REFRESH_OFFICIAL_IMPORT_GATE.md",
  "scripts/check-a16r-ui-copy-refresh-official-import-gate.cjs",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_SESSION_ID_RECONCILIATION.md",
  "scripts/check-a16r-official-import-session-id-reconciliation.cjs",
  "docs/PLAN_A16R_FIX_OFFICIAL_IMPORT_SESSION_SELECTION_MISMATCH.md",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  panelPath,
  officialImportServicePath,
  "docs/PLAN_A16R_PRODUCTION_UI_GATE_STATE_RECONCILIATION.md",
  "docs/PLAN_A16R_OWNER_AUTH_GATE_SMOKE_AND_EVIDENCE_BUNDLE.md",
  packagePath,
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
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
  "scripts/check-a16r-github-actions-linux-deploy-smoke.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-after-a16v-official-import-execution-bundle.cjs",
  "scripts/check-a16r-after-a16v-post-import-verify.cjs",
  "scripts/check-a16r-run-retry-official-import-bundle.cjs",
  "scripts/check-a16r-run-retry-post-import-verify.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
  "scripts/check-a16t-a16u-transaction-branch-requirements.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "scripts/check-a16v-production-runtime-evidence-reconciliation.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
  "scripts/check-a16v-sql-apply-verify-runbook.cjs",
  "scripts/check-a16v-a16r-execution-retry-requirements.cjs",
  "scripts/check-a16v-marker-verification-fix.cjs",
  "scripts/check-a16v-apply-verify.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`forbidden spreadsheet/csv ${file}`);
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (
    file === wranglerPath ||
    file === "open-next.config.ts" ||
    file === "next.config.ts" ||
    file.startsWith(".github/workflows/") ||
    file.startsWith("app/") ||
    (file.startsWith("lib/") && file !== officialImportServicePath) ||
    (file.startsWith("components/") && file !== panelPath)
  ) {
    failures.push(`runtime/config/source file must not change in this phase ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16R official import gate readiness diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R official import gate readiness diagnosis check passed.");

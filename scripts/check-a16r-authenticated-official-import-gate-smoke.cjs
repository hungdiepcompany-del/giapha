const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE.md";
const readinessDocPath = "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md";
const deploySmokeDocPath = "docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md";
const ownerReviewDocPath = "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW.md";
const afterA16VBundleDocPath = "docs/PLAN_A16R_AFTER_A16V_OFFICIAL_IMPORT_EXECUTION_BUNDLE.md";
const afterA16VPostVerifyDocPath = "docs/PLAN_A16R_AFTER_A16V_POST_IMPORT_VERIFY.md";
const gateRoutePath = "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts";
const gateServicePath = "lib/import/giapha4/official-import-preflight-gate.ts";
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
const readinessDoc = read(readinessDocPath);
const deploySmokeDoc = read(deploySmokeDocPath);
const ownerReviewDoc = read(ownerReviewDocPath);
const afterA16VBundleDoc = read(afterA16VBundleDocPath);
const afterA16VPostVerifyDoc = read(afterA16VPostVerifyDocPath);
const gateRoute = read(gateRoutePath);
const gateService = read(gateServicePath);
const postRoute = read(postRoutePath);
const officialImportService = read(officialImportServicePath);
const panel = read(panelPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-AUTHENTICATED-OFFICIAL-IMPORT-GATE-SMOKE",
  "A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE_STATUS=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT",
  "A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_CLASSIFICATION=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED",
  "HEAD_EQUALS_ORIGIN_MAIN=YES",
  "WORKING_TREE_CLEAN=YES",
  "1383f7c92319a264fd86f6d84c43af9ab159fbca",
  "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE_STATUS=PASS_DEPLOYED_SMOKE_GET_ONLY_IMPORT_LOCKED",
  "4e7841b6-62ca-4b71-a46c-ccc21ad6cefc",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS_STATUS=DIAGNOSED_AUTH_REQUIRED_AND_SOURCE_FAIL_CLOSED",
  "A16R_OFFICIAL_IMPORT_GATE_READINESS_CLASSIFICATION=UNKNOWN_NEEDS_AUTHENTICATED_SMOKE",
  "A16R_AUTH_GATE_SMOKE_ADMIN_IMPORT_PAGE_GET=REACHED_READ_ONLY",
  "WEB GIA PHẢ",
  "A16R_AUTH_GATE_SMOKE_BROWSER_CONTEXT_ADMIN_READY=NO",
  "A16R_AUTH_GATE_SMOKE_VISIBLE_PERMISSION_COUNT=0",
  "A16R_AUTH_GATE_SMOKE_PAGE_LOGIN_REQUIRED=YES",
  "A16R_AUTH_GATE_SMOKE_BROWSER_SESSION_PRESENT_BUT_NOT_ADMIN_IMPORT_CONTEXT=YES",
  "A16R_AUTH_GATE_SMOKE_AUTHENTICATED_ADMIN_CAN_REACH_IMPORT_PAGE=NO",
  "A16R_AUTH_GATE_SMOKE_BROWSER_DIRECT_API_GET_STATUS=UNKNOWN_BROWSER_CLIENT_BLOCKED_NAVIGATION",
  "A16R_AUTH_GATE_SMOKE_IN_PAGE_API_GET_STATUS=UNKNOWN_BROWSER_READ_ONLY_EVAL_LIMITATION",
  "A16R_AUTH_GATE_SMOKE_UNAUTHENTICATED_GATE_GET_STATUS=401",
  "A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE",
  "readOnly=true",
  "canOpenOfficialImport=false",
  "officialImportEnabled=false",
  "A16R_AUTH_GATE_SMOKE_A16V_RECONCILIATION_EVIDENCE_RECOGNIZED=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "A16R_AUTH_GATE_SMOKE_RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "A16R_AUTH_GATE_SMOKE_SESSION_RUN_MARKER_RECOGNIZED=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "A16R_AUTH_GATE_SMOKE_CAN_RUN_OFFICIAL_IMPORT=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "A16R_AUTH_GATE_SMOKE_SOURCE_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_AUTH_GATE_SMOKE_OFFICIAL_IMPORT_BUTTON=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "A16R_AUTH_GATE_SMOKE_SOURCE_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16R_AUTH_GATE_SMOKE_REMAINING_BLOCKER=AUTHENTICATED_ADMIN_IMPORT_CONTEXT_NOT_AVAILABLE_OR_PERMISSION_INSUFFICIENT",
  "This is not `READY_FOR_SEPARATE_IMPORT_EXECUTION_PHASE`.",
  "A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_AUTH_GATE_SMOKE_IMPORT_RETRY_REASON=AUTHENTICATED_ADMIN_GATE_READINESS_NOT_PROVEN",
  "A16R_AUTH_GATE_SMOKE_NEXT_ALLOWED_ACTION=PROVIDE_LOGGED_IN_ADMIN_OWNER_BROWSER_SESSION_OR_APPROVED_READ_ONLY_AUTH_CONTEXT_THEN_RERUN_AUTHENTICATED_GATE_UI_SMOKE_NO_POST",
  "A16R_AUTH_GATE_SMOKE_DEPLOY_RUN=NO",
  "A16R_AUTH_GATE_SMOKE_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_AUTH_GATE_SMOKE_DIRECT_RPC_CALLED=NO",
  "A16R_AUTH_GATE_SMOKE_REAL_GENEALOGY_WRITE=NO",
  "A16R_AUTH_GATE_SMOKE_SQL_RUN=NO",
  "A16R_AUTH_GATE_SMOKE_DB_PUSH_RUN=NO",
  "A16R_AUTH_GATE_SMOKE_MIGRATION_REPAIR_RUN=NO",
  "A16R_AUTH_GATE_SMOKE_SEED_RUN=NO",
  "A16R_AUTH_GATE_SMOKE_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16R_AUTH_GATE_SMOKE_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO",
  "A16R_AUTH_GATE_SMOKE_SESSION_RUN_MARKER_USED_TO_EXECUTE_IMPORT=NO",
  "A16R_AUTH_GATE_SMOKE_FAIL_CLOSED_GUARDS_WEAKENED=NO",
  "A16R_AUTH_GATE_SMOKE_WRANGLER_TOML_CHANGED=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "No real genealogy data write.",
  "No SQL, Supabase DB push, migration repair or seed.",
  "No Windows-local deploy.",
  "Main Worker source touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "NONE_FOR_THIS_PHASE_AUTHENTICATED_READ_ONLY_SMOKE_BLOCKED_BY_AUTH_CONTEXT",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [readinessDoc, "A16R_OFFICIAL_IMPORT_GATE_READINESS_CLASSIFICATION=UNKNOWN_NEEDS_AUTHENTICATED_SMOKE", "readiness previous classification"],
  [deploySmokeDoc, "A16R_GITHUB_ACTIONS_LINUX_DEPLOY_RESULT=PASS", "deploy smoke pass"],
  [ownerReviewDoc, "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_CAN_RUN_OFFICIAL_IMPORT=false", "owner review canRun false"],
  [afterA16VBundleDoc, "A16R_AFTER_A16V_RUNTIME_BLOCKER=A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "after A16V blocker"],
  [afterA16VPostVerifyDoc, "A16R_AFTER_A16V_POST_IMPORT_VERIFY_STATUS=NOT_RUN_IMPORT_NOT_CALLED", "post verify not run"],
  [gateRoute, "export async function GET", "gate route GET only"],
  [gateService, "canOpenOfficialImport: false", "gate source canOpen false"],
  [gateService, "officialImportEnabled: false", "gate source enabled false"],
  [postRoute, "export async function POST", "POST route exists but not used"],
  [officialImportService, "canRunOfficialImport: false", "service fail closed"],
  [officialImportService, "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "service runtime blocker"],
  [panel, "aria-disabled=\"true\"", "panel disabled official import"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16r-authenticated-official-import-gate-smoke"] !==
  "node scripts/check-a16r-authenticated-official-import-gate-smoke.cjs"
) {
  failures.push("missing package script check:a16r-authenticated-official-import-gate-smoke");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE.md", "index authenticated smoke entry"],
  [workLog, "A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE_STATUS=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT", "work log authenticated smoke status"],
  [decisionLog, "A-16R authenticated official import gate smoke is blocked by auth or permission context", "decision log authenticated smoke decision"],
  [handoff, "A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE_STATUS=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT", "handoff authenticated smoke status"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(doc, /\.rpc\s*\(/i, "doc must not call RPC");
rejectPattern(doc, /fetch\s*\([\s\S]{0,240}\/official-import/i, "doc must not call official import");
rejectPattern(doc, /canRunOfficialImport:\s*true/, "doc must not open canRunOfficialImport");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/, "doc must not allow retry without ready gate");
rejectPattern(doc, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  packagePath,
  "scripts/check-a16r-authenticated-official-import-gate-smoke.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
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
    file.startsWith("lib/") ||
    file.startsWith("components/")
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
  console.error("A-16R authenticated official import gate smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R authenticated official import gate smoke check passed.");

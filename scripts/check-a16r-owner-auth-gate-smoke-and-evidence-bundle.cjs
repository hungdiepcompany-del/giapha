const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_OWNER_AUTH_GATE_SMOKE_AND_EVIDENCE_BUNDLE.md";
const packagePath = "package.json";
const wranglerPath = "wrangler.toml";
const gateRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts";
const postRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const importPagePath = "app/(admin)/admin/exports/import/page.tsx";
const permissionServicePath = "lib/permissions/permission-service.ts";
const manifestReadServicePath = "lib/import/giapha4/manifest-read-service.ts";
const gateServicePath = "lib/import/giapha4/official-import-preflight-gate.ts";
const officialImportServicePath = "lib/import/giapha4/official-import-service.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";

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
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const gateRoute = read(gateRoutePath);
const postRoute = read(postRoutePath);
const importPage = read(importPagePath);
const permissionService = read(permissionServicePath);
const manifestReadService = read(manifestReadServicePath);
const gateService = read(gateServicePath);
const officialImportService = read(officialImportServicePath);
const panel = read(panelPath);

for (const token of [
  "A-16R-OWNER-AUTH-GATE-SMOKE-AND-EVIDENCE-BUNDLE",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_STATUS=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_OWNER_AUTH_CLASSIFICATION=AUTH_SESSION_COOKIE_MISSING",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_GATE_CLASSIFICATION=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_OWNER_ADMIN_IMPORT_PERMISSION_PROVEN=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED",
  "HEAD_EQUALS_ORIGIN_MAIN=YES",
  "WORKING_TREE_CLEAN=YES",
  "88ec34237543b67c255e61dde8f84d8a9728895f",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_BROWSER_TOOL_AVAILABLE=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_BROWSER_OWNER_SESSION_INSPECTION=UNKNOWN_BROWSER_TOOL_UNAVAILABLE",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_ADMIN_IMPORT_PAGE_GET=200",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_ADMIN_IMPORT_PAGE_BODY_LENGTH=19173",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_ADMIN_SHELL_USER=UNKNOWN_NOT_LOGGED_IN",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_ADMIN_SHELL_ROLE_STATE=NO_ROLE_VISIBLE",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_VISIBLE_PERMISSION_COUNT=0",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_LOGIN_REQUIRED_COPY_PRESENT=YES",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_SESSION_COOKIE_AUTH_CONTEXT_EXISTS=NO_APP_SERVER_AUTH_CONTEXT",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_PROFILE_LINKED=UNKNOWN_AUTH_SESSION_MISSING",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_OFFICIAL_IMPORT_GATE_GET=401",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_GATE_MARKER=A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_GATE_READ_ONLY=true",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_GATE_CAN_OPEN_OFFICIAL_IMPORT=false",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_GATE_OFFICIAL_IMPORT_ENABLED=false",
  "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_A16V_RECONCILIATION_EVIDENCE_RECOGNIZED=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=SOURCE_PRESENT_PRODUCTION_AUTH_NOT_PROVEN",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_SESSION_RUN_MARKER_RECOGNIZED=SOURCE_PRESENT_NOT_USED_FOR_EXECUTION",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_CAN_RUN_OFFICIAL_IMPORT=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_SOURCE_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_OFFICIAL_IMPORT_BUTTON=UNKNOWN_AUTH_OR_PERMISSION_BLOCKED",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_SOURCE_OFFICIAL_IMPORT_BUTTON=DISABLED",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_REMAINING_BLOCKER=AUTHENTICATED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_AVAILABLE_OR_PERMISSION_INSUFFICIENT",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_DB_SQL_ROLE_REPAIR_NEEDED=UNKNOWN_NOT_PROVEN",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_OWNER_MANUAL_ACTION_NEEDED=YES",
  "This is not `READY_FOR_SEPARATE_IMPORT_EXECUTION_PHASE`.",
  "A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_NEXT_ALLOWED_ACTION=OWNER_LOGIN_TO_PRODUCTION_WITH_EXPECTED_OWNER_ADMIN_ACCOUNT_VERIFY_ADMIN_SHELL_EMAIL_ROLE_PERMISSION_COUNT_THEN_RERUN_READ_ONLY_GATE_UI_SMOKE_NO_POST",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_DEPLOY_RUN=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_DIRECT_RPC_CALLED=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_REAL_GENEALOGY_WRITE=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_SQL_RUN=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_DB_PUSH_RUN=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_MIGRATION_REPAIR_RUN=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_SEED_RUN=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_PERMISSIONS_ROLES_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_SESSION_RUN_MARKER_USED_TO_EXECUTE_IMPORT=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_FAIL_CLOSED_GUARDS_WEAKENED=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_WRANGLER_TOML_CHANGED=NO",
  "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_ACTUAL_IMPORT_RUN=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "No real genealogy data write.",
  "No SQL, Supabase DB push, migration repair or seed.",
  "No permission grant, role update, auth/user update or membership mutation.",
  "Main Worker source touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "NONE_FOR_THIS_PHASE_OWNER_AUTH_GATE_READ_ONLY_EVIDENCE_BUNDLE",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [gateRoute, "export async function GET", "gate route GET only"],
  [postRoute, "export async function POST", "POST route exists but not used"],
  [importPage, "getPermissionContext", "import page permission context"],
  [importPage, "context.permissions.includes(\"imports.create\")", "import page imports.create"],
  [importPage, "!context.user", "import page login branch"],
  [permissionService, "getCurrentAuthUser", "permission context auth user"],
  [permissionService, ".from(\"profiles\")", "permission context profiles"],
  [permissionService, ".from(\"profile_roles\")", "permission context profile roles"],
  [permissionService, ".from(\"role_permissions\")", "permission context role permissions"],
  [permissionService, ".from(\"permissions\")", "permission context permissions"],
  [manifestReadService, "previewOnly: true", "manifest preview only"],
  [manifestReadService, "canImport: false", "manifest canImport false"],
  [manifestReadService, "context.permissions.includes(\"imports.create\")", "manifest imports.create"],
  [gateService, "canOpenOfficialImport: false", "gate canOpen false"],
  [gateService, "officialImportEnabled: false", "gate enabled false"],
  [officialImportService, "canRunOfficialImport: false", "runtime canRun false"],
  [officialImportService, "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "runtime blocker"],
  [panel, "aria-disabled=\"true\"", "panel official import disabled"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16r-owner-auth-gate-smoke-and-evidence-bundle"] !==
  "node scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs"
) {
  failures.push("missing package script check:a16r-owner-auth-gate-smoke-and-evidence-bundle");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_OWNER_AUTH_GATE_SMOKE_AND_EVIDENCE_BUNDLE.md", "index bundle entry"],
  [workLog, "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_STATUS=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT", "work log bundle status"],
  [decisionLog, "A-16R owner auth gate smoke bundle remains blocked by missing app-server owner auth context", "decision log bundle decision"],
  [handoff, "A16R_OWNER_AUTH_GATE_SMOKE_BUNDLE_STATUS=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT", "handoff bundle status"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(doc, /\.rpc\s*\(/i, "doc must not call RPC");
rejectPattern(doc, /canRunOfficialImport:\s*true/, "doc must not open canRunOfficialImport");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/, "doc must not allow retry");
rejectPattern(doc, /MUTATED=YES/, "doc must not mutate permissions/auth");
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
  packagePath,
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16r-owner-admin-import-permission-diagnosis.cjs",
  "scripts/check-a16r-authenticated-owner-import-gate-smoke-retry.cjs",
  "scripts/check-a16r-authenticated-official-import-gate-smoke.cjs",
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
  console.error("A-16R owner auth gate smoke and evidence bundle check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R owner auth gate smoke and evidence bundle check passed.");

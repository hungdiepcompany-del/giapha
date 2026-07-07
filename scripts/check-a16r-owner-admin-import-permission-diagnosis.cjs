const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS.md";
const ownerRetryDocPath =
  "docs/PLAN_A16R_AUTHENTICATED_OWNER_IMPORT_GATE_SMOKE_RETRY.md";
const authSmokeDocPath =
  "docs/PLAN_A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_SMOKE.md";
const readinessDocPath =
  "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md";
const importPagePath = "app/(admin)/admin/exports/import/page.tsx";
const manifestReadServicePath = "lib/import/giapha4/manifest-read-service.ts";
const permissionServicePath = "lib/permissions/permission-service.ts";
const permissionTypesPath = "lib/permissions/permission-types.ts";
const postRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const gateRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import-gate/route.ts";
const gateServicePath = "lib/import/giapha4/official-import-preflight-gate.ts";
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
const ownerRetryDoc = read(ownerRetryDocPath);
const authSmokeDoc = read(authSmokeDocPath);
const readinessDoc = read(readinessDocPath);
const importPage = read(importPagePath);
const manifestReadService = read(manifestReadServicePath);
const permissionService = read(permissionServicePath);
const permissionTypes = read(permissionTypesPath);
const postRoute = read(postRoutePath);
const gateRoute = read(gateRoutePath);
const gateService = read(gateServicePath);
const officialImportService = read(officialImportServicePath);
const panel = read(panelPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-OWNER-ADMIN-IMPORT-PERMISSION-DIAGNOSIS",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_STATUS=DIAGNOSED_READ_ONLY_NO_MUTATION",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_CLASSIFICATION=AUTH_SESSION_COOKIE_MISSING",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_CURRENT_BLOCKER=AUTHENTICATED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_AVAILABLE_OR_PERMISSION_INSUFFICIENT",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED",
  "HEAD_EQUALS_ORIGIN_MAIN=YES",
  "WORKING_TREE_CLEAN=YES",
  "6e830c70b82a23fbd4bf55f2a471d6b76bd71a34",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_VISIBLE_PERMISSION_COUNT=0",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_LOGIN_REQUIRED_COPY_PRESENT=YES",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_AUTHENTICATED_ADMIN_GATE_READINESS_PROVEN=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_OWNER_ADMIN_IMPORT_PERMISSION_PROVEN=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_REQUIRED_PAGE_PERMISSION=imports.create",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_AUTH_USER_REQUIRED=YES",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_PROFILE_LINK_REQUIRED=YES_AUTH_USER_ID",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_PROFILE_ROLE_REQUIRED=YES_PROFILE_ROLES",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_ROLE_PERMISSION_MAPPING_REQUIRED=YES_ROLE_PERMISSIONS",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_FAMILY_TREE_MEMBERSHIP_REQUIRED=NO_SOURCE_EVIDENCE",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_SYSTEM_ADMIN_ROLE_REQUIRED=NO_ROLE_CODE_IN_SOURCE",
  "OWNER`, `ADMIN`, `EDITOR`, `CONTRIBUTOR`, `FAMILY_VIEWER`, `PUBLIC_VIEWER",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_REQUIRED_POST_PERMISSIONS=imports.create,people.create,relationships.create,permissions.manage",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_LOGGED_OUT=LIKELY_APP_SERVER_SESSION_MISSING",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_WRONG_ACCOUNT=UNKNOWN_NOT_PROVEN",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_PROFILE_MISSING=UNKNOWN_NOT_PROVEN",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_ROLE_MISSING=UNKNOWN_NOT_PROVEN",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_IMPORT_PERMISSION_MISSING=UNKNOWN_NOT_PROVEN",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_ROLE_PERMISSION_MAPPING_MISMATCH=UNKNOWN_NOT_PROVEN",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_AUTH_SESSION_COOKIE_MISSING=YES_READ_ONLY_EVIDENCE",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_SOURCE_STILL_FAIL_CLOSED=YES",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DB_SQL_ROLE_REPAIR_NEEDED=UNKNOWN_NOT_PROVEN",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_OWNER_MANUAL_ACTION_NEEDED=YES",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_ROLES_PERMISSIONS_MUTATED=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_AUTH_USERS_MEMBERSHIPS_MUTATED=NO",
  "A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_NEXT_ALLOWED_ACTION=OWNER_LOGIN_TO_PRODUCTION_WITH_EXPECTED_OWNER_ADMIN_ACCOUNT_VERIFY_ADMIN_SHELL_EMAIL_ROLE_PERMISSION_COUNT_THEN_RERUN_READ_ONLY_GATE_UI_SMOKE_NO_POST",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DEPLOY_RUN=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIRECT_RPC_CALLED=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_REAL_GENEALOGY_WRITE=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_SQL_RUN=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DB_PUSH_RUN=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_MIGRATION_REPAIR_RUN=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_SEED_RUN=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_WINDOWS_LOCAL_DEPLOY_RUN=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_CAN_RUN_OFFICIAL_IMPORT_BYPASSED=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_FAIL_CLOSED_GUARDS_WEAKENED=NO",
  "A16R_OWNER_ADMIN_IMPORT_PERMISSION_WRANGLER_TOML_CHANGED=NO",
  "No permission grant was performed.",
  "No user role update was performed.",
  "No auth/user/membership mutation was performed.",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "No real genealogy data write.",
  "No SQL, Supabase DB push, migration repair or seed.",
  "No Windows-local deploy.",
  "Main Worker source touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "NONE_FOR_THIS_PHASE_PERMISSION_DIAGNOSIS_DOCS_CHECKER_ONLY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [ownerRetryDoc, "A16R_AUTH_OWNER_GATE_SMOKE_RETRY_STATUS=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT", "owner retry status"],
  [authSmokeDoc, "A16R_AUTHENTICATED_OFFICIAL_IMPORT_GATE_CLASSIFICATION=BLOCKED_AUTH_OR_PERMISSION_INSUFFICIENT", "previous auth smoke classification"],
  [readinessDoc, "A16R_OFFICIAL_IMPORT_GATE_READINESS_CLASSIFICATION=UNKNOWN_NEEDS_AUTHENTICATED_SMOKE", "readiness previous classification"],
  [importPage, "context.permissions.includes(\"imports.create\")", "import page imports.create"],
  [importPage, "!context.user", "import page missing user branch"],
  [manifestReadService, "context.permissions.includes(\"imports.create\")", "manifest imports.create"],
  [manifestReadService, "httpStatus === 401 ? \"unauthenticated\" : \"forbidden\"", "manifest 401/403 status"],
  [permissionService, "getCurrentAuthUser", "permission context auth user"],
  [permissionService, ".from(\"profiles\")", "permission context profiles"],
  [permissionService, ".from(\"profile_roles\")", "permission context profile roles"],
  [permissionService, ".from(\"role_permissions\")", "permission context role permissions"],
  [permissionService, ".from(\"permissions\")", "permission context permissions"],
  [permissionTypes, "| \"OWNER\"", "permission type OWNER"],
  [permissionTypes, "| \"ADMIN\"", "permission type ADMIN"],
  [permissionTypes, "| \"imports.create\"", "permission type imports.create"],
  [postRoute, "permissionContext.permissions.includes(\"imports.create\")", "POST imports.create"],
  [postRoute, "permissionContext.permissions.includes(\"people.create\")", "POST people.create"],
  [postRoute, "permissionContext.permissions.includes(\"relationships.create\")", "POST relationships.create"],
  [postRoute, "permissionContext.permissions.includes(\"permissions.manage\")", "POST permissions.manage"],
  [gateRoute, "export async function GET", "gate route GET only"],
  [gateService, "canOpenOfficialImport: false", "gate canOpen false"],
  [gateService, "officialImportEnabled: false", "gate enabled false"],
  [officialImportService, "canRunOfficialImport: false", "service fail closed"],
  [officialImportService, "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY", "service runtime blocker"],
  [panel, "aria-disabled=\"true\"", "panel disabled button"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16r-owner-admin-import-permission-diagnosis"] !==
  "node scripts/check-a16r-owner-admin-import-permission-diagnosis.cjs"
) {
  failures.push("missing package script check:a16r-owner-admin-import-permission-diagnosis");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS.md", "index diagnosis entry"],
  [workLog, "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_STATUS=DIAGNOSED_READ_ONLY_NO_MUTATION", "work log diagnosis status"],
  [decisionLog, "A-16R owner/admin import permission blocker is auth session missing until owner login is proven", "decision log diagnosis decision"],
  [handoff, "A16R_OWNER_ADMIN_IMPORT_PERMISSION_DIAGNOSIS_STATUS=DIAGNOSED_READ_ONLY_NO_MUTATION", "handoff diagnosis status"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(doc, /\.rpc\s*\(/i, "doc must not call RPC");
rejectPattern(doc, /fetch\s*\([\s\S]{0,240}\/official-import/i, "doc must not call official import");
rejectPattern(doc, /canRunOfficialImport:\s*true/, "doc must not open canRunOfficialImport");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/, "doc must not allow retry");
rejectPattern(doc, /ROLES_PERMISSIONS_MUTATED=YES/, "doc must not mutate roles");
rejectPattern(doc, /AUTH_USERS_MEMBERSHIPS_MUTATED=YES/, "doc must not mutate auth/users/memberships");
rejectPattern(doc, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  "docs/PLAN_A16R_OWNER_AUTH_GATE_SMOKE_AND_EVIDENCE_BUNDLE.md",
  "docs/PLAN_A16R_PRODUCTION_UI_GATE_STATE_RECONCILIATION.md",
  packagePath,
  "scripts/check-a16r-owner-auth-gate-smoke-and-evidence-bundle.cjs",
  "scripts/check-a16r-production-ui-gate-state-reconciliation.cjs",
  "scripts/check-a16k-owner-approval-gate-dry-run-import.cjs",
  "scripts/check-a16r-owner-admin-import-permission-diagnosis.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
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
  console.error("A-16R owner/admin import permission diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R owner/admin import permission diagnosis check passed.");

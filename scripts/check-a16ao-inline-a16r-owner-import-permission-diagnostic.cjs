#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AO_INLINE_A16R_OWNER_IMPORT_PERMISSION_DIAGNOSTIC.md";
const checkerPath =
  "scripts/check-a16ao-inline-a16r-owner-import-permission-diagnostic.cjs";
const packagePath = "package.json";
const pagePath = "app/(admin)/admin/exports/import/page.tsx";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const a16arClientPath =
  "components/imports/a16r-official-import-confirmation-client.tsx";

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
const checker = read(checkerPath);
const page = read(pagePath);
const panel = read(panelPath);
const a16arClient = read(a16arClientPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AO - Inline A-16R Owner Import Permission Diagnostic",
  "A16AO_STATUS=PASS_INLINE_READ_ONLY_DIAGNOSTIC_ADDED_FAIL_CLOSED",
  "A16AN_BLOCKER=AUTHENTICATED_PROFILE_ROLE_ASSIGNMENT_MISSING_OR_WRONG_ACCOUNT_CONTEXT",
  "A16AO_UI_PATH=/admin/exports/import",
  "A16AO_INLINE_BLOCK=Cổng nhập chính thức A-16R",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AO_TEMP_DIAGNOSTIC_CLEANUP_TODO=YES",
  "A16AO_FIELD_CURRENT_ACCOUNT_EMAIL=YES_SAFE_RUNTIME_VALUE_ONLY",
  "A16AO_FIELD_CURRENT_USER_ID=YES_SAFE_RUNTIME_VALUE_ONLY",
  "A16AO_FIELD_CURRENT_PROFILE_ID=YES_SAFE_RUNTIME_VALUE_ONLY",
  "A16AO_FIELD_CURRENT_ROLE=YES",
  "A16AO_FIELD_VISIBLE_PERMISSION_COUNT=YES",
  "A16AO_FIELD_IMPORTS_CREATE_PRESENT_MISSING=YES",
  "A16AO_FIELD_OFFICIAL_IMPORT_PERMISSION_PRESENT_MISSING=permissions.manage",
  "A16AO_FIELD_OWNER_ADMIN_IMPORT_CONTEXT=YES",
  "A16AO_FIELD_A16R_BUTTON_LOCK_REASON=YES",
  "A16AO_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AO_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AO_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AO_SQL_RUN=NO",
  "A16AO_DB_MUTATION_RUN=NO",
  "A16AO_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AO_DEPLOY_RUN=NO",
  "A16AO_PRIVATE_DATA_COMMITTED=NO",
  "A16AO_NEXT_ACTION=OWNER_RECHECK_PRODUCTION_A16R_BLOCK_INLINE_DIAGNOSTIC_WITH_AUTHENTICATED_OWNER_ADMIN_CONTEXT_NO_POST",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [page, "a16rPermissionDiagnostic", "page builds diagnostic"],
  [page, "accountEmail: context.user?.email ?? null", "page includes account email runtime value"],
  [page, "userId: context.user?.id ?? null", "page includes user id runtime value"],
  [page, "profileId: context.profile?.id ?? null", "page includes profile id runtime value"],
  [page, "visiblePermissionCount: context.permissions.length", "page includes permission count"],
  [page, "hasImportsCreate: context.permissions.includes(\"imports.create\")", "page checks imports.create"],
  [page, "hasPermissionsManage: context.permissions.includes(\"permissions.manage\")", "page checks permissions.manage"],
  [page, "role === \"OWNER\" || role === \"ADMIN\"", "page checks owner/admin role"],
  [page, "missingStrictPermissions", "page computes missing strict permissions"],
  [panel, "Cổng nhập chính thức A-16R", "existing A-16R block"],
  [panel, "Chẩn đoán tạm thời A-16AO về quyền owner/admin", "inline diagnostic heading"],
  [panel, "Tài khoản hiện tại", "account field"],
  [panel, "User ID", "user id field"],
  [panel, "Profile ID", "profile id field"],
  [panel, "Vai trò hiện tại", "role field"],
  [panel, "Số quyền thấy được", "permission count field"],
  [panel, "imports.create", "imports.create field"],
  [panel, "permissions.manage (official import)", "official import permission field"],
  [panel, "OWNER/ADMIN import context", "owner/admin context field"],
  [panel, "Lý do nút A-16R vẫn khóa", "lock reason field"],
  [panel, "A16R_LOCKED_OWNER_ADMIN_ROLE_MISSING", "role lock reason"],
  [panel, "A16R_LOCKED_IMPORTS_CREATE_MISSING", "imports.create lock reason"],
  [panel, "A16R_LOCKED_PERMISSIONS_MANAGE_MISSING", "permissions.manage lock reason"],
  [panel, "A16AR_LOCKED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_PROVEN", "A-16AR owner/admin lock reason"],
  [panel, "disabled", "official import button disabled"],
  [a16arClient, "aria-disabled={!submitAllowed}", "official import aria-disabled"],
  [index, "PLAN_A16AO_INLINE_A16R_OWNER_IMPORT_PERMISSION_DIAGNOSTIC.md", "index entry"],
  [workLog, "A16AO_STATUS=PASS_INLINE_READ_ONLY_DIAGNOSTIC_ADDED_FAIL_CLOSED", "work log status"],
  [handoff, "A16AO_TEMP_DIAGNOSTIC_CLEANUP_TODO=YES", "handoff cleanup TODO"],
]) {
  requireIncludes(content, token, label);
}

const a16rBlockCount = (panel.match(/Cổng nhập chính thức A-16R/g) ?? []).length;
if (a16rBlockCount !== 1) {
  failures.push(`expected one existing A-16R block, found ${a16rBlockCount}`);
}

if (
  packageJson?.scripts?.[
    "check:a16ao-inline-a16r-owner-import-permission-diagnostic"
  ] !==
  "node scripts/check-a16ao-inline-a16r-owner-import-permission-diagnostic.cjs"
) {
  failures.push(
    "missing package script check:a16ao-inline-a16r-owner-import-permission-diagnostic",
  );
}

rejectPattern(panel, /<section[\s\S]*Chẩn đoán tạm thời A-16AO[\s\S]*<\/section>[\s\S]*Cổng nhập chính thức A-16R/, "diagnostic must not precede A-16R block as separate section");
rejectPattern(page + panel + doc, /fetch\s*\([\s\S]{0,240}\/official-import/i, "must not call official import");
rejectPattern(page + panel + doc, /\.rpc\s*\(/i, "must not call RPC");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AO_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16AO_SQL_RUN=YES|A16AO_DB_MUTATION_RUN=YES/i, "DB/SQL mutation must remain NO");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AO|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16AO|official-import/i, "app layout must not change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  pagePath,
  panelPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/09_DECISION_LOG.md",
  "docs/PLAN_A16AR_OWNER_SAME_RUN_OFFICIAL_IMPORT_CONFIRMATION_UI_PLUMBING.md",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "scripts/check-a16aq-official-import-ui-runtime-locked-gate-diagnosis.cjs",
  "scripts/check-a16ap-owner-authenticated-official-import-execution-for-audited-session.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "components/imports/a16r-official-import-confirmation-client.tsx",
  "scripts/check-a16an-owner-admin-import-permission-context-diagnosis.cjs",
  "scripts/check-a16ak-official-import-session-duplicate-readiness.cjs",
  "scripts/check-a16am-owner-same-run-official-import-post-confirmation.cjs",
  "scripts/check-a16r-owner-admin-import-permission-diagnosis.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden changed file ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (file.startsWith(".tmp/") || file.startsWith(".tmp\\")) {
    failures.push(`forbidden raw temp evidence file ${file}`);
  }
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`forbidden raw data/evidence file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16AO inline A-16R owner import permission diagnostic check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AO inline A-16R owner import permission diagnostic check passed.");

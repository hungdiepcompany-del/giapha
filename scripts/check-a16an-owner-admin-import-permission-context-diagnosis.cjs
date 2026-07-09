#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AN_OWNER_ADMIN_IMPORT_PERMISSION_CONTEXT_DIAGNOSIS.md";
const checkerPath =
  "scripts/check-a16an-owner-admin-import-permission-context-diagnosis.cjs";
const packagePath = "package.json";
const permissionServicePath = "lib/permissions/permission-service.ts";
const importPagePath = "app/(admin)/admin/exports/import/page.tsx";
const postRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const officialImportServicePath = "lib/import/giapha4/official-import-service.ts";
const foundationMigrationPath =
  "db/migrations/20260614_0001_foundation_auth_roles_permissions.sql";
const ownerSnippetPath = "db/snippets/assign-owner-role.sql";

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
const packageJson = readJson(packagePath);
const permissionService = read(permissionServicePath);
const importPage = read(importPagePath);
const postRoute = read(postRoutePath);
const officialImportService = read(officialImportServicePath);
const foundationMigration = read(foundationMigrationPath);
const ownerSnippet = read(ownerSnippetPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AN - Owner/Admin Import Permission Context Diagnosis",
  "A16AN_STATUS=DIAGNOSED_READ_ONLY_OWNER_ADMIN_PERMISSION_CONTEXT_BLOCKED",
  "A16AN_CLASSIFICATION=AUTHENTICATED_PROFILE_HAS_NO_ROLE_ASSIGNMENT_OR_WRONG_ACCOUNT_CONTEXT",
  "A16AM_BLOCKER=AUTHENTICATED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_AVAILABLE_OR_PERMISSION_INSUFFICIENT",
  "A16AN_BLOCKER=AUTHENTICATED_PROFILE_ROLE_ASSIGNMENT_MISSING_OR_WRONG_ACCOUNT_CONTEXT",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "NO_ROLE",
  "imports.create_MISSING",
  "A16AN_DB_READ_RUN=NO",
  "A16AN_EXACT_DB_STATE_PROVEN=NO",
  "A16AN_PERMISSION_CONTEXT_SOURCE=lib/permissions/permission-service.ts",
  "Supabase Auth user -> profiles.auth_user_id -> profile_roles -> roles -> role_permissions -> permissions",
  "A16AN_SOURCE_NO_ROLE_REASON=no_roles",
  "context.permissions.includes(\"imports.create\")",
  "imports.create,people.create,relationships.create,permissions.manage",
  "OWNER",
  "ADMIN",
  "db/migrations/20260614_0001_foundation_auth_roles_permissions.sql",
  "db/snippets/assign-owner-role.sql",
  "intentionally redacted",
  "A16AN_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AN_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AN_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AN_SQL_RUN=NO",
  "A16AN_DB_MUTATION_RUN=NO",
  "A16AN_DB_PUSH_RUN=NO",
  "A16AN_MIGRATION_REPAIR_RUN=NO",
  "A16AN_SEED_RUN=NO",
  "A16AN_DEPLOY_RUN=NO",
  "A16AN_WRANGLER_DEPLOY_RUN=NO",
  "A16AN_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AN_REAL_GENEALOGY_WRITE=NO",
  "A16AN_RAW_JSON_COMMITTED=NO",
  "A16AN_PRIVATE_DATA_PRINTED=NO",
  "A16AN_WRANGLER_TOML_CHANGED=NO",
  "A16AN_APP_LAYOUT_TSX_CHANGED=NO",
  "Main Worker source touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "Worker size risk: NO",
  "NONE_FOR_THIS_PHASE_PERMISSION_CONTEXT_DIAGNOSIS_DOCS_CHECKER_ONLY",
  "A16AN_NEXT_ACTION=OWNER_VERIFY_EXPECTED_ACCOUNT_AND_OWNER_ADMIN_ROLE_ASSIGNMENT_READ_ONLY_THEN_RERUN_AUTHENTICATED_IMPORT_GATE_NO_POST",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [permissionService, "getCurrentAuthUser", "permission service auth user"],
  [permissionService, ".from(\"profiles\")", "permission service profiles"],
  [permissionService, ".from(\"profile_roles\")", "permission service profile_roles"],
  [permissionService, "reason: \"no_roles\"", "permission service no_roles"],
  [permissionService, ".from(\"roles\")", "permission service roles"],
  [permissionService, ".from(\"role_permissions\")", "permission service role_permissions"],
  [permissionService, ".from(\"permissions\")", "permission service permissions"],
  [importPage, "context.permissions.includes(\"imports.create\")", "import page imports.create gate"],
  [postRoute, "permissionContext.permissions.includes(\"imports.create\")", "POST imports.create"],
  [postRoute, "permissionContext.permissions.includes(\"people.create\")", "POST people.create"],
  [postRoute, "permissionContext.permissions.includes(\"relationships.create\")", "POST relationships.create"],
  [postRoute, "permissionContext.permissions.includes(\"permissions.manage\")", "POST permissions.manage"],
  [officialImportService, "context.permissions.includes(\"imports.create\")", "service imports.create"],
  [officialImportService, "context.permissions.includes(\"people.create\")", "service people.create"],
  [officialImportService, "context.permissions.includes(\"relationships.create\")", "service relationships.create"],
  [officialImportService, "context.permissions.includes(\"permissions.manage\")", "service permissions.manage"],
  [foundationMigration, "where r.code in ('OWNER', 'ADMIN')", "OWNER ADMIN all permissions"],
  [foundationMigration, "cross join public.permissions p", "all permission catalog assignment"],
  [ownerSnippet, "where lower(email) = lower(", "owner snippet account source"],
  [ownerSnippet, "where code = 'OWNER'", "owner snippet owner role"],
  [index, "PLAN_A16AN_OWNER_ADMIN_IMPORT_PERMISSION_CONTEXT_DIAGNOSIS.md", "index entry"],
  [workLog, "A16AN_STATUS=DIAGNOSED_READ_ONLY_OWNER_ADMIN_PERMISSION_CONTEXT_BLOCKED", "work log status"],
  [decisionLog, "A-16AN diagnoses owner/admin import permission context as role assignment or account-context blocker", "decision log entry"],
  [handoff, "A16AN_STATUS=DIAGNOSED_READ_ONLY_OWNER_ADMIN_PERMISSION_CONTEXT_BLOCKED", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16an-owner-admin-import-permission-context-diagnosis"
  ] !==
  "node scripts/check-a16an-owner-admin-import-permission-context-diagnosis.cjs"
) {
  failures.push(
    "missing package script check:a16an-owner-admin-import-permission-context-diagnosis",
  );
}

rejectPattern(doc, /POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AN_SQL_RUN=YES/i, "SQL must not run");
rejectPattern(doc, /A16AN_DB_MUTATION_RUN=YES/i, "DB mutation must not run");
rejectPattern(doc, /A16AN_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=YES/i, "auth/role mutation must not run");
rejectPattern(doc, /fetch\s*\([\s\S]{0,240}\/official-import/i, "doc must not call official import");
rejectPattern(doc, /\.rpc\s*\(/i, "doc must not call RPC");
rejectPattern(doc, /canRunOfficialImport:\s*true/i, "doc must not open runtime gate");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AN|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16AN|official-import/i, "app layout must not change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16am-owner-same-run-official-import-post-confirmation.cjs",
  "scripts/check-a16r-owner-admin-import-permission-diagnosis.cjs",
  "scripts/check-a16r-authenticated-owner-import-gate-smoke-retry.cjs",
  "scripts/check-a16r-authenticated-official-import-gate-smoke.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
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
  console.error("A-16AN owner/admin import permission context diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AN owner/admin import permission context diagnosis check passed.");

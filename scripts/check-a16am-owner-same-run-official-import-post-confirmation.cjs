#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AM_OWNER_SAME_RUN_OFFICIAL_IMPORT_POST_CONFIRMATION.md";
const checkerPath =
  "scripts/check-a16am-owner-same-run-official-import-post-confirmation.cjs";
const packagePath = "package.json";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const handoffPath = "docs/99_NEXT_AI_HANDOFF.md";
const workLogPath = "docs/08_AI_WORK_LOG.md";
const decisionLogPath = "docs/09_DECISION_LOG.md";
const indexPath = "docs/00_INDEX.md";
const sessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";
const runtimeMarker = "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY";
const sessionMarker =
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

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
const route = read(routePath);
const packageJson = readJson(packagePath);
const index = read(indexPath);
const workLog = read(workLogPath);
const decisionLog = read(decisionLogPath);
const handoff = read(handoffPath);
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AM - Owner Same-run Official Import POST Confirmation",
  "A16AM_STATUS=BLOCKED_BEFORE_POST_AUTH_PERMISSION_INSUFFICIENT",
  "A16AM_CLASSIFICATION=AUTHENTICATED_CONTEXT_PRESENT_BUT_NOT_OWNER_ADMIN_IMPORT_CONTEXT",
  "A16R_IMPORT_RETRY_NEXT=NO",
  `A16AM_TARGET_SESSION_ID=${sessionId}`,
  runtimeMarker,
  sessionMarker,
  "A16AM_UI_PATH=/admin/exports/import",
  "A16AM_AUTHENTICATED_USER_IDENTITY=REDACTED_AUTHENTICATED_NON_OWNER_CONTEXT",
  "A16AM_AUTHENTICATED_USER_ROLE=NO_ROLE",
  "A16AM_VISIBLE_PERMISSION_COUNT=0",
  "A16AM_UI_IMPORT_PERMISSION=imports.create_MISSING",
  "A16AM_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AM_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AM_IMPORT_RESULT=NOT_EXECUTED",
  "A16AM_BLOCKER=AUTHENTICATED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_AVAILABLE_OR_PERMISSION_INSUFFICIENT",
  "A16AM_ROUTE_REQUIRES_USER=YES",
  "A16AM_ROUTE_REQUIRES_STRICT_PERMISSIONS=imports.create,people.create,relationships.create,permissions.manage",
  "A16AM_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AM_SQL_RUN=NO",
  "A16AM_DB_PUSH_RUN=NO",
  "A16AM_MIGRATION_REPAIR_RUN=NO",
  "A16AM_SEED_RUN=NO",
  "A16AM_DEPLOY_RUN=NO",
  "A16AM_WRANGLER_DEPLOY_RUN=NO",
  "A16AM_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AM_REAL_GENEALOGY_WRITE=NO",
  "A16AM_RAW_JSON_COMMITTED=NO",
  "A16AM_PRIVATE_JSON_PRINTED=NO",
  "A16AM_WRANGLER_TOML_CHANGED=NO",
  "A16AM_APP_LAYOUT_TSX_CHANGED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [route, "if (!permissionContext.user)", "route unauthenticated guard"],
  [route, "imports.create", "route imports.create permission"],
  [route, "people.create", "route people.create permission"],
  [route, "relationships.create", "route relationships.create permission"],
  [route, "permissions.manage", "route permissions.manage permission"],
  [route, "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED", "route candidate env gate"],
  [route, "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED", "route execution env gate"],
  [route, "confirmRuntimeExecutionEnablementMarker", "route runtime marker confirmation"],
  [route, "confirmMarker: body.confirmMarker", "route session marker confirmation"],
  [route, "confirmSessionId: body.confirmSessionId", "route session id confirmation"],
  [index, "PLAN_A16AM_OWNER_SAME_RUN_OFFICIAL_IMPORT_POST_CONFIRMATION.md", "index entry"],
  [workLog, "A16AM_STATUS=BLOCKED_BEFORE_POST_AUTH_PERMISSION_INSUFFICIENT", "work log status"],
  [decisionLog, "A-16AM blocks before POST when authenticated context lacks strict import permissions", "decision log entry"],
  [handoff, "A16AM_STATUS=BLOCKED_BEFORE_POST_AUTH_PERMISSION_INSUFFICIENT", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16am-owner-same-run-official-import-post-confirmation"
  ] !==
  "node scripts/check-a16am-owner-same-run-official-import-post-confirmation.cjs"
) {
  failures.push(
    "missing package script check:a16am-owner-same-run-official-import-post-confirmation",
  );
}

rejectPattern(doc, /A16AM_POST_OFFICIAL_IMPORT_CALLED=YES/i, "A-16AM must not call POST");
rejectPattern(doc, /A16AM_A16R_IMPORT_RETRY_EXECUTED=YES/i, "A-16AM retry must not execute");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AM_IMPORT_RESULT=IMPORT_COMPLETED/i, "A-16AM import must not complete");
rejectPattern(
  doc + index + workLog + decisionLog + handoff,
  /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i,
  "secret-like token",
);
rejectPattern(wrangler, /A16AM|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16AM|official-import/i, "app layout must not change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  packagePath,
  indexPath,
  workLogPath,
  decisionLogPath,
  handoffPath,
  "scripts/check-a16aa-relationship-audit-warning-review-import-retry-readiness.cjs",
  "scripts/check-a16ab-import-retry-preflight-approval-gate.cjs",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16ak-official-import-session-duplicate-readiness.cjs",
  "scripts/check-a16al-official-import-runtime-marker-alignment.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16x2-correct-a16o-full-relationship-audit-export-shape-verification.cjs",
  "docs/PLAN_A16AN_OWNER_ADMIN_IMPORT_PERMISSION_CONTEXT_DIAGNOSIS.md",
  "scripts/check-a16an-owner-admin-import-permission-context-diagnosis.cjs",
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
  console.error("A-16AM owner same-run official import POST confirmation check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AM owner same-run official import POST confirmation check passed.");

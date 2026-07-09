#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AP_OWNER_AUTHENTICATED_OFFICIAL_IMPORT_EXECUTION_FOR_AUDITED_SESSION.md";
const checkerPath =
  "scripts/check-a16ap-owner-authenticated-official-import-execution-for-audited-session.cjs";
const packagePath = "package.json";
const indexPath = "docs/00_INDEX.md";
const workLogPath = "docs/08_AI_WORK_LOG.md";
const handoffPath = "docs/99_NEXT_AI_HANDOFF.md";
const sessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

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
const index = read(indexPath);
const workLog = read(workLogPath);
const handoff = read(handoffPath);
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AP - Owner Authenticated Official Import Execution For Audited Session",
  "A16AP_STATUS=BLOCKED_BEFORE_POST_UI_RUNTIME_NOT_EXECUTION_CAPABLE",
  `A16AP_TARGET_SESSION_ID=${sessionId}`,
  "A16AP_OWNER_PERMISSION_CONTEXT=PASS_SANITIZED_OWNER_ADMIN_CONTEXT",
  "A16AP_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AP_IMPORT_RESULT=NOT_EXECUTED",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AP_OFFICIAL_IMPORT_BUTTON_STATE=DISABLED",
  "A16AP_DISABLED_BUTTON_LABEL=Xác nhận nhập chính thức - đang khóa",
  "A16AP_A16R_BLOCK_STILL_REPORTS_LOCKED=YES",
  "A16AP_SAME_RUN_GET_GATE_JSON=UNAVAILABLE_BROWSER_BLOCKED_BY_CLIENT",
  "A16AP_BLOCKER=OFFICIAL_IMPORT_UI_RUNTIME_GATE_REMAINS_LOCKED_BUTTON_DISABLED_SAME_RUN_ROUTE_NOT_EXECUTION_CAPABLE",
  "A16AP_GATE_OWNER_ADMIN_CONTEXT=PASS",
  "A16AP_GATE_TARGET_SESSION_MATCH=PASS",
  "A16AP_GATE_EXECUTION_CAPABLE=FAIL_BUTTON_DISABLED",
  "A16AP_POST_OFFICIAL_IMPORT_CALLED_EXACTLY_ONCE=NO_NOT_CALLED",
  "A16AP_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AP_SQL_RUN=NO",
  "A16AP_DB_MUTATION_OUTSIDE_APPROVED_ROUTE=NO",
  "A16AP_DB_PUSH_RUN=NO",
  "A16AP_MIGRATION_REPAIR_RUN=NO",
  "A16AP_SEED_RUN=NO",
  "A16AP_DEPLOY_RUN=NO",
  "A16AP_WRANGLER_DEPLOY_RUN=NO",
  "A16AP_AUTH_USER_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AP_UNRELATED_GENEALOGY_MUTATION=NO",
  "A16AP_RAW_JSON_COMMITTED=NO",
  "A16AP_PRIVATE_DATA_PRINTED=NO",
  "A16AP_PRIVATE_DATA_COMMITTED=NO",
  "A16AP_WRANGLER_TOML_CHANGED=NO",
  "A16AP_APP_LAYOUT_TSX_CHANGED=NO",
  "A16AP_NEXT_ACTION=DIAGNOSE_WHY_OWNER_MARKERS_AND_PERMISSION_CONTEXT_DO_NOT_ENABLE_SAME_RUN_OFFICIAL_IMPORT_ROUTE_OR_BUTTON",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [
    index,
    "PLAN_A16AP_OWNER_AUTHENTICATED_OFFICIAL_IMPORT_EXECUTION_FOR_AUDITED_SESSION.md",
    "index entry",
  ],
  [workLog, "A16AP_STATUS=BLOCKED_BEFORE_POST_UI_RUNTIME_NOT_EXECUTION_CAPABLE", "work log status"],
  [handoff, "A16AP_BLOCKER=OFFICIAL_IMPORT_UI_RUNTIME_GATE_REMAINS_LOCKED_BUTTON_DISABLED_SAME_RUN_ROUTE_NOT_EXECUTION_CAPABLE", "handoff blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16ap-owner-authenticated-official-import-execution-for-audited-session"
  ] !==
  "node scripts/check-a16ap-owner-authenticated-official-import-execution-for-audited-session.cjs"
) {
  failures.push(
    "missing package script check:a16ap-owner-authenticated-official-import-execution-for-audited-session",
  );
}

rejectPattern(doc, /A16AP_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must not be recorded as called");
rejectPattern(doc, /A16AP_IMPORT_RESULT=EXECUTED|IMPORT_COMPLETED/i, "import must not be recorded as executed");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AP_GATE_EXECUTION_CAPABLE=PASS/i, "execution-capable gate must not pass");
rejectPattern(doc, /A16AP_SQL_RUN=YES|A16AP_DB_PUSH_RUN=YES|A16AP_DEPLOY_RUN=YES/i, "forbidden mutation/deploy status");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AP|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16AP|official-import/i, "app layout must not change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  "docs/PLAN_A16AQ_OFFICIAL_IMPORT_UI_RUNTIME_LOCKED_GATE_DIAGNOSIS.md",
  "scripts/check-a16aq-official-import-ui-runtime-locked-gate-diagnosis.cjs",
  "docs/PLAN_A16AR_OWNER_SAME_RUN_OFFICIAL_IMPORT_CONFIRMATION_UI_PLUMBING.md",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "components/imports/import-session-manifest-panel.tsx",
  "components/imports/a16r-official-import-confirmation-client.tsx",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "docs/09_DECISION_LOG.md",
  "scripts/check-a16ao-inline-a16r-owner-import-permission-diagnostic.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  packagePath,
  indexPath,
  workLogPath,
  handoffPath,
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
  console.error("A-16AP owner authenticated official import execution check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AP owner authenticated official import execution check passed.");

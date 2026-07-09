#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AQ_OFFICIAL_IMPORT_UI_RUNTIME_LOCKED_GATE_DIAGNOSIS.md";
const checkerPath =
  "scripts/check-a16aq-official-import-ui-runtime-locked-gate-diagnosis.cjs";
const packagePath = "package.json";
const indexPath = "docs/00_INDEX.md";
const workLogPath = "docs/08_AI_WORK_LOG.md";
const handoffPath = "docs/99_NEXT_AI_HANDOFF.md";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const preflightPath = "lib/import/giapha4/official-import-preflight-gate.ts";
const reviewPackPath = "lib/import/giapha4/import-review-pack-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";

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
const panel = read(panelPath);
const preflight = read(preflightPath);
const reviewPack = read(reviewPackPath);
const route = read(routePath);
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AQ - Official Import UI Runtime Locked Gate Diagnosis",
  "A16AQ_STATUS=DIAGNOSED_SOURCE_UI_RUNTIME_GATE_FAIL_CLOSED",
  "A16AP_BLOCKER=OFFICIAL_IMPORT_UI_RUNTIME_GATE_REMAINS_LOCKED_BUTTON_DISABLED_SAME_RUN_ROUTE_NOT_EXECUTION_CAPABLE",
  "A16AQ_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AQ_DISABLED_CONDITION_PERMISSION_CONTEXT=NO_LONGER_BLOCKING_OWNER_ADMIN_PASS",
  "A16AQ_DISABLED_CONDITION_SESSION_MISMATCH=NO_AUDITED_SESSION_BOUND",
  "A16AQ_DISABLED_CONDITION_DUPLICATE_DECISIONS=NO_VISIBLE_BLOCKER_FROM_A16AP",
  "A16AQ_DISABLED_CONDITION_REVIEW_PACK_READINESS=NO_VISIBLE_OWNER_REVIEW_BLOCKER_FROM_A16AP",
  "A16AQ_DISABLED_CONDITION_UI_BUTTON=HARD_DISABLED_IN_IMPORT_SESSION_MANIFEST_PANEL",
  "A16AQ_DISABLED_CONDITION_UI_LOCK_REASON=A16R_LOCKED_BY_PHASE_BOUNDARY_NO_POST_IN_A16AO_AFTER_OWNER_PERMISSION_PASS",
  "A16AQ_DISABLED_CONDITION_PREFLIGHT_GATE=OFFICIAL_IMPORT_PREFLIGHT_GATE_ALWAYS_READ_ONLY_CAN_OPEN_FALSE_ENABLED_FALSE",
  "A16AQ_DISABLED_CONDITION_REVIEW_PACK_FLAGS=CAN_PROCEED_TO_OFFICIAL_IMPORT_FALSE_READY_FOR_OFFICIAL_IMPORT_FALSE_BY_DESIGN",
  "A16AQ_DISABLED_CONDITION_POST_ROUTE=POST_ROUTE_NOT_REACHED_BY_UI_REQUIRES_CONFIRMATION_BODY_AND_ENV_FLAGS",
  "A16AQ_DIRECT_GET_GATE_BLOCKER=CHROME_ERR_BLOCKED_BY_CLIENT_TOOLING_ONLY_NOT_APP_LOCK_SOURCE",
  "A16AQ_MISSING_MARKER_PLUMBING=YES_UI_DOES_NOT_SUBMIT_REQUIRED_CONFIRMATION_BODY",
  "A16AQ_ROUTE_FLAG_ENV_STATUS=UNKNOWN_NOT_READ_NO_SECRET_OR_PRODUCTION_ENV_INSPECTION",
  "A16AQ_EXECUTION_BRANCH_ENV_STATUS=UNKNOWN_NOT_READ_NO_SECRET_OR_PRODUCTION_ENV_INSPECTION",
  "A16AQ_BROWSER_GET_BLOCKER_IS_SOURCE_BLOCKER=NO",
  "A16AQ_DISABLED_CLASSIFICATION=SOURCE_UI_PREFLIGHT_REVIEW_PACK_STILL_FAIL_CLOSED_NO_POST_PLUMBING",
  "A16AQ_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AQ_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AQ_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AQ_SQL_RUN=NO",
  "A16AQ_DB_MUTATION_RUN=NO",
  "A16AQ_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AQ_GENEALOGY_MUTATION=NO",
  "A16AQ_DEPLOY_RUN=NO",
  "A16AQ_WRANGLER_DEPLOY_RUN=NO",
  "A16AQ_RAW_JSON_COMMITTED=NO",
  "A16AQ_PRIVATE_DATA_PRINTED=NO",
  "A16AQ_WRANGLER_TOML_CHANGED=NO",
  "A16AQ_APP_LAYOUT_TSX_CHANGED=NO",
  "A16AQ_NEXT_ACTION=IMPLEMENT_MINIMAL_OWNER_SAME_RUN_CONFIRMATION_UI_OR_OPERATOR_RUNTIME_GATE_THAT_SUBMITS_REQUIRED_CONFIRMATION_BODY_ONLY_AFTER_ALL_GATES_PASS",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [panel, "A16R_LOCKED_BY_PHASE_BOUNDARY_NO_POST_IN_A16AO", "panel phase-boundary lock reason"],
  [panel, "disabled", "panel disabled official import button"],
  [panel, "aria-disabled=\"true\"", "panel aria-disabled official import button"],
  [preflight, "canOpenOfficialImport: false", "preflight canOpen false"],
  [preflight, "officialImportEnabled: false", "preflight enabled false"],
  [reviewPack, "canProceedToOfficialImport: false", "review pack canProceed false"],
  [reviewPack, "readyForOfficialImport: false", "review pack ready false"],
  [route, "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED", "route candidate env gate"],
  [route, "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED", "route execution env gate"],
  [route, "confirmRuntimeExecutionEnablementMarker", "route runtime marker body"],
  [route, "confirmSessionId: body.confirmSessionId", "route session confirmation body"],
  [index, "PLAN_A16AQ_OFFICIAL_IMPORT_UI_RUNTIME_LOCKED_GATE_DIAGNOSIS.md", "index entry"],
  [workLog, "A16AQ_STATUS=DIAGNOSED_SOURCE_UI_RUNTIME_GATE_FAIL_CLOSED", "work log status"],
  [handoff, "A16AQ_DISABLED_CLASSIFICATION=SOURCE_UI_PREFLIGHT_REVIEW_PACK_STILL_FAIL_CLOSED_NO_POST_PLUMBING", "handoff classification"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16aq-official-import-ui-runtime-locked-gate-diagnosis"
  ] !==
  "node scripts/check-a16aq-official-import-ui-runtime-locked-gate-diagnosis.cjs"
) {
  failures.push(
    "missing package script check:a16aq-official-import-ui-runtime-locked-gate-diagnosis",
  );
}

rejectPattern(doc, /A16AQ_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16AQ_A16R_IMPORT_RETRY_EXECUTED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R import retry must remain NO");
rejectPattern(doc, /A16AQ_SQL_RUN=YES|A16AQ_DB_MUTATION_RUN=YES|A16AQ_DEPLOY_RUN=YES/i, "forbidden mutation/deploy status");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AQ|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16AQ|official-import/i, "app layout must not change");

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
  handoffPath,
  "scripts/check-a16ap-owner-authenticated-official-import-execution-for-audited-session.cjs",
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
  console.error("A-16AQ official import UI runtime locked gate diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AQ official import UI runtime locked gate diagnosis check passed.");

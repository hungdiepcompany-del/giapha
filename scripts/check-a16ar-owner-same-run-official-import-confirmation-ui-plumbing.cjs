#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AR_OWNER_SAME_RUN_OFFICIAL_IMPORT_CONFIRMATION_UI_PLUMBING.md";
const checkerPath =
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs";
const packagePath = "package.json";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const clientPath =
  "components/imports/a16r-official-import-confirmation-client.tsx";
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
const panel = read(panelPath);
const client = read(clientPath);
const route = read(routePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AR - Owner Same-run Official Import Confirmation UI Plumbing",
  "A16AR_STATUS=PASS_SOURCE_UI_CONFIRMATION_PLUMBING_ADDED_NOT_EXECUTED",
  "A16AR_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16AR_APPROVED_POST_ROUTE=/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "canOpenOfficialImport=true",
  "officialImportEnabled=true",
  "A16AR_UI_PLUMBING=ADDED",
  "A16AR_BUTTON_DEFAULT_STATE=DISABLED_FAIL_CLOSED",
  "A16AR_FINAL_CONFIRMATION_STATE=YES_SESSION_ID_INCLUDED",
  "A16AR_CLIENT_REPEAT_SUBMIT_PROTECTION=YES",
  "A16AR_SINGLE_POST_PATH=YES_APPROVED_ROUTE_ONLY",
  "A16AR_SERVER_SIDE_GATES_STILL_ENFORCED=YES",
  "A16AR_ROUTE_EXECUTION_BRANCH_DISABLED_RESPONSE=LOCKED",
  "A16AR_IMPORT_EXECUTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AR_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16AR_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16AR_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AR_SQL_RUN=NO",
  "A16AR_DB_MUTATION_RUN=NO",
  "A16AR_MIGRATION_REPAIR_RUN=NO",
  "A16AR_SEED_RUN=NO",
  "A16AR_DEPLOY_RUN=NO",
  "A16AR_WRANGLER_DEPLOY_RUN=NO",
  "A16AR_AUTH_ROLE_PERMISSION_MEMBERSHIP_MUTATION=NO",
  "A16AR_GENEALOGY_MUTATION=NO",
  "A16AR_RAW_JSON_COMMITTED=NO",
  "A16AR_PRIVATE_DATA_PRINTED=NO",
  "A16AR_WRANGLER_TOML_CHANGED=NO",
  "A16AR_APP_LAYOUT_TSX_CHANGED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [panel, "A16ROfficialImportConfirmationClient", "panel imports client"],
  [panel, "a16rSameRunLockedReasons", "panel same-run locked reasons"],
  [panel, "A16AR_LOCKED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_PROVEN", "owner/admin gate"],
  [panel, "A16AR_LOCKED_AUDITED_SESSION_MISMATCH", "audited session gate"],
  [panel, "A16AR_LOCKED_REQUIRED_OWNER_MARKERS_MISSING_OR_MISMATCHED", "marker gate"],
  [panel, "A16AR_LOCKED_BLOCKED_ERRORS_OR_DRY_RUN_BLOCKERS_PRESENT", "blocked errors gate"],
  [panel, "A16AR_LOCKED_IMPORT_BLOCKING_WARNING_CATEGORY_PRESENT", "warning gate"],
  [panel, "A16AR_LOCKED_DUPLICATE_OR_REVIEW_PACK_BLOCKERS_PRESENT", "duplicate/review gate"],
  [panel, "A16AR_LOCKED_RUNTIME_CANDIDATE_ENV_DISABLED", "runtime env gate"],
  [panel, "A16AR_LOCKED_EXECUTION_BRANCH_ENV_DISABLED", "execution env gate"],
  [panel, "canOpenOfficialImport: a16rSameRunLockedReasons.length === 0", "preflight open true only no reasons"],
  [panel, "officialImportEnabled: a16rSameRunLockedReasons.length === 0", "preflight enabled true only no reasons"],
  [panel, "confirmRuntimeExecutionEnablementMarker", "confirmation runtime marker"],
  [panel, "confirmSessionId: A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID", "confirmation session id"],
  [client, "\"use client\";", "client component"],
  [client, "Final owner/admin confirmation before official import POST", "final confirmation state"],
  [client, "I confirm the audited A-16R session ID {sessionId}", "session id confirmation text"],
  [client, "const [submitting, setSubmitting] = useState(false)", "submitting guard"],
  [client, "const [hasSubmitted, setHasSubmitted] = useState(false)", "hasSubmitted guard"],
  [client, "if (!submitAllowed) return;", "submitAllowed guard"],
  [client, "method: \"POST\"", "single POST method"],
  [client, "body: JSON.stringify(confirmationBody)", "confirmation body"],
  [route, "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED", "route execution branch env"],
  [route, "A16AR_LOCKED_EXECUTION_BRANCH_ENV_DISABLED", "route locked disabled branch"],
  [route, "canRunOfficialImport: false", "route disabled branch cannot run"],
  [index, "PLAN_A16AR_OWNER_SAME_RUN_OFFICIAL_IMPORT_CONFIRMATION_UI_PLUMBING.md", "index entry"],
  [workLog, "A16AR_STATUS=PASS_SOURCE_UI_CONFIRMATION_PLUMBING_ADDED_NOT_EXECUTED", "work log status"],
  [decisionLog, "Decision 301 - A-16AR opens UI confirmation only behind same-run gates", "decision log entry"],
  [handoff, "A16AR_NEXT_ACTION=PUSH_AND_DEPLOY_A16AR_THEN_RUN_AUTHENTICATED_OWNER_READ_ONLY_UI_SMOKE_BEFORE_ANY_IMPORT_EXECUTION_PHASE", "handoff next action"],
]) {
  requireIncludes(content, token, label);
}

const officialImportFetches = (
  client.match(/fetch\s*\(\s*routePath[\s\S]{0,320}method:\s*"POST"/g) ?? []
).length;
if (officialImportFetches !== 1) {
  failures.push(`expected exactly one client official import POST path, found ${officialImportFetches}`);
}

if (
  packageJson?.scripts?.[
    "check:a16ar-owner-same-run-official-import-confirmation-ui-plumbing"
  ] !==
  "node scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs"
) {
  failures.push(
    "missing package script check:a16ar-owner-same-run-official-import-confirmation-ui-plumbing",
  );
}

rejectPattern(doc, /A16AR_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16AR_IMPORT_EXECUTED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R import retry must remain NO");
rejectPattern(doc, /A16AR_SQL_RUN=YES|A16AR_DB_MUTATION_RUN=YES|A16AR_DEPLOY_RUN=YES/i, "forbidden mutation/deploy status");
rejectPattern(panel + client, /\.rpc\s*\(/i, "client/panel must not call RPC");
rejectPattern(doc + checker, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, "private email literal");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AR|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16AR|official-import/i, "app layout must not change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  panelPath,
  clientPath,
  routePath,
  "scripts/check-a16aq-official-import-ui-runtime-locked-gate-diagnosis.cjs",
  "scripts/check-a16ap-owner-authenticated-official-import-execution-for-audited-session.cjs",
  "scripts/check-a16ao-inline-a16r-owner-import-permission-diagnostic.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "docs/PLAN_A16AS_A16AR_PRODUCTION_OWNER_READ_ONLY_UI_SMOKE.md",
  "scripts/check-a16as-a16ar-production-owner-read-only-ui-smoke.cjs",
  "docs/PLAN_A16AT_PRODUCTION_RUNTIME_EXECUTION_ENV_GATE_READINESS.md",
  "scripts/check-a16at-production-runtime-execution-env-gate-readiness.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
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
  console.error("A-16AR owner same-run official import confirmation UI plumbing check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AR owner same-run official import confirmation UI plumbing check passed.");

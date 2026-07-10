const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16BC_OWNER_APPROVAL_STATE_TRANSITION_READINESS.md";
const checkerPath = "scripts/check-a16bc-owner-approval-state-transition-readiness.cjs";
const servicePath =
  "lib/import/giapha4/import-session-owner-approval-state-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/owner-approval-state/route.ts";
const clientPath = "components/imports/a16bc-owner-approval-state-client.tsx";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const packagePath = "package.json";

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
const service = read(servicePath);
const route = read(routePath);
const client = read(clientPath);
const panel = read(panelPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const schema = read("supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql");
const rpc = read("supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql");

for (const token of [
  "A16BC_STATUS=PASS_SOURCE_CANDIDATE_NOT_EXECUTED_NOT_DEPLOYED",
  "A16BC_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16BC_STARTING_STORED_SESSION_STATE=preview_generated",
  "A16BC_EXECUTION_ELIGIBLE_STATE=owner_approved_for_db_write",
  "A16BC_EXISTING_TRANSITION_PATH=NO_APPROVED_UI_API_ACTION_FOUND",
  "preview_generated -> ready_for_owner_approval -> owner_approved_for_db_write",
  "POST /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/owner-approval-state",
  "APPROVE_A16BC_READY_FOR_OWNER_APPROVAL_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "APPROVE_A16BC_OWNER_APPROVED_FOR_DB_WRITE_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16BC_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BC_DIRECT_RPC_CALLED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16BC_NEXT_ACTION=A16BD_DEPLOY_AND_OWNER_STATE_TRANSITION_SMOKE_NO_OFFICIAL_IMPORT",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16BC_OWNER_APPROVAL_STATE_TRANSITION_MARKER",
  "A16BC_READY_FOR_OWNER_APPROVAL_MARKER",
  "A16BC_OWNER_APPROVED_FOR_DB_WRITE_MARKER",
  "mark_ready_for_owner_approval",
  "approve_for_db_write",
  "hasStrictOwnerAdminContext",
  "buildGateReasons",
  "confirmNoOfficialImportExecution",
  "status: \"ready_for_owner_approval\"",
  "status: \"owner_approved\"",
  "status: \"owner_approved_for_db_write\"",
  "officialImportPostCalled: false",
  "rpcCalled: false",
  "realGenealogyWrite: false",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "owner-approval-state",
  "transitionImportSessionOwnerApprovalState",
  "parseConfirmation",
  "POST(request: Request",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of [
  "A16BCOwnerApprovalStateClient",
  "mark_ready_for_owner_approval",
  "approve_for_db_write",
  "This does not execute official import",
  "A16BC_STATE_TRANSITION_REJECTED_HTTP_",
]) {
  requireIncludes(client, token, `client token ${token}`);
}

for (const token of [
  "A16BCOwnerApprovalStateClient",
  "A16BC_OWNER_APPROVAL_STATE_ROUTE",
  "A16BC_READY_FOR_OWNER_APPROVAL_MARKER",
  "A16BC_OWNER_APPROVED_FOR_DB_WRITE_MARKER",
  "a16bcCanMarkReady",
  "a16bcCanApproveDbWrite",
  "confirmNoOfficialImportExecution: true",
]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

requireIncludes(schema, "'preview_generated'", "schema preview state");
requireIncludes(schema, "'ready_for_owner_approval'", "schema ready state");
requireIncludes(schema, "'owner_approved_for_db_write'", "schema db-write state");
requireIncludes(rpc, "v_session.status not in ('ready_for_owner_approval', 'owner_approved_for_db_write')", "RPC canonical states");

if (
  packageJson?.scripts?.["check:a16bc-owner-approval-state-transition-readiness"] !==
  "node scripts/check-a16bc-owner-approval-state-transition-readiness.cjs"
) {
  failures.push("missing package script check:a16bc-owner-approval-state-transition-readiness");
}

for (const [content, token, label] of [
  [index, "PLAN_A16BC_OWNER_APPROVAL_STATE_TRANSITION_READINESS.md", "index A-16BC entry"],
  [workLog, "A16BC_STATUS=PASS_SOURCE_CANDIDATE_NOT_EXECUTED_NOT_DEPLOYED", "work log A-16BC status"],
  [decisionLog, "A-16BC separates owner-approval state transition from A-16R official import execution", "decision log A-16BC"],
  [handoff, "A16BC_NEXT_ACTION=A16BD_DEPLOY_AND_OWNER_STATE_TRANSITION_SMOKE_NO_OFFICIAL_IMPORT", "handoff A-16BC next action"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(
  route + client,
  /fetch\s*\([^)]*\/official-import|routePath\s*=\s*["'`][^"'`]*\/official-import/i,
  "A-16BC code must not post official-import",
);
rejectPattern(service + route, /\.rpc\s*\(/i, "A-16BC must not call RPC");
rejectPattern(doc + service + route + client + panel, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + service + route + client + panel, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  servicePath,
  routePath,
  clientPath,
  panelPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A16BE_OFFICIAL_IMPORT_RPC_SESSION_OWNERSHIP_CONTRACT_DIAGNOSIS.md",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "scripts/check-a16ax-cloudflare-runtime-vars-preservation-deploy-wiring.cjs",
  "scripts/check-a16az-official-import-post-409-session-state-diagnosis.cjs",
  "scripts/check-a16ba-read-only-session-state-runtime-contract-fix-plan.cjs",
  "scripts/check-a16bb-sanitized-session-state-runtime-gate-candidate.cjs",
  "scripts/check-a16be-official-import-rpc-session-ownership-contract-diagnosis.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/verify-a16be-session-ownership-contract.cjs",
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
  console.error("A-16BC owner approval state transition readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BC owner approval state transition readiness check passed.");

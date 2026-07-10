#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16BA_READ_ONLY_SESSION_STATE_RUNTIME_CONTRACT_FIX_PLAN.md";
const checkerPath =
  "scripts/check-a16ba-read-only-session-state-runtime-contract-fix-plan.cjs";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const schemaPath =
  "supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql";
const rpcPath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const uploadPath = "lib/import/giapha4/manifest-upload-service.ts";

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
const service = read(servicePath);
const route = read(routePath);
const schema = read(schemaPath);
const rpc = read(rpcPath);
const upload = read(uploadPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16BA - Read-only Session State And Runtime State Contract Fix Plan",
  "A16BA_STATUS=PLAN_READY_READ_ONLY_NO_RUNTIME_CHANGE",
  "A16BA_SOURCE_BLOCKER=A16AZ_BLOCKER=OFFICIAL_IMPORT_POST_409_SESSION_STATE_GATE_REJECTED_BEFORE_RPC_NO_IMPORT_EXECUTED",
  "A16BA_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16BA_ROUTE_409_MEANING=RUNTIME_CANDIDATE_STATUS_BLOCKED_BEFORE_RPC",
  "A16BA_RUNTIME_STALE_STATE_EXPECTATION=staged",
  "A16BA_RUNTIME_STAGED_SOURCE_PATH=lib/import/giapha4/official-import-service.ts",
  "A16BA_RUNTIME_STALE_STATE_CONDITION=params.manifest.session.status !== \"staged\"",
  "A16BA_STAGED_IN_SCHEMA=NO",
  "A16BA_SCHEMA_VALID_SESSION_STATES=preview_generated,owner_reviewing,warnings_acknowledged,duplicates_reviewed,relationships_reviewed,privacy_reviewed,ready_for_owner_approval,owner_approved_for_db_write,rejected_needs_fix,expired_preview,write_started,write_completed,rollback_required,rolled_back",
  "A16BA_RPC_VALID_STATES_SOURCE=supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "A16BA_CANONICAL_PRE_IMPORT_STATES=ready_for_owner_approval,owner_approved_for_db_write",
  "A16BA_READY_FOR_OWNER_APPROVAL_STATE=ready_for_owner_approval",
  "A16BA_EXPECTED_OWNER_APPROVAL_STATE=owner_approved_for_db_write",
  "A16BA_OWNER_APPROVED_WRITE_MANIFEST_STATES=owner_approved,ready_for_apply",
  "A16BA_BLOCKER_CLASSIFICATION=SOURCE_RUNTIME_SESSION_STATE_GATE_EXPECTS_STAGED_BUT_SCHEMA_RPC_USE_OWNER_APPROVAL_LIFECYCLE",
  "A16BA_CURRENT_STORED_SESSION_STATE=UNKNOWN_NOT_READ_FROM_DB_IN_A16BA",
  "A16BA_EXISTING_READ_ONLY_MANIFEST_ROUTE_PRIVATE_DATA_RISK=YES_NOT_USED_AS_LOG_EVIDENCE",
  "A16BA_DEDICATED_SANITIZED_SESSION_STATE_VERIFIER_EXISTS=NO",
  "A16BA_FIX_RECOMMENDATION=ADD_SANITIZED_READ_ONLY_SESSION_STATE_DIAGNOSTIC_THEN_ALIGN_RUNTIME_UI_API_STATE_GATE",
  "A16BA_RUNTIME_ACCEPTED_STATES_FIX_CANDIDATE=ready_for_owner_approval,owner_approved_for_db_write",
  "A16BA_UI_API_CONTRACT_FIX=SHOW_SESSION_STATUS_AND_LOCK_BEFORE_POST_WHEN_NOT_CANONICAL",
  "A16BA_TRANSITION_GATE_FIX=REQUIRE_EXPLICIT_OWNER_APPROVAL_TRANSITION_TO_OWNER_APPROVED_FOR_DB_WRITE_IF_SESSION_NOT_ALREADY_CANONICAL",
  "A16BA_NEXT_PHASE=A16BB_SANITIZED_SESSION_STATE_DIAGNOSTIC_AND_RUNTIME_STATE_GATE_CANDIDATE_NO_POST",
  "A16BA_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BA_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16BA_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16BA_SQL_RUN=NO",
  "A16BA_DB_MUTATION_RUN=NO",
  "A16BA_DEPLOY_RUN=NO",
  "A16BA_AUTH_PERMISSION_MUTATION_RUN=NO",
  "A16BA_GENEALOGY_MUTATION_RUN=NO",
  "A16BA_RAW_JSON_COMMITTED=NO",
  "A16BA_PRIVATE_DATA_PRINTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.[
    "check:a16ba-read-only-session-state-runtime-contract-fix-plan"
  ] !== "node scripts/check-a16ba-read-only-session-state-runtime-contract-fix-plan.cjs"
) {
  failures.push("missing package script check:a16ba-read-only-session-state-runtime-contract-fix-plan");
}

for (const [content, token, label] of [
  [service, 'params.manifest.session.status !== "staged"', "current stale staged runtime source condition"],
  [route, 'return jsonError(result.status === "BLOCKED" ? 409 : 200, result)', "route maps blocked runtime candidate to 409"],
  [schema, "'ready_for_owner_approval'", "schema ready_for_owner_approval state"],
  [schema, "'owner_approved_for_db_write'", "schema owner_approved_for_db_write state"],
  [rpc, "v_session.status not in ('ready_for_owner_approval', 'owner_approved_for_db_write')", "A-16V RPC accepted states"],
  [rpc, "status in ('owner_approved', 'ready_for_apply')", "A-16V write manifest accepted states"],
  [upload, "status: \"preview_generated\"", "upload initial preview_generated state"],
  [index, "PLAN_A16BA_READ_ONLY_SESSION_STATE_RUNTIME_CONTRACT_FIX_PLAN.md", "index entry"],
  [workLog, "A16BA_STATUS=PLAN_READY_READ_ONLY_NO_RUNTIME_CHANGE", "work log status"],
  [decisionLog, "Decision 304 - A-16BA plans the session-state runtime contract fix without import execution", "decision log entry"],
  [handoff, "A16BA_NEXT_PHASE=A16BB_SANITIZED_SESSION_STATE_DIAGNOSTIC_AND_RUNTIME_STATE_GATE_CANDIDATE_NO_POST", "handoff next action"],
]) {
  requireIncludes(content, token, label);
}

if (schema.includes("'staged'")) {
  failures.push("schema unexpectedly defines staged as an import session status");
}

rejectPattern(doc, /A16BA_POST_OFFICIAL_IMPORT_CALLED=YES/i, "POST must remain NO");
rejectPattern(doc, /A16BA_A16R_IMPORT_RETRY_EXECUTED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16BA_SQL_RUN=YES|A16BA_DB_MUTATION_RUN=YES|A16BA_DEPLOY_RUN=YES/i, "mutation/deploy must remain NO");
rejectPattern(doc, /A16BA_DIRECT_MANUAL_RPC_CALLED=YES|A16BA_GENEALOGY_MUTATION_RUN=YES/i, "RPC/import mutation must remain NO");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16BA/i, "wrangler config must not change for A-16BA");
rejectPattern(layout, /A16BA/i, "app layout must not change for A-16BA");

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
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "scripts/check-a16ax-cloudflare-runtime-vars-preservation-deploy-wiring.cjs",
  "scripts/check-a16az-official-import-post-409-session-state-diagnosis.cjs",
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
  console.error("A-16BA read-only session state runtime contract fix plan check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BA read-only session state runtime contract fix plan check passed.");

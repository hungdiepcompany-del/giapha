#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AZ_OFFICIAL_IMPORT_POST_409_SESSION_STATE_DIAGNOSIS.md";
const checkerPath =
  "scripts/check-a16az-official-import-post-409-session-state-diagnosis.cjs";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const schemaPath =
  "supabase/migrations/20260629_0010_a16d_import_manifest_storage_candidate.sql";
const rpcPath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";

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
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AZ - Official Import POST 409 Session State Diagnosis",
  "A16AZ_STATUS=DIAGNOSED_POST_409_SESSION_STATE_MISMATCH_NO_IMPORT",
  "A16AZ_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16AZ_OWNER_POST_ATTEMPT_COUNT=1_OWNER_REPORTED",
  "A16AZ_POST_RESULT=OFFICIAL_IMPORT_POST_REJECTED_HTTP_409",
  "A16AZ_ROUTE_STATUS=BLOCKED",
  "A16AZ_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16AZ_IMPORTED_PEOPLE_COUNT=0",
  "A16AZ_WARNINGS_COUNT_REPORTED=46",
  "A16AZ_RPC_IMPORT_CALLED=NO",
  "A16AZ_REAL_GENEALOGY_DATA_IMPORTED=NO",
  "A16AZ_UI_MESSAGE=Import session is not in staged state for official import consideration.",
  "A16AZ_SOURCE_BLOCKING_CONDITION=params.manifest.session.status !== \"staged\"",
  "A16AZ_RUNTIME_SOURCE_EXPECTED_SESSION_STATE=staged",
  "A16AZ_SCHEMA_VALID_SESSION_STATES=preview_generated,owner_reviewing,warnings_acknowledged,duplicates_reviewed,relationships_reviewed,privacy_reviewed,ready_for_owner_approval,owner_approved_for_db_write,rejected_needs_fix,expired_preview,write_started,write_completed,rollback_required,rolled_back",
  "A16AZ_A16V_RPC_VALID_OFFICIAL_IMPORT_STATES=ready_for_owner_approval,owner_approved_for_db_write",
  "A16AZ_SOURCE_VS_RPC_STATE_CONTRACT=SOURCE_EXPECTS_STAGED_BUT_SCHEMA_AND_RPC_EXPECT_READY_FOR_OWNER_APPROVAL_OR_OWNER_APPROVED_FOR_DB_WRITE",
  "A16AZ_ACTUAL_SESSION_STATE=UNKNOWN_NOT_READ_FROM_DB_IN_A16AZ",
  "A16AZ_ACTUAL_SESSION_STATE_PROOF=NOT_ACCEPTED_AS_STAGED_BY_RUNTIME_SOURCE",
  "A16AZ_BLOCKER_CLASSIFICATION=SOURCE_RUNTIME_SESSION_STATE_EXPECTATION_STALE_STAGED_NOT_IN_SCHEMA",
  "A16AZ_WARNING_COUNT_DELTA_EXPLANATION=94_A16AA_FULL_RELATIONSHIP_AUDIT_WARNINGS_VS_46_RUNTIME_IMPORT_MANIFEST_WARNINGS_DIFFERENT_WARNING_SURFACES",
  "A16AZ_BLOCKER=OFFICIAL_IMPORT_POST_409_SESSION_STATE_GATE_REJECTED_BEFORE_RPC_NO_IMPORT_EXECUTED",
  "A16AZ_BLOCKER_TYPE=UI_API_RUNTIME_LIFECYCLE_CONTRACT_MISMATCH",
  "A16AZ_NEXT_ACTION=A16BA_READ_ONLY_SESSION_STATE_AND_RUNTIME_STATE_CONTRACT_FIX_PLAN_NO_POST_NO_RPC",
  "A16AZ_POST_OFFICIAL_IMPORT_CALLED_IN_THIS_PHASE=NO",
  "A16AZ_A16R_IMPORT_RETRY_EXECUTED_IN_THIS_PHASE=NO",
  "A16AZ_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16AZ_SQL_RUN=NO",
  "A16AZ_DB_MUTATION_RUN=NO",
  "A16AZ_DEPLOY_RUN=NO",
  "A16AZ_RAW_JSON_COMMITTED=NO",
  "A16AZ_PRIVATE_DATA_PRINTED=NO",
  "A16AZ_WRANGLER_TOML_CHANGED=NO",
  "A16AZ_APP_LAYOUT_TSX_CHANGED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (
  packageJson?.scripts?.[
    "check:a16az-official-import-post-409-session-state-diagnosis"
  ] !== "node scripts/check-a16az-official-import-post-409-session-state-diagnosis.cjs"
) {
  failures.push("missing package script check:a16az-official-import-post-409-session-state-diagnosis");
}

for (const [content, token, label] of [
  [service, 'params.manifest.session.status !== "staged"', "stale staged runtime source condition"],
  [route, 'return jsonError(result.status === "BLOCKED" ? 409 : 200, result)', "route 409 mapping"],
  [schema, "'ready_for_owner_approval'", "schema ready_for_owner_approval state"],
  [schema, "'owner_approved_for_db_write'", "schema owner_approved_for_db_write state"],
  [rpc, "v_session.status not in ('ready_for_owner_approval', 'owner_approved_for_db_write')", "A-16V RPC accepted states"],
  [index, "PLAN_A16AZ_OFFICIAL_IMPORT_POST_409_SESSION_STATE_DIAGNOSIS.md", "index entry"],
  [workLog, "A16AZ_STATUS=DIAGNOSED_POST_409_SESSION_STATE_MISMATCH_NO_IMPORT", "work log status"],
  [decisionLog, "Decision 303 - A-16AZ treats POST 409 as a source/runtime lifecycle contract mismatch", "decision log entry"],
  [handoff, "A16AZ_NEXT_ACTION=A16BA_READ_ONLY_SESSION_STATE_AND_RUNTIME_STATE_CONTRACT_FIX_PLAN_NO_POST_NO_RPC", "handoff next action"],
]) {
  requireIncludes(content, token, label);
}

rejectPattern(doc, /A16AZ_POST_OFFICIAL_IMPORT_CALLED_IN_THIS_PHASE=YES/i, "POST in this phase must remain NO");
rejectPattern(doc, /A16AZ_A16R_IMPORT_RETRY_EXECUTED_IN_THIS_PHASE=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AZ_SQL_RUN=YES|A16AZ_DB_MUTATION_RUN=YES|A16AZ_DEPLOY_RUN=YES/i, "mutation/deploy must remain NO");
rejectPattern(doc, /A16AZ_RPC_IMPORT_CALLED=YES|A16AZ_REAL_GENEALOGY_DATA_IMPORTED=YES/i, "RPC/import must remain NO");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AZ/i, "wrangler config must not change for A-16AZ");
rejectPattern(layout, /A16AZ/i, "app layout must not change for A-16AZ");

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
  "docs/PLAN_A16BA_READ_ONLY_SESSION_STATE_RUNTIME_CONTRACT_FIX_PLAN.md",
  "scripts/check-a16ba-read-only-session-state-runtime-contract-fix-plan.cjs",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16ax-cloudflare-runtime-vars-preservation-deploy-wiring.cjs",
  "scripts/check-a16ar-owner-same-run-official-import-confirmation-ui-plumbing.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
  "scripts/check-a16aa-relationship-audit-warning-review-import-retry-readiness.cjs",
  "scripts/check-a16ab-import-retry-preflight-approval-gate.cjs",
  "scripts/check-a16ac-import-retry-execution-final-gate.cjs",
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
  console.error("A-16AZ official import POST 409 session state diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AZ official import POST 409 session state diagnosis check passed.");

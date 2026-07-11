#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16BJ_FINAL_READ_ONLY_OFFICIAL_IMPORT_RETRY_RECONCILIATION_GATE.md";
const checkerPath =
  "scripts/check-a16bj-final-read-only-official-import-retry-reconciliation-gate.cjs";
const verifierPath = "scripts/verify-a16bj-final-read-only-reconciliation.cjs";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const diagnosticRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import-identity-precheck/route.ts";
const migrationPath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
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
const checker = read(checkerPath);
const verifier = read(verifierPath);
const service = read(servicePath);
const diagnosticRoute = read(diagnosticRoutePath);
const migration = read(migrationPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A16BJ_STATUS=PASS_FINAL_READ_ONLY_RECONCILIATION_READY_FOR_SEPARATE_OWNER_RETRY",
  "A16BJ_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16BJ_SESSION_STATE=owner_approved_for_db_write",
  "A16BJ_IDENTITY_MATCH=YES",
  "A16BJ_OFFICIAL_IMPORT_BATCH_EXISTS=NO",
  "A16BJ_ROLLBACK_MANIFEST_EXISTS=NO",
  "A16BJ_PARTIAL_WRITE_DETECTED=NO",
  "A16BJ_STAGED_PEOPLE_COUNT=102",
  "A16BJ_STAGED_RELATIONSHIP_COUNT=134",
  "A16BJ_VALIDATION_BLOCKER_STATUS=PASS_ERRORS_0_DUPLICATE_BLOCKERS_0_RELATIONSHIP_BLOCKERS_0",
  "A16BJ_DEPLOYED_SOURCE_EVIDENCE=OWNER_PROVIDED_A16BH_AUTHENTICATED_GET_PASS_AND_RPC_METADATA_PASS_9_OF_9_PLUS_LOCAL_HEAD_INCLUDES_FFF4019",
  "A16BJ_ROOT_CAUSE_CLASSIFICATION=LIKELY_PRE_FFF4019_STALE_DEPLOYMENT_OR_PRE_DIAGNOSTIC_EXECUTION_PATH_NO_REMAINING_READ_ONLY_BLOCKER",
  "A16BJ_FINAL_RETRY_READINESS=READY_FOR_SEPARATE_OWNER_APPROVED_SINGLE_RETRY_NOT_EXECUTED_IN_A16BJ",
  "A16BJ_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BJ_IMPORT_RPC_CALLED=NO",
  "A16BJ_SQL_RUN=NO",
  "A16BJ_DB_MUTATION_RUN=NO",
  "A16BJ_SESSION_STATE_CHANGED=NO",
  "A16BJ_DEPLOY_RUN=NO",
  "A16BJ_RAW_PRIVATE_DATA_PRINTED_OR_COMMITTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16BJ_NEXT_OWNER_ACTION=SEPARATE_A16BK_OWNER_APPROVED_SINGLE_POST_RETRY_PHASE_IF_ACCEPTED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [verifier, "A16BJ_FINAL_READ_ONLY_OFFICIAL_IMPORT_RETRY_RECONCILIATION", "verifier marker"],
  [verifier, "postOfficialImportCalled: false", "verifier no POST"],
  [verifier, "importRpcCalled: false", "verifier no import RPC"],
  [verifier, ".from(\"import_sessions\")", "verifier reads import_sessions"],
  [verifier, ".from(\"official_import_batches\")", "verifier reads batches"],
  [verifier, ".from(\"official_import_rollback_manifests\")", "verifier reads rollback manifests"],
  [verifier, ".from(\"import_person_candidates\")", "verifier reads person candidate count"],
  [verifier, ".from(\"import_relationship_candidates\")", "verifier reads relationship candidate count"],
  [verifier, ".from(\"revisions\")", "verifier reads revision marker count only"],
  [verifier, "READY_FOR_SEPARATE_OWNER_APPROVED_SINGLE_RETRY_NOT_EXECUTED_IN_A16BJ", "verifier readiness"],
  [service, "precheckAndImportRpcUseSameClientInstance: true", "POST same-client source guarantee"],
  [diagnosticRoute, "export async function GET", "A16BH diagnostic GET route"],
  [migration, "v_profile_id uuid := public.current_profile_id();", "RPC current profile source"],
  [migration, "and created_by = v_profile_id", "RPC created_by ownership source"],
  [migration, "v_session.status not in ('ready_for_owner_approval', 'owner_approved_for_db_write')", "RPC state source"],
  [index, "PLAN_A16BJ_FINAL_READ_ONLY_OFFICIAL_IMPORT_RETRY_RECONCILIATION_GATE.md", "index A-16BJ"],
  [workLog, "A16BJ_STATUS=PASS_FINAL_READ_ONLY_RECONCILIATION_READY_FOR_SEPARATE_OWNER_RETRY", "work log A-16BJ"],
  [decisionLog, "Decision 311 - A-16BJ requires a final read-only reconciliation before another import retry", "decision A-16BJ"],
  [handoff, "A16BJ_FINAL_RETRY_READINESS=READY_FOR_SEPARATE_OWNER_APPROVED_SINGLE_RETRY_NOT_EXECUTED_IN_A16BJ", "handoff A-16BJ"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16bj-final-read-only-official-import-retry-reconciliation-gate"
  ] !==
  "node scripts/check-a16bj-final-read-only-official-import-retry-reconciliation-gate.cjs"
) {
  failures.push("missing package A-16BJ check script");
}
if (
  packageJson?.scripts?.["verify:a16bj-final-read-only-reconciliation"] !==
  "node scripts/verify-a16bj-final-read-only-reconciliation.cjs"
) {
  failures.push("missing package A-16BJ verifier script");
}

for (const [label, content] of [
  [verifierPath, verifier],
  [checkerPath, checker],
]) {
  rejectPattern(content, /\.(?:insert|update|delete|upsert)\s*\(/i, `${label} mutation call`);
  rejectPattern(content, /\.rpc\s*\(/i, `${label} RPC call`);
  rejectPattern(content, /fetch\s*\([^)]*official-import/i, `${label} official import fetch`);
  rejectPattern(content, /console\.log\([^)]*(serviceRoleKey|SUPABASE_SERVICE_ROLE_KEY|supabaseUrl)/i, `${label} secret print`);
  rejectPattern(content, /eyJ[A-Za-z0-9_-]{20,}|sb_secret_[A-Za-z0-9_-]+/i, `${label} secret-like token`);
}
rejectPattern(doc, /A16BJ_POST_OFFICIAL_IMPORT_CALLED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "doc must keep import closed");
rejectPattern(doc, /A16BJ_SQL_RUN=YES|A16BJ_DB_MUTATION_RUN=YES|A16BJ_DEPLOY_RUN=YES/i, "doc must keep mutation/deploy closed");
rejectPattern(wrangler, /A16BJ|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BJ|official-import/i, "app layout must not change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  verifierPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16bi-same-client-rpc-binding-production-contract-read-only-verification.cjs",
  "scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs",
  "scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs",
  "scripts/check-a16be-official-import-rpc-session-ownership-contract-diagnosis.cjs",
  "scripts/check-a16bb-sanitized-session-state-runtime-gate-candidate.cjs",
  "scripts/check-a16bc-owner-approval-state-transition-readiness.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "docs/PLAN_A16BL_IMPORT_SESSION_FOR_UPDATE_RLS_LOCK_VISIBILITY_DIAGNOSIS.md",
  "scripts/a16bl-import-session-for-update-rls-fix-candidate.sql.draft",
  "scripts/check-a16bl-import-session-for-update-rls-lock-visibility-diagnosis.cjs",
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
  console.error("A-16BJ final read-only reconciliation check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BJ final read-only reconciliation check passed.");

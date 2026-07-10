#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16BH_PRODUCTION_A16BF_IDENTITY_PRECHECK_RPC_CONTRACT_DRIFT_DIAGNOSIS.md";
const checkerPath =
  "scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const diagnosticRoutePath =
  "app/api/admin/import-sessions/[sessionId]/official-import-identity-precheck/route.ts";
const migrationPath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const packagePath = "package.json";
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
  "A16BH_STATUS=PASS_SOURCE_DIAGNOSTIC_CANDIDATE_NOT_DEPLOYED_NOT_EXECUTED",
  `A16BH_TARGET_SESSION_ID=${sessionId}`,
  "A16BH_PRODUCTION_COMMIT_EVIDENCE=LOCAL_ORIGIN_MAIN_CONTAIN_92C4271_PRODUCTION_DEPLOY_OF_92C4271_NOT_PROVEN_IN_THIS_PHASE",
  "A16BH_A16BF_PRECHECK_ACTIVE=UNKNOWN_NEEDS_AUTHENTICATED_GET_DIAGNOSTIC_AFTER_DEPLOY",
  "A16BH_READ_ONLY_DIAGNOSTIC_ROUTE=ADDED_AUTHENTICATED_GET_ONLY",
  "GET /api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/official-import-identity-precheck",
  "A16BH_READ_ONLY_PRECHECK_RESULT=NOT_RUN_AGAINST_PRODUCTION_IN_THIS_PHASE",
  "A16BH_PRECHECK_CLIENT_CONTEXT=SAME_RUN_END_USER_SERVER_COOKIES_ANON_KEY_SECURITY_INVOKER_FOR_POST_PATH",
  "A16BH_IMPORT_RPC_CLIENT_CONTEXT=SAME_RUN_END_USER_SERVER_COOKIES_ANON_KEY_SECURITY_INVOKER_FOR_POST_PATH",
  "A16BH_PRECHECK_AND_IMPORT_RPC_USE_SAME_CLIENT_INSTANCE=YES_IN_SOURCE_POST_PATH",
  "A16BH_PRODUCTION_RPC_CONTRACT_STATUS=UNKNOWN_OWNER_READ_ONLY_SQL_REQUIRED",
  "A16BH_ROOT_CAUSE=PRODUCTION_PRECHECK_ACTIVE_OR_RPC_CONTRACT_DRIFT_NOT_PROVEN_YET",
  "A16BH_NEXT_ACTION=DEPLOY_A16BH_THEN_RUN_AUTHENTICATED_GET_IDENTITY_PRECHECK_AND_OWNER_READ_ONLY_RPC_CONTRACT_SQL_NO_IMPORT",
  "A16BH_POST_OFFICIAL_IMPORT_CALLED=NO_IN_THIS_PHASE",
  "A16BH_IMPORT_TRANSACTION_RPC_CALLED=NO_IN_THIS_PHASE",
  "A16BH_A16R_RETRY_NEXT=NO",
  "A16BH_SQL_RUN=NO",
  "A16BH_DB_MUTATION_RUN=NO",
  "A16BH_DEPLOY_RUN=NO",
  "A16BH_RAW_PRIVATE_DATA_PRINTED_OR_COMMITTED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [service, "sameRunRpcClient?: OfficialImportSameRunSupabaseClient | null", "executor shared client input"],
  [service, "SAME_RUN_END_USER_SERVER_COOKIES_ANON_KEY_SECURITY_INVOKER", "same-run auth context marker"],
  [service, "precheckAndImportRpcUseSameClientInstance", "same instance boolean"],
  [service, "getOfficialImportRpcIdentityPrecheckDiagnostic", "exported read-only diagnostic"],
  [service, "sameRunRpcClient,", "same client passed to executor"],
  [service, "sameRunRpcClient ?? (await maybeCreateServerSupabaseClient())", "executor reuses same client"],
  [service, "A16BF_RPC_VISIBLE_PROFILE_FUNCTION_NAME", "current profile diagnostic rpc constant"],
  [diagnosticRoute, "export async function GET", "diagnostic GET"],
  [diagnosticRoute, "A16BH_OFFICIAL_IMPORT_IDENTITY_PRECHECK_DIAGNOSTIC", "route marker"],
  [diagnosticRoute, "getOfficialImportRpcIdentityPrecheckDiagnostic", "route diagnostic service"],
  [diagnosticRoute, "hasStrictOfficialImportDiagnosticPermission", "strict permission guard"],
  [diagnosticRoute, "authenticatedAuthUserPresent", "auth boolean output"],
  [diagnosticRoute, "runtimePermissionProfilePresent", "profile boolean output"],
  [diagnosticRoute, "rpcVisibleProfilePresent", "rpc profile boolean output"],
  [diagnosticRoute, "auditedSessionOwnerProfilePresent", "session owner boolean output"],
  [diagnosticRoute, "runtimeProfileMatchesRpcVisibleProfile", "runtime/rpc equality output"],
  [diagnosticRoute, "runtimeProfileMatchesAuditedSessionOwner", "runtime/session equality output"],
  [diagnosticRoute, "rpcVisibleProfileMatchesAuditedSessionOwner", "rpc/session equality output"],
  [diagnosticRoute, "permissionClientAuthContext", "permission context output"],
  [diagnosticRoute, "rpcClientAuthContext", "rpc context output"],
  [diagnosticRoute, "piiPrinted: false", "pii false output"],
  [migration, "v_profile_id uuid := public.current_profile_id();", "source rpc current profile"],
  [migration, "and created_by = v_profile_id", "source rpc owner predicate"],
  [index, docPath.replace("docs/", ""), "index entry"],
  [workLog, "A-16BH - Production A-16BF identity precheck and RPC contract drift diagnosis", "work log entry"],
  [decisionLog, "Decision 309 - A-16BH exposes read-only identity precheck before any further import retry", "decision entry"],
  [handoff, "A16BH_A16BF_PRECHECK_ACTIVE=UNKNOWN_NEEDS_AUTHENTICATED_GET_DIAGNOSTIC_AFTER_DEPLOY", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis"
  ] !==
  "node scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs"
) {
  failures.push("missing package A-16BH check script");
}

rejectPattern(diagnosticRoute, /export\s+async\s+function\s+POST/i, "diagnostic route must not define POST");
rejectPattern(diagnosticRoute, /a16p_tx_execute_giapha4_official_import|A16P_TX_TRANSACTION_RPC_FUNCTION_NAME/i, "diagnostic route must not call import transaction RPC");
rejectPattern(diagnosticRoute, /\.(insert|update|upsert|delete)\s*\(/i, "diagnostic route must not mutate DB");
rejectPattern(diagnosticRoute, /email|display_name|auth_user_id|profile\.id|user\.id/i, "diagnostic route must not return identifiers");
rejectPattern(service, /p_actor_profile_id|actor_profile_id/i, "service must not pass caller-controlled profile id to RPC");
rejectPattern(service, /service_role|SERVICE_ROLE|maybeCreateAdminSupabaseClient/i, "official import service must not switch to service role");
rejectPattern(doc + checker + diagnosticRoute, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16BH|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BH|official-import/i, "app layout must not change");

const importRpcCallMatches =
  service.match(/\.rpc\(\s*A16P_TX_TRANSACTION_RPC_FUNCTION_NAME/g) ?? [];
if (importRpcCallMatches.length !== 1) {
  failures.push(`expected exactly one import transaction RPC branch, found ${importRpcCallMatches.length}`);
}
const identityRpcCallMatches =
  service.match(/\.rpc\(\s*A16BF_RPC_VISIBLE_PROFILE_FUNCTION_NAME/g) ?? [];
if (identityRpcCallMatches.length !== 1) {
  failures.push(`expected exactly one read-only current_profile_id RPC branch, found ${identityRpcCallMatches.length}`);
}

const precheckIndex = service.indexOf("const rpcInvocationIdentityPrecheck");
const executorIndex = service.indexOf("const executionResult = await executor({");
const sharedClientIndex = service.indexOf("const sameRunRpcClient");
if (!(sharedClientIndex >= 0 && sharedClientIndex < precheckIndex && precheckIndex < executorIndex)) {
  failures.push("same-run client and identity precheck must appear before executor");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  diagnosticRoutePath,
  servicePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs",
  "docs/PLAN_A16BI_SAME_CLIENT_RPC_BINDING_PRODUCTION_CONTRACT_READ_ONLY_VERIFICATION.md",
  "scripts/check-a16bi-same-client-rpc-binding-production-contract-read-only-verification.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16be-official-import-rpc-session-ownership-contract-diagnosis.cjs",
  "scripts/check-a16bb-sanitized-session-state-runtime-gate-candidate.cjs",
  "scripts/check-a16bc-owner-approval-state-transition-readiness.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "docs/PLAN_A16BJ_FINAL_READ_ONLY_OFFICIAL_IMPORT_RETRY_RECONCILIATION_GATE.md",
  "scripts/check-a16bj-final-read-only-official-import-retry-reconciliation-gate.cjs",
  "scripts/verify-a16bj-final-read-only-reconciliation.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden changed file ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (file.startsWith(".tmp/")) failures.push(`.tmp file must not be committed ${file}`);
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`raw/private evidence file must not be committed ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

const changedPatch = git([
  "diff",
  "--",
  ...changedFiles.filter((file) => allowedChangedFiles.has(file)),
]);
for (const pattern of [
  /supabase\s+db\s+push/i,
  /wrangler\s+deploy/i,
  /\.(insert|update|upsert|delete)\s*\(/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16BH production A-16BF identity precheck diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BH production A-16BF identity precheck diagnosis check passed.");

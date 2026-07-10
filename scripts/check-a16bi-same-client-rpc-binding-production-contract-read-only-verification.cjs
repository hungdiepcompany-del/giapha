#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16BI_SAME_CLIENT_RPC_BINDING_PRODUCTION_CONTRACT_READ_ONLY_VERIFICATION.md";
const checkerPath =
  "scripts/check-a16bi-same-client-rpc-binding-production-contract-read-only-verification.cjs";
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
  "A16BI_STATUS=PASS_DIAGNOSED_SAME_CLIENT_FALSE_AND_READY_FOR_OWNER_RPC_CONTRACT_SQL",
  "A16BI_IDENTITY_PRECHECK_RESULT=PASS_READ_ONLY_IDENTITIES_MATCHED_POST_INSTANCE_NOT_OBSERVED",
  "A16BI_SAME_CLIENT_FALSE_ROOT_CAUSE=GET_DIAGNOSTIC_CANNOT_OBSERVE_FUTURE_POST_PATH_CLIENT_INSTANCE_BOOLEAN_IMPLEMENTED_CORRECTLY",
  "A16BI_POST_PATH_SAME_CLIENT_GUARANTEE=PASS_SOURCE_GUARANTEE",
  "A16BI_PRODUCTION_RPC_READ_ONLY_SQL_RUNBOOK=OWNER_METADATA_BOOLEAN_SQL_ONLY",
  "rpc_function_present",
  "rpc_security_invoker",
  "rpc_arg_count_is_8",
  "rpc_expected_arg_names_present",
  "rpc_uses_current_profile_id",
  "rpc_uses_created_by_profile_ownership",
  "rpc_mentions_owner_approved_for_db_write",
  "rpc_session_not_found_blocker_present",
  "rpc_has_a16v_marker_or_comment",
  "A16BI_PRODUCTION_CONTRACT_STATUS=PENDING_OWNER_READ_ONLY_SQL_BOOLEAN_RESULTS",
  "A16BI_BLOCKER=PRODUCTION_RPC_CONTRACT_NOT_VERIFIED_AFTER_IDENTITY_PRECHECK_PASS",
  "A16BI_A16R_RETRY_NEXT=NO",
  "A16BI_NEXT_ACTION=OWNER_RUN_READ_ONLY_RPC_CONTRACT_SQL_AND_PROVIDE_BOOLEAN_RESULTS_NO_IMPORT",
  "A16BI_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BI_IMPORT_RPC_CALLED=NO",
  "A16BI_SQL_RUN_BY_CODEX=NO",
  "A16BI_DB_MUTATION_RUN=NO",
  "A16BI_DEPLOY_RUN=NO",
  "A16BI_RAW_PRIVATE_DATA_COMMITTED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [service, "const sameRunRpcClient =", "POST creates one same-run client"],
  [service, "sameRunRpcClient,", "POST passes same client to executor"],
  [service, "precheckAndImportRpcUseSameClientInstance: true", "POST precheck same instance true"],
  [service, "if (!rpcInvocationIdentityPrecheck.ok)", "fail-closed precheck branch"],
  [service, "executorCallCount: 0", "executor uncalled on precheck failure"],
  [service, "const executionResult = await executor({", "executor branch token"],
  [service, "sameRunRpcClient ?? (await maybeCreateServerSupabaseClient())", "executor fallback preserves injected client"],
  [diagnosticRoute, "export async function GET", "diagnostic GET only"],
  [diagnosticRoute, "precheckAndImportRpcUseSameClientInstance", "diagnostic boolean"],
  [service, "precheckAndImportRpcUseSameClientInstance: false", "GET diagnostic cannot observe POST instance"],
  [migration, "v_profile_id uuid := public.current_profile_id();", "repo migration current_profile_id"],
  [migration, "and created_by = v_profile_id", "repo migration created_by ownership"],
  [migration, "owner_approved_for_db_write", "repo migration owner approved state"],
  [index, docPath.replace("docs/", ""), "index A-16BI"],
  [workLog, "A-16BI - Same-client RPC binding and production contract read-only verification", "work log A-16BI"],
  [decisionLog, "Decision 310 - A-16BI treats same-client false as GET diagnostic observability boundary", "decision A-16BI"],
  [handoff, "A16BI_BLOCKER=PRODUCTION_RPC_CONTRACT_NOT_VERIFIED_AFTER_IDENTITY_PRECHECK_PASS", "handoff A-16BI"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16bi-same-client-rpc-binding-production-contract-read-only-verification"
  ] !==
  "node scripts/check-a16bi-same-client-rpc-binding-production-contract-read-only-verification.cjs"
) {
  failures.push("missing package A-16BI check script");
}

const precheckIndex = service.indexOf("if (!rpcInvocationIdentityPrecheck.ok)");
const executorIndex = service.indexOf("const executionResult = await executor({");
if (!(precheckIndex >= 0 && executorIndex >= 0 && precheckIndex < executorIndex)) {
  failures.push("identity failure branch must appear before executor call");
}

rejectPattern(diagnosticRoute, /export\s+async\s+function\s+POST/i, "diagnostic route must not define POST");
rejectPattern(diagnosticRoute, /A16P_TX_TRANSACTION_RPC_FUNCTION_NAME|a16p_tx_execute_giapha4_official_import/i, "diagnostic route must not call import RPC");
rejectPattern(service, /p_actor_profile_id|actor_profile_id/i, "must not pass caller-controlled actor profile to RPC");
rejectPattern(service, /service_role|SERVICE_ROLE|maybeCreateAdminSupabaseClient/i, "official import service must not use service role");
rejectPattern(doc, /\bselect\s+public\.a16p_tx_execute_giapha4_official_import\b/i, "runbook must not invoke import RPC");
rejectPattern(doc, /\bperform\s+public\.a16p_tx_execute_giapha4_official_import\b/i, "runbook must not perform import RPC");
rejectPattern(doc + checker + diagnosticRoute, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16BI|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BI|official-import/i, "app layout must not change");

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
  "scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs",
  "scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs",
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
  console.error("A-16BI same-client RPC binding verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BI same-client RPC binding verification check passed.");

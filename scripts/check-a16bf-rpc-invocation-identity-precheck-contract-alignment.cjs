#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16BF_RPC_INVOCATION_IDENTITY_PRECHECK_CONTRACT_ALIGNMENT.md";
const checkerPath =
  "scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const permissionPath = "lib/permissions/permission-service.ts";
const profilePath = "lib/auth/profile-service.ts";
const serverSupabasePath = "lib/supabase/server.ts";
const adminSupabasePath = "lib/supabase/admin.ts";
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
const permission = read(permissionPath);
const profile = read(profilePath);
const serverSupabase = read(serverSupabasePath);
const adminSupabase = read(adminSupabasePath);
const migration = read(migrationPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A16BF_STATUS=PASS_SOURCE_CANDIDATE_NOT_EXECUTED_NOT_DEPLOYED",
  `A16BF_TARGET_SESSION_ID=${sessionId}`,
  "A16BE_BLOCKER=A16BE_BLOCKED_RPC_INVOKER_AUTH_CONTEXT_OR_PRODUCTION_RPC_CONTRACT_DRIFT_SESSION_NOT_FOUND_OR_NOT_OWNED",
  "A16BF_PERMISSION_CLIENT_AUTH_CONTEXT=END_USER_SERVER_COOKIES_PLUS_ADMIN_PROFILE_PERMISSION_READS",
  "A16BF_RPC_CLIENT_AUTH_CONTEXT=END_USER_SERVER_COOKIES_ANON_KEY_SECURITY_INVOKER",
  "A16BF_RPC_EXPECTED_IDENTIFIER_TYPE=PROFILE_ID_FROM_PUBLIC_CURRENT_PROFILE_ID_SECURITY_INVOKER",
  "A16BF_RUNTIME_IDENTIFIER_TYPE=PROFILE_ID_FROM_PERMISSION_CONTEXT_ADMIN_LOOKUP",
  "A16BF_SESSION_OWNER_IDENTIFIER_TYPE=CURRENT_OWNER_PROFILE_ID",
  "A16BF_PRODUCTION_RPC_CONTRACT_STATUS=SOURCE_CONTRACT_IDENTIFIED_PRODUCTION_CONTRACT_NOT_READ_NO_SQL",
  "A16BF_EXACT_FIX_CANDIDATE=SAME_RUN_RPC_IDENTITY_PRECHECK_BEFORE_IMPORT_TRANSACTION_RPC",
  "A16BF_BLOCKED_RPC_INVOCATION_IDENTITY_PRECHECK_FAILED",
  "A16BF_RPC_VISIBLE_PROFILE_RESULT=SOURCE_PRECHECK_ADDED_NOT_EXECUTED_IN_THIS_PHASE",
  "A16BF_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BF_IMPORT_RPC_EXECUTED=NO",
  "A16BF_DIRECT_MANUAL_RPC_CALLED=NO",
  "A16BF_SQL_RUN=NO",
  "A16BF_DB_MUTATION_RUN=NO",
  "A16BF_SESSION_STATE_MUTATION_RUN=NO",
  "A16BF_DEPLOY_RUN=NO",
  "A16BF_RAW_PRIVATE_DATA_PRINTED_OR_COMMITTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16BF_NEXT_ACTION=A16BG_DEPLOY_AND_AUTHENTICATED_IDENTITY_PRECHECK_SMOKE_NO_IMPORT",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [permission, "getCurrentAuthUser()", "permission end-user auth lookup"],
  [permission, "maybeCreateAdminSupabaseClient()", "permission admin lookup"],
  [profile, "maybeCreateServerSupabaseClient()", "profile server auth client"],
  [profile, ".auth.getUser()", "auth get user"],
  [serverSupabase, "createServerClient", "server Supabase cookie client"],
  [adminSupabase, "serviceRoleKey", "admin service role variable name"],
  [service, "A16BF_RPC_INVOCATION_IDENTITY_PRECHECK_MARKER", "A16BF marker"],
  [service, "A16BF_RPC_VISIBLE_PROFILE_FUNCTION_NAME", "current profile function token"],
  [service, "A16BF_BLOCKED_RPC_INVOCATION_IDENTITY_PRECHECK_FAILED", "A16BF blocker"],
  [service, "OfficialImportRpcInvocationIdentityPrecheckResult", "precheck result type"],
  [service, "END_USER_SERVER_COOKIES_PLUS_ADMIN_PROFILE_PERMISSION_READS", "permission auth context marker"],
  [service, "END_USER_SERVER_COOKIES_ANON_KEY_SECURITY_INVOKER", "rpc auth context marker"],
  [service, "SOURCE_CONTRACT_IDENTIFIED_PRODUCTION_CONTRACT_NOT_READ_NO_SQL", "production contract status"],
  [service, "runRpcInvocationIdentityPrecheck", "precheck function"],
  [service, "runtimeProfileMatchesRpcVisibleProfile", "runtime/rpc equality boolean"],
  [service, "runtimeProfileMatchesAuditedSessionOwner", "runtime/session equality boolean"],
  [service, "rpcVisibleProfileMatchesAuditedSessionOwner", "rpc/session equality boolean"],
  [service, ".rpc(\n    A16BF_RPC_VISIBLE_PROFILE_FUNCTION_NAME", "read-only current_profile_id RPC"],
  [service, ".from(\"import_sessions\")", "session owner read"],
  [service, ".select(\"created_by\")", "created_by only read"],
  [service, "if (!rpcInvocationIdentityPrecheck.ok)", "fail closed before executor"],
  [service, "executorCallCount: 0", "failed precheck executor count zero"],
  [service, "const executionResult = await executor({", "single executor branch"],
  [migration, "v_profile_id uuid := public.current_profile_id();", "RPC expected current profile"],
  [migration, "and created_by = v_profile_id", "RPC ownership predicate"],
  [migration, "raise exception 'SESSION_NOT_FOUND_OR_NOT_OWNED'", "RPC blocker source"],
  [index, docPath.replace("docs/", ""), "index entry"],
  [workLog, "A-16BF - Same-run RPC invocation identity precheck", "work log A-16BF"],
  [decisionLog, "Decision 308 - A-16BF proves RPC-visible identity before official import transaction RPC", "decision A-16BF"],
  [handoff, "A16BF_BLOCKED_RPC_INVOCATION_IDENTITY_PRECHECK_FAILED", "handoff A-16BF blocker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16bf-rpc-invocation-identity-precheck-contract-alignment"
  ] !==
  "node scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs"
) {
  failures.push("missing package A-16BF check script");
}

const importRpcPattern = /\.rpc\(\s*A16P_TX_TRANSACTION_RPC_FUNCTION_NAME/g;
const readOnlyProfileRpcPattern =
  /\.rpc\(\s*A16BF_RPC_VISIBLE_PROFILE_FUNCTION_NAME/g;
if ((service.match(importRpcPattern) ?? []).length !== 1) {
  failures.push("expected exactly one official import transaction RPC branch");
}
if ((service.match(readOnlyProfileRpcPattern) ?? []).length !== 1) {
  failures.push("expected exactly one read-only current_profile_id precheck RPC");
}

const precheckIndex = service.indexOf("const rpcInvocationIdentityPrecheck");
const blockIndex = service.indexOf("if (!rpcInvocationIdentityPrecheck.ok)");
const executorIndex = service.indexOf("const executionResult = await executor({");
if (precheckIndex < 0 || blockIndex < 0 || executorIndex < 0) {
  failures.push("missing precheck/block/executor ordering tokens");
} else if (!(precheckIndex < blockIndex && blockIndex < executorIndex)) {
  failures.push("identity precheck must fail closed before executor call");
}

rejectPattern(service, /p_actor_profile_id|actor_profile_id/i, "must not pass caller-controlled actor profile to RPC");
rejectPattern(service, /service_role|SERVICE_ROLE|maybeCreateAdminSupabaseClient/i, "official import service must not switch RPC path to service role");
rejectPattern(service, /\.rpc\(\s*["']a16p_tx_execute_giapha4_official_import/i, "import RPC must use canonical constant");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16BF|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BF|official-import/i, "app layout must not change");

for (const [label, content] of [
  [servicePath, service],
  [checkerPath, checker],
]) {
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy/profile tables`,
  );
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  servicePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16be-official-import-rpc-session-ownership-contract-diagnosis.cjs",
  "scripts/check-a16bb-sanitized-session-state-runtime-gate-candidate.cjs",
  "scripts/check-a16bc-owner-approval-state-transition-readiness.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "docs/PLAN_A16BH_PRODUCTION_A16BF_IDENTITY_PRECHECK_RPC_CONTRACT_DRIFT_DIAGNOSIS.md",
  "app/api/admin/import-sessions/[sessionId]/official-import-identity-precheck/route.ts",
  "scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs",
  "docs/PLAN_A16BI_SAME_CLIENT_RPC_BINDING_PRODUCTION_CONTRACT_READ_ONLY_VERIFICATION.md",
  "scripts/check-a16bi-same-client-rpc-binding-production-contract-read-only-verification.cjs",
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
  console.error("A-16BF RPC invocation identity precheck check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BF RPC invocation identity precheck check passed.");

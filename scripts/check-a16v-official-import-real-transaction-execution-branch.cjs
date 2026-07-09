const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH.md";
const sqlPath =
  "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const mirrorPath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const checkPath =
  "db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
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

const doc = read(docPath);
const sql = read(sqlPath);
const mirror = read(mirrorPath);
const checkSql = read(checkPath);
const service = read(servicePath);
const route = read(routePath);
const a16ah = read("docs/PLAN_A16AH_OFFICIAL_IMPORT_RUNTIME_EXECUTION_BRANCH_CANDIDATE.md");
const panel = read(panelPath);
const packageJson = JSON.parse(read("package.json") || "{}");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

if (sql && mirror && sql !== mirror) failures.push("source and Supabase SQL mirror differ");

for (const token of [
  "A16V_STATUS=CANDIDATE_READY_NOT_APPLIED",
  "20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "20260703_check_a16v_official_import_real_transaction_execution_branch.sql",
  "public.a16p_tx_execute_giapha4_official_import",
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "Staging people: 102",
  "Staging relationships: 134",
  "Validation errors: 0",
  "Dry-run blockers: 0",
  "Duplicate unresolved: 0",
  "Duplicate needs_review: 0",
  "Duplicate create_new: 8",
  "A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED",
  "canRunOfficialImport=false",
  "Official import button remains disabled",
  "No SQL was run",
  "No RPC was called",
  "No `POST /official-import` was called",
  "No people, relationships, families, layout, tree, revision or profile rows were written by this phase",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "create or replace function public.a16p_tx_execute_giapha4_official_import",
  "security invoker",
  "set search_path = public, pg_temp",
  "official_import_batches",
  "official_import_rollback_manifests",
  "idempotency_key",
  "insert into public.people",
  "insert into public.families",
  "insert into public.family_parents",
  "insert into public.family_children",
  "insert into public.revisions",
  "rollback_order",
  "IMPORT_COMPLETED",
  "revoke execute on function public.a16p_tx_execute_giapha4_official_import",
]) {
  requireIncludes(sql, token, `SQL token ${token}`);
}

for (const token of [
  "SELECT_ONLY_VERIFICATION",
  "DO_NOT_CALL_RPC",
  "DO_NOT_RUN_OFFICIAL_IMPORT",
  "not security definer",
  "fixed search_path public pg_temp",
  "no anon/public execute grants",
  "no auto import trigger",
  "official_import_batches exists",
  "official_import_rollback_manifests exists",
  "idempotency unique guard exists",
]) {
  requireIncludes(checkSql, token, `verification token ${token}`);
}

for (const token of [
  "A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_MARKER",
  "A16V_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED_BLOCKER",
  "A16R_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY_BLOCKER",
  "realTransactionExecutionBranchCandidate",
  "sqlCandidateStatus: \"OWNER_APPLIED_VERIFIED\"",
  "verificationEvidenceSource: \"docs/PLAN_A16V_APPLY_VERIFY.md\"",
  "canonicalRpcName: A16P_TX_TRANSACTION_RPC_NAME",
  "allOrNothing: true",
  "idempotencyGuard: \"import_session_id\"",
  "canRunOfficialImport",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "confirmNoDryRunBlockers",
  "confirmDuplicateDecisionsComplete",
  "confirmA16TApplyVerified",
  "confirmA16ULockedBranchReady",
  "confirmProductionUiVisible",
]) {
  requireIncludes(route, token, `route confirmation ${token}`);
}

requireIncludes(panel, "disabled", "official import button disabled");
requireIncludes(panel, "aria-disabled=\"true\"", "official import aria disabled");

if (
  packageJson.scripts?.["check:a16v-official-import-real-transaction-execution-branch"] !==
  "node scripts/check-a16v-official-import-real-transaction-execution-branch.cjs"
) {
  failures.push("missing package script check:a16v-official-import-real-transaction-execution-branch");
}

for (const [content, token, label] of [
  [index, "PLAN_A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH.md", "index A-16V entry"],
  [workLog, "A16V_STATUS=CANDIDATE_READY_NOT_APPLIED", "work log A-16V status"],
  [decisionLog, "A-16V", "decision log A-16V entry"],
  [handoff, "A16V_STATUS=CANDIDATE_READY_NOT_APPLIED", "handoff A-16V status"],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [servicePath, service],
  [routePath, route],
]) {
  if (/\.rpc\s*\(/i.test(content)) {
    requireIncludes(
      a16ah,
      "A16AH_STATUS=PASS_SOURCE_BRANCH_CANDIDATE_NOT_EXECUTED",
      `${label} later A-16AH branch evidence`,
    );
    requireIncludes(
      service,
      "if (!candidate.canRunOfficialImport || params.executionBranchEnabled !== true)",
      `${label} A-16AH same-run gate before executor`,
    );
  }
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,260}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}

rejectPattern(doc + service + route + checkSql, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + service + route + checkSql, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden staged outside-scope file ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not be staged");
  if (file.startsWith("supabase/.temp/")) failures.push(`supabase temp staged ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`data file staged ${file}`);
}

if (failures.length > 0) {
  console.error("A-16V official import real transaction execution branch check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16V official import real transaction execution branch check passed.");

#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16BL_IMPORT_SESSION_FOR_UPDATE_RLS_LOCK_VISIBILITY_DIAGNOSIS.md";
const checkerPath =
  "scripts/check-a16bl-import-session-for-update-rls-lock-visibility-diagnosis.cjs";
const candidatePath =
  "scripts/a16bl-import-session-for-update-rls-fix-candidate.sql.draft";
const rpcMigrationPath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const stagingRlsPath =
  "supabase/migrations/20260630_0011_a16sql_import_staging_write_rls.sql";
const a16tPath =
  "supabase/migrations/20260702_0014_a16t_official_import_audit_rollback_idempotency_schema_candidate.sql";
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
const candidate = read(candidatePath);
const rpcMigration = read(rpcMigrationPath);
const stagingRls = read(stagingRlsPath);
const a16t = read(a16tPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A16BL_STATUS=PASS_DIAGNOSED_FOR_UPDATE_RLS_LOCK_VISIBILITY_FIX_CANDIDATE_NOT_APPLIED",
  "A16BL_TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16BL_PREVIOUS_POST_RESULT=OFFICIAL_IMPORT_POST_REJECTED_HTTP_409_SESSION_NOT_FOUND_OR_NOT_OWNED",
  "A16BL_NORMAL_SELECT_VISIBILITY=YES_FROM_A16BH_A16BJ_IDENTITY_AND_SESSION_READ_EVIDENCE",
  "A16BL_FOR_UPDATE_PRIVILEGE_CONTRACT=SELECT_FOR_UPDATE_REQUIRES_SELECT_PLUS_UPDATE_TABLE_PRIVILEGE_AND_UPDATE_RLS_USING_VISIBILITY_FOR_LOCKED_ROW",
  "A16BL_AUTHENTICATED_SELECT_PRIVILEGE=PRODUCTION_EFFECTIVE_YES_BY_READ_EVIDENCE_SOURCE_GRANT_NOT_EXPLICIT_IN_REPO_NEEDS_OWNER_METADATA_CONFIRMATION",
  "A16BL_AUTHENTICATED_UPDATE_PRIVILEGE=UNKNOWN_NOT_EXPLICIT_IN_REPO_NEEDS_OWNER_METADATA_CONFIRMATION",
  "A16BL_APPLICABLE_SELECT_POLICY=a16sql_import_sessions_select_own",
  "A16BL_APPLICABLE_UPDATE_POLICY=a16sql_import_sessions_update_own_preview",
  "A16BL_IMPORT_SESSION_UPDATE_POLICY_STATE_COVERAGE=PREVIEW_STATES_ONLY_EXCLUDES_OWNER_APPROVED_FOR_DB_WRITE",
  "A16BL_RLS_FOR_UPDATE_ROOT_CAUSE=IMPORT_SESSION_OWNER_APPROVED_ROW_VISIBLE_TO_NORMAL_SELECT_BUT_NOT_LOCK_VISIBLE_TO_SECURITY_INVOKER_SELECT_FOR_UPDATE_BECAUSE_UPDATE_RLS_POLICY_EXCLUDES_OWNER_APPROVED_FOR_DB_WRITE",
  "A16BL_BLOCKER=IMPORT_SESSION_FOR_UPDATE_REQUIRES_UPDATE_RLS_POLICY_FOR_OWNER_APPROVED_STATE",
  "A16BL_DOWNSTREAM_RPC_WRITE_RLS_RISKS=IMPORT_WRITE_MANIFESTS_LOCK_UPDATE_LIKELY_NEXT_RISK_OFFICIAL_IMPORT_BATCHES_HAVE_A16T_OWNER_POLICIES_REAL_GENEALOGY_INSERT_TABLE_GRANTS_RLS_NEED_METADATA_CONFIRMATION",
  "A16BL_MINIMUM_FIX_CANDIDATE=scripts/a16bl-import-session-for-update-rls-fix-candidate.sql.draft",
  "A16BL_FIX_CANDIDATE_STATUS=NOT_APPLIED_DO_NOT_RUN_AUTOMATICALLY_OWNER_REVIEW_REQUIRED",
  "A16BL_OWNER_SQL_RUNBOOK_SELECT_ONLY=YES",
  "A16BL_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BL_IMPORT_RPC_CALLED=NO",
  "A16BL_SQL_RUN_BY_CODEX=NO",
  "A16BL_DB_MUTATION_RUN=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16BL_NEXT_ACTION=OWNER_RUN_SELECT_ONLY_METADATA_RUNBOOK_THEN_SEPARATE_A16BM_SCHEMA_FIX_APPLY_APPROVAL_IF_CONFIRMED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [rpcMigration, "security invoker", "RPC remains security invoker"],
  [rpcMigration, "v_profile_id uuid := public.current_profile_id();", "RPC current profile"],
  [rpcMigration, "from public.import_sessions", "RPC reads import_sessions"],
  [rpcMigration, "for update;", "RPC preserves row lock"],
  [rpcMigration, "SESSION_NOT_FOUND_OR_NOT_OWNED", "RPC blocker token"],
  [stagingRls, "create policy a16sql_import_sessions_select_own", "import_sessions select policy"],
  [stagingRls, "create policy a16sql_import_sessions_update_own_preview", "import_sessions update policy"],
  [stagingRls, "preview_generated", "preview state source"],
  [stagingRls, "rejected_needs_fix", "preview update source"],
  [stagingRls, "create policy a16sql_import_write_manifests_select_own_session", "manifest select policy"],
  [stagingRls, "create policy a16sql_import_write_manifests_insert_own_session", "manifest insert policy"],
  [a16t, "create policy a16t_official_import_batches_update_own", "official import batch update policy"],
  [a16t, "create policy a16t_official_import_rollback_update_own", "rollback manifest update policy"],
  [candidate, "SQL_CANDIDATE_STATUS=NOT_APPLIED", "candidate not applied marker"],
  [candidate, "NO_OFFICIAL_IMPORT_EXECUTION", "candidate no import marker"],
  [candidate, "PRESERVE_SELECT_FOR_UPDATE_CONCURRENCY_LOCK", "candidate preserves lock"],
  [candidate, "grant select, update on table public.import_sessions to authenticated;", "candidate import_sessions grant"],
  [candidate, "grant select, update on table public.import_write_manifests to authenticated;", "candidate import_write_manifests grant"],
  [candidate, "a16bl_import_sessions_update_official_import_owner_lock", "candidate import_sessions policy"],
  [candidate, "a16bl_import_write_manifests_update_official_import_owner_lock", "candidate manifest policy"],
  [candidate, "owner_approved_for_db_write", "candidate owner approved session state"],
  [candidate, "write_completed", "candidate write completed state"],
  [index, docPath.replace("docs/", ""), "index A-16BL"],
  [workLog, "A-16BL - Import session FOR UPDATE RLS and lock-visibility diagnosis", "work log A-16BL"],
  [decisionLog, "Decision 312 - A-16BL treats SELECT FOR UPDATE as an UPDATE RLS visibility contract", "decision A-16BL"],
  [handoff, "A16BL_BLOCKER=IMPORT_SESSION_FOR_UPDATE_REQUIRES_UPDATE_RLS_POLICY_FOR_OWNER_APPROVED_STATE", "handoff A-16BL"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16bl-import-session-for-update-rls-lock-visibility-diagnosis"
  ] !==
  "node scripts/check-a16bl-import-session-for-update-rls-lock-visibility-diagnosis.cjs"
) {
  failures.push("missing package A-16BL check script");
}

rejectPattern(doc, /\bselect\s+\*\s+from\s+public\.import_sessions[\s\S]{0,120}for\s+update\b/i, "owner runbook must not lock production import_sessions rows");
rejectPattern(doc, /\bselect\s+public\.a16p_tx_execute_giapha4_official_import\b/i, "owner runbook must not invoke import RPC");
rejectPattern(doc, /\bperform\s+public\.a16p_tx_execute_giapha4_official_import\b/i, "owner runbook must not perform import RPC");
rejectPattern(doc, /A16BL_POST_OFFICIAL_IMPORT_CALLED=YES|A16BL_IMPORT_RPC_CALLED=YES|A16R_IMPORT_RETRY_NEXT=YES/i, "doc must keep import closed");
rejectPattern(doc, /A16BL_SQL_RUN_BY_CODEX=YES|A16BL_DB_MUTATION_RUN=YES|A16BL_DEPLOY_RUN=YES/i, "doc must keep mutation/deploy closed");
rejectPattern(candidate, /language\s+\w+[\s\S]{0,160}security\s+definer/i, "candidate must not define SECURITY DEFINER functions");
rejectPattern(candidate, /\bservice_role\b\s*=/i, "candidate must not configure service role");
rejectPattern(candidate, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "candidate must not invoke import RPC");
rejectPattern(checker, /\.(insert|update|upsert|delete)\s*\(/i, "checker must not mutate DB");
rejectPattern(checker, /\.rpc\s*\(/i, "checker must not call RPC");
rejectPattern(doc + candidate + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16BL|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BL|official-import/i, "app layout must not change");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  candidatePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16bj-final-read-only-official-import-retry-reconciliation-gate.cjs",
  "scripts/check-a16bi-same-client-rpc-binding-production-contract-read-only-verification.cjs",
  "scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs",
  "scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs",
  "scripts/check-a16be-official-import-rpc-session-ownership-contract-diagnosis.cjs",
  "scripts/check-a16bb-sanitized-session-state-runtime-gate-candidate.cjs",
  "scripts/check-a16bc-owner-approval-state-transition-readiness.cjs",
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "db/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql",
  "supabase/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql",
  "db/checks/20260711_check_a16bm_official_import_row_lock_rls_fix.sql",
  "docs/PLAN_A16BM_OFFICIAL_IMPORT_ROW_LOCK_RLS_FIX_CANDIDATE.md",
  "docs/PLAN_A16BM_SQL_APPLY_VERIFY_RUNBOOK.md",
  "scripts/check-a16bm-official-import-row-lock-rls-fix-candidate.cjs",
  "scripts/check-a16t-official-import-audit-rollback-idempotency-schema.cjs",
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden changed file ${file}`);
  }
  const isApprovedA16bmSqlCandidate =
    file ===
      "db/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql" ||
    file ===
      "supabase/migrations/20260711_0018_a16bm_official_import_row_lock_rls_fix_candidate.sql" ||
    file === "db/checks/20260711_check_a16bm_official_import_row_lock_rls_fix.sql";
  if (
    /^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file) &&
    !isApprovedA16bmSqlCandidate
  ) {
    failures.push(`forbidden applied SQL/check file ${file}`);
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
  console.error("A-16BL FOR UPDATE RLS lock-visibility diagnosis check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BL FOR UPDATE RLS lock-visibility diagnosis check passed.");

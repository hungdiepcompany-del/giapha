#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const docPath = "docs/PLAN_A16BQ_DOWNSTREAM_RPC_WRITE_CONTRACT_READ_ONLY_VERIFICATION.md";
const checkerPath = "scripts/check-a16bq-downstream-rpc-write-contract-read-only-verification.cjs";
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
const rpc = read(rpcPath);
const checker = read(checkerPath);
const packageJson = JSON.parse(read("package.json") || "{}");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A16BQ_STATUS=READY_FOR_OWNER_SELECT_ONLY_METADATA_VERIFICATION",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16BQ_RUNBOOK_STATUS=SELECT_ONLY_OWNER_METADATA_VERIFICATION_NOT_EXECUTED_BY_CODEX",
  "A16BQ_RPC_SELECT_TARGETS=import_sessions,official_import_batches,import_write_manifests,import_session_warnings,import_duplicate_candidates,import_relationship_candidates,family_children,family_parents",
  "A16BQ_RPC_SELECT_FOR_UPDATE_TARGETS=import_sessions,official_import_batches,import_write_manifests",
  "A16BQ_RPC_INSERT_TARGETS=official_import_batches,people,revisions,families,family_children,family_parents,official_import_rollback_manifests",
  "A16BQ_RPC_UPDATE_TARGETS=official_import_batches,import_write_manifests,import_sessions",
  "A16BQ_RPC_READBACK_AFTER_INSERT_TARGETS=family_children,family_parents",
  "A16BQ_REQUIRED_APP_PERMISSIONS=imports.create,people.create,relationships.create,permissions.manage",
  "A16BQ_DOWNSTREAM_RPC_WRITE_CONTRACT_SELECT_ONLY_VERIFY",
  "missing_authenticated_required_privilege_count",
  "forbidden_anon_public_table_grant_count",
  "forbidden_anon_public_policy_count",
  "all_rpc_tables_rls_enabled",
  "official_import_batches_supports_rpc_insert",
  "official_import_batches_supports_rpc_lock_select",
  "official_import_batches_supports_rpc_update_lifecycle",
  "official_import_batches_update_policy_runtime_compatible",
  "official_import_rollback_manifests_supports_rpc_insert",
  "people_supports_rpc_insert",
  "families_supports_rpc_insert",
  "family_parents_supports_rpc_insert",
  "family_parents_supports_required_readback",
  "family_children_supports_rpc_insert",
  "family_children_supports_required_readback",
  "revisions_supports_rpc_insert",
  "rpc_remains_security_invoker",
  "no_automatic_import_trigger",
  "a16bq_downstream_rpc_write_contract_verified",
  "A16BQ_SQL_RUN_BY_CODEX=NO",
  "A16BQ_RUNBOOK_EXECUTED_BY_CODEX=NO",
  "A16BQ_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16BQ_IMPORT_RPC_CALLED=NO",
  "A16BQ_OFFICIAL_IMPORT_BATCH_UPDATE_STATUS=PASS_RUNTIME_COMPATIBLE",
  "A16BQ_BATCH_LIFECYCLE_BOOLEAN=FALSE_NEGATIVE_CHECKER_TOO_STRICT",
]) {
  requireIncludes(doc, token, `A-16BQ doc/runbook token ${token}`);
}

for (const token of [
  "from public.import_sessions",
  "from public.official_import_batches",
  "from public.import_write_manifests",
  "from public.import_session_warnings",
  "from public.import_duplicate_candidates",
  "from public.import_relationship_candidates",
  "insert into public.official_import_batches",
  "insert into public.people",
  "insert into public.families",
  "insert into public.family_children",
  "insert into public.family_parents",
  "insert into public.revisions",
  "insert into public.official_import_rollback_manifests",
  "update public.official_import_batches",
  "update public.import_write_manifests",
  "update public.import_sessions",
  "security invoker",
]) {
  requireIncludes(rpc, token, `RPC source token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A16BQ_DOWNSTREAM_RPC_WRITE_CONTRACT_READ_ONLY_VERIFICATION.md", "index A-16BQ"],
  [workLog, "A-16BQ - Downstream RPC write-contract read-only verification runbook", "work log A-16BQ"],
  [decisionLog, "Decision 317 - A-16BQ requires downstream metadata verification before another retry", "decision A-16BQ"],
  [handoff, "A16BQ_STATUS=READY_FOR_OWNER_SELECT_ONLY_METADATA_VERIFICATION", "handoff A-16BQ"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16bq-downstream-rpc-write-contract-read-only-verification"] !==
  "node scripts/check-a16bq-downstream-rpc-write-contract-read-only-verification.cjs"
) {
  failures.push("missing package A-16BQ check script");
}

const sqlBlocks = [...doc.matchAll(/```sql\r?\n([\s\S]*?)```/g)].map((match) => match[1]);
if (sqlBlocks.length !== 1) failures.push("A-16BQ doc must contain exactly one SQL runbook block");
for (const sql of sqlBlocks) {
  rejectPattern(sql, /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate)\b/im, "A-16BQ SQL runbook must remain SELECT-only");
  rejectPattern(sql, /\bfor\s+update\b/i, "A-16BQ SQL runbook must not lock production rows");
  rejectPattern(sql, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "A-16BQ SQL runbook must not invoke official import RPC");
  rejectPattern(
    sql,
    /official_import_batches_supports_rpc_update_lifecycle[\s\S]{0,900}%completed%/i,
    "official_import_batches UPDATE check must not require literal completed",
  );
}

rejectPattern(doc + workLog + handoff, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(wrangler, /A16BP|A16BQ|A16R_IMPORT_RETRY/i, "wrangler config must not change");
rejectPattern(layout, /A16BP|A16BQ|official-import/i, "app layout must not change");
rejectPattern(doc + checker, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  docPath,
  "docs/PLAN_A16BP_REVOKE_ANON_IMPORT_STAGING_GRANTS_APPLY_VERIFY.md",
  "docs/PLAN_A16BR_REVISIONS_INSERT_RLS_AND_ANON_GRANT_CLEANUP.md",
  "docs/PLAN_A16BR_SQL_APPLY_VERIFY_RUNBOOK.md",
  checkerPath,
  "scripts/check-a16bp-revoke-anon-import-staging-grants-apply-verify.cjs",
  "scripts/check-a16br-revisions-insert-rls-and-anon-grant-cleanup.cjs",
  "db/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql",
  "supabase/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql",
  "db/checks/20260711_check_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql",
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "db/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql",
  "supabase/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql",
  "db/checks/20260711_check_a16bt_secure_public_genealogy_read_boundary.sql",
  "docs/PLAN_A16BT_SECURE_PUBLIC_GENEALOGY_READ_BOUNDARY.md",
  "docs/PLAN_A16BT_SQL_APPLY_VERIFY_LOCALHOST_SMOKE.md",
  "scripts/check-a16bt-secure-public-genealogy-read-boundary.cjs",
  "lib/family/public-family-service.ts",
  "lib/family/tree-graph-builder.ts",
  "lib/family/tree-types.ts",
  "lib/privacy/privacy-service.ts",
  "docs/PLAN_A16BU_OFFICIAL_IMPORT_IS_LIVING_NULL_CONTRACT_FIX.md",
  "scripts/check-a16bu-official-import-is-living-null-contract-fix.cjs",
  "scripts/check-a16bf-rpc-invocation-identity-precheck-contract-alignment.cjs",
  "scripts/check-a16bh-production-a16bf-identity-precheck-rpc-contract-drift-diagnosis.cjs",
  "scripts/check-a16bi-same-client-rpc-binding-production-contract-read-only-verification.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql",
  "supabase/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql",
]);
for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (
    (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) &&
    ![
      "db/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql",
      "supabase/migrations/20260711_0020_a16br_revisions_insert_rls_and_anon_grant_cleanup.sql",
      "db/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql",
      "supabase/migrations/20260711_0021_a16bt_secure_public_genealogy_read_boundary.sql",
      "db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql",
      "supabase/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql",
    ].includes(file)
  ) {
    failures.push(`migration must not change in A-16BQ: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-16BQ downstream RPC write-contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BQ downstream RPC write-contract check passed.");

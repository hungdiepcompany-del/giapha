#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const dbMigrationPath =
  "db/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql";
const verifierPath =
  "db/checks/20260712_check_a17n_tx1_admin_canonical_family_transaction_executor.sql";
const docPath =
  "docs/PLAN_A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_CANDIDATE.md";
const checkerPath =
  "scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs";
const previousMigrationPath =
  "db/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql";
const expected0023Sha =
  "B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readBuffer(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return Buffer.from("");
  }
  return fs.readFileSync(absolutePath);
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

function sha256Hex(relativePath) {
  return crypto
    .createHash("sha256")
    .update(readBuffer(relativePath))
    .digest("hex")
    .toUpperCase();
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
}

function stripFunctionBodies(sql) {
  return sql.replace(
    /create\s+or\s+replace\s+function[\s\S]*?as\s+\$\$[\s\S]*?\$\$;/gi,
    "create or replace function <stripped> $$;",
  );
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

const migration = read(dbMigrationPath);
const mirror = read(supabaseMigrationPath);
const verifier = read(verifierPath);
const verifierWithoutComments = stripSqlComments(verifier);
const migrationWithoutComments = stripSqlComments(migration);
const migrationTopLevel = stripFunctionBodies(migrationWithoutComments);
const packageJson = readJson("package.json");
const doc = read(docPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const functionBodyMatch = migration.match(
  /create\s+or\s+replace\s+function\s+public\.execute_admin_canonical_family_parent_child_write[\s\S]*?\nend;\n\$\$/i,
);
const functionBody = functionBodyMatch?.[0] ?? "";

if (migration !== mirror) failures.push("A-17N-TX1 migration mirrors differ");
if (sha256Hex(previousMigrationPath) !== expected0023Sha) {
  failures.push("prior migration 0023 SHA drifted");
}

for (const token of [
  "A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "create table if not exists public.admin_canonical_family_write_idempotency",
  "admin_canonical_family_write_idempotency_actor_key_unique",
  "operation_type in ('ADD_PARENT', 'ADD_CHILD')",
  "mutation_plan_hash text not null",
  "alter table public.admin_canonical_family_write_idempotency enable row level security",
  "create policy a17n_tx1_idempotency_select_own",
  "create policy a17n_tx1_idempotency_insert_own",
  "create policy a17n_tx1_idempotency_update_own",
  "create policy a17n_tx1_revisions_insert_admin_canonical_family_write",
  "create or replace function public.execute_admin_canonical_family_parent_child_write",
  "security invoker",
  "set search_path = public, auth, pg_temp",
  "auth.uid() is null",
  "p_actor_profile_id is distinct from v_profile_id",
  "public.has_permission('relationships.create')",
  "public.has_permission('relationships.update')",
  "p_operation_type not in ('ADD_PARENT', 'ADD_CHILD')",
  "p_family_action not in ('CREATE', 'REUSE')",
  "IDEMPOTENCY_PAYLOAD_HASH_MISMATCH",
  "MUTATION_PLAN_HASH_REQUIRED",
  "CANONICAL_KEY_PARENT_SET_MISMATCH",
  "for update",
  "CANONICAL_FAMILY_TARGET_NOT_REUSABLE",
  "CANONICAL_FAMILY_CONCURRENT_MODIFICATION",
  "CANONICAL_FAMILY_LEGACY_DUPLICATE_REVIEW_REQUIRED",
  "on conflict (canonical_key)",
  "on conflict (family_id, person_id)",
  "SELF_RELATIONSHIP_BLOCKED",
  "DIRECT_ANCESTRY_CYCLE",
  "CONFLICTING_CHILD_RELATIONSHIP_TYPE",
  "A-17N-TX1 admin canonical family transaction executor",
  "revoke execute on function public.execute_admin_canonical_family_parent_child_write",
  ") from public",
  ") from anon",
  ") to authenticated",
]) {
  requireIncludes(migration, token, `migration token ${token}`);
}

for (const token of [
  "ADD_PARENT",
  "ADD_CHILD",
  "BLOCKED_PERMISSION",
  "BLOCKED_CONCURRENT_MODIFICATION",
  "BLOCKED_AMBIGUOUS",
  "BLOCKED_INVALID_REFERENCE",
  "BLOCKED_CYCLE",
  "BLOCKED_IDEMPOTENCY_CONFLICT",
  "PARENT_LINK_CREATED",
  "PARENT_LINK_ALREADY_EXISTS",
  "CHILD_LINK_CREATED",
  "CHILD_LINK_ALREADY_EXISTS",
]) {
  requireIncludes(functionBody, token, `function return/status token ${token}`);
}

for (const forbidden of [
  "ADD_SPOUSE",
  "IMPORTER_OPERATION",
  "RECONCILE",
  "MERGE_LEGACY",
  "ROLLBACK",
  "TRUNCATE",
  "SECURITY DEFINER",
]) {
  if (functionBody.toUpperCase().includes(forbidden)) {
    failures.push(`function scope includes forbidden token ${forbidden}`);
  }
}

rejectPattern(migrationWithoutComments, /\bsecurity\s+definer\b/i, "SECURITY DEFINER");
rejectPattern(migrationWithoutComments, /\bexecute\s*\(/i, "dynamic execute");
rejectPattern(migrationWithoutComments, /\btruncate\b/i, "TRUNCATE");
rejectPattern(migrationWithoutComments, /\bdelete\s+from\b/i, "DELETE FROM");
rejectPattern(migrationWithoutComments, /\bcreate\s+trigger\b/i, "automatic trigger");
rejectPattern(migrationWithoutComments, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "official import RPC call");
rejectPattern(migrationWithoutComments, /\bselect\s+public\.execute_admin_canonical_family_parent_child_write\s*\(/i, "candidate RPC invocation");
rejectPattern(migrationTopLevel, /\bupdate\s+public\.(people|families|family_parents|family_children)\b/i, "top-level business-data UPDATE");
rejectPattern(migrationTopLevel, /\binsert\s+into\s+public\.(people|families|family_parents|family_children)\b/i, "top-level business-data INSERT");
rejectPattern(migrationTopLevel, /\bset\s+canonical_key\s*=/i, "top-level canonical key backfill");

for (const token of [
  "a17n_tx1_function_exists",
  "a17n_tx1_exact_argument_types",
  "a17n_tx1_return_type_jsonb",
  "a17n_tx1_volatility_volatile",
  "a17n_tx1_security_invoker",
  "a17n_tx1_fixed_search_path",
  "a17n_tx1_no_public_execute",
  "a17n_tx1_no_anon_execute",
  "a17n_tx1_authenticated_execute_grant",
  "a17n_tx1_idempotency_table_exists",
  "a17n_tx1_idempotency_rls_enabled",
  "a17n_tx1_no_seeded_idempotency_rows",
  "a17n_tx1_existing_family_count_unchanged",
  "a17n_tx1_parent_count_unchanged",
  "a17n_tx1_child_count_unchanged",
  "a17n_tx1_no_canonical_key_backfill",
  "a17n_tx1_no_reconciliation_rows_created",
]) {
  requireIncludes(verifier, token, `verifier token ${token}`);
}

rejectPattern(
  verifierWithoutComments,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "post-apply verifier must stay SELECT-only",
);
rejectPattern(verifierWithoutComments, /\bfor\s+update\b/i, "verifier must not lock rows");
rejectPattern(
  verifierWithoutComments,
  /\bexecute_admin_canonical_family_parent_child_write\s*\(/i,
  "verifier must not call candidate RPC",
);

for (const token of [
  "A17N_TX1_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED",
  "MIGRATION_FILE=db/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql",
  "SUPABASE_MIRROR_FILE=supabase/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql",
  "TRANSACTION_EXECUTOR_CREATED=YES",
  "SUPPORTED_OPERATION_ADD_PARENT=YES",
  "SUPPORTED_OPERATION_ADD_CHILD=YES",
  "UNSUPPORTED_IMPORTER_OPERATION=YES",
  "UNSUPPORTED_ADD_SPOUSE_OPERATION=YES",
  "UNSUPPORTED_RECONCILIATION_OPERATION=YES",
  "SECURITY_MODE=SECURITY_INVOKER",
  "FIXED_SEARCH_PATH=YES",
  "AUTH_UID_REQUIRED=YES",
  "ACTOR_PROFILE_VALIDATED=YES",
  "PERMISSION_VALIDATED=YES",
  "SERVICE_ROLE_REQUIRED=NO",
  "PUBLIC_EXECUTE_GRANTED=NO",
  "ANON_EXECUTE_GRANTED=NO",
  "IDEMPOTENCY_REQUIRED=YES",
  "MUTATION_PLAN_HASH_REQUIRED=YES",
  "ROW_LOCKS_PRESENT=YES",
  "CONCURRENCY_VERSION_CHECK_PRESENT=YES",
  "CANONICAL_UNIQUENESS_PROTECTED=YES",
  "FAMILY_STATUS_GUARDS_PRESENT=YES",
  "PERSON_REFERENCE_GUARDS_PRESENT=YES",
  "SELF_RELATIONSHIP_BLOCKED=YES",
  "CYCLE_GUARD_PRESENT=YES",
  "PARTIAL_WRITE_POSSIBLE=NO",
  "ADMIN_PARENT_ACTION_INTEGRATED=NO",
  "ADMIN_CHILD_ACTION_INTEGRATED=NO",
  "CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=0",
  "POST_APPLY_VERIFIER_CREATED=YES",
  "POST_APPLY_VERIFIER_EXECUTED=NO",
  "SQL_EXECUTED=NO",
  "MIGRATION_APPLIED=NO",
  "APPROVE_A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_CANDIDATE",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_CANDIDATE.md", "index A17N-TX1"],
  [workLog, "A17N_TX1_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED", "work log A17N-TX1"],
  [decisionLog, "Decision 334 - A-17N-TX1 creates admin canonical family transaction executor candidate", "decision A17N-TX1"],
  [handoff, "A17N_TX1_STATUS=CANDIDATE_READY_NOT_APPLIED_OWNER_REVIEW_REQUIRED", "handoff A17N-TX1"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17n-tx1-admin-canonical-family-transaction-executor-candidate"] !==
  "node scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs"
) {
  failures.push("missing package script check:a17n-tx1-admin-canonical-family-transaction-executor-candidate");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  dbMigrationPath,
  supabaseMigrationPath,
  verifierPath,
  docPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs",
  "scripts/check-a17m-canonical-family-domain-service.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
  "docs/PLAN_A17N_TX2_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_POST_APPLY_VERIFICATION.md",
  "docs/PLAN_A17N_TX2F_POST_APPLY_VERIFIER_ACTIVE_SCOPE_CORRECTION.md",
  "scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs",
  "docs/PLAN_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION.md",
  "scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs",
  "docs/PLAN_A17N_DR_DEPLOY_PRODUCTION_NO_MUTATION_SMOKE_EVIDENCE.md",
  "scripts/check-a17n-dr-deploy-production-no-mutation-smoke-evidence.cjs",
  "app/(admin)/admin/tree/edit/actions.ts",
  "lib/family/admin-canonical-family-link-service.ts",
  "lib/family/admin-canonical-family-runtime-service.ts",
  "lib/family/admin-canonical-family-transaction-adapter.ts",
  "lib/family/canonical-family-supabase-repository.ts",
  ]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected A-17N-TX1 dirty file: ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
}

if (failures.length > 0) {
  console.error("A-17N-TX1 transaction executor candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17N-TX1 transaction executor candidate check passed.");

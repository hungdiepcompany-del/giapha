#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const dbMigrationPath =
  "db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql";
const verifierPath =
  "db/checks/20260713_check_a17o_tx1_grouped_official_import_transaction_executor.sql";
const docPath =
  "docs/PLAN_A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE.md";
const checkerPath =
  "scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs";
const oldExecutorMigrationPath =
  "db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql";

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

function groupKey(parentFingerprints) {
  const normalized = Array.from(
    new Set(
      parentFingerprints
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    ),
  ).sort();
  const serialized = JSON.stringify({
    version: "a17o-import-family-group:v1",
    parentFingerprints: normalized,
  });
  return `a17o-import-family-group:v1:${crypto
    .createHash("sha256")
    .update(serialized)
    .digest("hex")}`;
}

function txFixture(label, parentFingerprints, childCount) {
  const key = groupKey(parentFingerprints);
  return {
    label,
    contractVersion: 1,
    sessionId: "00000000-0000-0000-0000-000000000001",
    approvalMarker: "APPROVE_A17O_TX1_FIXTURE",
    actorProfileId: "00000000-0000-0000-0000-000000000002",
    idempotencyKey: `A17O_TX1_FIXTURE_${label}`,
    mutationPlanHash: crypto.createHash("sha256").update(label).digest("hex"),
    familyGroups: [
      {
        groupKey: key,
        canonicalKey: `canonical-family:v1:${crypto
          .createHash("sha256")
          .update(key)
          .digest("hex")}`,
        identityVersion: 1,
        familyAction: "CREATE",
        parentMemberships: parentFingerprints.map((_, index) => ({
          personId: `00000000-0000-0000-0000-00000000000${index + 3}`,
          role: index === 0 ? "father" : "mother",
          relationshipType: "biological",
        })),
        childMemberships: Array.from({ length: childCount }, (_, index) => ({
          personId: `00000000-0000-0000-0000-0000000000${index + 20}`,
          relationshipType: "biological",
        })),
      },
    ],
  };
}

function assertCase(label, condition) {
  if (!condition) failures.push(`fixture failed: ${label}`);
}

const migration = read(dbMigrationPath);
const mirror = read(supabaseMigrationPath);
const verifier = read(verifierPath);
const verifierWithoutComments = stripSqlComments(verifier);
const migrationWithoutComments = stripSqlComments(migration);
const migrationTopLevel = stripFunctionBodies(migrationWithoutComments);
const oldExecutorMigration = read(oldExecutorMigrationPath);
const doc = read(docPath);
const source = read("lib/import/giapha4/canonical-family-grouping.ts");
const oldA17OChecker = read("scripts/check-a17o-importer-canonical-family-grouping.cjs");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");
const migrationSha = sha256Hex(dbMigrationPath);

if (migration !== mirror) failures.push("A-17O-TX1 migration mirrors differ");

const oneChild = txFixture("ONE_CHILD", ["parent-a", "parent-b"], 1);
const twoChildren = txFixture("TWO_CHILDREN", ["parent-a", "parent-b"], 2);
const oneParent = txFixture("ONE_PARENT", ["single-parent"], 1);
const reversedKey = groupKey(["parent-b", "parent-a"]);
const orderedKey = groupKey(["parent-a", "parent-b"]);

assertCase("payload supports familyGroups", Array.isArray(oneChild.familyGroups));
assertCase("payload supports parentMemberships", oneChild.familyGroups[0].parentMemberships.length === 2);
assertCase("payload supports childMemberships", twoChildren.familyGroups[0].childMemberships.length === 2);
assertCase("payload supports one parent group", oneParent.familyGroups[0].parentMemberships.length === 1);
assertCase("group key ignores parent order", reversedKey === orderedKey);
assertCase("group key excludes child id", groupKey(["parent-a", "parent-b"]) === orderedKey);
assertCase("mutation hash is sha256", /^[a-f0-9]{64}$/.test(oneChild.mutationPlanHash));
assertCase("canonical key is versioned", oneChild.familyGroups[0].canonicalKey.startsWith("canonical-family:v1:"));
assertCase("contract version is v1", oneChild.contractVersion === 1);
assertCase("idempotency key present", oneChild.idempotencyKey.length > 16);
assertCase("approval marker present", oneChild.approvalMarker.includes("APPROVE_A17O_TX1"));
assertCase("actor profile present", oneChild.actorProfileId.endsWith("2"));
assertCase("session id present", oneChild.sessionId.endsWith("1"));
assertCase("family action create", oneChild.familyGroups[0].familyAction === "CREATE");
assertCase("parent role typed", oneChild.familyGroups[0].parentMemberships[0].role === "father");
assertCase("child relationship typed", oneChild.familyGroups[0].childMemberships[0].relationshipType === "biological");
assertCase("multiple children stay in one group", twoChildren.familyGroups.length === 1);

for (const token of [
  "A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "NO_SEED_DATA",
  "NO_OFFICIAL_IMPORT_EXECUTION",
  "OLD_EXECUTOR_SIGNATURE_CHANGED=NO",
  "OLD_EXECUTOR_DROPPED=NO",
  "NEW_GROUPED_EXECUTOR_NAME=public.a17o_tx_execute_grouped_giapha4_official_import",
  "NEGATIVE_TEST_ONLY_COMPLETED_PRODUCTION_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "create table if not exists public.official_import_grouped_execution_idempotency",
  "official_import_grouped_execution_actor_key_unique",
  "alter table public.official_import_grouped_execution_idempotency",
  "enable row level security",
  "create policy a17o_tx1_grouped_execution_select_own",
  "create policy a17o_tx1_grouped_execution_insert_own",
  "create policy a17o_tx1_grouped_execution_update_own",
  "alter table public.official_import_batches",
  "grouped_execution_contract_version integer",
  "mutation_plan_hash text",
  "grouped_family_rollback_summary jsonb",
  "create or replace function public.a17o_tx_execute_grouped_giapha4_official_import",
  "security invoker",
  "set search_path = public, auth, pg_temp",
  "p_grouped_plan jsonb",
  "p_dry_run_only boolean default true",
  "auth.uid() is null",
  "public.has_permission('imports.create')",
  "public.has_permission('people.create')",
  "public.has_permission('relationships.create')",
  "public.has_permission('permissions.manage')",
  "A17O_TX_GROUP_CONTRACT_INVALID",
  "A17O_TX_IMPORT_SESSION_ALREADY_EXECUTED",
  "A17O_TX_COMPLETED_OR_CONSUMED_SESSION_REJECTED",
  "A17O_TX_IDEMPOTENCY_PLAN_HASH_MISMATCH",
  "A17O_TX_LEGACY_DUPLICATE_REVIEW_REQUIRED",
  "for update",
  "familyGroups",
  "parentMemberships",
  "childMemberships",
  "sourcePersonFingerprint",
  "sourceReferenceHashes",
  "canonical-family:v1:",
  "a17o-import-family-group:v1:",
  "on conflict (canonical_key)",
  "on conflict (family_id, person_id)",
  "familyCreatedByExecution",
  "familyReused",
  "parentMembershipsCreatedByExecution",
  "parentMembershipsPreExisting",
  "childMembershipsCreatedByExecution",
  "childMembershipsPreExisting",
  "revoke execute on function public.a17o_tx_execute_grouped_giapha4_official_import",
  ") from public",
  ") from anon",
  ") to authenticated",
]) {
  requireIncludes(migration, token, `migration token ${token}`);
}

for (const forbidden of [
  "create or replace function public.a16p_tx_execute_giapha4_official_import",
  "drop function public.a16p_tx_execute_giapha4_official_import",
  "SECURITY DEFINER",
  "TRUNCATE",
]) {
  if (migrationWithoutComments.toUpperCase().includes(forbidden.toUpperCase())) {
    failures.push(`forbidden migration token ${forbidden}`);
  }
}

rejectPattern(migrationWithoutComments, /\bsecurity\s+definer\b/i, "SECURITY DEFINER");
rejectPattern(migrationWithoutComments, /\btruncate\b/i, "TRUNCATE");
rejectPattern(migrationWithoutComments, /\bdelete\s+from\b/i, "DELETE FROM");
rejectPattern(migrationWithoutComments, /\bselect\s+public\.a17o_tx_execute_grouped_giapha4_official_import\s*\(/i, "candidate RPC invocation");
rejectPattern(migrationWithoutComments, /\bperform\s+public\.a17o_tx_execute_grouped_giapha4_official_import\s*\(/i, "candidate RPC invocation");
rejectPattern(migrationWithoutComments, /\bselect\s+public\.a16p_tx_execute_giapha4_official_import\s*\(/i, "old RPC invocation");
rejectPattern(migrationWithoutComments, /\bperform\s+public\.a16p_tx_execute_giapha4_official_import\s*\(/i, "old RPC invocation");
rejectPattern(migrationTopLevel, /\binsert\s+into\s+public\.(people|families|family_parents|family_children|revisions)\b/i, "top-level business-data INSERT");
rejectPattern(migrationTopLevel, /\bupdate\s+public\.(people|families|family_parents|family_children|revisions)\b/i, "top-level business-data UPDATE");
rejectPattern(migrationTopLevel, /\bset\s+canonical_key\s*=/i, "top-level canonical key backfill");

for (const token of [
  "create or replace function public.a16p_tx_execute_giapha4_official_import",
  "p_import_session_id uuid",
  "p_confirm_marker text",
  "p_confirm_manifest_hash text default null",
  "p_confirm_review_pack_hash text default null",
  "security invoker",
  "set search_path = public, pg_temp",
  "IMPORT_ALREADY_COMPLETED",
]) {
  requireIncludes(oldExecutorMigration, token, `old executor migration token ${token}`);
}

for (const token of [
  "a17o_tx1_function_exists",
  "a17o_tx1_exact_argument_types",
  "a17o_tx1_return_type_jsonb",
  "a17o_tx1_volatility_volatile",
  "a17o_tx1_security_invoker",
  "a17o_tx1_fixed_search_path",
  "a17o_tx1_no_public_execute",
  "a17o_tx1_no_anon_execute",
  "a17o_tx1_authenticated_execute_grant",
  "a17o_tx1_old_executor_preserved",
  "a17o_tx1_grouped_payload_contract_present",
  "a17o_tx1_idempotency_table_exists",
  "a17o_tx1_idempotency_rls_enabled",
  "a17o_tx1_idempotency_policies_exist",
  "a17o_tx1_idempotency_grants_safe",
  "a17o_tx1_idempotency_constraints_exist",
  "a17o_tx1_batch_columns_and_constraints_exist",
  "a17o_tx1_rollback_summary_column_exists",
  "a17o_tx1_no_seeded_idempotency_rows",
  "a17o_tx1_baseline_counts_unchanged",
  "a17o_tx1_no_grouped_executor_rows_created_by_apply",
  "a17o_tx1_completed_production_session_still_non_executable",
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
  /\ba17o_tx_execute_grouped_giapha4_official_import\s*\(/i,
  "verifier must not call grouped candidate RPC",
);
rejectPattern(
  verifierWithoutComments,
  /\ba16p_tx_execute_giapha4_official_import\s*\(/i,
  "verifier must not call old official import RPC",
);

for (const token of [
  "A17O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED",
  "A17SQL_O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY",
  "A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED",
  `MIGRATION_FILE=${dbMigrationPath}`,
  `SUPABASE_MIRROR_FILE=${supabaseMigrationPath}`,
  `DB_MIGRATION_SHA256=${migrationSha}`,
  `SUPABASE_MIRROR_SHA256=${migrationSha}`,
  "MIRROR_MATCH=YES",
  "OLD_EXECUTOR_NAME=public.a16p_tx_execute_giapha4_official_import",
  "OLD_EXECUTOR_SIGNATURE_CHANGED=NO",
  "OLD_EXECUTOR_DROPPED=NO",
  "NEW_GROUPED_EXECUTOR_NAME=public.a17o_tx_execute_grouped_giapha4_official_import",
  "GROUPED_EXECUTOR_CREATED=YES",
  "SECURITY_MODE=SECURITY_INVOKER",
  "FIXED_SEARCH_PATH=YES",
  "AUTH_UID_REQUIRED=YES",
  "PERMISSION_VALIDATED=YES",
  "SERVICE_ROLE_REQUIRED=NO",
  "PUBLIC_EXECUTE_GRANTED=NO",
  "ANON_EXECUTE_GRANTED=NO",
  "GROUPED_PAYLOAD_SUPPORT=YES",
  "ONE_FAMILY_MULTIPLE_CHILDREN_SUPPORTED=YES",
  "IDEMPOTENCY_REQUIRED=YES",
  "MUTATION_PLAN_HASH_REQUIRED=YES",
  "ROW_LOCKS_PRESENT=YES",
  "ROLLBACK_DISTINGUISHES_CREATED_VS_PREEXISTING=YES",
  "COMPLETED_PRODUCTION_SESSION_REOPENED=NO",
  "POST_APPLY_VERIFIER_CREATED=YES",
  "POST_APPLY_VERIFIER_EXECUTED=YES_OWNER_MANUAL_PRODUCTION",
  "SQL_EXECUTED_BY_PHASE=NO",
  "MIGRATION_APPLIED=YES_OWNER_MANUAL_PRODUCTION",
  "A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED",
  "OFFICIAL_IMPORT_RPC_CALLED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE.md", "index A17O-TX1"],
  [
    workLog,
    "A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED",
    "work log A17O-TX1R",
  ],
  [
    decisionLog,
    "Decision 340 - A-17O-TX1 adds grouped official import executor candidate",
    "decision A17O-TX1",
  ],
  [
    handoff,
    "A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED",
    "handoff A17O-TX1R",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "A17O_TX1_GROUPED_EXECUTOR_CANDIDATE_PRESENT=YES",
  "check:a17o-tx1-grouped-official-import-transaction-executor-candidate",
]) {
  requireIncludes(oldA17OChecker, token, `A-17O checker allowlist token ${token}`);
}

if (
  packageJson?.scripts?.["check:a17o-tx1-grouped-official-import-transaction-executor-candidate"] !==
  "node scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs"
) {
  failures.push("missing package script check:a17o-tx1-grouped-official-import-transaction-executor-candidate");
}

requireIncludes(source, "buildA17OCanonicalImportFamilyGroupingPlan", "A-17O source grouping builder");
requireIncludes(source, "A17O_IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE = true", "A-17O-R runtime source integration active");

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
  "docs/PLAN_A17O_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX.md",
  "docs/PLAN_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE.md",
  "docs/PLAN_A17O_TX1R_GROUPED_IMPORT_EXECUTOR_MANUAL_APPLY_VERIFICATION.md",
  "scripts/check-a17o-importer-canonical-family-grouping.cjs",
  "scripts/check-a17o-tx1r-grouped-import-executor-manual-apply-verification.cjs",
  "docs/PLAN_A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION.md",
  "scripts/check-a17o-r-grouped-importer-runtime-integration.cjs",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "components/imports/import-session-manifest-panel.tsx",
  "lib/import/giapha4/canonical-family-grouping.ts",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/grouped-official-import-executor-adapter.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "lib/import/giapha4/official-import-service.ts",
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "scripts/check-a17m-canonical-family-domain-service.cjs",
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs",
  "scripts/check-a17n-dr-deploy-production-no-mutation-smoke-evidence.cjs",
  "scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs",
  "scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs",
  "scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected A-17O-TX1 dirty file: ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
}

if (failures.length > 0) {
  console.error("A-17O-TX1 grouped official import transaction executor candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17O-TX1 grouped official import transaction executor candidate check passed.");

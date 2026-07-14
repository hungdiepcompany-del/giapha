#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const evidenceDocPath =
  "docs/PLAN_A17Q_TX1R_LEGACY_FAMILY_RECONCILIATION_EXECUTOR_MANUAL_APPLY_VERIFICATION.md";
const planDocPath =
  "docs/PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md";
const dbMigrationPath =
  "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql";
const verifierPath =
  "db/checks/20260713_check_a17q_tx1_legacy_family_reconciliation_executor_candidate.sql";
const expectedSha =
  "9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66";

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

function sha256Hex(relativePath) {
  return crypto.createHash("sha256").update(readBuffer(relativePath)).digest("hex").toUpperCase();
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

function stripSqlStrings(sql) {
  return sql.replace(/'(?:''|[^'])*'/g, "''");
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

const evidenceDoc = read(evidenceDocPath);
const planDoc = read(planDocPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const migration = read(dbMigrationPath);
const mirror = read(supabaseMigrationPath);
const verifier = read(verifierPath);
const verifierCode = stripSqlStrings(stripSqlComments(verifier));
const packageJson = JSON.parse(read("package.json"));

if (migration !== mirror) failures.push("migration mirrors are not byte-identical");
if (sha256Hex(dbMigrationPath) !== expectedSha) failures.push("db migration SHA drifted");
if (sha256Hex(supabaseMigrationPath) !== expectedSha) failures.push("Supabase migration SHA drifted");

for (const token of [
  "A17Q_TX1R_STATUS=PASS_MANUAL_APPLY_VERIFICATION_EVIDENCE_RECORDED",
  "A17Q_TX1_MANUAL_APPLY_STATUS=PASS_MIGRATION_APPLIED_AND_SELECT_ONLY_VERIFIED_NO_RECONCILIATION",
  "TARGET_PROJECT_REF=frkyeuxrlcflmsxxsolp",
  `MIGRATION_FILE=${dbMigrationPath}`,
  `SUPABASE_MIRROR_FILE=${supabaseMigrationPath}`,
  `MIGRATION_SHA256=${expectedSha}`,
  "MIRROR_MATCH=YES",
  "MIGRATION_APPLIED=YES_OWNER_MANUAL_PRODUCTION",
  "DATABASE_SCHEMA_CHANGED=YES",
  `VERIFIER_FILE=${verifierPath}`,
  "VERIFIER_SELECT_ONLY=YES",
  "VERIFIER_ALL_REQUIRED_CHECKS_PASS=YES",
  "VERIFIER_EXECUTED_BY_OWNER=YES",
  "VERIFIER_RERUN_BY_CODEX=NO",
  "SELECT_ONLY_VERIFIER_STATUS=PASS_ALL_CONTRACT_FIELDS_TRUE",
  "SQL_EXECUTED=YES",
  "SQL_SCOPE=MIGRATION_0026_AND_SELECT_ONLY_VERIFIER",
  "SQL_EXECUTED_BY_CODEX=NO",
  "FUNCTION_EXISTS=YES",
  "RETURN_TYPE=jsonb",
  "FUNCTION_SECURITY_MODE=SECURITY_INVOKER",
  "FUNCTION_SEARCH_PATH=public, auth, pg_temp",
  "PUBLIC_EXECUTE_ALLOWED=NO",
  "ANON_EXECUTE_ALLOWED=NO",
  "AUTHENTICATED_EXECUTE_GRANT=YES",
  "ALL_EMBEDDED_HASHES_MATCH=YES",
  "DECISION_PACK_SHA256_MATCH=YES",
  "APPROVED_GROUP_PLAN_SHA256_MATCH=YES",
  "ROLE_CORRECTION_PLAN_SHA256_MATCH=YES",
  "EXCLUDED_SCOPE_SHA256_MATCH=YES",
  "FORECAST_SHA256_MATCH=YES",
  "FIX3_SOURCE_CONTRACT_PRESENT=YES",
  "SUCCESS_RESULT_STORAGE_PRESENT=YES",
  "SUCCESS_RESULT_SHA256_STORAGE_PRESENT=YES",
  "DECISION_PACK_BATCH_COUNT=0",
  "COMPLETED_RECONCILIATION_BATCH_COUNT=0",
  "ROLLBACK_MANIFEST_COUNT=0",
  "GENEALOGY_DATA_MUTATED=NO",
  "RPC_CALLED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "RECONCILIATION_EXECUTOR_CALLED=NO",
  "PRODUCTION_DRY_RUN_EXECUTED=NO",
  "FAMILY_VOIDED=NO",
  "MEMBERSHIP_MOVED=NO",
  "RELATIONSHIP_ROLE_CHANGED=NO",
  "RUNTIME_CHANGED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "FUNCTION_CONTRACT_STATUS=PASS",
  "NEXT_ACTION=A17Q_DRY_RUN_PREPARE_PRODUCTION_RECONCILIATION",
]) {
  requireIncludes(evidenceDoc, token, `evidence ${token}`);
}

for (const token of [
  "A17Q_TX1R_STATUS=PASS_MANUAL_APPLY_VERIFICATION_EVIDENCE_RECORDED",
  "A17Q_TX1_MANUAL_APPLY_STATUS=PASS_MIGRATION_APPLIED_AND_SELECT_ONLY_VERIFIED_NO_RECONCILIATION",
  "MIGRATION_APPLIED=YES_OWNER_MANUAL_PRODUCTION",
  "DATABASE_SCHEMA_CHANGED=YES",
  "COMPLETED_RECONCILIATION_BATCH_COUNT=0",
  "ROLLBACK_MANIFEST_COUNT=0",
  "GENEALOGY_DATA_MUTATED=NO",
  "RPC_CALLED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "NEXT_ACTION=A17Q_DRY_RUN_PREPARE_PRODUCTION_RECONCILIATION",
]) {
  requireIncludes(planDoc, `A17Q_TX1R ${token}`.replace("A17Q_TX1R ", ""), `plan ${token}`);
}

for (const token of [
  "a17q_tx1_function_exists",
  "a17q_tx1_return_type_jsonb",
  "a17q_tx1_security_invoker",
  "a17q_tx1_fixed_search_path",
  "a17q_tx1_no_public_execute",
  "a17q_tx1_no_anon_execute",
  "a17q_tx1_authenticated_execute_grant",
  "a17q_tx1_decision_pack_hash_embedded",
  "a17q_tx1_success_result_column_present",
  "a17q_tx1_success_result_sha256_column_present",
  "a17q_tx1_completed_batch_count",
  "a17q_tx1_completed_batch_stored_success_integrity_count",
]) {
  requireIncludes(verifier, token, `verifier ${token}`);
}

rejectPattern(
  verifierCode,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "verifier must remain SELECT-only",
);
rejectPattern(verifierCode, /\bfor\s+update\b/i, "verifier must not lock rows");
rejectPattern(
  verifierCode,
  /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i,
  "verifier must not call reconciliation executor",
);

for (const token of [
  "public.execute_admin_a17q_legacy_family_reconciliation",
  "SECURITY INVOKER",
  "set search_path = public, auth, pg_temp",
  "success_result jsonb",
  "success_result_sha256 text",
]) {
  requireIncludes(migration, token, `migration ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17Q_TX1R_LEGACY_FAMILY_RECONCILIATION_EXECUTOR_MANUAL_APPLY_VERIFICATION.md", "index TX1R"],
  [index, "check:a17q-tx1r-legacy-family-reconciliation-executor-manual-apply-verification", "index script"],
  [workLog, "A17Q_TX1R_STATUS=PASS_MANUAL_APPLY_VERIFICATION_EVIDENCE_RECORDED", "work log TX1R"],
  [
    decisionLog,
    "A-17Q-TX1R records legacy family reconciliation executor manual apply verification",
    "decision TX1R",
  ],
  [handoff, "A17Q_TX1R_STATUS=PASS_MANUAL_APPLY_VERIFICATION_EVIDENCE_RECORDED", "handoff TX1R"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson.scripts?.["check:a17q-tx1r-legacy-family-reconciliation-executor-manual-apply-verification"] !==
  "node scripts/check-a17q-tx1r-legacy-family-reconciliation-executor-manual-apply-verification.cjs"
) {
  failures.push("missing package script check:a17q-tx1r-legacy-family-reconciliation-executor-manual-apply-verification");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  evidenceDocPath,
  planDocPath,
  "docs/PLAN_A17Q_DR1_FIX1_AUTHENTICATED_DRY_RUN_CALLER.md",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
  "components/layout/admin-shell.tsx",
  "app/(admin)/admin/reconciliation/a17q/dry-run/page.tsx",
  "app/api/admin/a17q/reconciliation-dry-run/route.ts",
  "components/reconciliation/a17q-authenticated-dry-run-client.tsx",
  "lib/reconciliation/a17q-authenticated-dry-run.ts",
  "scripts/check-a17q-dr1-fix1-authenticated-dry-run-caller.cjs",
  "scripts/check-a17q-tx1r-legacy-family-reconciliation-executor-manual-apply-verification.cjs",
  "scripts/check-a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate.cjs",
  "scripts/check-a17q-tx1-fix1-hardened-reconciliation-executor.cjs",
  "scripts/check-a17q-tx1-fix3-owner-review.cjs",
  "scripts/check-a17p-r-immutable-owner-decision-pack.cjs",
  "scripts/check-a17p-manual-owner-approval-evidence.cjs",
  "scripts/check-a17p-fix3-parent-role-gender-review-evidence.cjs",
  "scripts/check-a17p-fix2-owner-facing-legacy-family-review-query.cjs",
  "scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "db/manual/20260713_a17q_dr1_production_reconciliation_dry_run.sql",
  "db/checks/20260713_check_a17q_dr1_post_production_reconciliation_dry_run.sql",
  "docs/PLAN_A17Q_DR1_PRODUCTION_RECONCILIATION_DRY_RUN_BUNDLE.md",
  "scripts/check-a17q-dr1-production-reconciliation-dry-run-bundle.cjs",
  "docs/PLAN_A17Q_DR2_FIX1_POST_DRY_RUN_VERIFIER_UUID_ARRAY.md",
  "scripts/check-a17q-dr2-fix1-post-dry-run-verifier-uuid-array.cjs",
  "docs/PLAN_A17Q_EXEC1_AUTHENTICATED_SINGLE_EXECUTION_CALLER.md",
  "docs/PLAN_A17Q_EXEC1_FIX1_EXECUTION_GUARD_FINAL_VERIFIER.md",
  "app/(admin)/admin/reconciliation/a17q/execute/page.tsx",
  "app/api/admin/a17q/reconciliation-execute/route.ts",
  "components/reconciliation/a17q-authenticated-execution-client.tsx",
  "lib/reconciliation/a17q-authenticated-execution.ts",
  "scripts/check-a17q-exec1-authenticated-single-execution-caller.cjs",
  "scripts/check-a17q-exec1-fix1-execution-guard-final-verifier.cjs",
  "db/checks/20260714_check_a17q_exec2_final_post_reconciliation_verification.sql",
  "docs/PLAN_A17Q_TX2_SCHEMA_QUALIFIED_PGCRYPTO_DIGEST_PATCH.md",
  "db/checks/20260714_check_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql",
  "db/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql",
  "supabase/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql",
  "scripts/check-a17q-tx2-schema-qualified-pgcrypto-digest-patch.cjs",
  "scripts/check-a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate.cjs",
  "scripts/check-a17q-tx1-fix1-owner-review.cjs",
  "scripts/check-a17q-tx1-fix2-exact-post-state-reconciliation-contract.cjs",
  "scripts/check-a17q-tx1-fix2-owner-review.cjs",
  "scripts/check-a17q-tx1-fix3-final-integrity-contract.cjs",
  "scripts/check-a17q-tx1-fix3-owner-review.cjs",
]);
for (const file of changedFiles) {
  if (/^(app|components|lib|server|services)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`runtime file changed during A-17Q-TX1R: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`migration changed during A-17Q-TX1R: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected A-17Q-TX1R dirty file: ${file}`);
}

console.log("A-17Q-TX1R manual apply verification evidence checker");
console.log("A17Q_TX1R_STATUS=PASS_MANUAL_APPLY_VERIFICATION_EVIDENCE_RECORDED");
console.log(`MIGRATION_SHA256=${sha256Hex(dbMigrationPath)}`);
console.log("SELECT_ONLY_VERIFIER_STATUS=PASS_ALL_CONTRACT_FIELDS_TRUE");
console.log("FUNCTION_CONTRACT_STATUS=PASS");
console.log("COMPLETED_RECONCILIATION_BATCH_COUNT=0");
console.log("ROLLBACK_MANIFEST_COUNT=0");
console.log("GENEALOGY_DATA_MUTATED=NO");
console.log("RPC_CALLED=NO");
console.log("RECONCILIATION_EXECUTED=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

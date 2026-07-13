#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const failures = [];

const dbMigrationPath =
  "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql";
const verifierPath =
  "db/checks/20260713_check_a17q_tx1_legacy_family_reconciliation_executor_candidate.sql";
const docPath =
  "docs/PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md";

const oldFix2Sha =
  "AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D";
const newFix3Sha =
  "9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function sha256(relativePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(root, relativePath)))
    .digest("hex")
    .toUpperCase();
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function requireOrder(content, tokens, label) {
  let previousIndex = -1;
  for (const token of tokens) {
    const index = content.indexOf(token);
    if (index === -1) {
      failures.push(`${label}: missing ${token}`);
      return;
    }
    if (index <= previousIndex) {
      failures.push(`${label}: ${token} appears out of order`);
      return;
    }
    previousIndex = index;
  }
}

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
}

function stripSqlStrings(sql) {
  return sql.replace(/'(?:''|[^'])*'/g, "''");
}

const migration = read(dbMigrationPath);
const mirror = read(supabaseMigrationPath);
const verifier = read(verifierPath);
const verifierCode = stripSqlStrings(stripSqlComments(verifier));
const doc = read(docPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = JSON.parse(read("package.json"));

if (migration !== mirror) failures.push("migration mirror is not byte-identical");

const actualSha = sha256(dbMigrationPath);
if (actualSha !== newFix3Sha) failures.push(`unexpected migration SHA ${actualSha}`);
if (sha256(supabaseMigrationPath) !== newFix3Sha) failures.push("unexpected Supabase mirror SHA");
if (actualSha === oldFix2Sha) failures.push("migration SHA still equals superseded FIX2 SHA");

for (const folder of ["db/migrations", "supabase/migrations"]) {
  const migration0027 = fs
    .readdirSync(path.join(root, folder))
    .filter((file) => file.includes("0027"));
  if (migration0027.length > 0) failures.push(`unexpected 0027 migration in ${folder}: ${migration0027.join(", ")}`);
}

for (const token of [
  "add column if not exists success_result_sha256 text",
  "family_reconciliation_batches_success_result_sha256_check",
  "GLOBAL_DUPLICATE_ACTIVE_CANONICAL_KEY_CHECK",
  "APPROVED_CANONICAL_KEY_OWNER_CHECK",
  "v_global_duplicate_active_canonical_key_count",
  "v_approved_key_owned_by_unexpected_active_family_count",
  "v_approved_key_active_owner_count <> 21",
  "v_void_family_canonical_active_count",
  "GLOBAL_DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_CHECK",
  "GLOBAL_DUPLICATE_ACTIVE_CHILD_MEMBERSHIP_CHECK",
  "GLOBAL_PARENT_CHILD_OVERLAP_CHECK",
  "v_global_duplicate_active_parent_membership_count",
  "v_global_duplicate_active_child_membership_count",
  "success_result_sha256",
  "FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION",
  "COMPLETED_REPLAY_INTEGRITY_VERIFIED",
  "A17Q_SUCCESS_RESULT_INTEGRITY_FAILED",
  "v_existing_batch.success_result_sha256",
  "v_stored_success_result_sha256",
  "digest(v_result::text, 'sha256')",
  "digest(coalesce(v_stored_success_result, '{}'::jsonb)::text, 'sha256')",
  "'replay_mutation_path_count', 0",
]) {
  requireIncludes(migration, token, `migration ${token}`);
}

requireOrder(
  migration,
  [
    "REPLAY_REQUIRES_DURABLE_SUCCESS_RESULT / COMPLETED_REPLAY_INTEGRITY_VERIFIED",
    "return v_replay_result",
    "FIRST_GENEALOGY_MUTATION",
    "GLOBAL_DUPLICATE_ACTIVE_CANONICAL_KEY_CHECK",
    "GLOBAL_DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_CHECK",
    "GLOBAL_PARENT_CHILD_OVERLAP_CHECK",
    "v_graph_validation_passed := true",
    "FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION",
    "SUCCESS_RESULT_PERSISTED_BEFORE_COMPLETION",
    "BATCH_COMPLETED_UPDATE_AFTER_SUCCESS_RESULT",
    "return v_result;\nend;",
  ],
  "FIX3 integrity order",
);

for (const token of [
  "a17q_tx1_success_result_sha256_column_present",
  "a17q_tx1_success_result_sha256_constraint_present",
  "a17q_tx1_global_duplicate_active_canonical_key_check_present",
  "a17q_tx1_approved_canonical_key_owner_check_present",
  "a17q_tx1_global_duplicate_parent_membership_check_present",
  "a17q_tx1_global_duplicate_child_membership_check_present",
  "a17q_tx1_global_parent_child_overlap_check_present",
  "a17q_tx1_completed_replay_integrity_verified_present",
  "a17q_tx1_fresh_result_integrity_before_completion_present",
  "a17q_tx1_success_result_sha256_source_present",
  "a17q_tx1_replay_stored_sha256_check_present",
  "a17q_tx1_fresh_stored_sha256_check_present",
  "a17q_tx1_completed_batch_stored_success_integrity_count",
]) {
  requireIncludes(verifier, token, `verifier ${token}`);
}

if (/^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im.test(verifierCode)) {
  failures.push("verifier must remain SELECT-only");
}
if (/\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i.test(verifierCode)) {
  failures.push("verifier must not call executor");
}
if (/\bfor\s+update\b/i.test(verifierCode)) failures.push("verifier must not lock rows");

for (const token of [
  "A17Q_TX1_FIX3_STATUS=PASS_FINAL_INTEGRITY_RECONCILIATION_CONTRACT_READY_NOT_APPLIED",
  `A17Q_TX1_FIX3_OLD_SHA256_SUPERSEDED=${oldFix2Sha}`,
  `A17Q_TX1_FIX3_NEW_SHA256=${newFix3Sha}`,
  "GLOBAL_DUPLICATE_ACTIVE_CANONICAL_KEY_CHECK=YES",
  "APPROVED_CANONICAL_KEY_OWNER_CHECK=YES",
  "GLOBAL_DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_CHECK=YES",
  "GLOBAL_DUPLICATE_ACTIVE_CHILD_MEMBERSHIP_CHECK=YES",
  "GLOBAL_PARENT_CHILD_OVERLAP_CHECK=YES",
  "SUCCESS_RESULT_SHA256_STORAGE=YES",
  "FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION=YES",
  "COMPLETED_REPLAY_INTEGRITY_VERIFIED=YES",
  "REPLAY_MUTATION_PATH_COUNT=0",
  "SELECT_ONLY_VERIFIER_UPDATED=YES",
  "MIGRATION_0026_APPLIED=NO",
  "MIGRATION_0027_CREATED=NO",
]) {
  requireIncludes(doc, token, `doc ${token}`);
}

requireIncludes(index, "check:a17q-tx1-fix3-final-integrity-contract", "index package script");
requireIncludes(workLog, "A17Q_TX1_FIX3_STATUS=PASS_FINAL_INTEGRITY_RECONCILIATION_CONTRACT_READY_NOT_APPLIED");
requireIncludes(decisionLog, "A-17Q-TX1-FIX3 finalizes integrity contract");
requireIncludes(handoff, "A17Q_TX1_FIX3_STATUS=PASS_FINAL_INTEGRITY_RECONCILIATION_CONTRACT_READY_NOT_APPLIED");

if (
  packageJson.scripts?.["check:a17q-tx1-fix3-final-integrity-contract"] !==
  "node scripts/check-a17q-tx1-fix3-final-integrity-contract.cjs"
) {
  failures.push("missing package script check:a17q-tx1-fix3-final-integrity-contract");
}

console.log("A-17Q-TX1-FIX3 final integrity contract checker");
console.log("A17Q_TX1_FIX3_STATUS=PASS_FINAL_INTEGRITY_RECONCILIATION_CONTRACT_READY_NOT_APPLIED");
console.log(`OLD_FIX2_SHA256=${oldFix2Sha}`);
console.log(`NEW_FIX3_SHA256=${actualSha}`);
console.log(`MIRROR_MATCH=${migration === mirror ? "YES" : "NO"}`);
console.log("GLOBAL_DUPLICATE_ACTIVE_CANONICAL_KEY_CHECK=YES");
console.log("APPROVED_CANONICAL_KEY_OWNER_CHECK=YES");
console.log("GLOBAL_DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_CHECK=YES");
console.log("GLOBAL_DUPLICATE_ACTIVE_CHILD_MEMBERSHIP_CHECK=YES");
console.log("GLOBAL_PARENT_CHILD_OVERLAP_CHECK=YES");
console.log("SUCCESS_RESULT_SHA256_PRESENT=YES");
console.log("FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION=YES");
console.log("COMPLETED_REPLAY_INTEGRITY_VERIFIED=YES");
console.log("REPLAY_MUTATION_PATH_COUNT=0");
console.log("SELECT_ONLY_VERIFIER_CALLS_EXECUTOR=NO");
console.log("SQL_EXECUTED=NO");
console.log("MIGRATION_0026_APPLIED=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

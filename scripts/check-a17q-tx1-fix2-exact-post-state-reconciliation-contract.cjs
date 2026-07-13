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
const oldSha = "B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934";
const fix2Sha = "AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D";
const fix3Sha = "9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66";

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
if (actualSha !== fix2Sha && actualSha !== fix3Sha) failures.push(`unexpected migration SHA ${actualSha}`);
if (actualSha === oldSha) failures.push("migration SHA still equals superseded FIX1 SHA");

for (const folder of ["db/migrations", "supabase/migrations"]) {
  const migration0027 = fs
    .readdirSync(path.join(root, folder))
    .filter((file) => file.includes("0027"));
  if (migration0027.length > 0) failures.push(`unexpected 0027 migration in ${folder}: ${migration0027.join(", ")}`);
}

for (const token of [
  "alter table public.family_reconciliation_batches",
  "add column if not exists success_result jsonb",
  "family_reconciliation_batches_success_result_shape_check",
  "REPLAY_REQUIRES_DURABLE_SUCCESS_RESULT",
  "EXACT_EXPECTED_POST_STATE_SNAPSHOT",
  "a17q_group_parent_sets",
  "a17q_expected_child_final_mapping",
  "a17q_expected_parent_final_state",
  "a17q_void_to_survivor_mapping",
  "md5(coalesce(array_to_string",
  "NO_PARENT_SET",
  "canonical-family:v1:",
  "{\"parentIds\":[",
  "relationshipPeriod",
  "unionIdentity",
  "A17Q_SAFE_GROUP_REF_MISMATCH",
  "A17Q_UNEXPECTED_FAMILY_IN_APPROVED_PARENT_SET",
  "A17Q_PRE_MUTATION_AUDIT_INSERT_FAILED",
  "EXACT_POST_STATE_VALIDATION",
  "A17Q_EXACT_CHILD_POST_STATE_VALIDATION_FAILED",
  "A17Q_EXACT_PARENT_ROLE_POST_STATE_VALIDATION_FAILED",
  "A17Q_EXACT_FAMILY_CANONICAL_POST_STATE_VALIDATION_FAILED",
  "A17Q_EXACT_GRAPH_POST_STATE_VALIDATION_FAILED",
  "missing_expected_child_mapping_count",
  "unexpected_child_mapping_count",
  "missing_expected_parent_state_count",
  "unexpected_parent_state_count",
  "survivor_role_correction_mismatch_count",
  "superseded_role_correction_mismatch_count",
  "survivor_canonical_key_mismatch_count",
  "duplicate_active_parent_set_family_count",
  "self_parent_relation_count",
  "same_family_parent_child_overlap_count",
  "ancestry_cycle_count",
  "SUCCESS_RESULT_PERSISTED_BEFORE_COMPLETION",
  "BATCH_COMPLETED_UPDATE_AFTER_SUCCESS_RESULT",
  "A17Q_SUCCESS_RESULT_PERSIST_FAILED",
  "A17Q_BATCH_COMPLETION_UPDATE_FAILED",
  "success_result_persisted_before_completed",
]) {
  requireIncludes(migration, token, `migration ${token}`);
}

requireOrder(
  migration,
  [
    "REPLAY_REQUIRES_DURABLE_SUCCESS_RESULT",
    "EXACT_EXPECTED_POST_STATE_SNAPSHOT",
    "DRY_RUN_NOT_CONSUMED",
    "RUNNING_BATCH_INSERT",
    "PRE_MUTATION_AUDIT_BEFORE_GENEALOGY_MUTATION",
    "FIRST_GENEALOGY_MUTATION",
    "REAL_POST_STATE_VALIDATION",
    "EXACT_POST_STATE_VALIDATION",
    "SUCCESS_RESULT_PERSISTED_BEFORE_COMPLETION",
    "BATCH_COMPLETED_UPDATE_AFTER_SUCCESS_RESULT",
    "return v_result;\nend;",
  ],
  "FIX2 replay and exact-post-state order",
);

for (const token of [
  "update public.people",
  "delete from",
  "truncate",
  "a16p_tx_execute_giapha4_official_import",
  "a17o_tx_execute_grouped_giapha4_official_import",
]) {
  if (new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(migration)) {
    failures.push(`forbidden migration token ${token}`);
  }
}

for (const token of [
  "a17q_tx1_success_result_column_present",
  "a17q_tx1_success_result_shape_constraint_present",
  "a17q_tx1_exact_expected_post_state_snapshot_present",
  "a17q_tx1_group_parent_set_snapshot_present",
  "a17q_tx1_child_expected_mapping_present",
  "a17q_tx1_parent_expected_state_present",
  "a17q_tx1_safe_group_ref_mismatch_guard_present",
  "a17q_tx1_unlisted_parent_set_guard_present",
  "a17q_tx1_exact_post_state_validation_present",
  "a17q_tx1_exact_child_failure_guard_present",
  "a17q_tx1_exact_parent_role_failure_guard_present",
  "a17q_tx1_exact_family_canonical_failure_guard_present",
  "a17q_tx1_exact_graph_failure_guard_present",
  "a17q_tx1_success_result_before_completed_marker_present",
  "a17q_tx1_completed_after_success_result_marker_present",
  "a17q_tx1_replay_requires_durable_success_result_present",
  "a17q_tx1_success_result_persist_failure_guard_present",
  "a17q_tx1_batch_completion_failure_guard_present",
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
  "A17Q_TX1_FIX2_STATUS=PASS_EXACT_POST_STATE_RECONCILIATION_CONTRACT_READY_NOT_APPLIED",
  `A17Q_TX1_FIX2_OLD_SHA256_SUPERSEDED=${oldSha}`,
  `A17Q_TX1_FIX2_NEW_SHA256=${fix2Sha}`,
  "EXACT_CHILD_POST_STATE_CONTRACT=YES",
  "EXACT_PARENT_ROLE_POST_STATE_CONTRACT=YES",
  "EXACT_FAMILY_CANONICAL_POST_STATE_CONTRACT=YES",
  "EXACT_GRAPH_POST_STATE_CONTRACT=YES",
  "REPLAY_SAFE_SUCCESS_RESULT_CONTRACT=YES",
  "MIGRATION_0026_APPLIED=NO",
  "MIGRATION_0027_CREATED=NO",
]) {
  requireIncludes(doc, token, `doc ${token}`);
}

if (actualSha === fix3Sha) {
  requireIncludes(doc, `A17Q_TX1_FIX3_OLD_SHA256_SUPERSEDED=${fix2Sha}`, "doc FIX3 supersedes FIX2 SHA");
  requireIncludes(doc, `A17Q_TX1_FIX3_NEW_SHA256=${fix3Sha}`, "doc FIX3 current SHA");
  requireIncludes(doc, "A17Q_TX1_FIX3_STATUS=PASS_FINAL_INTEGRITY_RECONCILIATION_CONTRACT_READY_NOT_APPLIED", "doc FIX3 status");
}

requireIncludes(index, "check:a17q-tx1-fix2-exact-post-state-reconciliation-contract");
requireIncludes(workLog, "A17Q_TX1_FIX2_STATUS=PASS_EXACT_POST_STATE_RECONCILIATION_CONTRACT_READY_NOT_APPLIED");
requireIncludes(decisionLog, "A-17Q-TX1-FIX2");
requireIncludes(handoff, "A17Q_TX1_FIX2_STATUS=PASS_EXACT_POST_STATE_RECONCILIATION_CONTRACT_READY_NOT_APPLIED");

if (
  packageJson.scripts?.["check:a17q-tx1-fix2-exact-post-state-reconciliation-contract"] !==
  "node scripts/check-a17q-tx1-fix2-exact-post-state-reconciliation-contract.cjs"
) {
  failures.push("missing package script check:a17q-tx1-fix2-exact-post-state-reconciliation-contract");
}

console.log("A-17Q-TX1-FIX2 exact post-state reconciliation contract checker");
console.log(`OLD_SHA256_SUPERSEDED=${oldSha}`);
console.log(`NEW_SHA256=${actualSha}`);
console.log(`MIRROR_MATCH=${migration === mirror ? "YES" : "NO"}`);
console.log("SQL_EXECUTED=NO");
console.log("MIGRATION_0026_APPLIED=NO");
console.log("MIGRATION_0027_CREATED=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

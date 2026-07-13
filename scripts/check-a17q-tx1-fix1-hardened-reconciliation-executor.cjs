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
const oldSha =
  "696441637B308257ED8B45991EAD2542B4A5A14A648BBE0CCC2D5E996DD18D3B";

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

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
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

const newSha = sha256(dbMigrationPath);
if (newSha === oldSha) failures.push("migration SHA was not changed by FIX1");

for (const token of [
  "A17Q_TX1_FIX1_STATUS=PASS_HARDENED_TRANSACTION_EXECUTOR_CANDIDATE_NOT_APPLIED",
  `A17Q_TX1_OLD_SHA256_SUPERSEDED=${oldSha}`,
  "IDEMPOTENCY_REPLAY_CONTRACT_IMPLEMENTED=YES",
  "PRECONDITION_REVIEW_COMPLETE=YES",
  "MUTATION_ORDER_CONTRACT_MATCHES_REVIEW=YES",
  "AUDIT_PRE_MUTATION_PRESENT=YES",
  "POST_STATE_VERIFIED_BEFORE_COMPLETED=YES",
  "MIGRATION_0026_APPLIED=NO",
  "MIGRATION_0027_CREATED=NO",
]) {
  requireIncludes(doc, token, `doc ${token}`);
}

if (!doc.includes("OWNER_REVIEW_REQUIRED_AGAIN=YES") && !doc.includes("OWNER_REVIEW_REQUIRED_AGAIN=NO")) {
  failures.push("missing doc OWNER_REVIEW_REQUIRED_AGAIN status");
}

for (const token of [
  "a17q_tx1_revisions_insert_legacy_family_reconciliation",
  "IDEMPOTENCY_STATE_CHECK",
  "A17Q_IDEMPOTENCY_KEY_CONFLICT",
  "REPLAY_COMPLETED_SUCCESS",
  "A17Q_RECONCILIATION_BATCH_REQUIRES_RECOVERY",
  "FULL_PRECONDITION_VALIDATION",
  "DRY_RUN_NOT_CONSUMED",
  "RUNNING_BATCH_INSERT",
  "PRE_MUTATION_AUDIT_BEFORE_GENEALOGY_MUTATION",
  "FIRST_GENEALOGY_MUTATION",
  "A17Q_MUTATION_ROW_COUNT_MISMATCH",
  "REAL_POST_STATE_VALIDATION",
  "A17Q_POST_STATE_VALIDATION_FAILED",
  "A17Q_GRAPH_VALIDATION_FAILED",
  "STORE_COMPLETE_SUCCESS_RESULT",
  "NEW_EXECUTION_COMPLETED",
  "'mutation_applied', false",
  "'mutation_applied', true",
  "'replayed_successfully', true",
  "'replayed_successfully', false",
]) {
  requireIncludes(migration, token, `migration ${token}`);
}

requireOrder(
  migration,
  [
    "IDEMPOTENCY_STATE_CHECK",
    "FULL_PRECONDITION_VALIDATION",
    "'DRY_RUN_NOT_CONSUMED'",
    "RUNNING_BATCH_INSERT",
    "PRE_MUTATION_AUDIT_BEFORE_GENEALOGY_MUTATION",
    "FIRST_GENEALOGY_MUTATION",
    "A17Q_MUTATION_ROW_COUNT_MISMATCH",
    "REAL_POST_STATE_VALIDATION",
    "A17Q_POST_STATE_VALIDATION_FAILED",
    "A17Q_GRAPH_VALIDATION_FAILED",
    "STORE_COMPLETE_SUCCESS_RESULT",
    "return v_result;\nend;",
  ],
  "hardened executor order",
);

rejectIncludes(migration, "'idempotency_status', 'RECORDED'", "old RECORDED idempotency status");
rejectIncludes(migration, "'graph_validation_passed', true", "hardcoded graph validation true");
rejectIncludes(migration, "DECISION_PACK_ALREADY_RUNNING_OR_COMPLETED", "old broad existing-batch blocker");
rejectIncludes(migration, "family_reconciliation_batches',\n      v_batch_id", "batch revision entity audit");

if (/\bsecurity\s+definer\b/i.test(migration)) failures.push("SECURITY DEFINER is forbidden");
if (/\bservice_role\b/i.test(migration)) failures.push("service_role dependency is forbidden");
if (/\bupdate\s+public\.people\b/i.test(migration)) failures.push("people rows must not be updated");
if (/\bdelete\s+from\b/i.test(migration)) failures.push("DELETE FROM is forbidden");
if (/\btruncate\b/i.test(migration)) failures.push("TRUNCATE is forbidden");
if (/\ba16p_tx_execute_giapha4_official_import\s*\(/i.test(migration)) failures.push("A16 import RPC call is forbidden");
if (/\ba17o_tx_execute_grouped_giapha4_official_import\s*\(/i.test(migration)) failures.push("A17O import RPC call is forbidden");

for (const token of [
  "a17q_tx1_idempotency_state_check_present",
  "a17q_tx1_idempotency_replay_success_present",
  "a17q_tx1_idempotency_conflict_guard_present",
  "a17q_tx1_recovery_required_guard_present",
  "a17q_tx1_full_precondition_validation_present",
  "a17q_tx1_dry_run_not_consumed_present",
  "a17q_tx1_running_batch_insert_marker_present",
  "a17q_tx1_pre_mutation_audit_marker_present",
  "a17q_tx1_first_genealogy_mutation_marker_present",
  "a17q_tx1_mutation_count_guard_present",
  "a17q_tx1_real_post_state_validation_present",
  "a17q_tx1_post_state_failure_guard_present",
  "a17q_tx1_graph_failure_guard_present",
  "a17q_tx1_store_success_result_marker_present",
  "a17q_tx1_new_execution_completed_status_present",
  "a17q_tx1_revision_insert_policy_exists",
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

requireIncludes(index, "check:a17q-tx1-fix1-hardened-reconciliation-executor");
requireIncludes(workLog, "A17Q_TX1_FIX1_STATUS=PASS_HARDENED_TRANSACTION_EXECUTOR_CANDIDATE_NOT_APPLIED");
requireIncludes(decisionLog, "A-17Q-TX1-FIX1");
requireIncludes(handoff, "A17Q_TX1_FIX1_STATUS=PASS_HARDENED_TRANSACTION_EXECUTOR_CANDIDATE_NOT_APPLIED");

if (
  packageJson.scripts?.["check:a17q-tx1-fix1-hardened-reconciliation-executor"] !==
  "node scripts/check-a17q-tx1-fix1-hardened-reconciliation-executor.cjs"
) {
  failures.push("missing package script check:a17q-tx1-fix1-hardened-reconciliation-executor");
}

console.log("A-17Q-TX1-FIX1 hardened reconciliation executor checker");
console.log(`OLD_SHA256_SUPERSEDED=${oldSha}`);
console.log(`NEW_SHA256=${newSha}`);
console.log(`MIRROR_MATCH=${migration === mirror ? "YES" : "NO"}`);

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

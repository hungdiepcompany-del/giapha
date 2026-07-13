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
const reviewDocPath =
  "docs/PLAN_A17Q_TX1_FIX3_OWNER_REVIEW_FINAL_MIGRATION_CANDIDATE.md";
const planDocPath =
  "docs/PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md";

const expectedCommit = "3066ea9";
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
    const index = content.indexOf(token, previousIndex + 1);
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

function listFiles(dir) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if ([".next", ".git", "node_modules"].includes(entry.name)) return [];
      return listFiles(relativePath);
    }
    if (entry.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) return [relativePath];
    return [];
  });
}

const migration = read(dbMigrationPath);
const mirror = read(supabaseMigrationPath);
const verifier = read(verifierPath);
const verifierCode = stripSqlStrings(stripSqlComments(verifier));
const reviewDoc = read(reviewDocPath);
const planDoc = read(planDocPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = JSON.parse(read("package.json"));

if (migration !== mirror) failures.push("migration mirrors are not byte-identical");
if (sha256(dbMigrationPath) !== expectedSha) failures.push(`unexpected db migration SHA ${sha256(dbMigrationPath)}`);
if (sha256(supabaseMigrationPath) !== expectedSha) failures.push("unexpected Supabase mirror SHA");

for (const folder of ["db/migrations", "supabase/migrations"]) {
  const migration0027 = fs
    .readdirSync(path.join(root, folder))
    .filter((file) => file.includes("0027"));
  if (migration0027.length > 0) failures.push(`unexpected 0027 migration in ${folder}: ${migration0027.join(", ")}`);
}

for (const token of [
  "SECURITY INVOKER",
  "set search_path = public, auth, pg_temp",
  "GLOBAL_DUPLICATE_ACTIVE_CANONICAL_KEY_CHECK",
  "APPROVED_CANONICAL_KEY_OWNER_CHECK",
  "v_global_duplicate_active_canonical_key_count",
  "v_approved_key_owned_by_unexpected_active_family_count",
  "v_approved_key_active_owner_count <> 21",
  "v_void_family_canonical_active_count",
  "A17Q_EXACT_FAMILY_CANONICAL_POST_STATE_VALIDATION_FAILED",
  "GLOBAL_DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_CHECK",
  "GLOBAL_DUPLICATE_ACTIVE_CHILD_MEMBERSHIP_CHECK",
  "GLOBAL_PARENT_CHILD_OVERLAP_CHECK",
  "v_global_duplicate_active_parent_membership_count",
  "v_global_duplicate_active_child_membership_count",
  "v_same_family_parent_child_overlap_count",
  "recursive family_edges",
  "A17Q_EXACT_GRAPH_POST_STATE_VALIDATION_FAILED",
  "A17Q_GRAPH_VALIDATION_FAILED",
  "success_result_sha256",
  "FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION",
  "SUCCESS_RESULT_PERSISTED_BEFORE_COMPLETION",
  "BATCH_COMPLETED_UPDATE_AFTER_SUCCESS_RESULT",
  "COMPLETED_REPLAY_INTEGRITY_VERIFIED",
  "A17Q_SUCCESS_RESULT_INTEGRITY_FAILED",
  "A17Q_SUCCESS_RESULT_PERSIST_FAILED",
  "A17Q_RECONCILIATION_BATCH_REQUIRES_RECOVERY",
  "digest(v_result::text, 'sha256')",
  "digest(coalesce(v_stored_success_result, '{}'::jsonb)::text, 'sha256')",
  "v_existing_batch.success_result_sha256",
  "v_stored_success_result_sha256",
  "'mutation_applied', false",
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
  ],
  "completed replay must return before mutation path",
);

requireOrder(
  migration,
  [
    "GLOBAL_DUPLICATE_ACTIVE_CANONICAL_KEY_CHECK",
    "GLOBAL_DUPLICATE_ACTIVE_PARENT_MEMBERSHIP_CHECK",
    "GLOBAL_PARENT_CHILD_OVERLAP_CHECK",
    "A17Q_EXACT_FAMILY_CANONICAL_POST_STATE_VALIDATION_FAILED",
    "A17Q_EXACT_GRAPH_POST_STATE_VALIDATION_FAILED",
    "A17Q_GRAPH_VALIDATION_FAILED",
    "v_graph_validation_passed := true",
  ],
  "graph success gate order",
);

requireOrder(
  migration,
  [
    "FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION",
    "v_success_result_sha256 := encode(digest(v_result::text, 'sha256'), 'hex')",
    "SUCCESS_RESULT_PERSISTED_BEFORE_COMPLETION",
    "select success_result, success_result_sha256",
    "v_recomputed_success_result_sha256 := encode(digest(coalesce(v_stored_success_result, '{}'::jsonb)::text, 'sha256'), 'hex')",
    "BATCH_COMPLETED_UPDATE_AFTER_SUCCESS_RESULT",
    "return v_result;",
  ],
  "fresh success persistence order",
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

const runtimeCallers = ["app", "components", "lib", "server", "services"]
  .flatMap((dir) => listFiles(dir))
  .filter((file) => read(file).includes("execute_admin_a17q_legacy_family_reconciliation"));
if (runtimeCallers.length > 0) failures.push(`runtime caller present: ${runtimeCallers.join(", ")}`);

for (const token of [
  "A17Q_TX1_FIX3_REVIEW_STATUS=PASS_OWNER_REVIEW_APPROVED_FINAL_MIGRATION_FOR_MANUAL_APPLY_CANDIDATE",
  `REVIEWED_COMMIT=${expectedCommit}`,
  `REVIEWED_MIGRATION_SHA256=${expectedSha}`,
  "CANONICAL_UNIQUENESS_REVIEW=PASS",
  "GLOBAL_MEMBERSHIP_INTEGRITY_REVIEW=PASS",
  "GRAPH_COMPLETION_GATE_REVIEW=PASS",
  "FRESH_SUCCESS_RESULT_INTEGRITY_REVIEW=PASS",
  "COMPLETED_REPLAY_INTEGRITY_REVIEW=PASS",
  "SUCCESS_PERSISTENCE_ORDER_REVIEW=PASS",
  "SELECT_ONLY_VERIFIER_REVIEW=PASS",
  "BLOCKER_COUNT=0",
  "BLOCKERS=NONE",
  "MIGRATION_APPLY_AUTHORIZED=NO",
  "PRODUCTION_DRY_RUN_AUTHORIZED=NO",
  "PRODUCTION_EXECUTION_AUTHORIZED=NO",
  "SQL_EXECUTED=NO",
  "DATABASE_MUTATION=NO",
  "MIGRATION_APPLIED=NO",
  "RPC_CALLED=NO",
  "RUNTIME_CHANGED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "NEXT_ACTION=A17Q_TX1_MANUAL_MIGRATION_APPLY_AND_SELECT_ONLY_VERIFICATION",
]) {
  requireIncludes(reviewDoc, token, `review doc ${token}`);
}

requireIncludes(planDoc, "A17Q_TX1_FIX3_REVIEW_STATUS=PASS_OWNER_REVIEW_APPROVED_FINAL_MIGRATION_FOR_MANUAL_APPLY_CANDIDATE");
if (
  !planDoc.includes("NEXT_ACTION=A17Q_TX1_MANUAL_MIGRATION_APPLY_AND_SELECT_ONLY_VERIFICATION") &&
  !planDoc.includes("NEXT_ACTION=A17Q_DRY_RUN_PREPARE_PRODUCTION_RECONCILIATION")
) {
  failures.push("missing plan doc current A17Q next action");
}
requireIncludes(index, "PLAN_A17Q_TX1_FIX3_OWNER_REVIEW_FINAL_MIGRATION_CANDIDATE.md");
requireIncludes(index, "check:a17q-tx1-fix3-owner-review");
requireIncludes(workLog, "A17Q_TX1_FIX3_REVIEW_STATUS=PASS_OWNER_REVIEW_APPROVED_FINAL_MIGRATION_FOR_MANUAL_APPLY_CANDIDATE");
requireIncludes(decisionLog, "A-17Q-TX1-FIX3-REVIEW approves final migration candidate source");
requireIncludes(handoff, "A17Q_TX1_FIX3_REVIEW_STATUS=PASS_OWNER_REVIEW_APPROVED_FINAL_MIGRATION_FOR_MANUAL_APPLY_CANDIDATE");

if (
  packageJson.scripts?.["check:a17q-tx1-fix3-owner-review"] !==
  "node scripts/check-a17q-tx1-fix3-owner-review.cjs"
) {
  failures.push("missing package script check:a17q-tx1-fix3-owner-review");
}

console.log("A-17Q-TX1-FIX3 owner review checker");
console.log("A17Q_TX1_FIX3_REVIEW_STATUS=PASS_OWNER_REVIEW_APPROVED_FINAL_MIGRATION_FOR_MANUAL_APPLY_CANDIDATE");
console.log(`REVIEWED_COMMIT=${expectedCommit}`);
console.log(`REVIEWED_MIGRATION_SHA256=${sha256(dbMigrationPath)}`);
console.log(`MIRROR_MATCH=${migration === mirror ? "YES" : "NO"}`);
console.log("CANONICAL_UNIQUENESS_REVIEW=PASS");
console.log("GLOBAL_MEMBERSHIP_INTEGRITY_REVIEW=PASS");
console.log("GRAPH_COMPLETION_GATE_REVIEW=PASS");
console.log("FRESH_SUCCESS_RESULT_INTEGRITY_REVIEW=PASS");
console.log("COMPLETED_REPLAY_INTEGRITY_REVIEW=PASS");
console.log("SUCCESS_PERSISTENCE_ORDER_REVIEW=PASS");
console.log("SELECT_ONLY_VERIFIER_REVIEW=PASS");
console.log("BLOCKER_COUNT=0");
console.log("SQL_EXECUTED=NO");
console.log("MIGRATION_0026_APPLIED=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

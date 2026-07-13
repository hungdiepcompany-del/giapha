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
  "docs/PLAN_A17Q_TX1_FIX1_OWNER_REVIEW_HARDENED_RECONCILIATION_EXECUTOR_CANDIDATE.md";
const planDocPath =
  "docs/PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md";

const expectedSha =
  "B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934";
const fix2Sha =
  "AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D";
const fix3Sha =
  "9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66";
const supersededSha =
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

function requireMatch(content, pattern, label) {
  if (!pattern.test(content)) failures.push(`missing ${label}`);
}

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
}

function stripSqlStrings(sql) {
  return sql.replace(/'(?:''|[^'])*'/g, "''");
}

function listMigrationFilesContaining(fragment) {
  const dirs = ["db/migrations", "supabase/migrations"];
  return dirs.flatMap((dir) => {
    const fullDir = path.join(root, dir);
    if (!fs.existsSync(fullDir)) return [];
    return fs
      .readdirSync(fullDir)
      .filter((name) => name.includes(fragment))
      .map((name) => path.join(dir, name));
  });
}

function listFiles(dir) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return [];
  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const relativePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(relativePath);
    return [relativePath];
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
const currentDbSha = sha256(dbMigrationPath);
const currentMirrorSha = sha256(supabaseMigrationPath);
if (currentDbSha !== expectedSha && currentDbSha !== fix2Sha && currentDbSha !== fix3Sha) {
  failures.push("reviewed db migration SHA changed outside accepted FIX2 correction");
}
if (currentMirrorSha !== expectedSha && currentMirrorSha !== fix2Sha && currentMirrorSha !== fix3Sha) {
  failures.push("reviewed Supabase migration SHA changed outside accepted FIX2 correction");
}
if (listMigrationFilesContaining("0027").length > 0) failures.push("migration 0027 must not exist");

for (const token of [
  "A17Q_TX1_FIX1_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED",
  "REVIEWED_COMMIT=842e7b4",
  `REVIEWED_MIGRATION_SHA256=${expectedSha}`,
  `SUPERSEDED_SHA256=${supersededSha}`,
  "MIGRATION_APPLY_AUTHORIZED=NO",
  "PRODUCTION_DRY_RUN_AUTHORIZED=NO",
  "PRODUCTION_EXECUTION_AUTHORIZED=NO",
  "SQL_EXECUTED=NO",
  "PRODUCTION_QUERIED=NO",
  "RPC_CALLED=NO",
  "DATABASE_MUTATION=NO",
  "MIGRATION_APPLIED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "RUNTIME_CHANGED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "NEXT_ACTION=A17Q_TX1_FIX2",
]) {
  requireIncludes(reviewDoc, token, `review doc ${token}`);
}

for (const blocker of [
  "EXACT_PARENT_SET_NOT_PROVEN",
  "CHILD_MAPPING_POST_STATE_NOT_VERIFIED",
  "PARENT_POST_STATE_NOT_VERIFIED",
  "ROLE_POST_STATE_NOT_VERIFIED",
  "FAMILY_POST_STATE_NOT_VERIFIED",
  "CANONICAL_POST_STATE_NOT_VERIFIED",
  "GRAPH_VALIDATION_HARDCODED_OR_INCOMPLETE",
  "SUCCESS_RESULT_NOT_STORED_BEFORE_COMPLETION",
  "SELECT_ONLY_VERIFIER_SOURCE_EVIDENCE_INCOMPLETE",
  "PRE_MUTATION_AUDIT_CONTENT_INCOMPLETE",
]) {
  requireIncludes(reviewDoc, blocker, `review blocker ${blocker}`);
}

for (const positive of [
  "IDEMPOTENCY_REPLAY_REVIEW=PASS",
  "IDEMPOTENCY_CONFLICT_REVIEW=PASS",
  "RECOVERY_STATE_REVIEW=PASS",
  "LOCK_AND_PRECONDITION_ORDER_REVIEW=PASS",
  "DRY_RUN_PURITY_REVIEW=PASS",
  "ROLLBACK_ORDER_REVIEW=PASS",
  "MUTATION_COUNT_ENFORCEMENT_REVIEW=PASS",
  "GRANT_REVIEW=PASS",
]) {
  requireIncludes(reviewDoc, positive, `positive review ${positive}`);
}

for (const token of [
  "A17Q_TX1_FIX1_OWNER_REVIEW_HARDENED_RECONCILIATION_EXECUTOR_CANDIDATE",
  "REPLAY_COMPLETED_SUCCESS",
  "A17Q_IDEMPOTENCY_KEY_CONFLICT",
  "A17Q_RECONCILIATION_BATCH_REQUIRES_RECOVERY",
  "DRY_RUN_NOT_CONSUMED",
  "RUNNING_BATCH_INSERT",
  "PRE_MUTATION_AUDIT_BEFORE_GENEALOGY_MUTATION",
  "FIRST_GENEALOGY_MUTATION",
  "A17Q_MUTATION_ROW_COUNT_MISMATCH",
  "REAL_POST_STATE_VALIDATION",
  "A17Q_GRAPH_VALIDATION_FAILED",
  "STORE_COMPLETE_SUCCESS_RESULT",
]) {
  if (token === "A17Q_TX1_FIX1_OWNER_REVIEW_HARDENED_RECONCILIATION_EXECUTOR_CANDIDATE") {
    requireIncludes(reviewDoc, "A-17Q-TX1-FIX1-REVIEW", "review doc title");
  } else {
    requireIncludes(migration, token, `migration ${token}`);
  }
}

if (currentDbSha === expectedSha) {
  requireMatch(
    migration,
    /update\s+public\.family_reconciliation_batches\s+set\s+status\s*=\s*'completed',\s+actual_counts\s*=\s*v_result/s,
    "same-statement completed status and actual_counts write evidence",
  );
} else {
  requireIncludes(planDoc, `A17Q_TX1_FIX2_OLD_SHA256_SUPERSEDED=${expectedSha}`, "FIX2 supersedes reviewed SHA");
  requireIncludes(planDoc, `A17Q_TX1_FIX2_NEW_SHA256=${fix2Sha}`, "FIX2 current SHA");
  requireIncludes(migration, "SUCCESS_RESULT_PERSISTED_BEFORE_COMPLETION", "FIX2 success result before completed");
  requireIncludes(migration, "BATCH_COMPLETED_UPDATE_AFTER_SUCCESS_RESULT", "FIX2 completed after success result");
  if (currentDbSha === fix3Sha) {
    requireIncludes(planDoc, `A17Q_TX1_FIX3_OLD_SHA256_SUPERSEDED=${fix2Sha}`, "FIX3 supersedes FIX2 SHA");
    requireIncludes(planDoc, `A17Q_TX1_FIX3_NEW_SHA256=${fix3Sha}`, "FIX3 current SHA");
    requireIncludes(migration, "FRESH_RESULT_INTEGRITY_VERIFIED_BEFORE_COMPLETION", "FIX3 fresh result integrity");
    requireIncludes(migration, "COMPLETED_REPLAY_INTEGRITY_VERIFIED", "FIX3 replay integrity");
  }
}
rejectIncludes(migration, "expected_child_membership_ids", "exact child-membership id post-state proof");
rejectIncludes(migration, "expected_parent_membership_ids", "exact parent-membership id post-state proof");
rejectIncludes(migration, "canonical_key_conflict", "canonical-key conflict proof token");
if (currentDbSha === expectedSha) {
  rejectIncludes(migration.toLowerCase(), "recursive", "ancestry-cycle recursive graph validation");
} else {
  requireIncludes(migration.toLowerCase(), "recursive", "FIX2 ancestry-cycle recursive graph validation");
}

if (/^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im.test(verifierCode)) {
  failures.push("verifier must remain SELECT-only");
}
if (/\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i.test(verifierCode)) {
  failures.push("verifier must not call executor");
}
if (/\bfor\s+update\b/i.test(verifierCode)) failures.push("verifier must not lock rows");

for (const token of [
  "a17q_tx1_idempotency_replay_success_present",
  "a17q_tx1_idempotency_conflict_guard_present",
  "a17q_tx1_recovery_required_guard_present",
  "a17q_tx1_store_success_result_marker_present",
]) {
  requireIncludes(verifier, token, `verifier ${token}`);
}

const runtimeFiles = ["app", "components", "lib", "server", "services"]
  .flatMap((dir) => listFiles(dir))
  .filter((file) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file));
const runtimeCallers = runtimeFiles.filter((file) =>
  read(file).includes("execute_admin_a17q_legacy_family_reconciliation"),
);
if (runtimeCallers.length > 0) {
  failures.push(`runtime caller present: ${runtimeCallers.join(", ")}`);
}

if (
  !planDoc.includes("NEXT_ACTION=A17Q_TX1_FIX2_OWNER_REVIEW_BEFORE_APPLY") &&
  !planDoc.includes("NEXT_ACTION=A17Q_TX1_MANUAL_MIGRATION_APPLY_AND_SELECT_ONLY_VERIFICATION")
) {
  failures.push("missing plan doc current A17Q next action");
}
requireIncludes(index, reviewDocPath.replace(/^docs\//, ""), "index review doc");
requireIncludes(workLog, "A17Q_TX1_FIX1_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED");
requireIncludes(decisionLog, "A-17Q-TX1-FIX1-REVIEW blocks migration 0026 apply");
requireIncludes(handoff, "A17Q_TX1_FIX1_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED");

if (
  packageJson.scripts?.["check:a17q-tx1-fix1-owner-review"] !==
  "node scripts/check-a17q-tx1-fix1-owner-review.cjs"
) {
  failures.push("missing package script check:a17q-tx1-fix1-owner-review");
}

console.log("A-17Q-TX1-FIX1 owner review checker");
console.log("A17Q_TX1_FIX1_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED");
console.log(`REVIEWED_MIGRATION_SHA256=${currentDbSha}`);
console.log(`MIRROR_MATCH=${migration === mirror ? "YES" : "NO"}`);
console.log("MIGRATION_0026_APPLIED=NO");
console.log("MIGRATION_0027_CREATED=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

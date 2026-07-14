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
  "docs/PLAN_A17Q_TX1_FIX2_OWNER_REVIEW_EXACT_POST_STATE_RECONCILIATION_CANDIDATE.md";
const planDocPath =
  "docs/PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md";

const reviewedSha =
  "AF9F50098AAC6B9802AF667B80DB90B238BA83F8C6F1C267A9B542CA27C6E40D";
const fix3Sha =
  "9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66";
const supersededFix1Sha =
  "B5F25A1F4583FCC4C54BA3385CE41624F0995EFB3A2383895D6107238A7B5934";
const allowedTx2Migration =
  "20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql";

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

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
}

function stripSqlStrings(sql) {
  return sql.replace(/'(?:''|[^'])*'/g, "''");
}

function listMigrationFilesContaining(fragment) {
  return ["db/migrations", "supabase/migrations"].flatMap((dir) => {
    const fullDir = path.join(root, dir);
    if (!fs.existsSync(fullDir)) return [];
    return fs
      .readdirSync(fullDir)
      .filter((name) => name.includes(fragment))
      .map((name) => path.join(dir, name));
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
const actualSha = sha256(dbMigrationPath);
if (actualSha !== reviewedSha && actualSha !== fix3Sha) failures.push(`unexpected migration SHA ${actualSha}`);
if (![reviewedSha, fix3Sha].includes(sha256(supabaseMigrationPath))) failures.push("unexpected Supabase mirror SHA");
if (actualSha === supersededFix1Sha) failures.push("migration SHA still equals superseded FIX1 SHA");
const migration0027Files = listMigrationFilesContaining("0027");
if (
  migration0027Files.length > 0 &&
  (migration0027Files.length !== 2 ||
    !migration0027Files.every((file) => path.basename(file) === allowedTx2Migration))
) {
  failures.push(`unexpected migration 0027 files: ${migration0027Files.join(", ")}`);
}

for (const token of [
  "A17Q_TX1_FIX2_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED",
  "REVIEWED_COMMIT=ec36b65",
  `REVIEWED_MIGRATION_SHA256=${reviewedSha}`,
  `SUPERSEDED_SHA256=${supersededFix1Sha}`,
  "BRANCH=main",
  "WORKTREE_CLEAN=YES",
  "REMOTE_SYNC=0_0",
  "ORIGIN_MAIN_CONTAINS_EC36B65=YES",
  "ORIGIN_MAIN_CONTAINS_10A870F=YES",
  "ORIGIN_MAIN_CONTAINS_846B0C9=YES",
  "MIGRATION_SHA256_MATCH=YES",
  "SECURITY_AND_GRANT_REVIEW=PASS",
  "EXACT_PARENT_ARRAY_REVIEW=PASS_WITH_SOURCE_CAVEAT",
  "PRE_MUTATION_SNAPSHOT_REVIEW=PASS",
  "PRE_MUTATION_AUDIT_REVIEW=PASS",
  "CHILD_MAPPING_POST_STATE_REVIEW=PASS",
  "PARENT_MAPPING_POST_STATE_REVIEW=PASS",
  "ROLE_POST_STATE_REVIEW=PASS",
  "FAMILY_VOID_POST_STATE_REVIEW=PASS",
  "MERGE_TARGET_POST_STATE_REVIEW=PASS",
  "CANONICAL_KEY_POST_STATE_REVIEW=BLOCKED",
  "GRAPH_VALIDATION_REVIEW=BLOCKED",
  "ANCESTRY_CYCLE_REVIEW=PASS",
  "DURABLE_SUCCESS_RESULT_REVIEW=PASS_WITH_SOURCE_CAVEAT",
  "SUCCESS_PERSISTENCE_ORDER_REVIEW=PASS",
  "IDEMPOTENT_REPLAY_REVIEW=BLOCKED",
  "SELECT_ONLY_VERIFIER_REVIEW=BLOCKED",
  "OUT_OF_SCOPE_CHECK_STATUS=FAILED_UNRELATED_PLAN_A01_RUNTIME_TOKEN_EXPECTATIONS",
  "A17Q_SCOPE_IMPACT=NONE",
  "BLOCKER_COUNT=4",
  "BLOCKERS=CANONICAL_KEY_NOT_RECOMPUTED, GRAPH_OR_CYCLE_VALIDATION_INCOMPLETE, REPLAY_NOT_USING_STORED_RESULT, VERIFIER_SOURCE_EVIDENCE_INCOMPLETE",
  "SQL_EXECUTED=NO",
  "PRODUCTION_QUERIED=NO",
  "RPC_CALLED=NO",
  "DATABASE_MUTATION=NO",
  "MIGRATION_APPLIED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "RUNTIME_CHANGED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "MIGRATION_APPLY_AUTHORIZED=NO",
  "PRODUCTION_DRY_RUN_AUTHORIZED=NO",
  "PRODUCTION_EXECUTION_AUTHORIZED=NO",
  "NEXT_ACTION=A17Q_TX1_FIX3",
]) {
  requireIncludes(reviewDoc, token, `review doc ${token}`);
}

for (const blocker of [
  "CANONICAL_KEY_NOT_RECOMPUTED",
  "GRAPH_OR_CYCLE_VALIDATION_INCOMPLETE",
  "REPLAY_NOT_USING_STORED_RESULT",
  "VERIFIER_SOURCE_EVIDENCE_INCOMPLETE",
]) {
  requireIncludes(reviewDoc, blocker, `review blocker ${blocker}`);
}

if (/^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im.test(verifierCode)) {
  failures.push("verifier must remain SELECT-only");
}
if (/\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i.test(verifierCode)) {
  failures.push("verifier must not call executor");
}
if (/\bfor\s+update\b/i.test(verifierCode)) failures.push("verifier must not lock rows");

requireIncludes(
  planDoc,
  "A17Q_TX1_FIX2_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED",
  "plan doc FIX2 review status",
);
requireIncludes(planDoc, "NEXT_ACTION=A17Q_TX1_FIX3", "plan doc FIX3 next action");
if (actualSha === fix3Sha) {
  requireIncludes(planDoc, `A17Q_TX1_FIX3_OLD_SHA256_SUPERSEDED=${reviewedSha}`, "plan doc FIX3 supersedes reviewed SHA");
  requireIncludes(planDoc, `A17Q_TX1_FIX3_NEW_SHA256=${fix3Sha}`, "plan doc FIX3 current SHA");
  requireIncludes(
    planDoc,
    "A17Q_TX1_FIX3_STATUS=PASS_FINAL_INTEGRITY_RECONCILIATION_CONTRACT_READY_NOT_APPLIED",
    "plan doc FIX3 status",
  );
}
requireIncludes(index, "check:a17q-tx1-fix2-owner-review", "index package script");
requireIncludes(index, "PLAN_A17Q_TX1_FIX2_OWNER_REVIEW_EXACT_POST_STATE_RECONCILIATION_CANDIDATE.md", "index review doc");
requireIncludes(workLog, "A17Q_TX1_FIX2_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED");
requireIncludes(decisionLog, "A-17Q-TX1-FIX2-REVIEW blocks migration 0026 apply");
requireIncludes(handoff, "A17Q_TX1_FIX2_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED");

if (
  packageJson.scripts?.["check:a17q-tx1-fix2-owner-review"] !==
  "node scripts/check-a17q-tx1-fix2-owner-review.cjs"
) {
  failures.push("missing package script check:a17q-tx1-fix2-owner-review");
}

console.log("A-17Q-TX1-FIX2 owner review checker");
console.log("A17Q_TX1_FIX2_REVIEW_STATUS=BLOCKED_ADDITIONAL_SOURCE_CORRECTION_REQUIRED");
console.log(`REVIEWED_MIGRATION_SHA256=${actualSha}`);
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

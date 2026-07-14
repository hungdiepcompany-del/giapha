#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const migrationPath =
  "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql";
const mirrorPath =
  "supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql";
const dryRunSqlPath = "db/manual/20260713_a17q_dr1_production_reconciliation_dry_run.sql";
const postDryRunVerifierPath =
  "db/checks/20260713_check_a17q_dr1_post_production_reconciliation_dry_run.sql";
const planDocPath =
  "docs/PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md";
const dr1DocPath = "docs/PLAN_A17Q_DR1_PRODUCTION_RECONCILIATION_DRY_RUN_BUNDLE.md";

const expectedSha =
  "9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66";
const rpcName = "execute_admin_a17q_legacy_family_reconciliation";
const rpcFullName = `public.${rpcName}`;
const expectedSignature =
  "p_owner_approval_marker text, p_decision_pack_sha256 text, p_approved_group_plan_sha256 text, p_role_correction_plan_sha256 text, p_excluded_scope_sha256 text, p_forecast_sha256 text, p_idempotency_key text, p_confirm_backup_reviewed boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_confirm_excluded_scope_reviewed boolean, p_dry_run_only boolean";
const expectedParams = [
  "p_owner_approval_marker",
  "p_decision_pack_sha256",
  "p_approved_group_plan_sha256",
  "p_role_correction_plan_sha256",
  "p_excluded_scope_sha256",
  "p_forecast_sha256",
  "p_idempotency_key",
  "p_confirm_backup_reviewed",
  "p_confirm_rollback_reviewed",
  "p_confirm_audit_reviewed",
  "p_confirm_excluded_scope_reviewed",
  "p_dry_run_only",
];
const expectedDryRunKey = "A17Q_DR1_DRY_RUN_20260713_E04238C_001";

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

function countMatches(content, pattern) {
  return [...content.matchAll(pattern)].length;
}

const migration = read(migrationPath);
const mirror = read(mirrorPath);
const dryRunSql = read(dryRunSqlPath);
const dryRunCode = stripSqlComments(dryRunSql);
const verifier = read(postDryRunVerifierPath);
const verifierCode = stripSqlStrings(stripSqlComments(verifier));
const planDoc = read(planDocPath);
const dr1Doc = read(dr1DocPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = JSON.parse(read("package.json"));

if (migration !== mirror) failures.push("migration mirrors are not byte-identical");
if (sha256Hex(migrationPath) !== expectedSha) failures.push("migration SHA drifted");
if (sha256Hex(mirrorPath) !== expectedSha) failures.push("Supabase migration SHA drifted");

requireIncludes(migration, `create or replace function ${rpcFullName}(`, "migration RPC definition");
requireOrder(
  migration,
  expectedParams.map((param) => `${param} `),
  "migration RPC argument order",
);
requireIncludes(planDoc, `RPC_SIGNATURE=${expectedSignature}`, "plan exact RPC signature");

const callCount = countMatches(dryRunCode, /\bpublic\.execute_admin_a17q_legacy_family_reconciliation\s*\(/g);
if (callCount !== 1) failures.push(`dry-run SQL call count expected 1, got ${callCount}`);
if (dryRunSqlPath === postDryRunVerifierPath) failures.push("dry-run and verifier files must be separate");

requireIncludes(dryRunCode, `${rpcFullName}(`, "dry-run RPC call");
requireIncludes(dryRunCode, `p_idempotency_key => '${expectedDryRunKey}'`, "dry-run idempotency key");
requireIncludes(dryRunCode, "p_dry_run_only => true", "dry-run flag true");
rejectPattern(dryRunCode, /\bp_dry_run_only\s*=>\s*false\b/i, "non-dry-run flag");
rejectPattern(
  stripSqlStrings(dryRunCode),
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "dry-run SQL must be one SELECT statement",
);

requireOrder(
  dryRunCode,
  expectedParams.map((param) => `${param} =>`),
  "dry-run argument order",
);

for (const token of [
  "p_confirm_backup_reviewed => true",
  "p_confirm_rollback_reviewed => true",
  "p_confirm_audit_reviewed => true",
  "p_confirm_excluded_scope_reviewed => true",
  "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED",
  "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
  "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
  "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
  "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
  "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
]) {
  requireIncludes(dryRunCode, token, `dry-run ${token}`);
}

const dryRunBranchIndex = migration.indexOf("if p_dry_run_only is true then");
const dryRunReturnIndex = migration.indexOf("return v_result;", dryRunBranchIndex);
if (dryRunBranchIndex === -1 || dryRunReturnIndex === -1) {
  failures.push("migration dry-run branch or return missing");
} else {
  const mutationMarkers = [
    "insert into public.family_reconciliation_batches",
    "insert into public.family_reconciliation_rollback_manifests",
    "insert into public.revisions",
    "update public.family_parents",
    "update public.family_children",
    "update public.families",
    "update public.family_reconciliation_rollback_manifests",
    "update public.family_reconciliation_batches",
  ];
  for (const marker of mutationMarkers) {
    const markerIndex = migration.indexOf(marker, dryRunBranchIndex);
    if (markerIndex === -1) {
      failures.push(`migration mutation marker missing after dry-run branch: ${marker}`);
    } else if (markerIndex < dryRunReturnIndex) {
      failures.push(`dry-run branch can reach mutation before return: ${marker}`);
    }
  }
}

for (const token of [
  "'execution_allowed', v_precondition_failure_count = 0",
  "'dry_run', true",
  "'mutation_applied', false",
  "'approved_group_count', 21",
  "'approved_family_count', 57",
  "'survivor_count', 21",
  "'void_family_count', 36",
  "'child_membership_move_count', 36",
  "'child_membership_preserved_count', 57",
  "'child_membership_lost_count', 0",
  "'parent_membership_deactivation_count', 72",
  "'role_correction_plan_count', 36",
  "'role_correction_applied_to_survivor_count', 16",
  "'role_correction_superseded_by_void_count', 20",
  "'expected_active_family_count_after', v_expected_active_family_after",
  "'expected_active_parent_membership_count_after', v_expected_active_parent_after",
  "'expected_active_child_membership_count_after', v_expected_active_child_after",
  "'excluded_scope_unchanged', true",
  "'deleted_family_unchanged', true",
]) {
  requireIncludes(migration, token, `migration dry-run result ${token}`);
}

rejectPattern(
  verifierCode,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "post-dry-run verifier must remain SELECT-only",
);
rejectPattern(
  verifierCode,
  /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i,
  "post-dry-run verifier must not call executor",
);
rejectPattern(verifierCode, /\bfor\s+update\b/i, "post-dry-run verifier must not lock rows");

for (const token of [
  "completed_batch_count_zero_pass",
  "decision_pack_batch_count_zero_pass",
  "rollback_manifest_count_zero_pass",
  "audit_revision_count_zero_pass",
  "dry_run_idempotency_state_count_zero_pass",
  "active_family_baseline_pass",
  "active_parent_membership_baseline_pass",
  "active_child_membership_baseline_pass",
  "excluded_scope_unchanged_pass",
  "deleted_scope_unchanged_pass",
  "coalesce(",
  "array[]::uuid[]",
  "active_family_count = 74",
  "active_parent_membership_count = 140",
  "active_child_membership_count = 73",
]) {
  requireIncludes(verifier, token, `post-dry-run verifier ${token}`);
}
rejectPattern(
  verifierCode,
  /=\s*any\s*\(\s*\(\s*select\s+[a-z_]+_ids\b/i,
  "scalar UUID compared to UUID array subquery in post-dry-run verifier",
);

for (const token of [
  "A17Q_DR1_STATUS=PASS_PRODUCTION_DRY_RUN_BUNDLE_PREPARED_NOT_EXECUTED",
  `RPC_SIGNATURE=${expectedSignature}`,
  `DRY_RUN_SQL_FILE=${dryRunSqlPath}`,
  `POST_DRY_RUN_VERIFIER_FILE=${postDryRunVerifierPath}`,
  "DRY_RUN_CALL_COUNT=1",
  "DRY_RUN_FLAG_TRUE=YES",
  "NON_DRY_RUN_CALL_PRESENT=NO",
  "SQL_EXECUTED=NO",
  "RPC_CALLED=NO",
  "DATABASE_MUTATION=NO",
  "RECONCILIATION_EXECUTED=NO",
  "RUNTIME_CHANGED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "EXPECTED_SUCCESS_STATUS=PASS_PRODUCTION_DRY_RUN_BUNDLE_PREPARED_NOT_EXECUTED",
  "NEXT_ACTION=A17Q_DR2_OWNER_REVIEW_AND_MANUAL_PRODUCTION_DRY_RUN",
]) {
  requireIncludes(dr1Doc, token, `DR1 doc ${token}`);
}

for (const [content, token, label] of [
  [planDoc, "A17Q_DR1_STATUS=PASS_PRODUCTION_DRY_RUN_BUNDLE_PREPARED_NOT_EXECUTED", "plan DR1 status"],
  [index, "PLAN_A17Q_DR1_PRODUCTION_RECONCILIATION_DRY_RUN_BUNDLE.md", "index DR1 doc"],
  [index, "check:a17q-dr1-production-reconciliation-dry-run-bundle", "index DR1 script"],
  [workLog, "A17Q_DR1_STATUS=PASS_PRODUCTION_DRY_RUN_BUNDLE_PREPARED_NOT_EXECUTED", "work log DR1"],
  [decisionLog, "A-17Q-DR1 prepares production reconciliation dry-run bundle", "decision log DR1"],
  [handoff, "A17Q_DR1_STATUS=PASS_PRODUCTION_DRY_RUN_BUNDLE_PREPARED_NOT_EXECUTED", "handoff DR1"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson.scripts?.["check:a17q-dr1-production-reconciliation-dry-run-bundle"] !==
  "node scripts/check-a17q-dr1-production-reconciliation-dry-run-bundle.cjs"
) {
  failures.push("missing package script check:a17q-dr1-production-reconciliation-dry-run-bundle");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  dryRunSqlPath,
  postDryRunVerifierPath,
  dr1DocPath,
  "docs/PLAN_A17Q_DR1_FIX1_AUTHENTICATED_DRY_RUN_CALLER.md",
  planDocPath,
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
  "scripts/check-a17q-dr1-production-reconciliation-dry-run-bundle.cjs",
  "scripts/check-a17q-tx2-schema-qualified-pgcrypto-digest-patch.cjs",
  "scripts/check-a17q-tx1-fix1-owner-review.cjs",
  "scripts/check-a17q-tx1-fix2-exact-post-state-reconciliation-contract.cjs",
  "scripts/check-a17q-tx1-fix2-owner-review.cjs",
  "scripts/check-a17q-tx1-fix3-final-integrity-contract.cjs",
  "scripts/check-a17q-tx1-fix3-owner-review.cjs",
  "scripts/check-a17q-tx1r-legacy-family-reconciliation-executor-manual-apply-verification.cjs",
  "scripts/check-a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate.cjs",
  "db/checks/20260714_check_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql",
  "db/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql",
  "supabase/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql",
  "docs/PLAN_A17Q_TX2_SCHEMA_QUALIFIED_PGCRYPTO_DIGEST_PATCH.md",
  "docs/PLAN_A17Q_DR2_FIX1_POST_DRY_RUN_VERIFIER_UUID_ARRAY.md",
  "scripts/check-a17q-dr2-fix1-post-dry-run-verifier-uuid-array.cjs",
  "scripts/check-a17p-r-immutable-owner-decision-pack.cjs",
  "scripts/check-a17p-manual-owner-approval-evidence.cjs",
  "scripts/check-a17p-fix3-parent-role-gender-review-evidence.cjs",
  "scripts/check-a17p-fix2-owner-facing-legacy-family-review-query.cjs",
  "scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
]);
for (const file of changedFiles) {
  if (/^(app|components|lib|server|services)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`runtime file changed during A-17Q-DR1: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`migration changed during A-17Q-DR1: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected A-17Q-DR1 dirty file: ${file}`);
}

console.log("A-17Q-DR1 production reconciliation dry-run bundle checker");
console.log("A17Q_DR1_STATUS=PASS_PRODUCTION_DRY_RUN_BUNDLE_PREPARED_NOT_EXECUTED");
console.log(`RPC_SIGNATURE=${expectedSignature}`);
console.log(`DRY_RUN_SQL_FILE=${dryRunSqlPath}`);
console.log(`POST_DRY_RUN_VERIFIER_FILE=${postDryRunVerifierPath}`);
console.log(`DRY_RUN_CALL_COUNT=${callCount}`);
console.log(`DRY_RUN_FLAG_TRUE=${dryRunCode.includes("p_dry_run_only => true") ? "YES" : "NO"}`);
console.log(`NON_DRY_RUN_CALL_PRESENT=${/p_dry_run_only\s*=>\s*false/i.test(dryRunCode) ? "YES" : "NO"}`);
console.log("EXPECTED_FORECAST=74/140/73_TO_38/68/73");
console.log("SQL_EXECUTED=NO");
console.log("RPC_CALLED=NO");
console.log("DATABASE_MUTATION=NO");
console.log("RECONCILIATION_EXECUTED=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

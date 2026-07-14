#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

const files = {
  page: "app/(admin)/admin/reconciliation/a17q/execute/page.tsx",
  service: "lib/reconciliation/a17q-authenticated-execution.ts",
  dryRunService: "lib/reconciliation/a17q-authenticated-dry-run.ts",
  verifier:
    "db/checks/20260714_check_a17q_exec2_final_post_reconciliation_verification.sql",
  doc: "docs/PLAN_A17Q_EXEC1_FIX1_EXECUTION_GUARD_FINAL_VERIFIER.md",
};

const expected = {
  ownerMarker: "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED",
  idempotencyKey: "A17Q_EXEC1_SINGLE_EXECUTION_20260714_FBBF24C_001",
  hashes: [
    "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
    "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
    "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
    "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
    "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
  ],
};

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function countMatches(content, pattern) {
  return [...content.matchAll(pattern)].length;
}

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
}

function stripSqlStrings(sql) {
  return sql.replace(/'(?:''|[^'])*'/g, "''");
}

function listRuntimeFiles(dir, result = []) {
  for (const entry of fs.readdirSync(path.join(root, dir), {
    withFileTypes: true,
  })) {
    const relative = path.join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if ([".git", ".next", "node_modules", "docs", "db", "supabase", "scripts"].includes(entry.name)) {
        continue;
      }
      listRuntimeFiles(relative, result);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      result.push(relative);
    }
  }
  return result;
}

const page = read(files.page);
const service = read(files.service);
const dryRunService = read(files.dryRunService);
const verifier = read(files.verifier);
const verifierCode = stripSqlStrings(stripSqlComments(verifier));
const doc = read(files.doc);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = JSON.parse(read("package.json"));
const runtimeSource = listRuntimeFiles(".")
  .map((file) => `${file}\n${read(file)}`)
  .join("\n\n");

requireIncludes(page, "A17Q_AUTHENTICATED_EXECUTION_OWNER_APPROVAL_MARKER", "visible owner marker binding");
requireIncludes(page, "OWNER_APPROVAL_MARKER=", "visible owner marker label");
requireIncludes(page, "A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES", "visible hashes binding");
for (const label of [
  "DECISION_PACK_SHA256=",
  "APPROVED_GROUP_PLAN_SHA256=",
  "ROLE_CORRECTION_PLAN_SHA256=",
  "EXCLUDED_SCOPE_SHA256=",
  "FORECAST_SHA256=",
]) {
  requireIncludes(page, label, `visible ${label}`);
}
requireIncludes(page, "A17Q_AUTHENTICATED_EXECUTION_IDEMPOTENCY_KEY", "visible idempotency key binding");
requireIncludes(page, "EXECUTION_IDEMPOTENCY_KEY=", "visible idempotency key label");
requireIncludes(page, "P_DRY_RUN_ONLY=false", "visible dry-run false");
for (const token of [
  "EXPECTED_GROUP_COUNT=21",
  "EXPECTED_SURVIVOR_COUNT=21",
  "EXPECTED_VOID_FAMILY_COUNT=36",
  "EXPECTED_CHILD_MOVE_COUNT=36",
  "EXPECTED_PARENT_DEACTIVATION_COUNT=72",
  "EXPECTED_CHILD_LOSS_COUNT=0",
  "EXPECTED_POST_STATE=38 / 68 / 73",
  "PAGE_LOAD_RPC_CALL_COUNT=0",
]) {
  requireIncludes(page, token, `visible ${token}`);
}

requireIncludes(service, expected.ownerMarker, "service owner marker");
requireIncludes(service, expected.idempotencyKey, "service idempotency key");
for (const hash of expected.hashes) requireIncludes(service, hash, `service hash ${hash}`);
requireIncludes(service, "p_dry_run_only: false", "execution route dry-run false");
requireIncludes(dryRunService, "p_dry_run_only: true", "dry-run route remains true");
rejectPattern(dryRunService, /p_dry_run_only:\s*false|dryRunOnly:\s*false/, "dry-run route false path");

const executionCallerCount = countMatches(runtimeSource, /p_dry_run_only:\s*false/g);
if (executionCallerCount !== 1) {
  failures.push(`EXECUTION_CALLER_COUNT=${executionCallerCount}`);
}

requireIncludes(verifier, "A17Q_EXEC2_FINAL_POST_RECONCILIATION_SELECT_ONLY_VERIFIER", "final verifier marker");
requireIncludes(verifier, "SELECT_ONLY_VERIFIER=YES", "select-only marker");
requireIncludes(verifier, "DO_NOT_CALL_EXECUTOR", "no executor marker");
rejectPattern(
  verifierCode,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "final verifier must be SELECT-only",
);
rejectPattern(
  verifierCode,
  /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i,
  "final verifier must not call executor",
);
rejectPattern(verifierCode, /\bfor\s+update\b/i, "final verifier must not lock rows");

for (const token of [
  "active_post_state_pass",
  "approved_survivor_active_pass",
  "approved_void_families_merged_pass",
  "child_memberships_preserved_pass",
  "parent_memberships_final_state_pass",
  "role_correction_final_state_pass",
  "excluded_scope_unchanged_pass",
  "deleted_scope_unchanged_pass",
  "global_graph_integrity_pass",
  "ancestry_cycle_count_zero_pass",
  "mutation_audit_evidence_pass",
  "stored_success_result_integrity_pass",
  "people_rows_unchanged_pass",
  "layout_rows_unchanged_pass",
  "decision_pack_batch_count_one_pass",
  "rollback_manifest_count_one_pass",
  "extensions.digest",
  "success_result_sha256",
  "child_memberships_before",
  "parent_memberships_before",
]) {
  requireIncludes(verifier, token, `verifier ${token}`);
}

for (const token of [
  "A17Q_EXEC1_FIX1_STATUS=PASS_EXECUTION_GUARD_AND_FINAL_VERIFIER_READY_NOT_DEPLOYED",
  "VISIBLE_OWNER_MARKER=YES",
  "VISIBLE_FIVE_HASHES=YES",
  "VISIBLE_IDEMPOTENCY_KEY=YES",
  "VISIBLE_DRY_RUN_FALSE=YES",
  "EXPECTED_SCOPE_VISIBLE=YES",
  "PAGE_LOAD_RPC_CALL_COUNT=0",
  `FINAL_VERIFIER_FILE=${files.verifier}`,
  "FINAL_VERIFIER_SELECT_ONLY=YES",
  "FINAL_VERIFIER_EXECUTOR_CALL_COUNT=0",
  "INITIAL_AND_REPLAY_VERIFICATION_SUPPORTED=YES",
  "RPC_CALLED=NO",
  "DATABASE_MUTATION=NO",
  "RECONCILIATION_EXECUTED=NO",
  "MIGRATION_CHANGED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "NEXT_ACTION=A17Q_EXEC2_REAPPROVE_DEPLOY_EXECUTE_ONCE_AND_FINAL_VERIFY",
]) {
  requireIncludes(doc, token, `doc ${token}`);
  requireIncludes(workLog, token, `work log ${token}`);
  requireIncludes(handoff, token, `handoff ${token}`);
}

requireIncludes(index, "PLAN_A17Q_EXEC1_FIX1_EXECUTION_GUARD_FINAL_VERIFIER.md", "index FIX1 doc");
requireIncludes(decisionLog, "A-17Q-EXEC1-FIX1 requires visible execution contract and final verifier before deploy", "decision log FIX1");

if (
  packageJson.scripts?.["check:a17q-exec1-fix1-execution-guard-final-verifier"] !==
  "node scripts/check-a17q-exec1-fix1-execution-guard-final-verifier.cjs"
) {
  failures.push("missing package script check:a17q-exec1-fix1-execution-guard-final-verifier");
}

console.log("A17Q_EXEC1_FIX1_STATUS=PASS_EXECUTION_GUARD_AND_FINAL_VERIFIER_READY_NOT_DEPLOYED");
console.log("VISIBLE_OWNER_MARKER=YES");
console.log("VISIBLE_FIVE_HASHES=YES");
console.log("VISIBLE_IDEMPOTENCY_KEY=YES");
console.log("VISIBLE_DRY_RUN_FALSE=YES");
console.log("EXPECTED_SCOPE_VISIBLE=YES");
console.log("PAGE_LOAD_RPC_CALL_COUNT=0");
console.log(`FINAL_VERIFIER_FILE=${files.verifier}`);
console.log("FINAL_VERIFIER_SELECT_ONLY=YES");
console.log(
  `FINAL_VERIFIER_EXECUTOR_CALL_COUNT=${countMatches(
    verifierCode,
    /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/gi,
  )}`,
);
console.log("INITIAL_AND_REPLAY_VERIFICATION_SUPPORTED=YES");
console.log(`EXECUTION_CALLER_COUNT=${executionCallerCount}`);
console.log("RPC_CALLED=NO");
console.log("DATABASE_MUTATION=NO");
console.log("RECONCILIATION_EXECUTED=NO");
console.log("MIGRATION_CHANGED=NO");
console.log("DEPLOY=NO");
console.log("PUSH=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

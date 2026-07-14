#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const failures = [];

const expected = {
  migrationSha:
    "9BBDB8CC9F161EC93A6B2FA97FE0F899C13242A270D2CAB328A95BE8893A23F7",
  ownerMarker: "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED",
  idempotencyKey: "A17Q_EXEC1_SINGLE_EXECUTION_20260714_FBBF24C_001",
  nextOwnerMarker: "OWNER_APPROVES_A17Q_EXEC2_SINGLE_RECONCILIATION_EXECUTE_ONCE",
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

const docPath = "docs/PLAN_A17Q_TX3R_MANUAL_APPLY_EXEC2_READINESS.md";
const doc = read(docPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = JSON.parse(read("package.json") || "{}");
const migration = read(
  "db/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql",
);
const page = read("app/(admin)/admin/reconciliation/a17q/execute/page.tsx");
const service = read("lib/reconciliation/a17q-authenticated-execution.ts");
const finalVerifier = read(
  "db/checks/20260714_check_a17q_exec2_final_post_reconciliation_verification.sql",
);

for (const token of [
  "A17Q_TX3R_STATUS=PASS_TX3C_MANUAL_APPLY_EVIDENCE_RECORDED_EXEC2_READINESS_PENDING",
  "A17Q_TX3C_STATUS=PASS_OWNER_MANUAL_MIGRATION_APPLIED_AND_VERIFIED",
  "PHASE_CHANGE_CLASS=DOCS_ONLY+CHECKER_ONLY+EXTERNAL_ADMIN_ACCESS",
  "EXECUTION_MODE=OWNER_MANUAL_SUPABASE_SQL_EDITOR",
  "TARGET_PROJECT_REF=frkyeuxrlcflmsxxsolp",
  "MIGRATION_EXECUTED=YES",
  "MIGRATION_APPLIED_EXACTLY_ONCE_BY_OWNER=YES",
  "SQL_EXECUTION_RESULT=SUCCESS",
  "MIGRATION_0028_RERUN_ALLOWED=NO",
  "MIGRATION_RERUN=NO",
  "FUNCTION_OWNER=postgres",
  "SECURITY_DEFINER=YES",
  "FIXED_SEARCH_PATH_VERIFIED=YES",
  "PUBLIC_EXECUTE_REVOKED=YES",
  "ANON_EXECUTE_REVOKED=YES",
  "AUTHENTICATED_EXECUTE_GRANTED=YES",
  "POST_APPLY_DATABASE_VERIFICATION=PASS",
  "EXPECTED_OBJECTS_VERIFIED=YES",
  "EXPECTED_SECURITY_PROPERTIES_VERIFIED=YES",
  "EXPECTED_GRANTS_VERIFIED=YES",
  "PRE_EXECUTION_ACTIVE_STATE=74/140/73",
  "DECISION_PACK_BATCH_COUNT=0",
  "COMPLETED_BATCH_COUNT=0",
  "ROLLBACK_MANIFEST_COUNT=0",
  "GLOBAL_GRAPH_INTEGRITY_PASS=true",
  "ANCESTRY_CYCLE_COUNT_ZERO_PASS=true",
  "FINAL_POST_RECONCILIATION_VERIFIER_EXPECTED_TO_PASS_BEFORE_EXEC2=NO",
  "FINAL_VERIFIER_PRE_EXECUTION_STATUS=NOT_RUN_NOT_VALID_BEFORE_EXEC2",
  "UI_VALIDATION_REQUIRED=NO",
  "UI_SMOKE_EXECUTED=NO",
  "APPLICATION_UI_TESTED=NO",
  "BROWSER_ACCESS_SCOPE=EXEC2_READ_ONLY_CONTROL_SURFACE_INSPECTION_ONLY",
  "PAGE_LOAD_RPC_CALL_COUNT=0",
  "DEPLOY_REQUIRED=PENDING_READ_ONLY_EXEC2_PAGE_INSPECTION",
  "DEPLOY=NO",
  "RPC_CALLED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "FAMILY_DATA_MUTATED=NO",
  expected.nextOwnerMarker,
  "NEXT_ACTION=A17Q_EXEC2_SINGLE_OWNER_EXECUTION_AND_FINAL_SELECT_ONLY_VERIFICATION",
]) {
  requireIncludes(doc, token, `TX3R doc token ${token}`);
}

requireIncludes(doc, `MIGRATION_SHA256=${expected.migrationSha}`, "migration SHA");
requireIncludes(doc, `OWNER_APPROVAL_MARKER=${expected.ownerMarker}`, "owner marker");
requireIncludes(doc, `EXECUTION_IDEMPOTENCY_KEY=${expected.idempotencyKey}`, "idempotency key");
for (const hash of expected.hashes) requireIncludes(doc, hash, `TX3R hash ${hash}`);

for (const token of [
  "APPROVED_GROUP_COUNT=21",
  "SURVIVOR_COUNT=21",
  "VOID_FAMILY_COUNT=36",
  "CHILD_MOVE_COUNT=36",
  "PARENT_DEACTIVATION_COUNT=72",
  "CHILD_LOSS_COUNT=0",
  "EXPECTED_POST_STATE=38/68/73",
  "EXACT_CONFIRMATION_GATE_REQUIRED=YES",
  "BACKUP_CONFIRMATION_REQUIRED=YES",
  "ROLLBACK_CONFIRMATION_REQUIRED=YES",
  "AUDIT_CONFIRMATION_REQUIRED=YES",
  "EXCLUDED_SCOPE_CONFIRMATION_REQUIRED=YES",
  "NO_NEW_IDEMPOTENCY_KEY=YES",
]) {
  requireIncludes(doc, token, `TX3R readiness ${token}`);
}

requireIncludes(migration, "security definer", "migration 0028 security definer");
requireIncludes(migration, "owner to postgres", "migration 0028 postgres owner");
requireIncludes(migration, "revoke all on function", "migration 0028 revoke all");
requireIncludes(migration, "to authenticated", "migration 0028 authenticated grant");

requireIncludes(page, "OWNER_APPROVAL_MARKER=", "page visible owner marker");
requireIncludes(page, "P_DRY_RUN_ONLY=false", "page visible dry-run false");
requireIncludes(page, "EXPECTED_GROUP_COUNT=21", "page visible expected group count");
requireIncludes(page, "EXPECTED_POST_STATE=38 / 68 / 73", "page visible expected post-state");
requireIncludes(page, "PAGE_LOAD_RPC_CALL_COUNT=0", "page load RPC count");
requireIncludes(service, expected.idempotencyKey, "service fixed idempotency key");
if (countMatches(service, new RegExp(expected.idempotencyKey, "g")) !== 1) {
  failures.push("execution idempotency key should appear once in service");
}

requireIncludes(finalVerifier, "decision_pack_batch_count_one_pass", "final verifier expects completed decision-pack batch");
requireIncludes(finalVerifier, "rollback_manifest_count_one_pass", "final verifier expects rollback manifest");
requireIncludes(doc, "completed batch count and rollback manifest count must\nremain `0` before execution", "final verifier pre-exec warning");

for (const target of [
  [index, "PLAN_A17Q_TX3R_MANUAL_APPLY_EXEC2_READINESS.md", "index entry"],
  [workLog, "A17Q_TX3R_STATUS=PASS_TX3C_MANUAL_APPLY_EVIDENCE_RECORDED_EXEC2_READINESS_PENDING", "work log status"],
  [decisionLog, "A-17Q-TX3R records owner manual apply before EXEC2", "decision log TX3R"],
  [handoff, "A17Q_TX3R_STATUS=PASS_TX3C_MANUAL_APPLY_EVIDENCE_RECORDED_EXEC2_READINESS_PENDING", "handoff status"],
  [handoff, expected.nextOwnerMarker, "handoff next owner marker"],
]) {
  requireIncludes(target[0], target[1], target[2]);
}

if (
  packageJson.scripts?.["check:a17q-tx3r-manual-apply-exec2-readiness"] !==
  "node scripts/check-a17q-tx3r-manual-apply-exec2-readiness.cjs"
) {
  failures.push("missing package script check:a17q-tx3r-manual-apply-exec2-readiness");
}

rejectPattern(doc, /MIGRATION_RERUN=YES|RPC_CALLED=YES|RECONCILIATION_EXECUTED=YES|DEPLOY=YES/, "forbidden executed boundary");

if (failures.length) {
  console.error("A17Q TX3R manual apply evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A17Q_TX3R_STATUS=PASS_TX3C_MANUAL_APPLY_EVIDENCE_RECORDED_EXEC2_READINESS_PENDING");
console.log("TX3C_MANUAL_APPLY_EVIDENCE_RECORDED=YES");
console.log(`MIGRATION_SHA256=${expected.migrationSha}`);
console.log("FUNCTION_OWNER=postgres");
console.log("SECURITY_DEFINER=YES");
console.log("FIXED_SEARCH_PATH_VERIFIED=YES");
console.log("PUBLIC_EXECUTE_REVOKED=YES");
console.log("ANON_EXECUTE_REVOKED=YES");
console.log("AUTHENTICATED_EXECUTE_GRANTED=YES");
console.log("UI_VALIDATION_REQUIRED=NO");
console.log("UI_SMOKE_EXECUTED=NO");
console.log("APPLICATION_UI_TESTED=NO");
console.log("RPC_CALLED=NO");
console.log("RECONCILIATION_EXECUTED=NO");
console.log("FAMILY_DATA_MUTATED=NO");
console.log("MIGRATION_RERUN=NO");

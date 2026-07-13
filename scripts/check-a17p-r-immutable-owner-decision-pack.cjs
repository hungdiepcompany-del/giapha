#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const packPath = "docs/evidence/A17P_OWNER_DECISION_PACK.json";
const shaPath = "docs/evidence/A17P_OWNER_DECISION_PACK.sha256";
const checkerPath = "scripts/check-a17p-r-immutable-owner-decision-pack.cjs";

const expectedHashes = {
  approved_group_plan_sha256:
    "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
  role_correction_plan_sha256:
    "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
  excluded_scope_sha256:
    "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
  forecast_sha256:
    "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
  decision_pack_sha256:
    "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
};

const expectedRoleGroups = new Set([
  "697e2ea051fc81496e186ce579ad0990",
  "f8a4b569a15428f13eb7c7a633219d8a",
  "669d75955c5ed0e3616936f0beeea162",
  "6e3ab58476a5c3ca27b63fd740c55e56",
  "a33cc1f6470a638e2607615fe6959eb7",
  "b34bbc4b9a7e5d3d71733d808c894e6c",
  "c0d499673c250e0b883a899dc6a27101",
  "e309bb5c052bf74a4228b00e4146eda0",
]);

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
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

function requireEqual(label, actual, expected) {
  if (actual !== expected) {
    failures.push(`${label}: expected ${expected}, got ${actual}`);
  }
}

function requireTrue(label, condition) {
  if (!condition) failures.push(`${label}: expected true`);
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = canonicalize(value[key]);
        return result;
      }, {});
  }
  return value;
}

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalize(value)), "utf8")
    .digest("hex");
}

function unique(values) {
  return new Set(values);
}

function countOverlap(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value)).length;
}

const pack = readJson(packPath);
const shaFile = read(shaPath).trim();
const doc = read("docs/PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md");
const template = read("docs/templates/A17P_LEGACY_RECONCILIATION_OWNER_REVIEW_PACK_TEMPLATE.md");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

if (!pack) process.exit(1);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const safeRefPattern = /^[0-9a-f]{32}$/;

requireEqual("schema_version", pack.schema_version, "a17p-owner-decision-pack:v1");
requireEqual("status", pack.status, "OWNER_APPROVED_NOT_EXECUTED");
requireEqual("source.fix3_commit", pack.source?.fix3_commit, "19c6cb0");
requireEqual(
  "source.owner_approval_evidence_commit",
  pack.source?.owner_approval_evidence_commit,
  "1f30228",
);
requireEqual(
  "source.verified_source",
  pack.source?.verified_source,
  "A17P_FIX3_OWNER_FACING_PRODUCTION_RESULT",
);
requireEqual(
  "approval.owner_approval",
  pack.approval?.owner_approval,
  "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED",
);
requireEqual(
  "approval.survivor_policy",
  pack.approval?.survivor_policy,
  "FAMILY_REVIEW_ORDER_1_FOR_EACH_OF_THE_21_APPROVED_GROUPS",
);
requireEqual("automatic_survivor_selection", pack.approval?.automatic_survivor_selection, false);
requireEqual("owner_explicitly_selected_policy", pack.approval?.owner_explicitly_selected_policy, true);
requireEqual("decision_pack_finalized", pack.approval?.decision_pack_finalized, true);
requireEqual(
  "reconciliation_authorized_for_design_only",
  pack.approval?.reconciliation_authorized_for_design_only,
  true,
);
requireEqual(
  "reconciliation_execution_authorized",
  pack.approval?.reconciliation_execution_authorized,
  false,
);

for (const [key, expected] of Object.entries({
  total_reviewed_group_count: 22,
  approved_execution_group_count: 21,
  excluded_group_count: 1,
  blocked_data_conflict_count: 0,
  request_more_evidence_count: 0,
})) {
  requireEqual(`approval.${key}`, pack.approval?.[key], expected);
}

for (const [key, expected] of Object.entries({
  active_family_count_before: 74,
  active_parent_membership_count_before: 140,
  active_child_membership_count_before: 73,
  approved_candidate_family_count: 57,
  approved_survivor_count: 21,
  approved_void_family_count: 36,
  approved_child_memberships_preserved: 57,
  role_correction_group_count: 8,
  role_correction_family_count: 18,
  role_correction_membership_count: 36,
  role_correction_distinct_person_count: 16,
})) {
  requireEqual(`baseline.${key}`, pack.baseline?.[key], expected);
}

const approvedGroups = pack.approved_groups ?? [];
const roleCorrections = pack.role_corrections ?? [];
const excludedGroups = pack.excluded_groups ?? [];
const deletedAdvisories = pack.deleted_family_advisories ?? [];
const forecast = pack.forecast ?? {};

requireEqual("approved_group_count", approvedGroups.length, 21);
requireEqual("role_correction_count", roleCorrections.length, 36);
requireEqual("excluded_group_count", excludedGroups.length, 1);
requireEqual("deleted_family_advisory_count", deletedAdvisories.length, 1);

const groupOrders = approvedGroups.map((group) => group.group_review_order);
requireTrue(
  "approved group array follows group_review_order",
  groupOrders.every((order, index) => index === 0 || order > groupOrders[index - 1]),
);

const survivorIds = approvedGroups.map((group) => group.survivor_family_id);
const voidIds = approvedGroups.flatMap((group) =>
  (group.void_families ?? []).map((family) => family.family_id),
);
const approvedIds = [...survivorIds, ...voidIds];
const excludedIds = excludedGroups.flatMap((group) => group.candidate_family_ids ?? []);
const deletedIds = deletedAdvisories.map((advisory) => advisory.family_id);

requireEqual("approved_survivor_count", survivorIds.length, 21);
requireEqual("approved_void_family_count", voidIds.length, 36);
requireEqual("approved_candidate_family_count", approvedIds.length, 57);
requireEqual("unique_group_ref_count", unique(approvedGroups.map((group) => group.safe_group_ref)).size, 21);
requireEqual("unique_survivor_family_count", unique(survivorIds).size, 21);
requireEqual("unique_void_family_count", unique(voidIds).size, 36);
requireEqual("unique_approved_family_count", unique(approvedIds).size, 57);
requireEqual("survivor_void_overlap_count", countOverlap(survivorIds, voidIds), 0);
requireEqual("cross_group_family_overlap_count", approvedIds.length - unique(approvedIds).size, 0);
requireEqual("excluded_family_overlap_count", countOverlap(excludedIds, approvedIds), 0);
requireEqual("deleted_family_overlap_count", countOverlap(deletedIds, approvedIds), 0);

for (const group of approvedGroups) {
  requireTrue(`safe_group_ref ${group.safe_group_ref}`, safeRefPattern.test(group.safe_group_ref));
  requireTrue(`survivor_family_id ${group.survivor_family_id}`, uuidPattern.test(group.survivor_family_id));
  requireTrue(
    `survivor_safe_family_ref ${group.survivor_safe_family_ref}`,
    safeRefPattern.test(group.survivor_safe_family_ref),
  );
  requireEqual(`group ${group.safe_group_ref} executable`, group.executable, true);
  requireEqual(`group ${group.safe_group_ref} executed`, group.executed, false);
  for (const family of group.void_families ?? []) {
    requireTrue(`void family_id ${family.family_id}`, uuidPattern.test(family.family_id));
    requireTrue(`void safe_family_ref ${family.safe_family_ref}`, safeRefPattern.test(family.safe_family_ref));
  }
}

const roleGroupRefs = unique(roleCorrections.map((row) => row.safe_group_ref));
const roleFamilyIds = unique(roleCorrections.map((row) => row.family_id));
const roleMembershipIds = unique(roleCorrections.map((row) => row.membership_id));
const rolePersonIds = unique(roleCorrections.map((row) => row.person_id));

requireEqual("role_correction_group_count", roleGroupRefs.size, 8);
requireEqual("role_correction_family_count", roleFamilyIds.size, 18);
requireEqual("role_correction_membership_count", roleCorrections.length, 36);
requireEqual("role_correction_distinct_person_count", rolePersonIds.size, 16);
requireEqual("role_correction_membership_ids_unique", roleMembershipIds.size, 36);
requireTrue(
  "role_correction_group_refs_exact",
  [...roleGroupRefs].every((safeGroupRef) => expectedRoleGroups.has(safeGroupRef)) &&
    [...expectedRoleGroups].every((safeGroupRef) => roleGroupRefs.has(safeGroupRef)),
);

for (const row of roleCorrections) {
  requireTrue(`role safe_group_ref ${row.safe_group_ref}`, safeRefPattern.test(row.safe_group_ref));
  requireTrue(`role family_id ${row.family_id}`, uuidPattern.test(row.family_id));
  requireTrue(`role membership_id ${row.membership_id}`, uuidPattern.test(row.membership_id));
  requireTrue(`role person_id ${row.person_id}`, uuidPattern.test(row.person_id));
  requireTrue(`role target allowed ${row.membership_id}`, ["father", "mother"].includes(row.target_role));
  requireTrue(
    `role expected allowed ${row.membership_id}`,
    ["father", "mother"].includes(row.expected_current_role),
  );
  requireTrue(`role before after different ${row.membership_id}`, row.expected_current_role !== row.target_role);
  requireEqual(`relationship_type ${row.membership_id}`, row.relationship_type, "biological");
  requireEqual(`owner_confirmed ${row.membership_id}`, row.owner_confirmed, true);
  requireEqual(`executed ${row.membership_id}`, row.executed, false);
  requireTrue(`role family in approved scope ${row.family_id}`, approvedIds.includes(row.family_id));
  requireTrue(
    `role group in approved scope ${row.safe_group_ref}`,
    approvedGroups.some((group) => group.safe_group_ref === row.safe_group_ref),
  );
}

const excluded = excludedGroups[0] ?? {};
requireEqual("excluded safe_group_ref", excluded.safe_group_ref, "721e2ae3d95dd418af40b6459531b870");
requireEqual("excluded decision", excluded.decision, "EXCLUDE_GROUP");
requireEqual("excluded candidate count", (excluded.candidate_family_ids ?? []).length, 3);
requireEqual("excluded executable", excluded.executable, false);

const deleted = deletedAdvisories[0] ?? {};
requireEqual("deleted family_id", deleted.family_id, "990de69e-2239-4a00-995c-6292ce4a814a");
requireEqual("deleted safe_family_ref", deleted.safe_family_ref, "16ead1f516a885724a2bddd11e14472b");
requireEqual("deleted decision", deleted.decision, "SEPARATE_RECONCILIATION_REQUIRED");
requireEqual("deleted executable", deleted.executable, false);

for (const [key, expected] of Object.entries({
  status: "FORECAST_ONLY_NOT_EXECUTED",
  active_family_count_before: 74,
  family_void_count: 36,
  active_family_count_after: 38,
  active_parent_membership_count_before: 140,
  parent_membership_normalization_count: 72,
  active_parent_membership_count_after: 68,
  active_child_membership_count_before: 73,
  active_child_membership_count_after: 73,
  approved_child_memberships_preserved: 57,
  child_membership_lost_count: 0,
  people_row_change_count: 0,
  excluded_group_count: 1,
  deleted_family_action_count: 0,
})) {
  requireEqual(`forecast.${key}`, forecast[key], expected);
}

for (const [key, expected] of Object.entries({
  schema_version_correct: true,
  owner_approval_marker_correct: true,
  approved_group_count: 21,
  approved_survivor_count: 21,
  approved_void_family_count: 36,
  approved_candidate_family_count: 57,
  unique_group_ref_count: 21,
  unique_survivor_family_count: 21,
  unique_void_family_count: 36,
  unique_approved_family_count: 57,
  survivor_void_overlap_count: 0,
  cross_group_family_overlap_count: 0,
  excluded_family_overlap_count: 0,
  deleted_family_overlap_count: 0,
  role_correction_group_count: 8,
  role_correction_family_count: 18,
  role_correction_membership_count: 36,
  role_correction_distinct_person_count: 16,
  role_correction_membership_ids_unique: true,
  role_correction_family_ids_in_approved_scope: true,
  role_correction_group_refs_in_approved_scope: true,
  role_targets_allowed: true,
  role_before_after_different: true,
  relationship_type_biological_only: true,
  excluded_group_count: 1,
  excluded_group_candidate_count: 3,
  deleted_family_advisory_count: 1,
  child_memberships_lost_forecast: 0,
  people_rows_changed_forecast: 0,
  production_names_present: false,
  automatic_execution_enabled: false,
  reconciliation_executed: false,
})) {
  requireEqual(`integrity.${key}`, pack.integrity?.[key], expected);
}

const recomputedHashes = {
  approved_group_plan_sha256: sha256(pack.approved_groups),
  role_correction_plan_sha256: sha256(pack.role_corrections),
  excluded_scope_sha256: sha256({
    excluded_groups: pack.excluded_groups,
    deleted_family_advisories: pack.deleted_family_advisories,
  }),
  forecast_sha256: sha256(pack.forecast),
};
const packWithoutHashes = { ...pack };
delete packWithoutHashes.hashes;
recomputedHashes.decision_pack_sha256 = sha256(packWithoutHashes);

for (const [key, expected] of Object.entries(expectedHashes)) {
  requireEqual(`expected hash ${key}`, recomputedHashes[key], expected);
  requireEqual(`pack hash ${key}`, pack.hashes?.[key], expected);
}
requireEqual(
  "sha256 file",
  shaFile,
  `${expectedHashes.decision_pack_sha256}  A17P_OWNER_DECISION_PACK.json`,
);

const serializedPack = JSON.stringify(pack);
rejectPattern(
  serializedPack,
  /display_name|full_name|parent_display_name|child_display_name|notes_private|phone|email|address|auth_user_id|access_token|refresh_token|service_role|PRIVATE KEY/i,
  "display-name-like private/contact/auth field in decision pack",
);
rejectPattern(
  serializedPack,
  /Nguyễn|Phạm|Trần|Đỗ|Đào|bà Chạy|Hoàng|Minh|Văn|Thị|Hữu|Quang/i,
  "production name in decision pack",
);
rejectPattern(
  serializedPack,
  /"executed"\s*:\s*true|"executable"\s*:\s*true,\s*"executed"\s*:\s*true|"reconciliation_execution_authorized"\s*:\s*true/i,
  "automatic execution marker",
);

for (const token of [
  "A17P_R_STATUS=PASS_IMMUTABLE_OWNER_DECISION_PACK_FINALIZED",
  "DECISION_PACK_CREATED=YES",
  `DECISION_PACK_FILE=${packPath}`,
  `DECISION_PACK_SHA256_FILE=${shaPath}`,
  `APPROVED_GROUP_PLAN_SHA256=${expectedHashes.approved_group_plan_sha256}`,
  `ROLE_CORRECTION_PLAN_SHA256=${expectedHashes.role_correction_plan_sha256}`,
  `EXCLUDED_SCOPE_SHA256=${expectedHashes.excluded_scope_sha256}`,
  `FORECAST_SHA256=${expectedHashes.forecast_sha256}`,
  `DECISION_PACK_SHA256=${expectedHashes.decision_pack_sha256}`,
  "DECISION_PACK_FINALIZED=YES",
  "RECONCILIATION_AUTHORIZED_FOR_DESIGN_ONLY=YES",
  "RECONCILIATION_EXECUTION_AUTHORIZED=NO",
]) {
  requireTrue(`doc token ${token}`, doc.includes(token));
}

for (const [content, token, label] of [
  [index, "A17P_R_STATUS=PASS_IMMUTABLE_OWNER_DECISION_PACK_FINALIZED", "index A17P-R"],
  [workLog, "A17P_R_STATUS=PASS_IMMUTABLE_OWNER_DECISION_PACK_FINALIZED", "work log A17P-R"],
  [decisionLog, "Decision 349 - A-17P-R finalizes immutable owner decision pack", "decision A17P-R"],
  [handoff, "A17P_R_STATUS=PASS_IMMUTABLE_OWNER_DECISION_PACK_FINALIZED", "handoff A17P-R"],
  [template, "DECISION_PACK_VERSION=a17p-owner-decision-pack:v1", "template decision pack version"],
]) {
  requireTrue(label, content.includes(token));
}

if (
  packageJson?.scripts?.["check:a17p-r-immutable-owner-decision-pack"] !==
  `node ${checkerPath}`
) {
  failures.push("missing package script check:a17p-r-immutable-owner-decision-pack");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  packPath,
  shaPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md",
  "docs/templates/A17P_LEGACY_RECONCILIATION_OWNER_REVIEW_PACK_TEMPLATE.md",
  "scripts/check-a17p-manual-owner-approval-evidence.cjs",
  "scripts/check-a17p-fix3-parent-role-gender-review-evidence.cjs",
  "scripts/check-a17p-fix2-owner-facing-legacy-family-review-query.cjs",
  "scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "scripts/check-a17m-canonical-family-domain-service.cjs",
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs",
  "scripts/check-a17n-dr-deploy-production-no-mutation-smoke-evidence.cjs",
  "scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs",
  "scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs",
  "scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs",
  "scripts/check-a17o-dr-grouped-importer-deploy-no-import-mutation-smoke-evidence.cjs",
  "scripts/check-a17o-importer-canonical-family-grouping.cjs",
  "scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs",
  "scripts/check-a17o-tx1r-grouped-import-executor-manual-apply-verification.cjs",
  "db/checks/20260713_check_a17q_tx1_legacy_family_reconciliation_executor_candidate.sql",
  "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
  "supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
  "docs/PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate.cjs",
  "scripts/check-a17q-tx1-fix1-hardened-reconciliation-executor.cjs",
  "docs/PLAN_A17Q_TX1_FIX1_OWNER_REVIEW_HARDENED_RECONCILIATION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17q-tx1-fix1-owner-review.cjs",
  "scripts/check-a17q-tx1-fix2-exact-post-state-reconciliation-contract.cjs",
  "docs/PLAN_A17Q_TX1_FIX2_OWNER_REVIEW_EXACT_POST_STATE_RECONCILIATION_CANDIDATE.md",
  "scripts/check-a17q-tx1-fix2-owner-review.cjs",
  "scripts/check-a17q-tx1-fix3-final-integrity-contract.cjs",
  "scripts/check-export-import-boundary-design.cjs",
  "scripts/check-export-import-final-readiness.cjs",
]);

for (const file of changedFiles) {
  if (/^(app|components|lib|services)\//.test(file)) {
    failures.push(`runtime file changed during A-17P-R: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`migration changed during A-17P-R: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected A-17P-R dirty file: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-17P-R immutable owner decision pack check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17P-R immutable owner decision pack check passed.");
console.log(`approved_group_plan_sha256=${recomputedHashes.approved_group_plan_sha256}`);
console.log(`role_correction_plan_sha256=${recomputedHashes.role_correction_plan_sha256}`);
console.log(`excluded_scope_sha256=${recomputedHashes.excluded_scope_sha256}`);
console.log(`forecast_sha256=${recomputedHashes.forecast_sha256}`);
console.log(`decision_pack_sha256=${recomputedHashes.decision_pack_sha256}`);

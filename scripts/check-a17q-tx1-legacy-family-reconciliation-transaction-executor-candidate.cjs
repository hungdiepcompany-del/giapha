#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

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
const packPath = "docs/evidence/A17P_OWNER_DECISION_PACK.json";
const shaPath = "docs/evidence/A17P_OWNER_DECISION_PACK.sha256";
const checkerPath =
  "scripts/check-a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate.cjs";

const expected = {
  ownerMarker: "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED",
  decisionPackSha:
    "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
  approvedGroupSha:
    "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
  roleCorrectionSha:
    "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
  excludedScopeSha:
    "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
  forecastSha:
    "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
  excludedGroupRef: "721e2ae3d95dd418af40b6459531b870",
  excludedFamilyIds: [
    "7e8e8b20-49ce-49f0-aba8-e55f441fc8cc",
    "0dc5e67d-9f5e-4270-8783-3393fe3843a4",
    "5b437738-e8a3-4fef-80de-9c8e5ff0839d",
  ],
  deletedFamilyId: "990de69e-2239-4a00-995c-6292ce4a814a",
  deletedSafeFamilyRef: "16ead1f516a885724a2bddd11e14472b",
};

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

function sha256Hex(relativePath) {
  return crypto
    .createHash("sha256")
    .update(readBuffer(relativePath))
    .digest("hex")
    .toUpperCase();
}

function requireEqual(label, actual, wanted) {
  if (actual !== wanted) {
    failures.push(`${label}: expected ${wanted}, got ${actual}`);
  }
}

function requireTrue(label, condition) {
  if (!condition) failures.push(`${label}: expected true`);
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
}

function stripSqlStringLiterals(sql) {
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

function sha256Object(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalize(value)), "utf8")
    .digest("hex");
}

function unique(values) {
  return new Set(values);
}

function overlap(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}

function listFiles(dir, result = []) {
  for (const entry of fs.readdirSync(path.join(root, dir), {
    withFileTypes: true,
  })) {
    const relative = path.join(dir, entry.name).replace(/\\/g, "/");
    if (
      entry.isDirectory() &&
      ![".next", ".git", "node_modules", "docs", "db", "supabase"].includes(entry.name)
    ) {
      listFiles(relative, result);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|cjs|mjs)$/.test(entry.name)) {
      result.push(relative);
    }
  }
  return result;
}

function assertCase(label, condition) {
  if (!condition) failures.push(`synthetic case failed: ${label}`);
}

function simulatePlan(input) {
  const familyIds = input.groups.flatMap((group) => [
    group.survivor,
    ...group.voids,
  ]);
  if (new Set(familyIds).size !== familyIds.length) {
    return { ok: false, code: "FAMILY_OVERLAP" };
  }
  if (input.groups.some((group) => group.voids.includes(group.survivor))) {
    return { ok: false, code: "SURVIVOR_VOID_OVERLAP" };
  }
  if (overlap(familyIds, expected.excludedFamilyIds).length > 0) {
    return { ok: false, code: "EXCLUDED_FAMILY_IN_PLAN" };
  }
  if (familyIds.includes(expected.deletedFamilyId)) {
    return { ok: false, code: "DELETED_FAMILY_IN_PLAN" };
  }
  if (input.children.length !== new Set(input.children.map((row) => row.childId)).size) {
    return { ok: false, code: "DUPLICATE_CHILD" };
  }
  if (input.children.length !== input.expectedChildren) {
    return { ok: false, code: "MISSING_CHILD" };
  }
  if (input.unexpectedParent) return { ok: false, code: "UNEXPECTED_PARENT" };
  if (input.changedFamilyStatus) return { ok: false, code: "CHANGED_FAMILY_STATUS" };
  if (input.layoutReference) return { ok: false, code: "UNEXPECTED_LAYOUT_REFERENCE" };
  for (const role of input.roleCorrections) {
    if (role.current !== role.expectedCurrent) {
      return { ok: false, code: "INCORRECT_CURRENT_ROLE" };
    }
  }
  return {
    ok: true,
    survivorCount: input.groups.length,
    voidCount: input.groups.reduce((sum, group) => sum + group.voids.length, 0),
    childMoveCount: input.children.filter((row) => row.fromVoid).length,
    survivorRoleCorrections: input.roleCorrections.filter((row) => row.onSurvivor).length,
    supersededRoleCorrections: input.roleCorrections.filter((row) => !row.onSurvivor).length,
  };
}

const migration = read(dbMigrationPath);
const mirror = read(supabaseMigrationPath);
const verifier = read(verifierPath);
const verifierWithoutComments = stripSqlComments(verifier);
const verifierWithoutCommentsOrStrings = stripSqlStringLiterals(verifierWithoutComments);
const doc = read(docPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");
const pack = readJson(packPath);
const shaFile = read(shaPath).trim();

if (!pack) process.exit(1);

if (migration !== mirror) failures.push("A-17Q-TX1 migration mirrors differ");
requireTrue("A-17P-R sha file matches", shaFile.startsWith(expected.decisionPackSha));

const embeddedPackMatch = migration.match(/\$a17q_pack\$([\s\S]*?)\$a17q_pack\$::jsonb/);
if (!embeddedPackMatch) {
  failures.push("missing embedded decision pack JSON");
} else {
  try {
    const embeddedPack = JSON.parse(embeddedPackMatch[1]);
    requireEqual(
      "embedded pack equals committed pack",
      JSON.stringify(embeddedPack),
      JSON.stringify(pack),
    );
  } catch (error) {
    failures.push(`embedded decision pack JSON parse failed: ${error.message}`);
  }
}

requireEqual("pack schema", pack.schema_version, "a17p-owner-decision-pack:v1");
requireEqual("pack status", pack.status, "OWNER_APPROVED_NOT_EXECUTED");
requireEqual("owner marker", pack.approval?.owner_approval, expected.ownerMarker);
requireEqual("decision pack hash", pack.hashes?.decision_pack_sha256, expected.decisionPackSha);
requireEqual("approved group hash", pack.hashes?.approved_group_plan_sha256, expected.approvedGroupSha);
requireEqual("role hash", pack.hashes?.role_correction_plan_sha256, expected.roleCorrectionSha);
requireEqual("excluded hash", pack.hashes?.excluded_scope_sha256, expected.excludedScopeSha);
requireEqual("forecast hash", pack.hashes?.forecast_sha256, expected.forecastSha);
requireEqual(
  "canonical approved-group hash recomputes",
  sha256Object(pack.approved_groups),
  expected.approvedGroupSha,
);
requireEqual(
  "canonical role-correction hash recomputes",
  sha256Object(pack.role_corrections),
  expected.roleCorrectionSha,
);
requireEqual(
  "canonical excluded-scope hash recomputes",
  sha256Object({
    excluded_groups: pack.excluded_groups,
    deleted_family_advisories: pack.deleted_family_advisories,
  }),
  expected.excludedScopeSha,
);
requireEqual("canonical forecast hash recomputes", sha256Object(pack.forecast), expected.forecastSha);

const approvedGroups = pack.approved_groups ?? [];
const roleCorrections = pack.role_corrections ?? [];
const survivorIds = approvedGroups.map((group) => group.survivor_family_id);
const voidIds = approvedGroups.flatMap((group) =>
  (group.void_families ?? []).map((family) => family.family_id),
);
const approvedIds = [...survivorIds, ...voidIds];
const excludedIds = pack.excluded_groups.flatMap((group) => group.candidate_family_ids);
const deletedIds = pack.deleted_family_advisories.map((advisory) => advisory.family_id);
const survivorSet = new Set(survivorIds);

requireEqual("approved group count", approvedGroups.length, 21);
requireEqual("approved family count", approvedIds.length, 57);
requireEqual("survivor family count", survivorIds.length, 21);
requireEqual("void family count", voidIds.length, 36);
requireEqual("unique approved family count", unique(approvedIds).size, 57);
requireEqual("survivor-void overlap", overlap(survivorIds, voidIds).length, 0);
requireEqual("excluded group count", pack.excluded_groups.length, 1);
requireEqual("excluded family count", excludedIds.length, 3);
requireEqual("deleted family advisory count", deletedIds.length, 1);
requireEqual("excluded executable overlap", overlap(approvedIds, excludedIds).length, 0);
requireEqual("deleted executable overlap", overlap(approvedIds, deletedIds).length, 0);
requireEqual("role correction count", roleCorrections.length, 36);
requireEqual("role correction group count", unique(roleCorrections.map((row) => row.safe_group_ref)).size, 8);
requireEqual("role correction family count", unique(roleCorrections.map((row) => row.family_id)).size, 18);
requireEqual("role correction membership count", unique(roleCorrections.map((row) => row.membership_id)).size, 36);
requireEqual("role correction person count", unique(roleCorrections.map((row) => row.person_id)).size, 16);
requireEqual("survivor role correction count", roleCorrections.filter((row) => survivorSet.has(row.family_id)).length, 16);
requireEqual("void role correction count", roleCorrections.filter((row) => !survivorSet.has(row.family_id)).length, 20);
requireTrue(
  "all role corrections are biological father/mother transitions",
  roleCorrections.every(
    (row) =>
      row.relationship_type === "biological" &&
      ["father", "mother"].includes(row.target_role) &&
      row.expected_current_role !== row.target_role &&
      row.owner_confirmed === true &&
      row.executed === false,
  ),
);
requireTrue("production names absent from pack", pack.integrity?.production_names_present === false);
requireTrue("automatic execution disabled", pack.integrity?.automatic_execution_enabled === false);

for (const token of [
  "A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "NO_SEED_DATA",
  "ACTIVE_RUNTIME_CALLER_COUNT=0",
  "create or replace function public.execute_admin_a17q_legacy_family_reconciliation",
  "returns jsonb",
  "language plpgsql",
  "security invoker",
  "set search_path = public, auth, pg_temp",
  "auth.uid() is null",
  "public.current_profile_id()",
  "public.has_permission('relationships.update')",
  "public.has_permission('permissions.manage')",
  "pg_try_advisory_xact_lock",
  "A17Q_TX1_CONCURRENT_EXECUTION_REJECTED",
  "A17Q_TX1_DECISION_PACK_HASH_MISMATCH",
  "A17Q_TX1_PRECONDITION_DRIFT_DETECTED",
  "create temporary table a17q_approved_groups",
  "create temporary table a17q_approved_families",
  "create temporary table a17q_role_corrections",
  "create temporary table a17q_excluded_families",
  "create temporary table a17q_deleted_family_advisory",
  "for update",
  "DRY_RUN_NOT_CONSUMED",
  "insert into public.family_reconciliation_rollback_manifests",
  "insert into public.family_reconciliation_batches",
  "insert into public.revisions",
  "update public.family_parents",
  "update public.family_children",
  "update public.families",
  "ROLE_CORRECTION_SUPERSEDED_BY_MEMBERSHIP_DEACTIVATION",
  "role_correction_superseded_by_void_count",
  "child_membership_move_count",
  "parent_membership_deactivation_count",
  "graph_validation_passed",
  "excluded_scope_unchanged",
  "deleted_family_unchanged",
  "revoke execute on function public.execute_admin_a17q_legacy_family_reconciliation",
  ") from public",
  ") from anon",
  ") to authenticated",
  expected.ownerMarker,
  expected.decisionPackSha,
  expected.approvedGroupSha,
  expected.roleCorrectionSha,
  expected.excludedScopeSha,
  expected.forecastSha,
  expected.excludedGroupRef,
  expected.deletedFamilyId,
  expected.deletedSafeFamilyRef,
]) {
  requireIncludes(migration, token, `migration token ${token}`);
}

rejectPattern(migration, /\bsecurity\s+definer\b/i, "SECURITY DEFINER");
rejectPattern(migration, /\bservice_role\b/i, "service role dependency");
rejectPattern(migration, /\bcreate\s+trigger\b/i, "trigger");
rejectPattern(migration, /\btruncate\b/i, "TRUNCATE");
rejectPattern(migration, /\bdelete\s+from\b/i, "DELETE FROM");
rejectPattern(migration, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "old official import RPC call");
rejectPattern(migration, /\ba17o_tx_execute_grouped_giapha4_official_import\s*\(/i, "grouped import RPC call");
rejectPattern(
  migration,
  /\b(select|call)\s+public\.execute_admin_a17q_legacy_family_reconciliation\s*\(/i,
  "candidate RPC invocation",
);

for (const id of approvedIds) requireIncludes(migration, id, `approved family id ${id}`);
for (const id of roleCorrections.map((row) => row.membership_id)) {
  requireIncludes(migration, id, `role membership id ${id}`);
}
for (const id of roleCorrections.map((row) => row.person_id)) {
  requireIncludes(migration, id, `role person id ${id}`);
}
for (const ref of approvedGroups.map((group) => group.safe_group_ref)) {
  requireIncludes(migration, ref, `safe group ref ${ref}`);
}
for (const id of excludedIds) requireIncludes(migration, id, `excluded family id ${id}`);
for (const id of deletedIds) requireIncludes(migration, id, `deleted advisory id ${id}`);

for (const token of [
  "A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_EXECUTOR_CANDIDATE_SELECT_ONLY_VERIFIER",
  "a17q_tx1_function_exists",
  "a17q_tx1_exact_signature",
  "a17q_tx1_return_type_jsonb",
  "a17q_tx1_volatility_volatile",
  "a17q_tx1_security_invoker",
  "a17q_tx1_fixed_search_path",
  "a17q_tx1_no_public_execute",
  "a17q_tx1_no_anon_execute",
  "a17q_tx1_authenticated_execute_grant",
  "a17q_tx1_decision_pack_hash_embedded",
  "a17q_tx1_approved_group_hash_embedded",
  "a17q_tx1_role_correction_hash_embedded",
  "a17q_tx1_excluded_scope_hash_embedded",
  "a17q_tx1_forecast_hash_embedded",
  "a17q_tx1_excluded_group_guard_embedded",
  "a17q_tx1_deleted_family_guard_embedded",
  "a17q_tx1_advisory_lock_present",
  "a17q_tx1_row_locking_present",
  "a17q_tx1_completed_batch_count",
]) {
  requireIncludes(verifier, token, `verifier token ${token}`);
}
rejectPattern(
  verifierWithoutComments,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "verifier must be SELECT-only",
);
rejectPattern(
  verifierWithoutComments,
  /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i,
  "verifier must not call executor",
);
rejectPattern(verifierWithoutCommentsOrStrings, /\bfor\s+update\b/i, "verifier must not lock rows");

const baseFixture = {
  groups: [
    { survivor: "s1", voids: ["v1"] },
    { survivor: "s2", voids: ["v2", "v3", "v4", "v5", "v6", "v7", "v8"] },
  ],
  children: [
    { childId: "c1", fromVoid: false },
    { childId: "c2", fromVoid: true },
    { childId: "c3", fromVoid: true },
  ],
  expectedChildren: 3,
  roleCorrections: [
    { current: "father", expectedCurrent: "father", onSurvivor: true },
    { current: "mother", expectedCurrent: "mother", onSurvivor: false },
  ],
};
assertCase("two-parent merge succeeds", simulatePlan(baseFixture).ok);
assertCase("eight-candidate group voids seven", simulatePlan(baseFixture).voidCount === 8);
assertCase("child moves without loss", simulatePlan(baseFixture).childMoveCount === 2);
assertCase(
  "duplicate child blocks",
  simulatePlan({ ...baseFixture, children: [{ childId: "c1" }, { childId: "c1" }], expectedChildren: 2 }).code ===
    "DUPLICATE_CHILD",
);
assertCase(
  "missing child blocks",
  simulatePlan({ ...baseFixture, children: [{ childId: "c1" }], expectedChildren: 2 }).code ===
    "MISSING_CHILD",
);
assertCase("unexpected parent blocks", simulatePlan({ ...baseFixture, unexpectedParent: true }).code === "UNEXPECTED_PARENT");
assertCase(
  "changed family status blocks",
  simulatePlan({ ...baseFixture, changedFamilyStatus: true }).code === "CHANGED_FAMILY_STATUS",
);
assertCase(
  "unexpected layout reference blocks",
  simulatePlan({ ...baseFixture, layoutReference: true }).code === "UNEXPECTED_LAYOUT_REFERENCE",
);
assertCase(
  "survivor void overlap blocks",
  simulatePlan({ ...baseFixture, groups: [{ survivor: "s1", voids: ["s1"] }] }).code ===
    "FAMILY_OVERLAP",
);
assertCase(
  "excluded family blocks",
  simulatePlan({ ...baseFixture, groups: [{ survivor: expected.excludedFamilyIds[0], voids: [] }] }).code ===
    "EXCLUDED_FAMILY_IN_PLAN",
);
assertCase(
  "deleted family blocks",
  simulatePlan({ ...baseFixture, groups: [{ survivor: expected.deletedFamilyId, voids: [] }] }).code ===
    "DELETED_FAMILY_IN_PLAN",
);
assertCase(
  "incorrect current role blocks",
  simulatePlan({
    ...baseFixture,
    roleCorrections: [{ current: "mother", expectedCurrent: "father", onSurvivor: true }],
  }).code === "INCORRECT_CURRENT_ROLE",
);
assertCase("survivor role correction applies", simulatePlan(baseFixture).survivorRoleCorrections === 1);
assertCase("void role correction superseded", simulatePlan(baseFixture).supersededRoleCorrections === 1);
assertCase("dry-run no mutation token", migration.includes("'mutation_applied', p_dry_run_only is not true"));
assertCase("same idempotency key locks batch", migration.includes("batch_lock.idempotency_key"));
assertCase("different hash blocks", migration.includes("A17Q_TX1_DECISION_PACK_HASH_MISMATCH"));
assertCase("second decision pack execution blocks", migration.includes("DECISION_PACK_ALREADY_RUNNING_OR_COMPLETED"));
assertCase("rollback covers families", migration.includes("affected_family_records_before"));
assertCase("rollback covers parent memberships", migration.includes("parent_memberships_before"));
assertCase("rollback covers child memberships", migration.includes("child_memberships_before"));
assertCase("graph validation failure rolls back through exception", migration.includes("A17Q_TX1_PRECONDITION_DRIFT_DETECTED"));
assertCase("people rows are not updated", !/\bupdate\s+public\.people\b/i.test(migration));

const runtimeFiles = listFiles(".");
const runtimeCallers = runtimeFiles.filter((file) => {
  if (file === checkerPath) return false;
  const content = read(file);
  return content.includes("execute_admin_a17q_legacy_family_reconciliation");
});
requireEqual("active runtime caller count", runtimeCallers.length, 0);

for (const token of [
  "A17Q_TX1_STATUS=PASS_TRANSACTION_EXECUTOR_CANDIDATE_CREATED_NOT_APPLIED",
  `MIGRATION_FILE=${dbMigrationPath}`,
  "SUPABASE_MIRROR_FILE=supabase/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
  "RPC_NAME=public.execute_admin_a17q_legacy_family_reconciliation",
  "RPC_RETURN_TYPE=jsonb",
  "RPC_SECURITY_MODE=SECURITY_INVOKER",
  "RPC_SEARCH_PATH=public, auth, pg_temp",
  "DECISION_PACK_SHA256_EMBEDDED=YES",
  "APPROVED_GROUP_COUNT=21",
  "APPROVED_CANDIDATE_FAMILY_COUNT=57",
  "SURVIVOR_FAMILY_COUNT=21",
  "VOID_FAMILY_COUNT=36",
  "CHILD_MEMBERSHIP_MOVE_COUNT=36",
  "PARENT_MEMBERSHIP_DEACTIVATION_COUNT=72",
  "ROLE_CORRECTION_PLAN_COUNT=36",
  "ROLE_CORRECTION_APPLIED_TO_SURVIVORS_COUNT=16",
  "ROLE_CORRECTION_SUPERSEDED_BY_VOID_COUNT=20",
  "EXCLUDED_SCOPE_EXECUTABLE=NO",
  "DELETED_FAMILY_EXECUTABLE=NO",
  "DRY_RUN_SUPPORTED=YES",
  "ROLLBACK_MANIFEST_SUPPORTED=YES",
  "IDEMPOTENCY_SUPPORTED=YES",
  "ADVISORY_LOCK_SUPPORTED=YES",
  "ROW_LOCKING_SUPPORTED=YES",
  "GRAPH_VALIDATION_SUPPORTED=YES",
  "FAIL_CLOSED_PRECONDITIONS=YES",
  "RECONCILIATION_EXECUTION_AUTHORIZED=NO",
  "MIGRATION_APPLY_AUTHORIZED=NO",
  "PRODUCTION_DRY_RUN_AUTHORIZED=NO",
  "PRODUCTION_EXECUTION_AUTHORIZED=NO",
  "SQL_EXECUTED=NO",
  "PRODUCTION_QUERIED=NO",
  "RPC_CALLED=NO",
  "DATABASE_MUTATION=NO",
  "RECONCILIATION_EXECUTED=NO",
  "RUNTIME_CHANGED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

requireIncludes(index, "PLAN_A17Q_TX1_LEGACY_FAMILY_RECONCILIATION_TRANSACTION_EXECUTOR_CANDIDATE.md");
requireIncludes(workLog, "A17Q_TX1_STATUS=PASS_TRANSACTION_EXECUTOR_CANDIDATE_CREATED_NOT_APPLIED");
requireIncludes(decisionLog, "A-17Q-TX1");
requireIncludes(handoff, "A17Q_TX1_STATUS=PASS_TRANSACTION_EXECUTOR_CANDIDATE_CREATED_NOT_APPLIED");
requireEqual(
  "package script",
  packageJson?.scripts?.["check:a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate"],
  "node scripts/check-a17q-tx1-legacy-family-reconciliation-transaction-executor-candidate.cjs",
);

const status = git(["status", "--short"]);
rejectPattern(status, /(^|\n)\?\? scripts\/\.tmp-/i, "temporary generator left in worktree");

console.log("A-17Q-TX1 legacy family reconciliation transaction executor candidate check");
console.log(`DB_MIGRATION_SHA256=${sha256Hex(dbMigrationPath)}`);
console.log(`SUPABASE_MIRROR_SHA256=${sha256Hex(supabaseMigrationPath)}`);
console.log(`MIRROR_MATCH=${migration === mirror ? "YES" : "NO"}`);

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

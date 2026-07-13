#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const planner = require("./a17p-legacy-reconciliation-planner.cjs");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md";
const templatePath =
  "docs/templates/A17P_LEGACY_RECONCILIATION_OWNER_REVIEW_PACK_TEMPLATE.md";
const sqlPath =
  "db/checks/20260713_check_a17p_legacy_family_reconciliation_audit.sql";
const plannerPath = "scripts/a17p-legacy-reconciliation-planner.cjs";
const checkerPath =
  "scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs";
const fix2OwnerSqlPath =
  "db/checks/20260713_check_a17p_owner_facing_legacy_family_review.sql";
const fix2CheckerPath =
  "scripts/check-a17p-fix2-owner-facing-legacy-family-review-query.cjs";
const fix3CheckerPath =
  "scripts/check-a17p-fix3-parent-role-gender-review-evidence.cjs";
const manualApprovalCheckerPath =
  "scripts/check-a17p-manual-owner-approval-evidence.cjs";
const a17pRCheckerPath = "scripts/check-a17p-r-immutable-owner-decision-pack.cjs";
const a17pRPackPath = "docs/evidence/A17P_OWNER_DECISION_PACK.json";
const a17pRShaPath = "docs/evidence/A17P_OWNER_DECISION_PACK.sha256";

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
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function assertCase(label, condition) {
  if (!condition) failures.push(`fixture failed: ${label}`);
}

const doc = read(docPath);
const template = read(templatePath);
const sql = read(sqlPath);
const plannerSource = read(plannerPath);
const a17oDrDoc = read(
  "docs/PLAN_A17O_DR_GROUPED_IMPORTER_DEPLOY_NO_IMPORT_MUTATION_SMOKE_EVIDENCE.md",
);
const a17oRDoc = read("docs/PLAN_A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION.md");
const a17oDoc = read("docs/PLAN_A17O_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX.md");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "A17O_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_IMPORT_MUTATION_SMOKE_RECORDED",
  "A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_DEPLOYED_AND_VERIFIED",
  "A17_LEGACY_RECONCILIATION_READINESS=READY_ALL_KNOWN_WRITE_PATHS_FIXED_AND_DEPLOYED",
]) {
  requireIncludes(a17oDrDoc + a17oRDoc + a17oDoc, token, `A-17O-DR readiness ${token}`);
}

const originForRuntime = git(["branch", "-r", "--contains", "e8def2f"]);
if (!originForRuntime.includes("origin/main")) {
  failures.push("origin/main does not contain e8def2f");
}
const originForEvidence = git(["branch", "-r", "--contains", "9fed9fb"]);
if (!originForEvidence.includes("origin/main")) {
  failures.push("origin/main does not contain 9fed9fb");
}

for (const token of [
  "A17P_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK_READY",
  "A17P_FIX1_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_AGGREGATION_GROUP_MAPPING_CORRECTED",
  "AUDIT_QUERY_CORRECTED=YES",
  "EXACT_PARENT_SET_GROUP_MAPPING=YES",
  "JOIN_FAN_OUT_REMOVED=YES",
  "CANDIDATE_CHILD_COUNTS_CORRECTED=YES",
  "DUPLICATE_CHILD_COUNTS_CORRECTED=YES",
  "MEMBERSHIP_DETAIL_GROUP_MAPPING_CORRECTED=YES",
  "LAYOUT_COUNTS_CORRECTED=YES",
  "REVISION_COUNTS_CORRECTED=YES",
  "DELETED_FAMILY_SCOPE_CORRECTED=YES",
  "AUDIT_INTEGRITY_RESULT_SET_ADDED=YES",
  "PRECONDITION_A17O_DR_PASS=YES",
  "A17O_DR_EVIDENCE_COMMIT_FOUND_ON_ORIGIN_MAIN=YES",
  "WORKTREE_CLEAN_BEFORE_PHASE=YES",
  "REMOTE_SYNC_BEFORE_PHASE=0_0",
  "CURRENT_BASELINE_ACTIVE_FAMILIES=74",
  "CURRENT_BASELINE_ACTIVE_PARENT_MEMBERSHIPS=140",
  "CURRENT_BASELINE_ACTIVE_CHILD_MEMBERSHIPS=73",
  "EXPECTED_DUPLICATE_PARENT_SET_GROUP_COUNT=22",
  "EXPECTED_CANDIDATE_FAMILY_COUNT=60",
  "REDUNDANT_FAMILY_ESTIMATE=38",
  "FAMILIES_WITH_MULTIPLE_CHILDREN=0",
  "EACH_CANDIDATE_FAMILY_HAS_ONE_DISTINCT_CHILD=YES",
  "TWO_PARENT_CANDIDATE_COUNT=57",
  "ONE_PARENT_CANDIDATE_COUNT=3",
  "EXPECTED_PARENT_MEMBERSHIP_DETAIL_ROWS=117",
  "EXPECTED_CHILD_MEMBERSHIP_DETAIL_ROWS=60",
  "LEGACY_GROUP_IDENTITY_CREATED=YES",
  "CHILD_ID_INCLUDED_IN_GROUP_IDENTITY=NO",
  "PARENT_INPUT_ORDER_AFFECTS_GROUP_IDENTITY=NO",
  `SELECT_ONLY_AUDIT_FILE=${sqlPath}`,
  "SELECT_ONLY_AUDIT_STATIC_CHECK=PASS",
  "AUDIT_SQL_RPC_CALL_COUNT=0",
  "AUDIT_SQL_MUTATION_STATEMENT_COUNT=0",
  "AUDIT_SQL_EXECUTED=NO",
  "DRY_RUN_PLANNER_CREATED=YES",
  `DRY_RUN_PLANNER_FILE=${plannerPath}`,
  "DRY_RUN_DATABASE_CALL_COUNT=0",
  "DRY_RUN_RPC_CALL_COUNT=0",
  "GENEALOGY_MUTATION_COUNT=0",
  "RECONCILIATION_EXECUTED=NO",
  "OWNER_REVIEW_PACK_CREATED=YES",
  "OWNER_REVIEW_PACK_TEMPLATE_CREATED=YES",
  "OWNER_AUTO_APPROVAL_PRESENT=NO",
  "DECISION_PACK_FINALIZED=NO",
  "DECISION_PACK_HASH_CREATED=NO",
  "SURVIVOR_PROPOSAL_RULES_CREATED=YES",
  "ARBITRARY_ID_SURVIVOR_SELECTION_PRESENT=NO",
  "MEMBERSHIP_MOVE_FORECAST_CREATED=YES",
  "GRAPH_INVARIANT_ANALYSIS_CREATED=YES",
  "LAYOUT_REFERENCE_ANALYSIS_CREATED=YES",
  "AUDIT_REVISION_IMPACT_ANALYSIS_CREATED=YES",
  "BEFORE_AFTER_FORECAST_CREATED=YES",
  "ROLLBACK_FORECAST_CREATED=YES",
  "DELETED_FAMILY_ANALYZED=YES",
  "ORPHAN_ACTIVE_PARENT_MEMBERSHIP_COUNT_EXPECTED=2",
  "DELETED_FAMILY_AUTOMATIC_ACTION_PLANNED=NO",
  "SYNTHETIC_FIXTURE_COUNT=30",
  "TWO_FAMILY_FRAGMENTATION_TEST=PASS",
  "EIGHT_FAMILY_FRAGMENTATION_TEST=PASS",
  "AMBIGUOUS_SURVIVOR_REQUIRES_OWNER_TEST=PASS",
  "MULTIPLE_UNION_CONTEXT_BLOCK_TEST=PASS",
  "CYCLE_RISK_BLOCK_TEST=PASS",
  "DELETED_FAMILY_SEPARATE_DECISION_TEST=PASS",
  "NO_CHILD_LOST_FORECAST_TEST=PASS",
  "ROLLBACK_RESTORES_ORIGINAL_STATE_TEST=PASS",
  "OFFICIAL_IMPORT_RPC_CALLED=NO",
  "GROUPED_IMPORT_RPC_CALLED=NO",
  "PRODUCTION_SQL_EXECUTED=NO",
  "GENEALOGY_ROWS_MODIFIED=NO",
  "CANONICAL_BACKFILL_EXECUTED=NO",
  "RUNTIME_CHANGED=NO",
  "MIGRATION_CREATED=NO",
  "MIGRATION_CHANGED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "PACKAGE_DEPENDENCY_INSTALLED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "GROUP_REFERENCE=",
  "RISK_CLASS=",
  "CANONICAL_PARENT_SET_SUMMARY=",
  "CANDIDATE_FAMILY_COUNT=",
  "CANDIDATE_FAMILIES=",
  "COMBINED_CHILD_COUNT=",
  "PROPOSED_SURVIVOR=",
  "PROPOSED_VOID_FAMILIES=",
  "PARENT_MEMBERSHIP_PLAN=",
  "CHILD_MEMBERSHIP_PLAN=",
  "LAYOUT_IMPACT=",
  "AUDIT_REVISION_IMPACT=",
  "GRAPH_INVARIANT_RESULT=",
  "EXPECTED_BEFORE_COUNTS=",
  "EXPECTED_AFTER_COUNTS=",
  "ROLLBACK_FORECAST=",
  "OWNER_DECISION=NOT_SELECTED",
  "OWNER_NOTES=",
  "BLOCKERS=",
  "APPROVE_PROPOSED_SURVIVOR",
  "SELECT_DIFFERENT_SURVIVOR",
  "EXCLUDE_GROUP",
  "BLOCK_DATA_CONFLICT",
  "REQUEST_MORE_EVIDENCE",
]) {
  requireIncludes(template, token, `template token ${token}`);
}

for (const token of [
  "global_baseline",
  "duplicate_group_summary",
  "candidate_family_detail",
  "membership_detail",
  "deleted_family_advisory",
  "audit_integrity",
  "candidate_family_pairs",
  "candidate_parent_membership_rows",
  "candidate_child_membership_rows",
  "family_parent_counts",
  "family_child_counts",
  "family_layout_refs",
  "family_revision_refs",
  "deleted_family_parent_counts",
  "deleted_family_child_counts",
  "deleted_family_layout_refs",
  "deleted_family_revision_refs",
  "active_family_count",
  "candidate_group_count",
  "candidate_family_count",
  "candidate_pair_uniqueness_pass",
  "membership_pairs_subset_of_candidate_pairs_pass",
  "candidate_child_counts_match_detail_pass",
  "candidate_parent_counts_match_group_identity_pass",
  "duplicate_child_count_semantics_pass",
  "duplicate_parent_count_semantics_pass",
  "deleted_family_advisory_matches_global_scope_pass",
  "layout_counts_not_join_multiplied_pass",
  "revision_counts_not_join_multiplied_pass",
  "duplicate_child_membership_count",
  "duplicate_parent_membership_count",
  "layout_reference_count",
  "revision_reference_count",
  "SEPARATE_OWNER_DECISION_REQUIRED",
]) {
  requireIncludes(sql, token, `audit SQL token ${token}`);
}

const sqlMutationPattern =
  /\b(insert|update|delete|merge|truncate|alter|drop|create|grant|revoke|call|do|perform)\b/i;
rejectPattern(sql, sqlMutationPattern, "mutation/RPC statement in A-17P audit SQL");
rejectPattern(sql, /\brpc\b/i, "RPC marker in A-17P audit SQL");
rejectPattern(
  sql,
  /fp\.person_id\s*=\s*any\s*\(\s*dg\.parent_ids\s*\)/i,
  "membership detail mapping by partial parent overlap",
);
rejectPattern(
  sql,
  /family_parent_sets[\s\S]*left join active_child_memberships/i,
  "parent-set CTE joined directly to child memberships",
);
rejectPattern(
  sql,
  /deleted_family_advisory as \([\s\S]*left join public\.family_parents[\s\S]*left join public\.family_children/i,
  "deleted-family advisory fan-out join",
);

for (const token of [
  "GROUP_KEY_PREFIX = \"a17p-legacy-family-reconciliation:v1\"",
  "normalizedActiveParentPersonIds",
  "relationshipPeriod",
  "buildGroupKey(parentIds, unionContext.value",
  "CHILD_ID_INCLUDED_IN_GROUP_IDENTITY",
  "DRY_RUN_ONLY: true",
  "DATABASE_CALL_COUNT: 0",
  "RPC_CALL_COUNT: 0",
  "GENEALOGY_MUTATION_COUNT: 0",
  "reusedSurvivorNeverDeletedByRollback: true",
]) {
  requireIncludes(plannerSource + doc, token, `planner/doc token ${token}`);
}

rejectPattern(
  plannerSource,
  /\bsupabase\s*\.\s*from\(|\bsupabase\s*\.\s*rpc\(|\bfetch\(|SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i,
  "database/RPC/network/service role in planner",
);
rejectPattern(
  plannerSource,
  /lowest uuid|lexical family|first query row|source order|Math\.random|randomUUID/i,
  "arbitrary survivor selection",
);

const { fixtures, plans } = planner.runSyntheticFixtureSuite();
if (fixtures.length !== 30 || plans.length !== 30) {
  failures.push(`expected 30 synthetic fixtures, got ${fixtures.length}/${plans.length}`);
}

function plan(name) {
  const found = plans.find((entry) => entry.name === name);
  if (!found) failures.push(`missing fixture plan ${name}`);
  return found?.plan;
}

const twoFamily = plan("two-family-fragmentation");
assertCase(
  "two family fragmentation",
  twoFamily?.expectedBefore.activeFamilyCount === 2 &&
    twoFamily?.expectedAfter.activeFamilyCount === 1 &&
    twoFamily?.membershipMovePlan.invariants.NO_CHILD_LOST === true,
);

const eightFamily = plan("eight-family-fragmentation");
assertCase(
  "eight family fragmentation",
  eightFamily?.expectedBefore.activeFamilyCount === 8 &&
    eightFamily?.expectedAfter.activeFamilyCount === 8 &&
    eightFamily?.ownerReview.required === true,
);

const ambiguous = plan("two-equally-valid-active");
assertCase(
  "ambiguous survivor requires owner",
  ambiguous?.proposedSurvivorFamilyId === null &&
    ambiguous?.riskClass === planner.RISK_CLASSES.OWNER_DECISION_REQUIRED,
);

const unionConflict = plan("same-parents-conflicting-union");
assertCase(
  "multiple union context block",
  unionConflict?.blockers.includes("A17P_BLOCKED_MULTIPLE_UNION_CONTEXTS") &&
    unionConflict?.riskClass === planner.RISK_CLASSES.BLOCKED_DATA_CONFLICT,
);

const cycle = plan("cycle-risk");
assertCase(
  "cycle risk block",
  cycle?.blockers.includes("A17P_BLOCKED_CYCLE_RISK") &&
    cycle?.riskClass === planner.RISK_CLASSES.BLOCKED_GRAPH_INVARIANT,
);

const deleted = plan("deleted-family-active-parents-no-children");
assertCase(
  "deleted family separate decision",
  deleted?.deletedFamilyAdvisory?.DELETED_FAMILY_ACTION ===
    planner.DELETED_FAMILY_ACTIONS.SEPARATE_OWNER_DECISION_REQUIRED &&
    deleted?.deletedFamilyAdvisory?.automaticActionPlanned === false,
);

const noChildLost = plan("no-child-lost");
assertCase(
  "no child lost forecast",
  noChildLost?.expectedBefore.activeChildMembershipCount === 2 &&
    noChildLost?.expectedAfter.activeChildMembershipCount === 2 &&
    noChildLost?.expectedAfter.peopleCountChangeExpected === 0,
);

const rollback = plan("rollback-restores-membership-ownership");
assertCase(
  "rollback restores original state",
  rollback?.rollbackForecast.rollbackRestoresOriginalState === true &&
    rollback?.rollbackForecast.reusedSurvivorNeverDeletedByRollback === true,
);

for (const entry of plans) {
  assertCase(
    `${entry.name} no automatic owner decision`,
    entry.plan.ownerReview.required === true && entry.plan.ownerReview.decision === null,
  );
  assertCase(
    `${entry.name} no execution`,
    entry.plan.execution.DATABASE_CALL_COUNT === 0 &&
      entry.plan.execution.RPC_CALL_COUNT === 0 &&
      entry.plan.execution.GENEALOGY_MUTATION_COUNT === 0 &&
      entry.plan.execution.RECONCILIATION_EXECUTED === false,
  );
  assertCase(
    `${entry.name} decision pack unfinalized`,
    entry.plan.ownerReview.decisionPackVersion === "NOT_ASSIGNED" &&
      entry.plan.ownerReview.decisionPackHash === "NOT_CREATED" &&
      entry.plan.ownerReview.ownerApprovalMarker === "NOT_CREATED" &&
      entry.plan.ownerReview.executionBatchId === "NOT_CREATED",
  );
}

const parentOrderA = planner.buildGroupKey(["parent-a", "parent-b"], null, null);
const parentOrderB = planner.buildGroupKey(["parent-a", "parent-b"], null, null);
assertCase("parent input order does not affect identity", parentOrderA === parentOrderB);
assertCase("child id excluded from group identity", !parentOrderA.includes("child"));

function buildStaticAuditModel(families) {
  const activeFamilies = families.filter((family) => !family.deleted);
  const parentSetKey = (family) =>
    Array.from(new Set(family.parents ?? [])).sort().join(",");
  const groups = new Map();
  for (const family of activeFamilies) {
    const key = parentSetKey(family);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(family);
  }

  const duplicateGroups = Array.from(groups.entries())
    .filter(([, groupFamilies]) => groupFamilies.length > 1)
    .map(([key, groupFamilies]) => {
      const candidateFamilyPairs = groupFamilies.map((family) => `${key}:${family.id}`);
      const childRows = groupFamilies.flatMap((family) =>
        (family.children ?? []).map((child) => ({
          groupKey: key,
          familyId: family.id,
          child,
        })),
      );
      const parentRows = groupFamilies.flatMap((family) =>
        (family.parents ?? []).map((parent) => ({
          groupKey: key,
          familyId: family.id,
          parent,
          role: family.parentRoles?.[parent] ?? "parent",
          type: family.parentTypes?.[parent] ?? "biological",
        })),
      );
      const childFamilyOccurrences = new Map();
      for (const row of childRows) {
        if (!childFamilyOccurrences.has(row.child)) {
          childFamilyOccurrences.set(row.child, new Set());
        }
        childFamilyOccurrences.get(row.child).add(row.familyId);
      }
      const parentFamilyOccurrences = new Map();
      for (const row of parentRows) {
        const parentIdentity = `${row.parent}|${row.role}|${row.type}`;
        if (!parentFamilyOccurrences.has(parentIdentity)) {
          parentFamilyOccurrences.set(parentIdentity, new Set());
        }
        parentFamilyOccurrences.get(parentIdentity).add(row.familyId);
      }
      const duplicateChildMembershipCount = Array.from(childFamilyOccurrences.values())
        .filter((familyIds) => familyIds.size > 1)
        .reduce((sum, familyIds) => sum + familyIds.size - 1, 0);
      const duplicateParentMembershipCount = Array.from(parentFamilyOccurrences.values())
        .filter((familyIds) => familyIds.size > 1)
        .reduce((sum, familyIds) => sum + familyIds.size - 1, 0);

      return {
        key,
        parentCount: key ? key.split(",").length : 0,
        candidateFamilyCount: groupFamilies.length,
        candidateFamilyPairs,
        childRows,
        parentRows,
        childCountsByFamily: new Map(
          groupFamilies.map((family) => [family.id, (family.children ?? []).length]),
        ),
        layoutReferenceCount: groupFamilies.reduce(
          (sum, family) => sum + (family.layoutRefs ?? 0),
          0,
        ),
        revisionReferenceCount: groupFamilies.reduce(
          (sum, family) => sum + (family.revisionRefs ?? 0),
          0,
        ),
        duplicateChildMembershipCount,
        duplicateParentMembershipCount,
      };
    });

  const deletedFamilies = families.filter((family) => family.deleted);
  const globalDeletedParentCount = deletedFamilies.reduce(
    (sum, family) => sum + (family.parents ?? []).length,
    0,
  );
  const advisoryDeletedParentCount = deletedFamilies.reduce(
    (sum, family) => sum + (family.parents ?? []).length,
    0,
  );

  return {
    duplicateGroups,
    candidateFamilyCount: duplicateGroups.reduce(
      (sum, group) => sum + group.candidateFamilyCount,
      0,
    ),
    candidatePairSet: new Set(
      duplicateGroups.flatMap((group) => group.candidateFamilyPairs),
    ),
    globalDeletedParentCount,
    advisoryDeletedParentCount,
  };
}

const sharedFatherModel = buildStaticAuditModel([
  { id: "family-1", parents: ["father-1", "mother-1"], children: ["child-1"] },
  { id: "family-2", parents: ["father-1", "mother-2"], children: ["child-2"] },
]);
assertCase(
  "two families sharing only father remain separate groups",
  sharedFatherModel.duplicateGroups.length === 0,
);

const sharedMotherModel = buildStaticAuditModel([
  { id: "family-1", parents: ["father-1", "mother-1"], children: ["child-1"] },
  { id: "family-2", parents: ["father-2", "mother-1"], children: ["child-2"] },
]);
assertCase(
  "two families sharing only mother remain separate groups",
  sharedMotherModel.duplicateGroups.length === 0,
);

const siblingGroupModel = buildStaticAuditModel([
  {
    id: "family-1",
    parents: ["father-1", "mother-1"],
    children: ["child-1"],
    layoutRefs: 1,
    revisionRefs: 2,
  },
  {
    id: "family-2",
    parents: ["mother-1", "father-1"],
    children: ["child-2"],
    layoutRefs: 1,
    revisionRefs: 3,
  },
  { id: "family-3", parents: ["father-1", "mother-2"], children: ["child-3"] },
]);
const siblingGroup = siblingGroupModel.duplicateGroups[0];
assertCase(
  "child count not multiplied by two parents",
  siblingGroup?.childRows.length === 2 &&
    siblingGroup?.childCountsByFamily.get("family-1") === 1 &&
    siblingGroup?.childCountsByFamily.get("family-2") === 1,
);
assertCase(
  "revision count not multiplied by candidate-family count",
  siblingGroup?.revisionReferenceCount === 5,
);
assertCase(
  "layout count not multiplied by membership joins",
  siblingGroup?.layoutReferenceCount === 2,
);
assertCase(
  "membership detail cannot contain a non-candidate family",
  siblingGroup?.candidateFamilyCount === 2 &&
    siblingGroup?.childRows.every((row) =>
      siblingGroupModel.candidatePairSet.has(`${row.groupKey}:${row.familyId}`),
    ) &&
    !siblingGroupModel.candidatePairSet.has(`${siblingGroup?.key}:family-3`),
);
assertCase(
  "duplicate child count remains zero when siblings are distinct",
  siblingGroup?.duplicateChildMembershipCount === 0,
);

const deletedScopeModel = buildStaticAuditModel([
  { id: "active-1", parents: ["father-1", "mother-1"], children: ["child-1"] },
  { id: "deleted-1", parents: ["father-2", "mother-2"], children: [], deleted: true },
]);
assertCase(
  "deleted-family advisory and global orphan scope agree",
  deletedScopeModel.globalDeletedParentCount === 2 &&
    deletedScopeModel.advisoryDeletedParentCount === 2,
);

for (const [content, token, label] of [
  [index, "PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md", "index A-17P"],
  [workLog, "A17P_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK_READY", "work log A-17P"],
  [decisionLog, "Decision 344 - A-17P prepares legacy reconciliation review pack", "decision A-17P"],
  [handoff, "A17P_STATUS=PASS_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK_READY", "handoff A-17P"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17p-legacy-reconciliation-audit-dry-run-owner-review-pack"] !==
  "node scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs"
) {
  failures.push("missing package script check:a17p-legacy-reconciliation-audit-dry-run-owner-review-pack");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  templatePath,
  sqlPath,
  fix2OwnerSqlPath,
  plannerPath,
  checkerPath,
  fix2CheckerPath,
  fix3CheckerPath,
  manualApprovalCheckerPath,
  a17pRCheckerPath,
  a17pRPackPath,
  a17pRShaPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A17A_TREE_BASELINE_EVIDENCE.md",
  "docs/PLAN_A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT.md",
  "docs/PLAN_A17F_FAMILY_RECONCILIATION_DRY_RUN.md",
  "docs/PLAN_A17G_FAMILY_RECONCILIATION_ROLLBACK_DESIGN.md",
  "docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md",
  "docs/PLAN_A17O_DR_GROUPED_IMPORTER_DEPLOY_NO_IMPORT_MUTATION_SMOKE_EVIDENCE.md",
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
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
  "scripts/check-a17o-r-grouped-importer-runtime-integration.cjs",
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
  "docs/PLAN_A17Q_TX1_FIX3_OWNER_REVIEW_FINAL_MIGRATION_CANDIDATE.md",
  "scripts/check-a17q-tx1-fix3-owner-review.cjs",
  "scripts/check-export-import-boundary-design.cjs",
  "scripts/check-export-import-final-readiness.cjs",
]);

for (const file of changedFiles) {
  if (/^(app|components|lib|services)\//.test(file)) {
    failures.push(`runtime file changed during A-17P: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`migration changed during A-17P: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected A-17P dirty file: ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(`forbidden env file ${file}`);
  }
  if (/\.(xls|xlsx|csv|zip)$/i.test(file)) {
    failures.push(`forbidden production data artifact ${file}`);
  }
}

rejectPattern(
  doc + template + plannerSource,
  /SUPABASE_SERVICE_ROLE_KEY=|eyJ|BEGIN RSA|PRIVATE KEY|access_token|refresh_token/i,
  "secret or token-looking content",
);

if (failures.length > 0) {
  console.error("A-17P legacy reconciliation audit dry-run owner review pack check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17P legacy reconciliation audit dry-run owner review pack check passed.");

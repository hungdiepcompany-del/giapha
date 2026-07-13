#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const sourcePath = "lib/import/giapha4/canonical-family-grouping.ts";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const migration0022 =
  "db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql";
const a17oTx1DbMigration =
  "db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql";
const a17oTx1SupabaseMigration =
  "supabase/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql";
const docPath = "docs/PLAN_A17O_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX.md";
const checkerPath = "scripts/check-a17o-importer-canonical-family-grouping.cjs";

// A17O_TX1_GROUPED_EXECUTOR_CANDIDATE_PRESENT=YES
// check:a17o-tx1-grouped-official-import-transaction-executor-candidate

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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
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

function groupKey(parentFingerprints) {
  const normalized = Array.from(
    new Set(
      parentFingerprints
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    ),
  ).sort();
  const serialized = JSON.stringify({
    version: "a17o-import-family-group:v1",
    parentFingerprints: normalized,
  });
  return `a17o-import-family-group:v1:${crypto
    .createHash("sha256")
    .update(serialized)
    .digest("hex")}`;
}

function plan(relationships, legacyDuplicateGroupKeys = []) {
  const blockers = [];
  const childParents = new Map();
  let duplicateParentRowsDeduplicated = 0;

  for (const relationship of relationships) {
    if (relationship.relationshipType !== "parent_child") continue;
    const parent = String(relationship.sourcePersonFingerprint ?? "").trim();
    const child = String(relationship.relatedPersonFingerprint ?? "").trim();
    const ownerDecision = relationship.ownerDecision ?? "unresolved";
    if (
      relationship.ambiguityStatus !== "clear" ||
      ownerDecision === "hold" ||
      ownerDecision === "skip" ||
      !parent ||
      !child ||
      parent === child
    ) {
      blockers.push("A17O_AMBIGUOUS_PARENT_SET_FAILS_CLOSED");
      continue;
    }
    const parents = childParents.get(child) ?? new Set();
    if (parents.has(parent)) duplicateParentRowsDeduplicated += 1;
    parents.add(parent);
    childParents.set(child, parents);
  }

  const groups = new Map();
  for (const [child, parents] of childParents) {
    const parentList = Array.from(parents).sort();
    if (parentList.length === 0 || parentList.length > 2) {
      blockers.push("A17O_AMBIGUOUS_PARENT_SET_FAILS_CLOSED");
      continue;
    }
    const key = groupKey(parentList);
    const group = groups.get(key) ?? { key, parents: parentList, children: [] };
    if (!group.children.includes(child)) group.children.push(child);
    groups.set(key, group);
  }

  for (const key of legacyDuplicateGroupKeys) {
    if (groups.has(key)) blockers.push("A17O_LEGACY_DUPLICATE_REQUIRES_REVIEW");
  }

  return {
    groups: Array.from(groups.values()),
    blockers: Array.from(new Set(blockers)).sort(),
    duplicateParentRowsDeduplicated,
  };
}

function rel(parent, child, overrides = {}) {
  return {
    relationshipType: "parent_child",
    sourcePersonFingerprint: parent,
    relatedPersonFingerprint: child,
    ambiguityStatus: "clear",
    ownerDecision: "unresolved",
    ...overrides,
  };
}

function assertCase(label, condition) {
  if (!condition) failures.push(`fixture failed: ${label}`);
}

const source = read(sourcePath);
const service = read(servicePath);
const migration = read(migration0022);
const doc = read(docPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

const oneChild = plan([rel("parent-a", "child-1"), rel("parent-b", "child-1")]);
const twoSiblings = plan([
  rel("parent-a", "child-1"),
  rel("parent-b", "child-1"),
  rel("parent-a", "child-2"),
  rel("parent-b", "child-2"),
]);
const eightSiblings = plan(
  Array.from({ length: 8 }, (_, index) => [
    rel("parent-a", `child-${index + 1}`),
    rel("parent-b", `child-${index + 1}`),
  ]).flat(),
);
const ninthSiblings = plan(
  Array.from({ length: 9 }, (_, index) => [
    rel("parent-a", `child-${index + 1}`),
    rel("parent-b", `child-${index + 1}`),
  ]).flat(),
);
const differentSpouse = plan([
  rel("parent-a", "child-1"),
  rel("spouse-1", "child-1"),
  rel("parent-a", "child-2"),
  rel("spouse-2", "child-2"),
]);
const reversed = plan([
  rel("parent-b", "child-1"),
  rel("parent-a", "child-1"),
  rel("parent-b", "child-2"),
  rel("parent-a", "child-2"),
]);
const duplicateParent = plan([
  rel("parent-a", "child-1"),
  rel("parent-a", "child-1"),
  rel("parent-b", "child-1"),
]);
const ambiguous = plan([
  rel("parent-a", "child-1", { ambiguityStatus: "missing_reference" }),
]);
const legacyKey = oneChild.groups[0]?.key;
const legacyDuplicate = plan(
  [rel("parent-a", "child-1"), rel("parent-b", "child-1")],
  [legacyKey],
);
const oneParent = plan([rel("single-parent", "child-1")]);

assertCase(
  "one child one family",
  oneChild.groups.length === 1 && oneChild.groups[0].children.length === 1,
);
assertCase(
  "two siblings one family",
  twoSiblings.groups.length === 1 && twoSiblings.groups[0].children.length === 2,
);
assertCase(
  "eight siblings one family",
  eightSiblings.groups.length === 1 && eightSiblings.groups[0].children.length === 8,
);
assertCase(
  "ninth sibling family count unchanged",
  ninthSiblings.groups.length === 1 && ninthSiblings.groups[0].children.length === 9,
);
assertCase("different spouse different family", differentSpouse.groups.length === 2);
assertCase("reversed input order same plan", twoSiblings.groups[0].key === reversed.groups[0].key);
assertCase(
  "duplicate parent row dedup",
  duplicateParent.groups.length === 1 && duplicateParent.duplicateParentRowsDeduplicated === 1,
);
assertCase(
  "ambiguous parent set fails closed",
  ambiguous.blockers.includes("A17O_AMBIGUOUS_PARENT_SET_FAILS_CLOSED"),
);
assertCase(
  "legacy duplicate requires review",
  legacyDuplicate.blockers.includes("A17O_LEGACY_DUPLICATE_REQUIRES_REVIEW"),
);
assertCase("one parent grouping supported", oneParent.groups.length === 1);
assertCase(
  "child id excluded from key",
  groupKey(["parent-a", "parent-b"]) === groupKey(["parent-b", "parent-a"]),
);

for (const token of [
  "A17O_CANONICAL_IMPORT_GROUP_KEY_VERSION",
  "a17o-import-family-group:v1",
  "A17O_IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE = true",
  "A17O_GROUPED_PLAN_CONTRACT_VERSION",
  "buildA17OGroupedOfficialImportPlan",
  "buildA17OGroupedImportPreviewCounts",
  "A17O_BLOCKED_IMPORT_TRANSACTION_EXECUTOR_GROUPED_FAMILY_SUPPORT_REQUIRED",
  "buildA17OCanonicalImportGroupKey",
  "buildA17OCanonicalImportFamilyGroupingPlan",
  "childIdIncludedInGroupKey: false",
  "parentInputOrderAffectsGroupKey: false",
  "duplicateParentRowsDeduplicated",
  "duplicateChildRowsDeduplicated",
  "A17O_AMBIGUOUS_PARENT_SET_FAILS_CLOSED",
  "A17O_LEGACY_DUPLICATE_REQUIRES_REVIEW",
]) {
  requireIncludes(source, token, `source token ${token}`);
}

for (const token of [
  "a16p_tx_execute_giapha4_official_import",
  "gen_random_uuid() as family_id",
  "group by rel.related_person_fingerprint, child.person_id, child.source_row_index",
  "insert into public.family_children",
  "insert into public.family_parents",
  "IMPORT_ALREADY_COMPLETED",
  "'can_run_official_import', false",
]) {
  requireIncludes(migration, token, `migration token ${token}`);
}

for (const token of [
  "A17O_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_SOURCE_INTEGRATED",
  "CURRENT_PER_CHILD_FAMILY_CREATION_LOCATED=YES",
  "EXISTING_IMPORT_TRANSACTION_EXECUTOR_SUPPORTS_GROUPED_FAMILIES=NO",
  "CANONICAL_IMPORT_GROUPING_CREATED=YES",
  "CANONICAL_GROUP_KEY_VERSION=a17o-import-family-group:v1",
  "CHILD_ID_INCLUDED_IN_GROUP_KEY=NO",
  "PARENT_INPUT_ORDER_AFFECTS_GROUP_KEY=NO",
  "SIBLINGS_GROUPED_BY_PARENT_SET=YES",
  "ONE_PARENT_GROUPING_SUPPORTED=YES",
  "MULTIPLE_SPOUSE_CONTEXT_SEPARATED=YES",
  "DUPLICATE_PARENT_ROWS_DEDUPLICATED=YES",
  "DUPLICATE_CHILD_ROWS_DEDUPLICATED=YES",
  "AMBIGUOUS_PARENT_SET_FAILS_CLOSED=YES",
  "LEGACY_DUPLICATE_REQUIRES_REVIEW=YES",
  "IMPORT_PREVIEW_GROUP_COUNTS_UPDATED=YES",
  "IMPORT_DRY_RUN_GROUP_COUNTS_UPDATED=YES",
  "ROLLBACK_GROUPING_UPDATED=YES",
  "AUDIT_GROUPING_UPDATED=YES",
  "IDEMPOTENCY_GROUPING_UPDATED=YES",
  "IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE=YES",
  "A17O_TX1_GROUPED_EXECUTOR_CANDIDATE_APPLIED=YES_OWNER_MANUAL_PRODUCTION",
  "A17O_TX1_GROUPED_EXECUTOR_CANDIDATE_VERIFIED=YES",
  "A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED",
  "COMPLETED_OFFICIAL_IMPORT_RETRY_BLOCKED_TEST=PASS",
  "OFFICIAL_IMPORT_RPC_CALLED=NO",
  "PRODUCTION_IMPORT_EXECUTED=NO",
  "MIGRATION_CREATED=NO",
  "SQL_EXECUTED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "NEXT_ACTION_AFTER_TX1R=A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION_COMPLETED_SOURCE_ONLY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17O_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX.md", "index A-17O doc"],
  [
    workLog,
    "A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED",
    "work log A-17O-TX1R",
  ],
  [
    decisionLog,
    "Decision 339 - A-17O keeps importer grouping dormant until grouped transaction executor exists",
    "decision A-17O",
  ],
  [
    handoff,
    "A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED",
    "handoff A-17O-TX1R",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17o-importer-canonical-family-grouping"] !==
  "node scripts/check-a17o-importer-canonical-family-grouping.cjs"
) {
  failures.push("missing package script check:a17o-importer-canonical-family-grouping");
}

requireIncludes(service, "buildA17OGroupedOfficialImportPlan", "official import grouped runtime activation");
requireIncludes(service, "A17O_GROUPED_OFFICIAL_IMPORT_RPC_FUNCTION_NAME", "official import grouped executor adapter");
rejectPattern(
  source,
  /\.rpc\(|\.from\(\s*["']|fetch\(|SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i,
  "source DB/network/service role access",
);

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  sourcePath,
  docPath,
  checkerPath,
  "scripts/check-a17o-r-grouped-importer-runtime-integration.cjs",
  "docs/PLAN_A17O_DR_GROUPED_IMPORTER_DEPLOY_NO_IMPORT_MUTATION_SMOKE_EVIDENCE.md",
  "scripts/check-a17o-dr-grouped-importer-deploy-no-import-mutation-smoke-evidence.cjs",
  "docs/PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md",
  "db/checks/20260713_check_a17p_owner_facing_legacy_family_review.sql",
  "docs/templates/A17P_LEGACY_RECONCILIATION_OWNER_REVIEW_PACK_TEMPLATE.md",
  "db/checks/20260713_check_a17p_legacy_family_reconciliation_audit.sql",
  "scripts/a17p-legacy-reconciliation-planner.cjs",
  "scripts/check-a17p-legacy-reconciliation-audit-dry-run-owner-review-pack.cjs",
  "scripts/check-a17p-fix2-owner-facing-legacy-family-review-query.cjs",
  "scripts/check-a17p-fix3-parent-role-gender-review-evidence.cjs",
  "docs/evidence/A17P_OWNER_DECISION_PACK.json",
  "docs/evidence/A17P_OWNER_DECISION_PACK.sha256",
  "scripts/check-a17p-manual-owner-approval-evidence.cjs",
  "scripts/check-a17p-r-immutable-owner-decision-pack.cjs",
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
  "docs/PLAN_A17A_TREE_BASELINE_EVIDENCE.md",
  "docs/PLAN_A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT.md",
  "docs/PLAN_A17F_FAMILY_RECONCILIATION_DRY_RUN.md",
  "docs/PLAN_A17G_FAMILY_RECONCILIATION_ROLLBACK_DESIGN.md",
  "docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md",
  "lib/import/giapha4/grouped-official-import-executor-adapter.ts",
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION.md",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "lib/import/giapha4/official-import-service.ts",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "components/imports/import-session-manifest-panel.tsx",
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
  a17oTx1DbMigration,
  a17oTx1SupabaseMigration,
  "db/checks/20260713_check_a17o_tx1_grouped_official_import_transaction_executor.sql",
  "docs/PLAN_A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE.md",
  "docs/PLAN_A17O_TX1R_GROUPED_IMPORT_EXECUTOR_MANUAL_APPLY_VERIFICATION.md",
  "docs/PLAN_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE.md",
  "scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs",
  "scripts/check-a17o-tx1r-grouped-import-executor-manual-apply-verification.cjs",
]);

for (const file of changedFiles) {
  if (
    /^(db\/migrations|supabase\/migrations)\//.test(file) &&
    file !== a17oTx1DbMigration &&
    file !== a17oTx1SupabaseMigration &&
    !allowedChangedFiles.has(file)
  ) {
    failures.push(`migration changed during A-17O: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected A-17O dirty file: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-17O importer canonical family grouping check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17O importer canonical family grouping check passed.");

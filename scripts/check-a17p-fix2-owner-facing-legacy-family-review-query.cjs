#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const ownerSqlPath =
  "db/checks/20260713_check_a17p_owner_facing_legacy_family_review.sql";
const fix1SqlPath =
  "db/checks/20260713_check_a17p_legacy_family_reconciliation_audit.sql";
const docPath =
  "docs/PLAN_A17P_LEGACY_RECONCILIATION_AUDIT_DRY_RUN_OWNER_REVIEW_PACK.md";
const templatePath =
  "docs/templates/A17P_LEGACY_RECONCILIATION_OWNER_REVIEW_PACK_TEMPLATE.md";
const checkerPath =
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

const ownerSql = read(ownerSqlPath);
const fix1Sql = read(fix1SqlPath);
const doc = read(docPath);
const template = read(templatePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

const originForFix1 = git(["branch", "-r", "--contains", "403260b"]);
if (!originForFix1.includes("origin/main")) {
  failures.push("origin/main does not contain 403260b");
}

const sanitizedSql = ownerSql
  .replace(/'([^']|'')*'/g, "''")
  .replace(/--.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

const mutationPattern =
  /\b(insert|update|delete|merge|truncate|alter|drop|create|grant|revoke|call|do|perform)\b/i;
rejectPattern(sanitizedSql, mutationPattern, "mutation/RPC statement in owner-facing SQL");
rejectPattern(sanitizedSql, /\brpc\b/i, "RPC marker in owner-facing SQL");

for (const token of [
  "owner_review_group_summary",
  "owner_review_candidate_family",
  "owner_review_parent_detail",
  "owner_review_child_detail",
  "owner_review_special_cases",
  "owner_review_integrity",
  "family_parent_counts",
  "family_child_counts",
  "family_layout_refs",
  "family_revision_refs",
  "family_parent_sets",
  "duplicate_groups_base",
  "candidate_family_pairs_base",
  "candidate_parent_membership_rows",
  "candidate_child_membership_rows",
  "person_display_names",
  "display_name_for_owner",
  "coalesce(nullif(btrim(display_name), ''), nullif(btrim(full_name), ''), 'Không rõ tên')",
  "parent_display_summary",
  "child_display_summary",
  "parent_role",
  "relationship_type",
  "child_relationship_type",
  "family_id",
  "parent_person_id",
  "child_person_id",
  "membership_id",
  "md5(cpmr.person_id::text)",
  "md5(ccmr.person_id::text)",
  "owner_decision",
  "owner_notes",
  "owner_selected_survivor",
  "owner_family_decision",
  "null::text as owner_decision",
  "null::text as owner_notes",
  "null::boolean as owner_selected_survivor",
  "duplicate_group_count",
  "candidate_family_count",
  "parent_detail_row_count",
  "child_detail_row_count",
  "group_count_matches_fix1_pass",
  "candidate_family_count_matches_fix1_pass",
  "candidate_pairs_unique_pass",
  "parent_rows_match_candidate_parent_counts_pass",
  "child_rows_match_candidate_child_counts_pass",
  "all_candidate_families_have_displayable_parent_pass",
  "all_candidate_families_have_displayable_child_pass",
  "one_parent_group_present_pass",
  "deleted_family_advisory_present_pass",
  "no_automatic_owner_approval_pass",
  "721e2ae3d95dd418af40b6459531b870",
  "16ead1f516a885724a2bddd11e14472b",
  "ONE_PARENT_GROUP",
  "MISSING_SPOUSE_OR_MOTHER_CONTEXT_REQUIRES_OWNER_REVIEW",
  "DELETED_FAMILY_ADVISORY",
  "SEPARATE_OWNER_DECISION_REQUIRED",
  "active_parent_memberships",
  "active_child_memberships",
  "= 22",
  "= 60",
  "OWNER_SELECTION_REQUIRED_EQUIVALENT_CANDIDATES",
  "OWNER_REVIEW_ADVISORY_EVIDENCE_ONLY",
]) {
  requireIncludes(ownerSql, token, `owner SQL token ${token}`);
}

for (const token of [
  "md5(coalesce(array_to_string(fpc.parent_ids, ','), 'NO_PARENT_SET')) as safe_group_ref",
  "fps.parent_ids = dg.parent_ids",
  "where active_candidate_family_count > 1",
]) {
  requireIncludes(ownerSql, token, `exact normalized parent-set grouping ${token}`);
}

rejectPattern(
  ownerSql,
  /person_id\s*=\s*any\s*\(\s*.*parent_ids\s*\)/i,
  "partial parent overlap grouping",
);
rejectPattern(
  ownerSql,
  /md5\s*\([^)]*child|child[^)]*\)\s+as\s+safe_group_ref/i,
  "child in group identity",
);
rejectPattern(
  ownerSql,
  /\b(notes_private|phone|email|address|current_address|home_town|birth_place|auth_user_id|avatar_url|raw_user_meta_data|raw_app_meta_data)\b/i,
  "private/contact/auth field in owner SQL",
);
rejectPattern(
  ownerSql,
  /AUTO_APPROVED|auto_approved|OWNER_DECISION\s*=\s*APPROVED|EXECUTE\s*=\s*true|FINAL_SURVIVOR\s*=\s*true/i,
  "automatic owner approval marker",
);

for (const token of [
  "family_parent_counts",
  "family_child_counts",
  "family_layout_refs",
  "family_revision_refs",
  "candidate_family_pairs",
  "audit_integrity",
]) {
  requireIncludes(fix1Sql, token, `FIX1 SQL token ${token}`);
}

for (const token of [
  "A17P_MANUAL_STATUS=BLOCKED_OWNER_FACING_REVIEW_QUERY_MISSING",
  "A17P_FIX2_STATUS=PASS_OWNER_FACING_LEGACY_FAMILY_REVIEW_QUERY_READY",
  "A17P_FIX1_MANUAL_STATUS=PASS_CORRECTED_SELECT_ONLY_AUDIT_VERIFIED",
  `OWNER_FACING_QUERY_FILE=${ownerSqlPath}`,
  "OWNER_FACING_REVIEW_QUERY_CREATED=YES",
  "EXACT_PARENT_SET_GROUPING_PRESERVED=YES",
  "PARENT_DISPLAY_NAMES_INCLUDED=YES",
  "PARENT_ROLES_INCLUDED=YES",
  "CHILD_DISPLAY_NAMES_INCLUDED=YES",
  "FAMILY_IDS_INCLUDED_FOR_OWNER_SELECTION=YES",
  "PRIVATE_FIELDS_EXCLUDED=YES",
  "GROUP_SUMMARY_RESULT_SET_CREATED=YES",
  "CANDIDATE_FAMILY_RESULT_SET_CREATED=YES",
  "PARENT_DETAIL_RESULT_SET_CREATED=YES",
  "CHILD_DETAIL_RESULT_SET_CREATED=YES",
  "SPECIAL_CASE_RESULT_SET_CREATED=YES",
  "OWNER_REVIEW_INTEGRITY_RESULT_SET_CREATED=YES",
  "ONE_PARENT_GROUP_WARNING_INCLUDED=YES",
  "DELETED_FAMILY_REVIEW_SEPARATE=YES",
  "AUTOMATIC_OWNER_APPROVAL_PRESENT=NO",
  "OWNER_DECISION_PLACEHOLDERS_NULL=YES",
  "EXPECTED_GROUP_COUNT=22",
  "EXPECTED_CANDIDATE_FAMILY_COUNT=60",
  "EXPECTED_PARENT_DETAIL_ROWS=117",
  "EXPECTED_CHILD_DETAIL_ROWS=60",
  "SQL_EXECUTED=NO",
  "RPC_CALLED=NO",
  "DATABASE_MUTATION=NO",
  "RECONCILIATION_EXECUTED=NO",
  "GENEALOGY_ROWS_MODIFIED=NO",
  "MIGRATION_CREATED=NO",
  "RUNTIME_CHANGED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "PACKAGE_DEPENDENCY_INSTALLED=NO",
  "NEXT_ACTION=OWNER_RUN_A17P_OWNER_FACING_SELECT_ONLY_REVIEW_QUERY",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "PARENT_NAMES=",
  "CHILD_NAMES=",
  "SELECTED_SURVIVOR_FAMILY_REF=",
  "FAMILIES_TO_VOID=",
  "OWNER_REASON=",
  "LAYOUT_REVIEW=PASS|REQUIRES_MIGRATION|BLOCKED",
  "GRAPH_REVIEW=PASS|BLOCKED",
  "RELATIONSHIP_ROLE_REVIEW=PASS|BLOCKED",
  "OWNER_DECISION=NOT_SELECTED",
]) {
  requireIncludes(template, token, `template token ${token}`);
}

for (const [content, token, label] of [
  [index, "A17P_FIX2_STATUS=PASS_OWNER_FACING_LEGACY_FAMILY_REVIEW_QUERY_READY", "index FIX2"],
  [workLog, "A17P_FIX2_STATUS=PASS_OWNER_FACING_LEGACY_FAMILY_REVIEW_QUERY_READY", "work log FIX2"],
  [decisionLog, "Decision 346 - A-17P-FIX2 adds owner-facing review query", "decision FIX2"],
  [handoff, "A17P_FIX2_STATUS=PASS_OWNER_FACING_LEGACY_FAMILY_REVIEW_QUERY_READY", "handoff FIX2"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17p-fix2-owner-facing-legacy-family-review-query"] !==
  `node ${checkerPath}`
) {
  failures.push("missing package script check:a17p-fix2-owner-facing-legacy-family-review-query");
}

function displayName(person) {
  return (person.displayName?.trim() || person.fullName?.trim() || "Không rõ tên");
}

function parentSetKey(family) {
  return Array.from(new Set((family.parents ?? []).map((parent) => parent.personId)))
    .sort()
    .join(",");
}

function buildSyntheticOwnerReview(families, deletedFamilies = []) {
  const groups = new Map();
  for (const family of families) {
    const key = parentSetKey(family);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(family);
  }
  const duplicateGroups = Array.from(groups.entries())
    .filter(([, groupFamilies]) => groupFamilies.length > 1)
    .map(([key, groupFamilies]) => ({
      key,
      candidates: groupFamilies,
      parentDetails: groupFamilies.flatMap((family) =>
        family.parents.map((parent) => ({
          familyId: family.id,
          personId: parent.personId,
          name: displayName(parent),
          role: parent.role,
          type: parent.type,
        })),
      ),
      childDetails: groupFamilies.flatMap((family) =>
        family.children.map((child) => ({
          familyId: family.id,
          personId: child.personId,
          name: displayName(child),
          type: child.type,
        })),
      ),
      ownerDecision: null,
      autoApproved: false,
      oneParentReview: key.split(",").filter(Boolean).length === 1,
    }));
  return {
    duplicateGroups,
    deletedFamilyAdvisory: deletedFamilies.map((family) => ({
      familyId: family.id,
      normalBatch: false,
      action: "SEPARATE_OWNER_DECISION_REQUIRED",
    })),
  };
}

const vietnameseFamilyReview = buildSyntheticOwnerReview([
  {
    id: "synthetic-family-a",
    parents: [
      { personId: "synthetic-father", fullName: "Nguyễn Văn An", role: "father", type: "biological" },
      { personId: "synthetic-mother", displayName: "Trần Thị Bình", role: "mother", type: "biological" },
    ],
    children: [
      { personId: "synthetic-child-1", fullName: "Nguyễn Minh Châu", type: "biological" },
    ],
  },
  {
    id: "synthetic-family-b",
    parents: [
      { personId: "synthetic-mother", displayName: "Trần Thị Bình", role: "mother", type: "biological" },
      { personId: "synthetic-father", fullName: "Nguyễn Văn An", role: "father", type: "biological" },
    ],
    children: [
      { personId: "synthetic-child-2", fullName: "Nguyễn Hoàng Đức", type: "biological" },
    ],
  },
]);
const vietnameseGroup = vietnameseFamilyReview.duplicateGroups[0];
assertCase(
  "Vietnamese father, mother and two children display correctly",
  vietnameseGroup?.parentDetails.some((row) => row.name === "Nguyễn Văn An") &&
    vietnameseGroup?.parentDetails.some((row) => row.name === "Trần Thị Bình") &&
    vietnameseGroup?.childDetails.some((row) => row.name === "Nguyễn Minh Châu") &&
    vietnameseGroup?.childDetails.some((row) => row.name === "Nguyễn Hoàng Đức"),
);
assertCase(
  "Vietnamese diacritics are preserved",
  vietnameseGroup?.childDetails.map((row) => row.name).join(" ").includes("Đức"),
);
assertCase(
  "Parent role father and mother remain distinguishable",
  new Set(vietnameseGroup?.parentDetails.map((row) => row.role)).has("father") &&
    new Set(vietnameseGroup?.parentDetails.map((row) => row.role)).has("mother"),
);

const oneParentReview = buildSyntheticOwnerReview([
  {
    id: "synthetic-family-a",
    parents: [{ personId: "single-parent", fullName: "Lê Văn Cường", role: "father", type: "biological" }],
    children: [{ personId: "child-a", fullName: "Lê An", type: "biological" }],
  },
  {
    id: "synthetic-family-b",
    parents: [{ personId: "single-parent", fullName: "Lê Văn Cường", role: "father", type: "biological" }],
    children: [
      { personId: "child-b", fullName: "Lê Bình", type: "biological" },
      { personId: "child-c", fullName: "Lê Chi", type: "biological" },
    ],
  },
]);
assertCase(
  "One-parent family displays parent and all children",
  oneParentReview.duplicateGroups[0]?.oneParentReview === true &&
    oneParentReview.duplicateGroups[0]?.childDetails.length === 3,
);

const fallbackReview = buildSyntheticOwnerReview([
  {
    id: "fallback-a",
    parents: [{ personId: "unknown-parent", role: "parent", type: "unknown" }],
    children: [{ personId: "fallback-child-a", type: "unknown" }],
  },
  {
    id: "fallback-b",
    parents: [{ personId: "unknown-parent", role: "parent", type: "unknown" }],
    children: [{ personId: "fallback-child-b", fullName: "Phạm An", type: "unknown" }],
  },
]);
assertCase(
  "Missing display name falls back to Không rõ tên",
  fallbackReview.duplicateGroups[0]?.parentDetails[0]?.name === "Không rõ tên",
);

const sharedFather = buildSyntheticOwnerReview([
  {
    id: "father-a",
    parents: [
      { personId: "father", fullName: "Cha A", role: "father", type: "biological" },
      { personId: "mother-a", fullName: "Mẹ A", role: "mother", type: "biological" },
    ],
    children: [{ personId: "child-a", fullName: "Con A", type: "biological" }],
  },
  {
    id: "father-b",
    parents: [
      { personId: "father", fullName: "Cha A", role: "father", type: "biological" },
      { personId: "mother-b", fullName: "Mẹ B", role: "mother", type: "biological" },
    ],
    children: [{ personId: "child-b", fullName: "Con B", type: "biological" }],
  },
]);
assertCase(
  "Different mothers under same father remain different groups",
  sharedFather.duplicateGroups.length === 0,
);

const sharedMother = buildSyntheticOwnerReview([
  {
    id: "mother-a",
    parents: [
      { personId: "father-a", fullName: "Cha A", role: "father", type: "biological" },
      { personId: "mother", fullName: "Mẹ A", role: "mother", type: "biological" },
    ],
    children: [{ personId: "child-a", fullName: "Con A", type: "biological" }],
  },
  {
    id: "mother-b",
    parents: [
      { personId: "father-b", fullName: "Cha B", role: "father", type: "biological" },
      { personId: "mother", fullName: "Mẹ A", role: "mother", type: "biological" },
    ],
    children: [{ personId: "child-b", fullName: "Con B", type: "biological" }],
  },
]);
assertCase(
  "Different fathers under same mother remain different groups",
  sharedMother.duplicateGroups.length === 0,
);

assertCase(
  "Family ID appears in owner SQL output contract but not committed fixture output",
  /\bfamily_id\b/.test(ownerSql) &&
    !JSON.stringify(vietnameseFamilyReview).includes("00000000-0000-0000-0000-000000000000"),
);
assertCase(
  "Private notes and contact fields are excluded",
  !/\b(notes_private|phone|email|address|auth_user_id)\b/i.test(ownerSql),
);
assertCase("Owner decision remains null", /null::text as owner_decision/.test(ownerSql));
assertCase("Equivalent candidates do not become automatically approved", !/AUTO_APPROVED|FINAL_SURVIVOR/i.test(ownerSql));
assertCase("One-parent group is flagged for extra review", ownerSql.includes("ONE_PARENT_GROUP"));
assertCase(
  "Deleted family stays outside normal group decision batch",
  buildSyntheticOwnerReview([], [{ id: "deleted-family" }]).deletedFamilyAdvisory[0]?.normalBatch === false,
);
assertCase(
  "Query result counts remain compatible with FIX1",
  ownerSql.includes("= 22") && ownerSql.includes("= 60") && doc.includes("EXPECTED_PARENT_DETAIL_ROWS=117"),
);

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  ownerSqlPath,
  docPath,
  templatePath,
  checkerPath,
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
  "docs/PLAN_A17Q_TX1_FIX3_OWNER_REVIEW_FINAL_MIGRATION_CANDIDATE.md",
  "scripts/check-a17q-tx1-fix3-owner-review.cjs",
  "docs/PLAN_A17Q_TX1R_LEGACY_FAMILY_RECONCILIATION_EXECUTOR_MANUAL_APPLY_VERIFICATION.md",
  "scripts/check-a17q-tx1r-legacy-family-reconciliation-executor-manual-apply-verification.cjs",
  "scripts/check-export-import-boundary-design.cjs",
  "scripts/check-export-import-final-readiness.cjs",
]);

for (const file of changedFiles) {
  if (/^(app|components|lib|services)\//.test(file)) {
    failures.push(`runtime file changed during A-17P-FIX2: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`migration changed during A-17P-FIX2: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected A-17P-FIX2 dirty file: ${file}`);
  }
}

function section(content, startToken, nextHeading = "\n## ") {
  const start = content.indexOf(startToken);
  if (start === -1) return "";
  const rest = content.slice(start);
  const next = rest.indexOf(nextHeading, 1);
  return next === -1 ? rest : rest.slice(0, next);
}

const fix2DocSections = [
  section(doc, "## A-17P-FIX2 Owner-Facing Review Query"),
  template,
  section(workLog, "## 2026-07-13 - A-17P-FIX2"),
  section(decisionLog, "## Decision 346"),
  section(handoff, "## 2026-07-13 - A-17P-FIX2"),
].join("\n");

rejectPattern(
  fix2DocSections,
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|SUPABASE_SERVICE_ROLE_KEY=|eyJ|BEGIN RSA|PRIVATE KEY|access_token|refresh_token/i,
  "production UUID, secret or token-looking content",
);

if (failures.length > 0) {
  console.error("A-17P-FIX2 owner-facing legacy family review query check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17P-FIX2 owner-facing legacy family review query check passed.");

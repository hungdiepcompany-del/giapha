#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A17A_TREE_BASELINE_EVIDENCE.md";
const sqlPath = "db/checks/20260712_check_a17a_tree_baseline_evidence.sql";
const checkerPath = "scripts/check-a17a-tree-baseline-evidence.cjs";
const summaryPath = "docs/PLAN_A17AD_TREE_ARCHITECTURE_FOUNDATION_BUNDLE.md";

const allowedChangedFiles = new Set([
  docPath,
  sqlPath,
  checkerPath,
  summaryPath,
  "docs/PLAN_A17B_CANONICAL_FAMILY_UNIT_DESIGN.md",
  "docs/PLAN_A17C_PHATUE_ORIENTED_TREE_UX_CONTRACT.md",
  "docs/PLAN_A17D_CANONICAL_TREE_GRAPH_CONTRACT.md",
  "scripts/check-a17b-canonical-family-unit-design.cjs",
  "scripts/check-a17c-phatue-oriented-tree-ux-contract.cjs",
  "scripts/check-a17d-canonical-tree-graph-contract.cjs",
  "docs/PLAN_A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT.md",
  "docs/PLAN_A17F_FAMILY_RECONCILIATION_DRY_RUN.md",
  "docs/PLAN_A17G_FAMILY_RECONCILIATION_ROLLBACK_DESIGN.md",
  "docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md",
  "db/checks/20260712_check_a17e_family_duplicate_read_only_audit.sql",
  "db/checks/20260712_check_a17f_family_reconciliation_dry_run.sql",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17f-family-reconciliation-dry-run.cjs",
  "scripts/check-a17g-family-reconciliation-rollback-design.cjs",
  "docs/PLAN_A17H_CANONICAL_FAMILY_SCHEMA_FOUNDATION_CANDIDATE.md",
  "db/checks/20260712_check_a17i_canonical_family_schema_post_apply.sql",
  "db/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql",
  "supabase/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "docs/PLAN_A17SQL_H_OWNER_MANUAL_SCHEMA_APPLY.md",
  "docs/PLAN_A17I_CANONICAL_FAMILY_SCHEMA_POST_APPLY_VERIFICATION.md",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "docs/PLAN_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE.md",
  "lib/family/canonical-family-types.ts",
  "lib/family/canonical-family-errors.ts",
  "lib/family/canonical-family-identity.ts",
  "lib/family/canonical-family-repository.ts",
  "lib/family/canonical-family-service.ts",
  "scripts/check-a17m-canonical-family-domain-service.cjs",
  "lib/family/admin-canonical-family-link-service.ts",
  "docs/PLAN_A17N_ADMIN_PARENT_CHILD_CANONICAL_WRITE_PATH.md",
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs",
  "db/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql",
  "supabase/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql",
  "db/checks/20260712_check_a17n_tx1_admin_canonical_family_transaction_executor.sql",
  "docs/PLAN_A17N_TX1_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs",
  "docs/PLAN_A17N_TX2_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_POST_APPLY_VERIFICATION.md",
  "docs/PLAN_A17N_TX2F_POST_APPLY_VERIFIER_ACTIVE_SCOPE_CORRECTION.md",
  "scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs",
  "docs/PLAN_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION.md",
  "scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs",
  "docs/PLAN_A17N_DR_DEPLOY_PRODUCTION_NO_MUTATION_SMOKE_EVIDENCE.md",
  "scripts/check-a17n-dr-deploy-production-no-mutation-smoke-evidence.cjs",
  "docs/PLAN_A17O_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX.md",
  "lib/import/giapha4/canonical-family-grouping.ts",
  "scripts/check-a17o-importer-canonical-family-grouping.cjs",
  "db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql",
  "supabase/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql",
  "db/checks/20260713_check_a17o_tx1_grouped_official_import_transaction_executor.sql",
  "docs/PLAN_A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE.md",
  "scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs",
  "docs/PLAN_A17O_TX1R_GROUPED_IMPORT_EXECUTOR_MANUAL_APPLY_VERIFICATION.md",
  "scripts/check-a17o-tx1r-grouped-import-executor-manual-apply-verification.cjs",
  "docs/PLAN_A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION.md",
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
  "scripts/check-export-import-boundary-design.cjs",
  "scripts/check-export-import-final-readiness.cjs",
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "components/imports/import-session-manifest-panel.tsx",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/grouped-official-import-executor-adapter.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "lib/import/giapha4/official-import-service.ts",
  "app/(admin)/admin/tree/edit/actions.ts",
  "lib/family/admin-canonical-family-runtime-service.ts",
  "lib/family/admin-canonical-family-transaction-adapter.ts",
  "lib/family/canonical-family-supabase-repository.ts",
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "package.json",
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

function stripSqlComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "");
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

const doc = read(docPath);
const sql = read(sqlPath);
const sqlWithoutComments = stripSqlComments(sql);
const summary = read(summaryPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "A17A_STATUS=PASS_READ_ONLY_BASELINE_RECORDED",
  "A17A_TREE_BASELINE_SQL=db/checks/20260712_check_a17a_tree_baseline_evidence.sql",
  "A17A_TREE_BASELINE_SQL_SCOPE=SELECT_ONLY_STRUCTURAL_BASELINE_NO_PII_OUTPUT",
  "A17A_TREE_BASELINE_RESULT=PASS_READ_ONLY",
  "people_count",
  "families_count",
  "family_parents_count",
  "family_children_count",
  "couple_relationships_count",
  "distinct_parent_set_count",
  "duplicate_parent_set_group_count",
  "redundant_family_count_estimate",
  "families_with_multiple_children",
  "children_in_multiple_equivalent_families_count",
  "connected_component_count",
  "explicit_generation_number_distribution",
  "saved_tree_layout_node_count",
  "couple_relationship_without_matching_family_count",
  "family_parent_pair_without_matching_couple_relationship_count",
  "A17A_PARENT_SET_NORMALIZATION=sorted_active_parent_person_ids",
  "A17A_EQUAL_PARENT_SET_SAFE_TO_MERGE_AUTOMATICALLY=NO",
  "IMPORTER_PER_CHILD_FAMILY_BEHAVIOR_CONFIRMED=YES",
  "ADMIN_ADD_PARENT_CREATES_NEW_FAMILY_CONFIRMED=YES",
  "ADMIN_ADD_CHILD_CREATES_NEW_FAMILY_CONFIRMED=YES",
  "ADD_SPOUSE_CREATES_COUPLE_WITHOUT_CANONICAL_FAMILY_LINK_CONFIRMED=YES",
  "COUPLE_AND_FAMILY_RENDER_DUPLICATION_RISK_CONFIRMED=YES",
  "SAVED_LAYOUT_OVERWRITE_RISK_CONFIRMED=YES",
  "VIEWER_VIETNAMESE_SEARCH_NORMALIZATION_GAP_CONFIRMED=YES",
  "TECHNICAL_ENUM_LABEL_LEAK_RISK_CONFIRMED=YES",
]) {
  requireIncludes(doc, token, `A17A doc token ${token}`);
}

for (const token of [
  "A17A_TREE_BASELINE_EVIDENCE",
  "SELECT_ONLY_STRUCTURAL_BASELINE",
  "NO_PII_OUTPUT",
  "with recursive active_people as",
  "family_parent_sets as",
  "duplicate_parent_sets as",
  "child_equivalent_memberships as",
  "person_adjacency as",
  "component_walk(root_id, person_id) as",
  "couple_without_family as",
  "parent_pair_without_couple as",
  "explicit_generation_number_distribution",
]) {
  requireIncludes(sql, token, `A17A SQL token ${token}`);
}

rejectPattern(
  sqlWithoutComments,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "A17A SQL must stay SELECT-only",
);
rejectPattern(
  sqlWithoutComments,
  /\ba16p_tx_execute_giapha4_official_import\s*\(/i,
  "A17A SQL must not call official import RPC",
);
rejectPattern(sqlWithoutComments, /\bfor\s+update\b/i, "A17A SQL must not lock rows");

for (const [content, token, label] of [
  [index, "PLAN_A17A_TREE_BASELINE_EVIDENCE.md", "index A17A entry"],
  [index, "PLAN_A17AD_TREE_ARCHITECTURE_FOUNDATION_BUNDLE.md", "index A17AD entry"],
  [workLog, "A17A_STATUS=PASS_READ_ONLY_BASELINE_RECORDED", "work log A17A status"],
  [decisionLog, "Decision 328 - A-17 canonical family tree foundation accepted for owner review", "decision A17 entry"],
  [handoff, "A17A_STATUS=PASS_READ_ONLY_BASELINE_RECORDED", "handoff A17A status"],
  [summary, "A17AD_BUNDLE_STATUS=OWNER_APPROVED_READY_FOR_SEPARATE_A17E_A17G", "summary status"],
  [summary, "A17_OWNER_APPROVAL_RECORDED=YES", "summary owner approval"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17a-tree-baseline-evidence"] !==
  "node scripts/check-a17a-tree-baseline-evidence.cjs"
) {
  failures.push("missing package script check:a17a-tree-baseline-evidence");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv|zip)$/i.test(file)) failures.push(`forbidden data/evidence file ${file}`);
}

rejectPattern(
  doc + sql + summary,
  /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i,
  "secret-like token",
);
rejectPattern(
  doc + summary,
  /MUTATION_SQL_EXECUTED=YES|IMPORT_RPC_CALLED=YES|OFFICIAL_IMPORT_RETRY=YES|DEPLOY=YES|PUSH=YES/i,
  "closed safety boundary drift",
);

if (failures.length > 0) {
  console.error("A-17A tree baseline evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17A tree baseline evidence check passed.");

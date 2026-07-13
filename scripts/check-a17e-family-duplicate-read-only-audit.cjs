#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT.md";
const sqlPath = "db/checks/20260712_check_a17e_family_duplicate_read_only_audit.sql";
const summaryPath = "docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md";

const allowedChangedFiles = new Set([
  "db/checks/20260712_check_a17e_family_duplicate_read_only_audit.sql",
  "db/checks/20260712_check_a17f_family_reconciliation_dry_run.sql",
  "docs/PLAN_A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT.md",
  "docs/PLAN_A17F_FAMILY_RECONCILIATION_DRY_RUN.md",
  "docs/PLAN_A17G_FAMILY_RECONCILIATION_ROLLBACK_DESIGN.md",
  "docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md",
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
  "docs/PLAN_A17Q_TX1_FIX2_OWNER_REVIEW_EXACT_POST_STATE_RECONCILIATION_CANDIDATE.md",
  "scripts/check-a17q-tx1-fix2-owner-review.cjs",
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
  "docs/PLAN_A17AD_TREE_ARCHITECTURE_FOUNDATION_BUNDLE.md",
  "docs/PLAN_A17A_TREE_BASELINE_EVIDENCE.md",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
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
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
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
  "A17E_STATUS=PASS_READ_ONLY_FAMILY_DUPLICATE_AUDIT_RECORDED",
  "A17E_SQL=db/checks/20260712_check_a17e_family_duplicate_read_only_audit.sql",
  "PRODUCTION_AUDIT_QUERY_STATUS=PASS_READ_ONLY",
  "people_count",
  "current_family_count",
  "family_parent_membership_count",
  "family_child_membership_count",
  "couple_relationship_count",
  "normalized_parent_set_count",
  "duplicate_parent_set_group_count",
  "redundant_family_count",
  "safe_automatic_group_count",
  "owner_review_group_count",
  "blocked_ambiguous_group_count",
  "children_in_equivalent_families_count",
  "invalid_person_reference_count",
  "layout_records_referencing_duplicate_families_count",
  "SAFE_AUTOMATIC_CANDIDATE_GROUPS=0",
  "OWNER_REVIEW_REQUIRED_GROUPS=22",
  "BLOCKED_AMBIGUOUS_GROUPS=0",
  "NOT_A_DUPLICATE_GROUPS=13",
]) {
  requireIncludes(doc, token, `A17E doc token ${token}`);
}

for (const token of [
  "A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT",
  "SELECT_ONLY_STRUCTURAL_AUDIT",
  "NO_PII_OUTPUT",
  "family_parent_sets as",
  "family_metadata as",
  "family_couple_metadata as",
  "group_classifications as",
  "DUPLICATE_GROUP",
  "SAFE_AUTOMATIC_CANDIDATE",
  "OWNER_REVIEW_REQUIRED",
  "BLOCKED_AMBIGUOUS",
  "NOT_A_DUPLICATE",
  "md5(parent_set_key)",
]) {
  requireIncludes(sql, token, `A17E SQL token ${token}`);
}

rejectPattern(sqlWithoutComments, /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im, "A17E SQL must stay SELECT-only");
rejectPattern(sqlWithoutComments, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "A17E SQL must not call official import RPC");
rejectPattern(sqlWithoutComments, /\bfor\s+update\b/i, "A17E SQL must not lock rows");

for (const [content, token, label] of [
  [index, "PLAN_A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT.md", "index A17E entry"],
  [workLog, "A17E_STATUS=PASS_READ_ONLY_FAMILY_DUPLICATE_AUDIT_RECORDED", "work log A17E status"],
  [decisionLog, "Decision 329 - A-17E to A-17G family reconciliation remains read-only and blocked", "decision A17EG entry"],
  [handoff, "A17E_STATUS=PASS_READ_ONLY_FAMILY_DUPLICATE_AUDIT_RECORDED", "handoff A17E status"],
  [summary, "A17EG_BUNDLE_STATUS=PASS_READ_ONLY_AUDIT_DRY_RUN_READY_FOR_OWNER_REVIEW_RECONCILIATION_BLOCKED", "summary status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17e-family-duplicate-read-only-audit"] !==
  "node scripts/check-a17e-family-duplicate-read-only-audit.cjs"
) {
  failures.push("missing package script check:a17e-family-duplicate-read-only-audit");
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

rejectPattern(doc + sql + summary, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(doc + summary, /MIGRATION_APPLIED=YES|GENEALOGY_ROWS_MODIFIED=YES|RECONCILIATION_EXECUTED=YES|IMPORT_RPC_CALLED=YES|DEPLOY=YES|PUSH=YES/i, "closed safety boundary drift");

if (failures.length > 0) {
  console.error("A-17E family duplicate read-only audit check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17E family duplicate read-only audit check passed.");

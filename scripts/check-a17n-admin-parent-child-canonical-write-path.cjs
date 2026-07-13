#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const servicePath = "lib/family/admin-canonical-family-link-service.ts";
const docPath = "docs/PLAN_A17N_ADMIN_PARENT_CHILD_CANONICAL_WRITE_PATH.md";
const checkerPath =
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs";
const treeActionsPath = "app/(admin)/admin/tree/edit/actions.ts";
const relationshipsActionsPath = "app/(admin)/admin/relationships/actions.ts";
const a17nRuntimeDocPath =
  "docs/PLAN_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION.md";
const a17nTx1MigrationFiles = new Set([
  "db/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql",
  "supabase/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql",
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

function assertCase(label, condition) {
  if (!condition) failures.push(`contract fixture failed: ${label}`);
}

const service = read(servicePath);
const doc = read(docPath);
const treeActions = read(treeActionsPath);
const relationshipsActions = read(relationshipsActionsPath);
const runtimeDoc = read(a17nRuntimeDocPath);
const packageJson = readJson("package.json");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "planAndExecuteAdminParentLink",
  "planAndExecuteAdminChildLink",
  "AdminCanonicalFamilyTransactionExecutor",
  "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
  "relationships.create",
  "people.create",
  "wouldCreateCycle",
  "planCanonicalFamilyMutation",
  "OWNER_REVIEW_REQUIRED",
  "MULTIPLE_CHILD_FAMILY_CONTEXTS",
  "MULTIPLE_SPOUSE_CONTEXTS",
  "PARENT_LINK_ALREADY_EXISTS",
  "CHILD_LINK_ALREADY_EXISTS",
  "Đã gắn cha/mẹ vào gia đình chuẩn.",
  "Thao tác cần transaction an toàn trước khi được bật.",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

rejectPattern(
  service,
  /\.from\(|\.insert\(|\.delete\(|\.upsert\(|\.rpc\(|\.from\([\s\S]{0,240}\.update\(/i,
  "direct Supabase mutation",
);
rejectPattern(service, /SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i, "service role");
rejectPattern(service, /SECURITY\s+DEFINER/i, "SECURITY DEFINER");
rejectPattern(service, /full_name|display_name|birth_date|notes_private|email/i, "PII diagnostics");

assertCase("1. child with one-parent family extends same planned family", /existingFamily\?\.parents/.test(service) && /uniqueParents/.test(service));
assertCase("2. child without family plans create but blocks without executor", /CREATE_NEW_CANONICAL/.test(read("lib/family/canonical-family-service.ts")) && /transactionBlocked/.test(service));
assertCase("3. multiple child family contexts fail closed", /MULTIPLE_CHILD_FAMILY_CONTEXTS/.test(service));
assertCase("4. canonical family reuse supported by domain call", /familyToReuseId/.test(service));
assertCase("5. duplicate parent link no-op", /PARENT_LINK_ALREADY_EXISTS/.test(service));
assertCase("6. parent equals child blocked", /input\.parentId === input\.childId/.test(service));
assertCase("7. cycle creation blocked", /BLOCKED_CYCLE/.test(service) && /wouldCreateCycle/.test(service));
assertCase("8. merged family not reused", /canonicalStatus !== "merged"/.test(service));
assertCase("9. voided family not reused", /canonicalStatus !== "voided"/.test(service));
assertCase("10. missing person reference blocked by domain", /CANONICAL_FAMILY_PERSON_REFERENCE_MISSING/.test(read("lib/family/canonical-family-service.ts")));
assertCase("11. first child create blocked without executor", /ADMIN_CHILD_CANONICAL_LINK/.test(service) && /transactionBlocked/.test(service));
assertCase("12. second child same parent set uses context", /selectedContext/.test(service));
assertCase("13. eight children one family covered in A-17M identity", read("scripts/check-a17m-canonical-family-domain-service.cjs").includes("eight children one family identity"));
assertCase("14. multiple spouse contexts require selection", /MULTIPLE_SPOUSE_CONTEXTS/.test(service));
assertCase("15. existing child membership no-op", /CHILD_LINK_ALREADY_EXISTS/.test(service));
assertCase("16. conflicting child role fails closed pending executor", /OWNER_REVIEW_REQUIRED/.test(service));
assertCase("17. duplicate legacy candidates require review", /CANONICAL_FAMILY_LEGACY_DUPLICATE_REVIEW_REQUIRED/.test(service));
assertCase("18. new spouse parent set differs through canonical identity", read("scripts/check-a17m-canonical-family-domain-service.cjs").includes("different spouse different identity"));
assertCase("19. person creation failure creates no family", /createNewPersonBeforeLink/.test(service) && /BLOCKED_TRANSACTION_EXECUTOR_REQUIRED/.test(service));
assertCase("20. family creation failure creates no memberships", /transactionExecutor/.test(service) && !/createFamily\(/.test(service));
assertCase("21. parent membership failure rolls back via executor requirement", /AdminCanonicalFamilyTransactionExecutor/.test(service));
assertCase("22. child membership failure rolls back via executor requirement", /AdminCanonicalFamilyTransactionExecutor/.test(service));
assertCase("23. audit failure follows atomicity contract", /sourceAction/.test(service));
assertCase("24. no executor means no mutation", /mutationExecuted: false/.test(service));
assertCase("25. importer unchanged", !read("lib/import/giapha4/official-import-service.ts").includes("admin-canonical-family-link-service"));
assertCase("26. add-spouse unchanged", /createCoupleRelationship\(/.test(treeActions));
assertCase("27. public tree unchanged", !read("lib/family/public-family-service.ts").includes("admin-canonical-family-link-service"));
assertCase("28. graph/layout unchanged", !read("lib/family/tree-graph-builder.ts").includes("admin-canonical-family-link-service") && !read("lib/family/tree-layout-elk.ts").includes("admin-canonical-family-link-service"));
assertCase("29. no production credentials required", !/SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i.test(service));
assertCase("30. no PII diagnostics", !/full_name|display_name|birth_date|notes_private|email/i.test(service));

const treeDirectCreateCount =
  (treeActions.match(/createTreeFamily\("Family created from tree editor"/g) ?? [])
    .length;
if (treeDirectCreateCount !== 0) {
  failures.push(
    `expected unsafe tree direct create count 0 after A-17N-R activation, got ${treeDirectCreateCount}`,
  );
}
if (!treeActions.includes("admin-canonical-family-runtime-service")) {
  failures.push("admin tree actions must call A-17N-R canonical runtime service");
}
if (
  !runtimeDoc.includes(
    "A17N_R_STATUS=PASS_RUNTIME_INTEGRATION_DEPLOYED_AND_NO_MUTATION_SMOKE_VERIFIED",
  )
) {
  failures.push("A-17N-R activation document missing");
}
if (relationshipsActions.includes("admin-canonical-family-link-service")) {
  failures.push("relationships actions must not call blocked A-17N service yet");
}

for (const token of [
  "A17N_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED_FOUNDATION_READY",
  "PRECONDITION_A17M_COMMIT_PRESENT=YES",
  "WORKTREE_CLEAN_BEFORE_PHASE=YES",
  "REMOTE_SYNC_BEFORE_PHASE=LOCAL_AHEAD_2_NO_DIVERGENCE",
  "ADMIN_PARENT_ACTION_INTEGRATED=NO_BLOCKED",
  "ADMIN_CHILD_ACTION_INTEGRATED=NO_BLOCKED",
  "UNCONDITIONAL_PARENT_FAMILY_CREATE_REMOVED=NO_BLOCKED",
  "UNCONDITIONAL_CHILD_FAMILY_CREATE_REMOVED=NO_BLOCKED",
  "TRANSACTION_BOUNDARY_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
  "CANONICAL_FAMILY_PRODUCTION_CALLER_COUNT=0",
  "IMPORTER_RUNTIME_CHANGED=NO",
  "ADD_SPOUSE_RUNTIME_CHANGED=NO",
  "PUBLIC_TREE_RUNTIME_CHANGED=NO",
  "GRAPH_LAYOUT_RUNTIME_CHANGED=NO",
  "MIGRATION_CREATED=NO",
  "SQL_EXECUTED=NO",
  "LEGACY_RECONCILIATION_EXECUTED=NO",
  "PRODUCTION_MUTATION_SMOKE_EXECUTED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
  "PACKAGE_DEPENDENCY_INSTALLED=NO",
  "OWNER_REVIEW_A17N_THEN_START_SEPARATE_A17O_IMPORTER_CANONICAL_GROUPING_FIX",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17N_ADMIN_PARENT_CHILD_CANONICAL_WRITE_PATH.md", "index A17N"],
  [workLog, "A17N_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED_FOUNDATION_READY", "work log A17N"],
  [decisionLog, "Decision 333 - A-17N blocks admin canonical write activation until a transaction executor exists", "decision A17N"],
  [handoff, "A17N_STATUS=BLOCKED_TRANSACTION_EXECUTOR_REQUIRED_FOUNDATION_READY", "handoff A17N"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17n-admin-parent-child-canonical-write-path"] !==
  "node scripts/check-a17n-admin-parent-child-canonical-write-path.cjs"
) {
  failures.push("missing package script check:a17n-admin-parent-child-canonical-write-path");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const a17oTx1MigrationFiles = new Set([
  "db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql",
  "supabase/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql",
]);
const allowedChangedFiles = new Set([
  servicePath,
  docPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a17m-canonical-family-domain-service.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
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
  "docs/PLAN_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE.md",
  "lib/import/giapha4/canonical-family-grouping.ts",
  "scripts/check-a17o-importer-canonical-family-grouping.cjs",
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
  "docs/PLAN_A17A_TREE_BASELINE_EVIDENCE.md",
  "docs/PLAN_A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT.md",
  "docs/PLAN_A17F_FAMILY_RECONCILIATION_DRY_RUN.md",
  "docs/PLAN_A17G_FAMILY_RECONCILIATION_ROLLBACK_DESIGN.md",
  "docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md",
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
  ...a17nTx1MigrationFiles,
  ...a17oTx1MigrationFiles,
]);

for (const changedFile of changedFiles) {
  if (
    (changedFile.startsWith("db/migrations/") ||
      changedFile.startsWith("supabase/migrations/")) &&
    !a17nTx1MigrationFiles.has(changedFile) &&
    !a17oTx1MigrationFiles.has(changedFile)
  ) {
    failures.push(`migration changed during A-17N: ${changedFile}`);
  }
  if (!allowedChangedFiles.has(changedFile)) {
    failures.push(`unexpected A-17N dirty file: ${changedFile}`);
  }
}

if (failures.length > 0) {
  console.error("A-17N admin parent/child canonical write path check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17N admin parent/child canonical write path check passed.");

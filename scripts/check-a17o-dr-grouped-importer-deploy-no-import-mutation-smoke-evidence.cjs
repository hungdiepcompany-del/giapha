#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const evidenceDocPath =
  "docs/PLAN_A17O_DR_GROUPED_IMPORTER_DEPLOY_NO_IMPORT_MUTATION_SMOKE_EVIDENCE.md";
const a17oRDocPath =
  "docs/PLAN_A17O_R_GROUPED_IMPORTER_RUNTIME_INTEGRATION.md";
const a17oDocPath =
  "docs/PLAN_A17O_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX.md";
const checkerPath =
  "scripts/check-a17o-dr-grouped-importer-deploy-no-import-mutation-smoke-evidence.cjs";

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

const evidenceDoc = read(evidenceDocPath);
const a17oRDoc = read(a17oRDocPath);
const a17oDoc = read(a17oDocPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "A17O_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_IMPORT_MUTATION_SMOKE_RECORDED",
  "A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_DEPLOYED_AND_VERIFIED",
  "RUNTIME_COMMIT=e8def2f",
  "RUNTIME_COMMIT_PRESENT_ON_ORIGIN_MAIN=YES",
  "ORIGIN_MAIN_CONTAINS_E8DEF2F=YES",
  "PUSH_STATUS=PASS",
  "PUSHED_COMMIT=e8def2f",
  "CLOUDFLARE_DEPLOY_STATUS=PASS",
  "DEPLOYED_COMMIT=e8def2f",
  "PRODUCTION_BASE_URL=https://web-gia-pha.hungdiepcompany.workers.dev",
  "DATABASE_BEFORE_SMOKE=PASS",
  "BROWSER_NO_IMPORT_MUTATION_SMOKE=PASS",
  "DATABASE_AFTER_SMOKE=PASS",
  "IMPORT_ADMIN_ROUTE_ACCESSIBLE=YES",
  "AUTHENTICATION_SUCCESS=YES",
  "VIETNAMESE_UI_RENDERED=YES",
  "BROWSER_RUNTIME_ERROR=NO",
  "GROUPED_RPC_VISIBLE_IN_NETWORK=NO",
  "OLD_IMPORT_RPC_VISIBLE_IN_NETWORK=NO",
  "IMPORT_FORM_SUBMITTED=NO",
  "PRODUCTION_IMPORT_EXECUTED=NO",
  "ACTIVE_FAMILY_COUNT_AFTER=74",
  "ACTIVE_PARENT_MEMBERSHIP_COUNT_AFTER=140",
  "ACTIVE_CHILD_MEMBERSHIP_COUNT_AFTER=73",
  "GROUPED_BATCH_COUNT_AFTER=0",
  "IDEMPOTENCY_ROW_COUNT_AFTER=0",
  "GROUPED_EXECUTOR_REVISION_COUNT_AFTER=0",
  "GROUPED_ROLLBACK_MANIFEST_COUNT_AFTER=0",
  "CANONICAL_KEY_BACKFILL_COUNT_AFTER=0",
  "NEW_GROUPED_EXECUTOR_EXISTS=YES",
  "OLD_EXECUTOR_PRESERVED=YES",
  "SECURITY_INVOKER=YES",
  "FIXED_SEARCH_PATH=YES",
  "AUTHENTICATED_EXECUTE_COUNT=1",
  "ANON_EXECUTE_COUNT=0",
  "PUBLIC_EXECUTE_COUNT=0",
  "COMPLETED_PRODUCTION_SESSION_STILL_NON_EXECUTABLE=YES",
  "OFFICIAL_IMPORT_RPC_CALLED=NO",
  "GENEALOGY_ROWS_MODIFIED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "RUNTIME_CHANGED=NO",
  "MIGRATION_CREATED=NO",
  "MIGRATION_CHANGED=NO",
  "SQL_EXECUTED=NO",
  "DEPLOY_EXECUTED_BY_PHASE=NO",
  "PACKAGE_DEPENDENCY_INSTALLED=NO",
  "A17_LEGACY_RECONCILIATION_READINESS=READY_ALL_KNOWN_WRITE_PATHS_FIXED_AND_DEPLOYED",
]) {
  requireIncludes(evidenceDoc, token, `evidence token ${token}`);
}

for (const [content, token, label] of [
  [
    a17oRDoc,
    "A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_DEPLOYED_AND_VERIFIED",
    "A-17O-R deployed status",
  ],
  [
    a17oRDoc,
    "NEXT_ACTION=START_A17_LEGACY_CANONICAL_FAMILY_RECONCILIATION_EXECUTION_DESIGN",
    "A-17O-R next action",
  ],
  [
    a17oDoc,
    "A17_LEGACY_RECONCILIATION_READINESS=READY_ALL_KNOWN_WRITE_PATHS_FIXED_AND_DEPLOYED",
    "A-17O reconciliation readiness",
  ],
  [
    index,
    "PLAN_A17O_DR_GROUPED_IMPORTER_DEPLOY_NO_IMPORT_MUTATION_SMOKE_EVIDENCE.md",
    "index A-17O-DR",
  ],
  [
    workLog,
    "A17O_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_IMPORT_MUTATION_SMOKE_RECORDED",
    "work log A-17O-DR",
  ],
  [
    decisionLog,
    "Decision 343 - A-17O-DR records grouped importer deploy smoke evidence",
    "decision log A-17O-DR",
  ],
  [
    handoff,
    "A17O_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_IMPORT_MUTATION_SMOKE_RECORDED",
    "handoff A-17O-DR",
  ],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a17o-dr-grouped-importer-deploy-no-import-mutation-smoke-evidence"
  ] !==
  "node scripts/check-a17o-dr-grouped-importer-deploy-no-import-mutation-smoke-evidence.cjs"
) {
  failures.push(
    "missing package script check:a17o-dr-grouped-importer-deploy-no-import-mutation-smoke-evidence",
  );
}

const originBranches = git(["branch", "-r", "--contains", "e8def2f"]);
if (!originBranches.includes("origin/main")) {
  failures.push("origin/main does not contain e8def2f");
}

const remoteSync = git(["rev-list", "--left-right", "--count", "HEAD...origin/main"]).trim();
if (!["0\t0", "0 0", "1\t0", "1 0"].includes(remoteSync)) {
  failures.push(`unexpected A-17O-DR remote sync state: ${remoteSync}`);
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  evidenceDocPath,
  a17oRDocPath,
  a17oDocPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
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
  "scripts/check-a17o-importer-canonical-family-grouping.cjs",
  "scripts/check-a17o-r-grouped-importer-runtime-integration.cjs",
  "scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs",
  "scripts/check-a17o-tx1r-grouped-import-executor-manual-apply-verification.cjs",
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
  "docs/PLAN_A17A_TREE_BASELINE_EVIDENCE.md",
  "docs/PLAN_A17E_FAMILY_DUPLICATE_READ_ONLY_AUDIT.md",
  "docs/PLAN_A17F_FAMILY_RECONCILIATION_DRY_RUN.md",
  "docs/PLAN_A17G_FAMILY_RECONCILIATION_ROLLBACK_DESIGN.md",
  "docs/PLAN_A17EG_FAMILY_RECONCILIATION_AUDIT_DRY_RUN_BUNDLE.md",
]);

for (const file of changedFiles) {
  if (/^(app|components|lib|services)\//.test(file)) {
    failures.push(`runtime file changed during A-17O-DR: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file) && !allowedChangedFiles.has(file)) {
    failures.push(`migration changed during A-17O-DR: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected A-17O-DR dirty file: ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(`forbidden env file ${file}`);
  }
  if (file.startsWith("supabase/.temp/")) {
    failures.push(`forbidden supabase temp ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-17O-DR deploy/no-import-mutation smoke evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17O-DR deploy/no-import-mutation smoke evidence check passed.");

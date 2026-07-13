#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const evidenceDocPath =
  "docs/PLAN_A17O_TX1R_GROUPED_IMPORT_EXECUTOR_MANUAL_APPLY_VERIFICATION.md";
const tx1DocPath =
  "docs/PLAN_A17O_TX1_GROUPED_OFFICIAL_IMPORT_TRANSACTION_EXECUTOR_CANDIDATE.md";
const a17oDocPath = "docs/PLAN_A17O_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX.md";
const checkerPath =
  "scripts/check-a17o-tx1r-grouped-import-executor-manual-apply-verification.cjs";
const migrationPath =
  "db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql";
const mirrorPath =
  "supabase/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql";
const verifierPath =
  "db/checks/20260713_check_a17o_tx1_grouped_official_import_transaction_executor.sql";
const expectedSha =
  "87EE4675746D948C3B32E8E7809A5945F8EA153EC2A6107355EF3E271E3DD4B2";
const sourceCommit = "0f02c93";

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
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
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

const evidenceDoc = read(evidenceDocPath);
const tx1Doc = read(tx1DocPath);
const a17oDoc = read(a17oDocPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const migration = read(migrationPath);
const mirror = read(mirrorPath);
const verifier = read(verifierPath);
const verifierWithoutComments = stripSqlComments(verifier);
const packageJson = readJson("package.json");

if (sha256Hex(migrationPath) !== expectedSha) failures.push("migration SHA drifted");
if (sha256Hex(mirrorPath) !== expectedSha) failures.push("mirror SHA drifted");
if (migration !== mirror) failures.push("migration mirror mismatch");
if (!git(["branch", "-r", "--contains", sourceCommit]).includes("origin/main")) {
  failures.push("origin/main does not contain source commit 0f02c93");
}

for (const token of [
  "A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED",
  "A17SQL_O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY",
  `SOURCE_COMMIT=${sourceCommit}`,
  `MIGRATION_FILE=${migrationPath}`,
  `SUPABASE_MIRROR_FILE=${mirrorPath}`,
  `MIGRATION_SHA256=${expectedSha}`,
  "MIRROR_MATCH=YES",
  "MIGRATION_APPLIED=YES_OWNER_MANUAL_PRODUCTION",
  "MANUAL_PRODUCTION_APPLY_RECORDED=YES",
  `VERIFIER_FILE=${verifierPath}`,
  "VERIFIER_SELECT_ONLY=YES",
  "VERIFIER_ALL_REQUIRED_CHECKS_PASS=YES",
  "VERIFIER_EXECUTED_BY_OWNER=YES",
  "SQL_EXECUTED_BY_PHASE=NO",
  "VERIFIER_RERUN_BY_CODEX=NO",
  "NEW_GROUPED_EXECUTOR_EXISTS=YES",
  "OLD_EXECUTOR_PRESERVED=YES",
  "OLD_EXECUTOR_SIGNATURE_UNCHANGED=YES",
  "SECURITY_INVOKER=YES",
  "FIXED_SEARCH_PATH=YES",
  "AUTHENTICATED_EXECUTE_COUNT=1",
  "ANON_EXECUTE_COUNT=0",
  "PUBLIC_EXECUTE_COUNT=0",
  "GROUPED_PAYLOAD_CONTRACT_PRESENT=YES",
  "IDEMPOTENCY_TABLE_EXISTS=YES",
  "IDEMPOTENCY_RLS_ENABLED=YES",
  "IDEMPOTENCY_POLICIES_EXIST=YES",
  "IDEMPOTENCY_CONSTRAINTS_EXIST=YES",
  "MUTATION_PLAN_HASH_CONSTRAINT_EXISTS=YES",
  "ROLLBACK_GROUPED_SUMMARY_CONTRACT_EXISTS=YES",
  "COMPLETED_PRODUCTION_SESSION_STILL_NON_EXECUTABLE=YES",
  "ACTIVE_FAMILY_COUNT_AFTER=74",
  "ACTIVE_PARENT_MEMBERSHIP_COUNT_AFTER=140",
  "ACTIVE_CHILD_MEMBERSHIP_COUNT_AFTER=73",
  "GROUPED_BATCH_COUNT=0",
  "IDEMPOTENCY_ROW_COUNT=0",
  "GROUPED_EXECUTOR_REVISION_COUNT=0",
  "GROUPED_ROLLBACK_MANIFEST_COUNT=0",
  "CANONICAL_KEY_BACKFILL_COUNT=0",
  "OFFICIAL_IMPORT_RPC_CALLED=NO",
  "PRODUCTION_IMPORT_EXECUTED=NO",
  "GENEALOGY_ROWS_MODIFIED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "A17O_IMPORTER_RUNTIME_ACTIVE=NO",
  "A17O_R_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_SOURCE_INTEGRATED",
  "MIGRATION_CREATED=NO",
  "MIGRATION_CHANGED=NO",
  "DEPLOY=NO",
  "PACKAGE_DEPENDENCY_INSTALLED=NO",
  "A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED",
  "NEXT_ACTION=OWNER_REVIEW_A17O_R_THEN_SEPARATE_PUSH_DEPLOY_AND_PRODUCTION_NO_IMPORT_MUTATION_SMOKE",
]) {
  requireIncludes(evidenceDoc, token, `evidence token ${token}`);
}

for (const token of [
  "A17O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED",
  "A17SQL_O_TX1_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY",
  "MIGRATION_APPLIED=YES_OWNER_MANUAL_PRODUCTION",
  "VERIFIER_ALL_REQUIRED_CHECKS_PASS=YES",
  "A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED",
]) {
  requireIncludes(tx1Doc, token, `TX1 doc token ${token}`);
}

for (const token of [
  "A17O_STATUS=PASS_GROUPED_IMPORTER_RUNTIME_SOURCE_INTEGRATED",
  "A17O_TX1_GROUPED_EXECUTOR_CANDIDATE_APPLIED=YES_OWNER_MANUAL_PRODUCTION",
  "A17O_TX1_GROUPED_EXECUTOR_CANDIDATE_VERIFIED=YES",
  "A17O_RUNTIME_INTEGRATION_READINESS=READY_GROUPED_EXECUTOR_APPLIED_AND_VERIFIED",
]) {
  requireIncludes(a17oDoc, token, `A-17O doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17O_TX1R_GROUPED_IMPORT_EXECUTOR_MANUAL_APPLY_VERIFICATION.md", "index TX1R"],
  [workLog, "A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED", "work log TX1R"],
  [
    decisionLog,
    "Decision 341 - A-17O-TX1R records grouped executor production verification",
    "decision TX1R",
  ],
  [handoff, "A17O_TX1R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_APPLY_AND_SELECT_ONLY_VERIFY_RECORDED", "handoff TX1R"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "a17o_tx1_function_exists",
  "a17o_tx1_old_executor_preserved",
  "a17o_tx1_grouped_payload_contract_present",
  "a17o_tx1_idempotency_rls_enabled",
  "a17o_tx1_completed_production_session_still_non_executable",
]) {
  requireIncludes(verifier, token, `verifier token ${token}`);
}

rejectPattern(
  verifierWithoutComments,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "verifier must remain SELECT-only",
);
rejectPattern(verifierWithoutComments, /\bfor\s+update\b/i, "verifier must not lock rows");
rejectPattern(
  verifierWithoutComments,
  /\ba17o_tx_execute_grouped_giapha4_official_import\s*\(/i,
  "verifier must not call grouped executor",
);
rejectPattern(
  verifierWithoutComments,
  /\ba16p_tx_execute_giapha4_official_import\s*\(/i,
  "verifier must not call old executor",
);

for (const token of [
  "public.a17o_tx_execute_grouped_giapha4_official_import",
  "security invoker",
  "set search_path = public, auth, pg_temp",
  "official_import_grouped_execution_idempotency",
  "grouped_family_rollback_summary",
]) {
  requireIncludes(migration, token, `migration token ${token}`);
}

if (
  packageJson?.scripts?.["check:a17o-tx1r-grouped-import-executor-manual-apply-verification"] !==
  "node scripts/check-a17o-tx1r-grouped-import-executor-manual-apply-verification.cjs"
) {
  failures.push("missing package script check:a17o-tx1r-grouped-import-executor-manual-apply-verification");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  evidenceDocPath,
  tx1DocPath,
  a17oDocPath,
  "docs/PLAN_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE.md",
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
  "scripts/check-a17o-tx1-grouped-official-import-transaction-executor-candidate.cjs",
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
  "lib/import/giapha4/canonical-family-grouping.ts",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/grouped-official-import-executor-adapter.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "lib/import/giapha4/official-import-service.ts",
]);

const a17oRRuntimeFiles = new Set([
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts",
  "components/imports/import-session-manifest-panel.tsx",
  "lib/import/giapha4/canonical-family-grouping.ts",
  "lib/import/giapha4/dry-run-mapping-preview-service.ts",
  "lib/import/giapha4/grouped-official-import-executor-adapter.ts",
  "lib/import/giapha4/import-review-pack-service.ts",
  "lib/import/giapha4/official-import-service.ts",
]);

for (const file of changedFiles) {
  if (/^(app|components|lib|services)\//.test(file) && !a17oRRuntimeFiles.has(file)) {
    failures.push(`runtime file changed during A-17O-TX1R: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file)) {
    failures.push(`migration file changed during A-17O-TX1R: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected A-17O-TX1R dirty file: ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
}

if (failures.length > 0) {
  console.error("A-17O-TX1R grouped import executor manual apply verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17O-TX1R grouped import executor manual apply verification check passed.");

#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const dbMigrationPath =
  "db/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260712_0023_a17h_canonical_family_schema_foundation_candidate.sql";
const priorMigrationPath =
  "db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql";
const priorSupabaseMigrationPath =
  "supabase/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql";
const verifierPath =
  "db/checks/20260712_check_a17i_canonical_family_schema_post_apply.sql";
const planPath =
  "docs/PLAN_A17H_CANONICAL_FAMILY_SCHEMA_FOUNDATION_CANDIDATE.md";
const checkerPath =
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs";

const expectedMigrationSha =
  "B5E62D048F284D9E4F03E2294FE060E696E7905890D88587A18503E0786A07AA";
const expectedPriorMigrationSha =
  "97EC8E3108033CB4F26E86B5E348C5A15BF33DCC46650F384735482FA4712CA3";
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

function stripSqlComments(content) {
  return content
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
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

const dbMigration = read(dbMigrationPath);
const supabaseMigration = read(supabaseMigrationPath);
const priorMigration = read(priorMigrationPath);
const priorSupabaseMigration = read(priorSupabaseMigrationPath);
const verifier = read(verifierPath);
const plan = read(planPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

if (dbMigration !== supabaseMigration) {
  failures.push("migration 0023 db/supabase mirrors differ");
}
if (sha256Hex(dbMigrationPath) !== expectedMigrationSha) {
  failures.push("db migration 0023 SHA drifted");
}
if (sha256Hex(supabaseMigrationPath) !== expectedMigrationSha) {
  failures.push("supabase migration 0023 SHA drifted");
}
if (sha256Hex(priorMigrationPath) !== expectedPriorMigrationSha) {
  failures.push("db migration 0022 immutable SHA changed");
}
if (sha256Hex(priorSupabaseMigrationPath) !== expectedPriorMigrationSha) {
  failures.push("supabase migration 0022 immutable SHA changed");
}
if (priorMigration !== priorSupabaseMigration) {
  failures.push("migration 0022 db/supabase mirrors differ");
}

for (const token of [
  "A17H_CANONICAL_FAMILY_SCHEMA_FOUNDATION_CANDIDATE",
  "SQL_CANDIDATE_STATUS=NOT_APPLIED",
  "NO_GENEALOGY_ROW_UPDATE",
  "NO_CANONICAL_KEY_BACKFILL",
  "NO_FAMILY_RECONCILIATION_EXECUTION",
  "NO_RECONCILIATION_RPC",
  "NO_AUTOMATIC_MERGE_TRIGGER",
  "create table if not exists public.family_reconciliation_batches",
  "alter table public.families",
  "add column if not exists canonical_key text",
  "add column if not exists canonical_status text not null default 'legacy_unreviewed'",
  "add column if not exists merged_into_family_id uuid references public.families(id) on delete restrict",
  "add column if not exists reconciliation_batch_id uuid references public.family_reconciliation_batches(id) on delete restrict",
  "families_canonical_status_check",
  "'legacy_unreviewed'",
  "'canonical'",
  "'merged'",
  "'voided'",
  "'owner_review_required'",
  "families_no_self_merge_check",
  "families_canonical_key_active_canonical_unique",
  "where deleted_at is null",
  "and canonical_status = 'canonical'",
  "create table if not exists public.family_canonicalization_decisions",
  "'pending_review'",
  "'approved_merge'",
  "'approved_keep_separate'",
  "'blocked'",
  "'superseded'",
  "create table if not exists public.family_reconciliation_rollback_manifests",
  "affected_family_records_before",
  "parent_memberships_before",
  "child_memberships_before",
  "couple_links_before",
  "layout_refs_before",
  "canonical_family_choice",
  "merged_family_ids",
  "voided_family_ids",
  "audit_revision_ids",
  "alter table public.family_reconciliation_batches enable row level security",
  "alter table public.family_canonicalization_decisions enable row level security",
  "alter table public.family_reconciliation_rollback_manifests enable row level security",
  "to authenticated",
  "public.has_permission('relationships.update')",
  "public.has_permission('permissions.manage')",
  "revoke all on table public.family_reconciliation_batches from anon",
  "revoke all on table public.family_reconciliation_batches from public",
]) {
  requireIncludes(dbMigration, token, `migration token ${token}`);
}

const migrationWithoutComments = stripSqlComments(dbMigration);
rejectPattern(migrationWithoutComments, /^\s*(insert\s+into|update|delete|truncate|call)\b/im, "DML or CALL in migration");
rejectPattern(migrationWithoutComments, /\bcreate\s+(?:or\s+replace\s+)?function\b/i, "function or RPC creation");
rejectPattern(migrationWithoutComments, /\bsecurity\s+definer\b/i, "SECURITY DEFINER");
rejectPattern(migrationWithoutComments, /\bcreate\s+trigger\b/i, "automatic trigger creation");
rejectPattern(migrationWithoutComments, /^\s*grant\b/im, "GRANT statement");
rejectPattern(migrationWithoutComments, /\bcreate\s+policy\b[\s\S]*?\bto\s+(anon|public)\b/i, "anon/PUBLIC policy");
rejectPattern(migrationWithoutComments, /\b(a16p_tx_execute_giapha4_official_import|official import rpc)\b/i, "official import RPC reference");

for (const token of [
  "A-17I post-apply verifier for A-17H",
  "SELECT-only metadata and aggregate checks",
  "expected_columns",
  "families_canonical_status_check",
  "families_no_self_merge_check",
  "families_canonical_key_active_canonical_unique",
  "family_reconciliation_batches",
  "family_canonicalization_decisions",
  "family_reconciliation_rollback_manifests",
  "a17h_no_anon_or_public_policies",
  "a17h_no_anon_or_public_grants",
  "a17h_existing_family_count_unchanged",
  "a17h_no_legacy_rows_marked_merged_or_voided",
  "a17h_no_canonical_key_backfill",
  "a17h_no_batch_decision_or_manifest_seeded",
]) {
  requireIncludes(verifier, token, `verifier token ${token}`);
}

const verifierWithoutComments = stripSqlComments(verifier);
rejectPattern(verifierWithoutComments, /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call|do)\b/im, "non-SELECT statement in post-apply verifier");
rejectPattern(verifierWithoutComments, /\b(a16p_tx_execute_giapha4_official_import)\b/i, "official import RPC in verifier");

for (const token of [
  "A17H_STATUS=SCHEMA_FOUNDATION_CANDIDATE_READY_FOR_OWNER_REVIEW",
  "SCHEMA_FOUNDATION_READY_FOR_OWNER_REVIEW=YES",
  `DB_MIGRATION_SHA256=${expectedMigrationSha}`,
  `SUPABASE_MIRROR_SHA256=${expectedMigrationSha}`,
  "MIRROR_MATCH=YES",
  "PRIOR_MIGRATIONS_UNCHANGED=YES",
  "CURRENT_FAMILY_COUNT=74",
  "OWNER_REVIEW_GROUP_COUNT=22",
  "REDUNDANT_FAMILY_COUNT=38",
  "EXPECTED_FAMILY_COUNT_AFTER=36",
  "SAFE_AUTOMATIC_GROUP_COUNT=0",
  "WRITE_PATH_REPAIR_REQUIRED_BEFORE_RECONCILIATION=YES",
  "EXISTING_FAMILY_ROWS_UPDATED=NO",
  "CANONICAL_KEYS_BACKFILLED=NO",
  "FAMILY_RECONCILIATION_EXECUTED=NO",
  "POST_APPLY_VERIFIER_EXECUTED=NO",
  "APPROVE_A17H_CANONICAL_FAMILY_SCHEMA_CANDIDATE",
]) {
  requireIncludes(plan, token, `plan token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17H_CANONICAL_FAMILY_SCHEMA_FOUNDATION_CANDIDATE.md", "index A17H entry"],
  [workLog, "A17H_STATUS=SCHEMA_FOUNDATION_CANDIDATE_READY_FOR_OWNER_REVIEW", "work log A17H status"],
  [decisionLog, "Decision 330 - A-17H canonical family schema foundation candidate", "decision log A17H"],
  [handoff, "A17H_STATUS=SCHEMA_FOUNDATION_CANDIDATE_READY_FOR_OWNER_REVIEW", "handoff A17H status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17h-canonical-family-schema-foundation-candidate"] !==
  "node scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs"
) {
  failures.push("missing package script check:a17h-canonical-family-schema-foundation-candidate");
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
  dbMigrationPath,
  supabaseMigrationPath,
  verifierPath,
  planPath,
  checkerPath,
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
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
  ...a17oTx1MigrationFiles,
  "app/(admin)/admin/tree/edit/actions.ts",
  "lib/family/admin-canonical-family-runtime-service.ts",
  "lib/family/admin-canonical-family-transaction-adapter.ts",
  "lib/family/canonical-family-supabase-repository.ts",
  ...a17nTx1MigrationFiles,
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const changedFile of changedFiles) {
  if (
    (changedFile.startsWith("db/migrations/") ||
      changedFile.startsWith("supabase/migrations/")) &&
    changedFile !== dbMigrationPath &&
    changedFile !== supabaseMigrationPath &&
    !a17nTx1MigrationFiles.has(changedFile) &&
    !a17oTx1MigrationFiles.has(changedFile) &&
    !allowedChangedFiles.has(changedFile)
  ) {
    failures.push(`prior migration changed: ${changedFile}`);
  }

  if (!allowedChangedFiles.has(changedFile)) {
    failures.push(`unexpected A-17H dirty file: ${changedFile}`);
  }
}

if (failures.length > 0) {
  console.error("A-17H canonical family schema foundation candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17H canonical family schema foundation candidate check passed.");

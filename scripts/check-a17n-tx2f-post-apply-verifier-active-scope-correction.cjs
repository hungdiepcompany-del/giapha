#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const verifierPath =
  "db/checks/20260712_check_a17n_tx1_admin_canonical_family_transaction_executor.sql";
const tx2DocPath =
  "docs/PLAN_A17N_TX2_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_POST_APPLY_VERIFICATION.md";
const tx2fDocPath =
  "docs/PLAN_A17N_TX2F_POST_APPLY_VERIFIER_ACTIVE_SCOPE_CORRECTION.md";
const checkerPath =
  "scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs";
const dbMigrationPath =
  "db/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260712_0024_a17n_tx1_admin_canonical_family_transaction_executor_candidate.sql";
const expected0024Sha =
  "43D9D40C509D8088230E688D76146A93CFBB00332E449E2F4A3DE784367B7BE9";

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
  return crypto.createHash("sha256").update(readBuffer(relativePath)).digest("hex").toUpperCase();
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

const verifier = read(verifierPath);
const verifierWithoutComments = stripSqlComments(verifier);
const tx2Doc = read(tx2DocPath);
const tx2fDoc = read(tx2fDocPath);
const docs = `${tx2Doc}\n${tx2fDoc}`;
const packageJson = readJson("package.json");
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

if (sha256Hex(dbMigrationPath) !== expected0024Sha) failures.push("db migration 0024 SHA drifted");
if (sha256Hex(supabaseMigrationPath) !== expected0024Sha) {
  failures.push("supabase migration 0024 SHA drifted");
}
if (read(dbMigrationPath) !== read(supabaseMigrationPath)) {
  failures.push("migration 0024 db/supabase mirrors differ");
}

for (const token of [
  "(select count(*)::integer from public.families) as total_family_rows",
  "(select count(*)::integer from public.families where deleted_at is null) as active_family_count",
  "(select count(*)::integer from public.families where deleted_at is not null) as deleted_family_count",
  "(select count(*)::integer from public.family_parents) as total_parent_membership_rows",
  "(select count(*)::integer from public.family_parents where deleted_at is null) as row_active_parent_membership_count",
  "from public.family_parents fp",
  "join public.families f on f.id = fp.family_id",
  "where fp.deleted_at is null",
  "and f.deleted_at is null",
  "as active_parent_membership_count",
  "and f.deleted_at is not null",
  "as orphan_active_parent_membership_count",
  "(select count(*)::integer from public.family_children) as total_child_membership_rows",
  "(select count(*)::integer from public.family_children where deleted_at is null) as row_active_child_membership_count",
  "from public.family_children fc",
  "join public.families f on f.id = fc.family_id",
  "as active_child_membership_count",
  "as orphan_active_child_membership_count",
  "transaction_executor_revision_count",
  "a17n_tx1_existing_family_count_unchanged",
  "active_family_count = 74",
  "a17n_tx1_parent_count_unchanged",
  "active_parent_membership_count = 140",
  "a17n_tx1_child_count_unchanged",
  "active_child_membership_count = 73",
  "a17n_tx2_total_physical_rows_informational",
  "total_family_rows = 75",
  "total_parent_membership_rows = 142",
  "total_child_membership_rows = 74",
  "baseline_contract', 'informational only; not active graph drift'",
  "a17n_tx2_row_level_active_rows_informational",
  "a17n_tx2_deleted_family_count_advisory",
  "deleted_family_count = 1",
  "a17n_tx2_orphan_active_parent_membership_advisory",
  "orphan_active_parent_membership_count = 2",
  "a17n_tx2_orphan_active_child_membership_advisory",
  "orphan_active_child_membership_count = 0",
  "a17n_tx2_no_transaction_executor_revision_rows",
  "a17n_tx1_no_seeded_idempotency_rows",
  "a17n_tx1_no_canonical_key_backfill",
  "a17n_tx1_no_reconciliation_rows_created",
]) {
  requireIncludes(verifier, token, `verifier token ${token}`);
}

rejectPattern(
  verifierWithoutComments,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "post-apply verifier must stay SELECT-only",
);
rejectPattern(verifierWithoutComments, /\bfor\s+update\b/i, "verifier must not lock rows");
rejectPattern(
  verifierWithoutComments,
  /\bselect\s+public\.execute_admin_canonical_family_parent_child_write\s*\(/i,
  "verifier must not call candidate RPC",
);
rejectPattern(
  verifierWithoutComments,
  /\bexecute_admin_canonical_family_parent_child_write\s*\([^)]/i,
  "verifier must not invoke transaction executor",
);

for (const token of [
  "A17N_TX2R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_VERIFIER_RECORDED",
  "OWNER_MANUAL_PRODUCTION_VERIFIER_EVIDENCE_RECORDED=YES",
  "A17N_TX2_INITIAL_RESULT=FALSE_NEGATIVE_COUNT_SCOPE_BUG",
  "A17N_TX2_STATUS=PASS_CORRECTED_ACTIVE_SCOPE_POST_APPLY_VERIFIED",
  "A17N_TX2F_STATUS=PASS_ACTIVE_SCOPE_CORRECTION_VERIFIED",
  "PRODUCTION_DATA_DRIFT=NO",
  "MIGRATION_0024_DATA_MUTATION=NO",
  "TRANSACTION_EXECUTOR_CALLED=NO",
  "CORRECTED_ACTIVE_SCOPE=active family + active membership + active owning family",
  "ACTIVE_FAMILY_COUNT=74",
  "ACTIVE_PARENT_MEMBERSHIP_COUNT=140",
  "ACTIVE_CHILD_MEMBERSHIP_COUNT=73",
  "TOTAL_FAMILY_ROWS=75",
  "TOTAL_PARENT_MEMBERSHIP_ROWS=142",
  "TOTAL_CHILD_MEMBERSHIP_ROWS=74",
  "DELETED_FAMILY_COUNT=1",
  "ORPHAN_ACTIVE_PARENT_MEMBERSHIP_UNDER_DELETED_FAMILY_COUNT=2",
  "ORPHAN_ACTIVE_CHILD_MEMBERSHIP_UNDER_DELETED_FAMILY_COUNT=0",
  "ORPHAN_ACTIVE_PARENT_MEMBERSHIP_COUNT=2",
  "ORPHAN_ACTIVE_CHILD_MEMBERSHIP_COUNT=0",
  "IDEMPOTENCY_ROW_COUNT=0",
  "TRANSACTION_EXECUTOR_REVISION_COUNT=0",
  "CANONICAL_KEY_BACKFILL_COUNT=0",
  "RECONCILIATION_ROWS_CREATED=0",
  "DO_NOT_DELETE_ORPHAN_ACTIVE_ROWS_IN_THIS_PHASE=YES",
  "DO_NOT_RESTORE_DELETED_FAMILY_IN_THIS_PHASE=YES",
  "DEFER_CLEANUP_TO_RECONCILIATION_DATA_QUALITY=YES",
  "A17N_R_REMAINS_BLOCKED_UNTIL_CORRECTED_POST_APPLY_VERIFIER_PASSES=YES",
  "A17N_R_READINESS=READY_POST_APPLY_VERIFIER_PASS_RECORDED",
  "CORRECTED_POST_APPLY_VERIFIER_EXECUTED=OWNER_MANUAL_PRODUCTION_SELECT_ONLY",
  "CORRECTED_POST_APPLY_VERIFIER_RESULT=PASS",
  "MIGRATION_CREATED=NO",
  "MIGRATION_0024_CHANGED=NO",
  "SQL_EXECUTED=NO",
  "RPC_CALLED=NO",
  "GENEALOGY_ROWS_MODIFIED=NO",
  "RUNTIME_CHANGED=NO",
  "RECONCILIATION_EXECUTED=NO",
  "IMPORT_RPC_CALLED=NO",
  "DEPLOY=NO",
  "PUSH=NO",
]) {
  requireIncludes(docs, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17N_TX2F_POST_APPLY_VERIFIER_ACTIVE_SCOPE_CORRECTION.md", "index A17N-TX2F"],
  [index, "PLAN_A17N_TX2_ADMIN_CANONICAL_FAMILY_TRANSACTION_EXECUTOR_POST_APPLY_VERIFICATION.md", "index A17N-TX2"],
  [workLog, "A17N_TX2R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_VERIFIER_RECORDED", "work log A17N-TX2R"],
  [decisionLog, "Decision 335 - A-17N-TX2F corrects post-apply verifier active graph scope", "decision A17N-TX2F"],
  [decisionLog, "Decision 336 - A-17N-TX2R records owner manual production verifier PASS", "decision A17N-TX2R"],
  [handoff, "A17N_TX2R_STATUS=PASS_OWNER_MANUAL_PRODUCTION_VERIFIER_RECORDED", "handoff A17N-TX2R"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a17n-tx2f-post-apply-verifier-active-scope-correction"] !==
  "node scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs"
) {
  failures.push("missing package script check:a17n-tx2f-post-apply-verifier-active-scope-correction");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  verifierPath,
  tx2DocPath,
  tx2fDocPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs",
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs",
  "scripts/check-a17m-canonical-family-domain-service.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
  "docs/PLAN_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION.md",
  "scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs",
  "app/(admin)/admin/tree/edit/actions.ts",
  "lib/family/admin-canonical-family-link-service.ts",
  "lib/family/admin-canonical-family-runtime-service.ts",
  "lib/family/admin-canonical-family-transaction-adapter.ts",
  "lib/family/canonical-family-supabase-repository.ts",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected A-17N-TX2F dirty file: ${file}`);
  if (/^(db\/migrations|supabase\/migrations)\//.test(file)) {
    failures.push(`migration file changed or added during A-17N-TX2F: ${file}`);
  }
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
}

if (failures.length > 0) {
  console.error("A-17N-TX2F post-apply verifier active-scope correction check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17N-TX2F post-apply verifier active-scope correction check passed.");

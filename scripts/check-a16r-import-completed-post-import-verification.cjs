#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFICATION.md";
const sqlPath =
  "db/checks/20260712_check_a16r_import_completed_post_import_verification.sql";
const checkerPath =
  "scripts/check-a16r-import-completed-post-import-verification.cjs";
const packagePath = "package.json";
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

function stripSqlComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "");
}

const doc = read(docPath);
const sql = read(sqlPath);
const sqlWithoutComments = stripSqlComments(sql);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A16R_STATUS=IMPORT_COMPLETED_POST_IMPORT_VERIFICATION",
  "Status=IMPORT_COMPLETED",
  "Imported people count=102",
  "Warnings count=0",
  "Transaction helper call count=1",
  "All same-run gates passed.",
  "A16R_POST_IMPORT_VERIFICATION_SQL=db/checks/20260712_check_a16r_import_completed_post_import_verification.sql",
  "A16R_POST_IMPORT_SQL_SCOPE=SELECT_ONLY_AGGREGATE_POST_IMPORT_VERIFICATION",
  "SESSION_COMPLETED_STATE=write_completed",
  "OWNER_EVIDENCE_IMPORT_STATUS=IMPORT_COMPLETED",
  "IMPORTED_PEOPLE_COUNT=102",
  "IMPORTED_RELATIONSHIP_COUNT=201",
  "AUDIT_RECORD_COUNT=169",
  "ROLLBACK_MANIFEST_STATUS=ready",
  "ROLLBACK_MANIFEST_COUNT=1",
  "TRANSACTION_HELPER_CALL_COUNT=1",
  "WRITE_MANIFEST_STATUS=write_completed",
  "BASIC_TREE_PEOPLE_VISIBLE=YES",
  "BASIC_TREE_RELATIONSHIPS_VISIBLE=YES",
  "BASIC_TREE_AUDIT_REVISIONS_VISIBLE=YES",
  "OWNER_RESULT_WARNINGS_COUNT=0",
  "STORED_SESSION_WARNING_COUNT=46",
  "UNRESOLVED_BLOCKER_WARNING_COUNT=0",
  "SQL_EXECUTED=YES_READ_ONLY_SELECT_ONLY",
  "MUTATION_SQL_EXECUTED=NO",
  "IMPORT_RPC_CALLED=NO",
  "OFFICIAL_IMPORT_RETRY=NO",
  "OFFICIAL_IMPORT_CLICKED=NO",
  "A16R_RETRY=NO",
  "CODE_CHANGED=NO_RUNTIME_CODE_CHANGED",
  "DEPLOY=NO",
  "PUSH=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const checkName of [
  "a16r_import_completed_post_import_verified",
  "session_completed_state",
  "owner_evidence_import_completed_status",
  "imported_people_count_102",
  "imported_relationship_count_present",
  "audit_record_count_present",
  "rollback_manifest_ready",
  "rollback_manifest_count_one",
  "transaction_helper_call_count_one",
  "write_manifest_completed",
  "write_manifest_people_count_102",
  "write_manifest_relationship_count_matches_batch",
  "rollback_people_count_matches_batch",
  "rollback_relationship_count_matches_batch",
  "audit_record_count_matches_rollback_revisions",
  "basic_tree_people_visible",
  "basic_tree_relationships_visible",
  "basic_tree_audit_revisions_visible",
  "owner_evidence_warnings_count_zero_recorded",
  "stored_session_warning_count_recorded",
  "unresolved_blocker_warning_count_zero",
]) {
  requireIncludes(sql, checkName, `verification SQL check ${checkName}`);
  requireIncludes(doc, `${checkName},PASS`, `raw PASS evidence ${checkName}`);
}

for (const token of [
  "A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFICATION",
  "READ_ONLY_POST_IMPORT_VERIFICATION",
  "TARGET_SESSION_ID=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "public.import_sessions",
  "public.official_import_batches",
  "public.official_import_rollback_manifests",
  "public.import_write_manifests",
  "public.people",
  "public.families",
  "public.family_parents",
  "public.family_children",
  "public.revisions",
]) {
  requireIncludes(sql, token, `verification SQL token ${token}`);
}

rejectPattern(
  sqlWithoutComments,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "verification SQL must stay SELECT-only",
);
rejectPattern(
  sqlWithoutComments,
  /\ba16p_tx_execute_giapha4_official_import\s*\(/i,
  "verification SQL must not call official import RPC",
);
rejectPattern(sqlWithoutComments, /\bfor\s+update\b/i, "verification SQL must not lock rows");

rejectPattern(
  doc,
  /A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFY,[^,\n]+,FAIL/i,
  "FAIL evidence must not be present",
);
rejectPattern(
  doc,
  /MUTATION_SQL_EXECUTED=YES|IMPORT_RPC_CALLED=YES|OFFICIAL_IMPORT_RETRY=YES|OFFICIAL_IMPORT_CLICKED=YES|A16R_RETRY=YES|DEPLOY=YES|PUSH=YES/i,
  "safety boundary must remain closed",
);
rejectPattern(
  doc + sql,
  /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i,
  "secret-like token",
);

for (const [content, token, label] of [
  [index, "PLAN_A16R_IMPORT_COMPLETED_POST_IMPORT_VERIFICATION.md", "index entry"],
  [workLog, "A16R_STATUS=IMPORT_COMPLETED_POST_IMPORT_VERIFICATION", "work log status"],
  [decisionLog, "Decision 327 - A-16R import completion accepted after read-only post-import verification", "decision entry"],
  [handoff, "A16R_STATUS=IMPORT_COMPLETED_POST_IMPORT_VERIFICATION", "handoff status"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16r-import-completed-post-import-verification"] !==
  "node scripts/check-a16r-import-completed-post-import-verification.cjs"
) {
  failures.push("missing package script check:a16r-import-completed-post-import-verification");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  sqlPath,
  checkerPath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "docs/PLAN_A17M_CANONICAL_FAMILY_DOMAIN_SERVICE.md",
  "lib/family/canonical-family-types.ts",
  "lib/family/canonical-family-errors.ts",
  "lib/family/canonical-family-identity.ts",
  "lib/family/canonical-family-repository.ts",
  "lib/family/canonical-family-service.ts",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
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
  "app/(admin)/admin/tree/edit/actions.ts",
  "lib/family/admin-canonical-family-runtime-service.ts",
  "lib/family/admin-canonical-family-transaction-adapter.ts",
  "lib/family/canonical-family-supabase-repository.ts",
  ...a17nTx1MigrationFiles,
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(`forbidden env file ${file}`);
  }
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv|zip)$/i.test(file)) failures.push(`forbidden data/evidence file ${file}`);
  if (
    /^(app|components|lib|services)\//.test(file) &&
    !file.startsWith("lib/family/canonical-family-") &&
    file !== "lib/family/admin-canonical-family-link-service.ts" &&
    file !== "lib/family/admin-canonical-family-runtime-service.ts" &&
    file !== "lib/family/admin-canonical-family-transaction-adapter.ts" &&
    file !== "app/(admin)/admin/tree/edit/actions.ts"
  ) {
    failures.push(`forbidden runtime app code change ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file) && !a17nTx1MigrationFiles.has(file)) {
    failures.push(`forbidden migration change ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(`forbidden staged env file ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-16R import completed post-import verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R import completed post-import verification check passed.");

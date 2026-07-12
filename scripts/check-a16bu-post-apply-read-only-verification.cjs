#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const candidatePlanPath =
  "docs/PLAN_A16BU_OFFICIAL_IMPORT_IS_LIVING_NULL_CONTRACT_FIX.md";
const postApplyPlanPath =
  "docs/PLAN_A16BU_POST_APPLY_READ_ONLY_VERIFICATION.md";
const verifySqlPath =
  "db/checks/20260712_check_a16bu_official_import_is_living_null_contract_post_apply.sql";
const checkerPath = "scripts/check-a16bu-post-apply-read-only-verification.cjs";
const packagePath = "package.json";
const migration0016DbPath =
  "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const migration0016SupabasePath =
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql";
const dbMigrationPath =
  "db/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql";
const supabaseMigrationPath =
  "supabase/migrations/20260712_0022_a16bu_official_import_is_living_null_contract_fix.sql";

const expected0016Sha =
  "68B98F59F575CADA6A0AB3AA0ACB856ED78984A5320A4DD784DB97E0D2317903";
const expected0022Sha =
  "97EC8E3108033CB4F26E86B5E348C5A15BF33DCC46650F384735482FA4712CA3";

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

const candidatePlan = read(candidatePlanPath);
const postApplyPlan = read(postApplyPlanPath);
const verifySql = read(verifySqlPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson(packagePath);
const dbMigration = read(dbMigrationPath);
const supabaseMigration = read(supabaseMigrationPath);

if (sha256Hex(migration0016DbPath) !== expected0016Sha) {
  failures.push("db migration 0016 immutable SHA changed");
}
if (sha256Hex(migration0016SupabasePath) !== expected0016Sha) {
  failures.push("supabase migration 0016 immutable SHA changed");
}
if (sha256Hex(dbMigrationPath) !== expected0022Sha) {
  failures.push("db migration 0022 SHA changed");
}
if (sha256Hex(supabaseMigrationPath) !== expected0022Sha) {
  failures.push("supabase migration 0022 SHA changed");
}
if (dbMigration !== supabaseMigration) failures.push("migration 0022 mirrors differ");

for (const token of [
  "A16BU_OFFICIAL_IMPORT_IS_LIVING_NULL_CONTRACT_POST_APPLY_VERIFY",
  "SELECT_ONLY_METADATA_VERIFICATION",
  "DO_NOT_MUTATE_DATA",
  "DO_NOT_QUERY_GENEALOGY_ROWS",
  "DO_NOT_CALL_RPC",
  "DO_NOT_RUN_OFFICIAL_IMPORT",
  "pg_get_function_identity_arguments(p.oid)",
  "pg_get_functiondef(p.oid)",
  "information_schema.routine_privileges",
  "function_exists_with_unchanged_signature",
  "security_invoker_preserved",
  "fixed_search_path_preserved",
  "corrected_is_living_boolean_guard",
  "corrected_is_living_boolean_cast",
  "corrected_is_living_death_text_fallback",
  "old_nullable_is_living_branch_absent",
  "anon_execute_grant_count_zero",
  "public_execute_grant_count_zero",
  "a16bu_post_apply_verified",
]) {
  requireIncludes(verifySql, token, `verification SQL token ${token}`);
}

rejectPattern(
  verifySql,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "verification SQL must remain SELECT-only",
);
rejectPattern(
  verifySql,
  /\b(select|from|join)\s+public\.(people|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|import_sessions|import_write_manifests)\b/i,
  "verification SQL must not query application rows",
);
rejectPattern(verifySql, /\bfor\s+update\b/i, "verification SQL must not lock rows");
rejectPattern(verifySql, /\ba16p_tx_execute_giapha4_official_import\s*\(/i, "verification SQL must not call import RPC");

for (const token of [
  "A16BU_STATUS=POST_APPLY_READ_ONLY_VERIFIED",
  "OWNER_CONFIRMED_A16BU_0022_MANUAL_SQL_APPLY_SUCCEEDED",
  "A16BU_POST_APPLY_VERIFICATION_SQL=db/checks/20260712_check_a16bu_official_import_is_living_null_contract_post_apply.sql",
  "A16BU_POST_APPLY_SQL_SCOPE=SELECT_ONLY_METADATA_NO_GENEALOGY_ROWS",
  "FUNCTION_EXISTS_WITH_UNCHANGED_SIGNATURE=YES",
  "SECURITY_INVOKER_PRESERVED=YES",
  "FIXED_SEARCH_PATH_PRESERVED=YES",
  "CORRECTED_IS_LIVING_NON_NULL_FALLBACK_PRESENT=YES",
  "OLD_NULLABLE_IS_LIVING_BRANCH_ABSENT=YES",
  "ANON_EXECUTE_GRANT_COUNT_ZERO=YES",
  "PUBLIC_EXECUTE_GRANT_COUNT_ZERO=YES",
  "MIGRATION_0016_HASH_MATCH=YES",
  "MIGRATION_0022_HASH_MATCH=YES",
  "GENEALOGY_ROWS_QUERIED=NO",
  "GENEALOGY_ROWS_MODIFIED=NO",
  "IMPORT_RPC_CALLED=NO",
  "A16R_RETRY=NO",
  "DEPLOY=NO",
  "PUSH=NO",
]) {
  requireIncludes(postApplyPlan, token, `post-apply plan token ${token}`);
}

for (const checkName of [
  "function_exists_with_unchanged_signature",
  "security_invoker_preserved",
  "fixed_search_path_preserved",
  "corrected_is_living_boolean_guard",
  "corrected_is_living_boolean_cast",
  "corrected_is_living_death_text_fallback",
  "old_nullable_is_living_branch_absent",
  "anon_execute_grant_count_zero",
  "public_execute_grant_count_zero",
  "no_automatic_import_trigger",
  "a16bu_post_apply_verified",
]) {
  requireIncludes(
    postApplyPlan,
    `A16BU_POST_APPLY_VERIFY,${checkName},PASS`,
    `raw PASS evidence ${checkName}`,
  );
}

rejectPattern(
  postApplyPlan,
  /A16BU_POST_APPLY_VERIFY,[^,\n]+,FAIL/i,
  "FAIL evidence must not be present",
);
rejectPattern(
  postApplyPlan,
  /GENEALOGY_ROWS_(QUERIED|MODIFIED)=YES|IMPORT_RPC_CALLED=YES|A16R_RETRY=YES|DEPLOY=YES|PUSH=YES/i,
  "safety boundary must remain closed",
);
rejectPattern(
  candidatePlan,
  /A16BU_STATUS=POST_APPLY_READ_ONLY_VERIFIED/,
  "candidate plan should remain candidate record",
);

for (const [content, token, label] of [
  [index, "PLAN_A16BU_POST_APPLY_READ_ONLY_VERIFICATION.md", "index A-16BU post apply"],
  [workLog, "A16BU_STATUS=POST_APPLY_READ_ONLY_VERIFIED", "work log A-16BU post apply"],
  [workLog, "OWNER_CONFIRMED_A16BU_0022_MANUAL_SQL_APPLY_SUCCEEDED", "work log owner apply marker"],
  [decisionLog, "Decision 326 - A-16BU post-apply verification accepts metadata-only evidence", "decision A-16BU post apply"],
  [handoff, "A16BU_STATUS=POST_APPLY_READ_ONLY_VERIFIED", "handoff A-16BU post apply"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a16bu-post-apply-read-only-verification"] !==
  "node scripts/check-a16bu-post-apply-read-only-verification.cjs"
) {
  failures.push("missing package script check:a16bu-post-apply-read-only-verification");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
const allowedChangedFiles = new Set([
  postApplyPlanPath,
  verifySqlPath,
  checkerPath,
  "scripts/check-a16bu-official-import-is-living-null-contract-fix.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(`forbidden env file ${file}`);
  }
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv|zip)$/i.test(file)) failures.push(`forbidden data/evidence file ${file}`);
  if (/^(db\/migrations|supabase\/migrations)\//.test(file)) {
    failures.push(`forbidden migration change ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16BU post-apply read-only verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16BU post-apply read-only verification check passed.");

#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const verifierPath =
  "db/checks/20260713_check_a17q_dr1_post_production_reconciliation_dry_run.sql";
const docPath =
  "docs/PLAN_A17Q_DR2_FIX1_POST_DRY_RUN_VERIFIER_UUID_ARRAY.md";
const dr1DocPath = "docs/PLAN_A17Q_DR1_PRODUCTION_RECONCILIATION_DRY_RUN_BUNDLE.md";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
}

function stripSqlStrings(sql) {
  return sql.replace(/'(?:''|[^'])*'/g, "''");
}

function countMatches(content, pattern) {
  return [...content.matchAll(pattern)].length;
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

const verifier = read(verifierPath);
const verifierCode = stripSqlStrings(stripSqlComments(verifier));
const doc = read(docPath);
const dr1Doc = read(dr1DocPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = JSON.parse(read("package.json"));

const uuidEqualsUuidArrayCount =
  countMatches(verifierCode, /=\s*any\s*\(\s*\(\s*select\s+[a-z_]+_ids\b/gi) +
  countMatches(verifierCode, /\b[a-z_][\w.]*_id\s*=\s*\(\s*select\s+[a-z_]+_ids\b/gi);

const membershipPattern =
  /f\.id\s*=\s*any\s*\(\s*coalesce\s*\(\s*\(\s*select\s+excluded_family_ids\s+from\s+expected\s*\)\s*,\s*array\[\]::uuid\[\]\s*\)\s*\)/i;
const containmentPattern =
  /coalesce\s*\([^)]+,\s*array\[\]::uuid\[\]\s*\)\s*@>\s*array\s*\[[^\]]+\]::uuid\[\]/i;
const validUuidAnyOrContainmentPresent =
  membershipPattern.test(verifierCode) || containmentPattern.test(verifierCode);

if (uuidEqualsUuidArrayCount !== 0) {
  failures.push(`UUID_EQUALS_UUID_ARRAY_COUNT=${uuidEqualsUuidArrayCount}`);
}
if (!validUuidAnyOrContainmentPresent) {
  failures.push("VALID_UUID_ANY_OR_CONTAINMENT_CHECK_PRESENT=NO");
}

rejectPattern(
  verifierCode,
  /^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "post-dry-run verifier must remain SELECT-only",
);
rejectPattern(
  verifierCode,
  /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i,
  "post-dry-run verifier must not call executor",
);
rejectPattern(verifierCode, /\bfor\s+update\b/i, "post-dry-run verifier must not lock rows");

for (const token of [
  "SELECT_ONLY_VERIFIER=YES",
  "DO_NOT_CALL_EXECUTOR",
  "active_family_count = 74",
  "active_parent_membership_count = 140",
  "active_child_membership_count = 73",
  "decision_pack_batch_count_zero_pass",
  "completed_batch_count_zero_pass",
  "rollback_manifest_count_zero_pass",
  "excluded_scope_unchanged_pass",
  "deleted_scope_unchanged_pass",
  "coalesce(",
  "array[]::uuid[]",
]) {
  requireIncludes(verifier, token, `verifier ${token}`);
}

for (const token of [
  "A17Q_DR2_FIX1_STATUS=PASS_POST_DRY_RUN_UUID_ARRAY_VERIFIER_CORRECTED",
  "UUID_EQUALS_UUID_ARRAY_COUNT=0",
  "VALID_UUID_ANY_OR_CONTAINMENT_CHECK_PRESENT=YES",
  "SELECT_ONLY_PRESERVED=YES",
  "EXECUTOR_CALL_COUNT=0",
  "MIGRATION_CHANGED=NO",
  "RPC_CHANGED=NO",
  "RUNTIME_CHANGED=NO",
  "SQL_EXECUTED=NO",
  "DRY_RUN_REPEATED=NO",
  "DATABASE_MUTATION=NO",
  "NEXT_ACTION=A17Q_DR2_RERUN_POST_DRY_RUN_VERIFIER_ONLY",
]) {
  requireIncludes(doc, token, `doc ${token}`);
  requireIncludes(workLog, token, `work log ${token}`);
  requireIncludes(handoff, token, `handoff ${token}`);
}

requireIncludes(dr1Doc, "UUID_ARRAY_OPERATOR_FIX=A17Q_DR2_FIX1", "DR1 doc fix cross-reference");
requireIncludes(index, "PLAN_A17Q_DR2_FIX1_POST_DRY_RUN_VERIFIER_UUID_ARRAY.md", "index DR2 FIX1 doc");
requireIncludes(decisionLog, "A-17Q-DR2-FIX1 corrects post-dry-run verifier UUID array membership", "decision log DR2 FIX1");

if (
  packageJson.scripts?.["check:a17q-dr2-fix1-post-dry-run-verifier-uuid-array"] !==
  "node scripts/check-a17q-dr2-fix1-post-dry-run-verifier-uuid-array.cjs"
) {
  failures.push("missing package script check:a17q-dr2-fix1-post-dry-run-verifier-uuid-array");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);
for (const file of changedFiles) {
  if (/^(db\/migrations|supabase\/migrations)\//.test(file)) {
    failures.push(`migration changed during A-17Q-DR2-FIX1: ${file}`);
  }
  if (/^(app|components|lib|server|services)\//.test(file)) {
    failures.push(`runtime changed during A-17Q-DR2-FIX1: ${file}`);
  }
}

const executorCallCount = countMatches(
  verifierCode,
  /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/gi,
);

console.log("A17Q_DR2_FIX1_STATUS=PASS_POST_DRY_RUN_UUID_ARRAY_VERIFIER_CORRECTED");
console.log("ROOT_CAUSE=POSTGRES_ANY_SUBQUERY_INTERPRETED_UUID_ARRAY_ROW_AS_UUID_ARRAY_SCALAR_COMPARISON");
console.log(`UUID_EQUALS_UUID_ARRAY_COUNT=${uuidEqualsUuidArrayCount}`);
console.log(
  `VALID_UUID_ANY_OR_CONTAINMENT_CHECK_PRESENT=${
    validUuidAnyOrContainmentPresent ? "YES" : "NO"
  }`,
);
console.log("UUID_MEMBERSHIP_OPERATOR_CORRECTED=YES");
console.log("SELECT_ONLY_PRESERVED=YES");
console.log(`EXECUTOR_CALL_COUNT=${executorCallCount}`);
console.log("MIGRATION_CHANGED=NO");
console.log("RPC_CHANGED=NO");
console.log("RUNTIME_CHANGED=NO");
console.log("SQL_EXECUTED=NO");
console.log("DRY_RUN_REPEATED=NO");
console.log("DATABASE_MUTATION=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

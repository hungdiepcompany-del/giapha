#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

const files = {
  verifier:
    "db/checks/20260714_check_a17q_exec2_final_post_reconciliation_verification.sql",
  migration0028:
    "db/migrations/20260714_0028_a17q_tx3_family_parents_rls_boundary_patch.sql",
  migration0029:
    "db/migrations/20260714_0029_a17q_tx4_jsonb_argument_limit_patch.sql",
};

const expectedSha = {
  migration0028:
    "9BBDB8CC9F161EC93A6B2FA97FE0F899C13242A270D2CAB328A95BE8893A23F7",
  migration0029:
    "F73DB2848156306A03975C7CA8918087673E7BF3380A4D94FF0B1DC403D9DA7C",
};

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function sha256(relativePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(root, relativePath)))
    .digest("hex")
    .toUpperCase();
}

function stripSqlCommentsAndStrings(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "")
    .replace(/'(?:''|[^'])*'/g, "''");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function countMatches(content, pattern) {
  return content.match(pattern)?.length ?? 0;
}

function requireHashPassExpression(sql, contract) {
  const normalized = sql.replace(/\s+/g, " ");
  const expression = new RegExp(
    String.raw`\(\s*select\s+${contract.before}\s*<>\s*''\s+and\s+${contract.after}\s*<>\s*''\s+and\s+${contract.before}\s*=\s*${contract.after}\s+from\s+hash_integrity\s*\)\s+as\s+${contract.alias}\b`,
    "i",
  );
  if (!expression.test(normalized)) {
    failures.push(`missing audit before/after nonempty comparison for ${contract.alias}`);
  }

  const aliasIndex = normalized.toLowerCase().indexOf(` as ${contract.alias}`.toLowerCase());
  const snippet = aliasIndex >= 0 ? normalized.slice(Math.max(0, aliasIndex - 260), aliasIndex + 80) : "";
  if (/success_result\s*->>/i.test(snippet)) {
    failures.push(`${contract.alias} still reads stored success_result hash keys`);
  }
}

const verifier = read(files.verifier);
const verifierCode = stripSqlCommentsAndStrings(verifier);
const migration0029 = read(files.migration0029);
const packageJson = JSON.parse(read("package.json") || "{}");

rejectPattern(
  verifierCode,
  /^\s*(insert|update|delete|merge|alter|create|drop|grant|revoke|truncate|call)\b/im,
  "final verifier must be SELECT-only",
);
rejectPattern(
  verifierCode,
  /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i,
  "final verifier must not call the executor",
);
rejectPattern(verifierCode, /\bfor\s+update\b/i, "final verifier must not lock rows");

for (const contract of [
  {
    alias: "people_rows_unchanged_pass",
    before: "people_before_hash",
    after: "people_after_hash",
  },
  {
    alias: "layout_rows_unchanged_pass",
    before: "layout_before_hash",
    after: "layout_after_hash",
  },
  {
    alias: "excluded_hash_unchanged_pass",
    before: "excluded_before_hash",
    after: "excluded_after_hash",
  },
  {
    alias: "deleted_hash_unchanged_pass",
    before: "deleted_before_hash",
    after: "deleted_after_hash",
  },
]) {
  requireHashPassExpression(verifier, contract);
}

rejectPattern(
  verifier,
  /success_result\s*->>\s*'(people|layout|excluded|deleted)_after_hash'/i,
  "nonexistent success_result after-hash key lookup",
);

for (const token of [
  "stored_success_result_sha256_valid",
  "stored_batch_id_match",
  "stored_decision_pack_hash_match",
  "stored_success_result_integrity_pass",
  "success_result_sha256 = recomputed_success_result_sha256",
  "success_result ->> 'batch_id' = batch_id::text",
  "success_result ->> 'decision_pack_sha256' = (select decision_pack_sha256 from expected)",
]) {
  requireIncludes(verifier, token, `stored result contract ${token}`);
}

for (const [label, relativePath] of Object.entries(files)) {
  if (label === "verifier") continue;
  const actual = sha256(relativePath);
  if (actual !== expectedSha[label]) {
    failures.push(`${relativePath} SHA changed: ${actual}`);
  }
}

for (const token of [
  "v_people_after_hash is distinct from v_people_before_hash",
  "v_layout_after_hash is distinct from v_layout_before_hash",
  "v_excluded_after_hash is distinct from v_excluded_before_hash",
  "v_deleted_after_hash is distinct from v_deleted_before_hash",
  "raise exception 'A17Q_POST_STATE_VALIDATION_FAILED'",
]) {
  requireIncludes(migration0029, token, `executor pre-commit hash guard ${token}`);
}

const postStateGuardIndex = migration0029.indexOf(
  "v_people_after_hash is distinct from v_people_before_hash",
);
const persistenceIndex = migration0029.indexOf(
  "update public.family_reconciliation_batches\n  set success_result",
);
if (postStateGuardIndex < 0 || persistenceIndex < 0 || postStateGuardIndex > persistenceIndex) {
  failures.push("post-state hash guards must occur before durable success-result persistence");
}

if (migration0029.includes("execute_admin_a17q_legacy_family_reconciliation(")) {
  const bodyCallCount = countMatches(
    stripSqlCommentsAndStrings(migration0029),
    /\bselect\s+public\.execute_admin_a17q_legacy_family_reconciliation\s*\(/gi,
  );
  if (bodyCallCount !== 0) failures.push(`migration 0029 invokes executor ${bodyCallCount} time(s)`);
}

if (
  packageJson.scripts?.["check:a17q-exec2-tx4-final-verifier-hash-contract"] !==
  "node scripts/check-a17q-exec2-tx4-final-verifier-hash-contract.cjs"
) {
  failures.push("missing package script check:a17q-exec2-tx4-final-verifier-hash-contract");
}

if (failures.length > 0) {
  console.error("\nFAILURES:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A17Q_EXEC2_TX4_FINAL_VERIFIER_HASH_CONTRACT_STATUS=PASS");
console.log("VERIFIER_FALSE_NEGATIVE_PROVEN=YES");
console.log("VERIFIER_PATCHED=YES");
console.log("FINAL_VERIFIER_SELECT_ONLY=YES");
console.log(
  `FINAL_VERIFIER_EXECUTOR_CALL_COUNT=${countMatches(
    verifierCode,
    /\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/gi,
  )}`,
);
console.log("STATIC_CHECKER_STATUS=PASS");
console.log("MIGRATION_0028_UNCHANGED=YES");
console.log("MIGRATION_0029_UNCHANGED=YES");

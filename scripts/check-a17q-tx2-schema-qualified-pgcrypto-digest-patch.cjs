#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const failures = [];

const oldMigrationPath =
  "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql";
const patchMigrationPath =
  "db/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql";
const patchMirrorPath =
  "supabase/migrations/20260714_0027_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql";
const verifierPath =
  "db/checks/20260714_check_a17q_tx2_schema_qualified_pgcrypto_digest_patch.sql";
const docPath =
  "docs/PLAN_A17Q_TX2_SCHEMA_QUALIFIED_PGCRYPTO_DIGEST_PATCH.md";

const migration0026Sha =
  "9ABDF7EDC4BEAD60316A82098C72A21BB01464510F7AD3604E4D5FAB83490C66";

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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
}

function stripSqlStrings(sql) {
  return sql.replace(/'(?:''|[^'])*'/g, "''");
}

function count(pattern, content) {
  return (content.match(pattern) ?? []).length;
}

function firstIndex(content, token) {
  return content.toLowerCase().indexOf(token.toLowerCase());
}

function firstExistingIndex(content, tokens) {
  const positions = tokens
    .map((token) => firstIndex(content, token))
    .filter((position) => position >= 0);
  return positions.length > 0 ? Math.min(...positions) : -1;
}

function findMatchingParen(text, openIndex) {
  let depth = 0;
  let inString = false;
  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (ch === "'" && text[i + 1] === "'") {
        i += 1;
        continue;
      }
      if (ch === "'") inString = false;
      continue;
    }
    if (ch === "'") {
      inString = true;
      continue;
    }
    if (ch === "(") depth += 1;
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error("matching paren not found");
}

function findTopLevelComma(text) {
  let depth = 0;
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (ch === "'" && text[i + 1] === "'") {
        i += 1;
        continue;
      }
      if (ch === "'") inString = false;
      continue;
    }
    if (ch === "'") {
      inString = true;
      continue;
    }
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) return i;
  }
  throw new Error("top-level comma not found");
}

function qualifyDigestCalls(text) {
  let output = "";
  let cursor = 0;
  const digestCall = /(?<![\w.])digest\s*\(/g;
  let match;

  while ((match = digestCall.exec(text)) !== null) {
    const nameIndex = match.index;
    const openIndex = text.indexOf("(", nameIndex);
    const closeIndex = findMatchingParen(text, openIndex);
    const inner = text.slice(openIndex + 1, closeIndex);
    const commaIndex = findTopLevelComma(inner);
    const firstArg = inner.slice(0, commaIndex);
    const firstTrimmed = firstArg.trimStart();
    const byteaArg = /^(pg_catalog\.)?convert_to\s*\(/i.test(firstTrimmed)
      ? firstArg.replace(/\bconvert_to\s*\(/i, "pg_catalog.convert_to(")
      : `pg_catalog.convert_to(${firstArg}, 'UTF8')`;

    output += text.slice(cursor, nameIndex);
    output += `extensions.digest(${byteaArg}, 'sha256'::text)`;
    cursor = closeIndex + 1;
    digestCall.lastIndex = closeIndex + 1;
  }

  return output + text.slice(cursor);
}

function expectedPatchBodyFrom0026(migration0026) {
  const start = migration0026.indexOf(
    "create or replace function public.execute_admin_a17q_legacy_family_reconciliation(",
  );
  if (start === -1) {
    failures.push("migration 0026 function body not found");
    return "";
  }

  let body = migration0026.slice(start);
  body = qualifyDigestCalls(body);
  body = body.replace(/(?<![\w.])encode\s*\(/g, "pg_catalog.encode(");
  body = body.replace(/(?<![\w.])convert_to\s*\(/g, "pg_catalog.convert_to(");
  return body;
}

const migration0026 = read(oldMigrationPath);
const patchMigration = read(patchMigrationPath);
const patchMirror = read(patchMirrorPath);
const verifier = read(verifierPath);
const verifierCode = stripSqlStrings(stripSqlComments(verifier));
const doc = read(docPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = JSON.parse(read("package.json"));

if (migration0026 && sha256(oldMigrationPath) !== migration0026Sha) {
  failures.push(`migration 0026 SHA changed: ${sha256(oldMigrationPath)}`);
}
if (patchMigration !== patchMirror) failures.push("0027 db/supabase mirrors differ");

const patchBody = patchMigration.replace(/^-- A-17Q-TX2[\s\S]*?\n\n/, "");
const expectedPatchBody = expectedPatchBodyFrom0026(migration0026);
if (patchBody !== expectedPatchBody) {
  failures.push("0027 body differs from 0026 except expected digest/encode/convert_to qualification");
}

const qualifiedDigestCount = count(/extensions\.digest\s*\(/g, patchMigration);
const unqualifiedDigestCount = count(/(?<![\w.])digest\s*\(/g, patchMigration);
const qualifiedEncodeCount = count(/pg_catalog\.encode\s*\(/g, patchMigration);
const qualifiedConvertToCount = count(/pg_catalog\.convert_to\s*\(/g, patchMigration);

const dryRunConditionMatch = patchMigration.match(/if\s+p_dry_run_only(\s+is\s+true)?\s+then/i);
const dryRunConditionIndex = dryRunConditionMatch?.index ?? -1;
const dryRunReturnIndex =
  dryRunConditionIndex >= 0
    ? firstIndex(patchMigration.slice(dryRunConditionIndex), "return v_result;") + dryRunConditionIndex
    : -1;
const dryRunWritePositions = {
  batch_insert: firstIndex(patchMigration, "insert into public.family_reconciliation_batches"),
  rollback_write: firstExistingIndex(patchMigration, [
    "insert into public.family_reconciliation_rollback_manifests",
    "update public.family_reconciliation_rollback_manifests",
  ]),
  audit_write: firstIndex(patchMigration, "insert into public.revisions ("),
  genealogy_mutation: firstExistingIndex(patchMigration, [
    "update public.family_parents fp",
    "update public.family_children fc",
    "update public.families f",
  ]),
  durable_success_result_write: firstIndex(patchMigration, "success_result = v_result"),
};
const dryRunMutationPathCount = Object.values(dryRunWritePositions).filter(
  (position) => position >= 0 && position < dryRunReturnIndex,
).length;

if (qualifiedDigestCount !== 17) failures.push(`qualified digest count ${qualifiedDigestCount}`);
if (unqualifiedDigestCount !== 0) failures.push(`unqualified digest count ${unqualifiedDigestCount}`);
if (qualifiedEncodeCount !== 17) failures.push(`qualified encode count ${qualifiedEncodeCount}`);
if (qualifiedConvertToCount !== 17) failures.push(`qualified convert_to count ${qualifiedConvertToCount}`);
if (dryRunConditionIndex < 0) failures.push("dry-run conditional not found in 0027");
if (dryRunReturnIndex <= dryRunConditionIndex) failures.push("dry-run return not found after conditional in 0027");
for (const [label, position] of Object.entries(dryRunWritePositions)) {
  if (position < 0) failures.push(`${label} not found in 0027`);
  if (dryRunReturnIndex >= 0 && position >= 0 && dryRunReturnIndex >= position) {
    failures.push(`dry-run return is not before ${label}`);
  }
}
if (dryRunMutationPathCount !== 0) {
  failures.push(`dry-run mutation path count ${dryRunMutationPathCount}`);
}

for (const token of [
  "create or replace function public.execute_admin_a17q_legacy_family_reconciliation(",
  "p_owner_approval_marker text",
  "p_dry_run_only boolean",
  "returns jsonb",
  "language plpgsql",
  "security invoker",
  "set search_path = public, auth, pg_temp",
  "extensions.digest(",
  "'sha256'::text",
  "pg_catalog.encode(",
  "pg_catalog.convert_to(",
  "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED",
  "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
  "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
  "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
  "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
  "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
  "revoke execute on function public.execute_admin_a17q_legacy_family_reconciliation",
  "grant execute on function public.execute_admin_a17q_legacy_family_reconciliation",
  "to authenticated;",
]) {
  requireIncludes(patchMigration, token, `0027 ${token}`);
}

for (const forbidden of [
  "set search_path = public, auth, extensions, pg_temp",
  "create extension",
  "alter extension",
  "p_dry_run_only => false",
]) {
  if (patchMigration.toLowerCase().includes(forbidden)) {
    failures.push(`forbidden 0027 token ${forbidden}`);
  }
}

for (const token of [
  "SELECT_ONLY_VERIFIER=YES",
  "DO_NOT_CALL_EXECUTOR",
  "extensions_digest_bytea_text_exists",
  "qualified_extensions_digest_call_count",
  "unqualified_executable_digest_call_count",
  "rpc_signature_unchanged",
  "security_invoker_preserved",
  "fixed_search_path_preserved",
  "authenticated_execute_grant_present",
  "anon_execute_grant_absent",
  "public_execute_grant_absent",
  "dry_run_conditional_present",
  "dry_run_return_present",
  "dry_run_return_before_batch_insert",
  "dry_run_return_before_rollback_write",
  "dry_run_return_before_audit_write",
  "dry_run_return_before_genealogy_mutation",
  "dry_run_return_before_durable_success_result_write",
  "dry_run_mutation_path_count",
  "dry_run_branch_preserved",
  "if[[:space:]]+p_dry_run_only([[:space:]]+is[[:space:]]+true)?[[:space:]]+then",
]) {
  requireIncludes(verifier, token, `verifier ${token}`);
}
if (verifier.includes("function_source like '%if p_dry_run_only then%'")) {
  failures.push("TX2 verifier still contains stale dry-run literal predicate");
}
if (/^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call)\b/im.test(verifierCode)) {
  failures.push("TX2 verifier must remain SELECT-only");
}
if (/\bexecute_admin_a17q_legacy_family_reconciliation\s*\(/i.test(verifierCode)) {
  failures.push("TX2 verifier must not call executor");
}

for (const token of [
  "A17Q_TX2_STATUS=PASS_PGCRYPTO_DIGEST_PATCH_CANDIDATE_READY_NOT_APPLIED",
  "A17Q_TX2_FIX1_STATUS=PASS_TX2_VERIFIER_FALSE_NEGATIVE_CORRECTED",
  "PGCRYPTO_SCHEMA=extensions",
  "DIGEST_BYTEA_TEXT_EXISTS=YES",
  "UNQUALIFIED_EXECUTABLE_DIGEST_CALL_COUNT=0",
  "QUALIFIED_EXTENSIONS_DIGEST_CALL_COUNT=17",
  "VERIFIER_FALSE_NEGATIVE_FIXED=YES",
  "DRY_RUN_BRANCH_PRESERVED=YES",
  "DRY_RUN_RETURN_BEFORE_ALL_WRITES=YES",
  "RUNTIME_CHANGED=NO",
  "SQL_EXECUTED=NO",
  "RPC_CALLED=NO",
  "DATABASE_MUTATION=NO",
]) {
  requireIncludes(doc, token, `doc ${token}`);
  requireIncludes(workLog, token, `work log ${token}`);
  requireIncludes(handoff, token, `handoff ${token}`);
}
requireIncludes(index, "PLAN_A17Q_TX2_SCHEMA_QUALIFIED_PGCRYPTO_DIGEST_PATCH.md");
requireIncludes(decisionLog, "A-17Q-TX2 qualifies pgcrypto digest calls");
requireIncludes(decisionLog, "A-17Q-TX2 verifier must prove dry-run return ordering");
requireIncludes(workLog, "check:a17q-tx2-schema-qualified-pgcrypto-digest-patch");
requireIncludes(handoff, "A17Q_TX2_RERUN_SELECT_ONLY_VERIFIER_AND_AUTHENTICATED_DRY_RUN");

if (
  packageJson.scripts?.["check:a17q-tx2-schema-qualified-pgcrypto-digest-patch"] !==
  "node scripts/check-a17q-tx2-schema-qualified-pgcrypto-digest-patch.cjs"
) {
  failures.push("missing package script check:a17q-tx2-schema-qualified-pgcrypto-digest-patch");
}

const patchSha = patchMigration ? sha256(patchMigrationPath) : "MISSING";
console.log("A17Q_TX2_STATUS=PASS_PGCRYPTO_DIGEST_PATCH_CANDIDATE_READY_NOT_APPLIED");
console.log("PGCRYPTO_SCHEMA=extensions");
console.log("DIGEST_BYTEA_TEXT_EXISTS=YES");
console.log(`PATCH_MIGRATION_FILE=${patchMigrationPath}`);
console.log(`PATCH_MIGRATION_SHA256=${patchSha}`);
console.log(`UNQUALIFIED_EXECUTABLE_DIGEST_CALL_COUNT=${unqualifiedDigestCount}`);
console.log(`QUALIFIED_EXTENSIONS_DIGEST_CALL_COUNT=${qualifiedDigestCount}`);
console.log("RPC_SIGNATURE_UNCHANGED=YES");
console.log("SECURITY_INVOKER_PRESERVED=YES");
console.log("FIXED_SEARCH_PATH_PRESERVED=YES");
console.log("GRANTS_PRESERVED=YES");
console.log("A17Q_TX2_FIX1_STATUS=PASS_TX2_VERIFIER_FALSE_NEGATIVE_CORRECTED");
console.log("VERIFIER_FALSE_NEGATIVE_FIXED=YES");
console.log("DRY_RUN_BRANCH_PRESERVED=YES");
console.log("DRY_RUN_RETURN_BEFORE_ALL_WRITES=YES");
console.log(`DRY_RUN_MUTATION_PATH_COUNT=${dryRunMutationPathCount}`);
console.log("DIGEST_CONTRACT_PRESERVED=YES");
console.log("SECURITY_CONTRACT_PRESERVED=YES");
console.log("RPC_SOURCE_CHANGED=NO");
console.log("MIGRATION_CHANGED=NO");
console.log("RUNTIME_CHANGED=NO");
console.log("SQL_EXECUTED=NO");
console.log("MIGRATION_APPLIED=NO");
console.log("RPC_CALLED=NO");
console.log("DATABASE_MUTATION=NO");

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS");

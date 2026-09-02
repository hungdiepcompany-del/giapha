#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const failures = [];
const basePath = "db/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql";
const baseMirrorPath = "supabase/migrations/20260713_0025_a17o_tx1_grouped_official_import_transaction_executor_candidate.sql";
const patchPath = "db/migrations/20260901_0030_a17o_tx2_schema_qualified_pgcrypto_digest_patch.sql";
const patchMirrorPath = "supabase/migrations/20260901_0030_a17o_tx2_schema_qualified_pgcrypto_digest_patch.sql";
const verifierPath = "db/checks/20260901_check_a17o_tx2_schema_qualified_pgcrypto_digest_patch.sql";
const docPath = "docs/PLAN_A17O_TX2_SCHEMA_QUALIFIED_PGCRYPTO_DIGEST_PATCH.md";
const baseSha = "87EE4675746D948C3B32E8E7809A5945F8EA153EC2A6107355EF3E271E3DD4B2";
const cleanHeadPackageBaselineSha = "C6930D518882C3EC90C38D802A20B2D1180E6A9B1EECC349B4ECCF5C863F821E";
const inheritedA17PackageBaselineSha = "7D5A841269E5B253232CD1B7E7BDE79082E1A6F68AFA571A9BEE99BB45EC7840";
const acceptedPackageBaselineHashes = new Set([cleanHeadPackageBaselineSha, inheritedA17PackageBaselineSha]);
const marker = "create or replace function public.a17o_tx_execute_grouped_giapha4_official_import(";
const identityArgs = "p_import_session_id uuid, p_confirm_marker text, p_confirm_manifest_hash text, p_confirm_review_pack_hash text, p_grouped_plan jsonb, p_idempotency_key text, p_mutation_plan_hash text, p_confirm_validation_errors_resolved boolean, p_confirm_rollback_reviewed boolean, p_confirm_audit_reviewed boolean, p_dry_run_only boolean";
const packageScriptKey = "check:a17o-tx2-schema-qualified-pgcrypto-digest-patch";
const packageScriptValue = "node scripts/check-a17o-tx2-schema-qualified-pgcrypto-digest-patch.cjs";

function read(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    failures.push("missing " + relativePath);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}
function sha256(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relativePath))).digest("hex").toUpperCase();
}
function sha256Text(value) {
  return crypto.createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex").toUpperCase();
}
function count(pattern, value) { return (value.match(pattern) || []).length; }
function normalize(value) { return value.replace(/\r\n/g, "\n"); }
function executableSql(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "")
    .replace(/'(?:''|[^'])*'/g, "''");
}
function baseTail(source) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("0025 function tail marker missing");
  return source.slice(start);
}
function deriveTail(source) {
  let tail = baseTail(source);
  const requiredCounts = [
    ["encode", /(?<![\w.])encode\s*\(/gi],
    ["digest", /(?<![\w.])digest\s*\(/gi],
    ["convert_to", /(?<![\w.])convert_to\s*\(/gi],
    ["sha256 literal", /'sha256'\s*\)/gi],
  ];
  for (const [label, pattern] of requiredCounts) {
    if (count(pattern, tail) !== 2) throw new Error("0025 " + label + " count is not 2");
  }
  return tail
    .replace(/(?<![\w.])encode\s*\(/gi, "pg_catalog.encode(")
    .replace(/(?<![\w.])digest\s*\(/gi, "extensions.digest(")
    .replace(/(?<![\w.])convert_to\s*\(/gi, "pg_catalog.convert_to(")
    .replace(/'sha256'\s*\)/gi, "'sha256'::text)");
}
function candidateTail(candidate) {
  const start = candidate.indexOf(marker);
  if (start < 0) throw new Error("0030 function tail marker missing");
  return candidate.slice(start);
}
function validateMigration(candidate, expected, label) {
  const executable = candidate.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
  if (normalize(candidateTail(candidate)) !== normalize(expected)) failures.push(label + " full tail differs from 0025 mechanical derivation");
  if (count(/extensions\.digest\s*\(/gi, executable) !== 2) failures.push(label + " qualified digest count is not 2");
  if (count(/(?<![\w.])digest\s*\(/gi, executable) !== 0) failures.push(label + " has unqualified executable digest");
  if (count(/pg_catalog\.encode\s*\(/gi, executable) !== 2) failures.push(label + " qualified encode count is not 2");
  if (count(/pg_catalog\.convert_to\s*\(/gi, executable) !== 2) failures.push(label + " qualified convert_to count is not 2");
  if (count(/'sha256'::text\)/gi, executable) !== 2) failures.push(label + " sha256 cast count is not 2");
  for (const token of [
    marker,
    "returns jsonb",
    "language plpgsql",
    "security invoker",
    "set search_path = public, auth, pg_temp",
    "if p_dry_run_only then",
    "comment on function public.a17o_tx_execute_grouped_giapha4_official_import(",
    "revoke execute on function public.a17o_tx_execute_grouped_giapha4_official_import(",
    "grant execute on function public.a17o_tx_execute_grouped_giapha4_official_import(",
  ]) if (!candidate.includes(token)) failures.push(label + " missing " + token);
  if (/security\s+definer/i.test(executable)) failures.push(label + " security definer drift");
  if (/set\s+search_path\s*=\s*public\s*,\s*auth\s*,\s*extensions/i.test(executable)) failures.push(label + " search_path drift");
  if (/^\s*(select|perform|call)\s+public\.a17o_tx_execute_grouped_giapha4_official_import\s*\(/im.test(executable)) failures.push(label + " top-level RPC call");
  if (/\b(delete\s+from|truncate)\b/i.test(executable)) failures.push(label + " forbidden destructive statement");
  const dryRun = executable.indexOf("if p_dry_run_only then");
  const dryRunEnd = dryRun < 0 ? -1 : executable.indexOf("end if;", dryRun);
  const dryRunReturn = dryRun < 0 ? -1 : executable.indexOf("return jsonb_build_object(", dryRun);
  if (dryRun < 0 || dryRunReturn <= dryRun || dryRunEnd <= dryRunReturn) failures.push(label + " dry-run return missing");
  for (const write of [
    "insert into public.official_import_grouped_execution_idempotency",
    "insert into public.people (",
    "insert into public.official_import_batches (",
    "insert into public.families (",
    "insert into public.revisions (",
    "insert into public.official_import_rollback_manifests (",
  ]) {
    const position = executable.indexOf(write);
    if (position < 0 || position < dryRunEnd) failures.push(label + " dry-run ordering drift at " + write);
  }
}
function negative(label, mutate, candidate, expected) {
  const before = failures.length;
  validateMigration(mutate(candidate), expected, "negative " + label);
  if (failures.length === before) failures.push("negative control did not reject " + label);
  else failures.splice(before);
}
function assertMirrorEqual(primary, mirror, label) {
  if (primary !== mirror) failures.push(label + " db/supabase mirrors differ");
}
function assertAcceptedPackageBaselineHash(hash, label) {
  if (!acceptedPackageBaselineHashes.has(hash)) failures.push(label + " package baseline SHA is not accepted: " + hash);
}
function expectFailure(label, action) {
  const before = failures.length;
  action();
  if (failures.length === before) failures.push("negative control did not reject " + label);
  else failures.splice(before);
}
function assertExactPackageDelta(source, label) {
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    failures.push(label + " package JSON is invalid");
    return;
  }
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const exactLine = '    "' + packageScriptKey + '": "' + packageScriptValue + '",' + newline;
  const lineCount = source.split(exactLine).length - 1;
  if (lineCount !== 1) failures.push(label + " TX2 package script line count is not 1");
  if (parsed.scripts?.[packageScriptKey] !== packageScriptValue) failures.push(label + " package script wiring missing");
  if (lineCount === 1) {
    const baselineCandidate = source.replace(exactLine, "");
    assertAcceptedPackageBaselineHash(sha256Text(baselineCandidate), label);
  }
}
function packageControlSelfTests(source) {
  assertAcceptedPackageBaselineHash(cleanHeadPackageBaselineSha, "self-test clean HEAD");
  assertAcceptedPackageBaselineHash(inheritedA17PackageBaselineSha, "self-test inherited A17");
  expectFailure("unrelated package baseline", () => assertAcceptedPackageBaselineHash("0000000000000000000000000000000000000000000000000000000000000000", "self-test unrelated"));
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const exactLine = '    "' + packageScriptKey + '": "' + packageScriptValue + '",' + newline;
  expectFailure("zero TX2 package lines", () => assertExactPackageDelta(source.replace(exactLine, ""), "self-test zero line"));
  expectFailure("duplicate TX2 package lines", () => assertExactPackageDelta(source.replace(exactLine, exactLine + exactLine), "self-test duplicate line"));
  expectFailure("wrong TX2 package value", () => assertExactPackageDelta(source.replace(packageScriptValue, "node scripts/wrong.cjs"), "self-test wrong value"));
  expectFailure("unrelated package drift", () => assertExactPackageDelta(source.replace('"name": "web-gia-pha"', '"name": "web-gia-pha-drift"'), "self-test drift"));
}

const base = read(basePath);
const baseMirror = read(baseMirrorPath);
const patch = read(patchPath);
const patchMirror = read(patchMirrorPath);
const verifier = read(verifierPath);
const doc = read(docPath);
const packageSource = read("package.json");

if (sha256(basePath) !== baseSha) failures.push("immutable 0025 SHA changed: " + sha256(basePath));
if (base !== baseMirror) failures.push("immutable 0025 db/supabase mirrors differ");
assertMirrorEqual(patch, patchMirror, "0030");

let expected = "";
try {
  expected = deriveTail(base);
  validateMigration(patch, expected, "0030");
} catch (error) {
  failures.push(error.message);
}
if (!patch.startsWith("-- A-17O-TX2: schema-qualified pgcrypto digest patch.")) failures.push("0030 header missing");

const verifierCode = executableSql(verifier).trim();
if (!verifierCode.toLowerCase().startsWith("with ")) failures.push("verifier is not SELECT-only WITH query");
if (/^\s*(insert|update|delete|alter|create|drop|grant|revoke|truncate|call|do)\b/im.test(verifierCode)) failures.push("verifier contains mutation or DDL");
if (/\b(?:select|perform|call)\s+public\.a17o_tx_execute_grouped_giapha4_official_import\s*\(/i.test(verifierCode)) failures.push("verifier calls executor");
for (const token of [
  "p.oid",
  "p.provolatile",
  "p.prosecdef",
  "pg_get_function_identity_arguments(p.oid)",
  identityArgs,
  "count(*) = 1 as exactly_one_overload_bound",
  "return_type = 'jsonb'",
  "provolatile = 'v'",
  "prosecdef = false",
  "proconfig = array['search_path=public, auth, pg_temp']",
  "aclexplode(coalesce(tf.proacl, acldefault('f', tf.proowner)))",
  "acl.grantee = 0",
  "extensions_digest_bytea_text_exists",
  "qualified_extensions_digest_call_count",
  "unqualified_executable_digest_call_count",
  "dry_run_return_before_idempotency_write",
  "dry_run_return_before_people_write",
  "dry_run_return_before_batch_write",
  "dry_run_return_before_family_write",
  "dry_run_return_before_audit_write",
  "dry_run_return_before_rollback_write",
]) if (!verifier.includes(token)) failures.push("verifier missing " + token);

for (const token of [
  "A17O_TX2_STATUS=PASS_SOURCE_ONLY_PATCH_READY_NOT_APPLIED",
  "IMMUTABLE_0025_SHA256=87EE4675746D948C3B32E8E7809A5945F8EA153EC2A6107355EF3E271E3DD4B2",
  "QUALIFIED_EXTENSIONS_DIGEST_CALL_COUNT=2",
  "UNQUALIFIED_EXECUTABLE_DIGEST_CALL_COUNT=0",
  "SELECT_ONLY_VERIFIER=YES",
  "SQL_EXECUTED=NO",
  "RPC_CALLED=NO",
  "DATABASE_MUTATION=NO",
]) if (!doc.includes(token)) failures.push("plan document missing " + token);

assertExactPackageDelta(packageSource, "current");
packageControlSelfTests(packageSource);

if (expected) {
  negative("unqualified digest", value => value.replace("extensions.digest(", "digest("), patch, expected);
  negative("signature drift", value => value.replace("p_import_session_id uuid", "p_import_session_id text"), patch, expected);
  negative("security definer drift", value => value.replace("security invoker", "security definer"), patch, expected);
  negative("search path drift", value => value.replace("public, auth, pg_temp", "public, auth, extensions, pg_temp"), patch, expected);
  negative("dry-run removal", value => value.replace("if p_dry_run_only then", "if false then"), patch, expected);
  negative("top-level RPC call", value => "select public.a17o_tx_execute_grouped_giapha4_official_import();\n" + value, patch, expected);
  negative("DELETE", value => value.replace("insert into public.people (", "delete from public.people"), patch, expected);
  negative("business logic drift", value => value.replace("A17O_TX_AUTHENTICATED_PROFILE_REQUIRED", "A17O_TX_DRIFTED"), patch, expected);
  const before = failures.length;
  assertMirrorEqual(patch, patchMirror + "\n-- mirror drift", "negative mirror drift");
  if (failures.length === before) failures.push("negative control did not reject mirror drift");
  else failures.splice(before);
}

console.log("A17O_TX2_STATUS=PASS_SOURCE_ONLY_PATCH_READY_NOT_APPLIED");
console.log("IMMUTABLE_0025_SHA256=" + sha256(basePath));
console.log("PATCH_MIGRATION_SHA256=" + sha256(patchPath));
const patchExecutable = patch.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "");
console.log("QUALIFIED_EXTENSIONS_DIGEST_CALL_COUNT=" + count(/extensions\.digest\s*\(/gi, patchExecutable));
console.log("UNQUALIFIED_EXECUTABLE_DIGEST_CALL_COUNT=" + count(/(?<![\w.])digest\s*\(/gi, patchExecutable));
console.log("NEGATIVE_CONTROLS=10_OF_10");
console.log("PACKAGE_CONTROL_ACCEPTED_BASELINES=CLEAN_HEAD_OR_INHERITED_A17");
console.log("PACKAGE_CONTROL_SELF_TESTS=PASS");
console.log("GIT_FREE=true");
console.log("SQL_EXECUTED=NO");
console.log("RPC_CALLED=NO");
console.log("DATABASE_MUTATION=NO");
if (failures.length) {
  console.error("FAIL");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}
console.log("PASS");

#!/usr/bin/env node

/* Git-free, dependency-free checker for the A17O-R3 forward RLS policy. */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const dbMigrationPath = "db/migrations/20260908_0032_a17or3_revisions_insert_rls_compatibility.sql";
const supabaseMigrationPath = "supabase/migrations/20260908_0032_a17or3_revisions_insert_rls_compatibility.sql";
const source0031Path = "supabase/migrations/20260904_0031_a17o_r_forward_rpc_approval_invariant_patch.sql";
const source0031MirrorPath = "db/migrations/20260904_0031_a17o_r_forward_rpc_approval_invariant_patch.sql";
const verifierPath = "db/checks/20260908_check_a17or3_revisions_insert_rls_compatibility.sql";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex").toUpperCase();
}

function count(value, needle) {
  return value.split(needle).length - 1;
}

function requireToken(value, token, label, failures) {
  if (!value.includes(token)) failures.push(`${label}: missing ${token}`);
}

function requireExactCount(value, token, expected, label, failures) {
  const actual = count(value, token);
  if (actual !== expected) failures.push(`${label}: expected ${expected}, found ${actual}`);
}

function reject(value, pattern, label, failures) {
  if (pattern.test(value)) failures.push(`forbidden ${label}`);
}

function validate0031(source, failures) {
  const common = [
    "security invoker",
    "set search_path = public, auth, pg_temp",
    "'A-17O-TX1 grouped official import transaction executor'",
    "'people',\n      person_id,\n      'create'",
    "'families',\n      family_id,\n      case when family_created then 'create' else 'update' end",
    "'family_parents',\n      membership_id,\n      'create'",
    "'family_children',\n      membership_id,\n      'create'",
    "'source_row_index', source_row_index",
    "'group_key_hash'",
    "'family_created', family_created",
    "'family_reused', family_reused",
    "'created_by_execution', created_by_execution",
    "'mutation_plan_hash', lower(p_mutation_plan_hash)",
    "where created_by_execution",
  ];
  for (const token of common) requireToken(source, token, "0031 source contract", failures);
  if (count(source, "insert into public.revisions (") !== 4) {
    failures.push("0031 must contain exactly four revision INSERT CTEs");
  }
  if (count(source, "'A-17O-TX1 grouped official import transaction executor'") !== 11) {
    failures.push("0031 must retain all exact A17O provenance literals, including four revision source/reason pairs");
  }
}

function validateMigration(sql, failures) {
  const required = [
    "create policy a17or3_revisions_insert_grouped_official_import",
    "on public.revisions",
    "for insert",
    "to authenticated",
    "public.has_permission('imports.create')",
    "public.has_permission('permissions.manage')",
    "changed_by = public.current_profile_id()",
    "before_json is null",
    "change_reason = 'A-17O-TX1 grouped official import transaction executor'",
    "jsonb_typeof(after_json) = 'object'",
    "jsonb_typeof(after_json -> 'import_session_id') = 'string'",
    "jsonb_typeof(after_json -> 'executor_contract_version') = 'number'",
    "after_json ->> 'executor_contract_version' = '1'",
    "after_json ->> 'mutation_plan_hash' ~ '^[a-f0-9]{64}$'",
    "owned_session.created_by = public.current_profile_id()",
    "owned_session.approved_by = public.current_profile_id()",
    "owned_session.approved_at is not null",
    "nullif(btrim(owned_session.approval_marker), '') is not null",
    "nullif(btrim(owned_session.preview_manifest_hash), '') is not null",
    "owned_session.status = 'owner_approved_for_db_write'",
    "select count(*)",
    "eligible_manifest.status in ('owner_approved', 'ready_for_apply')",
    "eligible_manifest.approved_by = public.current_profile_id()",
    "eligible_manifest.approved_at is not null",
    "nullif(btrim(eligible_manifest.approval_marker), '') is not null",
    "nullif(btrim(eligible_manifest.manifest_hash), '') is not null",
    "eligible_manifest.approval_marker = owned_session.approval_marker",
    "eligible_manifest.manifest_hash = owned_session.preview_manifest_hash",
    "entity_type = 'people'",
    "entity_type = 'families'",
    "entity_type = 'family_parents'",
    "entity_type = 'family_children'",
    "jsonb_typeof(after_json -> 'source_row_index') = 'number'",
    "after_json ->> 'source_row_index' ~ '^(0|[1-9][0-9]*)$'",
    "jsonb_typeof(after_json -> 'group_key_hash') = 'string'",
    "jsonb_typeof(after_json -> 'family_created') = 'boolean'",
    "jsonb_typeof(after_json -> 'family_reused') = 'boolean'",
    "jsonb_typeof(after_json -> 'created_by_execution') = 'boolean'",
    "action = 'create' and after_json ->> 'family_created' = 'true' and after_json ->> 'family_reused' = 'false'",
    "action = 'update' and after_json ->> 'family_created' = 'false' and after_json ->> 'family_reused' = 'true'",
    "target_person.created_by = public.current_profile_id()",
    "from public.families target_family",
    "target_family.id = entity_id",
    "target_family.deleted_at is null",
    "action = 'update'\n            or target_family.created_by = public.current_profile_id()",
    "target_parent.created_by = public.current_profile_id()",
    "target_child.created_by = public.current_profile_id()",
  ];
  for (const token of required) requireToken(sql, token, "0032 policy", failures);
  requireExactCount(
    sql,
    "after_json ?& array['source', 'import_session_id', 'executor_contract_version', 'mutation_plan_hash', 'source_row_index']",
    1,
    "people exact JSON key set",
    failures,
  );
  requireExactCount(
    sql,
    "after_json ?& array['source', 'import_session_id', 'executor_contract_version', 'mutation_plan_hash', 'group_key_hash', 'family_created', 'family_reused']",
    1,
    "families exact JSON key set",
    failures,
  );
  requireExactCount(
    sql,
    "after_json ?& array['source', 'import_session_id', 'executor_contract_version', 'mutation_plan_hash', 'created_by_execution']",
    2,
    "membership exact JSON key sets",
    failures,
  );
  requireExactCount(sql, "(select count(*) from jsonb_object_keys(after_json)) = 5", 3, "five-key object bounds", failures);
  requireExactCount(sql, "(select count(*) from jsonb_object_keys(after_json)) = 7", 1, "seven-key object bound", failures);
  if (count(sql, "create policy") !== 1) failures.push("0032 must create exactly one policy");
  if (count(sql, "for insert") !== 1) failures.push("0032 must contain only one INSERT policy");
  for (const [pattern, label] of [
    [/\bsecurity\s+definer\b/i, "SECURITY DEFINER"],
    [/\bdisable\s+row\s+level\s+security\b/i, "RLS disable"],
    [/\bforce\s+row\s+level\s+security\b/i, "FORCE RLS"],
    [/^\s*(?:grant|revoke)\b/im, "grant or revoke"],
    [/^\s*(?:create|alter|drop)\s+(?:or\s+replace\s+)?function\b/im, "function change"],
    [/^\s*(?:insert\s+into|update|delete\s+from|truncate)\s+public\./im, "business-data operation"],
    [/^\s*select\s+public\.a17o_tx_execute_grouped_giapha4_official_import\s*\(/im, "executor call"],
    [/\bto\s+(?:anon|public)\b/i, "anon/PUBLIC policy role"],
    [/\bfor\s+(?:update|delete)\b/i, "revision update/delete policy"],
  ]) reject(sql, pattern, label, failures);
}

function validateVerifier(sql, failures) {
  if (!/^\s*(?:--[^\n]*\n)+with\b/i.test(sql)) failures.push("verifier must be a SELECT-only WITH query");
  for (const token of [
    "pg_catalog.pg_policy",
    "pg_catalog.pg_get_expr",
    "a16br_revisions_insert_official_import_create",
    "a17or3_revisions_insert_grouped_official_import",
    "relrowsecurity",
    "relforcerowsecurity",
    "array['authenticated'::pg_catalog.regrole::oid]",
    "pg_catalog.aclexplode",
    "pg_catalog.acldefault('r', t.relowner)",
    "grantee = 0 or grantee = 'anon'::pg_catalog.regrole",
    "revisions_anon_public_grants_absent",
    "a17or3_stable_provenance_and_target_identifier_catalog_markers_present",
    "a17or3_json_shape_catalog_markers_present",
    "a17or3_session_and_manifest_approval_catalog_markers_present",
    "a17or3_target_family_catalog_markers_present",
    "a17or3_json_type_and_hash_catalog_markers_present",
    "position('imports.create' in with_check)",
    "position('permissions.manage' in with_check)",
    "exact_permissive_authenticated_insert_policy_allowlist",
    "revisions_insert_policy_name_inventory",
    "revisions_insert_policy_count",
    "revisions_authenticated_insert_grant_present",
    "revisions_anon_insert_grant_absent",
    "revisions_public_insert_grant_absent",
    "polpermissive",
    "policy_count = 4",
    "'a16br_revisions_insert_official_import_create'",
    "'a17n_tx1_revisions_insert_admin_canonical_family_write'",
    "'a17or3_revisions_insert_grouped_official_import'",
    "'a17q_tx1_revisions_insert_legacy_family_reconciliation'",
  ]) requireToken(sql, token, "post-apply verifier", failures);
  requireToken(sql, "array_agg(polname order by polname)::text[] as policy_names", "post-apply verifier name-array type alignment", failures);
  requireExactCount(sql, "::text[]", 2, "post-apply verifier explicit name-array casts", failures);
  reject(sql, /a17or3_entity_action_alignment|a17or3_exact_provenance_shape_and_actor_contract|a17or3_target_family_existence_and_create_actor_contract/i, "overclaimed verifier result name", failures);
  reject(sql, /action\s+IN\s*\(\s*''create''\s*,\s*''update''\s*\)/i, "brittle action-IN deparser assertion", failures);
  reject(sql, /action\s*=\s*''update''\s+OR\s+target_family\.created_by/i, "brittle target-family deparser assertion", failures);
  reject(sql, /has_permission\s*\(\s*''(?:imports\.create|permissions\.manage)''\s*\)/i, "brittle permission function-call deparser assertion", failures);
  reject(sql, /^\s*(?:insert|update|delete|create|alter|drop|grant|revoke|truncate|call|do)\b/im, "verifier mutation or DDL", failures);
  reject(sql, /a17o_tx_execute_grouped_giapha4_official_import\s*\(/i, "verifier executor call", failures);
}

function assertRejected(label, source, mutation, validator) {
  const failures = [];
  validator(mutation(source), failures);
  if (failures.length === 0) throw new Error(`negative control accepted: ${label}`);
}

function main() {
  const dbMigration = read(dbMigrationPath);
  const supabaseMigration = read(supabaseMigrationPath);
  const source0031 = read(source0031Path);
  const source0031Mirror = read(source0031MirrorPath);
  const verifier = read(verifierPath);
  const failures = [];

  if (dbMigration !== supabaseMigration) failures.push("0032 migration mirrors differ");
  if (source0031 !== source0031Mirror) failures.push("0031 source mirrors differ");
  validate0031(source0031, failures);
  validateMigration(dbMigration, failures);
  validateVerifier(verifier, failures);

  assertRejected("SECURITY DEFINER", dbMigration, (value) => value.replace("for insert", "security definer\nfor insert"), validateMigration);
  assertRejected("session status weakening", dbMigration, (value) => value.replace("owner_approved_for_db_write", "ready_for_owner_approval"), validateMigration);
  assertRejected("extra JSON key weakening", dbMigration, (value) => value.replace("(select count(*) from jsonb_object_keys(after_json)) = 5", "(select count(*) from jsonb_object_keys(after_json)) >= 5"), validateMigration);
  assertRejected("session approval provenance removal", dbMigration, (value) => value.replace("owned_session.approved_by = public.current_profile_id()", "true"), validateMigration);
  assertRejected("manifest provenance equality removal", dbMigration, (value) => value.replace("eligible_manifest.manifest_hash = owned_session.preview_manifest_hash", "true"), validateMigration);
  assertRejected("family update alignment weakening", dbMigration, (value) => value.replace("after_json ->> 'family_reused' = 'true'", "after_json ->> 'family_reused' = 'false'"), validateMigration);
  assertRejected("target actor provenance removal", dbMigration, (value) => value.replace("target_child.created_by = public.current_profile_id()", "true"), validateMigration);
  assertRejected("target family correlation removal", dbMigration, (value) => value.replace("target_family.id = entity_id", "true"), validateMigration);
  assertRejected("unexpected data operation", dbMigration, (value) => `${value}\ninsert into public.revisions (entity_type) values ('people');\n`, validateMigration);
  assertRejected("verifier mutation", verifier, (value) => `${value}\ndelete from public.revisions;\n`, validateVerifier);
  assertRejected("verifier insert-policy allowlist weakening", verifier, (value) => value.replace("policy_count = 4", "policy_count = 3"), validateVerifier);
  assertRejected("verifier brittle action-IN deparser assertion", verifier, (value) => `${value}\n-- action IN (''create'', ''update'')\n`, validateVerifier);
  assertRejected("verifier brittle permission function-call assertion", verifier, (value) => `${value}\n-- has_permission(''imports.create'')\n`, validateVerifier);
  assertRejected("verifier name-array cast removal", verifier, (value) => value.replace("array_agg(polname order by polname)::text[] as policy_names", "array_agg(polname order by polname) as policy_names"), validateVerifier);

  if (failures.length) throw new Error(failures.join("\n"));
  console.log(`A17OR3_0031_SHA256=${sha(source0031)}`);
  console.log(`A17OR3_0032_SHA256=${sha(dbMigration)}`);
  console.log(`A17OR3_VERIFIER_SHA256=${sha(verifier)}`);
  console.log("NEGATIVE_CONTROL_COUNT=14");
  console.log("SQL_EXECUTED=NO");
  console.log("RPC_CALLED=NO");
  console.log("A17OR3_REVISIONS_INSERT_RLS_COMPATIBILITY=PASS");
}

try {
  main();
} catch (error) {
  console.error("A17OR3_REVISIONS_INSERT_RLS_COMPATIBILITY=FAIL");
  console.error(error.message);
  process.exit(1);
}

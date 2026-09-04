#!/usr/bin/env node

/*
 * Git-free, dependency-free contract checker for forward migration 0031.
 * It derives the only permitted candidate from exact 0030 bytes; it never
 * connects to PostgreSQL and never invokes the transaction RPC.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const baseDbPath = "db/migrations/20260901_0030_a17o_tx2_schema_qualified_pgcrypto_digest_patch.sql";
const baseSupabasePath = "supabase/migrations/20260901_0030_a17o_tx2_schema_qualified_pgcrypto_digest_patch.sql";
const candidateDbPath = "db/migrations/20260904_0031_a17o_r_forward_rpc_approval_invariant_patch.sql";
const candidateSupabasePath = "supabase/migrations/20260904_0031_a17o_r_forward_rpc_approval_invariant_patch.sql";
const verifierPath = "db/checks/20260904_check_a17o_r_forward_rpc_approval_invariant_patch.sql";
const expectedBaseSha = "b56a4f6950e491efee3d0d68048df59d968f2b00663430d255370a9c72e36190";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function count(value, needle) {
  return value.split(needle).length - 1;
}

function replaceExactly(source, oldValue, newValue, label, replacements) {
  const oldCount = count(source, oldValue);
  if (oldCount !== 1) {
    throw new Error(`${label}: expected one old block, found ${oldCount}`);
  }
  replacements.push(`${label}=1`);
  return source.replace(oldValue, newValue);
}

function derive0031(source) {
  if (sha(source) !== expectedBaseSha) {
    throw new Error("0030_SHA256_MISMATCH");
  }

  const replacements = [];
  let derived = source;
  derived = replaceExactly(
    derived,
    "-- A-17O-TX2: schema-qualified pgcrypto digest patch.\n-- Recreates only public.a17o_tx_execute_grouped_giapha4_official_import from immutable 0025.\n-- The two pgcrypto digest chains are schema-qualified without changing RPC semantics.\n-- SQL_EXECUTED_BY_CODEX=NO; MIGRATION_APPLIED=NO.\n",
    "-- A-17O-R: forward RPC approval-invariant patch.\n-- Deterministically derived from exact 0030; only declared approval guards differ.\n-- Preserves the complete function, comment, revoke/grant, and table-ACL tail.\n-- SQL_EXECUTED_BY_CODEX=NO; MIGRATION_APPLIED=NO.\n",
    "header",
    replacements,
  );
  derived = replaceExactly(
    derived,
    "  v_duplicate_count integer := 0;\n",
    "  v_duplicate_count integer := 0;\n  v_write_manifest_count integer := 0;\n",
    "write_manifest_count_declaration",
    replacements,
  );
  derived = replaceExactly(
    derived,
    "  if v_session.status not in ('ready_for_owner_approval', 'owner_approved_for_db_write') then\n",
    "  if v_session.status <> 'owner_approved_for_db_write' then\n",
    "session_status",
    replacements,
  );
  derived = replaceExactly(
    derived,
    "  select *\n  into v_write_manifest\n  from public.import_write_manifests\n  where import_session_id = p_import_session_id\n    and status in ('owner_approved', 'ready_for_apply')\n  order by approved_at desc nulls last, created_at desc\n  limit 1\n  for update;\n\n  if not found then\n    raise exception 'A17O_TX_OWNER_APPROVED_WRITE_MANIFEST_REQUIRED';\n  end if;\n",
    "  for v_write_manifest in\n    select *\n    from public.import_write_manifests\n    where import_session_id = p_import_session_id\n      and status in ('owner_approved', 'ready_for_apply')\n    order by id\n    for update\n  loop\n    v_write_manifest_count := v_write_manifest_count + 1;\n  end loop;\n\n  if v_write_manifest_count <> 1 then\n    raise exception 'A17O_TX_OWNER_APPROVED_WRITE_MANIFEST_REQUIRED';\n  end if;\n",
    "locked_exact_one_write_manifest_guard",
    replacements,
  );
  derived = replaceExactly(
    derived,
    "  if v_write_manifest.approval_marker is distinct from p_confirm_marker then\n    raise exception 'A17O_TX_APPROVAL_MARKER_MISMATCH';\n  end if;\n\n  if v_session.approval_marker is not null\n    and v_session.approval_marker is distinct from p_confirm_marker then\n    raise exception 'A17O_TX_SESSION_APPROVAL_MARKER_MISMATCH';\n  end if;\n",
    "  if nullif(btrim(p_confirm_marker), '') is null then\n    raise exception 'A17O_TX_APPROVAL_MARKER_MISMATCH';\n  end if;\n\n  if nullif(btrim(v_write_manifest.approval_marker), '') is null\n    or v_write_manifest.approval_marker is distinct from p_confirm_marker then\n    raise exception 'A17O_TX_APPROVAL_MARKER_MISMATCH';\n  end if;\n\n  if nullif(btrim(v_session.approval_marker), '') is null\n    or v_session.approval_marker is distinct from p_confirm_marker then\n    raise exception 'A17O_TX_SESSION_APPROVAL_MARKER_MISMATCH';\n  end if;\n",
    "nonblank_equal_approval_markers",
    replacements,
  );
  return { derived, replacements };
}

function exceptionInventory(source) {
  return [...new Set(source.match(/'A17O_TX_[A-Z0-9_]+'/g) || [])];
}

function requireExactCount(value, needle, expectedCount, label, failures) {
  const occurrences = count(value, needle);
  if (occurrences !== expectedCount) failures.push(`${label}: expected ${expectedCount} occurrence(s), found ${occurrences}`);
}

function validateVerifier(verifier) {
  const failures = [];
  if (!/^with\b/i.test(verifier)) failures.push("verifier must start WITH");
  for (const token of [
    "pg_catalog.pg_proc",
    "pg_catalog.pg_namespace",
    "pg_catalog.pg_get_functiondef",
    "uuid, text, text, text, jsonb, text, text, boolean, boolean, boolean, boolean",
    "owner_approved_for_db_write",
    "v_write_manifest_count <> 1",
    "nullif(btrim(p_confirm_marker), '''') is null",
    "nullif(btrim(v_write_manifest.approval_marker), '''') is null",
    "nullif(btrim(v_session.approval_marker), '''') is null",
    "A17O_TX_IDEMPOTENCY_RECORD_NOT_VISIBLE",
    "DRY_RUN_ONLY_TRUE",
  ]) {
    if (!verifier.includes(token)) failures.push(`verifier missing ${token}`);
  }
  for (const [token, expectedCount, label] of [
    ["pg_catalog.aclexplode(", 1, "ACL expansion"],
    ["coalesce(tf.proacl, pg_catalog.acldefault('f', tf.proowner))", 1, "effective ACL fallback"],
    ["ae.grantee = 'authenticated'::pg_catalog.regrole", 1, "authenticated ACL grantee"],
    ["ae.grantee = 'anon'::pg_catalog.regrole", 1, "anon ACL grantee"],
    ["ae.grantee = 0", 1, "PUBLIC ACL grantee"],
    ["ae.privilege_type = 'EXECUTE'", 3, "ACL EXECUTE privilege"],
    ["and authenticated_execute_present as exact_authenticated_only_acl", 1, "authenticated final ACL predicate"],
  ]) requireExactCount(verifier, token, expectedCount, label, failures);
  if (!/exists\s*\([\s\S]*?ae\.grantee = 'authenticated'::pg_catalog\.regrole[\s\S]*?ae\.privilege_type = 'EXECUTE'[\s\S]*?\) as authenticated_execute_present/.test(verifier)) {
    failures.push("verifier missing authenticated EXECUTE presence predicate");
  }
  if (!/not exists\s*\([\s\S]*?ae\.grantee = 'anon'::pg_catalog\.regrole[\s\S]*?ae\.privilege_type = 'EXECUTE'[\s\S]*?\) as anon_execute_absent/.test(verifier)) {
    failures.push("verifier missing anon EXECUTE absence predicate");
  }
  if (!/not exists\s*\([\s\S]*?ae\.grantee = 0[\s\S]*?ae\.privilege_type = 'EXECUTE'[\s\S]*?\) as public_execute_absent/.test(verifier)) {
    failures.push("verifier missing PUBLIC EXECUTE absence predicate");
  }
  if (!/anon_execute_absent\s+and public_execute_absent\s+and authenticated_execute_present as exact_authenticated_only_acl/.test(verifier)) {
    failures.push("verifier missing exact combined ACL predicate");
  }
  if (/\band true\b/i.test(verifier)) failures.push("verifier contains ACL tautology");
  if (/has_function_privilege|array_length\(proacl/i.test(verifier)) failures.push("verifier retains ACL heuristic");
  if (/^\s*(?:insert|update|delete|create|alter|drop|grant|revoke|call|do)\b/im.test(verifier)) {
    failures.push("verifier contains DDL or mutation");
  }
  if (/select\s+public\.a17o_tx_execute_grouped_giapha4_official_import\s*\(/i.test(verifier)) {
    failures.push("verifier invokes executor RPC");
  }
  return failures;
}

function validateCandidate({ baseDb, baseSupabase, candidateDb, candidateSupabase, verifier }) {
  const failures = [];
  if (sha(baseDb) !== expectedBaseSha) failures.push("0030 db SHA256 mismatch");
  if (sha(baseSupabase) !== expectedBaseSha) failures.push("0030 supabase SHA256 mismatch");
  if (baseDb !== baseSupabase) failures.push("0030 mirrors differ");

  let derivation;
  try {
    derivation = derive0031(baseDb);
  } catch (error) {
    failures.push(error.message);
    return { failures, replacements: [] };
  }
  const { derived, replacements } = derivation;
  if (candidateDb !== derived) failures.push("db 0031 differs from deterministic derivation");
  if (candidateSupabase !== candidateDb) failures.push("0031 mirrors differ");

  const required = [
    "security invoker",
    "set search_path = public, auth, pg_temp",
    "returns jsonb",
    "language plpgsql",
    "if p_dry_run_only then",
    "A17O_TX_IDEMPOTENCY_RECORD_NOT_VISIBLE",
    "if v_session.status <> 'owner_approved_for_db_write' then",
    "v_write_manifest_count integer := 0;",
    "for v_write_manifest in",
    "order by id\n    for update",
    "v_write_manifest_count <> 1",
    "nullif(btrim(p_confirm_marker), '') is null",
    "nullif(btrim(v_write_manifest.approval_marker), '') is null",
    "nullif(btrim(v_session.approval_marker), '') is null",
    "grant execute on function public.a17o_tx_execute_grouped_giapha4_official_import",
    ") to authenticated;",
  ];
  for (const token of required) {
    if (!candidateDb.includes(token)) failures.push(`0031 missing ${token}`);
  }
  if (candidateDb.includes("order by approved_at desc nulls last, created_at desc\n  limit 1\n  for update;")) {
    failures.push("0031 retains latest-manifest order/limit guard");
  }
  if (count(candidateDb, "create or replace function public.a17o_tx_execute_grouped_giapha4_official_import(") !== 1) {
    failures.push("0031 must contain exactly one target function");
  }
  if (count(candidateDb, "\nend;\n$$;") !== 1) failures.push("0031 must contain exactly one function end");
  const sourceTail = baseDb.slice(baseDb.indexOf("\ncomment on table public.official_import_grouped_execution_idempotency"));
  const candidateTail = candidateDb.slice(candidateDb.indexOf("\ncomment on table public.official_import_grouped_execution_idempotency"));
  if (!sourceTail || sourceTail !== candidateTail) failures.push("comment/revoke/grant/table-ACL tail drift");
  for (const exception of exceptionInventory(baseDb)) {
    if (!candidateDb.includes(exception)) failures.push(`missing pre-existing exception ${exception}`);
  }
  if (/^\s*select\s+public\.a17o_tx_execute_grouped_giapha4_official_import\s*\(/im.test(candidateDb)) {
    failures.push("migration contains top-level executor call");
  }
  failures.push(...validateVerifier(verifier));
  return { failures, replacements };
}

function assertNegative(label, mutation) {
  const result = mutation();
  if (result.failures.length === 0) throw new Error(`negative control accepted: ${label}`);
  return label;
}

function mutateExactly(value, oldValue, newValue, label) {
  const occurrences = count(value, oldValue);
  if (occurrences !== 1) throw new Error(`${label}: exact mutation source count was ${occurrences}`);
  return value.replace(oldValue, newValue);
}

function assertVerifierNegative(label, verifier, oldValue, newValue) {
  const mutatedVerifier = mutateExactly(verifier, oldValue, newValue, label);
  const failures = validateVerifier(mutatedVerifier);
  if (failures.length === 0) throw new Error(`negative control accepted: ${label}`);
  return label;
}

function main() {
  const baseDb = read(baseDbPath);
  const baseSupabase = read(baseSupabasePath);
  const candidateDb = read(candidateDbPath);
  const candidateSupabase = read(candidateSupabasePath);
  const verifier = read(verifierPath);
  const actual = validateCandidate({ baseDb, baseSupabase, candidateDb, candidateSupabase, verifier });
  if (actual.failures.length) throw new Error(actual.failures.join("\n"));

  const negativeControls = [
    assertNegative("wrong 0030 hash", () => validateCandidate({ baseDb: `${baseDb}x`, baseSupabase, candidateDb, candidateSupabase, verifier })),
    assertNegative("0030 mirror drift", () => validateCandidate({ baseDb, baseSupabase: `${baseSupabase}x`, candidateDb, candidateSupabase, verifier })),
    assertNegative("0031 mirror drift", () => validateCandidate({ baseDb, baseSupabase, candidateDb, candidateSupabase: `${candidateSupabase}x`, verifier })),
    assertNegative("unallowed byte drift", () => validateCandidate({ baseDb, baseSupabase, candidateDb: `${candidateDb}x`, candidateSupabase: `${candidateSupabase}x`, verifier })),
    assertNegative("session status weakening", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("owner_approved_for_db_write", "ready_for_owner_approval"), candidateSupabase: candidateDb.replace("owner_approved_for_db_write", "ready_for_owner_approval"), verifier })),
    assertNegative("manifest cardinality weakening", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("v_write_manifest_count <> 1", "v_write_manifest_count < 1"), candidateSupabase: candidateDb.replace("v_write_manifest_count <> 1", "v_write_manifest_count < 1"), verifier })),
    assertNegative("manifest lock weakening", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("    for update\n  loop", "  loop"), candidateSupabase: candidateDb.replace("    for update\n  loop", "  loop"), verifier })),
    assertNegative("manifest lock order drift", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("    order by id\n    for update", "    order by created_at\n    for update"), candidateSupabase: candidateDb.replace("    order by id\n    for update", "    order by created_at\n    for update"), verifier })),
    assertNegative("blank p_confirm marker weakening", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("if nullif(btrim(p_confirm_marker), '') is null", "if false"), candidateSupabase: candidateDb.replace("if nullif(btrim(p_confirm_marker), '') is null", "if false"), verifier })),
    assertNegative("blank write marker weakening", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("if nullif(btrim(v_write_manifest.approval_marker), '') is null", "if false"), candidateSupabase: candidateDb.replace("if nullif(btrim(v_write_manifest.approval_marker), '') is null", "if false"), verifier })),
    assertNegative("blank session marker weakening", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("if nullif(btrim(v_session.approval_marker), '') is null", "if false"), candidateSupabase: candidateDb.replace("if nullif(btrim(v_session.approval_marker), '') is null", "if false"), verifier })),
    assertNegative("idempotency exception removal", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("A17O_TX_IDEMPOTENCY_RECORD_NOT_VISIBLE", "A17O_TX_REMOVED"), candidateSupabase: candidateDb.replace("A17O_TX_IDEMPOTENCY_RECORD_NOT_VISIBLE", "A17O_TX_REMOVED"), verifier })),
    assertNegative("security invoker drift", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("security invoker", "security definer"), candidateSupabase: candidateDb.replace("security invoker", "security definer"), verifier })),
    assertNegative("search path drift", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace("set search_path = public, auth, pg_temp", "set search_path = public"), candidateSupabase: candidateDb.replace("set search_path = public, auth, pg_temp", "set search_path = public"), verifier })),
    assertNegative("grant drift", () => validateCandidate({ baseDb, baseSupabase, candidateDb: candidateDb.replace(") to authenticated;", ") to anon;"), candidateSupabase: candidateDb.replace(") to authenticated;", ") to anon;"), verifier })),
    assertNegative("top-level executor call", () => validateCandidate({ baseDb, baseSupabase, candidateDb: `${candidateDb}\nselect public.a17o_tx_execute_grouped_giapha4_official_import();\n`, candidateSupabase: `${candidateSupabase}\nselect public.a17o_tx_execute_grouped_giapha4_official_import();\n`, verifier })),
    assertVerifierNegative("verifier authenticated predicate to and true", verifier, "and authenticated_execute_present as exact_authenticated_only_acl", "and true as exact_authenticated_only_acl"),
    assertVerifierNegative("verifier authenticated grantee drift", verifier, "ae.grantee = 'authenticated'::pg_catalog.regrole", "ae.grantee = 'other_role'::pg_catalog.regrole"),
    assertVerifierNegative("verifier anon absence removed", verifier, "not exists (\n      select 1\n      from acl_evidence ae\n      where ae.oid = contract.oid\n        and ae.grantee = 'anon'::pg_catalog.regrole\n        and ae.privilege_type = 'EXECUTE'\n    ) as anon_execute_absent,", "true as anon_execute_absent,"),
    assertVerifierNegative("verifier PUBLIC absence removed", verifier, "not exists (\n      select 1\n      from acl_evidence ae\n      where ae.oid = contract.oid\n        and ae.grantee = 0\n        and ae.privilege_type = 'EXECUTE'\n    ) as public_execute_absent", "true as public_execute_absent"),
    assertVerifierNegative("verifier ACL expansion removed", verifier, "pg_catalog.aclexplode(", "pg_catalog.aclremoved("),
    assertVerifierNegative("verifier effective ACL fallback removed", verifier, "coalesce(tf.proacl, pg_catalog.acldefault('f', tf.proowner))", "tf.proacl"),
    assertVerifierNegative("verifier DDL", verifier, "select\n  count(*) over ()", "delete\n  count(*) over ()"),
    assertVerifierNegative("verifier executor call", verifier, "from acl_contract;", "from acl_contract;\nselect public.a17o_tx_execute_grouped_giapha4_official_import();"),
  ];

  console.log(`BASE_0030_SHA256=${sha(baseDb).toUpperCase()}`);
  console.log(`DERIVED_0031_SHA256=${sha(candidateDb).toUpperCase()}`);
  console.log(`REPLACEMENT_COUNTS=${actual.replacements.join(",")}`);
  console.log(`NEGATIVE_CONTROL_COUNT=${negativeControls.length}`);
  console.log("SQL_EXECUTED=NO");
  console.log("RPC_CALLED=NO");
  console.log("A17O_R_FORWARD_RPC_APPROVAL_INVARIANT_PATCH=PASS");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("A17O_R_FORWARD_RPC_APPROVAL_INVARIANT_PATCH=FAIL");
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { derive0031, validateCandidate, validateVerifier };

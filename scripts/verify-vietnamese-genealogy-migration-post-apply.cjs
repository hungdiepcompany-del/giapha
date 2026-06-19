const { URL } = require("node:url");

const requiredTables = ["clans", "clan_branches", "generation_rules", "person_branch_memberships"];
const excludedTables = ["person_names", "person_life_events", "person_burials", "person_media"];
const existingCoreTables = ["people", "families", "family_parents", "family_children", "couple_relationships"];
const expectedProjectRef = "frkyeuxrlcflmsxxsolp";

const url = process.env.VIET_GENEALOGY_VERIFY_SUPABASE_URL;
const key = process.env.VIET_GENEALOGY_VERIFY_SUPABASE_SERVER_KEY;
const mode = process.env.VIET_GENEALOGY_VERIFY_MODE;

function printSkip(missing) {
  console.log("SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS");
  console.log(`Missing env: ${missing.join(", ")}`);
  console.log("No Supabase client created. No .env.local or .dev.vars file read.");
}

function sanitizeError(error) {
  if (!error) return null;
  return {
    code: error.code || "UNKNOWN",
    message: error.message || "UNKNOWN",
    details: error.details || null,
    hint: error.hint || null,
  };
}

function classifyTableError(error) {
  const text = `${error?.code || ""} ${error?.message || ""} ${error?.details || ""}`.toLowerCase();

  if (text.includes("could not find the table") || text.includes("does not exist") || text.includes("42p01")) {
    return "table_missing_or_not_in_rest_schema_cache";
  }

  if (text.includes("permission denied") || text.includes("insufficient") || text.includes("not authorized")) {
    return "insufficient_metadata_access";
  }

  if (text.includes("schema cache")) {
    return "rest_metadata_not_available";
  }

  return "table_query_failed_unknown";
}

const missing = [];
if (!url) missing.push("VIET_GENEALOGY_VERIFY_SUPABASE_URL");
if (!key) missing.push("VIET_GENEALOGY_VERIFY_SUPABASE_SERVER_KEY");
if (mode !== "read_only") missing.push("VIET_GENEALOGY_VERIFY_MODE=read_only");

if (missing.length > 0) {
  printSkip(missing);
  process.exit(0);
}

let parsedUrl;
try {
  parsedUrl = new URL(url);
} catch {
  console.error("FAIL_INVALID_SUPABASE_URL");
  process.exit(1);
}

async function main() {
  const { createClient } = require("@supabase/supabase-js");

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const failures = [];
  const result = {
    status: "INCOMPLETE",
    sanitizedHost: parsedUrl.host,
    expectedProjectRef,
    projectRefCheck: parsedUrl.host.startsWith(`${expectedProjectRef}.`)
      ? "MATCH"
      : "MISMATCH_OR_CUSTOM_HOST",
    requiredTables: {},
    excludedTables: {},
    existingCoreTables: {},
    rlsVerification: "NOT_VERIFIED_BY_REST_ONLY_VERIFIER_REQUIRES_SQL_METADATA",
    policyVerification: "NOT_VERIFIED_BY_REST_ONLY_VERIFIER_REQUIRES_SQL_METADATA",
    verificationIncomplete: [
      "REST-only verifier cannot prove RLS enabled status.",
      "REST-only verifier cannot prove pg_policies contents.",
      "Use the Phase 113B-fix manual SQL diagnostic checklist for schema/RLS/policy proof.",
    ],
  };

  if (result.projectRefCheck !== "MATCH") {
    failures.push("verification URL host does not match expected Supabase project ref");
  }

  for (const table of requiredTables) {
    const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (error) {
      const classification = classifyTableError(error);
      failures.push(`required table ${table} query failed: ${classification}`);
      result.requiredTables[table] = {
        status: "FAIL",
        classification,
        possibleCauses: ["migration_not_applied", "wrong_project_ref", "rest_metadata_not_available", "insufficient_metadata_access"],
        error: sanitizeError(error),
      };
      continue;
    }

    result.requiredTables[table] = { status: "PASS_REST_TABLE_READ", exists: true, count };
    if (count !== 0) failures.push(`required table ${table} has ${count} rows; expected 0 immediately after schema-only apply`);
  }

  for (const table of excludedTables) {
    const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (!error) {
      failures.push(`excluded table ${table} appears readable/present`);
      result.excludedTables[table] = { status: "FAIL_PRESENT" };
      continue;
    }

    result.excludedTables[table] = {
      status: "EXPECTED_MISSING_OR_NOT_EXPOSED_BY_REST",
      classification: classifyTableError(error),
      error: sanitizeError(error),
    };
  }

  for (const table of existingCoreTables) {
    const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (error) {
      const classification = classifyTableError(error);
      failures.push(`existing core table ${table} query failed: ${classification}`);
      result.existingCoreTables[table] = {
        status: "FAIL",
        classification,
        possibleCauses: ["wrong_project_ref", "rest_metadata_not_available", "insufficient_metadata_access"],
        error: sanitizeError(error),
      };
      continue;
    }

    result.existingCoreTables[table] = { status: "PASS_REST_TABLE_READ" };
  }

  if (failures.length > 0) {
    result.status = "FAIL";
    console.error(JSON.stringify(result, null, 2));
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  result.status = "INCOMPLETE_REQUIRES_SQL_METADATA_FOR_RLS_POLICY";
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("FAIL_UNEXPECTED_VERIFIER_ERROR");
  console.error(error && error.message ? error.message : String(error));
  process.exit(1);
});

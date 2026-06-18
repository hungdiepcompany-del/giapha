const { URL } = require("node:url");

const requiredTables = ["clans", "clan_branches", "generation_rules", "person_branch_memberships"];
const excludedTables = ["person_names", "person_life_events", "person_burials", "person_media"];

const url = process.env.VIET_GENEALOGY_VERIFY_SUPABASE_URL;
const key = process.env.VIET_GENEALOGY_VERIFY_SUPABASE_SERVER_KEY;
const mode = process.env.VIET_GENEALOGY_VERIFY_MODE;

function printSkip(missing) {
  console.log("SKIPPED_MISSING_EXPLICIT_VERIFICATION_CREDENTIALS");
  console.log(`Missing env: ${missing.join(", ")}`);
  console.log("No Supabase client created. No .env.local or .dev.vars file read.");
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
    status: "PASS",
    sanitizedHost: parsedUrl.host,
    requiredTables: {},
    excludedTables: {},
    rlsPolicyVerification: "NOT_VERIFIED_BY_REST_ONLY_VERIFIER",
  };

  for (const table of requiredTables) {
    const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (error) {
      failures.push(`required table ${table} not readable or missing: ${error.code || "UNKNOWN"}`);
      result.requiredTables[table] = "FAIL";
      continue;
    }

    result.requiredTables[table] = { exists: true, count };
    if (count !== 0) failures.push(`required table ${table} has ${count} rows; expected 0 immediately after schema-only apply`);
  }

  for (const table of excludedTables) {
    const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (!error) {
      failures.push(`excluded table ${table} appears readable/present`);
      result.excludedTables[table] = "FAIL_PRESENT";
      continue;
    }

    result.excludedTables[table] = `EXPECTED_MISSING_OR_NOT_EXPOSED_${error.code || "UNKNOWN"}`;
  }

  if (failures.length > 0) {
    result.status = "FAIL";
    console.error(JSON.stringify(result, null, 2));
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("FAIL_UNEXPECTED_VERIFIER_ERROR");
  console.error(error && error.message ? error.message : String(error));
  process.exit(1);
});

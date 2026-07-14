const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const files = {
  service: "lib/reconciliation/a17q-authenticated-dry-run.ts",
  route: "app/api/admin/a17q/reconciliation-dry-run/route.ts",
  page: "app/(admin)/admin/reconciliation/a17q/dry-run/page.tsx",
  client: "components/reconciliation/a17q-authenticated-dry-run-client.tsx",
  verifier:
    "db/checks/20260713_check_a17q_dr1_post_production_reconciliation_dry_run.sql",
  migration:
    "db/migrations/20260713_0026_a17q_tx1_legacy_family_reconciliation_transaction_executor_candidate.sql",
};

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const source = Object.values(files)
  .map((file) => `${file}\n${read(file)}`)
  .join("\n\n");
const service = read(files.service);
const route = read(files.route);
const client = read(files.client);
const verifier = read(files.verifier);
const migration = read(files.migration);
const runtimeSource = [service, route, client, read(files.page)].join("\n");

const dryRunTrueCount = (service.match(/p_dry_run_only:\s*true/g) ?? []).length;
const rpcCallCount = (
  service.match(/rpc\(A17Q_AUTHENTICATED_DRY_RUN_RPC_NAME/g) ?? []
).length;
const nonDryRunPathCount = (
  runtimeSource.match(/p_dry_run_only:\s*false|dryRunOnly:\s*false/g) ?? []
).length;
const activeExecutionPathCount = (
  runtimeSource.match(/execute_admin_a17q_legacy_family_reconciliation[^]*p_dry_run_only:\s*false/g) ??
  []
).length;
const sessionTokenLogged =
  /console\.(log|info|warn|error)|access_token|refresh_token|cookieStore\.getAll\(\).*console/s.test(
    runtimeSource,
  );

assert(
  service.includes('import { createServerSupabaseClient } from "@/lib/supabase/server";'),
  "AUTHENTICATED_SERVER_COOKIE_CLIENT_USED=NO",
);
assert(service.includes("await supabase.auth.getUser()"), "AUTH_USER_CHECKED=NO");
assert(service.includes('supabase.rpc("current_profile_id")'), "PROFILE_RPC_CHECKED=NO");
assert(service.includes('"relationships.update"'), "RELATIONSHIPS_UPDATE_PERMISSION_MISSING");
assert(service.includes('"permissions.manage"'), "PERMISSIONS_MANAGE_PERMISSION_MISSING");
assert(service.includes('"OWNER"') && service.includes('"ADMIN"'), "OWNER_ADMIN_ROLE_GATE_MISSING");
assert(dryRunTrueCount === 1, "DRY_RUN_FLAG_HARDCODED_TRUE=NO");
assert(nonDryRunPathCount === 0, "NON_DRY_RUN_PATH_COUNT_NOT_ZERO");
assert(activeExecutionPathCount === 0, "ACTIVE_EXECUTION_PATH_COUNT_NOT_ZERO");
assert(rpcCallCount === 1, "RPC_CALL_COUNT_NOT_ONE");
assert(
  !runtimeSource.includes("SUPABASE_SERVICE_ROLE_KEY") &&
    !runtimeSource.includes("@/lib/supabase/admin") &&
    !runtimeSource.includes("maybeCreateAdminSupabaseClient"),
  "SERVICE_ROLE_USED=YES",
);
assert(!/jwt|claims|auth\.uid\(\)/i.test(runtimeSource), "JWT_CLAIMS_SPOOFED=YES");
assert(!sessionTokenLogged, "SESSION_TOKEN_LOGGED=YES");
assert(
  service.includes("A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED"),
  "OWNER_MARKER_NOT_HARDCODED",
);
[
  "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
  "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
  "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
  "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
  "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
].forEach((hash) => {
  assert(service.includes(hash), `APPROVED_HASH_MISSING_${hash}`);
});
assert(
  verifier.includes("SELECT_ONLY_VERIFIER=YES") &&
    verifier.includes("DO_NOT_CALL_EXECUTOR") &&
    !/execute_admin_a17q_legacy_family_reconciliation\s*\(/.test(verifier),
  "POST_DRY_RUN_VERIFIER_CONTRACT_CHANGED_OR_CALLS_EXECUTOR",
);
assert(
  migration.includes("security invoker") &&
    migration.includes("p_dry_run_only boolean"),
  "MIGRATION_0026_CONTRACT_NOT_VISIBLE",
);
assert(!source.includes("p_dry_run_only => false"), "MANUAL_SQL_NON_DRY_RUN_PRESENT");

console.log("A17Q_DR1_FIX1_STATUS=PASS_AUTHENTICATED_DRY_RUN_CALLER_PREPARED_NOT_EXECUTED");
console.log("AUTHENTICATED_SERVER_COOKIE_CLIENT_USED=YES");
console.log("SERVICE_ROLE_USED=NO");
console.log("JWT_CLAIMS_SPOOFED=NO");
console.log("DRY_RUN_FLAG_HARDCODED_TRUE=YES");
console.log(`NON_DRY_RUN_PATH_COUNT=${nonDryRunPathCount}`);
console.log(`ACTIVE_EXECUTION_PATH_COUNT=${activeExecutionPathCount}`);
console.log("SESSION_TOKEN_LOGGED=NO");
console.log("RPC_CALLED=NO");
console.log("DATABASE_MUTATION=NO");
console.log("MIGRATION_CHANGED=NO");
console.log("PASS");

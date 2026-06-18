const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const permissionCodes = [
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
];

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
}

async function main() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    printResult({
      marker: "BACKUP_PERMISSION_POST_APPLY_VERIFY_READ_ONLY",
      ok: true,
      status: "SKIPPED",
      reason: "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
      db_mutation: false,
      secrets_printed: false,
    });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: permissions, error: permissionError } = await supabase
    .from("permissions")
    .select("id,code")
    .in("code", permissionCodes);

  if (permissionError) {
    throw new Error(
      `Permission verification failed: ${permissionError.message}`,
    );
  }

  const foundCodes = new Set((permissions || []).map((row) => row.code));
  const missingPermissions = permissionCodes.filter(
    (code) => !foundCodes.has(code),
  );

  const { data: roles, error: roleError } = await supabase
    .from("roles")
    .select("id,code")
    .in("code", ["OWNER", "ADMIN"]);

  if (roleError) {
    throw new Error(`Role verification failed: ${roleError.message}`);
  }

  const roleIds = (roles || []).map((role) => role.id);
  const permissionIds = (permissions || []).map((permission) => permission.id);

  const { data: assignments, error: assignmentError } = await supabase
    .from("role_permissions")
    .select("role_id,permission_id")
    .in("role_id", roleIds)
    .in("permission_id", permissionIds);

  if (assignmentError) {
    throw new Error(
      `Role assignment verification failed: ${assignmentError.message}`,
    );
  }

  const roleById = new Map((roles || []).map((role) => [role.id, role.code]));
  const permissionById = new Map(
    (permissions || []).map((permission) => [permission.id, permission.code]),
  );
  const assignmentSet = new Set(
    (assignments || []).map(
      (assignment) =>
        `${roleById.get(assignment.role_id)}:${permissionById.get(assignment.permission_id)}`,
    ),
  );

  const expectedAssignments = [
    ...permissionCodes.map((code) => `OWNER:${code}`),
    "ADMIN:backup.operator.view",
    "ADMIN:backup.operator.dry_run",
  ];
  const forbiddenAdminAssignments = [
    "ADMIN:backup.operator.execute",
    "ADMIN:backup.operator.restore",
  ];

  const missingAssignments = expectedAssignments.filter(
    (assignment) => !assignmentSet.has(assignment),
  );
  const unexpectedAssignments = forbiddenAdminAssignments.filter(
    (assignment) => assignmentSet.has(assignment),
  );

  const ok =
    missingPermissions.length === 0 &&
    missingAssignments.length === 0 &&
    unexpectedAssignments.length === 0;

  printResult({
    marker: "BACKUP_PERMISSION_POST_APPLY_VERIFY_READ_ONLY",
    ok,
    status: ok ? "PASS" : "FAIL",
    permissions_found: permissionCodes.filter((code) => foundCodes.has(code)),
    permissions_missing: missingPermissions,
    assignments_missing: missingAssignments,
    assignments_unexpected: unexpectedAssignments,
    db_mutation: false,
    secrets_printed: false,
  });

  if (!ok) process.exitCode = 1;
}

main().catch((error) => {
  printResult({
    marker: "BACKUP_PERMISSION_POST_APPLY_VERIFY_READ_ONLY",
    ok: false,
    status: "ERROR",
    error_name: error.name,
    message: error.message,
    db_mutation: false,
    secrets_printed: false,
  });
  process.exitCode = 1;
});

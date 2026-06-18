const { createClient } = require("@supabase/supabase-js");

const marker = "BACKUP_PERMISSION_DB_VERIFICATION_READ_ONLY";
const legacyMarker = "BACKUP_PERMISSION_POST_APPLY_VERIFY_READ_ONLY";
const permissionCodes = [
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
];
const roleCodes = ["OWNER", "ADMIN"];
const expectedAssignments = [
  ...permissionCodes.map((code) => `OWNER:${code}`),
  "ADMIN:backup.operator.view",
  "ADMIN:backup.operator.dry_run",
];
const forbiddenAssignments = [
  "ADMIN:backup.operator.execute",
  "ADMIN:backup.operator.restore",
];

function printResult(result) {
  console.log(
    JSON.stringify(
      {
        marker,
        legacy_marker: legacyMarker,
        ...result,
        db_mutation: false,
        secrets_printed: false,
      },
      null,
      2,
    ),
  );
}

function safeError(stage, error) {
  return {
    marker,
    legacy_marker: legacyMarker,
    ok: false,
    status: "FAIL",
    reason: "READ_ONLY_QUERY_FAILED",
    failed_stage: stage,
    error_code:
      typeof error?.code === "string" ? error.code : "UNAVAILABLE",
    db_mutation: false,
    secrets_printed: false,
  };
}

async function main() {
  const supabaseUrl =
    process.env.BACKUP_PERMISSION_VERIFY_SUPABASE_URL;
  const serverKey =
    process.env.BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY;
  const verificationMode = process.env.BACKUP_PERMISSION_VERIFY_MODE;

  if (!supabaseUrl || !serverKey || !verificationMode) {
    printResult({
      ok: true,
      status: "SKIPPED",
      reason: "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
      permission_verification: "NOT_RUN",
      role_assignment_verification: "NOT_RUN",
      network_called: false,
    });
    return;
  }

  if (verificationMode !== "read_only") {
    printResult({
      ok: true,
      status: "SKIPPED",
      reason: "SKIPPED_VERIFICATION_MODE_NOT_READ_ONLY",
      permission_verification: "NOT_RUN",
      role_assignment_verification: "NOT_RUN",
      network_called: false,
    });
    return;
  }

  const supabase = createClient(supabaseUrl, serverKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: permissions,
    error: permissionError,
  } = await supabase
    .from("permissions")
    .select("id,code")
    .in("code", permissionCodes);

  if (permissionError) {
    printResult(safeError("permissions_select", permissionError));
    process.exitCode = 1;
    return;
  }

  const permissionRows = permissions || [];
  const foundPermissionCodes = new Set(
    permissionRows.map((row) => row.code),
  );
  const missingPermissions = permissionCodes.filter(
    (code) => !foundPermissionCodes.has(code),
  );

  const { data: roles, error: roleError } = await supabase
    .from("roles")
    .select("id,code")
    .in("code", roleCodes);

  if (roleError) {
    printResult(safeError("roles_select", roleError));
    process.exitCode = 1;
    return;
  }

  const roleRows = roles || [];
  const roleById = new Map(
    roleRows.map((role) => [role.id, role.code]),
  );
  const permissionById = new Map(
    permissionRows.map((permission) => [
      permission.id,
      permission.code,
    ]),
  );
  const roleIds = [...roleById.keys()];
  const permissionIds = [...permissionById.keys()];

  let assignmentRows = [];
  if (roleIds.length > 0 && permissionIds.length > 0) {
    const {
      data: assignments,
      error: assignmentError,
    } = await supabase
      .from("role_permissions")
      .select("role_id,permission_id")
      .in("role_id", roleIds)
      .in("permission_id", permissionIds);

    if (assignmentError) {
      printResult(
        safeError("role_permissions_select", assignmentError),
      );
      process.exitCode = 1;
      return;
    }

    assignmentRows = assignments || [];
  }

  const foundRoleCodes = new Set(
    roleRows.map((role) => role.code),
  );
  const missingRoles = roleCodes.filter(
    (code) => !foundRoleCodes.has(code),
  );
  const assignmentSet = new Set(
    assignmentRows.map(
      (assignment) =>
        `${roleById.get(assignment.role_id)}:${permissionById.get(
          assignment.permission_id,
        )}`,
    ),
  );
  const missingAssignments = expectedAssignments.filter(
    (assignment) => !assignmentSet.has(assignment),
  );
  const unexpectedAssignments = forbiddenAssignments.filter(
    (assignment) => assignmentSet.has(assignment),
  );
  const ok =
    missingPermissions.length === 0 &&
    missingRoles.length === 0 &&
    missingAssignments.length === 0 &&
    unexpectedAssignments.length === 0;

  printResult({
    ok,
    status: ok ? "PASS" : "FAIL",
    permission_verification:
      missingPermissions.length === 0 ? "PASS" : "FAIL",
    role_assignment_verification:
      missingRoles.length === 0 &&
      missingAssignments.length === 0 &&
      unexpectedAssignments.length === 0
        ? "PASS"
        : "FAIL",
    permissions_found: permissionCodes.filter((code) =>
      foundPermissionCodes.has(code),
    ),
    permissions_missing: missingPermissions,
    roles_missing: missingRoles,
    assignments_missing: missingAssignments,
    assignments_unexpected: unexpectedAssignments,
    network_called: true,
  });

  if (!ok) process.exitCode = 1;
}

main().catch((error) => {
  printResult(safeError("unexpected_read_only_failure", error));
  process.exitCode = 1;
});

const marker = "BACKUP_PERMISSION_SEED_DRY_RUN_ONLY";

const permissions = [
  {
    code: "backup.operator.view",
    name: "View backup operator",
    description: "View the backup operator UI/panel.",
  },
  {
    code: "backup.operator.dry_run",
    name: "Run backup dry-run",
    description: "Run the backup operator dry-run route.",
  },
  {
    code: "backup.operator.execute",
    name: "Execute backup",
    description: "Reserved for future real backup execution; not enabled now.",
  },
  {
    code: "backup.operator.restore",
    name: "Restore backup",
    description: "Reserved for future real restore execution; not enabled now.",
  },
];

const roleAssignments = [
  {
    role: "OWNER",
    permissions: [
      "backup.operator.view",
      "backup.operator.dry_run",
      "backup.operator.execute",
      "backup.operator.restore",
    ],
  },
  {
    role: "ADMIN",
    permissions: ["backup.operator.view", "backup.operator.dry_run"],
  },
  {
    role: "EDITOR",
    permissions: [],
  },
  {
    role: "CONTRIBUTOR",
    permissions: [],
  },
  {
    role: "FAMILY_VIEWER",
    permissions: [],
  },
  {
    role: "PUBLIC_VIEWER",
    permissions: [],
  },
];

const permissionCodes = new Set(permissions.map((permission) => permission.code));
const unknownAssignments = roleAssignments.flatMap((assignment) =>
  assignment.permissions.filter((permissionCode) => !permissionCodes.has(permissionCode)),
);

if (unknownAssignments.length > 0) {
  console.error(
    JSON.stringify(
      {
        marker,
        dry_run: true,
        ok: false,
        error: "unknown_permission_assignment",
        unknown_permissions: unknownAssignments,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const summary = {
  marker,
  dry_run: true,
  ok: true,
  migration_written: false,
  db_mutation: false,
  network_call: false,
  would_insert: permissions,
  would_assign: roleAssignments,
};

console.log(JSON.stringify(summary, null, 2));

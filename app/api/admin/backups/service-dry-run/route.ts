import { NextResponse } from "next/server";

import { getPermissionContext } from "@/lib/permissions/permission-service";
import {
  backupServiceDryRun,
  backupServiceFixtureVerify,
  backupServiceHealth,
} from "@/server/services/backup-service-client";

export const dynamic = "force-dynamic";

export const BACKUP_OPERATOR_API_DRY_RUN_ONLY =
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY";
export const BACKUP_OPERATOR_API_PERMISSION_GUARD =
  "BACKUP_OPERATOR_API_PERMISSION_GUARD";

const REQUIRED_DRY_RUN_PERMISSION = "backup.operator.dry_run";
const FALLBACK_DRY_RUN_PERMISSION = "permissions.manage";

type BackupOperatorPermissionCode =
  | typeof REQUIRED_DRY_RUN_PERMISSION
  | typeof FALLBACK_DRY_RUN_PERMISSION;

type BackupOperatorPermissionGuard =
  | {
      ok: true;
      permissionSource: BackupOperatorPermissionCode;
    }
  | {
      ok: false;
      status: 401 | 403;
      reason: "login_required" | "missing_permission";
      permissionSource: null;
    };

type BackupOperatorDryRunEnvelope = {
  ok: true;
  marker: typeof BACKUP_OPERATOR_API_DRY_RUN_ONLY;
  permission_guard: typeof BACKUP_OPERATOR_API_PERMISSION_GUARD;
  mode: "dry_run";
  worker_call: false;
  production_backup: false;
  storage_upload: false;
  restore: false;
  route: "/api/admin/backups/service-dry-run";
  permission_boundary: "server_side_permission_guard";
  required_permission: typeof REQUIRED_DRY_RUN_PERMISSION;
  fallback_permission: typeof FALLBACK_DRY_RUN_PERMISSION;
  permission_source: BackupOperatorPermissionCode;
  request_id: string;
  adapter: {
    health: ReturnType<typeof backupServiceHealth>;
    dry_run: ReturnType<typeof backupServiceDryRun>;
    fixture_verify: ReturnType<typeof backupServiceFixtureVerify>;
  };
};

type BackupOperatorDryRunErrorEnvelope = {
  ok: false;
  marker: typeof BACKUP_OPERATOR_API_DRY_RUN_ONLY;
  permission_guard: typeof BACKUP_OPERATOR_API_PERMISSION_GUARD;
  mode: "dry_run";
  worker_call: false;
  production_backup: false;
  storage_upload: false;
  restore: false;
  route: "/api/admin/backups/service-dry-run";
  permission_boundary: "server_side_permission_guard";
  required_permission: typeof REQUIRED_DRY_RUN_PERMISSION;
  fallback_permission: typeof FALLBACK_DRY_RUN_PERMISSION;
  permission_source: null;
  reason: BackupOperatorPermissionGuard extends infer Guard
    ? Guard extends { ok: false; reason: infer Reason }
      ? Reason
      : never
    : never;
};

function createRequestId(): string {
  return `backup-operator-api-dry-run-${Date.now()}`;
}

async function requireBackupOperatorDryRunPermission(): Promise<BackupOperatorPermissionGuard> {
  const context = await getPermissionContext();

  if (!context.user) {
    return {
      ok: false,
      status: 401,
      reason: "login_required",
      permissionSource: null,
    };
  }

  const permissions = context.permissions as readonly string[];

  if (permissions.includes(REQUIRED_DRY_RUN_PERMISSION)) {
    return {
      ok: true,
      permissionSource: REQUIRED_DRY_RUN_PERMISSION,
    };
  }

  if (permissions.includes(FALLBACK_DRY_RUN_PERMISSION)) {
    return {
      ok: true,
      permissionSource: FALLBACK_DRY_RUN_PERMISSION,
    };
  }

  return {
    ok: false,
    status: 403,
    reason: "missing_permission",
    permissionSource: null,
  };
}

function createDryRunEnvelope(
  permissionGuard: Extract<BackupOperatorPermissionGuard, { ok: true }>,
): BackupOperatorDryRunEnvelope {
  const requestId = createRequestId();
  const input = {
    requestId,
    source: "main-app" as const,
  };

  return {
    ok: true,
    marker: BACKUP_OPERATOR_API_DRY_RUN_ONLY,
    permission_guard: BACKUP_OPERATOR_API_PERMISSION_GUARD,
    mode: "dry_run",
    worker_call: false,
    production_backup: false,
    storage_upload: false,
    restore: false,
    route: "/api/admin/backups/service-dry-run",
    permission_boundary: "server_side_permission_guard",
    required_permission: REQUIRED_DRY_RUN_PERMISSION,
    fallback_permission: FALLBACK_DRY_RUN_PERMISSION,
    permission_source: permissionGuard.permissionSource,
    request_id: requestId,
    adapter: {
      health: backupServiceHealth(input),
      dry_run: backupServiceDryRun(input),
      fixture_verify: backupServiceFixtureVerify(input),
    },
  };
}

function createPermissionErrorEnvelope(
  permissionGuard: Extract<BackupOperatorPermissionGuard, { ok: false }>,
): BackupOperatorDryRunErrorEnvelope {
  return {
    ok: false,
    marker: BACKUP_OPERATOR_API_DRY_RUN_ONLY,
    permission_guard: BACKUP_OPERATOR_API_PERMISSION_GUARD,
    mode: "dry_run",
    worker_call: false,
    production_backup: false,
    storage_upload: false,
    restore: false,
    route: "/api/admin/backups/service-dry-run",
    permission_boundary: "server_side_permission_guard",
    required_permission: REQUIRED_DRY_RUN_PERMISSION,
    fallback_permission: FALLBACK_DRY_RUN_PERMISSION,
    permission_source: null,
    reason: permissionGuard.reason,
  };
}

async function createGuardedDryRunResponse() {
  const permissionGuard = await requireBackupOperatorDryRunPermission();

  if (!permissionGuard.ok) {
    return NextResponse.json(createPermissionErrorEnvelope(permissionGuard), {
      status: permissionGuard.status,
    });
  }

  return NextResponse.json(createDryRunEnvelope(permissionGuard));
}

export async function GET() {
  return createGuardedDryRunResponse();
}

export async function POST() {
  return createGuardedDryRunResponse();
}

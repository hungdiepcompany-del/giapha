import "server-only";

import { NextResponse } from "next/server";

import { getPermissionContext } from "@/lib/permissions/permission-service";
import { backupServiceProductionPreflight } from "@/server/services/backup-service-client";

export const dynamic = "force-dynamic";

const REQUIRED_DRY_RUN_PERMISSION = "backup.operator.dry_run";
const FALLBACK_DRY_RUN_PERMISSION = "permissions.manage";
const ROUTE = "/api/admin/backups/service-preflight";
const MARKER = "BACKUP_OPERATOR_PRODUCTION_PREFLIGHT_ONLY";

type PermissionSource = typeof REQUIRED_DRY_RUN_PERMISSION | typeof FALLBACK_DRY_RUN_PERMISSION;

async function requireBackupPreflightPermission(): Promise<
  | { ok: true; permissionSource: PermissionSource }
  | { ok: false; status: 401 | 403; reason: "login_required" | "missing_permission" }
> {
  const context = await getPermissionContext();
  if (!context.user) return { ok: false, status: 401, reason: "login_required" };
  const permissions = context.permissions as readonly string[];
  if (permissions.includes(REQUIRED_DRY_RUN_PERMISSION)) {
    return { ok: true, permissionSource: REQUIRED_DRY_RUN_PERMISSION };
  }
  if (permissions.includes(FALLBACK_DRY_RUN_PERMISSION)) {
    return { ok: true, permissionSource: FALLBACK_DRY_RUN_PERMISSION };
  }
  return { ok: false, status: 403, reason: "missing_permission" };
}

export async function POST() {
  const permission = await requireBackupPreflightPermission();
  if (!permission.ok) {
    return NextResponse.json({
      ok: false,
      marker: MARKER,
      route: ROUTE,
      production_backup: false,
      storage_upload: false,
      restore: false,
      reason: permission.reason,
    }, { status: permission.status });
  }

  const requestId = crypto.randomUUID();
  try {
    const service = await backupServiceProductionPreflight(requestId);
    return NextResponse.json({
      ok: true,
      marker: MARKER,
      route: ROUTE,
      permission_source: permission.permissionSource,
      worker_call: true,
      production_backup: false,
      storage_upload: false,
      restore: false,
      request_id: requestId,
      service,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      marker: MARKER,
      route: ROUTE,
      worker_call: false,
      production_backup: false,
      storage_upload: false,
      restore: false,
      request_id: requestId,
      reason: "service_preflight_unavailable",
    }, { status: 503 });
  }
}

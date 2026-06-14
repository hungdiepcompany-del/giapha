import "server-only";

import { redirect } from "next/navigation";

import {
  getPermissionContext,
  type PermissionContext,
} from "@/lib/permissions/permission-service";
import type { PermissionCode } from "@/lib/permissions/permission-types";

function encodeReason(reason: string) {
  return encodeURIComponent(reason.replace(/\s+/g, "_").toLowerCase());
}

export async function requirePermission(
  permissionCode: PermissionCode,
): Promise<PermissionContext> {
  const context = await getPermissionContext();

  if (!context.user) {
    redirect(`/auth/login?reason=${encodeReason(context.reason ?? "login_required")}`);
  }

  if (!context.permissions.includes(permissionCode)) {
    redirect(
      `/unauthorized?reason=${encodeReason(
        context.reason ?? `missing_${permissionCode}`,
      )}`,
    );
  }

  return context;
}

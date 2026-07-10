import { NextResponse } from "next/server";

import { getOfficialImportRpcIdentityPrecheckDiagnostic } from "@/lib/import/giapha4/official-import-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

const A16BH_OFFICIAL_IMPORT_IDENTITY_PRECHECK_DIAGNOSTIC_MARKER =
  "A16BH_OFFICIAL_IMPORT_IDENTITY_PRECHECK_DIAGNOSTIC";

const A16BH_BLOCKED_UNAUTHENTICATED =
  "A16BH_BLOCKED_UNAUTHENTICATED";

const A16BH_BLOCKED_PERMISSION_CONTEXT_INSUFFICIENT =
  "A16BH_BLOCKED_PERMISSION_CONTEXT_INSUFFICIENT";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

function blockedDiagnostic(params: {
  status: "UNAUTHENTICATED" | "FORBIDDEN";
  authenticatedAuthUserPresent: boolean;
  runtimePermissionProfilePresent: boolean;
  blocker:
    | typeof A16BH_BLOCKED_UNAUTHENTICATED
    | typeof A16BH_BLOCKED_PERMISSION_CONTEXT_INSUFFICIENT;
}) {
  return {
    ok: false,
    marker: A16BH_OFFICIAL_IMPORT_IDENTITY_PRECHECK_DIAGNOSTIC_MARKER,
    status: params.status,
    authenticatedAuthUserPresent: params.authenticatedAuthUserPresent,
    runtimePermissionProfilePresent: params.runtimePermissionProfilePresent,
    rpcVisibleProfilePresent: false,
    auditedSessionOwnerProfilePresent: false,
    runtimeProfileMatchesRpcVisibleProfile: false,
    runtimeProfileMatchesAuditedSessionOwner: false,
    rpcVisibleProfileMatchesAuditedSessionOwner: false,
    precheckAndImportRpcUseSameClientInstance: false,
    permissionClientAuthContext:
      "END_USER_SERVER_COOKIES_PLUS_ADMIN_PROFILE_PERMISSION_READS",
    rpcClientAuthContext: "NOT_EVALUATED",
    rpcVisibleProfileResult: "NOT_EVALUATED",
    productionRpcContractStatus: "NOT_EVALUATED",
    blocker: params.blocker,
    piiPrinted: false,
  };
}

function hasStrictOfficialImportDiagnosticPermission(
  permissions: readonly string[],
) {
  return (
    permissions.includes("imports.create") &&
    permissions.includes("people.create") &&
    permissions.includes("relationships.create") &&
    permissions.includes("permissions.manage")
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const permissionContext = await getPermissionContext();

  if (!permissionContext.user) {
    return NextResponse.json(
      blockedDiagnostic({
        status: "UNAUTHENTICATED",
        authenticatedAuthUserPresent: false,
        runtimePermissionProfilePresent: false,
        blocker: A16BH_BLOCKED_UNAUTHENTICATED,
      }),
      { status: 401 },
    );
  }

  if (
    !hasStrictOfficialImportDiagnosticPermission(permissionContext.permissions)
  ) {
    return NextResponse.json(
      blockedDiagnostic({
        status: "FORBIDDEN",
        authenticatedAuthUserPresent: true,
        runtimePermissionProfilePresent: Boolean(permissionContext.profile),
        blocker: A16BH_BLOCKED_PERMISSION_CONTEXT_INSUFFICIENT,
      }),
      { status: 403 },
    );
  }

  const result = await getOfficialImportRpcIdentityPrecheckDiagnostic({
    sessionId,
    actor: permissionContext,
  });

  return NextResponse.json(
    {
      ok: result.ok,
      marker: A16BH_OFFICIAL_IMPORT_IDENTITY_PRECHECK_DIAGNOSTIC_MARKER,
      status: result.ok ? "PASS_READ_ONLY" : "BLOCKED",
      authenticatedAuthUserPresent: result.authenticatedAuthUserPresent,
      runtimePermissionProfilePresent:
        result.runtimePermissionProfilePresent,
      rpcVisibleProfilePresent: result.rpcVisibleProfilePresent,
      auditedSessionOwnerProfilePresent:
        result.auditedSessionOwnerProfilePresent,
      runtimeProfileMatchesRpcVisibleProfile:
        result.runtimeProfileMatchesRpcVisibleProfile,
      runtimeProfileMatchesAuditedSessionOwner:
        result.runtimeProfileMatchesAuditedSessionOwner,
      rpcVisibleProfileMatchesAuditedSessionOwner:
        result.rpcVisibleProfileMatchesAuditedSessionOwner,
      precheckAndImportRpcUseSameClientInstance:
        result.precheckAndImportRpcUseSameClientInstance,
      permissionClientAuthContext: result.permissionClientAuthContext,
      rpcClientAuthContext: result.rpcClientAuthContext,
      rpcVisibleProfileResult: result.rpcVisibleProfileResult,
      productionRpcContractStatus: result.productionRpcContractStatus,
      blocker: result.blocker,
      piiPrinted: false,
    },
    { status: result.ok ? 200 : 409 },
  );
}

import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PermissionCode, RoleCode } from "@/lib/permissions/permission-types";

export const A17Q_AUTHENTICATED_EXECUTION_ROUTE =
  "/api/admin/a17q/reconciliation-execute" as const;

export const A17Q_AUTHENTICATED_EXECUTION_PAGE =
  "/admin/reconciliation/a17q/execute" as const;

export const A17Q_AUTHENTICATED_EXECUTION_RPC_NAME =
  "execute_admin_a17q_legacy_family_reconciliation" as const;

export const A17Q_AUTHENTICATED_EXECUTION_OWNER_APPROVAL_MARKER =
  "A17P_MANUAL_21_GROUP_RECONCILIATION_APPROVED" as const;

export const A17Q_AUTHENTICATED_EXECUTION_IDEMPOTENCY_KEY =
  "A17Q_EXEC1_SINGLE_EXECUTION_20260714_FBBF24C_001" as const;

export const A17Q_AUTHENTICATED_EXECUTION_CONFIRMATION_PHRASE =
  "EXECUTE_A17Q_21_GROUP_RECONCILIATION" as const;

export const A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES = {
  decisionPackSha256:
    "777a8bb13ff45eb9f46fd817c392098ada4a2d550cad8e6ee4c6cd896b874ad0",
  approvedGroupPlanSha256:
    "7dd719c926dc560aa69bc7070c395535942823e87739d9893d0161713e151740",
  roleCorrectionPlanSha256:
    "ee255398f84dc2ce899d14056fb0573f771202ca7ad71e598cbbe7fc47707a9f",
  excludedScopeSha256:
    "7898280dab816af96b6a9277b93b49429c5db8a71c9f24739a7d55660a0bdd61",
  forecastSha256:
    "4c0beb0de1589a7728b7f8b4918844e3103aa773ad3a5ab8e87d1ab2cead9ff3",
} as const;

export const A17Q_AUTHENTICATED_EXECUTION_REQUIRED_PERMISSIONS = [
  "relationships.update",
  "permissions.manage",
] as const satisfies readonly PermissionCode[];

type RoleRow = {
  id: string;
  code: RoleCode;
};

type ProfileRoleRow = {
  role_id: string;
};

type RolePermissionRow = {
  permission_id: string;
};

type PermissionRow = {
  id: string;
  code: PermissionCode;
};

export type A17QAuthenticatedExecutionGate = {
  authenticated: boolean;
  userEmail: string | null;
  profileVisible: boolean;
  roleVisible: boolean;
  ownerAdminRoleVisible: boolean;
  roles: RoleCode[];
  permissionCount: number;
  requiredPermissionsPresent: boolean;
  permissions: PermissionCode[];
  canRunExecution: boolean;
  blockedReasons: string[];
};

export type A17QAuthenticatedExecutionRequest = {
  confirmationPhrase?: string;
  confirmBackupReviewed?: boolean;
  confirmRollbackReviewed?: boolean;
  confirmAuditReviewed?: boolean;
  confirmExcludedScopeReviewed?: boolean;
};

export type A17QAuthenticatedExecutionResult = {
  ok: boolean;
  status: "BLOCKED" | "CONFIRMATION_REQUIRED" | "RPC_RETURNED" | "RPC_ERROR";
  gate: A17QAuthenticatedExecutionGate;
  rpcName: typeof A17Q_AUTHENTICATED_EXECUTION_RPC_NAME;
  dryRunOnly: false;
  executionEnabled: true;
  confirmationPhraseAccepted: boolean;
  reviewConfirmationsAccepted: boolean;
  rpcResult: unknown;
  blockedReasons: string[];
  piiPrinted: false;
};

function uniqueValues<T>(values: T[]) {
  return [...new Set(values)];
}

function addBlockedReason(
  blockedReasons: string[],
  condition: boolean,
  reason: string,
) {
  if (!condition) blockedReasons.push(reason);
}

async function readExecutionPermissionContextFromServerCookieSession(): Promise<
  A17QAuthenticatedExecutionGate
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authenticated: false,
      userEmail: null,
      profileVisible: false,
      roleVisible: false,
      ownerAdminRoleVisible: false,
      roles: [],
      permissionCount: 0,
      requiredPermissionsPresent: false,
      permissions: [],
      canRunExecution: false,
      blockedReasons: ["A17Q_EXEC1_AUTHENTICATED_SESSION_REQUIRED"],
    };
  }

  const { data: profileId, error: profileError } =
    await supabase.rpc("current_profile_id");
  const profileVisible = !profileError && typeof profileId === "string";
  const blockedReasons: string[] = [];

  addBlockedReason(
    blockedReasons,
    profileVisible,
    "A17Q_EXEC1_AUTHENTICATED_PROFILE_REQUIRED",
  );

  let roles: RoleCode[] = [];
  let permissions: PermissionCode[] = [];

  if (profileVisible) {
    const { data: profileRoles, error: profileRolesError } = await supabase
      .from("profile_roles")
      .select("role_id")
      .eq("profile_id", profileId)
      .returns<ProfileRoleRow[]>();

    if (profileRolesError) {
      blockedReasons.push("A17Q_EXEC1_PROFILE_ROLES_NOT_VISIBLE");
    }

    const roleIds = uniqueValues((profileRoles ?? []).map((row) => row.role_id));

    if (roleIds.length > 0) {
      const { data: roleRows, error: roleError } = await supabase
        .from("roles")
        .select("id, code")
        .in("id", roleIds)
        .returns<RoleRow[]>();

      if (roleError) {
        blockedReasons.push("A17Q_EXEC1_ROLES_NOT_VISIBLE");
      }

      roles = uniqueValues((roleRows ?? []).map((row) => row.code));

      const { data: rolePermissions, error: rolePermissionsError } =
        await supabase
          .from("role_permissions")
          .select("permission_id")
          .in("role_id", roleIds)
          .returns<RolePermissionRow[]>();

      if (rolePermissionsError) {
        blockedReasons.push("A17Q_EXEC1_ROLE_PERMISSIONS_NOT_VISIBLE");
      }

      const permissionIds = uniqueValues(
        (rolePermissions ?? []).map((row) => row.permission_id),
      );

      if (permissionIds.length > 0) {
        const { data: permissionRows, error: permissionError } = await supabase
          .from("permissions")
          .select("id, code")
          .in("id", permissionIds)
          .returns<PermissionRow[]>();

        if (permissionError) {
          blockedReasons.push("A17Q_EXEC1_PERMISSIONS_NOT_VISIBLE");
        }

        permissions = uniqueValues((permissionRows ?? []).map((row) => row.code));
      }
    }
  }

  const ownerAdminRoleVisible = roles.includes("OWNER") || roles.includes("ADMIN");
  const requiredPermissionsPresent =
    A17Q_AUTHENTICATED_EXECUTION_REQUIRED_PERMISSIONS.every((permission) =>
      permissions.includes(permission),
    );

  addBlockedReason(
    blockedReasons,
    ownerAdminRoleVisible,
    "A17Q_EXEC1_OWNER_OR_ADMIN_ROLE_REQUIRED",
  );
  addBlockedReason(
    blockedReasons,
    requiredPermissionsPresent,
    "A17Q_EXEC1_RELATIONSHIP_UPDATE_AND_PERMISSIONS_MANAGE_REQUIRED",
  );

  return {
    authenticated: true,
    userEmail: user.email ?? null,
    profileVisible,
    roleVisible: roles.length > 0,
    ownerAdminRoleVisible,
    roles,
    permissionCount: permissions.length,
    requiredPermissionsPresent,
    permissions,
    canRunExecution: blockedReasons.length === 0,
    blockedReasons,
  };
}

export async function getA17QAuthenticatedExecutionGate() {
  try {
    return await readExecutionPermissionContextFromServerCookieSession();
  } catch {
    return {
      authenticated: false,
      userEmail: null,
      profileVisible: false,
      roleVisible: false,
      ownerAdminRoleVisible: false,
      roles: [],
      permissionCount: 0,
      requiredPermissionsPresent: false,
      permissions: [],
      canRunExecution: false,
      blockedReasons: ["A17Q_EXEC1_SERVER_COOKIE_CLIENT_UNAVAILABLE"],
    } satisfies A17QAuthenticatedExecutionGate;
  }
}

function hasAcceptedExecutionConfirmations(
  input: A17QAuthenticatedExecutionRequest,
) {
  return (
    input.confirmBackupReviewed === true &&
    input.confirmRollbackReviewed === true &&
    input.confirmAuditReviewed === true &&
    input.confirmExcludedScopeReviewed === true
  );
}

export async function executeA17QAuthenticatedSingleExecution(
  input: A17QAuthenticatedExecutionRequest,
): Promise<A17QAuthenticatedExecutionResult> {
  const gate = await getA17QAuthenticatedExecutionGate();

  if (!gate.canRunExecution) {
    return {
      ok: false,
      status: "BLOCKED",
      gate,
      rpcName: A17Q_AUTHENTICATED_EXECUTION_RPC_NAME,
      dryRunOnly: false,
      executionEnabled: true,
      confirmationPhraseAccepted: false,
      reviewConfirmationsAccepted: false,
      rpcResult: null,
      blockedReasons: gate.blockedReasons,
      piiPrinted: false,
    };
  }

  const confirmationPhraseAccepted =
    input.confirmationPhrase === A17Q_AUTHENTICATED_EXECUTION_CONFIRMATION_PHRASE;
  const reviewConfirmationsAccepted =
    hasAcceptedExecutionConfirmations(input);

  if (!confirmationPhraseAccepted || !reviewConfirmationsAccepted) {
    return {
      ok: false,
      status: "CONFIRMATION_REQUIRED",
      gate,
      rpcName: A17Q_AUTHENTICATED_EXECUTION_RPC_NAME,
      dryRunOnly: false,
      executionEnabled: true,
      confirmationPhraseAccepted,
      reviewConfirmationsAccepted,
      rpcResult: null,
      blockedReasons: ["A17Q_EXEC1_EXACT_OWNER_CONFIRMATION_REQUIRED"],
      piiPrinted: false,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc(A17Q_AUTHENTICATED_EXECUTION_RPC_NAME, {
    p_owner_approval_marker: A17Q_AUTHENTICATED_EXECUTION_OWNER_APPROVAL_MARKER,
    p_decision_pack_sha256:
      A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES.decisionPackSha256,
    p_approved_group_plan_sha256:
      A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES.approvedGroupPlanSha256,
    p_role_correction_plan_sha256:
      A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES.roleCorrectionPlanSha256,
    p_excluded_scope_sha256:
      A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES.excludedScopeSha256,
    p_forecast_sha256:
      A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES.forecastSha256,
    p_idempotency_key: A17Q_AUTHENTICATED_EXECUTION_IDEMPOTENCY_KEY,
    p_confirm_backup_reviewed: true,
    p_confirm_rollback_reviewed: true,
    p_confirm_audit_reviewed: true,
    p_confirm_excluded_scope_reviewed: true,
    p_dry_run_only: false,
  });

  if (error) {
    return {
      ok: false,
      status: "RPC_ERROR",
      gate,
      rpcName: A17Q_AUTHENTICATED_EXECUTION_RPC_NAME,
      dryRunOnly: false,
      executionEnabled: true,
      confirmationPhraseAccepted,
      reviewConfirmationsAccepted,
      rpcResult: {
        errorCode: "A17Q_EXEC1_SINGLE_EXECUTION_RPC_REJECTED",
        message: error.message,
      },
      blockedReasons: ["A17Q_EXEC1_SINGLE_EXECUTION_RPC_REJECTED"],
      piiPrinted: false,
    };
  }

  return {
    ok: true,
    status: "RPC_RETURNED",
    gate,
    rpcName: A17Q_AUTHENTICATED_EXECUTION_RPC_NAME,
    dryRunOnly: false,
    executionEnabled: true,
    confirmationPhraseAccepted,
    reviewConfirmationsAccepted,
    rpcResult: data,
    blockedReasons: [],
    piiPrinted: false,
  };
}

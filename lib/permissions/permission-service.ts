import "server-only";

import type { User } from "@supabase/supabase-js";

import type { ProfileRecord } from "@/lib/auth/profile-service";
import { getCurrentAuthUser } from "@/lib/auth/profile-service";
import type { PermissionCode, RoleCode } from "@/lib/permissions/permission-types";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";

export type RoleSummary = {
  id: string;
  code: RoleCode;
  name: string;
};

export type PermissionContext = {
  user: User | null;
  profile: ProfileRecord | null;
  roles: RoleSummary[];
  permissions: PermissionCode[];
  reason: string | null;
};

type RoleRow = {
  id: string;
  code: RoleCode;
  name: string;
};

type RolePermissionRow = {
  role_id: string;
  permission_id: string;
};

type PermissionRow = {
  id: string;
  code: PermissionCode;
};

export async function getPermissionContext(): Promise<PermissionContext> {
  const { user, error: userError } = await getCurrentAuthUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      roles: [],
      permissions: [],
      reason: userError ?? "anonymous",
    };
  }

  const adminSupabase = maybeCreateAdminSupabaseClient();

  if (!adminSupabase) {
    return {
      user,
      profile: null,
      roles: [],
      permissions: [],
      reason: "missing_admin_config",
    };
  }

  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select(
      "id, auth_user_id, display_name, email, avatar_url, status, created_at, updated_at",
    )
    .eq("auth_user_id", user.id)
    .maybeSingle<ProfileRecord>();

  if (profileError || !profile) {
    return {
      user,
      profile: null,
      roles: [],
      permissions: [],
      reason: profileError?.message ?? "profile_not_found",
    };
  }

  const { data: profileRoles, error: profileRolesError } = await adminSupabase
    .from("profile_roles")
    .select("role_id")
    .eq("profile_id", profile.id);

  if (profileRolesError) {
    return {
      user,
      profile,
      roles: [],
      permissions: [],
      reason: profileRolesError.message,
    };
  }

  const roleIds = [...new Set((profileRoles ?? []).map((row) => row.role_id))];

  if (roleIds.length === 0) {
    return {
      user,
      profile,
      roles: [],
      permissions: [],
      reason: "no_roles",
    };
  }

  const { data: roles, error: rolesError } = await adminSupabase
    .from("roles")
    .select("id, code, name")
    .in("id", roleIds)
    .returns<RoleRow[]>();

  if (rolesError) {
    return {
      user,
      profile,
      roles: [],
      permissions: [],
      reason: rolesError.message,
    };
  }

  const { data: rolePermissions, error: rolePermissionsError } =
    await adminSupabase
      .from("role_permissions")
      .select("role_id, permission_id")
      .in("role_id", roleIds)
      .returns<RolePermissionRow[]>();

  if (rolePermissionsError) {
    return {
      user,
      profile,
      roles: roles ?? [],
      permissions: [],
      reason: rolePermissionsError.message,
    };
  }

  const permissionIds = [
    ...new Set((rolePermissions ?? []).map((row) => row.permission_id)),
  ];

  if (permissionIds.length === 0) {
    return {
      user,
      profile,
      roles: roles ?? [],
      permissions: [],
      reason: "no_permissions",
    };
  }

  const { data: permissions, error: permissionsError } = await adminSupabase
    .from("permissions")
    .select("id, code")
    .in("id", permissionIds)
    .returns<PermissionRow[]>();

  if (permissionsError) {
    return {
      user,
      profile,
      roles: roles ?? [],
      permissions: [],
      reason: permissionsError.message,
    };
  }

  return {
    user,
    profile,
    roles: roles ?? [],
    permissions: [...new Set((permissions ?? []).map((row) => row.code))],
    reason: null,
  };
}

export async function getCurrentProfile() {
  const context = await getPermissionContext();

  return context.profile;
}

export async function getCurrentUserPermissions() {
  const context = await getPermissionContext();

  return context.permissions;
}

export async function hasPermission(permissionCode: PermissionCode) {
  const permissions = await getCurrentUserPermissions();

  return permissions.includes(permissionCode);
}

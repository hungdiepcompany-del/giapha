import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  planAndExecuteAdminChildLink,
  planAndExecuteAdminParentLink,
  type AdminCanonicalFamilyActorContext,
  type AdminCanonicalFamilyLinkResult,
  type AdminFamilyMembershipContext,
} from "@/lib/family/admin-canonical-family-link-service";
import { createAdminCanonicalFamilyTransactionExecutor } from "@/lib/family/admin-canonical-family-transaction-adapter";
import { createSupabaseCanonicalFamilyRepository } from "@/lib/family/canonical-family-supabase-repository";
import { wouldCreateAncestorCycle } from "@/lib/family/relationship-graph";
import type {
  ChildRelationshipType,
  ParentRelationshipType,
  ParentRole,
} from "@/lib/family/relationship-types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PermissionCode, RoleCode } from "@/lib/permissions/permission-types";

type ProfileRow = {
  id: string;
  status: "active" | "disabled";
};

type RoleRow = {
  id: string;
  code: RoleCode;
};

type RolePermissionRow = {
  role_id: string;
  permission_id: string;
};

type PermissionRow = {
  id: string;
  code: PermissionCode;
};

type FamilyRow = {
  id: string;
  canonical_status:
    | "canonical"
    | "legacy_unreviewed"
    | "merged"
    | "voided"
    | "owner_review_required"
    | null;
  deleted_at: string | null;
  updated_at: string | null;
};

type ParentRow = {
  family_id: string;
  person_id: string;
  parent_role: ParentRole;
  relationship_type: ParentRelationshipType;
};

type ChildRow = {
  family_id: string;
  person_id: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalidReference(operation: "ADMIN_PARENT_CANONICAL_LINK" | "ADMIN_CHILD_CANONICAL_LINK") {
  return {
    ok: false,
    code: "BLOCKED_INVALID_REFERENCE",
    message: "Thành viên hoặc gia đình cần gắn không còn hợp lệ.",
    canonicalKey: null,
    familyId: null,
    mutationExecuted: false,
    transactionExecutorRequired: false,
    idempotentReplay: false,
    diagnostics: {
      operation,
      blockerCode: "INVALID_FORM_REFERENCE",
    },
  } satisfies AdminCanonicalFamilyLinkResult;
}

function permissionBlocked(
  operation: "ADMIN_PARENT_CANONICAL_LINK" | "ADMIN_CHILD_CANONICAL_LINK",
) {
  return {
    ok: false,
    code: "BLOCKED_PERMISSION",
    message: "Bạn không có đủ quyền để sửa quan hệ gia đình.",
    canonicalKey: null,
    familyId: null,
    mutationExecuted: false,
    transactionExecutorRequired: false,
    idempotentReplay: false,
    diagnostics: {
      operation,
      blockerCode: "AUTHENTICATED_ACTIVE_PROFILE_AND_PERMISSIONS_REQUIRED",
    },
  } satisfies AdminCanonicalFamilyLinkResult;
}

function isUuid(value: string) {
  return uuidPattern.test(value);
}

async function loadActorContext(
  supabase: SupabaseClient,
): Promise<AdminCanonicalFamilyActorContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, status")
    .eq("auth_user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (profileError || !profile || profile.status !== "active") return null;

  const { data: profileRoles, error: profileRolesError } = await supabase
    .from("profile_roles")
    .select("role_id")
    .eq("profile_id", profile.id)
    .returns<{ role_id: string }[]>();

  if (profileRolesError) return null;
  const roleIds = [...new Set((profileRoles ?? []).map((row) => row.role_id))];
  if (roleIds.length === 0) {
    return { authUserId: user.id, profileId: profile.id, permissions: [] };
  }

  const [{ data: roles, error: rolesError }, { data: rolePermissions, error: rolePermissionError }] =
    await Promise.all([
      supabase.from("roles").select("id, code").in("id", roleIds).returns<RoleRow[]>(),
      supabase
        .from("role_permissions")
        .select("role_id, permission_id")
        .in("role_id", roleIds)
        .returns<RolePermissionRow[]>(),
    ]);

  if (rolesError || rolePermissionError || !roles) return null;
  const permissionIds = [
    ...new Set((rolePermissions ?? []).map((row) => row.permission_id)),
  ];
  if (permissionIds.length === 0) {
    return { authUserId: user.id, profileId: profile.id, permissions: [] };
  }

  const { data: permissions, error: permissionError } = await supabase
    .from("permissions")
    .select("id, code")
    .in("id", permissionIds)
    .returns<PermissionRow[]>();

  if (permissionError) return null;

  return {
    authUserId: user.id,
    profileId: profile.id,
    permissions: [...new Set((permissions ?? []).map((row) => row.code))].filter(
      (code): code is AdminCanonicalFamilyActorContext["permissions"][number] =>
        code === "relationships.create" ||
        code === "relationships.update" ||
        code === "people.create",
    ),
  };
}

async function readFamilyContexts(
  supabase: SupabaseClient,
  familyIds: string[],
): Promise<AdminFamilyMembershipContext[]> {
  const ids = [...new Set(familyIds)].filter(Boolean);
  if (ids.length === 0) return [];

  const [
    { data: families, error: familyError },
    { data: parents, error: parentError },
    { data: children, error: childError },
  ] = await Promise.all([
    supabase
      .from("families")
      .select("id, canonical_status, deleted_at, updated_at")
      .in("id", ids)
      .returns<FamilyRow[]>(),
    supabase
      .from("family_parents")
      .select("family_id, person_id, parent_role, relationship_type")
      .in("family_id", ids)
      .is("deleted_at", null)
      .returns<ParentRow[]>(),
    supabase
      .from("family_children")
      .select("family_id, person_id")
      .in("family_id", ids)
      .is("deleted_at", null)
      .returns<ChildRow[]>(),
  ]);

  if (familyError || parentError || childError) {
    throw new Error("family_context_lookup_failed");
  }

  return (families ?? []).map((family) => ({
    familyId: family.id,
    canonicalStatus: family.canonical_status,
    deletedAt: family.deleted_at,
    updatedAt: family.updated_at,
    parents: (parents ?? [])
      .filter((parent) => parent.family_id === family.id)
      .map((parent) => ({
        personId: parent.person_id,
        parentRole: parent.parent_role,
        relationshipType: parent.relationship_type,
      })),
    childIds: (children ?? [])
      .filter((child) => child.family_id === family.id)
      .map((child) => child.person_id),
  }));
}

async function readChildFamilyContexts(supabase: SupabaseClient, childId: string) {
  const { data, error } = await supabase
    .from("family_children")
    .select("family_id, person_id")
    .eq("person_id", childId)
    .is("deleted_at", null)
    .returns<ChildRow[]>();

  if (error) throw new Error("child_family_context_lookup_failed");
  return readFamilyContexts(
    supabase,
    (data ?? []).map((row) => row.family_id),
  );
}

async function readParentFamilyContexts(
  supabase: SupabaseClient,
  parentIds: string[],
) {
  const ids = [...new Set(parentIds)].filter(Boolean);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("family_parents")
    .select("family_id, person_id")
    .in("person_id", ids)
    .is("deleted_at", null)
    .returns<ParentRow[]>();

  if (error) throw new Error("parent_family_context_lookup_failed");
  return readFamilyContexts(
    supabase,
    (data ?? []).map((row) => row.family_id),
  );
}

async function buildDependencies(supabase: SupabaseClient) {
  const actor = await loadActorContext(supabase);
  if (!actor) return null;

  return {
    actor,
    repository: createSupabaseCanonicalFamilyRepository(supabase),
    transactionExecutor: createAdminCanonicalFamilyTransactionExecutor(supabase),
    async wouldCreateCycle(params: { parentId: string; childId: string }) {
      const result = await wouldCreateAncestorCycle({
        supabase,
        parentId: params.parentId,
        childId: params.childId,
      });

      return result.ok ? result.createsCycle : true;
    },
  };
}

export async function linkExistingParentFromTree(params: {
  childId: string;
  parentId: string;
  parentRole: ParentRole;
  relationshipType: ParentRelationshipType;
}): Promise<AdminCanonicalFamilyLinkResult> {
  const operation = "ADMIN_PARENT_CANONICAL_LINK";
  if (!isUuid(params.childId) || !isUuid(params.parentId)) {
    return invalidReference(operation);
  }

  const supabase = await createServerSupabaseClient();
  const deps = await buildDependencies(supabase);
  if (!deps) return permissionBlocked(operation);

  try {
    return await planAndExecuteAdminParentLink(deps, {
      childId: params.childId,
      parentId: params.parentId,
      parentRole: params.parentRole,
      relationshipType: params.relationshipType,
      childFamilies: await readChildFamilyContexts(supabase, params.childId),
    });
  } catch {
    return invalidReference(operation);
  }
}

export async function linkExistingChildFromTree(params: {
  parentId: string;
  childId: string;
  childRelationshipType: ChildRelationshipType;
  explicitFamilyId?: string | null;
}): Promise<AdminCanonicalFamilyLinkResult> {
  const operation = "ADMIN_CHILD_CANONICAL_LINK";
  if (!isUuid(params.parentId) || !isUuid(params.childId)) {
    return invalidReference(operation);
  }

  const supabase = await createServerSupabaseClient();
  const deps = await buildDependencies(supabase);
  if (!deps) return permissionBlocked(operation);

  try {
    return await planAndExecuteAdminChildLink(deps, {
      childId: params.childId,
      parents: [
        {
          personId: params.parentId,
          parentRole: "parent",
          relationshipType: "unknown",
        },
      ],
      childRelationshipType: params.childRelationshipType,
      parentFamilyContexts: await readParentFamilyContexts(supabase, [
        params.parentId,
      ]),
      explicitFamilyId: params.explicitFamilyId ?? null,
    });
  } catch {
    return invalidReference(operation);
  }
}

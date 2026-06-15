import "server-only";

import type { PermissionCode } from "@/lib/permissions/permission-types";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";
import { wouldCreateAncestorCycle } from "@/lib/family/relationship-graph";
import { logRevision } from "@/lib/family/revision-service";
import {
  validateCoupleRelationshipInput,
  validateFamilyChildInput,
  validateFamilyInput,
  validateFamilyParentInput,
} from "@/lib/family/relationship-validation";
import type {
  AddFamilyChildInput,
  AddFamilyParentInput,
  CoupleRelationship,
  CreateCoupleRelationshipInput,
  CreateFamilyInput,
  Family,
  FamilyChild,
  FamilyParent,
  FamilyWithMembers,
  PersonRelationshipSummary,
  RelationshipList,
  RelationshipServiceResult,
  UpdateCoupleRelationshipInput,
} from "@/lib/family/relationship-types";

const FAMILY_SELECT = `
  id,
  family_code,
  family_label,
  visibility,
  notes,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const FAMILY_PARENT_SELECT = `
  id,
  family_id,
  person_id,
  parent_role,
  relationship_type,
  sort_order,
  notes,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason,
  person:people!family_parents_person_id_fkey(id, full_name, display_name)
`;

const FAMILY_CHILD_SELECT = `
  id,
  family_id,
  person_id,
  child_relationship_type,
  sort_order,
  notes,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason,
  person:people!family_children_person_id_fkey(id, full_name, display_name)
`;

const COUPLE_SELECT = `
  id,
  person1_id,
  person2_id,
  relationship_status,
  start_date,
  start_date_precision,
  end_date,
  end_date_precision,
  family_id,
  visibility,
  notes,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason,
  person1:people!couple_relationships_person1_id_fkey(id, full_name, display_name),
  person2:people!couple_relationships_person2_id_fkey(id, full_name, display_name)
`;

type RelationshipEntityName =
  | "families"
  | "family_parents"
  | "family_children"
  | "couple_relationships";

function errorResult<T>(
  error: string,
  reason?: string,
): RelationshipServiceResult<T> {
  return {
    ok: false,
    error,
    reason,
  };
}

async function requireRelationshipPermission(permission: PermissionCode) {
  const context = await getPermissionContext();

  if (!context.user) {
    return {
      ok: false as const,
      error:
        context.reason === "missing_supabase_config"
          ? "Chưa cấu hình Supabase."
          : "Bạn cần đăng nhập.",
      reason: context.reason ?? "anonymous",
      context,
    };
  }

  if (!context.permissions.includes(permission)) {
    return {
      ok: false as const,
      error: `Thiếu quyền ${permission}.`,
      reason: context.reason ?? `missing_${permission}`,
      context,
    };
  }

  return {
    ok: true as const,
    context,
  };
}

function activeFamily(family: Family, parents: FamilyParent[], children: FamilyChild[]) {
  return {
    ...family,
    parents: parents
      .filter((parent) => parent.family_id === family.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    children: children
      .filter((child) => child.family_id === family.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  };
}

async function getFamilyBundle(
  familyId: string,
): Promise<RelationshipServiceResult<FamilyWithMembers>> {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const [{ data: family, error: familyError }, parentsResult, childrenResult] =
    await Promise.all([
      supabase
        .from("families")
        .select(FAMILY_SELECT)
        .eq("id", familyId)
        .is("deleted_at", null)
        .maybeSingle<Family>(),
      supabase
        .from("family_parents")
        .select(FAMILY_PARENT_SELECT)
        .eq("family_id", familyId)
        .is("deleted_at", null)
        .returns<FamilyParent[]>(),
      supabase
        .from("family_children")
        .select(FAMILY_CHILD_SELECT)
        .eq("family_id", familyId)
        .is("deleted_at", null)
        .returns<FamilyChild[]>(),
    ]);

  if (familyError) {
    return errorResult(familyError.message, "family_get_failed");
  }

  if (!family) {
    return errorResult("Không tìm thấy family.", "family_not_found");
  }

  if (parentsResult.error || childrenResult.error) {
    return errorResult(
      parentsResult.error?.message ??
        childrenResult.error?.message ??
        "Không thể đọc thành viên family.",
      "family_members_get_failed",
    );
  }

  return {
    ok: true,
    data: activeFamily(
      family,
      parentsResult.data ?? [],
      childrenResult.data ?? [],
    ),
  };
}

async function getActiveEntity<T>(
  tableName: RelationshipEntityName,
  id: string,
  select: string,
): Promise<RelationshipServiceResult<T>> {
  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const { data, error } = await supabase
    .from(tableName)
    .select(select)
    .eq("id", id)
    .maybeSingle<T>();

  if (error) {
    return errorResult(error.message, `${tableName}_get_failed`);
  }

  if (!data) {
    return errorResult("Không tìm thấy quan hệ.", `${tableName}_not_found`);
  }

  return {
    ok: true,
    data,
  };
}

async function softDeleteEntity<T extends { id: string }>(params: {
  tableName: RelationshipEntityName;
  id: string;
  select: string;
  entityType: string;
  reason?: string | null;
}): Promise<RelationshipServiceResult<T>> {
  const permission = await requireRelationshipPermission("relationships.delete");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const existing = await getActiveEntity<T>(
    params.tableName,
    params.id,
    params.select,
  );

  if (!existing.ok) {
    return existing;
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from(params.tableName)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: profileId,
      delete_reason: params.reason ?? null,
      updated_by: profileId,
    })
    .eq("id", params.id)
    .select(params.select)
    .single<T>();

  if (error || !data) {
    return errorResult(error?.message ?? "Không thể xóa mềm.", "delete_failed");
  }

  await logRevision({
    entityType: params.entityType,
    entityId: data.id,
    action: "delete",
    before: existing.data,
    after: data,
    changedBy: profileId,
    reason: params.reason,
  });

  return {
    ok: true,
    data,
  };
}

export async function listRelationships(): Promise<
  RelationshipServiceResult<RelationshipList>
> {
  const permission = await requireRelationshipPermission("relationships.view");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const [familiesResult, parentsResult, childrenResult, couplesResult] =
    await Promise.all([
      supabase
        .from("families")
        .select(FAMILY_SELECT)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .returns<Family[]>(),
      supabase
        .from("family_parents")
        .select(FAMILY_PARENT_SELECT)
        .is("deleted_at", null)
        .returns<FamilyParent[]>(),
      supabase
        .from("family_children")
        .select(FAMILY_CHILD_SELECT)
        .is("deleted_at", null)
        .returns<FamilyChild[]>(),
      supabase
        .from("couple_relationships")
        .select(COUPLE_SELECT)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .returns<CoupleRelationship[]>(),
    ]);

  const firstError =
    familiesResult.error ??
    parentsResult.error ??
    childrenResult.error ??
    couplesResult.error;

  if (firstError) {
    return errorResult(firstError.message, "relationships_list_failed");
  }

  return {
    ok: true,
    data: {
      families: (familiesResult.data ?? []).map((family) =>
        activeFamily(family, parentsResult.data ?? [], childrenResult.data ?? []),
      ),
      couples: couplesResult.data ?? [],
    },
  };
}

export async function getPersonRelationshipSummary(
  personId: string,
): Promise<RelationshipServiceResult<PersonRelationshipSummary>> {
  const all = await listRelationships();

  if (!all.ok) {
    return all;
  }

  return {
    ok: true,
    data: {
      asParentInFamilies: all.data.families.filter((family) =>
        family.parents.some((parent) => parent.person_id === personId),
      ),
      asChildInFamilies: all.data.families.filter((family) =>
        family.children.some((child) => child.person_id === personId),
      ),
      couples: all.data.couples.filter(
        (couple) =>
          couple.person1_id === personId || couple.person2_id === personId,
      ),
    },
  };
}

export async function createFamily(
  input: CreateFamilyInput,
): Promise<RelationshipServiceResult<Family>> {
  const permission = await requireRelationshipPermission("relationships.create");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const validated = validateFamilyInput(input);

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from("families")
    .insert({
      ...validated.data,
      created_by: profileId,
      updated_by: profileId,
    })
    .select(FAMILY_SELECT)
    .single<Family>();

  if (error || !data) {
    return errorResult(error?.message ?? "Không thể tạo family.", "create_failed");
  }

  await logRevision({
    entityType: "families",
    entityId: data.id,
    action: "create",
    before: null,
    after: data,
    changedBy: profileId,
  });

  return {
    ok: true,
    data,
  };
}

export async function addParentToFamily(
  input: AddFamilyParentInput,
): Promise<RelationshipServiceResult<FamilyParent>> {
  const permission = await requireRelationshipPermission("relationships.create");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const validated = validateFamilyParentInput(input);

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const family = await getFamilyBundle(validated.data.family_id);

  if (!family.ok) {
    return errorResult(family.error, family.reason);
  }

  for (const child of family.data.children) {
    const cycle = await wouldCreateAncestorCycle({
      supabase: maybeCreateAdminSupabaseClient()!,
      parentId: validated.data.person_id,
      childId: child.person_id,
    });

    if (!cycle.ok) {
      return errorResult(cycle.error, "cycle_check_failed");
    }

    if (cycle.createsCycle) {
      return errorResult("Quan hệ này tạo vòng lặp tổ tiên.", "cycle_detected");
    }
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from("family_parents")
    .insert({
      ...validated.data,
      created_by: profileId,
      updated_by: profileId,
    })
    .select(FAMILY_PARENT_SELECT)
    .single<FamilyParent>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Không thể thêm cha/mẹ vào family.",
      "create_failed",
    );
  }

  await logRevision({
    entityType: "family_parents",
    entityId: data.id,
    action: "create",
    before: null,
    after: data,
    changedBy: profileId,
  });

  return {
    ok: true,
    data,
  };
}

export async function addChildToFamily(
  input: AddFamilyChildInput,
): Promise<RelationshipServiceResult<FamilyChild>> {
  const permission = await requireRelationshipPermission("relationships.create");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const validated = validateFamilyChildInput(input);

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const family = await getFamilyBundle(validated.data.family_id);

  if (!family.ok) {
    return errorResult(family.error, family.reason);
  }

  for (const parent of family.data.parents) {
    const supabase = maybeCreateAdminSupabaseClient();

    if (!supabase) {
      return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
    }

    const cycle = await wouldCreateAncestorCycle({
      supabase,
      parentId: parent.person_id,
      childId: validated.data.person_id,
    });

    if (!cycle.ok) {
      return errorResult(cycle.error, "cycle_check_failed");
    }

    if (cycle.createsCycle) {
      return errorResult("Quan hệ này tạo vòng lặp tổ tiên.", "cycle_detected");
    }
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from("family_children")
    .insert({
      ...validated.data,
      created_by: profileId,
      updated_by: profileId,
    })
    .select(FAMILY_CHILD_SELECT)
    .single<FamilyChild>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Không thể thêm con vào family.",
      "create_failed",
    );
  }

  await logRevision({
    entityType: "family_children",
    entityId: data.id,
    action: "create",
    before: null,
    after: data,
    changedBy: profileId,
  });

  return {
    ok: true,
    data,
  };
}

export async function createCoupleRelationship(
  input: CreateCoupleRelationshipInput,
): Promise<RelationshipServiceResult<CoupleRelationship>> {
  const permission = await requireRelationshipPermission("relationships.create");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const validated = validateCoupleRelationshipInput(input);

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from("couple_relationships")
    .insert({
      ...validated.data,
      created_by: profileId,
      updated_by: profileId,
    })
    .select(COUPLE_SELECT)
    .single<CoupleRelationship>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Không thể tạo quan hệ đôi.",
      "create_failed",
    );
  }

  await logRevision({
    entityType: "couple_relationships",
    entityId: data.id,
    action: "create",
    before: null,
    after: data,
    changedBy: profileId,
  });

  return {
    ok: true,
    data,
  };
}

export async function updateCoupleRelationship(
  input: UpdateCoupleRelationshipInput,
): Promise<RelationshipServiceResult<CoupleRelationship>> {
  const permission = await requireRelationshipPermission("relationships.update");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const existing = await getActiveEntity<CoupleRelationship>(
    "couple_relationships",
    input.id,
    COUPLE_SELECT,
  );

  if (!existing.ok) {
    return existing;
  }

  if (existing.data.deleted_at) {
    return errorResult(
      "Không thể sửa quan hệ đã xóa mềm.",
      "relationship_deleted",
    );
  }

  const validated = validateCoupleRelationshipInput({
    ...existing.data,
    ...input,
    person1_id: input.person1_id ?? existing.data.person1_id,
    person2_id: input.person2_id ?? existing.data.person2_id,
  });

  if (!validated.ok) {
    return errorResult(validated.errors.join(" "), "validation_failed");
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const profileId = permission.context.profile?.id ?? null;
  const { data, error } = await supabase
    .from("couple_relationships")
    .update({
      ...validated.data,
      updated_by: profileId,
    })
    .eq("id", input.id)
    .select(COUPLE_SELECT)
    .single<CoupleRelationship>();

  if (error || !data) {
    return errorResult(
      error?.message ?? "Không thể cập nhật quan hệ đôi.",
      "update_failed",
    );
  }

  await logRevision({
    entityType: "couple_relationships",
    entityId: data.id,
    action: "update",
    before: existing.data,
    after: data,
    changedBy: profileId,
    reason: input.delete_reason ?? null,
  });

  return {
    ok: true,
    data,
  };
}

export function softDeleteFamily(id: string, reason?: string | null) {
  return softDeleteEntity<Family>({
    tableName: "families",
    id,
    select: FAMILY_SELECT,
    entityType: "families",
    reason,
  });
}

export function softDeleteFamilyParent(id: string, reason?: string | null) {
  return softDeleteEntity<FamilyParent>({
    tableName: "family_parents",
    id,
    select: FAMILY_PARENT_SELECT,
    entityType: "family_parents",
    reason,
  });
}

export function softDeleteFamilyChild(id: string, reason?: string | null) {
  return softDeleteEntity<FamilyChild>({
    tableName: "family_children",
    id,
    select: FAMILY_CHILD_SELECT,
    entityType: "family_children",
    reason,
  });
}

export function softDeleteCoupleRelationship(
  id: string,
  reason?: string | null,
) {
  return softDeleteEntity<CoupleRelationship>({
    tableName: "couple_relationships",
    id,
    select: COUPLE_SELECT,
    entityType: "couple_relationships",
    reason,
  });
}

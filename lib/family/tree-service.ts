import "server-only";

import type { PermissionCode } from "@/lib/permissions/permission-types";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildFamilyTreeGraph } from "@/lib/family/tree-graph-builder";
import type { Person } from "@/lib/family/people-types";
import type {
  CoupleRelationship,
  Family,
  FamilyChild,
  FamilyParent,
  RelationshipServiceResult,
} from "@/lib/family/relationship-types";
import type { FamilyTreeGraph } from "@/lib/family/tree-types";

const PEOPLE_TREE_SELECT = `
  id,
  slug,
  full_name,
  display_name,
  gender,
  birth_date,
  birth_date_precision,
  death_date,
  death_date_precision,
  is_living,
  birth_place,
  home_town,
  branch_name,
  generation_number,
  short_bio,
  notes_private,
  visibility,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const FAMILY_TREE_SELECT = `
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

const FAMILY_PARENT_TREE_SELECT = `
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
  delete_reason
`;

const FAMILY_CHILD_TREE_SELECT = `
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
  delete_reason
`;

const COUPLE_TREE_SELECT = `
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
  delete_reason
`;

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

async function requireTreePermission(permission: PermissionCode) {
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

export async function getAdminFamilyTreeGraph(): Promise<
  RelationshipServiceResult<FamilyTreeGraph>
> {
  const permission = await requireTreePermission("tree.view");

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const [people, families, familyParents, familyChildren, couples] =
    await Promise.all([
      supabase
        .from("people")
        .select(PEOPLE_TREE_SELECT)
        .is("deleted_at", null)
        .returns<Person[]>(),
      supabase
        .from("families")
        .select(FAMILY_TREE_SELECT)
        .is("deleted_at", null)
        .returns<Family[]>(),
      supabase
        .from("family_parents")
        .select(FAMILY_PARENT_TREE_SELECT)
        .is("deleted_at", null)
        .returns<FamilyParent[]>(),
      supabase
        .from("family_children")
        .select(FAMILY_CHILD_TREE_SELECT)
        .is("deleted_at", null)
        .returns<FamilyChild[]>(),
      supabase
        .from("couple_relationships")
        .select(COUPLE_TREE_SELECT)
        .is("deleted_at", null)
        .returns<CoupleRelationship[]>(),
    ]);

  const firstError =
    people.error ??
    families.error ??
    familyParents.error ??
    familyChildren.error ??
    couples.error;

  if (firstError) {
    return errorResult(firstError.message, "tree_query_failed");
  }

  return {
    ok: true,
    data: buildFamilyTreeGraph(
      {
        people: people.data ?? [],
        families: families.data ?? [],
        familyParents: familyParents.data ?? [],
        familyChildren: familyChildren.data ?? [],
        coupleRelationships: couples.data ?? [],
      },
      { mode: "admin" },
    ),
  };
}

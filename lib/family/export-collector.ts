import "server-only";

import type { FamilyExportCollection, ExportBuildOptions } from "@/lib/family/export-types";
import type { Person } from "@/lib/family/people-types";
import type {
  CoupleRelationship,
  Family,
  FamilyChild,
  FamilyParent,
  RelationshipServiceResult,
} from "@/lib/family/relationship-types";
import type { TreeLayout, TreeLayoutNode } from "@/lib/family/tree-types";
import type { PermissionCode } from "@/lib/permissions/permission-types";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";

const PEOPLE_EXPORT_SELECT = `
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

const FAMILY_EXPORT_SELECT = `
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

const FAMILY_PARENT_EXPORT_SELECT = `
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

const FAMILY_CHILD_EXPORT_SELECT = `
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

const COUPLE_EXPORT_SELECT = `
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

const TREE_LAYOUT_EXPORT_SELECT = `
  id,
  layout_code,
  layout_name,
  layout_scope,
  is_default,
  description,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const TREE_LAYOUT_NODE_EXPORT_SELECT = `
  id,
  layout_id,
  node_id,
  node_kind,
  person_id,
  family_id,
  x,
  y,
  is_locked,
  is_collapsed,
  style_json,
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

function requiredPermission(options: ExportBuildOptions): PermissionCode {
  return options.action === "create" ? "exports.create" : "exports.download";
}

async function ensureExportPermission(options: ExportBuildOptions) {
  const context = await getPermissionContext();
  const permission = requiredPermission(options);

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

function activeOnly<T extends { deleted_at: string | null }>(
  rows: T[] | null,
  includeDeleted: boolean,
) {
  const safeRows = rows ?? [];

  if (includeDeleted) {
    return safeRows;
  }

  return safeRows.filter((row) => !row.deleted_at);
}

export async function collectFamilyExportData(
  options: ExportBuildOptions = {},
): Promise<RelationshipServiceResult<FamilyExportCollection>> {
  const permission = await ensureExportPermission(options);

  if (!permission.ok) {
    return errorResult(permission.error, permission.reason);
  }

  const supabase = maybeCreateAdminSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_admin_config");
  }

  const [
    people,
    families,
    familyParents,
    familyChildren,
    coupleRelationships,
    treeLayouts,
    treeLayoutNodes,
  ] = await Promise.all([
    supabase.from("people").select(PEOPLE_EXPORT_SELECT).returns<Person[]>(),
    supabase.from("families").select(FAMILY_EXPORT_SELECT).returns<Family[]>(),
    supabase
      .from("family_parents")
      .select(FAMILY_PARENT_EXPORT_SELECT)
      .returns<FamilyParent[]>(),
    supabase
      .from("family_children")
      .select(FAMILY_CHILD_EXPORT_SELECT)
      .returns<FamilyChild[]>(),
    supabase
      .from("couple_relationships")
      .select(COUPLE_EXPORT_SELECT)
      .returns<CoupleRelationship[]>(),
    supabase
      .from("tree_layouts")
      .select(TREE_LAYOUT_EXPORT_SELECT)
      .returns<TreeLayout[]>(),
    supabase
      .from("tree_layout_nodes")
      .select(TREE_LAYOUT_NODE_EXPORT_SELECT)
      .returns<TreeLayoutNode[]>(),
  ]);

  const firstError =
    people.error ??
    families.error ??
    familyParents.error ??
    familyChildren.error ??
    coupleRelationships.error ??
    treeLayouts.error ??
    treeLayoutNodes.error;

  if (firstError) {
    return errorResult(firstError.message, "export_collect_failed");
  }

  const includeDeleted = options.include_deleted ?? false;

  return {
    ok: true,
    data: {
      exported_by: permission.context.profile?.id ?? null,
      people: activeOnly(people.data, includeDeleted),
      families: activeOnly(families.data, includeDeleted),
      family_parents: activeOnly(familyParents.data, includeDeleted),
      family_children: activeOnly(familyChildren.data, includeDeleted),
      couple_relationships: activeOnly(coupleRelationships.data, includeDeleted),
      tree_layouts: activeOnly(treeLayouts.data, includeDeleted),
      tree_layout_nodes: activeOnly(treeLayoutNodes.data, includeDeleted),
    },
  };
}

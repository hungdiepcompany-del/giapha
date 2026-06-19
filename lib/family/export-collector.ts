import "server-only";

import type { FamilyExportCollection, ExportBuildOptions } from "@/lib/family/export-types";
import type {
  Clan,
  ClanBranch,
  GenerationRule,
  LineageVisibility,
  PersonBranchMembership,
} from "@/lib/family/lineage-types";
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
import { sanitizePersonForMode } from "@/lib/privacy/privacy-service";
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

const CLAN_EXPORT_SELECT = `
  id,
  clan_code,
  clan_name,
  family_name,
  origin_place,
  founder_person_id,
  current_head_person_id,
  description,
  visibility,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const CLAN_BRANCH_EXPORT_SELECT = `
  id,
  clan_id,
  parent_branch_id,
  branch_code,
  branch_name,
  branch_level,
  sort_order,
  founder_person_id,
  head_person_id,
  representative_person_id,
  description,
  visibility,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const GENERATION_RULE_EXPORT_SELECT = `
  id,
  clan_id,
  branch_id,
  root_person_id,
  start_generation,
  numbering_method,
  adopted_child_policy,
  step_child_policy,
  spouse_display_policy,
  notes,
  is_active,
  created_at,
  created_by,
  updated_at,
  updated_by,
  deleted_at,
  deleted_by,
  delete_reason
`;

const PERSON_BRANCH_MEMBERSHIP_EXPORT_SELECT = `
  id,
  person_id,
  clan_id,
  branch_id,
  generation_rule_id,
  generation_number,
  generation_override_reason,
  membership_type,
  is_primary,
  sort_order,
  source_note,
  visibility,
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

function canExportVisibility(
  visibility: LineageVisibility | "public" | "family" | "private",
  mode: ExportBuildOptions["privacy_mode"],
) {
  if (mode === "admin" || !mode) {
    return true;
  }

  if (mode === "family") {
    return visibility === "public" || visibility === "family";
  }

  return visibility === "public";
}

function yearPrecision(value: string | null) {
  return value ? ("year" as const) : null;
}

function sanitizePeople(
  people: Person[],
  mode: ExportBuildOptions["privacy_mode"],
) {
  if (mode === "admin" || !mode) {
    return people;
  }

  return people
    .map((person): Person | null => {
      const sanitized = sanitizePersonForMode(person, mode);

      if (!sanitized || !("label" in sanitized) || !("birth_year" in sanitized)) {
        return null;
      }

      return {
        ...person,
        full_name: sanitized.full_name ?? sanitized.label,
        display_name: sanitized.display_name,
        gender: null,
        birth_date: sanitized.birth_year,
        birth_date_precision: yearPrecision(sanitized.birth_year),
        death_date: sanitized.death_year,
        death_date_precision: yearPrecision(sanitized.death_year),
        is_living: sanitized.is_living,
        birth_place: "birth_place" in sanitized ? sanitized.birth_place : null,
        home_town: "home_town" in sanitized ? sanitized.home_town : null,
        branch_name: sanitized.branch_name,
        generation_number: sanitized.generation_number,
        short_bio: null,
        notes_private: null,
        visibility: sanitized.visibility,
        created_by: null,
        updated_by: null,
        deleted_at: null,
        deleted_by: null,
        delete_reason: null,
      };
    })
    .filter((person): person is Person => Boolean(person));
}

function stripRelationshipPrivateFields<
  T extends {
    notes?: string | null;
    created_by?: string | null;
    updated_by?: string | null;
    deleted_at?: string | null;
    deleted_by?: string | null;
    delete_reason?: string | null;
  },
>(row: T, mode: ExportBuildOptions["privacy_mode"]): T {
  if (mode === "admin" || !mode) {
    return row;
  }

  return {
    ...row,
    notes: null,
    created_by: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    delete_reason: null,
  };
}

function sanitizeFamilies(
  families: Family[],
  mode: ExportBuildOptions["privacy_mode"],
) {
  return families
    .filter((family) => canExportVisibility(family.visibility, mode))
    .map((family) => stripRelationshipPrivateFields(family, mode));
}

function sanitizeFamilyLinks<T extends FamilyParent | FamilyChild>(
  rows: T[],
  familyIds: Set<string>,
  personIds: Set<string>,
  mode: ExportBuildOptions["privacy_mode"],
) {
  return rows
    .filter((row) => familyIds.has(row.family_id) && personIds.has(row.person_id))
    .map((row) => stripRelationshipPrivateFields(row, mode));
}

function sanitizeCouples(
  rows: CoupleRelationship[],
  personIds: Set<string>,
  mode: ExportBuildOptions["privacy_mode"],
) {
  return rows
    .filter(
      (row) =>
        canExportVisibility(row.visibility, mode) &&
        personIds.has(row.person1_id) &&
        personIds.has(row.person2_id),
    )
    .map((row) => stripRelationshipPrivateFields(row, mode));
}

function stripLineagePrivateFields<
  T extends {
    description?: string | null;
    notes?: string | null;
    generation_override_reason?: string | null;
    source_note?: string | null;
    created_by?: string | null;
    updated_by?: string | null;
    deleted_at?: string | null;
    deleted_by?: string | null;
    delete_reason?: string | null;
  },
>(row: T, mode: ExportBuildOptions["privacy_mode"]): T {
  if (mode === "admin" || !mode) {
    return row;
  }

  return {
    ...row,
    description: null,
    notes: null,
    generation_override_reason: null,
    source_note: null,
    created_by: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    delete_reason: null,
  };
}

function sanitizeLineage(
  input: {
    clans: Clan[];
    branches: ClanBranch[];
    generationRules: GenerationRule[];
    memberships: PersonBranchMembership[];
  },
  personIds: Set<string>,
  mode: ExportBuildOptions["privacy_mode"],
) {
  const clans = input.clans
    .filter((clan) => canExportVisibility(clan.visibility, mode))
    .map((clan) => stripLineagePrivateFields(clan, mode));
  const clanIds = new Set(clans.map((clan) => clan.id));
  const branches = input.branches
    .filter(
      (branch) =>
        clanIds.has(branch.clan_id) && canExportVisibility(branch.visibility, mode),
    )
    .map((branch) => stripLineagePrivateFields(branch, mode));
  const branchIds = new Set(branches.map((branch) => branch.id));
  const generationRules = input.generationRules
    .filter(
      (rule) =>
        clanIds.has(rule.clan_id) &&
        (!rule.branch_id || branchIds.has(rule.branch_id)),
    )
    .map((rule) => stripLineagePrivateFields(rule, mode));
  const generationRuleIds = new Set(generationRules.map((rule) => rule.id));
  const memberships = input.memberships
    .filter(
      (membership) =>
        personIds.has(membership.person_id) &&
        clanIds.has(membership.clan_id) &&
        (!membership.branch_id || branchIds.has(membership.branch_id)) &&
        (!membership.generation_rule_id ||
          generationRuleIds.has(membership.generation_rule_id)) &&
        canExportVisibility(membership.visibility, mode),
    )
    .map((membership) => stripLineagePrivateFields(membership, mode));

  return { clans, branches, generationRules, memberships };
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
    clans,
    clanBranches,
    generationRules,
    personBranchMemberships,
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
    supabase.from("clans").select(CLAN_EXPORT_SELECT).returns<Clan[]>(),
    supabase
      .from("clan_branches")
      .select(CLAN_BRANCH_EXPORT_SELECT)
      .returns<ClanBranch[]>(),
    supabase
      .from("generation_rules")
      .select(GENERATION_RULE_EXPORT_SELECT)
      .returns<GenerationRule[]>(),
    supabase
      .from("person_branch_memberships")
      .select(PERSON_BRANCH_MEMBERSHIP_EXPORT_SELECT)
      .returns<PersonBranchMembership[]>(),
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
    clans.error ??
    clanBranches.error ??
    generationRules.error ??
    personBranchMemberships.error ??
    treeLayouts.error ??
    treeLayoutNodes.error;

  if (firstError) {
    return errorResult(firstError.message, "export_collect_failed");
  }

  const includeDeleted = options.include_deleted ?? false;
  const privacyMode = options.privacy_mode ?? "admin";
  const exportedPeople = sanitizePeople(activeOnly(people.data, includeDeleted), privacyMode);
  const exportedPersonIds = new Set(exportedPeople.map((person) => person.id));
  const exportedFamilies = sanitizeFamilies(
    activeOnly(families.data, includeDeleted),
    privacyMode,
  );
  const exportedFamilyIds = new Set(exportedFamilies.map((family) => family.id));
  const lineage = sanitizeLineage(
    {
      clans: activeOnly(clans.data, includeDeleted),
      branches: activeOnly(clanBranches.data, includeDeleted),
      generationRules: activeOnly(generationRules.data, includeDeleted),
      memberships: activeOnly(personBranchMemberships.data, includeDeleted),
    },
    exportedPersonIds,
    privacyMode,
  );

  return {
    ok: true,
    data: {
      exported_by: permission.context.profile?.id ?? null,
      people: exportedPeople,
      families: exportedFamilies,
      family_parents: sanitizeFamilyLinks(
        activeOnly(familyParents.data, includeDeleted),
        exportedFamilyIds,
        exportedPersonIds,
        privacyMode,
      ),
      family_children: sanitizeFamilyLinks(
        activeOnly(familyChildren.data, includeDeleted),
        exportedFamilyIds,
        exportedPersonIds,
        privacyMode,
      ),
      couple_relationships: sanitizeCouples(
        activeOnly(coupleRelationships.data, includeDeleted),
        exportedPersonIds,
        privacyMode,
      ),
      clans: lineage.clans,
      clan_branches: lineage.branches,
      generation_rules: lineage.generationRules,
      person_branch_memberships: lineage.memberships,
      tree_layouts:
        privacyMode === "admin" ? activeOnly(treeLayouts.data, includeDeleted) : [],
      tree_layout_nodes:
        privacyMode === "admin"
          ? activeOnly(treeLayoutNodes.data, includeDeleted)
          : [],
    },
  };
}

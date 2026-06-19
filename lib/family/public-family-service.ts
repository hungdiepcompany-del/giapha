import "server-only";

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
import {
  sanitizePersonForMode,
  sanitizeTreeGraphForMode,
} from "@/lib/privacy/privacy-service";
import type { PublicPerson } from "@/lib/privacy/privacy-types";
import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

const PEOPLE_PUBLIC_SELECT = `
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

const FAMILY_PUBLIC_SELECT = `
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

const FAMILY_PARENT_PUBLIC_SELECT = `
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

const FAMILY_CHILD_PUBLIC_SELECT = `
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

const COUPLE_PUBLIC_SELECT = `
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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function queryPublicInputs() {
  const supabase = await maybeCreateServerSupabaseClient();

  if (!supabase) {
    return errorResult<null>("Chưa cấu hình Supabase.", "missing_public_config");
  }

  const [people, families, familyParents, familyChildren, couples] =
    await Promise.all([
      supabase
        .from("people")
        .select(PEOPLE_PUBLIC_SELECT)
        .eq("visibility", "public")
        .is("deleted_at", null)
        .returns<Person[]>(),
      supabase
        .from("families")
        .select(FAMILY_PUBLIC_SELECT)
        .eq("visibility", "public")
        .is("deleted_at", null)
        .returns<Family[]>(),
      supabase
        .from("family_parents")
        .select(FAMILY_PARENT_PUBLIC_SELECT)
        .is("deleted_at", null)
        .returns<FamilyParent[]>(),
      supabase
        .from("family_children")
        .select(FAMILY_CHILD_PUBLIC_SELECT)
        .is("deleted_at", null)
        .returns<FamilyChild[]>(),
      supabase
        .from("couple_relationships")
        .select(COUPLE_PUBLIC_SELECT)
        .eq("visibility", "public")
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
    return errorResult<null>(firstError.message, "public_query_failed");
  }

  return {
    ok: true as const,
    data: {
      people: people.data ?? [],
      families: families.data ?? [],
      familyParents: familyParents.data ?? [],
      familyChildren: familyChildren.data ?? [],
      coupleRelationships: couples.data ?? [],
    },
  };
}

export async function getPublicFamilyTreeGraph(): Promise<
  RelationshipServiceResult<FamilyTreeGraph>
> {
  const input = await queryPublicInputs();

  if (!input.ok) {
    return errorResult(input.error, input.reason);
  }

  if (!input.data) {
    return errorResult("Không có dữ liệu công khai.", "public_query_empty");
  }

  const graph = buildFamilyTreeGraph(input.data, { mode: "public" });

  return {
    ok: true,
    data: sanitizeTreeGraphForMode(graph, "public"),
  };
}

export async function getPublicPersonProfile(
  slugOrId: string,
): Promise<RelationshipServiceResult<PublicPerson>> {
  const supabase = await maybeCreateServerSupabaseClient();

  if (!supabase) {
    return errorResult("Chưa cấu hình Supabase.", "missing_public_config");
  }

  let query = supabase
    .from("people")
    .select(PEOPLE_PUBLIC_SELECT)
    .eq("visibility", "public")
    .is("deleted_at", null);

  query = isUuid(slugOrId)
    ? query.eq("id", slugOrId)
    : query.eq("slug", slugOrId);

  const { data, error } = await query.maybeSingle<Person>();

  if (error) {
    return errorResult(error.message, "public_person_query_failed");
  }

  if (!data) {
    return errorResult("Không tìm thấy hồ sơ công khai.", "public_person_not_found");
  }

  const person = sanitizePersonForMode(data, "public");

  if (!person || "notes_private" in person) {
    return errorResult("Không tìm thấy hồ sơ công khai.", "public_person_hidden");
  }

  return {
    ok: true,
    data: person,
  };
}

export async function getPublicFamilyStats(): Promise<
  RelationshipServiceResult<{
    peopleCount: number;
    treeNodeCount: number;
    coupleCount: number;
  }>
> {
  const graph = await getPublicFamilyTreeGraph();

  if (!graph.ok) {
    return errorResult(graph.error, graph.reason);
  }

  return {
    ok: true,
    data: {
      peopleCount: graph.data.meta.personCount,
      treeNodeCount: graph.data.nodes.length,
      coupleCount: graph.data.meta.coupleCount,
    },
  };
}

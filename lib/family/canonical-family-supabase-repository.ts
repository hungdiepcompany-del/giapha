import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CanonicalFamilyLookupResult,
  CanonicalFamilyRecord,
  LegacyFamilyCandidate,
  NormalizedCanonicalParent,
} from "@/lib/family/canonical-family-types";
import type { CanonicalFamilyRepository } from "@/lib/family/canonical-family-repository";
import type {
  ParentRelationshipType,
  ParentRole,
} from "@/lib/family/relationship-types";

type FamilyCanonicalRow = {
  id: string;
  canonical_key: string | null;
  canonical_status:
    | "canonical"
    | "legacy_unreviewed"
    | "merged"
    | "voided"
    | "owner_review_required";
  merged_into_family_id: string | null;
  visibility?: "public" | "family" | "private";
  deleted_at: string | null;
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

function toCanonicalRecord(row: FamilyCanonicalRow): CanonicalFamilyRecord {
  return {
    id: row.id,
    canonicalKey: row.canonical_key ?? "",
    canonicalStatus: row.canonical_status,
    mergedIntoFamilyId: row.merged_into_family_id,
    visibility: row.visibility ?? "family",
    deletedAt: row.deleted_at,
  };
}

function sorted(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sameSet(left: string[], right: string[]) {
  const sortedLeft = sorted(left);
  const sortedRight = sorted(right);

  return (
    sortedLeft.length === sortedRight.length &&
    sortedLeft.every((value, index) => value === sortedRight[index])
  );
}

export function createSupabaseCanonicalFamilyRepository(
  supabase: SupabaseClient,
): CanonicalFamilyRepository {
  return {
    async findCanonicalByKey(key): Promise<CanonicalFamilyLookupResult> {
      const { data, error } = await supabase
        .from("families")
        .select(
          "id, canonical_key, canonical_status, merged_into_family_id, visibility, deleted_at",
        )
        .eq("canonical_key", key)
        .eq("canonical_status", "canonical")
        .is("deleted_at", null)
        .returns<FamilyCanonicalRow[]>();

      if (error) {
        throw new Error("canonical_family_lookup_failed");
      }

      const rows = data ?? [];
      if (rows.length === 0) return { status: "NOT_FOUND" };
      if (rows.length === 1) {
        return { status: "FOUND", family: toCanonicalRecord(rows[0]) };
      }

      return {
        status: "BLOCKED_INVARIANT_VIOLATION",
        code: "CANONICAL_FAMILY_MULTIPLE_ACTIVE_CANONICAL_MATCHES",
        candidates: rows.map(toCanonicalRecord),
      };
    },

    async findLegacyCandidatesByParentSet(
      parentIds,
    ): Promise<LegacyFamilyCandidate[]> {
      if (parentIds.length === 0) return [];

      const [{ data: parentRows, error: parentError }, { data: families, error: familyError }] =
        await Promise.all([
          supabase
            .from("family_parents")
            .select("family_id, person_id, parent_role, relationship_type")
            .is("deleted_at", null)
            .returns<ParentRow[]>(),
          supabase
            .from("families")
            .select(
              "id, canonical_key, canonical_status, merged_into_family_id, visibility, deleted_at",
            )
            .is("deleted_at", null)
            .neq("canonical_status", "canonical")
            .returns<FamilyCanonicalRow[]>(),
        ]);

      if (parentError || familyError) {
        throw new Error("legacy_family_lookup_failed");
      }

      const parentsByFamily = new Map<string, string[]>();
      for (const row of parentRows ?? []) {
        const current = parentsByFamily.get(row.family_id) ?? [];
        current.push(row.person_id);
        parentsByFamily.set(row.family_id, current);
      }

      const candidateFamilyIds = new Set(
        (families ?? [])
          .filter((family) => {
            return (
              family.canonical_status !== "merged" &&
              family.canonical_status !== "voided" &&
              sameSet(parentsByFamily.get(family.id) ?? [], parentIds)
            );
          })
          .map((family) => family.id),
      );

      if (candidateFamilyIds.size === 0) return [];

      const { data: childRows, error: childError } = await supabase
        .from("family_children")
        .select("family_id, person_id")
        .in("family_id", [...candidateFamilyIds])
        .is("deleted_at", null)
        .returns<ChildRow[]>();

      if (childError) {
        throw new Error("legacy_family_child_lookup_failed");
      }

      const childCountByFamily = new Map<string, number>();
      for (const row of childRows ?? []) {
        childCountByFamily.set(
          row.family_id,
          (childCountByFamily.get(row.family_id) ?? 0) + 1,
        );
      }

      return (families ?? [])
        .filter((family) => candidateFamilyIds.has(family.id))
        .map((family) => ({
          id: family.id,
          parentIds: sorted(parentsByFamily.get(family.id) ?? []),
          childCount: childCountByFamily.get(family.id) ?? 0,
          canonicalStatus: family.canonical_status,
          deletedAt: family.deleted_at,
        }));
    },

    async validatePeopleExist(personIds) {
      const uniqueIds = [...new Set(personIds.filter(Boolean))];
      if (uniqueIds.length === 0) {
        return { status: "VALID", missingPersonIds: [] };
      }

      const { data, error } = await supabase
        .from("people")
        .select("id")
        .in("id", uniqueIds)
        .is("deleted_at", null)
        .returns<{ id: string }[]>();

      if (error) {
        throw new Error("people_reference_lookup_failed");
      }

      const found = new Set((data ?? []).map((row) => row.id));
      const missing = uniqueIds.filter((id) => !found.has(id));

      return missing.length === 0
        ? { status: "VALID", missingPersonIds: [] }
        : { status: "MISSING_PERSON_REFERENCE", missingPersonIds: missing };
    },

    async readFamilyMemberships(familyId) {
      const [{ data: parents, error: parentError }, { data: children, error: childError }] =
        await Promise.all([
          supabase
            .from("family_parents")
            .select("family_id, person_id, parent_role, relationship_type")
            .eq("family_id", familyId)
            .is("deleted_at", null)
            .returns<ParentRow[]>(),
          supabase
            .from("family_children")
            .select("family_id, person_id")
            .eq("family_id", familyId)
            .is("deleted_at", null)
            .returns<ChildRow[]>(),
        ]);

      if (parentError || childError) {
        throw new Error("family_membership_lookup_failed");
      }

      return {
        familyId,
        parents: (parents ?? []).map((parent): NormalizedCanonicalParent => ({
          personId: parent.person_id,
          parentRole: parent.parent_role,
          relationshipType: parent.relationship_type,
        })),
        childIds: (children ?? []).map((child) => child.person_id),
      };
    },
  };
}

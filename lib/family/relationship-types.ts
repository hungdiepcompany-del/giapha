import type { Person } from "@/lib/family/people-types";

export const RELATIONSHIP_VISIBILITIES = ["public", "family", "private"] as const;
export const PARENT_ROLES = ["father", "mother", "parent", "unknown"] as const;
export const PARENT_RELATIONSHIP_TYPES = [
  "biological",
  "adoptive",
  "step",
  "guardian",
  "unknown",
] as const;
export const CHILD_RELATIONSHIP_TYPES = [
  "biological",
  "adoptive",
  "step",
  "foster",
  "unknown",
] as const;
export const COUPLE_RELATIONSHIP_STATUSES = [
  "married",
  "partner",
  "engaged",
  "divorced",
  "separated",
  "widowed",
  "unknown",
] as const;
export const RELATIONSHIP_DATE_PRECISIONS = [
  "exact",
  "year_month",
  "year",
  "approximate",
  "unknown",
] as const;

export type RelationshipVisibility = (typeof RELATIONSHIP_VISIBILITIES)[number];
export type ParentRole = (typeof PARENT_ROLES)[number];
export type ParentRelationshipType =
  (typeof PARENT_RELATIONSHIP_TYPES)[number];
export type ChildRelationshipType = (typeof CHILD_RELATIONSHIP_TYPES)[number];
export type CoupleRelationshipStatus =
  (typeof COUPLE_RELATIONSHIP_STATUSES)[number];
export type RelationshipDatePrecision =
  (typeof RELATIONSHIP_DATE_PRECISIONS)[number];

export type Family = {
  id: string;
  family_code: string | null;
  family_label: string | null;
  visibility: RelationshipVisibility;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
};

export type FamilyParent = {
  id: string;
  family_id: string;
  person_id: string;
  parent_role: ParentRole;
  relationship_type: ParentRelationshipType;
  sort_order: number;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
  person?: Pick<Person, "id" | "full_name" | "display_name"> | null;
};

export type FamilyChild = {
  id: string;
  family_id: string;
  person_id: string;
  child_relationship_type: ChildRelationshipType;
  sort_order: number;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
  person?: Pick<Person, "id" | "full_name" | "display_name"> | null;
};

export type CoupleRelationship = {
  id: string;
  person1_id: string;
  person2_id: string;
  relationship_status: CoupleRelationshipStatus;
  start_date: string | null;
  start_date_precision: RelationshipDatePrecision | null;
  end_date: string | null;
  end_date_precision: RelationshipDatePrecision | null;
  family_id: string | null;
  visibility: RelationshipVisibility;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
  person1?: Pick<Person, "id" | "full_name" | "display_name"> | null;
  person2?: Pick<Person, "id" | "full_name" | "display_name"> | null;
};

export type FamilyWithMembers = Family & {
  parents: FamilyParent[];
  children: FamilyChild[];
};

export type RelationshipList = {
  families: FamilyWithMembers[];
  couples: CoupleRelationship[];
};

export type PersonRelationshipSummary = {
  asParentInFamilies: FamilyWithMembers[];
  asChildInFamilies: FamilyWithMembers[];
  couples: CoupleRelationship[];
};

export type CreateFamilyInput = {
  family_code?: string | null;
  family_label?: string | null;
  visibility?: RelationshipVisibility;
  notes?: string | null;
};

export type AddFamilyParentInput = {
  family_id: string;
  person_id: string;
  parent_role?: ParentRole;
  relationship_type?: ParentRelationshipType;
  sort_order?: number;
  notes?: string | null;
};

export type AddFamilyChildInput = {
  family_id: string;
  person_id: string;
  child_relationship_type?: ChildRelationshipType;
  sort_order?: number;
  notes?: string | null;
};

export type CreateCoupleRelationshipInput = {
  person1_id: string;
  person2_id: string;
  relationship_status?: CoupleRelationshipStatus;
  start_date?: string | null;
  start_date_precision?: RelationshipDatePrecision | null;
  end_date?: string | null;
  end_date_precision?: RelationshipDatePrecision | null;
  family_id?: string | null;
  visibility?: RelationshipVisibility;
  notes?: string | null;
};

export type UpdateCoupleRelationshipInput =
  Partial<CreateCoupleRelationshipInput> & {
    id: string;
    delete_reason?: string | null;
  };

export type RelationshipServiceResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
      reason?: string;
    };

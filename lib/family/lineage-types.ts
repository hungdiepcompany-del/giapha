import type { PersonVisibility } from "@/lib/family/people-types";

export const LINEAGE_VISIBILITIES = ["public", "family", "private"] as const;
export const MEMBERSHIP_TYPES = [
  "bloodline",
  "spouse",
  "adopted",
  "step",
  "in_law",
  "unknown",
] as const;
export const GENERATION_NUMBERING_METHODS = [
  "root_is_one",
  "root_is_zero",
  "manual",
] as const;
export const GENERATION_CHILD_POLICIES = [
  "family_decision",
  "count_as_bloodline",
  "display_only",
  "exclude_from_generation",
] as const;
export const GENERATION_STEP_POLICIES = [
  "not_bloodline_by_default",
  "family_decision",
  "display_only",
  "exclude_from_generation",
] as const;
export const GENERATION_SPOUSE_POLICIES = [
  "spouse_of_generation",
  "same_generation_display",
  "hide_generation",
  "family_decision",
] as const;

export type LineageVisibility = (typeof LINEAGE_VISIBILITIES)[number];
export type MembershipType = (typeof MEMBERSHIP_TYPES)[number];
export type GenerationNumberingMethod =
  (typeof GENERATION_NUMBERING_METHODS)[number];
export type GenerationChildPolicy = (typeof GENERATION_CHILD_POLICIES)[number];
export type GenerationStepPolicy = (typeof GENERATION_STEP_POLICIES)[number];
export type GenerationSpousePolicy = (typeof GENERATION_SPOUSE_POLICIES)[number];

export type Clan = {
  id: string;
  clan_code: string;
  clan_name: string;
  family_name: string | null;
  origin_place: string | null;
  founder_person_id: string | null;
  current_head_person_id: string | null;
  description: string | null;
  visibility: LineageVisibility;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
};

export type ClanBranch = {
  id: string;
  clan_id: string;
  parent_branch_id: string | null;
  branch_code: string;
  branch_name: string;
  branch_level: number;
  sort_order: number;
  founder_person_id: string | null;
  head_person_id: string | null;
  representative_person_id: string | null;
  description: string | null;
  visibility: LineageVisibility;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
};

export type GenerationRule = {
  id: string;
  clan_id: string;
  branch_id: string | null;
  root_person_id: string | null;
  start_generation: number;
  numbering_method: GenerationNumberingMethod;
  adopted_child_policy: GenerationChildPolicy;
  step_child_policy: GenerationStepPolicy;
  spouse_display_policy: GenerationSpousePolicy;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
};

export type PersonBranchMembership = {
  id: string;
  person_id: string;
  clan_id: string;
  branch_id: string | null;
  generation_rule_id: string | null;
  generation_number: number | null;
  generation_override_reason: string | null;
  membership_type: MembershipType;
  is_primary: boolean;
  sort_order: number;
  source_note: string | null;
  visibility: LineageVisibility;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
};

export type LineageDashboard = {
  clans: Clan[];
  branches: ClanBranch[];
  generationRules: GenerationRule[];
  memberships: PersonBranchMembership[];
};

export type LineageServiceResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
      reason?: string;
    };

export type CreateClanInput = {
  clan_code: string;
  clan_name: string;
  family_name?: string | null;
  origin_place?: string | null;
  founder_person_id?: string | null;
  current_head_person_id?: string | null;
  description?: string | null;
  visibility?: PersonVisibility;
};

export type UpdateClanInput = Partial<CreateClanInput> & {
  id: string;
};

export type CreateClanBranchInput = {
  clan_id: string;
  parent_branch_id?: string | null;
  branch_code: string;
  branch_name: string;
  branch_level?: number;
  sort_order?: number;
  founder_person_id?: string | null;
  head_person_id?: string | null;
  representative_person_id?: string | null;
  description?: string | null;
  visibility?: PersonVisibility;
};

export type UpdateClanBranchInput = Partial<CreateClanBranchInput> & {
  id: string;
};

export type CreateGenerationRuleInput = {
  clan_id: string;
  branch_id?: string | null;
  root_person_id?: string | null;
  start_generation?: number;
  numbering_method?: GenerationNumberingMethod;
  adopted_child_policy?: GenerationChildPolicy;
  step_child_policy?: GenerationStepPolicy;
  spouse_display_policy?: GenerationSpousePolicy;
  notes?: string | null;
  is_active?: boolean;
};

export type UpdateGenerationRuleInput = Partial<CreateGenerationRuleInput> & {
  id: string;
};

export type CreatePersonBranchMembershipInput = {
  person_id: string;
  clan_id: string;
  branch_id?: string | null;
  generation_rule_id?: string | null;
  generation_number?: number | null;
  generation_override_reason?: string | null;
  membership_type?: MembershipType;
  is_primary?: boolean;
  sort_order?: number;
  source_note?: string | null;
  visibility?: PersonVisibility;
};

export type UpdatePersonBranchMembershipInput =
  Partial<CreatePersonBranchMembershipInput> & {
    id: string;
  };

export type PublicLineageMembership = {
  branch_name: string | null;
  clan_name: string | null;
  generation_number: number | null;
  membership_type: MembershipType;
};

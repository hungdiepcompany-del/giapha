import {
  GENERATION_CHILD_POLICIES,
  GENERATION_NUMBERING_METHODS,
  GENERATION_SPOUSE_POLICIES,
  GENERATION_STEP_POLICIES,
  LINEAGE_VISIBILITIES,
  MEMBERSHIP_TYPES,
  type CreateClanBranchInput,
  type CreateClanInput,
  type CreateGenerationRuleInput,
  type CreatePersonBranchMembershipInput,
  type GenerationChildPolicy,
  type GenerationNumberingMethod,
  type GenerationSpousePolicy,
  type GenerationStepPolicy,
  type LineageVisibility,
  type MembershipType,
} from "@/lib/family/lineage-types";

export type ValidationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      errors: string[];
    };

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function nullableText(value: FormDataEntryValue | null) {
  const normalized = text(value);
  return normalized || null;
}

function positiveInteger(value: FormDataEntryValue | null, fallback?: number) {
  const normalized = text(value);
  if (!normalized) return fallback;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanFromForm(value: FormDataEntryValue | null, fallback = false) {
  if (value === null) return fallback;
  return value === "on" || value === "true" || value === "1";
}

function enumValue<T extends readonly string[]>(
  value: FormDataEntryValue | null,
  allowed: T,
  fallback: T[number],
) {
  const normalized = text(value);
  return allowed.includes(normalized) ? normalized : fallback;
}

function validateRequired(value: string | null | undefined, label: string) {
  return value && value.trim() ? null : `${label} is required.`;
}

function validatePositive(value: number | null | undefined, label: string) {
  if (value === null || value === undefined) return null;
  return value >= 1 ? null : `${label} must be 1 or greater.`;
}

function result<T>(data: T, errors: Array<string | null>): ValidationResult<T> {
  const compact = errors.filter((error): error is string => Boolean(error));
  return compact.length > 0 ? { ok: false, errors: compact } : { ok: true, data };
}

export function formDataToClanInput(formData: FormData): CreateClanInput {
  return {
    clan_code: text(formData.get("clan_code")),
    clan_name: text(formData.get("clan_name")),
    family_name: nullableText(formData.get("family_name")),
    origin_place: nullableText(formData.get("origin_place")),
    founder_person_id: nullableText(formData.get("founder_person_id")),
    current_head_person_id: nullableText(formData.get("current_head_person_id")),
    description: nullableText(formData.get("description")),
    visibility: enumValue(
      formData.get("visibility"),
      LINEAGE_VISIBILITIES,
      "family",
    ) as LineageVisibility,
  };
}

export function validateClanInput(input: CreateClanInput) {
  return result(
    {
      ...input,
      clan_code: input.clan_code.trim(),
      clan_name: input.clan_name.trim(),
      visibility: input.visibility ?? "family",
    },
    [
      validateRequired(input.clan_code, "Clan code"),
      validateRequired(input.clan_name, "Clan name"),
    ],
  );
}

export function formDataToClanBranchInput(
  formData: FormData,
): CreateClanBranchInput {
  return {
    clan_id: text(formData.get("clan_id")),
    parent_branch_id: nullableText(formData.get("parent_branch_id")),
    branch_code: text(formData.get("branch_code")),
    branch_name: text(formData.get("branch_name")),
    branch_level: positiveInteger(formData.get("branch_level"), 1),
    sort_order: positiveInteger(formData.get("sort_order"), 0),
    founder_person_id: nullableText(formData.get("founder_person_id")),
    head_person_id: nullableText(formData.get("head_person_id")),
    representative_person_id: nullableText(formData.get("representative_person_id")),
    description: nullableText(formData.get("description")),
    visibility: enumValue(
      formData.get("visibility"),
      LINEAGE_VISIBILITIES,
      "family",
    ) as LineageVisibility,
  };
}

export function validateClanBranchInput(input: CreateClanBranchInput) {
  return result(
    {
      ...input,
      branch_code: input.branch_code.trim(),
      branch_name: input.branch_name.trim(),
      branch_level: input.branch_level ?? 1,
      sort_order: input.sort_order ?? 0,
      visibility: input.visibility ?? "family",
    },
    [
      validateRequired(input.clan_id, "Clan"),
      validateRequired(input.branch_code, "Branch code"),
      validateRequired(input.branch_name, "Branch name"),
      validatePositive(input.branch_level, "Branch level"),
    ],
  );
}

export function formDataToGenerationRuleInput(
  formData: FormData,
): CreateGenerationRuleInput {
  return {
    clan_id: text(formData.get("clan_id")),
    branch_id: nullableText(formData.get("branch_id")),
    root_person_id: nullableText(formData.get("root_person_id")),
    start_generation: positiveInteger(formData.get("start_generation"), 1),
    numbering_method: enumValue(
      formData.get("numbering_method"),
      GENERATION_NUMBERING_METHODS,
      "root_is_one",
    ) as GenerationNumberingMethod,
    adopted_child_policy: enumValue(
      formData.get("adopted_child_policy"),
      GENERATION_CHILD_POLICIES,
      "family_decision",
    ) as GenerationChildPolicy,
    step_child_policy: enumValue(
      formData.get("step_child_policy"),
      GENERATION_STEP_POLICIES,
      "not_bloodline_by_default",
    ) as GenerationStepPolicy,
    spouse_display_policy: enumValue(
      formData.get("spouse_display_policy"),
      GENERATION_SPOUSE_POLICIES,
      "spouse_of_generation",
    ) as GenerationSpousePolicy,
    notes: nullableText(formData.get("notes")),
    is_active: booleanFromForm(formData.get("is_active"), false),
  };
}

export function validateGenerationRuleInput(input: CreateGenerationRuleInput) {
  return result(
    {
      ...input,
      start_generation: input.start_generation ?? 1,
      numbering_method: input.numbering_method ?? "root_is_one",
      adopted_child_policy: input.adopted_child_policy ?? "family_decision",
      step_child_policy: input.step_child_policy ?? "not_bloodline_by_default",
      spouse_display_policy: input.spouse_display_policy ?? "spouse_of_generation",
      is_active: input.is_active ?? true,
    },
    [
      validateRequired(input.clan_id, "Clan"),
      validatePositive(input.start_generation, "Start generation"),
    ],
  );
}

export function formDataToPersonBranchMembershipInput(
  formData: FormData,
): CreatePersonBranchMembershipInput {
  return {
    person_id: text(formData.get("person_id")),
    clan_id: text(formData.get("clan_id")),
    branch_id: nullableText(formData.get("branch_id")),
    generation_rule_id: nullableText(formData.get("generation_rule_id")),
    generation_number:
      positiveInteger(formData.get("generation_number")) ?? null,
    generation_override_reason: nullableText(
      formData.get("generation_override_reason"),
    ),
    membership_type: enumValue(
      formData.get("membership_type"),
      MEMBERSHIP_TYPES,
      "bloodline",
    ) as MembershipType,
    is_primary: booleanFromForm(formData.get("is_primary"), false),
    sort_order: positiveInteger(formData.get("sort_order"), 0),
    source_note: nullableText(formData.get("source_note")),
    visibility: enumValue(
      formData.get("visibility"),
      LINEAGE_VISIBILITIES,
      "family",
    ) as LineageVisibility,
  };
}

export function validatePersonBranchMembershipInput(
  input: CreatePersonBranchMembershipInput,
) {
  return result(
    {
      ...input,
      generation_number: input.generation_number ?? null,
      membership_type: input.membership_type ?? "bloodline",
      is_primary: input.is_primary ?? true,
      sort_order: input.sort_order ?? 0,
      visibility: input.visibility ?? "family",
    },
    [
      validateRequired(input.person_id, "Person"),
      validateRequired(input.clan_id, "Clan"),
      validatePositive(input.generation_number, "Generation number"),
    ],
  );
}

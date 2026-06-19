import {
  CHILD_RELATIONSHIP_TYPES,
  COUPLE_RELATIONSHIP_STATUSES,
  PARENT_RELATIONSHIP_TYPES,
  PARENT_ROLES,
  RELATIONSHIP_DATE_PRECISIONS,
  RELATIONSHIP_VISIBILITIES,
  type AddFamilyChildInput,
  type AddFamilyParentInput,
  type ChildRelationshipType,
  type CoupleRelationshipStatus,
  type CreateCoupleRelationshipInput,
  type CreateFamilyInput,
  type ParentRelationshipType,
  type ParentRole,
  type RelationshipDatePrecision,
  type RelationshipVisibility,
} from "@/lib/family/relationship-types";
import type { ValidationResult } from "@/lib/family/people-validation";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeDate(value: unknown) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function normalizeInteger(value: unknown) {
  const text = normalizeText(value);

  if (!text) {
    return 0;
  }

  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isUuid(value: string | null | undefined) {
  return Boolean(value && uuidPattern.test(value));
}

function isAllowed<T extends readonly string[]>(
  value: string | null | undefined,
  allowed: T,
): value is T[number] | null | undefined {
  return value === null || value === undefined || allowed.includes(value);
}

export function formDataToFamilyInput(formData: FormData): CreateFamilyInput {
  const visibility = normalizeText(formData.get("visibility"));

  return {
    family_code: normalizeText(formData.get("family_code")),
    family_label: normalizeText(formData.get("family_label")),
    visibility: (visibility ?? "family") as RelationshipVisibility,
    notes: normalizeText(formData.get("notes")),
  };
}

export function formDataToFamilyParentInput(
  formData: FormData,
): AddFamilyParentInput {
  const parentRole = normalizeText(formData.get("parent_role"));
  const relationshipType = normalizeText(formData.get("relationship_type"));

  return {
    family_id: normalizeText(formData.get("family_id")) ?? "",
    person_id: normalizeText(formData.get("person_id")) ?? "",
    parent_role: (parentRole ?? "unknown") as ParentRole,
    relationship_type: (relationshipType ?? "unknown") as ParentRelationshipType,
    sort_order: normalizeInteger(formData.get("sort_order")),
    notes: normalizeText(formData.get("notes")),
  };
}

export function formDataToFamilyChildInput(
  formData: FormData,
): AddFamilyChildInput {
  const childRelationshipType = normalizeText(
    formData.get("child_relationship_type"),
  );

  return {
    family_id: normalizeText(formData.get("family_id")) ?? "",
    person_id: normalizeText(formData.get("person_id")) ?? "",
    child_relationship_type: (childRelationshipType ??
      "biological") as ChildRelationshipType,
    sort_order: normalizeInteger(formData.get("sort_order")),
    notes: normalizeText(formData.get("notes")),
  };
}

export function formDataToCoupleRelationshipInput(
  formData: FormData,
): CreateCoupleRelationshipInput {
  const relationshipStatus = normalizeText(
    formData.get("relationship_status"),
  );
  const startPrecision = normalizeText(formData.get("start_date_precision"));
  const endPrecision = normalizeText(formData.get("end_date_precision"));
  const visibility = normalizeText(formData.get("visibility"));

  return {
    person1_id: normalizeText(formData.get("person1_id")) ?? "",
    person2_id: normalizeText(formData.get("person2_id")) ?? "",
    relationship_status: (relationshipStatus ??
      "unknown") as CoupleRelationshipStatus,
    start_date: normalizeDate(formData.get("start_date")),
    start_date_precision: startPrecision as RelationshipDatePrecision | null,
    end_date: normalizeDate(formData.get("end_date")),
    end_date_precision: endPrecision as RelationshipDatePrecision | null,
    family_id: normalizeText(formData.get("family_id")),
    visibility: (visibility ?? "family") as RelationshipVisibility,
    notes: normalizeText(formData.get("notes")),
  };
}

export function validateFamilyInput(
  input: CreateFamilyInput,
): ValidationResult<CreateFamilyInput> {
  const errors: string[] = [];

  if (!isAllowed(input.visibility ?? "family", RELATIONSHIP_VISIBILITIES)) {
    errors.push("Phạm vi hiển thị quan hệ không hợp lệ.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      ...input,
      family_code: input.family_code?.trim() || null,
      family_label: input.family_label?.trim() || null,
      visibility: input.visibility ?? "family",
      notes: input.notes?.trim() || null,
    },
  };
}

export function validateFamilyParentInput(
  input: AddFamilyParentInput,
): ValidationResult<AddFamilyParentInput> {
  const errors: string[] = [];

  if (!isUuid(input.family_id)) {
    errors.push("ID gia đình không hợp lệ.");
  }

  if (!isUuid(input.person_id)) {
    errors.push("ID thành viên không hợp lệ.");
  }

  if (!isAllowed(input.parent_role ?? "unknown", PARENT_ROLES)) {
    errors.push("Vai trò cha/mẹ không hợp lệ.");
  }

  if (
    !isAllowed(input.relationship_type ?? "unknown", PARENT_RELATIONSHIP_TYPES)
  ) {
    errors.push("Loại quan hệ cha/mẹ không hợp lệ.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      ...input,
      parent_role: input.parent_role ?? "unknown",
      relationship_type: input.relationship_type ?? "unknown",
      sort_order: input.sort_order ?? 0,
      notes: input.notes?.trim() || null,
    },
  };
}

export function validateFamilyChildInput(
  input: AddFamilyChildInput,
): ValidationResult<AddFamilyChildInput> {
  const errors: string[] = [];

  if (!isUuid(input.family_id)) {
    errors.push("ID gia đình không hợp lệ.");
  }

  if (!isUuid(input.person_id)) {
    errors.push("ID thành viên không hợp lệ.");
  }

  if (
    !isAllowed(
      input.child_relationship_type ?? "biological",
      CHILD_RELATIONSHIP_TYPES,
    )
  ) {
    errors.push("Loại quan hệ con không hợp lệ.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      ...input,
      child_relationship_type: input.child_relationship_type ?? "biological",
      sort_order: input.sort_order ?? 0,
      notes: input.notes?.trim() || null,
    },
  };
}

export function validateCoupleRelationshipInput(
  input: CreateCoupleRelationshipInput,
): ValidationResult<CreateCoupleRelationshipInput> {
  const errors: string[] = [];

  if (!isUuid(input.person1_id)) {
    errors.push("ID thành viên 1 không hợp lệ.");
  }

  if (!isUuid(input.person2_id)) {
    errors.push("ID thành viên 2 không hợp lệ.");
  }

  if (input.person1_id && input.person1_id === input.person2_id) {
    errors.push("Không thể tạo quan hệ đôi với cùng một thành viên.");
  }

  if (input.family_id && !isUuid(input.family_id)) {
    errors.push("ID gia đình liên kết không hợp lệ.");
  }

  if (
    !isAllowed(
      input.relationship_status ?? "unknown",
      COUPLE_RELATIONSHIP_STATUSES,
    )
  ) {
    errors.push("Trạng thái quan hệ đôi không hợp lệ.");
  }

  if (!isAllowed(input.visibility ?? "family", RELATIONSHIP_VISIBILITIES)) {
    errors.push("Phạm vi hiển thị quan hệ không hợp lệ.");
  }

  if (
    !isAllowed(input.start_date_precision ?? null, RELATIONSHIP_DATE_PRECISIONS)
  ) {
    errors.push("Độ chính xác ngày bắt đầu không hợp lệ.");
  }

  if (!isAllowed(input.end_date_precision ?? null, RELATIONSHIP_DATE_PRECISIONS)) {
    errors.push("Độ chính xác ngày kết thúc không hợp lệ.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      ...input,
      relationship_status: input.relationship_status ?? "unknown",
      visibility: input.visibility ?? "family",
      family_id: input.family_id?.trim() || null,
      start_date: input.start_date ?? null,
      start_date_precision: input.start_date_precision ?? null,
      end_date: input.end_date ?? null,
      end_date_precision: input.end_date_precision ?? null,
      notes: input.notes?.trim() || null,
    },
  };
}

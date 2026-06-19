import {
  PERSON_DATE_PRECISIONS,
  PERSON_GENDERS,
  PERSON_VISIBILITIES,
  type CreatePersonInput,
  type PersonDatePrecision,
  type PersonGender,
  type PersonVisibility,
} from "@/lib/family/people-types";

export type ValidationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      errors: string[];
    };

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
    return null;
  }

  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function isAllowed<T extends readonly string[]>(
  value: string | null,
  allowed: T,
): value is T[number] | null {
  return value === null || allowed.includes(value);
}

function normalizeBoolean(value: unknown) {
  return value === "on" || value === "true" || value === true;
}

export function formDataToPersonInput(formData: FormData): CreatePersonInput {
  const gender = normalizeText(formData.get("gender"));
  const birthDatePrecision = normalizeText(formData.get("birth_date_precision"));
  const deathDatePrecision = normalizeText(formData.get("death_date_precision"));
  const visibility = normalizeText(formData.get("visibility"));

  return {
    full_name: normalizeText(formData.get("full_name")) ?? "",
    display_name: normalizeText(formData.get("display_name")),
    gender: gender as PersonGender | null,
    birth_date: normalizeDate(formData.get("birth_date")),
    birth_date_precision: birthDatePrecision as PersonDatePrecision | null,
    death_date: normalizeDate(formData.get("death_date")),
    death_date_precision: deathDatePrecision as PersonDatePrecision | null,
    is_living: normalizeBoolean(formData.get("is_living")),
    birth_place: normalizeText(formData.get("birth_place")),
    home_town: normalizeText(formData.get("home_town")),
    branch_name: normalizeText(formData.get("branch_name")),
    generation_number: normalizeInteger(formData.get("generation_number")),
    short_bio: normalizeText(formData.get("short_bio")),
    notes_private: normalizeText(formData.get("notes_private")),
    visibility: (visibility ?? "family") as PersonVisibility,
  };
}

export function validatePersonInput(
  input: CreatePersonInput,
): ValidationResult<CreatePersonInput> {
  const errors: string[] = [];
  const fullName = input.full_name.trim();

  if (!fullName) {
    errors.push("Họ tên là bắt buộc.");
  }

  if (!isAllowed(input.visibility ?? "family", PERSON_VISIBILITIES)) {
    errors.push("Phạm vi hiển thị không hợp lệ.");
  }

  if (!isAllowed(input.gender ?? null, PERSON_GENDERS)) {
    errors.push("Giới tính không hợp lệ.");
  }

  if (!isAllowed(input.birth_date_precision ?? null, PERSON_DATE_PRECISIONS)) {
    errors.push("Độ chính xác ngày sinh không hợp lệ.");
  }

  if (!isAllowed(input.death_date_precision ?? null, PERSON_DATE_PRECISIONS)) {
    errors.push("Độ chính xác ngày mất không hợp lệ.");
  }

  if (
    input.generation_number !== null &&
    input.generation_number !== undefined &&
    input.generation_number <= 0
  ) {
    errors.push("Đời thứ phải lớn hơn 0.");
  }

  if (input.is_living && input.death_date) {
    errors.push("Người còn sống không nên có ngày mất.");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    data: {
      ...input,
      full_name: fullName,
      visibility: input.visibility ?? "family",
      is_living: input.is_living ?? true,
    },
  };
}

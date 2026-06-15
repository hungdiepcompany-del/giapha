export const PERSON_GENDERS = ["male", "female", "other", "unknown"] as const;
export const PERSON_DATE_PRECISIONS = [
  "exact",
  "year_month",
  "year",
  "approximate",
  "unknown",
] as const;
export const PERSON_VISIBILITIES = ["public", "family", "private"] as const;

export type PersonGender = (typeof PERSON_GENDERS)[number];
export type PersonDatePrecision = (typeof PERSON_DATE_PRECISIONS)[number];
export type PersonVisibility = (typeof PERSON_VISIBILITIES)[number];

export type Person = {
  id: string;
  slug: string | null;
  full_name: string;
  display_name: string | null;
  gender: PersonGender | null;
  birth_date: string | null;
  birth_date_precision: PersonDatePrecision | null;
  death_date: string | null;
  death_date_precision: PersonDatePrecision | null;
  is_living: boolean;
  birth_place: string | null;
  home_town: string | null;
  branch_name: string | null;
  generation_number: number | null;
  short_bio: string | null;
  notes_private: string | null;
  visibility: PersonVisibility;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
};

export type CreatePersonInput = {
  full_name: string;
  display_name?: string | null;
  gender?: PersonGender | null;
  birth_date?: string | null;
  birth_date_precision?: PersonDatePrecision | null;
  death_date?: string | null;
  death_date_precision?: PersonDatePrecision | null;
  is_living?: boolean;
  birth_place?: string | null;
  home_town?: string | null;
  branch_name?: string | null;
  generation_number?: number | null;
  short_bio?: string | null;
  notes_private?: string | null;
  visibility?: PersonVisibility;
};

export type UpdatePersonInput = Partial<CreatePersonInput> & {
  id: string;
  delete_reason?: string | null;
};

export type PersonListFilter = {
  search?: string;
  visibility?: PersonVisibility | "all";
  isLiving?: "all" | "living" | "deceased";
  includeDeleted?: boolean;
};

export type PeopleServiceResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
      reason?: string;
    };


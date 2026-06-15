export type PrivacyLevel = "public" | "family" | "private";

export type LivingPrivacyRule = {
  livingStatus: "living" | "deceased" | "unknown";
  defaultPrivacyLevel: PrivacyLevel;
};

export type PrivacyMode = "public" | "family" | "admin";

export type PublicPerson = {
  id: string;
  slug: string | null;
  label: string;
  full_name: string | null;
  display_name: string | null;
  is_living: boolean;
  life_status: "living" | "deceased";
  generation_number: number | null;
  branch_name: string | null;
  birth_year: string | null;
  death_year: string | null;
  visibility: "public";
};

export type FamilyPerson = PublicPerson & {
  birth_place: string | null;
  home_town: string | null;
};

export type AdminPerson = {
  id: string;
  slug: string | null;
  full_name: string;
  display_name: string | null;
  gender: string | null;
  birth_date: string | null;
  birth_date_precision: string | null;
  death_date: string | null;
  death_date_precision: string | null;
  is_living: boolean;
  birth_place: string | null;
  home_town: string | null;
  branch_name: string | null;
  generation_number: number | null;
  short_bio: string | null;
  notes_private: string | null;
  visibility: PrivacyLevel;
};

export type PrivacyFilterOptions = {
  mode: PrivacyMode;
};

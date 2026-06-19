export const visibilityLabels: Record<string, string> = {
  family: "Family",
  private: "Private",
  public: "Public",
};

export const membershipTypeLabels: Record<string, string> = {
  adopted: "Adopted",
  bloodline: "Bloodline",
  in_law: "In-law",
  spouse: "Spouse",
  step: "Step",
  unknown: "Unknown",
};

export const numberingMethodLabels: Record<string, string> = {
  manual: "Manual",
  root_is_one: "Root is one",
  root_is_zero: "Root is zero",
};

export const childPolicyLabels: Record<string, string> = {
  count_as_bloodline: "Count as bloodline",
  display_only: "Display only",
  exclude_from_generation: "Exclude",
  family_decision: "Family decision",
};

export const stepPolicyLabels: Record<string, string> = {
  display_only: "Display only",
  exclude_from_generation: "Exclude",
  family_decision: "Family decision",
  not_bloodline_by_default: "Not bloodline by default",
};

export const spousePolicyLabels: Record<string, string> = {
  family_decision: "Family decision",
  hide_generation: "Hide generation",
  same_generation_display: "Same generation display",
  spouse_of_generation: "Spouse of generation",
};

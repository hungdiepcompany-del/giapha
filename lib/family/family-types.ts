export type PersonStableId = string;

export type PersonSummary = {
  id: string;
  stableId: PersonStableId;
  displayName: string;
  generation: number | null;
  branch: string | null;
};

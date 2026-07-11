import type { Person } from "@/lib/family/people-types";
import type {
  Clan,
  ClanBranch,
  PersonBranchMembership,
} from "@/lib/family/lineage-types";
import type {
  CoupleRelationship,
  Family,
  FamilyChild,
  FamilyParent,
} from "@/lib/family/relationship-types";

export type TreeViewMode = "admin" | "internal" | "public";
export type TreeNodeKind = "person" | "family";
export type TreeEdgeKind = "parent_child" | "couple" | "family_unit";

export type TreeBuildOptions = {
  mode: TreeViewMode;
};

export type TreePersonNode = {
  id: string;
  kind: "person";
  personId: string;
  fullName: string;
  displayName: string | null;
  birthYear: string | null;
  deathYear: string | null;
  isLiving: boolean;
  branchName: string | null;
  generationNumber: number | null;
  lineageClanName: string | null;
  lineageBranchName: string | null;
  lineageMembershipType: string | null;
  lineageVisibility: "public" | "family" | "private" | null;
  visibility: Person["visibility"];
  position: {
    x: number;
    y: number;
  };
};

export type TreeFamilyNode = {
  id: string;
  kind: "family";
  familyId: string;
  label: string;
  visibility: Family["visibility"];
  position: {
    x: number;
    y: number;
  };
};

export type TreeGraphNode = TreePersonNode | TreeFamilyNode;

export type TreeRelationshipEdge = {
  id: string;
  kind: TreeEdgeKind;
  source: string;
  target: string;
  label: string | null;
  sourceEntityId: string;
};

export type FamilyTreeGraph = {
  nodes: TreeGraphNode[];
  edges: TreeRelationshipEdge[];
  meta: {
    mode: TreeViewMode;
    personCount: number;
    familyCount: number;
    coupleCount: number;
  };
};

export type TreePersonInput = Pick<
  Person,
  | "id"
  | "full_name"
  | "display_name"
  | "is_living"
  | "branch_name"
  | "generation_number"
  | "visibility"
  | "deleted_at"
> & {
  birth_date?: string | null;
  death_date?: string | null;
};

export type TreeFamilyInput = Pick<
  Family,
  "id" | "family_code" | "family_label" | "visibility" | "deleted_at"
>;

export type TreeFamilyParentInput = Pick<
  FamilyParent,
  "id" | "family_id" | "person_id" | "parent_role" | "deleted_at"
>;

export type TreeFamilyChildInput = Pick<
  FamilyChild,
  "id" | "family_id" | "person_id" | "child_relationship_type" | "deleted_at"
>;

export type TreeCoupleRelationshipInput = Pick<
  CoupleRelationship,
  | "id"
  | "person1_id"
  | "person2_id"
  | "relationship_status"
  | "visibility"
  | "deleted_at"
>;

export type TreeBuilderInput = {
  people: TreePersonInput[];
  families: TreeFamilyInput[];
  familyParents: TreeFamilyParentInput[];
  familyChildren: TreeFamilyChildInput[];
  coupleRelationships: TreeCoupleRelationshipInput[];
  lineageMemberships?: PersonBranchMembership[];
  lineageClans?: Clan[];
  lineageBranches?: ClanBranch[];
};

export type TreeLayout = {
  id: string;
  layout_code: string | null;
  layout_name: string;
  layout_scope: "admin" | "family" | "public" | "custom";
  is_default: boolean;
  description: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
};

export type TreeLayoutNode = {
  id: string;
  layout_id: string;
  node_id: string;
  node_kind: TreeNodeKind;
  person_id: string | null;
  family_id: string | null;
  x: number;
  y: number;
  is_locked: boolean;
  is_collapsed: boolean;
  style_json: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
};

export type TreeNodePositionInput = {
  node_id: string;
  node_kind: TreeNodeKind;
  person_id?: string | null;
  family_id?: string | null;
  x: number;
  y: number;
};

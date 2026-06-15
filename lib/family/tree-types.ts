import type { Person } from "@/lib/family/people-types";
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

export type TreeBuilderInput = {
  people: Person[];
  families: Family[];
  familyParents: FamilyParent[];
  familyChildren: FamilyChild[];
  coupleRelationships: CoupleRelationship[];
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

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

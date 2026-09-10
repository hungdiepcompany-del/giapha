import type { FamilyTreeGraph } from "@/lib/family/tree-types";

export type TreePrintDensity = "compact" | "standard";
export type TreePrintSeverity = "INFO" | "WARNING" | "ERROR";
export type TreePrintPageFrame = "none" | "a3-landscape" | "a1-landscape" | "a0-landscape";

export type TreePrintPoint = {
  x: number;
  y: number;
};

export type TreePrintBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  padding: number;
};

export type TreePrintLayoutPoint = {
  x: number;
  y: number;
};

export type TreePrintLayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TreePrintPersonNode = {
  id: string;
  personId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  displayName: string;
  secondaryName?: string | null;
  generationLabel?: string | null;
  lifeYearsLabel?: string | null;
  livingStatus?: string | null;
  componentId: string;
  layoutGenerationIndex?: number | null;
  layoutGenerationAxisAnchor?: number | null;
};

export type TreePrintFamilyJunction = {
  id: string;
  familyId: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  componentId: string;
};

export type TreePrintRelationshipKind =
  | "couple"
  | "parent_to_family"
  | "family_to_child"
  | "other";

export type TreePrintEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipKind: TreePrintRelationshipKind;
  points: TreePrintPoint[];
};

export type TreePrintDiagnosticIssue = {
  id: string;
  severity: TreePrintSeverity;
  message: string;
  nodeIds?: string[];
  edgeId?: string;
};

export type TreePrintDiagnostics = {
  PERSON_COUNT: number;
  FAMILY_COUNT: number;
  EDGE_COUNT: number;
  CONNECTED_COMPONENT_COUNT: number;
  TREE_MIN_X: number;
  TREE_MIN_Y: number;
  TREE_MAX_X: number;
  TREE_MAX_Y: number;
  TREE_WIDTH: number;
  TREE_HEIGHT: number;
  NODE_OVERLAP_COUNT: number;
  EDGE_CARD_INTERSECTION_COUNT: number;
  MAX_HORIZONTAL_EDGE_SPAN: number;
  MAX_VERTICAL_EDGE_SPAN: number;
  OUT_OF_BOUNDS_NODE_COUNT: number;
  issues: TreePrintDiagnosticIssue[];
};

export type TreePrintDocument = {
  sourceMode: FamilyTreeGraph["meta"]["mode"];
  people: TreePrintPersonNode[];
  families: TreePrintFamilyJunction[];
  edges: TreePrintEdge[];
  bounds: TreePrintBounds;
  diagnostics: TreePrintDiagnostics;
};

export type TreePrintBuildOptions = {
  density?: TreePrintDensity;
  padding?: number;
};

export const TREE_PRINT_PERSON_WIDTH = 190;
export const TREE_PRINT_PERSON_HEIGHT_COMPACT = 92;
export const TREE_PRINT_PERSON_HEIGHT_STANDARD = 118;
export const TREE_PRINT_FAMILY_RADIUS = 12;
export const TREE_PRINT_DEFAULT_PADDING = 96;

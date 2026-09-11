import type {
  TreePrintDiagnosticIssue,
  TreePrintEdge,
  TreePrintRelationshipKind,
} from "@/lib/family/print/tree-print-types"

export type TreePrintEdgeVisualRole =
  | "parent-child"
  | "couple"
  | "family-junction"
  | "other"
  | "diagnostic-warning"
  | "diagnostic-error"

export type TreePrintEdgeVisualStyle = {
  stroke: string
  strokeWidth: number
  strokeDasharray?: string
  strokeLinecap: "round"
  strokeLinejoin: "round"
  opacity: number
  markerBehavior: "none"
}

export type TreePrintEdgeVisualDescriptor = {
  edgeId: string
  semanticType: TreePrintRelationshipKind
  visualRole: TreePrintEdgeVisualRole
  diagnosticOnly: boolean
  exportEligible: boolean
  previewEligible: boolean
  style: TreePrintEdgeVisualStyle
}

export type TreePrintEdgeStyleParityViolation = {
  edgeId: string
  diagnosticCode:
    | "A17P2P6R1_EDGE_STYLE_ORIENTATION_MISMATCH"
    | "A17P2P6R1_EDGE_SEMANTIC_TYPE_CHANGED_BY_ORIENTATION"
    | "A17P2P6R1_PRODUCTION_EDGE_COUNT_MISMATCH"
  landscapeStyle?: TreePrintEdgeVisualDescriptor
  portraitStyle?: TreePrintEdgeVisualDescriptor
}

export type TreePrintEdgeStyleParityResult = {
  valid: boolean
  violations: TreePrintEdgeStyleParityViolation[]
}

const SOLID_ROUND = {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  opacity: 1,
  markerBehavior: "none",
} as const

export const TREE_PRINT_EDGE_VISUAL_STYLES = {
  "parent-child": {
    ...SOLID_ROUND,
    stroke: "#245744",
    strokeWidth: 2.8,
  },
  "family-junction": {
    ...SOLID_ROUND,
    stroke: "#245744",
    strokeWidth: 2.8,
  },
  couple: {
    ...SOLID_ROUND,
    stroke: "#7c6f5f",
    strokeWidth: 2.2,
    strokeDasharray: "10 8",
  },
  other: {
    ...SOLID_ROUND,
    stroke: "#78716c",
    strokeWidth: 2,
    strokeDasharray: "6 6",
    opacity: 0.78,
  },
  "diagnostic-warning": {
    ...SOLID_ROUND,
    stroke: "#f59e0b",
    strokeWidth: 3.2,
    strokeDasharray: "8 6",
    opacity: 0.88,
  },
  "diagnostic-error": {
    ...SOLID_ROUND,
    stroke: "#dc2626",
    strokeWidth: 4,
    strokeDasharray: "10 5",
    opacity: 0.9,
  },
} as const satisfies Record<TreePrintEdgeVisualRole, TreePrintEdgeVisualStyle>

export function getTreePrintEdgeVisualRole(
  kind: TreePrintRelationshipKind,
): TreePrintEdgeVisualRole {
  if (kind === "couple") return "couple"
  if (kind === "parent_to_family") return "family-junction"
  if (kind === "family_to_child") return "parent-child"
  return "other"
}

export function getTreePrintSemanticEdgeVisual(
  edge: Pick<TreePrintEdge, "id" | "relationshipKind">,
): TreePrintEdgeVisualDescriptor {
  const visualRole = getTreePrintEdgeVisualRole(edge.relationshipKind)
  return {
    edgeId: edge.id,
    semanticType: edge.relationshipKind,
    visualRole,
    diagnosticOnly: false,
    exportEligible: true,
    previewEligible: true,
    style: cloneStyle(TREE_PRINT_EDGE_VISUAL_STYLES[visualRole]),
  }
}

export function getTreePrintDiagnosticEdgeVisual(
  edge: Pick<TreePrintEdge, "id" | "relationshipKind">,
  issue: Pick<TreePrintDiagnosticIssue, "severity">,
): TreePrintEdgeVisualDescriptor {
  const visualRole = issue.severity === "ERROR" ? "diagnostic-error" : "diagnostic-warning"
  return {
    edgeId: edge.id,
    semanticType: edge.relationshipKind,
    visualRole,
    diagnosticOnly: true,
    exportEligible: false,
    previewEligible: true,
    style: cloneStyle(TREE_PRINT_EDGE_VISUAL_STYLES[visualRole]),
  }
}

export function buildTreePrintSemanticEdgeVisuals(
  edges: Array<Pick<TreePrintEdge, "id" | "relationshipKind">>,
): TreePrintEdgeVisualDescriptor[] {
  return edges
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(getTreePrintSemanticEdgeVisual)
}

export function validateTreePrintOrientationEdgeStyleParity({
  landscapeEdges,
  portraitEdges,
}: {
  landscapeEdges: Array<Pick<TreePrintEdge, "id" | "relationshipKind">>
  portraitEdges: Array<Pick<TreePrintEdge, "id" | "relationshipKind">>
}): TreePrintEdgeStyleParityResult {
  const landscape = new Map(buildTreePrintSemanticEdgeVisuals(landscapeEdges).map((edge) => [edge.edgeId, edge]))
  const portrait = new Map(buildTreePrintSemanticEdgeVisuals(portraitEdges).map((edge) => [edge.edgeId, edge]))
  const edgeIds = new Set([...landscape.keys(), ...portrait.keys()])
  const violations: TreePrintEdgeStyleParityViolation[] = []

  for (const edgeId of [...edgeIds].sort()) {
    const landscapeStyle = landscape.get(edgeId)
    const portraitStyle = portrait.get(edgeId)

    if (!landscapeStyle || !portraitStyle) {
      violations.push({
        edgeId,
        diagnosticCode: "A17P2P6R1_PRODUCTION_EDGE_COUNT_MISMATCH",
        landscapeStyle,
        portraitStyle,
      })
      continue
    }

    if (landscapeStyle.semanticType !== portraitStyle.semanticType) {
      violations.push({
        edgeId,
        diagnosticCode: "A17P2P6R1_EDGE_SEMANTIC_TYPE_CHANGED_BY_ORIENTATION",
        landscapeStyle,
        portraitStyle,
      })
      continue
    }

    if (!sameVisualDescriptor(landscapeStyle, portraitStyle)) {
      violations.push({
        edgeId,
        diagnosticCode: "A17P2P6R1_EDGE_STYLE_ORIENTATION_MISMATCH",
        landscapeStyle,
        portraitStyle,
      })
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}

export function countTreePrintDiagnosticOnlyElements(svgText: string): number {
  const diagnosticOnlyMatches = svgText.match(/data-tree-print-diagnostic-only="true"/g) ?? []
  const diagnosticsMatches = svgText.match(/data-tree-print-diagnostics="true"/g) ?? []
  return diagnosticOnlyMatches.length + diagnosticsMatches.length
}

function sameVisualDescriptor(
  landscape: TreePrintEdgeVisualDescriptor,
  portrait: TreePrintEdgeVisualDescriptor,
): boolean {
  return (
    landscape.semanticType === portrait.semanticType &&
    landscape.visualRole === portrait.visualRole &&
    landscape.diagnosticOnly === portrait.diagnosticOnly &&
    landscape.exportEligible === portrait.exportEligible &&
    landscape.previewEligible === portrait.previewEligible &&
    sameStyle(landscape.style, portrait.style)
  )
}

function sameStyle(a: TreePrintEdgeVisualStyle, b: TreePrintEdgeVisualStyle): boolean {
  return (
    a.stroke === b.stroke &&
    a.strokeWidth === b.strokeWidth &&
    (a.strokeDasharray ?? "") === (b.strokeDasharray ?? "") &&
    a.strokeLinecap === b.strokeLinecap &&
    a.strokeLinejoin === b.strokeLinejoin &&
    a.opacity === b.opacity &&
    a.markerBehavior === b.markerBehavior
  )
}

function cloneStyle(style: TreePrintEdgeVisualStyle): TreePrintEdgeVisualStyle {
  return {
    ...style,
  }
}

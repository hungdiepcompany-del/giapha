import type { Edge } from "@xyflow/react";
import type { FamilyTreeReactNode } from "@/components/tree/family-node-card";
import type { FamilyTreeGraph, TreeRelationshipEdge } from "@/lib/family/tree-types";

export function treeEdgeToReactFlowEdge(
  edge: TreeRelationshipEdge,
  theme: "editor" | "viewer" = "editor"
): Edge {
  const isCouple = edge.kind === "couple";

  const editorStroke = isCouple ? "#64748b" : "#0f766e";
  const viewerStroke = isCouple ? "#7c6f5f" : "#245744";

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
    label: edge.label ?? undefined,
    type: "custom-edge",
    animated: false,
    style: {
      stroke: theme === "viewer" ? viewerStroke : editorStroke,
      strokeWidth: isCouple ? 1.5 : 2,
      strokeDasharray: isCouple ? "6 4" : undefined,
    },
  };
}

export function toReactFlowNodes(
  graph: FamilyTreeGraph,
  isDraggable: boolean = true
): FamilyTreeReactNode[] {
  return graph.nodes.map((node) => ({
    id: node.id,
    type: node.kind,
    position: node.position,
    data: node,
    draggable: isDraggable,
  }));
}

export function hasValidSavedPositions(graph: FamilyTreeGraph): boolean {
  if (graph.nodes.length === 0) {
    return true;
  }
  // If we have positions other than exact 0,0, they are saved.
  return graph.nodes.some(
    (node) => node.position.x !== 0 || node.position.y !== 0
  );
}

export function graphWithNodePositions(
  graph: FamilyTreeGraph,
  nodes: FamilyTreeReactNode[]
): FamilyTreeGraph {
  const positions = new Map(nodes.map((node) => [node.id, node.position]));

  return {
    ...graph,
    nodes: graph.nodes.map((node) => ({
      ...node,
      position: positions.get(node.id) ?? node.position,
    })),
  };
}

import ELK from "elkjs/lib/elk.bundled.js";

import type { FamilyTreeGraph, TreeGraphNode } from "@/lib/family/tree-types";

const PERSON_WIDTH = 220;
const PERSON_HEIGHT = 132;
const FAMILY_WIDTH = 120;
const FAMILY_HEIGHT = 56;

function sizeFor(node: TreeGraphNode) {
  return node.kind === "family"
    ? { width: FAMILY_WIDTH, height: FAMILY_HEIGHT }
    : { width: PERSON_WIDTH, height: PERSON_HEIGHT };
}

export async function layoutFamilyTreeGraph(
  graph: FamilyTreeGraph,
): Promise<FamilyTreeGraph> {
  if (graph.nodes.length === 0) {
    return graph;
  }

  const elk = new ELK();
  const elkGraph = {
    id: "family-tree",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "80",
      "elk.layered.spacing.nodeNodeBetweenLayers": "110",
      "elk.edgeRouting": "ORTHOGONAL",
    },
    children: graph.nodes.map((node) => ({
      id: node.id,
      ...sizeFor(node),
    })),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layouted = await elk.layout(elkGraph);
    const positions = new Map(
      (layouted.children ?? []).map((node) => [
        node.id,
        {
          x: node.x ?? 0,
          y: node.y ?? 0,
        },
      ]),
    );

    return {
      ...graph,
      nodes: graph.nodes.map((node) => ({
        ...node,
        position: positions.get(node.id) ?? node.position,
      })),
    };
  } catch {
    return graph;
  }
}

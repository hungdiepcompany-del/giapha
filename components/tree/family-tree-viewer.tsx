"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";

import { FamilyNodeCard, type FamilyTreeReactNode } from "@/components/tree/family-node-card";
import { FamilyTreeEmptyState } from "@/components/tree/family-tree-empty-state";
import { FamilyTreeToolbar } from "@/components/tree/family-tree-toolbar";
import { layoutFamilyTreeGraph } from "@/lib/family/tree-layout-elk";
import type { FamilyTreeGraph, TreeRelationshipEdge } from "@/lib/family/tree-types";

type FamilyTreeViewerProps = {
  graph: FamilyTreeGraph;
};

const nodeTypes = {
  person: FamilyNodeCard,
  family: FamilyNodeCard,
};

function edgeStyle(edge: TreeRelationshipEdge): Edge {
  const isCouple = edge.kind === "couple";

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label ?? undefined,
    type: isCouple ? "straight" : "smoothstep",
    animated: false,
    style: {
      stroke: isCouple ? "#64748b" : "#0f766e",
      strokeWidth: isCouple ? 1.5 : 2,
      strokeDasharray: isCouple ? "6 4" : undefined,
    },
  };
}

function toReactFlowNodes(graph: FamilyTreeGraph): FamilyTreeReactNode[] {
  return graph.nodes.map((node) => ({
    id: node.id,
    type: node.kind,
    position: node.position,
    data: node,
    draggable: false,
  }));
}

export function FamilyTreeViewer({ graph }: FamilyTreeViewerProps) {
  const [layoutedGraph, setLayoutedGraph] = useState(graph);
  const [isLayouting, setIsLayouting] = useState(false);
  const [flow, setFlow] =
    useState<ReactFlowInstance<Node, Edge> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  const fitCurrentView = useCallback(() => {
    window.requestAnimationFrame(() => {
      flow?.fitView({ padding: 0.2, duration: 400 });
    });
  }, [flow]);

  const applyLayout = useCallback(async () => {
    const nextGraph = await layoutFamilyTreeGraph(graph);
    setLayoutedGraph(nextGraph);
    fitCurrentView();
  }, [fitCurrentView, graph]);

  const resetLayout = useCallback(async () => {
    setIsLayouting(true);
    await applyLayout();
    setIsLayouting(false);
  }, [applyLayout]);

  useEffect(() => {
    let active = true;

    layoutFamilyTreeGraph(graph).then((nextGraph) => {
      if (!active) {
        return;
      }

      setLayoutedGraph(nextGraph);
      fitCurrentView();
    });

    return () => {
      active = false;
    };
  }, [fitCurrentView, graph]);

  const nodes = useMemo(() => toReactFlowNodes(layoutedGraph), [layoutedGraph]);
  const edges = useMemo(
    () => layoutedGraph.edges.map(edgeStyle),
    [layoutedGraph.edges],
  );

  const focusSearch = useCallback(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSearchStatus(null);
      flow?.fitView({ padding: 0.2, duration: 300 });
      return;
    }

    const match = layoutedGraph.nodes.find((node) => {
      if (node.kind !== "person") {
        return false;
      }

      return [node.fullName, node.displayName ?? ""].some((value) =>
        value.toLowerCase().includes(query),
      );
    });

    if (!match) {
      setSearchStatus("Không tìm thấy");
      return;
    }

    setSearchStatus(
      match.kind === "person" ? match.displayName || match.fullName : match.id,
    );
    flow?.setCenter(match.position.x + 110, match.position.y + 66, {
      zoom: 1.2,
      duration: 500,
    });
  }, [flow, layoutedGraph.nodes, searchQuery]);

  if (graph.nodes.length === 0) {
    return <FamilyTreeEmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-stone-200 bg-[#fffaf0] shadow-sm">
      <FamilyTreeToolbar
        searchQuery={searchQuery}
        searchStatus={isLayouting ? "Đang tự sắp xếp" : searchStatus}
        personCount={layoutedGraph.meta.personCount}
        nodeCount={layoutedGraph.nodes.length}
        onSearchChange={setSearchQuery}
        onFocusSearch={focusSearch}
        onFitView={() => flow?.fitView({ padding: 0.2, duration: 400 })}
        onResetLayout={resetLayout}
      />
      <div className="h-[680px] min-h-[520px] bg-[#f7efe1]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          onInit={setFlow}
        >
          <Background color="#d8c8ad" gap={24} />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable nodeStrokeWidth={3} />
        </ReactFlow>
      </div>
    </div>
  );
}

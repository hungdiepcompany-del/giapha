"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from "@xyflow/react";

import {
  FamilyNodeCard,
  type FamilyTreeReactNode,
} from "@/components/tree/family-node-card";
import { FamilyTreeEmptyState } from "@/components/tree/family-tree-empty-state";
import { TreeEditorSidePanel } from "@/components/tree/tree-editor-side-panel";
import { TreeEditorToolbar } from "@/components/tree/tree-editor-toolbar";
import { layoutFamilyTreeGraph } from "@/lib/family/tree-layout-elk";
import type {
  FamilyTreeGraph,
  TreeGraphNode,
  TreeRelationshipEdge,
} from "@/lib/family/tree-types";

type FamilyTreeEditorProps = {
  graph: FamilyTreeGraph;
  canCreateRelationships: boolean;
  canCreatePeople: boolean;
  saveLayoutAction: (formData: FormData) => void | Promise<void>;
  resetLayoutAction: (formData: FormData) => void | Promise<void>;
  addParentAction: (formData: FormData) => void | Promise<void>;
  addSpouseAction: (formData: FormData) => void | Promise<void>;
  addChildAction: (formData: FormData) => void | Promise<void>;
  createPersonAndAttachAction: (formData: FormData) => void | Promise<void>;
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
    draggable: true,
  }));
}

function toPositionInput(nodes: FamilyTreeReactNode[]) {
  return nodes.map((node) => ({
    node_id: node.id,
    node_kind: node.data.kind,
    person_id: node.data.kind === "person" ? node.data.personId : null,
    family_id: node.data.kind === "family" ? node.data.familyId : null,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
  }));
}

function graphWithNodePositions(
  graph: FamilyTreeGraph,
  nodes: FamilyTreeReactNode[],
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

export function FamilyTreeEditor({
  graph,
  canCreateRelationships,
  canCreatePeople,
  saveLayoutAction,
  resetLayoutAction,
  addParentAction,
  addSpouseAction,
  addChildAction,
  createPersonAndAttachAction,
}: FamilyTreeEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyTreeReactNode>(
    toReactFlowNodes(graph),
  );
  const [edges] = useEdgesState(graph.edges.map(edgeStyle));
  const [flow, setFlow] =
    useState<ReactFlowInstance<FamilyTreeReactNode, Edge> | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo<TreeGraphNode | null>(() => {
    return nodes.find((node) => node.id === selectedNodeId)?.data ?? null;
  }, [nodes, selectedNodeId]);
  const positionsJson = useMemo(() => {
    return JSON.stringify(toPositionInput(nodes));
  }, [nodes]);

  const fitCurrentView = useCallback(() => {
    window.requestAnimationFrame(() => {
      flow?.fitView({ padding: 0.2, duration: 400 });
    });
  }, [flow]);

  const autoLayout = useCallback(async () => {
    const nextGraph = await layoutFamilyTreeGraph(
      graphWithNodePositions(graph, nodes),
    );

    setNodes(toReactFlowNodes(nextGraph));
    fitCurrentView();
  }, [fitCurrentView, graph, nodes, setNodes]);

  useEffect(() => {
    let active = true;

    layoutFamilyTreeGraph(graph).then((nextGraph) => {
      if (!active) {
        return;
      }

      setNodes(toReactFlowNodes(nextGraph));
      fitCurrentView();
    });

    return () => {
      active = false;
    };
  }, [fitCurrentView, graph, setNodes]);

  const handleNodeClick: NodeMouseHandler<FamilyTreeReactNode> = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [],
  );

  if (graph.nodes.length === 0) {
    return <FamilyTreeEmptyState />;
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="min-w-0 overflow-hidden border border-slate-200 bg-white shadow-sm">
        <TreeEditorToolbar
          nodeCount={nodes.length}
          positionsJson={positionsJson}
          saveAction={saveLayoutAction}
          resetAction={resetLayoutAction}
          onFitView={() => flow?.fitView({ padding: 0.2, duration: 400 })}
          onZoomIn={() => flow?.zoomIn({ duration: 250 })}
          onZoomOut={() => flow?.zoomOut({ duration: 250 })}
          onAutoLayout={autoLayout}
        />
        <div className="h-[760px] min-h-[600px] bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={() => setSelectedNodeId(null)}
            onInit={setFlow}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
          >
            <Background color="#cbd5e1" gap={24} />
            <MiniMap pannable zoomable nodeStrokeWidth={3} />
          </ReactFlow>
        </div>
      </div>

      <TreeEditorSidePanel
        graph={graphWithNodePositions(graph, nodes)}
        selectedNode={selectedNode}
        canCreateRelationships={canCreateRelationships}
        canCreatePeople={canCreatePeople}
        addParentAction={addParentAction}
        addSpouseAction={addSpouseAction}
        addChildAction={addChildAction}
        createPersonAndAttachAction={createPersonAndAttachAction}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from "@xyflow/react";

import {
  FamilyNodeCard,
  type FamilyTreeReactNode,
} from "@/components/tree/family-node-card";
import { FamilyTreeEmptyState } from "@/components/tree/family-tree-empty-state";
import { FamilyTreeToolbar } from "@/components/tree/family-tree-toolbar";
import { layoutFamilyTreeGraph } from "@/lib/family/tree-layout-elk";
import type {
  FamilyTreeGraph,
  TreeGraphNode,
  TreePersonNode,
  TreeRelationshipEdge,
} from "@/lib/family/tree-types";

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
      stroke: isCouple ? "#7c6f5f" : "#245744",
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

function personName(person: TreePersonNode) {
  return person.displayName || person.fullName;
}

function yearRange(person: TreePersonNode) {
  if (!person.birthYear && !person.deathYear) {
    return "Chưa rõ năm sinh";
  }

  return `${person.birthYear ?? "Chưa rõ năm sinh"} - ${
    person.deathYear ?? (person.isLiving ? "nay" : "Chưa rõ năm mất")
  }`;
}

function SelectedPersonPreview({
  selectedNode,
  mode,
}: {
  selectedNode: TreeGraphNode | null;
  mode: FamilyTreeGraph["meta"]["mode"];
}) {
  if (!selectedNode || selectedNode.kind !== "person") {
    return (
      <div className="min-w-0 rounded-md border border-dashed border-stone-300 bg-[#fffaf0] p-4 text-sm leading-6 text-stone-700">
        <div className="break-words font-bold text-stone-950">Chọn một người trên cây</div>
        <p className="mt-1">
          Chọn một người trên cây để xem thông tin chính. Khung xem này không
          chỉnh sửa dữ liệu.
        </p>
      </div>
    );
  }

  const profileHref =
    mode === "public"
      ? `/people/${selectedNode.personId}`
      : `/admin/people/${selectedNode.personId}`;
  const branchLabel = selectedNode.lineageBranchName ?? selectedNode.branchName;

  return (
    <div className="min-w-0 rounded-md border border-stone-200 bg-[#fffaf0] p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-normal text-[#8a4b2a]">
        Đang chọn
      </div>
      <h2 className="mt-2 break-words text-lg font-bold text-stone-950">
        {personName(selectedNode)}
      </h2>
      {selectedNode.displayName ? (
        <p className="mt-1 break-words text-sm text-stone-500">{selectedNode.fullName}</p>
      ) : null}
      <dl className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-stone-900">Năm sinh / mất</dt>
          <dd>{yearRange(selectedNode)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-stone-900">Trạng thái</dt>
          <dd>{selectedNode.isLiving ? "Còn sống" : "Đã mất"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-stone-900">Đời</dt>
          <dd>{selectedNode.generationNumber ?? "Chưa rõ"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-stone-900">Chi/nhánh</dt>
          <dd>{branchLabel ?? "Chưa rõ"}</dd>
        </div>
      </dl>
      <Link
        href={profileHref}
        className="mt-4 inline-flex min-h-11 max-w-full items-center justify-center rounded-md border border-[#245744] bg-white px-3 py-2 text-center text-sm font-semibold text-[#245744] transition hover:bg-[#f6efe2]"
      >
        {mode === "public" ? "Xem hồ sơ công khai" : "Mở hồ sơ quản trị"}
      </Link>
    </div>
  );
}

export function FamilyTreeViewer({ graph }: FamilyTreeViewerProps) {
  const [layoutedGraph, setLayoutedGraph] = useState(graph);
  const [isLayouting, setIsLayouting] = useState(false);
  const [flow, setFlow] =
    useState<ReactFlowInstance<FamilyTreeReactNode, Edge> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo<TreeGraphNode | null>(() => {
    return layoutedGraph.nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [layoutedGraph.nodes, selectedNodeId]);

  const fitCurrentView = useCallback(() => {
    window.requestAnimationFrame(() => {
      flow?.fitView({ padding: 0.2, duration: 400 });
    });
  }, [flow]);

  const applyLayout = useCallback(async () => {
    const nextGraph = await layoutFamilyTreeGraph(graph);
    setLayoutedGraph(nextGraph);
    setSelectedNodeId(null);
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
      setSelectedNodeId(null);
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

    setSelectedNodeId(match.id);
    setSearchStatus(
      match.kind === "person" ? match.displayName || match.fullName : match.id,
    );
    flow?.setCenter(match.position.x + 124, match.position.y + 72, {
      zoom: 1.2,
      duration: 500,
    });
  }, [flow, layoutedGraph.nodes, searchQuery]);

  const handleNodeClick: NodeMouseHandler<FamilyTreeReactNode> = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [],
  );

  if (graph.nodes.length === 0) {
    return <FamilyTreeEmptyState mode={graph.meta.mode === "public" ? "public" : "admin"} />;
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
        onZoomIn={() => flow?.zoomIn({ duration: 250 })}
        onZoomOut={() => flow?.zoomOut({ duration: 250 })}
        onResetLayout={resetLayout}
      />
      <div className="grid gap-4 p-3 sm:p-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 overflow-hidden rounded-md border border-stone-200 bg-[#f7efe1]">
          <div className="h-[58vh] min-h-[420px] sm:h-[680px] sm:min-h-[520px]">
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
              onNodeClick={handleNodeClick}
              onPaneClick={() => setSelectedNodeId(null)}
              onInit={setFlow}
            >
              <Background color="#d8c8ad" gap={24} />
              <Controls showInteractive={false} />
              <MiniMap pannable zoomable nodeStrokeWidth={3} />
            </ReactFlow>
          </div>
        </div>
        <SelectedPersonPreview
          selectedNode={selectedNode}
          mode={layoutedGraph.meta.mode}
        />
      </div>
    </div>
  );
}

"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import type { TreeGraphNode } from "@/lib/family/tree-types";

export type FamilyTreeNodeData = TreeGraphNode;
export type FamilyTreeReactNode = Node<
  FamilyTreeNodeData,
  FamilyTreeNodeData["kind"]
>;

function PersonCard({
  data,
  selected,
}: {
  data: Extract<TreeGraphNode, { kind: "person" }>;
  selected: boolean;
}) {
  const dateRange =
    data.birthYear || data.deathYear
      ? `${data.birthYear ?? "Chưa rõ năm sinh"} - ${
          data.deathYear ?? (data.isLiving ? "nay" : "Chưa rõ năm mất")
        }`
      : "Chưa rõ năm sinh";
  const branchLabel = data.lineageBranchName ?? data.branchName;

  return (
    <div
      tabIndex={0}
      className={`w-[248px] max-w-[78vw] rounded-md border bg-[#fffaf0] px-4 py-3 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#245744] ${
        selected
          ? "border-[#245744] shadow-md ring-2 ring-emerald-100"
          : "border-stone-300 hover:border-[#8a4b2a] hover:shadow-md"
      }`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      {selected ? (
        <div className="mb-2 inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-900">
          Đang chọn
        </div>
      ) : null}
      <div className="min-w-0">
        <div className="truncate text-base font-bold text-stone-950" title={data.displayName || data.fullName}>
          {data.displayName || data.fullName}
        </div>
        {data.displayName ? (
          <div className="truncate text-xs text-stone-500" title={data.fullName}>{data.fullName}</div>
        ) : null}
      </div>
      <div className="mt-3 grid gap-1 text-xs text-stone-600">
        <div>{dateRange}</div>
        {data.generationNumber ? (
          <div>Đời thứ {data.generationNumber}</div>
        ) : null}
        {data.lineageClanName ? (
          <div className="truncate">Dòng họ: {data.lineageClanName}</div>
        ) : null}
        {branchLabel ? (
          <div className="truncate">Chi nhánh: {branchLabel}</div>
        ) : null}
      </div>
      <div className="mt-3 inline-flex rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-700">
        {data.isLiving ? "Còn sống" : "Đã mất"}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

function FamilyUnitCard({
  data,
}: {
  data: Extract<TreeGraphNode, { kind: "family" }>;
}) {
  return (
      <div className="w-[128px] max-w-[52vw] rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-center shadow-sm">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="truncate text-xs font-bold text-emerald-950">
        {data.label}
      </div>
      <div className="mt-1 text-[11px] font-semibold text-emerald-700">
        Gia đình
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

function FamilyNodeCardComponent({
  data,
  selected,
}: NodeProps<FamilyTreeReactNode>) {
  if (data.kind === "family") {
    return <FamilyUnitCard data={data} />;
  }

  return <PersonCard data={data} selected={selected} />;
}

export const FamilyNodeCard = memo(FamilyNodeCardComponent);

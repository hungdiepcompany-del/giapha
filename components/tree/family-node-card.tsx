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
  const initial = (data.displayName || data.fullName).trim().charAt(0) || "G";

  return (
    <div
      tabIndex={0}
      className={`w-[168px] max-w-[68vw] rounded-lg border bg-white px-3 py-2.5 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#245744] ${
        selected
          ? "border-[#245744] shadow-md ring-2 ring-[#245744]/25"
          : "border-stone-200 hover:border-[#245744]/50 hover:shadow-md"
      }`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      {selected ? (
        <div className="mb-2 inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-900">
          Đang chọn
        </div>
      ) : null}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#245744]/15 bg-emerald-50 text-sm font-black text-[#245744]">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm font-bold leading-5 text-stone-950" title={data.displayName || data.fullName}>
            {data.displayName || data.fullName}
          </div>
          {data.displayName ? (
            <div className="truncate text-xs text-stone-500" title={data.fullName}>{data.fullName}</div>
          ) : null}
        </div>
      </div>
      <div className="mt-2 grid gap-1 text-xs leading-5 text-stone-600">
        <div>{dateRange}</div>
        {data.generationNumber ? (
          <div className="font-semibold text-[#245744]">Đời thứ {data.generationNumber}</div>
        ) : null}
        {data.lineageClanName ? (
          <div className="truncate">Dòng họ: {data.lineageClanName}</div>
        ) : null}
        {branchLabel ? (
          <div className="truncate">Chi nhánh: {branchLabel}</div>
        ) : null}
      </div>
      <div className="mt-2 inline-flex rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-700">
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
      <div className="w-[108px] max-w-[50vw] rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-center shadow-sm">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="truncate text-xs font-bold text-sky-900">
        {data.label}
      </div>
      <div className="mt-1 text-[11px] font-semibold text-sky-700">
        Người liên quan
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

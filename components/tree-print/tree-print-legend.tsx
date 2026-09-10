"use client";

import { TREE_PRINT_EDGE_VISUAL_STYLES } from "@/lib/family/print/tree-print-edge-style";

export function TreePrintLegend() {
  const parentChild = TREE_PRINT_EDGE_VISUAL_STYLES["parent-child"];
  const couple = TREE_PRINT_EDGE_VISUAL_STYLES.couple;

  return (
    <div className="flex flex-wrap gap-3 border-t border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700">
      <span className="inline-flex items-center gap-2">
        <span
          className="h-0 w-8 border-t-2"
          style={{ borderTopColor: parentChild.stroke }}
        />
        Cha mẹ / con
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          className="h-0 w-8 border-t-2"
          style={{
            borderTopColor: couple.stroke,
            borderTopStyle: "dashed",
          }}
        />
        Quan hệ đôi
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          className="size-3 rounded-full border-2 bg-[#dfeee7]"
          style={{ borderColor: parentChild.stroke }}
        />
        Nút gia đình
      </span>
    </div>
  );
}

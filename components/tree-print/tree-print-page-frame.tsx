"use client";

import type { TreePrintBounds } from "@/lib/family/print/tree-print-model";
import type { TreePrintMarginMm, TreePrintPaperPreset } from "@/lib/family/print/tree-print-paper";
import type { TreePrintScaleSummary } from "@/lib/family/print/tree-print-scale";
import { formatPrintNumber } from "@/lib/family/print/tree-print-scale";

type TreePrintPageFrameProps = {
  bounds: TreePrintBounds;
  marginMm: TreePrintMarginMm;
  paper: TreePrintPaperPreset;
  scaleSummary: TreePrintScaleSummary;
};

export function TreePrintPageFrame({
  bounds,
  marginMm,
  paper,
  scaleSummary,
}: TreePrintPageFrameProps) {
  const width = scaleSummary.pageWidthLayoutUnits;
  const height = scaleSummary.pageHeightLayoutUnits;
  const margin = scaleSummary.marginLayoutUnits;
  const x = bounds.minX + (bounds.width - width) / 2;
  const y = bounds.minY + (bounds.height - height) / 2;
  const printableX = x + margin;
  const printableY = y + margin;

  return (
    <g aria-label={`Khung giấy ${paper.label}`}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#fffef8"
        opacity={0.52}
        stroke="#8a4b2a"
        strokeDasharray="18 12"
        strokeWidth={3}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={printableX}
        y={printableY}
        width={scaleSummary.printableWidthLayoutUnits}
        height={scaleSummary.printableHeightLayoutUnits}
        fill="none"
        stroke="#245744"
        strokeDasharray="10 8"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
      <text x={x + 18} y={y + 34} fill="#8a4b2a" fontSize={22} fontWeight={700}>
        {paper.size} {paper.orientation === "landscape" ? "ngang" : "dọc"}
      </text>
      <text x={x + 18} y={y + 62} fill="#245744" fontSize={16} fontWeight={700}>
        Lề {marginMm}mm - in {formatPrintNumber(scaleSummary.printScalePercent, 1)}%
      </text>
    </g>
  );
}

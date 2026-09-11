"use client";

import { forwardRef } from "react";

import { TreePrintPageFrame } from "@/components/tree-print/tree-print-page-frame";
import {
  getTreePrintDiagnosticEdgeVisual,
  getTreePrintSemanticEdgeVisual,
} from "@/lib/family/print/tree-print-edge-style";
import type {
  TreePrintBounds,
  TreePrintDensity,
  TreePrintDocument,
  TreePrintEdge,
} from "@/lib/family/print/tree-print-model";
import type { TreePrintMarginMm, TreePrintPaperPreset } from "@/lib/family/print/tree-print-paper";
import type { TreePrintScaleSummary } from "@/lib/family/print/tree-print-scale";

type TreePrintSvgProps = {
  document: TreePrintDocument;
  density: TreePrintDensity;
  showDiagnostics: boolean;
  showPageFrame?: boolean;
  paper?: TreePrintPaperPreset;
  marginMm?: TreePrintMarginMm;
  scaleSummary?: TreePrintScaleSummary;
  scale?: number;
  offset?: { x: number; y: number };
  contentOffset?: { x: number; y: number };
  viewBox?: Pick<TreePrintBounds, "minX" | "minY" | "width" | "height">;
  showDocumentBounds?: boolean;
  className?: string;
  width?: string;
  height?: string;
  ariaLabel?: string;
  svgIdPrefix?: string;
};

function truncateId(id: string) {
  return id.replace(/^person:|^family:/, "").slice(0, 8);
}

function edgePath(edge: TreePrintEdge) {
  const [first, ...rest] = edge.points;
  return `M ${first.x} ${first.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(" ")}`;
}

function splitText(value: string, maxChars: number, maxLines: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, maxLines);
}

export const TreePrintSvg = forwardRef<SVGSVGElement, TreePrintSvgProps>(function TreePrintSvg(
  {
    document,
    density,
    showDiagnostics,
    showPageFrame = false,
    paper,
    marginMm,
    scaleSummary,
    scale = 1,
    offset = { x: 0, y: 0 },
    contentOffset,
    viewBox,
    showDocumentBounds = true,
    className = "h-full w-full bg-[#f5eddf]",
    width,
    height,
    ariaLabel = "Bản xem trước vector toàn cây gia phả",
    svgIdPrefix = "tree-print",
  },
  ref,
) {
  const svgViewBox = viewBox ?? document.bounds;
  const gridId = `${svgIdPrefix}-grid`;
  const transformOffset = contentOffset ?? offset;
  const transform = contentOffset
    ? `translate(${transformOffset.x} ${transformOffset.y})`
    : `translate(${transformOffset.x} ${transformOffset.y}) scale(${scale})`;
  const diagnosticSeverityRank = {
    INFO: 0,
    WARNING: 1,
    ERROR: 2,
  } as const;
  const edgeIssueById = new Map(
    document.diagnostics.issues
      .filter((issue) => issue.edgeId)
      .sort((a, b) => {
        if (a.severity !== b.severity) {
          return diagnosticSeverityRank[a.severity] - diagnosticSeverityRank[b.severity];
        }
        return a.id.localeCompare(b.id);
      })
      .map((issue) => [issue.edgeId, issue] as const),
  );
  const overlaps = new Set(
    document.diagnostics.issues.flatMap((issue) => issue.nodeIds ?? []),
  );

  return (
    <svg
      ref={ref}
      className={className}
      role="img"
      aria-label={ariaLabel}
      viewBox={`${svgViewBox.minX} ${svgViewBox.minY} ${svgViewBox.width} ${svgViewBox.height}`}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      data-tree-print-vector-root="true"
    >
      <defs>
        <pattern id={gridId} width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#e4d7bf" strokeWidth="1" />
        </pattern>
      </defs>
      <rect
        x={svgViewBox.minX}
        y={svgViewBox.minY}
        width={svgViewBox.width}
        height={svgViewBox.height}
        fill={`url(#${gridId})`}
      />
      <g data-tree-print-primary-content="true" transform={transform}>
        {showDocumentBounds ? (
          <rect
            x={document.bounds.minX}
            y={document.bounds.minY}
            width={document.bounds.width}
            height={document.bounds.height}
            fill="#fffaf0"
            stroke="#d8c8ad"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {showPageFrame && paper && marginMm && scaleSummary ? (
          <TreePrintPageFrame
            bounds={document.bounds}
            marginMm={marginMm}
            paper={paper}
            scaleSummary={scaleSummary}
          />
        ) : null}

        <g aria-label="Các quan hệ">
          {document.edges.map((edge) => {
            const visual = getTreePrintSemanticEdgeVisual(edge);
            return (
              <path
                key={edge.id}
                data-tree-print-edge-id={edge.id}
                data-tree-print-edge-role={visual.visualRole}
                data-tree-print-edge-kind={visual.semanticType}
                data-tree-print-diagnostic-only="false"
                data-tree-print-export-eligible="true"
                d={edgePath(edge)}
                fill="none"
                stroke={visual.style.stroke}
                strokeDasharray={visual.style.strokeDasharray}
                strokeLinecap={visual.style.strokeLinecap}
                strokeLinejoin={visual.style.strokeLinejoin}
                strokeWidth={visual.style.strokeWidth}
                opacity={visual.style.opacity}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>

        {showDiagnostics ? (
          <g
            aria-label="Lớp chẩn đoán cạnh"
            data-tree-print-diagnostics="true"
            data-tree-print-diagnostic-layer="true"
            data-tree-print-export-exclude="true"
          >
            {document.edges.map((edge) => {
              const issue = edgeIssueById.get(edge.id);
              if (!issue) return null;
              const visual = getTreePrintDiagnosticEdgeVisual(edge, issue);

              return (
                <path
                  key={`diagnostic-edge-${edge.id}-${issue.id}`}
                  data-tree-print-diagnostic-only="true"
                  data-tree-print-diagnostic-issue-id={issue.id}
                  data-tree-print-edge-id={edge.id}
                  data-tree-print-edge-role={visual.visualRole}
                  d={edgePath(edge)}
                  fill="none"
                  stroke={visual.style.stroke}
                  strokeDasharray={visual.style.strokeDasharray}
                  strokeLinecap={visual.style.strokeLinecap}
                  strokeLinejoin={visual.style.strokeLinejoin}
                  strokeWidth={visual.style.strokeWidth}
                  opacity={visual.style.opacity}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </g>
        ) : null}

        <g aria-label="Nút gia đình">
          {document.families.map((family) => (
            <g key={family.id}>
              <circle
                cx={family.x}
                cy={family.y}
                r={family.radius}
                fill="#dfeee7"
                stroke="#245744"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
              {showDiagnostics ? (
                <text
                  data-tree-print-diagnostics="true"
                  x={family.x + 16}
                  y={family.y - 12}
                  fill="#8a4b2a"
                  fontSize={13}
                  fontWeight={700}
                >
                  {family.componentId}:{truncateId(family.id)}
                </text>
              ) : null}
            </g>
          ))}
        </g>

        <g aria-label="Thẻ người">
          {document.people.map((person) => {
            const nameLines = splitText(person.displayName, 22, 2);
            const secondaryLines = person.secondaryName ? splitText(person.secondaryName, 28, 1) : [];
            const highlight = showDiagnostics && overlaps.has(person.id);
            return (
              <g key={person.id}>
                <rect
                  x={person.x}
                  y={person.y}
                  width={person.width}
                  height={person.height}
                  rx={8}
                  fill="#ffffff"
                  stroke={highlight ? "#dc2626" : "#d8c8ad"}
                  strokeWidth={highlight ? 3 : 1.5}
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx={person.x + 24} cy={person.y + 26} r={13} fill="#e7f3ed" stroke="#245744" />
                <text x={person.x + 44} y={person.y + 24} fill="#1c1917" fontSize={14} fontWeight={800}>
                  {nameLines.map((line, index) => (
                    <tspan key={line} x={person.x + 44} dy={index === 0 ? 0 : 17}>
                      {line}
                    </tspan>
                  ))}
                </text>
                {secondaryLines.map((line) => (
                  <text key={line} x={person.x + 14} y={person.y + 58} fill="#57534e" fontSize={11}>
                    {line}
                  </text>
                ))}
                <text x={person.x + 14} y={person.y + (density === "compact" ? 70 : 78)} fill="#245744" fontSize={12} fontWeight={700}>
                  {person.generationLabel ?? "Đời chưa rõ"}
                </text>
                <text x={person.x + 14} y={person.y + (density === "compact" ? 86 : 96)} fill="#57534e" fontSize={12}>
                  {person.lifeYearsLabel ?? "Chưa rõ năm sinh"}
                </text>
                {density === "standard" && person.livingStatus ? (
                  <text x={person.x + 14} y={person.y + 112} fill="#78716c" fontSize={11} fontWeight={700}>
                    {person.livingStatus}
                  </text>
                ) : null}
                {showDiagnostics ? (
                  <g data-tree-print-diagnostics="true">
                    <rect
                      x={person.x}
                      y={person.y}
                      width={person.width}
                      height={person.height}
                      fill="none"
                      stroke={highlight ? "#dc2626" : "#0ea5e9"}
                      strokeDasharray={highlight ? "10 5" : "6 5"}
                      strokeWidth={highlight ? 2.4 : 1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                    <text x={person.x} y={person.y - 8} fill="#0369a1" fontSize={12} fontWeight={700}>
                      {person.componentId}:{truncateId(person.id)}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
});

"use client";

import type { TreePrintDiagnostics } from "@/lib/family/print/tree-print-model";
import type { TreePrintBranchScopeResult } from "@/lib/family/print/tree-print-branch-scope";
import { getTreePrintBranchScopeLabel } from "@/lib/family/print/tree-print-branch-scope";
import type { TreePrintExportEligibility } from "@/lib/family/print/tree-print-eligibility";
import type {
  TreePrintLargeFormatPlan,
  TreePrintProductionMode,
} from "@/lib/family/print/tree-print-large-format";
import {
  getTreePrintLargeFormatLayoutFlowLabel,
  getTreePrintLargeFormatOrientationLabel,
  getTreePrintLargeFormatResolvedOrientationLabel,
  getTreePrintProductionModeLabel,
} from "@/lib/family/print/tree-print-large-format";
import type { TreePrintMarginMm, TreePrintPaperPreset } from "@/lib/family/print/tree-print-paper";
import { getTreePrintOrientationLabel, getTreePrintPaperLabel } from "@/lib/family/print/tree-print-paper";
import type { TreePrintScaleSummary } from "@/lib/family/print/tree-print-scale";
import { formatPrintNumber } from "@/lib/family/print/tree-print-scale";

type TreePrintDiagnosticsPanelProps = {
  diagnostics: TreePrintDiagnostics;
  marginMm: TreePrintMarginMm;
  paper: TreePrintPaperPreset;
  printSummary: TreePrintScaleSummary;
  scale: number;
  productionMode: TreePrintProductionMode;
  largeFormatPlan?: TreePrintLargeFormatPlan | null;
  branchScope?: TreePrintBranchScopeResult | null;
  exportEligibility: TreePrintExportEligibility;
};

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white px-3 py-2">
      <dt className="text-xs font-bold uppercase tracking-normal text-stone-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-stone-950">{value}</dd>
    </div>
  );
}

export function TreePrintDiagnosticsPanel({
  diagnostics,
  marginMm,
  paper,
  printSummary,
  scale,
  productionMode,
  largeFormatPlan,
  branchScope,
  exportEligibility,
}: TreePrintDiagnosticsPanelProps) {
  const warningCount = diagnostics.issues.filter((issue) => issue.severity !== "INFO").length;
  const pageEstimate = printSummary.isReadable ? "1 trang" : "1 trang nhưng chữ quá nhỏ";

  return (
    <aside className="tree-print-diagnostics-panel min-w-0 border-l border-stone-200 bg-[#fffaf0] p-4 lg:sticky lg:top-0 lg:max-h-[calc(100vh-240px)] lg:w-[340px] lg:max-w-[340px] lg:overflow-y-auto">
      <h2 className="text-base font-bold text-stone-950">Tóm tắt bản in</h2>
      <dl className="mt-3 grid grid-cols-2 gap-2">
        <Metric label="Chế độ" value={getTreePrintProductionModeLabel(productionMode)} />
        {largeFormatPlan ? (
          <>
            <Metric label="Hướng yêu cầu" value={getTreePrintLargeFormatOrientationLabel(largeFormatPlan.requestedOrientation)} />
            <Metric label="Hướng thực tế" value={getTreePrintLargeFormatResolvedOrientationLabel(largeFormatPlan.resolvedOrientation)} />
            <Metric label="Bố trí thế hệ" value={getTreePrintLargeFormatLayoutFlowLabel(largeFormatPlan.layoutFlow)} />
            <Metric label="Finished size" value={`${formatPrintNumber(largeFormatPlan.finishedWidthMm, 0)} x ${formatPrintNumber(largeFormatPlan.finishedHeightMm, 0)} mm`} />
            <Metric label="Meters" value={`${formatPrintNumber(largeFormatPlan.finishedWidthMm / 1000, 2)} x ${formatPrintNumber(largeFormatPlan.finishedHeightMm / 1000, 2)} m`} />
            <Metric label="Export size" value={`${formatPrintNumber(largeFormatPlan.exportWidthMm, 0)} x ${formatPrintNumber(largeFormatPlan.exportHeightMm, 0)} mm`} />
            <Metric label="Safe area" value={`${formatPrintNumber(largeFormatPlan.printableWidthMm, 0)} x ${formatPrintNumber(largeFormatPlan.printableHeightMm, 0)} mm`} />
            <Metric label="Safe margin" value={`${largeFormatPlan.safeMarginMm} mm`} />
            <Metric label="Bleed" value={`${largeFormatPlan.bleedMm} mm`} />
            <Metric label="Roll usage" value={`${formatPrintNumber(largeFormatPlan.mediaWidthUsagePercent, 1)}%`} />
            <Metric label="Tree scale" value={`${formatPrintNumber(largeFormatPlan.treeScalePercent, 1)}%`} />
            <Metric label="Actual font" value={`${formatPrintNumber(largeFormatPlan.actualFontSizePt, 1)} pt`} />
            <Metric label="Actual card" value={`${formatPrintNumber(largeFormatPlan.actualCardWidthMm, 1)} x ${formatPrintNumber(largeFormatPlan.actualCardHeightMm, 1)} mm`} />
            <Metric label="People" value={largeFormatPlan.peopleCount} />
            <Metric label="Families" value={largeFormatPlan.familyCount} />
            <Metric label="Edges" value={largeFormatPlan.edgeCount} />
            <Metric label="Components" value={largeFormatPlan.connectedComponentCount} />
            <Metric label="Packed components" value={largeFormatPlan.packedComponentCount} />
            <Metric label="Packing efficiency" value={`${formatPrintNumber(largeFormatPlan.componentPackingEfficiency * 100, 1)}%`} />
            <Metric label="Whitespace" value={`${formatPrintNumber(largeFormatPlan.internalWhitespaceRatio * 100, 1)}%`} />
            <Metric label="Pages" value={largeFormatPlan.pageCount} />
            <Metric label="Vector tree" value={largeFormatPlan.vectorTree ? "YES" : "NO"} />
            <Metric label="Semantic couples" value={largeFormatPlan.layoutCandidateDiagnostics.SEMANTIC_COUPLE_RELATION_COUNT} />
            <Metric label="Couple generation mismatch" value={largeFormatPlan.layoutCandidateDiagnostics.COUPLE_GENERATION_MISMATCH_COUNT} />
            <Metric label="Couple axis mismatch" value={largeFormatPlan.layoutCandidateDiagnostics.COUPLE_LAYOUT_AXIS_MISMATCH_COUNT} />
            <Metric label="Post-pack couple mismatch" value={largeFormatPlan.layoutCandidateDiagnostics.COUPLE_POST_PACKING_AXIS_MISMATCH_COUNT} />
          </>
        ) : (
          <>
            <Metric label="Khổ giấy" value={getTreePrintPaperLabel(paper)} />
            <Metric label="Chiều giấy" value={getTreePrintOrientationLabel(paper.orientation)} />
            <Metric label="Kích thước giấy" value={`${paper.widthMm} x ${paper.heightMm} mm`} />
            <Metric label="Vùng in" value={`${formatPrintNumber(printSummary.printableWidthMm, 1)} x ${formatPrintNumber(printSummary.printableHeightMm, 1)} mm`} />
            <Metric label="Lề" value={`${marginMm} mm`} />
            <Metric label="Kích thước cây" value={`${formatPrintNumber(printSummary.contentWidthMm, 1)} x ${formatPrintNumber(printSummary.contentHeightMm, 1)} mm`} />
            <Metric label="Tỷ lệ in" value={`${formatPrintNumber(printSummary.printScalePercent, 1)}%`} />
            <Metric label="Cỡ chữ dự kiến" value={`${formatPrintNumber(printSummary.cardFontSizePt, 1)} pt`} />
            <Metric label="Kích thước thẻ dự kiến" value={`${formatPrintNumber(printSummary.cardWidthMm, 1)} x ${formatPrintNumber(printSummary.cardHeightMm, 1)} mm`} />
            <Metric label="Mức độ dễ đọc" value={printSummary.readabilityLabel} />
            <Metric label="Số trang dự kiến" value={pageEstimate} />
            <Metric
              label="Nội dung vượt vùng in"
              value={printSummary.overflowsWidth || printSummary.overflowsHeight ? "Có" : "Không"}
            />
          </>
        )}
      </dl>

      {largeFormatPlan ? (
        <>
          <h2 className="mt-5 text-base font-bold text-stone-950">Bàn giao nhà in</h2>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Scale" value="1:1" />
            <Metric label="Color model" value={largeFormatPlan.colorModel} />
            <Metric label="Font" value={largeFormatPlan.fontFamily} />
            <Metric label="Text outlined" value={largeFormatPlan.textOutlined} />
            <Metric label="SVG master" value="YES" />
            <Metric label="PDF" value="BROWSER_NATIVE_ATTEMPT" />
          </dl>
          <p className={`mt-3 rounded-md border p-3 text-sm font-semibold ${
            largeFormatPlan.readabilityLevel === "unreadable" || largeFormatPlan.readabilityLevel === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}>
            {largeFormatPlan.readabilityMessage}
          </p>
        </>
      ) : (
        <p className={`mt-3 rounded-md border p-3 text-sm font-semibold ${
          printSummary.isReadable
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-950"
        }`}>
          {printSummary.readabilityMessage}
        </p>
      )}

      {branchScope ? (
        <>
          <h2 className="mt-5 text-base font-bold text-stone-950">Chẩn đoán nhánh</h2>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Người bắt đầu" value={branchScope.rootPersonName ?? "Chưa chọn"} />
            <Metric label="Kiểu nhánh" value={getTreePrintBranchScopeLabel(branchScope.scopeType)} />
            <Metric label="Cụm" value={branchScope.componentIndex ? `${branchScope.componentIndex}/${branchScope.componentCount}` : "Chưa rõ"} />
            <Metric label="SCOPE_PERSON_COUNT" value={branchScope.diagnostics.SCOPE_PERSON_COUNT} />
            <Metric label="SCOPE_FAMILY_COUNT" value={branchScope.diagnostics.SCOPE_FAMILY_COUNT} />
            <Metric label="SCOPE_EDGE_COUNT" value={branchScope.diagnostics.SCOPE_EDGE_COUNT} />
            <Metric label="ROOT_PERSON_INCLUDED" value={branchScope.diagnostics.ROOT_PERSON_INCLUDED ? "YES" : "NO"} />
            <Metric label="DANGLING_EDGE_COUNT" value={branchScope.diagnostics.DANGLING_EDGE_COUNT} />
            <Metric label="TRAVERSAL_TERMINATES" value={branchScope.diagnostics.TRAVERSAL_TERMINATES ? "YES" : "NO"} />
          </dl>
        </>
      ) : null}

      {exportEligibility.svgBlockers.length || exportEligibility.pdfBlockers.length || exportEligibility.warnings.length ? (
        <div className="mt-4 grid gap-3 text-sm">
          {exportEligibility.svgBlockers.length ? (
            <IssueList title="SVG blockers" issues={exportEligibility.svgBlockers} tone="error" />
          ) : null}
          {exportEligibility.pdfBlockers.length ? (
            <IssueList title="PDF blockers" issues={exportEligibility.pdfBlockers} tone="error" />
          ) : null}
          {exportEligibility.warnings.length ? (
            <IssueList title="Warnings" issues={exportEligibility.warnings} tone="warning" />
          ) : null}
        </div>
      ) : null}

      <h2 className="mt-5 text-base font-bold text-stone-950">Chẩn đoán bố cục</h2>
      <dl className="mt-3 grid grid-cols-2 gap-2">
        <Metric label="Người" value={diagnostics.PERSON_COUNT} />
        <Metric label="Gia đình" value={diagnostics.FAMILY_COUNT} />
        <Metric label="Cạnh" value={diagnostics.EDGE_COUNT} />
        <Metric label="Cụm" value={diagnostics.CONNECTED_COMPONENT_COUNT} />
        <Metric label="Rộng" value={diagnostics.TREE_WIDTH} />
        <Metric label="Cao" value={diagnostics.TREE_HEIGHT} />
        <Metric label="VIEWPORT_ZOOM" value={`${Math.round(scale * 100)}%`} />
        <Metric label="Cảnh báo" value={warningCount} />
      </dl>

      <div className="mt-4 grid gap-2 text-sm">
        <div className="rounded-md border border-stone-200 bg-white p-3">
          <div className="font-semibold text-stone-900">Thẻ chồng nhau</div>
          <div className="text-stone-700">{diagnostics.NODE_OVERLAP_COUNT}</div>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-3">
          <div className="font-semibold text-stone-900">Cạnh cắt qua thẻ</div>
          <div className="text-stone-700">{diagnostics.EDGE_CARD_INTERSECTION_COUNT}</div>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-3">
          <div className="font-semibold text-stone-900">Nhịp cạnh lớn nhất</div>
          <div className="text-stone-700">
            {diagnostics.MAX_HORIZONTAL_EDGE_SPAN} x {diagnostics.MAX_VERTICAL_EDGE_SPAN}
          </div>
        </div>
      </div>

      {diagnostics.issues.length ? (
        <div className="mt-4 max-h-[280px] overflow-y-auto pr-1">
          <h3 className="text-sm font-bold text-stone-950">Danh sách cảnh báo</h3>
          <ul className="mt-2 grid gap-2 text-sm">
            {diagnostics.issues.slice(0, 30).map((issue) => (
              <li key={issue.id} className="rounded-md border border-amber-200 bg-white p-2 text-stone-700">
                <span className="font-bold text-[#8a4b2a]">{issue.severity}</span> {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
          Chưa phát hiện cảnh báo bố cục.
        </p>
      )}
    </aside>
  );
}

function IssueList({
  issues,
  title,
  tone,
}: {
  issues: { code: string; message: string }[];
  title: string;
  tone: "error" | "warning";
}) {
  const toneClass = tone === "error"
    ? "border-red-200 bg-white text-red-950"
    : "border-amber-200 bg-white text-amber-950";

  return (
    <div className={`rounded-md border p-3 ${toneClass}`}>
      <div className="font-bold">{title}</div>
      <ul className="mt-2 grid gap-1">
        {issues.slice(0, 8).map((issue) => (
          <li key={`${issue.code}-${issue.message}`}>
            <span className="font-semibold">{issue.code}</span>: {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

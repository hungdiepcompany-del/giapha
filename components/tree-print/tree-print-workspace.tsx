"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TreePrintDiagnosticsPanel } from "@/components/tree-print/tree-print-diagnostics-panel";
import { TreePrintLegend } from "@/components/tree-print/tree-print-legend";
import { TreePrintSvg } from "@/components/tree-print/tree-print-svg";
import { TreePrintToolbar } from "@/components/tree-print/tree-print-toolbar";
import {
  scopeTreePrintDocument,
  searchTreePrintPeople,
  type TreePrintBranchScopeType,
} from "@/lib/family/print/tree-print-branch-scope";
import { evaluateTreePrintExportEligibility, type TreePrintPdfCapability } from "@/lib/family/print/tree-print-eligibility";
import {
  createTreePrintLargeFormatPlan,
  normalizeTreePrintCustomBleed,
  normalizeTreePrintCustomLength,
  normalizeTreePrintCustomMediaWidth,
  normalizeTreePrintCustomSafeMargin,
  TREE_PRINT_DEFAULT_BLEED_PRESET,
  TREE_PRINT_DEFAULT_BRANCH_NO_UPSCALE,
  TREE_PRINT_DEFAULT_BRANCH_SIZING,
  TREE_PRINT_DEFAULT_BRANCH_TARGET_FONT_SIZE_PT,
  TREE_PRINT_DEFAULT_CUSTOM_BLEED_MM,
  TREE_PRINT_DEFAULT_CUSTOM_LENGTH_MM,
  TREE_PRINT_DEFAULT_CUSTOM_MEDIA_WIDTH_MM,
  TREE_PRINT_DEFAULT_CUSTOM_SAFE_MARGIN_MM,
  TREE_PRINT_DEFAULT_FULL_TREE_SIZING,
  TREE_PRINT_DEFAULT_LARGE_FORMAT_LENGTH_MODE,
  TREE_PRINT_DEFAULT_LARGE_FORMAT_ORIENTATION,
  TREE_PRINT_DEFAULT_MEDIA_WIDTH_PRESET,
  TREE_PRINT_DEFAULT_PRODUCTION_MODE,
  TREE_PRINT_DEFAULT_SAFE_MARGIN_PRESET,
  TREE_PRINT_DEFAULT_TARGET_FONT_SIZE_PT,
  type TreePrintLargeFormatBleedPreset,
  type TreePrintLargeFormatLengthMode,
  type TreePrintLargeFormatOrientation,
  type TreePrintLargeFormatSafeMarginPreset,
  type TreePrintLargeFormatSizingStrategy,
  type TreePrintLargeFormatTargetFontSizePt,
  type TreePrintMediaWidthPreset,
  type TreePrintProductionMode,
} from "@/lib/family/print/tree-print-large-format";
import { createTreePrintDocument } from "@/lib/family/print/tree-print-model";
import type { TreePrintDensity } from "@/lib/family/print/tree-print-model";
import {
  getTreePrintPaperPreset,
  normalizeTreePrintMargin,
  type TreePrintMarginMm,
  type TreePrintOrientation,
  type TreePrintPaperSize,
} from "@/lib/family/print/tree-print-paper";
import { calculateTreePrintPreviewScale } from "@/lib/family/print/tree-print-preview-scale";
import { buildTreePrintPageStyle } from "@/lib/family/print/tree-print-page-style";
import {
  calculateTreePrintScale,
  getTreePrintCardFontSizeLayoutUnits,
  normalizeManualScalePercent,
  TREE_PRINT_DEFAULT_MANUAL_SCALE_PERCENT,
  TREE_PRINT_DEFAULT_SCALE_MODE,
  type TreePrintScaleMode,
} from "@/lib/family/print/tree-print-scale";
import { downloadTreePrintSvg } from "@/lib/family/print/tree-print-svg-export";
import type {
  TreePrintViewMode,
  TreePrintViewportAction,
} from "@/lib/family/print/tree-print-toolbar-state";
import { nextTreePrintViewMode } from "@/lib/family/print/tree-print-toolbar-state";
import type { FamilyTreeGraph } from "@/lib/family/tree-types";

type TreePrintWorkspaceProps = {
  graph: FamilyTreeGraph;
};

function clampScale(value: number) {
  return Math.min(4, Math.max(0.005, value));
}

export function TreePrintWorkspace({ graph }: TreePrintWorkspaceProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const exportSvgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number; scrollLeft: number; scrollTop: number } | null>(null);
  const actionTimerRef = useRef<number | null>(null);
  const [density, setDensity] = useState<TreePrintDensity>("standard");
  const [productionMode, setProductionMode] = useState<TreePrintProductionMode>(TREE_PRINT_DEFAULT_PRODUCTION_MODE);
  const [paperSize, setPaperSize] = useState<TreePrintPaperSize>("A0");
  const [orientation, setOrientation] = useState<TreePrintOrientation>("landscape");
  const [marginMm, setMarginMm] = useState<TreePrintMarginMm>(10);
  const [mediaWidthPreset, setMediaWidthPreset] = useState<TreePrintMediaWidthPreset>(TREE_PRINT_DEFAULT_MEDIA_WIDTH_PRESET);
  const [customMediaWidthMm, setCustomMediaWidthMm] = useState(TREE_PRINT_DEFAULT_CUSTOM_MEDIA_WIDTH_MM);
  const [largeFormatOrientation, setLargeFormatOrientation] = useState<TreePrintLargeFormatOrientation>(TREE_PRINT_DEFAULT_LARGE_FORMAT_ORIENTATION);
  const [fullTreeSizingStrategy, setFullTreeSizingStrategy] = useState<TreePrintLargeFormatSizingStrategy>(TREE_PRINT_DEFAULT_FULL_TREE_SIZING);
  const [branchSizingStrategy, setBranchSizingStrategy] = useState<TreePrintLargeFormatSizingStrategy>(TREE_PRINT_DEFAULT_BRANCH_SIZING);
  const [lengthMode, setLengthMode] = useState<TreePrintLargeFormatLengthMode>(TREE_PRINT_DEFAULT_LARGE_FORMAT_LENGTH_MODE);
  const [customLengthMm, setCustomLengthMm] = useState(TREE_PRINT_DEFAULT_CUSTOM_LENGTH_MM);
  const [fullTreeTargetFontSizePt, setFullTreeTargetFontSizePt] = useState<TreePrintLargeFormatTargetFontSizePt>(TREE_PRINT_DEFAULT_TARGET_FONT_SIZE_PT);
  const [branchTargetFontSizePt, setBranchTargetFontSizePt] = useState<TreePrintLargeFormatTargetFontSizePt>(TREE_PRINT_DEFAULT_BRANCH_TARGET_FONT_SIZE_PT);
  const [branchNoUpscale, setBranchNoUpscale] = useState(TREE_PRINT_DEFAULT_BRANCH_NO_UPSCALE);
  const [safeMarginPreset, setSafeMarginPreset] = useState<TreePrintLargeFormatSafeMarginPreset>(TREE_PRINT_DEFAULT_SAFE_MARGIN_PRESET);
  const [customSafeMarginMm, setCustomSafeMarginMm] = useState(TREE_PRINT_DEFAULT_CUSTOM_SAFE_MARGIN_MM);
  const [bleedPreset, setBleedPreset] = useState<TreePrintLargeFormatBleedPreset>(TREE_PRINT_DEFAULT_BLEED_PRESET);
  const [customBleedMm, setCustomBleedMm] = useState(TREE_PRINT_DEFAULT_CUSTOM_BLEED_MM);
  const [branchScopeType, setBranchScopeType] = useState<TreePrintBranchScopeType>("DESCENDANTS");
  const [branchQuery, setBranchQuery] = useState("");
  const [selectedRootPersonId, setSelectedRootPersonId] = useState<string | null>(null);
  const [printScaleMode, setPrintScaleMode] = useState<TreePrintScaleMode>(TREE_PRINT_DEFAULT_SCALE_MODE);
  const [manualScalePercent, setManualScalePercent] = useState(TREE_PRINT_DEFAULT_MANUAL_SCALE_PERCENT);
  const [showPageFrame, setShowPageFrame] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [showDiagnosticsPanel, setShowDiagnosticsPanel] = useState(true);
  const [showPrintHeader, setShowPrintHeader] = useState(true);
  const [showPrintFooter, setShowPrintFooter] = useState(true);
  const [showPrintLegend, setShowPrintLegend] = useState(true);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<TreePrintViewMode>("fit-tree");
  const [lastAction, setLastAction] = useState<TreePrintViewportAction>(null);
  const [lastExportStatus, setLastExportStatus] = useState<string | null>(null);
  const [pdfCapability] = useState<TreePrintPdfCapability>("unknown");
  const isLargeFormatMode = productionMode !== "ONE_PAGE_OVERVIEW";
  const isBranchMode = productionMode === "LARGE_FORMAT_BRANCH";
  const effectiveSizingStrategy = isBranchMode ? branchSizingStrategy : fullTreeSizingStrategy;
  const effectiveTargetFontSizePt = isBranchMode ? branchTargetFontSizePt : fullTreeTargetFontSizePt;
  const document = useMemo(
    () => createTreePrintDocument(graph, { density }),
    [density, graph],
  );
  const branchCandidates = useMemo(
    () => searchTreePrintPeople(document, branchQuery),
    [branchQuery, document],
  );
  const resolvedRootPersonId = selectedRootPersonId ?? branchCandidates[0]?.id ?? null;
  const branchScope = useMemo(
    () =>
      isBranchMode
        ? scopeTreePrintDocument(document, branchScopeType, resolvedRootPersonId)
        : null,
    [branchScopeType, document, isBranchMode, resolvedRootPersonId],
  );
  const activeDocument = branchScope?.document ?? document;
  const paper = useMemo(
    () => getTreePrintPaperPreset(paperSize, orientation),
    [orientation, paperSize],
  );
  const printSummary = useMemo(
    () =>
      calculateTreePrintScale({
        treeWidthLayoutUnits: document.bounds.width,
        treeHeightLayoutUnits: document.bounds.height,
        paper,
        marginMm,
        mode: printScaleMode,
        manualScalePercent,
        cardFontSizeLayoutUnits: getTreePrintCardFontSizeLayoutUnits(document.people),
        cardWidthLayoutUnits: document.people[0]?.width,
        cardHeightLayoutUnits: document.people[0]?.height,
      }),
    [document.bounds.height, document.bounds.width, document.people, manualScalePercent, marginMm, paper, printScaleMode],
  );
  const largeFormatPlan = useMemo(
    () =>
      isLargeFormatMode
        ? createTreePrintLargeFormatPlan({
          document: activeDocument,
          mode: productionMode,
          mediaWidthPreset,
          customMediaWidthMm,
          orientation: largeFormatOrientation,
          sizingStrategy: effectiveSizingStrategy,
          lengthMode,
          customLengthMm,
          targetFontSizePt: effectiveTargetFontSizePt,
          safeMarginPreset,
          customSafeMarginMm,
          bleedPreset,
          customBleedMm,
          branchNoUpscale,
        })
        : null,
    [
      activeDocument,
      branchNoUpscale,
      bleedPreset,
      customBleedMm,
      customLengthMm,
      customMediaWidthMm,
      customSafeMarginMm,
      effectiveSizingStrategy,
      effectiveTargetFontSizePt,
      isLargeFormatMode,
      largeFormatOrientation,
      lengthMode,
      mediaWidthPreset,
      productionMode,
      safeMarginPreset,
    ],
  );
  const previewDocument = largeFormatPlan?.document ?? activeDocument;
  const exportEligibility = useMemo(
    () =>
      evaluateTreePrintExportEligibility({
        mode: productionMode,
        largeFormatPlan,
        onePageSummary: printSummary,
        pdfCapability,
      }),
    [largeFormatPlan, pdfCapability, printSummary, productionMode],
  );
  const overviewPrintViewBox = useMemo(
    () => ({
      minX: 0,
      minY: 0,
      width: printSummary.pageWidthLayoutUnits,
      height: printSummary.pageHeightLayoutUnits,
    }),
    [printSummary.pageHeightLayoutUnits, printSummary.pageWidthLayoutUnits],
  );
  const overviewScreenViewBox = useMemo(() => {
    const pageX = (document.bounds.width - printSummary.pageWidthLayoutUnits) / 2;
    const pageY = (document.bounds.height - printSummary.pageHeightLayoutUnits) / 2;
    const minX = Math.min(document.bounds.minX, pageX);
    const minY = Math.min(document.bounds.minY, pageY);
    const maxX = Math.max(document.bounds.maxX, pageX + printSummary.pageWidthLayoutUnits);
    const maxY = Math.max(document.bounds.maxY, pageY + printSummary.pageHeightLayoutUnits);

    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [document.bounds, printSummary.pageHeightLayoutUnits, printSummary.pageWidthLayoutUnits]);
  const overviewPrintContentOffset = useMemo(
    () => ({
      x: printSummary.marginLayoutUnits + Math.max(0, (printSummary.printableWidthLayoutUnits - document.bounds.width) / 2),
      y: printSummary.marginLayoutUnits + Math.max(0, (printSummary.printableHeightLayoutUnits - document.bounds.height) / 2),
    }),
    [
      document.bounds.height,
      document.bounds.width,
      printSummary.marginLayoutUnits,
      printSummary.printableHeightLayoutUnits,
      printSummary.printableWidthLayoutUnits,
    ],
  );
  const printViewBox = largeFormatPlan?.viewBox ?? overviewPrintViewBox;
  const screenViewBox = largeFormatPlan?.viewBox ?? overviewScreenViewBox;
  const printContentOffset = largeFormatPlan?.contentOffsetLayoutUnits ?? overviewPrintContentOffset;
  const exportWidthMm = largeFormatPlan?.exportWidthMm ?? paper.widthMm;
  const exportHeightMm = largeFormatPlan?.exportHeightMm ?? paper.heightMm;
  const printMarginMm = largeFormatPlan ? 0 : marginMm;
  const printSheetStyle = {
    "--tree-print-paper-width": `${exportWidthMm}mm`,
    "--tree-print-paper-height": `${exportHeightMm}mm`,
    "--tree-print-selected-margin": `${largeFormatPlan?.safeMarginMm ?? marginMm}mm`,
  } as CSSProperties;
  const screenGridClassName = showDiagnosticsPanel
    ? "tree-print-screen-grid grid min-h-[min(760px,calc(100vh-240px))] min-w-0 max-w-full overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]"
    : "tree-print-screen-grid grid min-h-[min(760px,calc(100vh-240px))] min-w-0 max-w-full overflow-hidden lg:grid-cols-[minmax(0,1fr)]";
  const screenSvgWidth = isLargeFormatMode
    ? `${Math.max(1, Math.round(screenViewBox.width * scale))}px`
    : undefined;
  const screenSvgHeight = isLargeFormatMode
    ? `${Math.max(1, Math.round(screenViewBox.height * scale))}px`
    : undefined;

  const flashAction = useCallback((action: Exclude<TreePrintViewportAction, null>) => {
    if (actionTimerRef.current !== null) {
      window.clearTimeout(actionTimerRef.current);
    }
    setLastAction(action);
    actionTimerRef.current = window.setTimeout(() => {
      setLastAction((current) => (current === action ? null : current));
      actionTimerRef.current = null;
    }, 520);
  }, []);

  useEffect(() => {
    return () => {
      if (actionTimerRef.current !== null) {
        window.clearTimeout(actionTimerRef.current);
      }
    };
  }, []);

  const fitTree = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const logicalWidth = isLargeFormatMode ? screenViewBox.width : previewDocument.bounds.width;
    const logicalHeight = isLargeFormatMode ? screenViewBox.height : previewDocument.bounds.height;
    const nextScale = calculateTreePrintPreviewScale({
      availableViewportWidth: rect.width,
      availableViewportHeight: rect.height,
      artboardLogicalWidth: logicalWidth,
      artboardLogicalHeight: logicalHeight,
      fitPadding: 0.92,
    });
    setScale(nextScale);
    setOffset(isLargeFormatMode
      ? { x: 0, y: 0 }
      : {
        x: (previewDocument.bounds.width - previewDocument.bounds.width * nextScale) / 2,
        y: (previewDocument.bounds.height - previewDocument.bounds.height * nextScale) / 2,
      });
    setViewMode(nextTreePrintViewMode("fit-tree"));
  }, [isLargeFormatMode, previewDocument.bounds.height, previewDocument.bounds.width, screenViewBox.height, screenViewBox.width]);

  const fitWidth = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const logicalWidth = isLargeFormatMode ? screenViewBox.width : previewDocument.bounds.width;
    const nextScale = clampScale((rect.width / Math.max(1, logicalWidth)) * 0.94);
    setScale(nextScale);
    setOffset(isLargeFormatMode
      ? { x: 0, y: 0 }
      : { x: (previewDocument.bounds.width - previewDocument.bounds.width * nextScale) / 2, y: 24 });
    setViewMode(nextTreePrintViewMode("fit-width"));
  }, [isLargeFormatMode, previewDocument.bounds.width, screenViewBox.width]);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setViewMode(nextTreePrintViewMode("reset"));
    flashAction("reset");
  }, [flashAction]);

  useEffect(() => {
    if (viewMode !== "fit-tree") return;
    fitTree();
  }, [fitTree, viewMode]);

  const handleDownloadSvg = useCallback(() => {
    if (!exportEligibility.canExportSvg) {
      setLastExportStatus(exportEligibility.svgBlockers[0]?.message ?? "SVG chưa thể xuất");
      return;
    }
    if (!exportSvgRef.current) {
      setLastExportStatus("SVG chưa sẵn sàng");
      return;
    }

    const prefix = largeFormatPlan
      ? `gia-pha-kho-bat-${largeFormatPlan.resolvedOrientation === "landscape" ? "ngang" : "doc"}-${Math.round(largeFormatPlan.finishedWidthMm)}x${Math.round(largeFormatPlan.finishedHeightMm)}mm`
      : undefined;
    const fileName = downloadTreePrintSvg(exportSvgRef.current, {
      includeDiagnostics: false,
      fileNamePrefix: prefix,
    });
    setLastExportStatus(`Đã tải ${fileName}`);
  }, [exportEligibility.canExportSvg, exportEligibility.svgBlockers, largeFormatPlan]);

  const handlePrintPdf = useCallback(() => {
    if (!exportEligibility.canPrintPdf) {
      setLastExportStatus(exportEligibility.pdfBlockers[0]?.message ?? "PDF chưa thể in");
      return;
    }
    setLastExportStatus("Đã mở hộp thoại in");
    window.print();
  }, [exportEligibility.canPrintPdf, exportEligibility.pdfBlockers]);

  return (
    <div data-tree-print-root="true" className="tree-print-workspace min-w-0 max-w-full overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <style data-tree-print-page-style="true">
        {buildTreePrintPageStyle({ widthMm: exportWidthMm, heightMm: exportHeightMm, marginMm: printMarginMm })}
      </style>
      <div data-tree-print-screen-preview="true" className="min-w-0 max-w-full overflow-hidden">
        <TreePrintToolbar
          density={density}
          productionMode={productionMode}
          paper={paper}
          paperSize={paperSize}
          orientation={orientation}
          marginMm={marginMm}
          mediaWidthPreset={mediaWidthPreset}
          customMediaWidthMm={customMediaWidthMm}
          largeFormatOrientation={largeFormatOrientation}
          sizingStrategy={effectiveSizingStrategy}
          lengthMode={lengthMode}
          customLengthMm={customLengthMm}
          targetFontSizePt={effectiveTargetFontSizePt}
          branchNoUpscale={branchNoUpscale}
          safeMarginPreset={safeMarginPreset}
          customSafeMarginMm={customSafeMarginMm}
          bleedPreset={bleedPreset}
          customBleedMm={customBleedMm}
          showPageFrame={showPageFrame}
          showDiagnostics={showDiagnostics}
          showDiagnosticsPanel={showDiagnosticsPanel}
          showPrintHeader={showPrintHeader}
          showPrintFooter={showPrintFooter}
          showPrintLegend={showPrintLegend}
          scale={scale}
          printSummary={printSummary}
          largeFormatPlan={largeFormatPlan}
          exportEligibility={exportEligibility}
          pdfCapability={pdfCapability}
          branchScopeType={branchScopeType}
          branchQuery={branchQuery}
          branchCandidates={branchCandidates}
          selectedRootPersonId={selectedRootPersonId}
          branchScope={branchScope}
          printScaleMode={printScaleMode}
          manualScalePercent={manualScalePercent}
          viewMode={viewMode}
          lastAction={lastAction}
          lastExportStatus={lastExportStatus}
          onDensityChange={setDensity}
          onProductionModeChange={setProductionMode}
          onPaperSizeChange={setPaperSize}
          onOrientationChange={setOrientation}
          onMarginChange={(value) => setMarginMm(normalizeTreePrintMargin(value))}
          onMediaWidthPresetChange={setMediaWidthPreset}
          onCustomMediaWidthChange={(value) => setCustomMediaWidthMm(normalizeTreePrintCustomMediaWidth(value))}
          onLargeFormatOrientationChange={setLargeFormatOrientation}
          onSizingStrategyChange={(value) => {
            if (isBranchMode) setBranchSizingStrategy(value);
            else setFullTreeSizingStrategy(value);
          }}
          onLengthModeChange={setLengthMode}
          onCustomLengthChange={(value) => setCustomLengthMm(normalizeTreePrintCustomLength(value))}
          onTargetFontSizeChange={(value) => {
            if (isBranchMode) setBranchTargetFontSizePt(value);
            else setFullTreeTargetFontSizePt(value);
          }}
          onBranchNoUpscaleChange={setBranchNoUpscale}
          onSafeMarginPresetChange={setSafeMarginPreset}
          onCustomSafeMarginChange={(value) => setCustomSafeMarginMm(normalizeTreePrintCustomSafeMargin(value))}
          onBleedPresetChange={setBleedPreset}
          onCustomBleedChange={(value) => setCustomBleedMm(normalizeTreePrintCustomBleed(value))}
          onPrintScaleModeChange={setPrintScaleMode}
          onManualScalePercentChange={(value) => setManualScalePercent(normalizeManualScalePercent(value))}
          onBranchScopeTypeChange={setBranchScopeType}
          onBranchQueryChange={setBranchQuery}
          onSelectedRootPersonChange={setSelectedRootPersonId}
          onFitTree={fitTree}
          onFitWidth={fitWidth}
          onZoomIn={() => {
            setScale((value) => clampScale(value * 1.18));
            setViewMode(nextTreePrintViewMode("zoom-in"));
            flashAction("zoom-in");
          }}
          onZoomOut={() => {
            setScale((value) => clampScale(value / 1.18));
            setViewMode(nextTreePrintViewMode("zoom-out"));
            flashAction("zoom-out");
          }}
          onReset={reset}
          onDownloadSvg={handleDownloadSvg}
          onPrintPdf={handlePrintPdf}
          onTogglePageFrame={() => setShowPageFrame((value) => !value)}
          onToggleDiagnostics={() => setShowDiagnostics((value) => !value)}
          onToggleDiagnosticsPanel={() => setShowDiagnosticsPanel((value) => !value)}
          onTogglePrintHeader={() => setShowPrintHeader((value) => !value)}
          onTogglePrintFooter={() => setShowPrintFooter((value) => !value)}
          onTogglePrintLegend={() => setShowPrintLegend((value) => !value)}
        />
        <div className={screenGridClassName}>
          <div
            ref={viewportRef}
            data-tree-print-preview-viewport="true"
            className="tree-print-preview-viewport h-[calc(100vh-280px)] min-h-[420px] min-w-0 max-w-full cursor-grab overflow-auto bg-[#f5eddf] active:cursor-grabbing"
            onWheel={(event) => {
              event.preventDefault();
              setScale((value) => clampScale(value * (event.deltaY > 0 ? 0.92 : 1.08)));
              setViewMode(nextTreePrintViewMode("wheel-zoom"));
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = {
                x: event.clientX,
                y: event.clientY,
                ox: offset.x,
                oy: offset.y,
                scrollLeft: event.currentTarget.scrollLeft,
                scrollTop: event.currentTarget.scrollTop,
              };
            }}
            onPointerMove={(event) => {
              if (!dragRef.current) return;
              if (isLargeFormatMode) {
                event.currentTarget.scrollLeft = dragRef.current.scrollLeft - (event.clientX - dragRef.current.x);
                event.currentTarget.scrollTop = dragRef.current.scrollTop - (event.clientY - dragRef.current.y);
              } else {
                setOffset({
                  x: dragRef.current.ox + event.clientX - dragRef.current.x,
                  y: dragRef.current.oy + event.clientY - dragRef.current.y,
                });
              }
              setViewMode(nextTreePrintViewMode("pan"));
            }}
            onPointerUp={() => {
              dragRef.current = null;
            }}
          >
            <TreePrintSvg
              document={previewDocument}
              density={density}
              showDiagnostics={showDiagnostics}
              showPageFrame={!isLargeFormatMode && showPageFrame}
              paper={!isLargeFormatMode ? paper : undefined}
              marginMm={!isLargeFormatMode ? marginMm : undefined}
              scaleSummary={!isLargeFormatMode ? printSummary : undefined}
              scale={isLargeFormatMode ? 1 : scale}
              offset={isLargeFormatMode ? { x: 0, y: 0 } : offset}
              contentOffset={largeFormatPlan?.contentOffsetLayoutUnits}
              viewBox={screenViewBox}
              showDocumentBounds={showPageFrame}
              className={isLargeFormatMode ? "tree-print-preview-svg block bg-[#f5eddf]" : undefined}
              width={screenSvgWidth}
              height={screenSvgHeight}
              svgIdPrefix="tree-print-screen"
            />
          </div>
          {showDiagnosticsPanel ? (
            <TreePrintDiagnosticsPanel
              diagnostics={previewDocument.diagnostics}
              marginMm={marginMm}
              paper={paper}
              printSummary={printSummary}
              scale={scale}
              productionMode={productionMode}
              largeFormatPlan={largeFormatPlan}
              branchScope={branchScope}
              exportEligibility={exportEligibility}
            />
          ) : null}
        </div>
        <TreePrintLegend />
      </div>

      <div className="tree-print-print-root" data-tree-print-document-root="true" aria-hidden="true">
        <section
          data-tree-print-document="true"
          data-tree-print-large-format-artboard={largeFormatPlan ? "true" : undefined}
          className="tree-print-print-sheet"
          style={printSheetStyle}
        >
          {showPrintHeader ? (
            <header className="tree-print-print-header">
              <div className="tree-print-print-title">Gia phả - bản in vector</div>
              <div className="tree-print-print-meta">
                {largeFormatPlan
                  ? `${largeFormatPlan.resolvedOrientation === "landscape" ? "Ngang" : "Dọc"} · ${largeFormatPlan.layoutFlow === "top-to-bottom" ? "Trên xuống" : "Trái sang phải"} · ${Math.round(largeFormatPlan.finishedWidthMm)} x ${Math.round(largeFormatPlan.finishedHeightMm)}mm · SVG 1:1 · RGB · text chưa outline`
                  : `${paper.size} ${paper.orientation === "landscape" ? "ngang" : "dọc"} · lề ${marginMm}mm · tỷ lệ ${printSummary.printScalePercent.toFixed(1)}%`}
              </div>
            </header>
          ) : null}
          <div className="tree-print-print-svg-wrap">
            <TreePrintSvg
              ref={exportSvgRef}
              document={previewDocument}
              density={density}
              showDiagnostics={false}
              showPageFrame={false}
              scale={1}
              contentOffset={printContentOffset}
              viewBox={printViewBox}
              showDocumentBounds={!largeFormatPlan}
              className="tree-print-print-svg"
              width={`${exportWidthMm}mm`}
              height={`${exportHeightMm}mm`}
              ariaLabel="SVG vector sẵn sàng in hoặc lưu PDF"
              svgIdPrefix="tree-print-export"
            />
          </div>
          {showPrintLegend ? (
            <div className="tree-print-print-legend">
              <TreePrintLegend />
            </div>
          ) : null}
          {showPrintFooter ? (
            <footer className="tree-print-print-footer">
              <span>
                {largeFormatPlan
                  ? `SCALE=1:1 · VECTOR_TREE=YES · COLOR_MODEL=RGB · TEXT_OUTLINED=${largeFormatPlan.textOutlined}`
                  : printSummary.readabilityMessage}
              </span>
              <span>{largeFormatPlan ? "PAGE_COUNT=1" : "Trang 1/1"}</span>
            </footer>
          ) : null}
        </section>
      </div>
    </div>
  );
}

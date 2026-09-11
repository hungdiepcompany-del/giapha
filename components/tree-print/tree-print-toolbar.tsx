"use client";

import type { ReactNode } from "react";

import type { TreePrintDensity, TreePrintPersonNode } from "@/lib/family/print/tree-print-model";
import type {
  TreePrintBranchScopeResult,
  TreePrintBranchScopeType,
} from "@/lib/family/print/tree-print-branch-scope";
import {
  getTreePrintBranchScopeLabel,
  TREE_PRINT_BRANCH_SCOPE_OPTIONS,
} from "@/lib/family/print/tree-print-branch-scope";
import type { TreePrintExportEligibility, TreePrintPdfCapability } from "@/lib/family/print/tree-print-eligibility";
import type {
  TreePrintLargeFormatBleedPreset,
  TreePrintLargeFormatLengthMode,
  TreePrintLargeFormatOrientation,
  TreePrintLargeFormatPlan,
  TreePrintLargeFormatSafeMarginPreset,
  TreePrintLargeFormatSizingStrategy,
  TreePrintLargeFormatTargetFontSizePt,
  TreePrintMediaWidthPreset,
  TreePrintProductionMode,
} from "@/lib/family/print/tree-print-large-format";
import {
  getTreePrintLargeFormatLengthModeLabel,
  getTreePrintLargeFormatOrientationLabel,
  getTreePrintLargeFormatLayoutFlowLabel,
  getTreePrintLargeFormatResolvedOrientationLabel,
  getTreePrintLargeFormatSizingLabel,
  getTreePrintProductionModeLabel,
  TREE_PRINT_BLEED_OPTIONS,
  TREE_PRINT_LARGE_FORMAT_LENGTH_MODE_OPTIONS,
  TREE_PRINT_LARGE_FORMAT_ORIENTATION_OPTIONS,
  TREE_PRINT_LARGE_FORMAT_SIZING_OPTIONS,
  TREE_PRINT_LARGE_FORMAT_TARGET_FONT_OPTIONS,
  TREE_PRINT_MEDIA_WIDTH_OPTIONS,
  TREE_PRINT_PRODUCTION_MODE_OPTIONS,
  TREE_PRINT_SAFE_MARGIN_OPTIONS,
} from "@/lib/family/print/tree-print-large-format";
import {
  getTreePrintOrientationLabel,
  getTreePrintPaperLabel,
  TREE_PRINT_MARGIN_OPTIONS,
  TREE_PRINT_ORIENTATION_OPTIONS,
  TREE_PRINT_PAPER_SIZE_OPTIONS,
  type TreePrintMarginMm,
  type TreePrintOrientation,
  type TreePrintPaperPreset,
  type TreePrintPaperSize,
} from "@/lib/family/print/tree-print-paper";
import {
  formatPrintNumber,
  getTreePrintScaleModeLabel,
  TREE_PRINT_MAX_MANUAL_SCALE_PERCENT,
  TREE_PRINT_MIN_MANUAL_SCALE_PERCENT,
  TREE_PRINT_SCALE_MODE_OPTIONS,
  type TreePrintScaleMode,
  type TreePrintScaleSummary,
} from "@/lib/family/print/tree-print-scale";
import {
  buildTreePrintToolbarStatus,
  isFitModeActive,
  type TreePrintViewMode,
  type TreePrintViewportAction,
} from "@/lib/family/print/tree-print-toolbar-state";

type TreePrintToolbarProps = {
  density: TreePrintDensity;
  productionMode: TreePrintProductionMode;
  paper: TreePrintPaperPreset;
  paperSize: TreePrintPaperSize;
  orientation: TreePrintOrientation;
  marginMm: TreePrintMarginMm;
  mediaWidthPreset: TreePrintMediaWidthPreset;
  customMediaWidthMm: number;
  largeFormatOrientation: TreePrintLargeFormatOrientation;
  sizingStrategy: TreePrintLargeFormatSizingStrategy;
  lengthMode: TreePrintLargeFormatLengthMode;
  customLengthMm: number;
  targetFontSizePt: TreePrintLargeFormatTargetFontSizePt;
  branchNoUpscale: boolean;
  safeMarginPreset: TreePrintLargeFormatSafeMarginPreset;
  customSafeMarginMm: number;
  bleedPreset: TreePrintLargeFormatBleedPreset;
  customBleedMm: number;
  showPageFrame: boolean;
  showDiagnostics: boolean;
  showDiagnosticsPanel: boolean;
  showPrintHeader: boolean;
  showPrintFooter: boolean;
  showPrintLegend: boolean;
  scale: number;
  printSummary: TreePrintScaleSummary;
  largeFormatPlan?: TreePrintLargeFormatPlan | null;
  exportEligibility: TreePrintExportEligibility;
  pdfCapability: TreePrintPdfCapability;
  branchScopeType: TreePrintBranchScopeType;
  branchQuery: string;
  branchCandidates: TreePrintPersonNode[];
  selectedRootPersonId: string | null;
  branchScope?: TreePrintBranchScopeResult | null;
  printScaleMode: TreePrintScaleMode;
  manualScalePercent: number;
  viewMode: TreePrintViewMode;
  lastAction: TreePrintViewportAction;
  lastExportStatus: string | null;
  onFitTree: () => void;
  onFitWidth: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onDownloadSvg: () => void;
  onPrintPdf: () => void;
  onTogglePageFrame: () => void;
  onToggleDiagnostics: () => void;
  onToggleDiagnosticsPanel: () => void;
  onTogglePrintHeader: () => void;
  onTogglePrintFooter: () => void;
  onTogglePrintLegend: () => void;
  onDensityChange: (density: TreePrintDensity) => void;
  onProductionModeChange: (mode: TreePrintProductionMode) => void;
  onPaperSizeChange: (size: TreePrintPaperSize) => void;
  onOrientationChange: (orientation: TreePrintOrientation) => void;
  onMarginChange: (marginMm: TreePrintMarginMm) => void;
  onMediaWidthPresetChange: (value: TreePrintMediaWidthPreset) => void;
  onCustomMediaWidthChange: (value: number) => void;
  onLargeFormatOrientationChange: (value: TreePrintLargeFormatOrientation) => void;
  onSizingStrategyChange: (value: TreePrintLargeFormatSizingStrategy) => void;
  onLengthModeChange: (value: TreePrintLargeFormatLengthMode) => void;
  onCustomLengthChange: (value: number) => void;
  onTargetFontSizeChange: (value: TreePrintLargeFormatTargetFontSizePt) => void;
  onBranchNoUpscaleChange: (value: boolean) => void;
  onSafeMarginPresetChange: (value: TreePrintLargeFormatSafeMarginPreset) => void;
  onCustomSafeMarginChange: (value: number) => void;
  onBleedPresetChange: (value: TreePrintLargeFormatBleedPreset) => void;
  onCustomBleedChange: (value: number) => void;
  onPrintScaleModeChange: (mode: TreePrintScaleMode) => void;
  onManualScalePercentChange: (scalePercent: number) => void;
  onBranchScopeTypeChange: (scopeType: TreePrintBranchScopeType) => void;
  onBranchQueryChange: (query: string) => void;
  onSelectedRootPersonChange: (personId: string | null) => void;
};

const baseButton =
  "min-h-10 rounded-md border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";
const inactiveButton =
  "border-stone-300 bg-white text-stone-800 hover:bg-stone-100";
const activeModeButton =
  "border-teal-700 bg-teal-700 text-white shadow-sm hover:bg-teal-800";
const disabledButton = "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400";
const zoomFeedbackButton = "border-teal-300 bg-teal-50 text-teal-900";
const resetFeedbackButton = "border-amber-300 bg-amber-50 text-amber-900";
const warningBadge = "border-amber-300 bg-amber-50 text-amber-950";
const errorBadge = "border-red-300 bg-red-50 text-red-900";

function ToolbarGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-2 py-2">
      <div className="w-full text-xs font-bold uppercase tracking-normal text-stone-500 sm:w-auto">
        {title}
      </div>
      {children}
    </div>
  );
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`${baseButton} ${active ? activeModeButton : inactiveButton}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ActionButton({
  active = false,
  children,
  tone = "plain",
  onClick,
  disabled = false,
}: {
  active?: boolean;
  children: ReactNode;
  tone?: "plain" | "zoom" | "reset" | "primary";
  onClick: () => void;
  disabled?: boolean;
}) {
  const activeClass =
    tone === "primary"
      ? activeModeButton
      : tone === "reset"
        ? resetFeedbackButton
        : tone === "zoom"
          ? zoomFeedbackButton
          : inactiveButton;

  return (
    <button
      className={`${baseButton} ${disabled ? disabledButton : active ? activeClass : tone === "primary" ? activeModeButton : inactiveButton}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ToggleButton({
  active,
  children,
  tone = "page",
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  tone?: "page" | "diagnostics" | "print";
  onClick: () => void;
}) {
  const activeClass =
    tone === "diagnostics"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : tone === "print"
        ? "border-sky-300 bg-sky-50 text-sky-900"
        : "border-teal-300 bg-teal-50 text-teal-900";

  return (
    <button
      aria-pressed={active}
      className={`${baseButton} ${active ? activeClass : inactiveButton}`}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true" className="mr-1">
        {active ? "✓" : "○"}
      </span>
      {children}
    </button>
  );
}

function StatusBadge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "warning" | "error";
}) {
  const toneClass = tone === "error" ? errorBadge : tone === "warning" ? warningBadge : "border-stone-300 bg-white text-stone-800";

  return (
    <span className={`inline-flex min-h-8 items-center rounded-md border px-2.5 py-1 text-xs font-bold ${toneClass}`}>
      {children}
    </span>
  );
}

function SelectShell({ children }: { children: ReactNode }) {
  return (
    <label className="flex min-h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2">
      {children}
    </label>
  );
}

export function TreePrintToolbar({
  density,
  productionMode,
  paper,
  paperSize,
  orientation,
  marginMm,
  mediaWidthPreset,
  customMediaWidthMm,
  largeFormatOrientation,
  sizingStrategy,
  lengthMode,
  customLengthMm,
  targetFontSizePt,
  branchNoUpscale,
  safeMarginPreset,
  customSafeMarginMm,
  bleedPreset,
  customBleedMm,
  showPageFrame,
  showDiagnostics,
  showDiagnosticsPanel,
  showPrintHeader,
  showPrintFooter,
  showPrintLegend,
  scale,
  printSummary,
  largeFormatPlan,
  exportEligibility,
  pdfCapability,
  branchScopeType,
  branchQuery,
  branchCandidates,
  selectedRootPersonId,
  branchScope,
  printScaleMode,
  manualScalePercent,
  viewMode,
  lastAction,
  lastExportStatus,
  onFitTree,
  onFitWidth,
  onZoomIn,
  onZoomOut,
  onReset,
  onDownloadSvg,
  onPrintPdf,
  onTogglePageFrame,
  onToggleDiagnostics,
  onToggleDiagnosticsPanel,
  onTogglePrintHeader,
  onTogglePrintFooter,
  onTogglePrintLegend,
  onDensityChange,
  onProductionModeChange,
  onPaperSizeChange,
  onOrientationChange,
  onMarginChange,
  onMediaWidthPresetChange,
  onCustomMediaWidthChange,
  onLargeFormatOrientationChange,
  onSizingStrategyChange,
  onLengthModeChange,
  onCustomLengthChange,
  onTargetFontSizeChange,
  onBranchNoUpscaleChange,
  onSafeMarginPresetChange,
  onCustomSafeMarginChange,
  onBleedPresetChange,
  onCustomBleedChange,
  onPrintScaleModeChange,
  onManualScalePercentChange,
  onBranchScopeTypeChange,
  onBranchQueryChange,
  onSelectedRootPersonChange,
}: TreePrintToolbarProps) {
  const isOverview = productionMode === "ONE_PAGE_OVERVIEW";
  const isBranch = productionMode === "LARGE_FORMAT_BRANCH";
  const viewportStatus = buildTreePrintToolbarStatus({
    viewMode,
    scale,
    showPageFrame,
    showDiagnostics,
    density,
    pageFrame: showPageFrame ? "a0-landscape" : "none",
    lastAction,
  });
  const readabilityTone =
    (largeFormatPlan?.readabilityLevel ?? printSummary.readabilityLevel) === "unreadable"
      ? "error"
      : (largeFormatPlan?.readabilityLevel ?? printSummary.readabilityLevel) === "warning"
        ? "warning"
        : "default";
  const svgTone = exportEligibility.canExportSvg ? "default" : "error";
  const pdfTone = exportEligibility.canPrintPdf ? (pdfCapability === "unknown" ? "warning" : "default") : "error";

  return (
    <div className="tree-print-toolbar border-b border-stone-200 bg-white">
      <div className="flex flex-wrap items-stretch gap-2 px-3 py-3">
        <ToolbarGroup title="Khung nhìn">
          <ModeButton active={isFitModeActive(viewMode, "fit-tree")} onClick={onFitTree}>
            Fit toàn cây
          </ModeButton>
          <ModeButton active={isFitModeActive(viewMode, "fit-tree")} onClick={onFitTree}>
            Vừa màn hình
          </ModeButton>
          <ModeButton active={isFitModeActive(viewMode, "fit-width")} onClick={onFitWidth}>
            Fit chiều rộng
          </ModeButton>
          <ActionButton active={lastAction === "zoom-in"} tone="zoom" onClick={onZoomIn}>
            Phóng to
          </ActionButton>
          <ActionButton active={lastAction === "zoom-out"} tone="zoom" onClick={onZoomOut}>
            Thu nhỏ
          </ActionButton>
          <ActionButton active={lastAction === "reset"} tone="reset" onClick={onReset}>
            100% preview
          </ActionButton>
          <ActionButton active={lastAction === "reset"} tone="reset" onClick={onReset}>
            Đặt lại
          </ActionButton>
        </ToolbarGroup>

        <ToolbarGroup title="Lớp hiển thị">
          <ToggleButton active={showPageFrame} tone="page" onClick={onTogglePageFrame}>
            Khung trang
          </ToggleButton>
          <ToggleButton active={showDiagnosticsPanel} tone="diagnostics" onClick={onToggleDiagnosticsPanel}>
            {showDiagnosticsPanel ? "Ẩn bảng chẩn đoán" : "Hiện bảng chẩn đoán"}
          </ToggleButton>
          <ToggleButton active={showDiagnostics} tone="diagnostics" onClick={onToggleDiagnostics}>
            Chẩn đoán
          </ToggleButton>
        </ToolbarGroup>

        <ToolbarGroup title="Bản in">
          <SelectShell>
            Chế độ
            <select
              aria-label="Chế độ xuất bản in"
              className="rounded border border-stone-300 bg-white px-2 py-1"
              value={productionMode}
              onChange={(event) => onProductionModeChange(event.target.value as TreePrintProductionMode)}
            >
              {TREE_PRINT_PRODUCTION_MODE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {getTreePrintProductionModeLabel(option)}
                </option>
              ))}
            </select>
          </SelectShell>

          <SelectShell>
            Mật độ
            <select
              aria-label="Mật độ thẻ"
              className="rounded border border-stone-300 bg-white px-2 py-1"
              value={density}
              onChange={(event) => onDensityChange(event.target.value as TreePrintDensity)}
            >
              <option value="compact">Tối giản</option>
              <option value="standard">Tiêu chuẩn</option>
            </select>
          </SelectShell>
        </ToolbarGroup>

        {!isOverview ? (
          <ToolbarGroup title="Khổ bạt">
            <SelectShell>
              Khổ cuộn máy in
              <select
                aria-label="Khổ cuộn máy in"
                className="rounded border border-stone-300 bg-white px-2 py-1"
                value={mediaWidthPreset}
                onChange={(event) => {
                  const value = event.target.value === "custom" ? "custom" : Number(event.target.value);
                  onMediaWidthPresetChange(value as TreePrintMediaWidthPreset);
                }}
              >
                {TREE_PRINT_MEDIA_WIDTH_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "custom" ? "Tùy chỉnh" : `${option}mm`}
                  </option>
                ))}
              </select>
            </SelectShell>
            {mediaWidthPreset === "custom" ? (
              <NumberInput label="mm" value={customMediaWidthMm} min={500} max={5000} onChange={onCustomMediaWidthChange} />
            ) : null}
            <span className="inline-flex min-h-10 overflow-hidden rounded-md border border-stone-300 bg-white">
              {TREE_PRINT_LARGE_FORMAT_ORIENTATION_OPTIONS.map((option) => (
                <button
                  key={option}
                  aria-pressed={largeFormatOrientation === option}
                  className={`border-r border-stone-200 px-3 text-sm font-semibold last:border-r-0 ${
                    largeFormatOrientation === option ? "bg-teal-700 text-white" : "bg-white text-stone-800 hover:bg-stone-100"
                  }`}
                  type="button"
                  onClick={() => onLargeFormatOrientationChange(option)}
                >
                  {getTreePrintLargeFormatOrientationLabel(option)}
                </button>
              ))}
            </span>
            <SelectShell>
              Tỷ lệ
              <select
                aria-label="Chiến lược tỷ lệ khổ bạt"
                className="rounded border border-stone-300 bg-white px-2 py-1"
                value={sizingStrategy}
                onChange={(event) => onSizingStrategyChange(event.target.value as TreePrintLargeFormatSizingStrategy)}
              >
                {TREE_PRINT_LARGE_FORMAT_SIZING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {getTreePrintLargeFormatSizingLabel(option)}
                  </option>
                ))}
              </select>
            </SelectShell>
            {sizingStrategy === "TARGET_FONT_SIZE" ? (
              <SelectShell>
                Cỡ chữ
                <select
                  aria-label="Cỡ chữ mục tiêu khổ bạt"
                  className="rounded border border-stone-300 bg-white px-2 py-1"
                  value={targetFontSizePt}
                  onChange={(event) => onTargetFontSizeChange(Number(event.target.value) as TreePrintLargeFormatTargetFontSizePt)}
                >
                  {TREE_PRINT_LARGE_FORMAT_TARGET_FONT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}pt
                    </option>
                  ))}
                </select>
              </SelectShell>
            ) : null}
            {isBranch && sizingStrategy === "TARGET_FONT_SIZE" ? (
              <ToggleButton active={branchNoUpscale} tone="print" onClick={() => onBranchNoUpscaleChange(!branchNoUpscale)}>
                Không phóng vượt cỡ chữ mục tiêu
              </ToggleButton>
            ) : null}
            <SelectShell>
              Chiều dài
              <select
                aria-label="Chế độ chiều dài artboard"
                className="rounded border border-stone-300 bg-white px-2 py-1"
                value={lengthMode}
                onChange={(event) => onLengthModeChange(event.target.value as TreePrintLargeFormatLengthMode)}
              >
                {TREE_PRINT_LARGE_FORMAT_LENGTH_MODE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {getTreePrintLargeFormatLengthModeLabel(option)}
                  </option>
                ))}
              </select>
            </SelectShell>
            {lengthMode === "CUSTOM_LENGTH" ? (
              <NumberInput label="mm" value={customLengthMm} min={500} max={20000} onChange={onCustomLengthChange} />
            ) : null}
          </ToolbarGroup>
        ) : null}

        {!isOverview ? (
          <ToolbarGroup title="Lề và bleed">
            <SelectShell>
              Lề an toàn
              <select
                aria-label="Lề an toàn"
                className="rounded border border-stone-300 bg-white px-2 py-1"
                value={safeMarginPreset}
                onChange={(event) => {
                  const value = event.target.value === "custom" ? "custom" : Number(event.target.value);
                  onSafeMarginPresetChange(value as TreePrintLargeFormatSafeMarginPreset);
                }}
              >
                {TREE_PRINT_SAFE_MARGIN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "custom" ? "Tùy chỉnh" : `${option}mm`}
                  </option>
                ))}
              </select>
            </SelectShell>
            {safeMarginPreset === "custom" ? (
              <NumberInput label="mm" value={customSafeMarginMm} min={0} max={300} onChange={onCustomSafeMarginChange} />
            ) : null}
            <SelectShell>
              Bleed
              <select
                aria-label="Bleed"
                className="rounded border border-stone-300 bg-white px-2 py-1"
                value={bleedPreset}
                onChange={(event) => {
                  const value = event.target.value === "custom" ? "custom" : Number(event.target.value);
                  onBleedPresetChange(value as TreePrintLargeFormatBleedPreset);
                }}
              >
                {TREE_PRINT_BLEED_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "custom" ? "Tùy chỉnh" : `${option}mm`}
                  </option>
                ))}
              </select>
            </SelectShell>
            {bleedPreset === "custom" ? (
              <NumberInput label="mm" value={customBleedMm} min={0} max={200} onChange={onCustomBleedChange} />
            ) : null}
          </ToolbarGroup>
        ) : (
          <ToolbarGroup title="Tổng quan">
            <SelectShell>
              Khổ giấy
              <select
                aria-label="Khổ giấy"
                className="rounded border border-stone-300 bg-white px-2 py-1"
                value={paperSize}
                onChange={(event) => onPaperSizeChange(event.target.value as TreePrintPaperSize)}
              >
                {TREE_PRINT_PAPER_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </SelectShell>
            <div className="flex min-h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800">
              Chiều giấy
              <span className="inline-flex overflow-hidden rounded border border-stone-300">
              {TREE_PRINT_ORIENTATION_OPTIONS.map((option) => (
                <button
                  key={option}
                  aria-pressed={orientation === option}
                  className={`border-r border-stone-200 px-3 text-sm font-semibold last:border-r-0 ${
                    orientation === option ? "bg-teal-700 text-white" : "bg-white text-stone-800 hover:bg-stone-100"
                  }`}
                  type="button"
                  onClick={() => onOrientationChange(option)}
                >
                  {getTreePrintOrientationLabel(option)}
                </button>
              ))}
              </span>
            </div>
            <SelectShell>
              Lề
              <select
                aria-label="Lề in"
                className="rounded border border-stone-300 bg-white px-2 py-1"
                value={marginMm}
                onChange={(event) => onMarginChange(Number(event.target.value) as TreePrintMarginMm)}
              >
                {TREE_PRINT_MARGIN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}mm
                  </option>
                ))}
              </select>
            </SelectShell>
            <span className="inline-flex min-h-10 overflow-hidden rounded-md border border-stone-300 bg-white">
              {TREE_PRINT_SCALE_MODE_OPTIONS.map((option) => (
                <button
                  key={option}
                  aria-pressed={printScaleMode === option}
                  className={`border-r border-stone-200 px-3 text-sm font-semibold last:border-r-0 ${
                    printScaleMode === option ? "bg-teal-700 text-white" : "bg-white text-stone-800 hover:bg-stone-100"
                  }`}
                  type="button"
                  onClick={() => onPrintScaleModeChange(option)}
                >
                  {getTreePrintScaleModeLabel(option)}
                </button>
              ))}
            </span>
            <NumberInput
              disabled={printScaleMode !== "manual"}
              label="%"
              value={manualScalePercent}
              min={TREE_PRINT_MIN_MANUAL_SCALE_PERCENT}
              max={TREE_PRINT_MAX_MANUAL_SCALE_PERCENT}
              onChange={onManualScalePercentChange}
            />
          </ToolbarGroup>
        )}

        {isBranch ? (
          <ToolbarGroup title="Nhánh">
            <SelectShell>
              Kiểu nhánh
              <select
                aria-label="Kiểu nhánh"
                className="rounded border border-stone-300 bg-white px-2 py-1"
                value={branchScopeType}
                onChange={(event) => onBranchScopeTypeChange(event.target.value as TreePrintBranchScopeType)}
              >
                {TREE_PRINT_BRANCH_SCOPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {getTreePrintBranchScopeLabel(option)}
                  </option>
                ))}
              </select>
            </SelectShell>
            <label className="flex min-h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2">
              Người bắt đầu
              <input
                aria-label="Tìm người bắt đầu"
                className="w-44 rounded border border-stone-300 px-2 py-1"
                value={branchQuery}
                onChange={(event) => onBranchQueryChange(event.target.value)}
              />
            </label>
            <SelectShell>
              Chọn
              <select
                aria-label="Chọn người bắt đầu"
                className="max-w-64 rounded border border-stone-300 bg-white px-2 py-1"
                value={selectedRootPersonId ?? ""}
                onChange={(event) => onSelectedRootPersonChange(event.target.value || null)}
              >
                {branchCandidates.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.displayName}
                  </option>
                ))}
              </select>
            </SelectShell>
          </ToolbarGroup>
        ) : null}

        <ToolbarGroup title="Xuất">
          <ToggleButton active={showPrintHeader} tone="print" onClick={onTogglePrintHeader}>
            Đầu trang
          </ToggleButton>
          <ToggleButton active={showPrintFooter} tone="print" onClick={onTogglePrintFooter}>
            Chân trang
          </ToggleButton>
          <ToggleButton active={showPrintLegend} tone="print" onClick={onTogglePrintLegend}>
            Chú giải
          </ToggleButton>
          <ActionButton disabled={!exportEligibility.canExportSvg} onClick={onDownloadSvg}>
            {isOverview ? "Tải SVG" : "Tải SVG khổ bạt"}
          </ActionButton>
          <ActionButton disabled={!exportEligibility.canPrintPdf} tone="primary" onClick={onPrintPdf}>
            {isOverview ? "In / Lưu PDF" : "Thử In / Lưu PDF"}
          </ActionButton>
        </ToolbarGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 bg-[#fffaf0] px-3 py-2" aria-label="Trạng thái bản xem trước">
        <span className="text-xs font-bold uppercase tracking-normal text-stone-500">
          Trạng thái
        </span>
        <StatusBadge>Chế độ: {getTreePrintProductionModeLabel(productionMode)}</StatusBadge>
        {largeFormatPlan ? (
          <>
            <StatusBadge>Hướng yêu cầu: {getTreePrintLargeFormatOrientationLabel(largeFormatPlan.requestedOrientation)}</StatusBadge>
            <StatusBadge>Hướng thực tế: {getTreePrintLargeFormatResolvedOrientationLabel(largeFormatPlan.resolvedOrientation)}</StatusBadge>
            <StatusBadge>Bố trí thế hệ: {getTreePrintLargeFormatLayoutFlowLabel(largeFormatPlan.layoutFlow)}</StatusBadge>
            <StatusBadge>Finished: {formatPrintNumber(largeFormatPlan.finishedWidthMm, 0)} x {formatPrintNumber(largeFormatPlan.finishedHeightMm, 0)}mm</StatusBadge>
            <StatusBadge>Export: {formatPrintNumber(largeFormatPlan.exportWidthMm, 0)} x {formatPrintNumber(largeFormatPlan.exportHeightMm, 0)}mm</StatusBadge>
            <StatusBadge>Pages: {largeFormatPlan.pageCount}</StatusBadge>
            <StatusBadge>Vector: YES</StatusBadge>
            <StatusBadge>Scale: {formatPrintNumber(largeFormatPlan.treeScalePercent, 1)}%</StatusBadge>
            <StatusBadge>Tỷ lệ in: {formatPrintNumber(largeFormatPlan.treeScalePercent, 1)}%</StatusBadge>
            <StatusBadge tone={readabilityTone}>Font: {formatPrintNumber(largeFormatPlan.actualFontSizePt, 1)}pt - {largeFormatPlan.readabilityLabel}</StatusBadge>
            <StatusBadge>Card: {formatPrintNumber(largeFormatPlan.actualCardWidthMm, 1)} x {formatPrintNumber(largeFormatPlan.actualCardHeightMm, 1)}mm</StatusBadge>
            <StatusBadge>Packing: {formatPrintNumber(largeFormatPlan.componentPackingEfficiency * 100, 1)}%</StatusBadge>
            <StatusBadge>Khổ cuộn dùng: {formatPrintNumber(largeFormatPlan.mediaWidthUsagePercent, 1)}%</StatusBadge>
            <StatusBadge>Khoảng trống: {formatPrintNumber(largeFormatPlan.internalWhitespaceRatio * 100, 1)}%</StatusBadge>
            <StatusBadge>Cụm: {largeFormatPlan.packedComponentCount}</StatusBadge>
          </>
        ) : (
          <>
            <StatusBadge>Giấy: {getTreePrintPaperLabel(paper)}</StatusBadge>
            <StatusBadge>PRINT_SCALE: {formatPrintNumber(printSummary.printScalePercent, 1)}%</StatusBadge>
            <StatusBadge>Tỷ lệ in: {formatPrintNumber(printSummary.printScalePercent, 1)}%</StatusBadge>
            <StatusBadge tone={readabilityTone}>Chữ thẻ: {formatPrintNumber(printSummary.cardFontSizePt, 1)}pt - {printSummary.readabilityLabel}</StatusBadge>
          </>
        )}
        {branchScope ? (
          <>
            <StatusBadge>Nhánh: {getTreePrintBranchScopeLabel(branchScope.scopeType)}</StatusBadge>
            <StatusBadge>Người: {branchScope.diagnostics.SCOPE_PERSON_COUNT}</StatusBadge>
            <StatusBadge>Gia đình: {branchScope.diagnostics.SCOPE_FAMILY_COUNT}</StatusBadge>
          </>
        ) : null}
        <StatusBadge tone={svgTone}>CAN_EXPORT_SVG: {exportEligibility.canExportSvg ? "YES" : "NO"}</StatusBadge>
        <StatusBadge tone={pdfTone}>CAN_PRINT_PDF: {exportEligibility.canPrintPdf ? "YES" : "NO"}</StatusBadge>
        <StatusBadge>PDF_CAPABILITY: {pdfCapability}</StatusBadge>
        <StatusBadge>Zoom màn hình: {viewportStatus.zoomLabel}</StatusBadge>
        <StatusBadge>{viewportStatus.diagnosticsLabel}</StatusBadge>
        <StatusBadge>Bảng chẩn đoán: {showDiagnosticsPanel ? "Hiện" : "Ẩn"}</StatusBadge>
        <StatusBadge>Mật độ: {viewportStatus.densityLabel}</StatusBadge>
        {lastExportStatus ? <StatusBadge>{lastExportStatus}</StatusBadge> : null}
      </div>
      {exportEligibility.svgBlockers.length || exportEligibility.pdfBlockers.length ? (
        <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-sm text-red-950">
          <div className="font-bold">Lỗi chặn xuất</div>
          <ul className="mt-1 grid gap-1">
            {[...exportEligibility.svgBlockers, ...exportEligibility.pdfBlockers].slice(0, 8).map((issue) => (
              <li key={`${issue.code}-${issue.message}`}>
                <span className="font-semibold">{issue.code}</span>: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function NumberInput({
  disabled = false,
  label,
  max,
  min,
  value,
  onChange,
}: {
  disabled?: boolean;
  label: string;
  max: number;
  min: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex min-h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2">
      {label}
      <input
        className="w-24 rounded border border-stone-300 px-2 py-1 disabled:opacity-40"
        disabled={disabled}
        max={max}
        min={min}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

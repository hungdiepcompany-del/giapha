import { getTreePrintCardFontSizeLayoutUnits } from "@/lib/family/print/tree-print-scale"
import type { TreePrintReadabilityLevel } from "@/lib/family/print/tree-print-scale"
import {
  createTreePrintLayoutCandidates,
  type TreePrintLayoutCandidate,
  type TreePrintLayoutCandidateDiagnostics,
} from "@/lib/family/print/tree-print-layout-orientation"
import { validateTreePrintOrientationEdgeStyleParity } from "@/lib/family/print/tree-print-edge-style"
import {
  artboardOrientationMatchesDimensions,
  getTreePrintArtboardOrientationLabel,
  getTreePrintLayoutFlowLabel,
  getTreePrintResolvedOrientationLabel,
  type TreePrintArtboardOrientation,
  type TreePrintLayoutFlow,
  type TreePrintOrientationResolution,
  type TreePrintResolvedOrientation,
} from "@/lib/family/print/tree-print-orientation"
import type { TreePrintDocument } from "@/lib/family/print/tree-print-types"
import {
  fontLayoutUnitToPt,
  layoutUnitToMm,
  mmToLayoutUnit,
} from "@/lib/family/print/tree-print-units"

export const TREE_PRINT_LARGE_FORMAT_ALGORITHM_VERSION = "A17P2P5_TRUE_ORIENTATION_V1"

export type TreePrintProductionMode =
  | "LARGE_FORMAT_FULL_TREE"
  | "LARGE_FORMAT_BRANCH"
  | "ONE_PAGE_OVERVIEW"

export type TreePrintMediaWidthPreset = 1000 | 1200 | 1500 | 1800 | 2000 | "custom"
export type TreePrintLargeFormatOrientation = TreePrintArtboardOrientation
export type TreePrintLargeFormatResolvedOrientation = TreePrintResolvedOrientation
export type TreePrintLargeFormatSizingStrategy = "USE_FULL_ROLL_WIDTH" | "TARGET_FONT_SIZE"
export type TreePrintLargeFormatLengthMode = "AUTO_FROM_CONTENT" | "CUSTOM_LENGTH"
export type TreePrintLargeFormatSafeMarginPreset = 20 | 30 | 50 | 75 | 100 | "custom"
export type TreePrintLargeFormatBleedPreset = 0 | 10 | 20 | 30 | 50 | "custom"
export type TreePrintLargeFormatTargetFontSizePt = 10 | 12 | 14 | 16 | 18 | 20 | 24 | 30

export type TreePrintLargeFormatIssue = {
  code: string
  severity: "warning" | "blocker"
  message: string
}

export type TreePrintLargeFormatViewBox = {
  minX: number
  minY: number
  width: number
  height: number
}

export type TreePrintLargeFormatRectMm = {
  xMm: number
  yMm: number
  widthMm: number
  heightMm: number
}

export type TreePrintLargeFormatCandidateScore = {
  READABILITY_SCORE: number
  LONG_SIDE_LENGTH_SCORE: number
  WHITESPACE_SCORE: number
  EDGE_INTERSECTION_SCORE: number
  EDGE_LENGTH_SCORE: number
  ROLL_UTILIZATION_SCORE: number
  STABILITY_TIE_BREAK: number
  TOTAL_SCORE: number
}

export type TreePrintLargeFormatPlan = {
  algorithmVersion: typeof TREE_PRINT_LARGE_FORMAT_ALGORITHM_VERSION
  layoutAlgorithmVersion: string
  layoutId: string
  mode: Exclude<TreePrintProductionMode, "ONE_PAGE_OVERVIEW">
  mediaWidthMm: number
  requestedOrientation: TreePrintArtboardOrientation
  resolvedOrientation: TreePrintResolvedOrientation
  orientation: TreePrintResolvedOrientation
  layoutFlow: TreePrintLayoutFlow
  orientationResolution: TreePrintOrientationResolution
  sizingStrategy: TreePrintLargeFormatSizingStrategy
  lengthMode: TreePrintLargeFormatLengthMode
  branchNoUpscale: boolean
  maximumUpscaleFontPt: number
  safeMarginMm: number
  bleedMm: number
  targetFontSizePt: TreePrintLargeFormatTargetFontSizePt
  finishedWidthMm: number
  finishedHeightMm: number
  exportWidthMm: number
  exportHeightMm: number
  printableWidthMm: number
  printableHeightMm: number
  treeScale: number
  treeScalePercent: number
  actualFontSizePt: number
  actualCardWidthMm: number
  actualCardHeightMm: number
  treeContentWidthMm: number
  treeContentHeightMm: number
  contentOffsetMm: { xMm: number; yMm: number }
  contentOffsetLayoutUnits: { x: number; y: number }
  viewBox: TreePrintLargeFormatViewBox
  finishedRectMm: TreePrintLargeFormatRectMm
  safeRectMm: TreePrintLargeFormatRectMm
  exportRectMm: TreePrintLargeFormatRectMm
  pageCount: 1
  vectorTree: true
  colorModel: "RGB"
  textOutlined: "NO_UNLESS_VERIFIED"
  fontFamily: string
  peopleCount: number
  familyCount: number
  edgeCount: number
  connectedComponentCount: number
  packedComponentCount: number
  componentOverlapCount: number
  missingComponentCount: number
  componentPackingEfficiency: number
  internalWhitespaceRatio: number
  baselineInternalWhitespaceRatio: number
  packingImprovement: number
  mediaWidthUsagePercent: number
  contentAspectRatio: number
  artboardAspectRatio: number
  layoutCandidateDiagnostics: TreePrintLayoutCandidateDiagnostics
  allCandidateDiagnostics: Record<TreePrintResolvedOrientation, TreePrintLayoutCandidateDiagnostics>
  candidateScores: Record<TreePrintResolvedOrientation, TreePrintLargeFormatCandidateScore>
  document: TreePrintDocument
  readabilityLevel: TreePrintReadabilityLevel
  readabilityLabel: string
  readabilityMessage: string
  blockers: TreePrintLargeFormatIssue[]
  warnings: TreePrintLargeFormatIssue[]
}

export type TreePrintLargeFormatPlanInput = {
  document: TreePrintDocument
  mode: Exclude<TreePrintProductionMode, "ONE_PAGE_OVERVIEW">
  mediaWidthPreset: TreePrintMediaWidthPreset
  customMediaWidthMm: number
  orientation: TreePrintLargeFormatOrientation
  sizingStrategy: TreePrintLargeFormatSizingStrategy
  lengthMode: TreePrintLargeFormatLengthMode
  customLengthMm: number
  targetFontSizePt: TreePrintLargeFormatTargetFontSizePt
  safeMarginPreset: TreePrintLargeFormatSafeMarginPreset
  customSafeMarginMm: number
  bleedPreset: TreePrintLargeFormatBleedPreset
  customBleedMm: number
  branchNoUpscale?: boolean
  maximumUpscaleFontPt?: number
  fontFamily?: string
}

export const TREE_PRINT_PRODUCTION_MODE_OPTIONS: TreePrintProductionMode[] = [
  "LARGE_FORMAT_FULL_TREE",
  "LARGE_FORMAT_BRANCH",
  "ONE_PAGE_OVERVIEW",
]

export const TREE_PRINT_MEDIA_WIDTH_OPTIONS: TreePrintMediaWidthPreset[] = [
  1000,
  1200,
  1500,
  1800,
  2000,
  "custom",
]

export const TREE_PRINT_LARGE_FORMAT_ORIENTATION_OPTIONS: TreePrintLargeFormatOrientation[] = [
  "auto",
  "landscape",
  "portrait",
]

export const TREE_PRINT_LARGE_FORMAT_SIZING_OPTIONS: TreePrintLargeFormatSizingStrategy[] = [
  "USE_FULL_ROLL_WIDTH",
  "TARGET_FONT_SIZE",
]

export const TREE_PRINT_LARGE_FORMAT_LENGTH_MODE_OPTIONS: TreePrintLargeFormatLengthMode[] = [
  "AUTO_FROM_CONTENT",
  "CUSTOM_LENGTH",
]

export const TREE_PRINT_LARGE_FORMAT_TARGET_FONT_OPTIONS: TreePrintLargeFormatTargetFontSizePt[] = [
  10,
  12,
  14,
  16,
  18,
  20,
  24,
  30,
]

export const TREE_PRINT_SAFE_MARGIN_OPTIONS: TreePrintLargeFormatSafeMarginPreset[] = [
  20,
  30,
  50,
  75,
  100,
  "custom",
]

export const TREE_PRINT_BLEED_OPTIONS: TreePrintLargeFormatBleedPreset[] = [
  0,
  10,
  20,
  30,
  50,
  "custom",
]

export const TREE_PRINT_DEFAULT_PRODUCTION_MODE: TreePrintProductionMode = "LARGE_FORMAT_FULL_TREE"
export const TREE_PRINT_DEFAULT_MEDIA_WIDTH_PRESET: TreePrintMediaWidthPreset = 1500
export const TREE_PRINT_DEFAULT_CUSTOM_MEDIA_WIDTH_MM = 1500
export const TREE_PRINT_DEFAULT_LARGE_FORMAT_ORIENTATION: TreePrintLargeFormatOrientation = "auto"
export const TREE_PRINT_DEFAULT_FULL_TREE_SIZING: TreePrintLargeFormatSizingStrategy = "USE_FULL_ROLL_WIDTH"
export const TREE_PRINT_DEFAULT_BRANCH_SIZING: TreePrintLargeFormatSizingStrategy = "TARGET_FONT_SIZE"
export const TREE_PRINT_DEFAULT_LARGE_FORMAT_SIZING: TreePrintLargeFormatSizingStrategy = TREE_PRINT_DEFAULT_FULL_TREE_SIZING
export const TREE_PRINT_DEFAULT_LARGE_FORMAT_LENGTH_MODE: TreePrintLargeFormatLengthMode = "AUTO_FROM_CONTENT"
export const TREE_PRINT_DEFAULT_CUSTOM_LENGTH_MM = 3000
export const TREE_PRINT_DEFAULT_TARGET_FONT_SIZE_PT: TreePrintLargeFormatTargetFontSizePt = 14
export const TREE_PRINT_DEFAULT_BRANCH_TARGET_FONT_SIZE_PT: TreePrintLargeFormatTargetFontSizePt = 18
export const TREE_PRINT_BRANCH_MAX_RECOMMENDED_UPSCALE_FONT_PT = 24
export const TREE_PRINT_DEFAULT_BRANCH_NO_UPSCALE = true
export const TREE_PRINT_DEFAULT_SAFE_MARGIN_PRESET: TreePrintLargeFormatSafeMarginPreset = 50
export const TREE_PRINT_DEFAULT_CUSTOM_SAFE_MARGIN_MM = 50
export const TREE_PRINT_DEFAULT_BLEED_PRESET: TreePrintLargeFormatBleedPreset = 0
export const TREE_PRINT_DEFAULT_CUSTOM_BLEED_MM = 0

const MIN_MEDIA_WIDTH_MM = 500
const MAX_MEDIA_WIDTH_MM = 5000
const MIN_CUSTOM_LENGTH_MM = 500
const MAX_CUSTOM_LENGTH_MM = 20000
const MIN_SAFE_MARGIN_MM = 0
const MAX_SAFE_MARGIN_MM = 300
const MIN_BLEED_MM = 0
const MAX_BLEED_MM = 200
const MIN_SCALE = 0.001

export function getTreePrintProductionModeLabel(mode: TreePrintProductionMode): string {
  if (mode === "LARGE_FORMAT_FULL_TREE") return "Bạt khổ lớn - toàn cây"
  if (mode === "LARGE_FORMAT_BRANCH") return "Bạt khổ lớn - theo nhánh"
  return "Tổng quan kỹ thuật"
}

export function getTreePrintLargeFormatOrientationLabel(
  orientation: TreePrintLargeFormatOrientation,
): string {
  return getTreePrintArtboardOrientationLabel(orientation)
}

export function getTreePrintLargeFormatResolvedOrientationLabel(
  orientation: TreePrintResolvedOrientation,
): string {
  return getTreePrintResolvedOrientationLabel(orientation)
}

export function getTreePrintLargeFormatLayoutFlowLabel(layoutFlow: TreePrintLayoutFlow): string {
  return getTreePrintLayoutFlowLabel(layoutFlow)
}

export function getTreePrintLargeFormatSizingLabel(
  strategy: TreePrintLargeFormatSizingStrategy,
): string {
  if (strategy === "USE_FULL_ROLL_WIDTH") return "Dùng tối đa khổ cuộn"
  return "Ưu tiên cỡ chữ"
}

export function getTreePrintLargeFormatLengthModeLabel(
  mode: TreePrintLargeFormatLengthMode,
): string {
  if (mode === "AUTO_FROM_CONTENT") return "Tự tính theo nội dung"
  return "Chiều dài tùy chỉnh"
}

export function normalizeTreePrintCustomMediaWidth(value: number): number {
  return clampRounded(value, MIN_MEDIA_WIDTH_MM, MAX_MEDIA_WIDTH_MM, TREE_PRINT_DEFAULT_CUSTOM_MEDIA_WIDTH_MM)
}

export function normalizeTreePrintCustomLength(value: number): number {
  return clampRounded(value, MIN_CUSTOM_LENGTH_MM, MAX_CUSTOM_LENGTH_MM, TREE_PRINT_DEFAULT_CUSTOM_LENGTH_MM)
}

export function normalizeTreePrintCustomSafeMargin(value: number): number {
  return clampRounded(value, MIN_SAFE_MARGIN_MM, MAX_SAFE_MARGIN_MM, TREE_PRINT_DEFAULT_CUSTOM_SAFE_MARGIN_MM)
}

export function normalizeTreePrintCustomBleed(value: number): number {
  return clampRounded(value, MIN_BLEED_MM, MAX_BLEED_MM, TREE_PRINT_DEFAULT_CUSTOM_BLEED_MM)
}

export function resolveTreePrintMediaWidthMm(
  preset: TreePrintMediaWidthPreset,
  customMediaWidthMm: number,
): number {
  return preset === "custom" ? normalizeTreePrintCustomMediaWidth(customMediaWidthMm) : preset
}

export function resolveTreePrintSafeMarginMm(
  preset: TreePrintLargeFormatSafeMarginPreset,
  customSafeMarginMm: number,
): number {
  return preset === "custom" ? normalizeTreePrintCustomSafeMargin(customSafeMarginMm) : preset
}

export function resolveTreePrintBleedMm(
  preset: TreePrintLargeFormatBleedPreset,
  customBleedMm: number,
): number {
  return preset === "custom" ? normalizeTreePrintCustomBleed(customBleedMm) : preset
}

export function createTreePrintLargeFormatPlan(
  input: TreePrintLargeFormatPlanInput,
): TreePrintLargeFormatPlan {
  const mediaWidthMm = resolveTreePrintMediaWidthMm(input.mediaWidthPreset, input.customMediaWidthMm)
  const safeMarginMm = resolveTreePrintSafeMarginMm(input.safeMarginPreset, input.customSafeMarginMm)
  const bleedMm = resolveTreePrintBleedMm(input.bleedPreset, input.customBleedMm)
  const customLengthMm = normalizeTreePrintCustomLength(input.customLengthMm)
  const maximumUpscaleFontPt = input.maximumUpscaleFontPt ?? TREE_PRINT_BRANCH_MAX_RECOMMENDED_UPSCALE_FONT_PT
  const branchNoUpscale = input.mode === "LARGE_FORMAT_BRANCH"
    ? input.branchNoUpscale ?? TREE_PRINT_DEFAULT_BRANCH_NO_UPSCALE
    : false
  const candidates = createTreePrintLayoutCandidates(input.document)
  const landscapePlan = buildPlanForCandidate({
    input,
    candidate: candidates.landscape,
    requestedOrientation: input.orientation,
    mediaWidthMm,
    safeMarginMm,
    bleedMm,
    customLengthMm,
    branchNoUpscale,
    maximumUpscaleFontPt,
  })
  const portraitPlan = buildPlanForCandidate({
    input,
    candidate: candidates.portrait,
    requestedOrientation: input.orientation,
    mediaWidthMm,
    safeMarginMm,
    bleedMm,
    customLengthMm,
    branchNoUpscale,
    maximumUpscaleFontPt,
  })
  const scores = {
    landscape: scorePlanCandidate(landscapePlan),
    portrait: scorePlanCandidate(portraitPlan),
  }
  const edgeStyleParity = validateTreePrintOrientationEdgeStyleParity({
    landscapeEdges: landscapePlan.document.edges,
    portraitEdges: portraitPlan.document.edges,
  })
  const selectedOrientation = chooseResolvedOrientation({
    requestedOrientation: input.orientation,
    sourceDocument: input.document,
    landscapePlan,
    portraitPlan,
    scores,
  })
  const selectedPlan = selectedOrientation === "landscape" ? landscapePlan : portraitPlan
  const blockers = [...selectedPlan.blockers]

  if (!edgeStyleParity.valid) {
    blockers.push({
      code: edgeStyleParity.violations[0]?.diagnosticCode ?? "A17P2P6R1_EDGE_STYLE_ORIENTATION_MISMATCH",
      severity: "blocker",
      message: "Kiểu hiển thị quan hệ không nhất quán giữa bản ngang và bản dọc.",
    })
  }

  if (input.orientation !== "auto" && (input.orientation !== selectedOrientation || selectedPlan.blockers.length > 0)) {
    blockers.push({
      code: "REQUESTED_ORIENTATION_UNAVAILABLE",
      severity: "blocker",
      message: "Hướng in được chọn không có layout hợp lệ.",
    })
  }

  const orientationResolution = buildOrientationResolution({
    requestedOrientation: input.orientation,
    selectedPlan,
    scores,
  })

  return {
    ...selectedPlan,
    orientationResolution,
    candidateScores: scores,
    allCandidateDiagnostics: {
      landscape: landscapePlan.layoutCandidateDiagnostics,
      portrait: portraitPlan.layoutCandidateDiagnostics,
    },
    blockers,
  }
}

function buildPlanForCandidate({
  input,
  candidate,
  requestedOrientation,
  mediaWidthMm,
  safeMarginMm,
  bleedMm,
  customLengthMm,
  branchNoUpscale,
  maximumUpscaleFontPt,
}: {
  input: TreePrintLargeFormatPlanInput
  candidate: TreePrintLayoutCandidate
  requestedOrientation: TreePrintArtboardOrientation
  mediaWidthMm: number
  safeMarginMm: number
  bleedMm: number
  customLengthMm: number
  branchNoUpscale: boolean
  maximumUpscaleFontPt: number
}): TreePrintLargeFormatPlan {
  const treeWidthMm = Math.max(1, layoutUnitToMm(candidate.document.bounds.width))
  const treeHeightMm = Math.max(1, layoutUnitToMm(candidate.document.bounds.height))
  const cardFontSizeLayoutUnits = getTreePrintCardFontSizeLayoutUnits(candidate.document.people)
  const baseFontSizePt = Math.max(MIN_SCALE, fontLayoutUnitToPt(cardFontSizeLayoutUnits, 1))
  const targetFontSizePt = branchNoUpscale
    ? Math.min(input.targetFontSizePt, maximumUpscaleFontPt) as TreePrintLargeFormatTargetFontSizePt
    : input.targetFontSizePt
  const targetScale = targetFontSizePt / baseFontSizePt
  const shortTreeMm = candidate.orientation === "landscape" ? treeHeightMm : treeWidthMm
  const printableShortMm = Math.max(1, mediaWidthMm - safeMarginMm * 2)
  const fullRollScale = printableShortMm / Math.max(1, shortTreeMm)
  const treeScale = Math.max(
    MIN_SCALE,
    input.sizingStrategy === "TARGET_FONT_SIZE" ? targetScale : fullRollScale,
  )
  const contentWidthMm = treeWidthMm * treeScale
  const contentHeightMm = treeHeightMm * treeScale
  const requiredWidthMm = contentWidthMm + safeMarginMm * 2
  const requiredHeightMm = contentHeightMm + safeMarginMm * 2
  const requiredShortMm = candidate.orientation === "landscape" ? requiredHeightMm : requiredWidthMm
  const requiredLongMm = candidate.orientation === "landscape" ? requiredWidthMm : requiredHeightMm
  const finishedShortMm = input.sizingStrategy === "USE_FULL_ROLL_WIDTH"
    ? mediaWidthMm
    : Math.min(mediaWidthMm, roundUpToNearest(requiredShortMm, 10))
  const autoLongMm = Math.max(
    roundUpToNearest(requiredLongMm, 10),
    roundUpToNearest(finishedShortMm + 10, 10),
  )
  const requestedLengthMm =
    input.lengthMode === "CUSTOM_LENGTH" ? customLengthMm : autoLongMm
  const finishedWidthMm =
    candidate.orientation === "landscape" ? requestedLengthMm : finishedShortMm
  const finishedHeightMm =
    candidate.orientation === "landscape" ? finishedShortMm : requestedLengthMm
  const exportWidthMm = finishedWidthMm + bleedMm * 2
  const exportHeightMm = finishedHeightMm + bleedMm * 2
  const printableWidthMm = Math.max(1, finishedWidthMm - safeMarginMm * 2)
  const printableHeightMm = Math.max(1, finishedHeightMm - safeMarginMm * 2)
  const contentLeftMm = bleedMm + safeMarginMm + Math.max(0, (printableWidthMm - contentWidthMm) / 2)
  const contentTopMm = bleedMm + safeMarginMm + Math.max(0, (printableHeightMm - contentHeightMm) / 2)
  const viewBox = {
    minX: 0,
    minY: 0,
    width: mmToLayoutUnit(exportWidthMm) / treeScale,
    height: mmToLayoutUnit(exportHeightMm) / treeScale,
  }
  const contentOffsetLayoutUnits = {
    x: mmToLayoutUnit(contentLeftMm) / treeScale - candidate.document.bounds.minX,
    y: mmToLayoutUnit(contentTopMm) / treeScale - candidate.document.bounds.minY,
  }
  const actualFontSizePt = fontLayoutUnitToPt(cardFontSizeLayoutUnits, treeScale)
  const actualCardWidthMm = layoutUnitToMm(candidate.document.people[0]?.width ?? 190) * treeScale
  const actualCardHeightMm = layoutUnitToMm(candidate.document.people[0]?.height ?? 118) * treeScale
  const readability = getLargeFormatReadability(actualFontSizePt)
  const blockers = buildLargeFormatBlockers({
    mediaWidthMm,
    safeMarginMm,
    finishedWidthMm,
    finishedHeightMm,
    exportWidthMm,
    exportHeightMm,
    contentWidthMm,
    contentHeightMm,
    printableWidthMm,
    printableHeightMm,
    requiredShortMm,
    requestedLengthMm,
    autoLengthMm: autoLongMm,
    sizingStrategy: input.sizingStrategy,
    targetFontSizePt,
    actualFontSizePt,
    candidate,
  })
  const warnings = buildLargeFormatWarnings({
    mode: input.mode,
    sizingStrategy: input.sizingStrategy,
    actualFontSizePt,
    maximumUpscaleFontPt,
    requestedOrientation,
    resolvedOrientation: candidate.orientation,
    finishedWidthMm,
    finishedHeightMm,
  })
  const artboardAspectRatio = finishedWidthMm / Math.max(1, finishedHeightMm)
  const contentAspectRatio = candidate.document.bounds.width / Math.max(1, candidate.document.bounds.height)
  const mediaWidthUsagePercent = (
    candidate.orientation === "landscape"
      ? finishedHeightMm / mediaWidthMm
      : finishedWidthMm / mediaWidthMm
  ) * 100

  return {
    algorithmVersion: TREE_PRINT_LARGE_FORMAT_ALGORITHM_VERSION,
    layoutAlgorithmVersion: candidate.layoutAlgorithmVersion,
    layoutId: candidate.id,
    mode: input.mode,
    mediaWidthMm,
    requestedOrientation,
    resolvedOrientation: candidate.orientation,
    orientation: candidate.orientation,
    layoutFlow: candidate.layoutFlow,
    orientationResolution: buildPlaceholderResolution(requestedOrientation, candidate.orientation, candidate.layoutFlow, contentAspectRatio, artboardAspectRatio),
    sizingStrategy: input.sizingStrategy,
    lengthMode: input.lengthMode,
    branchNoUpscale,
    maximumUpscaleFontPt,
    safeMarginMm,
    bleedMm,
    targetFontSizePt,
    finishedWidthMm: roundTo(finishedWidthMm, 1),
    finishedHeightMm: roundTo(finishedHeightMm, 1),
    exportWidthMm: roundTo(exportWidthMm, 1),
    exportHeightMm: roundTo(exportHeightMm, 1),
    printableWidthMm: roundTo(printableWidthMm, 1),
    printableHeightMm: roundTo(printableHeightMm, 1),
    treeScale: roundTo(treeScale, 6),
    treeScalePercent: roundTo(treeScale * 100, 2),
    actualFontSizePt: roundTo(actualFontSizePt, 2),
    actualCardWidthMm: roundTo(actualCardWidthMm, 1),
    actualCardHeightMm: roundTo(actualCardHeightMm, 1),
    treeContentWidthMm: roundTo(contentWidthMm, 1),
    treeContentHeightMm: roundTo(contentHeightMm, 1),
    contentOffsetMm: {
      xMm: roundTo(contentLeftMm, 1),
      yMm: roundTo(contentTopMm, 1),
    },
    contentOffsetLayoutUnits,
    viewBox,
    finishedRectMm: {
      xMm: bleedMm,
      yMm: bleedMm,
      widthMm: roundTo(finishedWidthMm, 1),
      heightMm: roundTo(finishedHeightMm, 1),
    },
    safeRectMm: {
      xMm: bleedMm + safeMarginMm,
      yMm: bleedMm + safeMarginMm,
      widthMm: roundTo(printableWidthMm, 1),
      heightMm: roundTo(printableHeightMm, 1),
    },
    exportRectMm: {
      xMm: 0,
      yMm: 0,
      widthMm: roundTo(exportWidthMm, 1),
      heightMm: roundTo(exportHeightMm, 1),
    },
    pageCount: 1,
    vectorTree: true,
    colorModel: "RGB",
    textOutlined: "NO_UNLESS_VERIFIED",
    fontFamily: input.fontFamily ?? "Arial, Helvetica, sans-serif",
    peopleCount: candidate.document.people.length,
    familyCount: candidate.document.families.length,
    edgeCount: candidate.document.edges.length,
    connectedComponentCount: candidate.document.diagnostics.CONNECTED_COMPONENT_COUNT,
    packedComponentCount: candidate.diagnostics.PACKED_COMPONENT_COUNT,
    componentOverlapCount: candidate.diagnostics.COMPONENT_OVERLAP_COUNT,
    missingComponentCount: candidate.diagnostics.MISSING_COMPONENT_COUNT,
    componentPackingEfficiency: candidate.diagnostics.COMPONENT_PACKING_EFFICIENCY,
    internalWhitespaceRatio: candidate.diagnostics.INTERNAL_WHITESPACE_RATIO,
    baselineInternalWhitespaceRatio: candidate.diagnostics.BASELINE_INTERNAL_WHITESPACE_RATIO,
    packingImprovement: candidate.diagnostics.PACKING_IMPROVEMENT,
    mediaWidthUsagePercent: roundTo(mediaWidthUsagePercent, 2),
    contentAspectRatio: roundTo(contentAspectRatio, 4),
    artboardAspectRatio: roundTo(artboardAspectRatio, 4),
    layoutCandidateDiagnostics: candidate.diagnostics,
    allCandidateDiagnostics: {
      landscape: candidate.orientation === "landscape" ? candidate.diagnostics : candidate.diagnostics,
      portrait: candidate.orientation === "portrait" ? candidate.diagnostics : candidate.diagnostics,
    },
    candidateScores: {
      landscape: emptyScore(),
      portrait: emptyScore(),
    },
    document: candidate.document,
    readabilityLevel: readability.level,
    readabilityLabel: readability.label,
    readabilityMessage: readability.message,
    blockers,
    warnings,
  }
}

function chooseResolvedOrientation({
  requestedOrientation,
  sourceDocument,
  landscapePlan,
  portraitPlan,
  scores,
}: {
  requestedOrientation: TreePrintArtboardOrientation
  sourceDocument: TreePrintDocument
  landscapePlan: TreePrintLargeFormatPlan
  portraitPlan: TreePrintLargeFormatPlan
  scores: Record<TreePrintResolvedOrientation, TreePrintLargeFormatCandidateScore>
}): TreePrintResolvedOrientation {
  if (requestedOrientation === "landscape" || requestedOrientation === "portrait") {
    return requestedOrientation
  }

  const landscapeValid = landscapePlan.blockers.length === 0
  const portraitValid = portraitPlan.blockers.length === 0
  if (landscapeValid && !portraitValid) return "landscape"
  if (portraitValid && !landscapeValid) return "portrait"
  if (landscapeValid && portraitValid) {
    const naturalAspectRatio = sourceDocument.bounds.width / Math.max(1, sourceDocument.bounds.height)
    if (naturalAspectRatio >= 1.08) return "landscape"
    if (naturalAspectRatio <= 0.92) return "portrait"
    return scores.landscape.TOTAL_SCORE >= scores.portrait.TOTAL_SCORE ? "landscape" : "portrait"
  }

  return scores.landscape.TOTAL_SCORE >= scores.portrait.TOTAL_SCORE ? "landscape" : "portrait"
}

function buildOrientationResolution({
  requestedOrientation,
  selectedPlan,
  scores,
}: {
  requestedOrientation: TreePrintArtboardOrientation
  selectedPlan: TreePrintLargeFormatPlan
  scores: Record<TreePrintResolvedOrientation, TreePrintLargeFormatCandidateScore>
}): TreePrintOrientationResolution {
  const orientationMatchesArtboard = artboardOrientationMatchesDimensions(
    selectedPlan.resolvedOrientation,
    selectedPlan.finishedWidthMm,
    selectedPlan.finishedHeightMm,
  )
  const hasBlocker = selectedPlan.blockers.length > 0
  const reasonCode = hasBlocker
    ? "LAYOUT_CANDIDATE_INVALID"
    : requestedOrientation === "auto"
    ? selectedPlan.resolvedOrientation === "landscape"
      ? "AUTO_WIDE_CONTENT_LANDSCAPE"
      : "AUTO_TALL_CONTENT_PORTRAIT"
    : selectedPlan.resolvedOrientation === requestedOrientation
      ? "MANUAL_ORIENTATION_REQUEST"
      : "REQUESTED_ORIENTATION_UNAVAILABLE"
  const reasonMessage = requestedOrientation === "auto"
    ? selectedPlan.resolvedOrientation === "landscape"
      ? "Hệ thống so sánh hai bố cục và chọn ngang vì nội dung tự nhiên rộng hoặc có điểm hình học tốt hơn."
      : "Hệ thống so sánh hai bố cục và chọn dọc vì nội dung tự nhiên cao hoặc có điểm hình học tốt hơn."
    : `Owner chọn ${getTreePrintResolvedOrientationLabel(selectedPlan.resolvedOrientation)}; bố cục ${getTreePrintLayoutFlowLabel(selectedPlan.layoutFlow)} được dùng cho xuất file.`

  return {
    requestedOrientation,
    resolvedOrientation: selectedPlan.resolvedOrientation,
    layoutFlow: selectedPlan.layoutFlow,
    contentAspectRatio: selectedPlan.contentAspectRatio,
    artboardAspectRatio: selectedPlan.artboardAspectRatio,
    orientationMatchesArtboard,
    reasonCode: scores[selectedPlan.resolvedOrientation].TOTAL_SCORE >= 0 ? reasonCode : "LAYOUT_CANDIDATE_INVALID",
    reasonMessage,
  }
}

function buildPlaceholderResolution(
  requestedOrientation: TreePrintArtboardOrientation,
  resolvedOrientation: TreePrintResolvedOrientation,
  layoutFlow: TreePrintLayoutFlow,
  contentAspectRatio: number,
  artboardAspectRatio: number,
): TreePrintOrientationResolution {
  return {
    requestedOrientation,
    resolvedOrientation,
    layoutFlow,
    contentAspectRatio: roundTo(contentAspectRatio, 4),
    artboardAspectRatio: roundTo(artboardAspectRatio, 4),
    orientationMatchesArtboard: true,
    reasonCode: "PENDING_SELECTION",
    reasonMessage: "Đang so sánh ứng viên bố cục.",
  }
}

function scorePlanCandidate(plan: TreePrintLargeFormatPlan): TreePrintLargeFormatCandidateScore {
  const readabilityScore = Math.min(100, plan.actualFontSizePt * 4)
  const longSide = Math.max(plan.finishedWidthMm, plan.finishedHeightMm)
  const longSideLengthScore = Math.max(0, 100 - longSide / 100)
  const whitespaceScore = Math.max(0, 100 - plan.internalWhitespaceRatio * 100)
  const edgeIntersectionScore = Math.max(0, 100 - plan.layoutCandidateDiagnostics.EDGE_CARD_INTERSECTION_COUNT * 8)
  const edgeLengthScore = Math.max(0, 100 - plan.layoutCandidateDiagnostics.TOTAL_EDGE_LENGTH / 1000)
  const rollUtilizationScore = Math.min(100, plan.mediaWidthUsagePercent)
  const stabilityTieBreak = plan.resolvedOrientation === "landscape" ? 0.02 : 0.01
  const total = readabilityScore * 3
    + longSideLengthScore * 2
    + whitespaceScore
    + edgeIntersectionScore
    + edgeLengthScore * 0.5
    + rollUtilizationScore * 0.5
    + stabilityTieBreak

  return {
    READABILITY_SCORE: roundTo(readabilityScore, 4),
    LONG_SIDE_LENGTH_SCORE: roundTo(longSideLengthScore, 4),
    WHITESPACE_SCORE: roundTo(whitespaceScore, 4),
    EDGE_INTERSECTION_SCORE: roundTo(edgeIntersectionScore, 4),
    EDGE_LENGTH_SCORE: roundTo(edgeLengthScore, 4),
    ROLL_UTILIZATION_SCORE: roundTo(rollUtilizationScore, 4),
    STABILITY_TIE_BREAK: stabilityTieBreak,
    TOTAL_SCORE: roundTo(total, 4),
  }
}

function buildLargeFormatBlockers(input: {
  mediaWidthMm: number
  safeMarginMm: number
  finishedWidthMm: number
  finishedHeightMm: number
  exportWidthMm: number
  exportHeightMm: number
  contentWidthMm: number
  contentHeightMm: number
  printableWidthMm: number
  printableHeightMm: number
  requiredShortMm: number
  requestedLengthMm: number
  autoLengthMm: number
  sizingStrategy: TreePrintLargeFormatSizingStrategy
  targetFontSizePt: TreePrintLargeFormatTargetFontSizePt
  actualFontSizePt: number
  candidate: TreePrintLayoutCandidate
}): TreePrintLargeFormatIssue[] {
  const blockers: TreePrintLargeFormatIssue[] = []

  if (!isFinitePositive(input.mediaWidthMm) || !isFinitePositive(input.finishedWidthMm) || !isFinitePositive(input.finishedHeightMm)) {
    blockers.push({
      code: "INVALID_ARTBOARD_DIMENSIONS",
      severity: "blocker",
      message: "Kích thước artboard không hợp lệ.",
    })
  }

  if (!artboardOrientationMatchesDimensions(input.candidate.orientation, input.finishedWidthMm, input.finishedHeightMm)) {
    blockers.push({
      code: "ORIENTATION_DIMENSION_MISMATCH",
      severity: "blocker",
      message: "Nhãn hướng in không khớp kích thước thành phẩm.",
    })
  }

  if (input.safeMarginMm * 2 >= input.mediaWidthMm) {
    blockers.push({
      code: "SAFE_MARGIN_EXCEEDS_MEDIA_WIDTH",
      severity: "blocker",
      message: "Lề an toàn lớn hơn khổ cuộn.",
    })
  }

  if (input.contentWidthMm > input.printableWidthMm + 0.1 || input.contentHeightMm > input.printableHeightMm + 0.1) {
    blockers.push({
      code: "TREE_OUTSIDE_SAFE_AREA",
      severity: "blocker",
      message: "Nội dung cây vượt vùng an toàn của artboard.",
    })
  }

  if (input.sizingStrategy === "TARGET_FONT_SIZE" && input.requiredShortMm > input.mediaWidthMm + 0.1) {
    blockers.push({
      code: "TARGET_SIZE_EXCEEDS_MEDIA_WIDTH",
      severity: "blocker",
      message: "Cỡ chữ mục tiêu cần cạnh ngắn lớn hơn khổ cuộn.",
    })
  }

  if (input.sizingStrategy === "TARGET_FONT_SIZE" && input.actualFontSizePt + 0.05 < input.targetFontSizePt) {
    blockers.push({
      code: "TARGET_FONT_SIZE_NOT_REACHED",
      severity: "blocker",
      message: "Cỡ chữ thực tế thấp hơn mục tiêu đã chọn.",
    })
  }

  if (input.requestedLengthMm + 0.1 < input.autoLengthMm) {
    blockers.push({
      code: "CUSTOM_LENGTH_BELOW_AUTO_LENGTH",
      severity: "blocker",
      message: "Chiều dài tùy chỉnh ngắn hơn chiều dài cần thiết.",
    })
  }

  if (!isFinitePositive(input.exportWidthMm) || !isFinitePositive(input.exportHeightMm)) {
    blockers.push({
      code: "INVALID_EXPORT_DIMENSIONS",
      severity: "blocker",
      message: "Kích thước xuất file không hợp lệ.",
    })
  }

  if (!isFinitePositive(input.contentWidthMm) || !isFinitePositive(input.contentHeightMm)) {
    blockers.push({
      code: "INVALID_TREE_CONTENT_DIMENSIONS",
      severity: "blocker",
      message: "Kích thước nội dung cây không hợp lệ.",
    })
  }

  const diagnostics = input.candidate.diagnostics
  if (diagnostics.NODE_OVERLAP_COUNT > 0) {
    blockers.push({
      code: "PRINT_LAYOUT_NODE_OVERLAP",
      severity: "blocker",
      message: "Bố cục in có thẻ người chồng nhau.",
    })
  }
  if (diagnostics.COMPONENT_OVERLAP_COUNT > 0) {
    blockers.push({
      code: "COMPONENT_PACKING_OVERLAP",
      severity: "blocker",
      message: "Các cụm gia phả bị chồng nhau sau khi đóng gói.",
    })
  }
  if (diagnostics.MISSING_PERSON_COUNT > 0 || diagnostics.DUPLICATE_PERSON_COUNT > 0) {
    blockers.push({
      code: "PRINT_LAYOUT_MISSING_PERSON",
      severity: "blocker",
      message: "Bố cục in thiếu hoặc lặp thẻ người.",
    })
  }
  if (diagnostics.MISSING_EDGE_COUNT > 0 || diagnostics.DUPLICATE_EDGE_COUNT > 0 || diagnostics.DANGLING_EDGE_COUNT > 0) {
    blockers.push({
      code: "PRINT_LAYOUT_MISSING_EDGE",
      severity: "blocker",
      message: "Bố cục in thiếu, lặp hoặc đứt quan hệ.",
    })
  }
  if (diagnostics.INVALID_EDGE_PATH_COUNT > 0 || diagnostics.ZERO_LENGTH_EDGE_COUNT > 0) {
    blockers.push({
      code: "LAYOUT_CANDIDATE_INVALID",
      severity: "blocker",
      message: "Ứng viên bố cục có đường quan hệ không hợp lệ.",
    })
  }

  if (diagnostics.GENERATION_CONSTRAINT_CYCLE_COUNT > 0) {
    blockers.push({
      code: "A17P2P6_GENERATION_CONSTRAINT_CYCLE",
      severity: "blocker",
      message: "Không thể xuất cây gia phả vì ràng buộc thế hệ trong quan hệ gia đình bị mâu thuẫn.",
    })
  }
  if (diagnostics.COUPLE_GENERATION_MISMATCH_COUNT > 0) {
    blockers.push({
      code: "A17P2P6_COUPLE_GENERATION_MISMATCH",
      severity: "blocker",
      message: "Không thể xuất cây gia phả vì có quan hệ vợ chồng không cùng hàng thế hệ.",
    })
  }
  if (diagnostics.COUPLE_LAYOUT_AXIS_MISMATCH_COUNT > 0) {
    blockers.push({
      code: "A17P2P6_COUPLE_LAYOUT_AXIS_MISMATCH",
      severity: "blocker",
      message: "Không thể xuất cây gia phả vì bố cục đặt vợ chồng lệch trục thế hệ.",
    })
  }
  if (diagnostics.COUPLE_POST_PACKING_AXIS_MISMATCH_COUNT > 0) {
    blockers.push({
      code: "A17P2P6_COUPLE_POST_PACKING_AXIS_MISMATCH",
      severity: "blocker",
      message: "Không thể xuất cây gia phả vì đóng gói cụm làm lệch quan hệ vợ chồng.",
    })
  }
  if (diagnostics.COUPLE_CROSS_COMPONENT_INVALID_COUNT > 0) {
    blockers.push({
      code: "A17P2P6_COUPLE_CROSS_COMPONENT_INVALID",
      severity: "blocker",
      message: "Không thể xuất cây gia phả vì quan hệ vợ chồng bị tách khỏi cụm gia đình.",
    })
  }
  if (diagnostics.PRINT_LAYOUT_INVALID_COORDINATE_COUNT > 0 || diagnostics.NON_UNIFORM_COMPONENT_TRANSLATION_COUNT > 0) {
    blockers.push({
      code: "A17P2P6_PRINT_LAYOUT_INVALID_COORDINATE",
      severity: "blocker",
      message: "Không thể xuất cây gia phả vì tọa độ bố cục in không hợp lệ.",
    })
  }

  return blockers
}

function buildLargeFormatWarnings(input: {
  mode: Exclude<TreePrintProductionMode, "ONE_PAGE_OVERVIEW">
  sizingStrategy: TreePrintLargeFormatSizingStrategy
  actualFontSizePt: number
  maximumUpscaleFontPt: number
  requestedOrientation: TreePrintArtboardOrientation
  resolvedOrientation: TreePrintResolvedOrientation
  finishedWidthMm: number
  finishedHeightMm: number
}): TreePrintLargeFormatIssue[] {
  const warnings: TreePrintLargeFormatIssue[] = [
    {
      code: "RGB_ONLY",
      severity: "warning",
      message: "File SVG dùng RGB; nhà in có thể cần tự chuyển đổi màu.",
    },
    {
      code: "FONT_NOT_OUTLINED",
      severity: "warning",
      message: "Text vẫn là chữ sống; kiểm tra font khi bàn giao nhà in.",
    },
    {
      code: "PDF_CUSTOM_SIZE_ONLY_OBSERVED_NOT_UNIVERSAL",
      severity: "warning",
      message: "PDF phụ thuộc trình duyệt; đã quan sát custom size nhưng SVG vẫn là master.",
    },
  ]

  if (input.requestedOrientation === "auto") {
    warnings.push({
      code: "AUTO_ORIENTATION_RECOMMENDATION",
      severity: "warning",
      message: `Auto đề xuất ${getTreePrintResolvedOrientationLabel(input.resolvedOrientation)} theo hình học hiện tại.`,
    })
  }

  if (
    input.mode === "LARGE_FORMAT_BRANCH" &&
    input.sizingStrategy === "USE_FULL_ROLL_WIDTH" &&
    input.actualFontSizePt > input.maximumUpscaleFontPt
  ) {
    warnings.push({
      code: "BRANCH_UPSCALE_EXCEEDS_RECOMMENDED_MAX",
      severity: "warning",
      message: `Nhánh đang phóng lên ${formatNumber(input.actualFontSizePt, 1)} pt, vượt mức khuyến nghị ${input.maximumUpscaleFontPt} pt.`,
    })
  }

  if (Math.max(input.finishedWidthMm, input.finishedHeightMm) >= 6000) {
    warnings.push({
      code: "LARGE_BANNER_LENGTH",
      severity: "warning",
      message: "Chiều dài bạt lớn; nên xác nhận khả năng nhận file và in của nhà in.",
    })
  }

  if (input.actualFontSizePt < 12) {
    warnings.push({
      code: "CLOSE_READING_FONT_SIZE",
      severity: "warning",
      message: "Cỡ chữ phù hợp đọc gần; cân nhắc khổ cuộn lớn hơn nếu treo xem xa.",
    })
  }

  return warnings
}

function getLargeFormatReadability(cardFontSizePt: number): {
  level: TreePrintReadabilityLevel
  label: string
  message: string
} {
  if (cardFontSizePt >= 16) {
    return {
      level: "good",
      label: "Đọc xa tốt",
      message: `Cỡ chữ ${formatNumber(cardFontSizePt, 1)} pt, phù hợp bản treo khổ lớn.`,
    }
  }

  if (cardFontSizePt >= 12) {
    return {
      level: "acceptable",
      label: "Đọc chi tiết",
      message: `Cỡ chữ ${formatNumber(cardFontSizePt, 1)} pt, phù hợp đọc chi tiết ở khoảng gần.`,
    }
  }

  if (cardFontSizePt >= 8) {
    return {
      level: "warning",
      label: "Đọc gần",
      message: `Cỡ chữ ${formatNumber(cardFontSizePt, 1)} pt, chỉ nên dùng khi xem gần.`,
    }
  }

  return {
    level: "unreadable",
    label: "Quá nhỏ",
    message: `Cỡ chữ ${formatNumber(cardFontSizePt, 1)} pt, không phù hợp cho bản bạt.`,
  }
}

function emptyScore(): TreePrintLargeFormatCandidateScore {
  return {
    READABILITY_SCORE: 0,
    LONG_SIDE_LENGTH_SCORE: 0,
    WHITESPACE_SCORE: 0,
    EDGE_INTERSECTION_SCORE: 0,
    EDGE_LENGTH_SCORE: 0,
    ROLL_UTILIZATION_SCORE: 0,
    STABILITY_TIE_BREAK: 0,
    TOTAL_SCORE: 0,
  }
}

function roundUpToNearest(value: number, step: number): number {
  return Math.ceil(value / step) * step
}

function roundTo(value: number, fractionDigits: number): number {
  const factor = 10 ** fractionDigits
  return Math.round(value * factor) / factor
}

function clampRounded(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

function isFinitePositive(value: number) {
  return Number.isFinite(value) && value > 0
}

function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)
}

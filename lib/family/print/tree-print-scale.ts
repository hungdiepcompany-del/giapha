import type { TreePrintPersonNode } from "./tree-print-types"
import {
  calculateTreePrintPrintableArea,
  type TreePrintMarginMm,
  type TreePrintPaperPreset,
} from "./tree-print-paper"
import {
  fontLayoutUnitToPt,
  layoutUnitToMm,
  mmToLayoutUnit,
  TREE_PRINT_LAYOUT_UNITS_PER_CSS_PX,
} from "./tree-print-units"

export type TreePrintScaleMode = "fit-page" | "fit-width" | "manual"
export type TreePrintReadabilityLevel = "good" | "acceptable" | "warning" | "unreadable"

export type TreePrintScaleInput = {
  treeWidthLayoutUnits: number
  treeHeightLayoutUnits: number
  paper: TreePrintPaperPreset
  marginMm: TreePrintMarginMm
  mode: TreePrintScaleMode
  manualScalePercent: number
  cardFontSizeLayoutUnits?: number
  cardWidthLayoutUnits?: number
  cardHeightLayoutUnits?: number
  layoutUnitsPerCssPx?: number
}

export type TreePrintScaleSummary = {
  mode: TreePrintScaleMode
  manualScalePercent: number
  printScale: number
  printScalePercent: number
  fitPageScale: number
  fitWidthScale: number
  contentWidthMm: number
  contentHeightMm: number
  printableWidthMm: number
  printableHeightMm: number
  paperWidthMm: number
  paperHeightMm: number
  pageWidthLayoutUnits: number
  pageHeightLayoutUnits: number
  printableWidthLayoutUnits: number
  printableHeightLayoutUnits: number
  marginLayoutUnits: number
  cardFontSizePt: number
  cardWidthMm: number
  cardHeightMm: number
  readabilityLevel: TreePrintReadabilityLevel
  readabilityLabel: string
  readabilityMessage: string
  isReadable: boolean
  overflowsWidth: boolean
  overflowsHeight: boolean
  estimatedPageCount: 1
}

export const TREE_PRINT_SCALE_MODE_OPTIONS: TreePrintScaleMode[] = ["fit-page", "fit-width", "manual"]
export const TREE_PRINT_DEFAULT_SCALE_MODE: TreePrintScaleMode = "fit-page"
export const TREE_PRINT_MIN_MANUAL_SCALE_PERCENT = 1
export const TREE_PRINT_MAX_MANUAL_SCALE_PERCENT = 100
export const TREE_PRINT_DEFAULT_MANUAL_SCALE_PERCENT = 25
export const TREE_PRINT_BASE_CARD_FONT_SIZE_LAYOUT_UNITS = 14

const READABILITY_THRESHOLDS = {
  good: 9,
  acceptable: 7,
  warning: 5.5,
}

export function getTreePrintScaleModeLabel(mode: TreePrintScaleMode): string {
  switch (mode) {
    case "fit-page":
      return "Vừa một trang"
    case "fit-width":
      return "Vừa chiều rộng"
    case "manual":
      return "Tùy chỉnh"
  }
}

export function normalizeManualScalePercent(value: number): number {
  if (!Number.isFinite(value)) {
    return TREE_PRINT_DEFAULT_MANUAL_SCALE_PERCENT
  }

  return Math.min(
    TREE_PRINT_MAX_MANUAL_SCALE_PERCENT,
    Math.max(TREE_PRINT_MIN_MANUAL_SCALE_PERCENT, Math.round(value)),
  )
}

export function getTreePrintCardFontSizeLayoutUnits(nodes: TreePrintPersonNode[]): number {
  const measured = nodes
    .map((node) => node.height)
    .filter((height) => Number.isFinite(height) && height > 0)
    .sort((a, b) => a - b)

  if (measured.length === 0) {
    return TREE_PRINT_BASE_CARD_FONT_SIZE_LAYOUT_UNITS
  }

  const smallestHeight = measured[0]
  return smallestHeight <= 96 ? 13 : TREE_PRINT_BASE_CARD_FONT_SIZE_LAYOUT_UNITS
}

export function calculateTreePrintScale(input: TreePrintScaleInput): TreePrintScaleSummary {
  const layoutUnitsPerCssPx = input.layoutUnitsPerCssPx ?? TREE_PRINT_LAYOUT_UNITS_PER_CSS_PX
  const printableArea = calculateTreePrintPrintableArea(input.paper, input.marginMm)
  const treeWidthLayoutUnits = Math.max(1, input.treeWidthLayoutUnits)
  const treeHeightLayoutUnits = Math.max(1, input.treeHeightLayoutUnits)
  const treeWidthMm = layoutUnitToMm(treeWidthLayoutUnits, layoutUnitsPerCssPx)
  const treeHeightMm = layoutUnitToMm(treeHeightLayoutUnits, layoutUnitsPerCssPx)

  const fitWidthScale = printableArea.printableWidthMm / treeWidthMm
  const fitHeightScale = printableArea.printableHeightMm / treeHeightMm
  const fitPageScale = Math.min(fitWidthScale, fitHeightScale)
  const manualScalePercent = normalizeManualScalePercent(input.manualScalePercent)

  let printScale = fitPageScale
  if (input.mode === "fit-width") {
    printScale = fitWidthScale
  }
  if (input.mode === "manual") {
    printScale = manualScalePercent / 100
  }

  const contentWidthMm = treeWidthMm * printScale
  const contentHeightMm = treeHeightMm * printScale
  const cardFontSizePt = fontLayoutUnitToPt(
    input.cardFontSizeLayoutUnits ?? TREE_PRINT_BASE_CARD_FONT_SIZE_LAYOUT_UNITS,
    printScale,
    layoutUnitsPerCssPx,
  )
  const cardWidthMm = layoutUnitToMm(input.cardWidthLayoutUnits ?? 190, layoutUnitsPerCssPx) * printScale
  const cardHeightMm = layoutUnitToMm(input.cardHeightLayoutUnits ?? 118, layoutUnitsPerCssPx) * printScale
  const readability = getTreePrintReadability(cardFontSizePt)

  return {
    mode: input.mode,
    manualScalePercent,
    printScale,
    printScalePercent: printScale * 100,
    fitPageScale,
    fitWidthScale,
    contentWidthMm,
    contentHeightMm,
    printableWidthMm: printableArea.printableWidthMm,
    printableHeightMm: printableArea.printableHeightMm,
    paperWidthMm: printableArea.paperWidthMm,
    paperHeightMm: printableArea.paperHeightMm,
    pageWidthLayoutUnits: mmToLayoutUnit(printableArea.paperWidthMm, layoutUnitsPerCssPx) / printScale,
    pageHeightLayoutUnits: mmToLayoutUnit(printableArea.paperHeightMm, layoutUnitsPerCssPx) / printScale,
    printableWidthLayoutUnits: mmToLayoutUnit(printableArea.printableWidthMm, layoutUnitsPerCssPx) / printScale,
    printableHeightLayoutUnits: mmToLayoutUnit(printableArea.printableHeightMm, layoutUnitsPerCssPx) / printScale,
    marginLayoutUnits: mmToLayoutUnit(input.marginMm, layoutUnitsPerCssPx) / printScale,
    cardFontSizePt,
    cardWidthMm,
    cardHeightMm,
    readabilityLevel: readability.level,
    readabilityLabel: readability.label,
    readabilityMessage: readability.message,
    isReadable: readability.isReadable,
    overflowsWidth: contentWidthMm > printableArea.printableWidthMm + 0.1,
    overflowsHeight: contentHeightMm > printableArea.printableHeightMm + 0.1,
    estimatedPageCount: 1,
  }
}

function getTreePrintReadability(cardFontSizePt: number): {
  level: TreePrintReadabilityLevel
  label: string
  message: string
  isReadable: boolean
} {
  if (cardFontSizePt >= READABILITY_THRESHOLDS.good) {
    return {
      level: "good",
      label: "Dễ đọc",
      message: `Cỡ chữ dự kiến ${formatPrintNumber(cardFontSizePt, 1)} pt, phù hợp để đọc trên 1 trang.`,
      isReadable: true,
    }
  }

  if (cardFontSizePt >= READABILITY_THRESHOLDS.acceptable) {
    return {
      level: "acceptable",
      label: "Chấp nhận",
      message: `Cỡ chữ dự kiến ${formatPrintNumber(cardFontSizePt, 1)} pt, có thể đọc nếu cây không quá dày.`,
      isReadable: true,
    }
  }

  if (cardFontSizePt >= READABILITY_THRESHOLDS.warning) {
    return {
      level: "warning",
      label: "Cảnh báo",
      message: `Cỡ chữ dự kiến ${formatPrintNumber(cardFontSizePt, 1)} pt. Nên chọn khổ giấy lớn hơn hoặc dùng mật độ thẻ tối giản.`,
      isReadable: false,
    }
  }

  return {
    level: "unreadable",
    label: "Không đọc được",
    message: `Cỡ chữ dự kiến ${formatPrintNumber(cardFontSizePt, 1)} pt, không nên in toàn cây trên một trang. Chế độ nhiều trang sẽ được bổ sung ở bước tiếp theo.`,
    isReadable: false,
  }
}

export function formatPrintNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)
}

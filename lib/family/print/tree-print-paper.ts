export type TreePrintPaperSize = "A4" | "A3" | "A2" | "A1" | "A0"
export type TreePrintOrientation = "portrait" | "landscape"
export type TreePrintMarginMm = 5 | 10 | 15 | 20 | 25 | 30

export type TreePrintPaperPreset = {
  size: TreePrintPaperSize
  orientation: TreePrintOrientation
  widthMm: number
  heightMm: number
  label: string
}

export type TreePrintPrintableArea = {
  paperWidthMm: number
  paperHeightMm: number
  marginMm: TreePrintMarginMm
  printableWidthMm: number
  printableHeightMm: number
}

export const TREE_PRINT_PAPER_SIZES_MM: Record<TreePrintPaperSize, { widthMm: number; heightMm: number }> = {
  A4: { widthMm: 210, heightMm: 297 },
  A3: { widthMm: 297, heightMm: 420 },
  A2: { widthMm: 420, heightMm: 594 },
  A1: { widthMm: 594, heightMm: 841 },
  A0: { widthMm: 841, heightMm: 1189 },
}

export const TREE_PRINT_PAPER_SIZE_OPTIONS: TreePrintPaperSize[] = ["A4", "A3", "A2", "A1", "A0"]
export const TREE_PRINT_ORIENTATION_OPTIONS: TreePrintOrientation[] = ["landscape", "portrait"]
export const TREE_PRINT_MARGIN_OPTIONS: TreePrintMarginMm[] = [5, 10, 15, 20, 25, 30]

export function getTreePrintPaperPreset(
  size: TreePrintPaperSize,
  orientation: TreePrintOrientation,
): TreePrintPaperPreset {
  const base = TREE_PRINT_PAPER_SIZES_MM[size]
  const widthMm = orientation === "landscape" ? Math.max(base.widthMm, base.heightMm) : Math.min(base.widthMm, base.heightMm)
  const heightMm = orientation === "landscape" ? Math.min(base.widthMm, base.heightMm) : Math.max(base.widthMm, base.heightMm)

  return {
    size,
    orientation,
    widthMm,
    heightMm,
    label: `${size} ${orientation === "landscape" ? "ngang" : "dọc"}`,
  }
}

export function normalizeTreePrintMargin(value: number): TreePrintMarginMm {
  let nearest = TREE_PRINT_MARGIN_OPTIONS[0]
  let nearestDistance = Math.abs(value - nearest)

  for (const option of TREE_PRINT_MARGIN_OPTIONS) {
    const distance = Math.abs(value - option)
    if (distance < nearestDistance) {
      nearest = option
      nearestDistance = distance
    }
  }

  return nearest
}

export function calculateTreePrintPrintableArea(
  paper: TreePrintPaperPreset,
  marginMm: TreePrintMarginMm,
): TreePrintPrintableArea {
  const printableWidthMm = paper.widthMm - marginMm * 2
  const printableHeightMm = paper.heightMm - marginMm * 2

  if (printableWidthMm <= 0 || printableHeightMm <= 0) {
    throw new Error(`Invalid print margin ${marginMm}mm for ${paper.label}`)
  }

  return {
    paperWidthMm: paper.widthMm,
    paperHeightMm: paper.heightMm,
    marginMm,
    printableWidthMm,
    printableHeightMm,
  }
}

export function getTreePrintOrientationLabel(orientation: TreePrintOrientation): string {
  return orientation === "landscape" ? "Ngang" : "Dọc"
}

export function getTreePrintPaperLabel(paper: TreePrintPaperPreset): string {
  return `${paper.size} ${getTreePrintOrientationLabel(paper.orientation).toLowerCase()} (${paper.widthMm} x ${paper.heightMm} mm)`
}

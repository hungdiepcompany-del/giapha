export const TREE_PRINT_MM_PER_INCH = 25.4
export const TREE_PRINT_CSS_PX_PER_INCH = 96
export const TREE_PRINT_PT_PER_INCH = 72

export const TREE_PRINT_LAYOUT_UNITS_PER_CSS_PX = 1

export function mmToCssPx(mm: number): number {
  return (mm / TREE_PRINT_MM_PER_INCH) * TREE_PRINT_CSS_PX_PER_INCH
}

export function cssPxToMm(px: number): number {
  return (px / TREE_PRINT_CSS_PX_PER_INCH) * TREE_PRINT_MM_PER_INCH
}

export function mmToLayoutUnit(
  mm: number,
  layoutUnitsPerCssPx = TREE_PRINT_LAYOUT_UNITS_PER_CSS_PX,
): number {
  return mmToCssPx(mm) * layoutUnitsPerCssPx
}

export function layoutUnitToMm(
  layoutUnit: number,
  layoutUnitsPerCssPx = TREE_PRINT_LAYOUT_UNITS_PER_CSS_PX,
): number {
  return cssPxToMm(layoutUnit / layoutUnitsPerCssPx)
}

export function layoutUnitToPt(
  layoutUnit: number,
  layoutUnitsPerCssPx = TREE_PRINT_LAYOUT_UNITS_PER_CSS_PX,
): number {
  return (layoutUnit / layoutUnitsPerCssPx / TREE_PRINT_CSS_PX_PER_INCH) * TREE_PRINT_PT_PER_INCH
}

export function fontLayoutUnitToPt(
  layoutUnit: number,
  printScale: number,
  layoutUnitsPerCssPx = TREE_PRINT_LAYOUT_UNITS_PER_CSS_PX,
): number {
  return layoutUnitToPt(layoutUnit, layoutUnitsPerCssPx) * printScale
}

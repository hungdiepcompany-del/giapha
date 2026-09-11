import type { TreePrintMarginMm, TreePrintPaperPreset } from "./tree-print-paper"

export type TreePrintPageStyleInput = {
  paper?: TreePrintPaperPreset
  widthMm?: number
  heightMm?: number
  marginMm: TreePrintMarginMm | number
}

export function buildTreePrintPageStyle(input: TreePrintPageStyleInput): string {
  const widthMm = input.widthMm ?? input.paper?.widthMm ?? 210
  const heightMm = input.heightMm ?? input.paper?.heightMm ?? 297
  const size = `${widthMm}mm ${heightMm}mm`

  return `@page { size: ${size}; margin: 0; } @media print { .tree-print-print-sheet { --tree-print-selected-margin: ${input.marginMm}mm; width: ${widthMm}mm; height: ${heightMm}mm; } }`
}

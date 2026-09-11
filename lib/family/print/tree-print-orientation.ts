export type TreePrintArtboardOrientation =
  | "auto"
  | "landscape"
  | "portrait"

export type TreePrintResolvedOrientation = Exclude<TreePrintArtboardOrientation, "auto">

export type TreePrintLayoutFlow =
  | "top-to-bottom"
  | "left-to-right"

export type TreePrintOrientationResolution = {
  requestedOrientation: TreePrintArtboardOrientation
  resolvedOrientation: TreePrintResolvedOrientation
  layoutFlow: TreePrintLayoutFlow
  contentAspectRatio: number
  artboardAspectRatio: number
  orientationMatchesArtboard: boolean
  reasonCode: string
  reasonMessage: string
}

export const TREE_PRINT_ARTBOARD_ORIENTATION_OPTIONS: TreePrintArtboardOrientation[] = [
  "auto",
  "landscape",
  "portrait",
]

export const TREE_PRINT_LAYOUT_FLOW_OPTIONS: TreePrintLayoutFlow[] = [
  "top-to-bottom",
  "left-to-right",
]

export function layoutFlowForResolvedOrientation(
  orientation: TreePrintResolvedOrientation,
): TreePrintLayoutFlow {
  return orientation === "landscape" ? "top-to-bottom" : "left-to-right"
}

export function resolvedOrientationForLayoutFlow(
  layoutFlow: TreePrintLayoutFlow,
): TreePrintResolvedOrientation {
  return layoutFlow === "top-to-bottom" ? "landscape" : "portrait"
}

export function getTreePrintArtboardOrientationLabel(
  orientation: TreePrintArtboardOrientation,
): string {
  if (orientation === "auto") return "Tự động - khuyến nghị"
  return orientation === "landscape" ? "Ngang" : "Dọc"
}

export function getTreePrintResolvedOrientationLabel(
  orientation: TreePrintResolvedOrientation,
): string {
  return orientation === "landscape" ? "Ngang" : "Dọc"
}

export function getTreePrintLayoutFlowLabel(layoutFlow: TreePrintLayoutFlow): string {
  return layoutFlow === "top-to-bottom" ? "Trên xuống" : "Trái sang phải"
}

export function artboardOrientationMatchesDimensions(
  orientation: TreePrintResolvedOrientation,
  widthMm: number,
  heightMm: number,
): boolean {
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm)) return false
  if (widthMm <= 0 || heightMm <= 0) return false
  return orientation === "landscape" ? widthMm > heightMm : heightMm > widthMm
}

export type TreePrintPreviewScaleInput = {
  availableViewportWidth: number
  availableViewportHeight: number
  artboardLogicalWidth: number
  artboardLogicalHeight: number
  fitPadding?: number
  minScale?: number
  maxScale?: number
}

export function calculateTreePrintPreviewScale(input: TreePrintPreviewScaleInput): number {
  const fitPadding = input.fitPadding ?? 0.94
  const minScale = input.minScale ?? 0.005
  const maxScale = input.maxScale ?? 4
  const widthScale = input.availableViewportWidth / Math.max(1, input.artboardLogicalWidth)
  const heightScale = input.availableViewportHeight / Math.max(1, input.artboardLogicalHeight)
  const previewScale = Math.min(widthScale, heightScale) * fitPadding

  if (!Number.isFinite(previewScale)) return minScale
  return Math.min(maxScale, Math.max(minScale, previewScale))
}

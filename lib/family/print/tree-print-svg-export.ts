import { countTreePrintDiagnosticOnlyElements } from "@/lib/family/print/tree-print-edge-style"

export type TreePrintSvgExportOptions = {
  includeDiagnostics?: boolean
  now?: Date
  fileNamePrefix?: string
}

export const TREE_PRINT_SVG_FILENAME_PREFIX = "gia-pha-toan-cay"

export function buildTreePrintSvgFileName(now = new Date(), prefix = TREE_PRINT_SVG_FILENAME_PREFIX): string {
  const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}-${pad2(now.getHours())}${pad2(now.getMinutes())}`

  return `${prefix}-${stamp}.svg`
}

export function sanitizeSerializedTreePrintSvg(
  svgText: string,
  options: Pick<TreePrintSvgExportOptions, "includeDiagnostics"> = {},
): string {
  let safeSvg = svgText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(
      /<g\b[^>]*data-tree-print-export-exclude\b[^>]*>[\s\S]*?<\/g>/gi,
      "",
    )
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s+href\s*=\s*"javascript:[^"]*"/gi, "")
    .replace(/\s+href\s*=\s*'javascript:[^']*'/gi, "")

  if (!options.includeDiagnostics) {
    safeSvg = stripTreePrintDiagnosticElements(safeSvg)
  }

  return safeSvg
}

export function serializeTreePrintSvgElement(
  svgElement: SVGSVGElement,
  options: Pick<TreePrintSvgExportOptions, "includeDiagnostics"> = {},
): string {
  const clone = svgElement.cloneNode(true) as SVGSVGElement
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("version", "1.1")
  clone.setAttribute("role", "img")
  clone.setAttribute("style", "background:#fffaf0")
  clone.removeAttribute("tabindex")
  clone.removeAttribute("class")

  clone.querySelectorAll("[data-tree-print-export-exclude]").forEach((node) => node.remove())

  if (!options.includeDiagnostics) {
    clone.querySelectorAll('[data-tree-print-diagnostics="true"]').forEach((node) => node.remove())
    clone.querySelectorAll('[data-tree-print-diagnostic-only="true"]').forEach((node) => node.remove())
    if (clone.querySelectorAll('[data-tree-print-diagnostics="true"], [data-tree-print-diagnostic-only="true"]').length > 0) {
      throw new Error("A17P2P6R1_DIAGNOSTIC_OVERLAY_LEAKED_TO_EXPORT")
    }
  }

  clone.querySelectorAll("*").forEach((node) => {
    for (const attribute of Array.from(node.attributes)) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.toLowerCase()
      if (name.startsWith("on") || value.startsWith("javascript:")) {
        node.removeAttribute(attribute.name)
      }
      if (name === "class" || name.startsWith("data-tree-print-")) {
        node.removeAttribute(attribute.name)
      }
    }
  })

  const serialized = sanitizeSerializedTreePrintSvg(new XMLSerializer().serializeToString(clone), options)
  if (!options.includeDiagnostics && countTreePrintDiagnosticOnlyElements(serialized) > 0) {
    throw new Error("A17P2P6R1_DIAGNOSTIC_OVERLAY_LEAKED_TO_EXPORT")
  }

  return serialized
}

export function downloadTreePrintSvg(
  svgElement: SVGSVGElement,
  options: TreePrintSvgExportOptions = {},
): string {
  const svgText = serializeTreePrintSvgElement(svgElement, options)
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  const fileName = buildTreePrintSvgFileName(options.now, options.fileNamePrefix)

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return fileName
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0")
}

function stripTreePrintDiagnosticElements(svgText: string): string {
  return svgText
    .replace(
      /<([a-z][\w:-]*)\b[^>]*(?:data-tree-print-diagnostics|data-tree-print-diagnostic-only)="true"[^>]*\/>/gi,
      "",
    )
    .replace(
      /<([a-z][\w:-]*)\b[^>]*(?:data-tree-print-diagnostics|data-tree-print-diagnostic-only)="true"[^>]*>[\s\S]*?<\/\1>/gi,
      "",
    )
}

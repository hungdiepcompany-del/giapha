import type {
  TreePrintLargeFormatIssue,
  TreePrintLargeFormatPlan,
  TreePrintProductionMode,
} from "@/lib/family/print/tree-print-large-format"
import type { TreePrintScaleSummary } from "@/lib/family/print/tree-print-scale"

export type TreePrintIssue = {
  code: string
  severity: "warning" | "blocker"
  message: string
}

export type TreePrintExportEligibility = {
  canExportSvg: boolean
  canPrintPdf: boolean
  svgBlockers: TreePrintIssue[]
  pdfBlockers: TreePrintIssue[]
  warnings: TreePrintIssue[]
}

export type TreePrintPdfCapability = "unknown" | "likely_supported" | "unreliable"

export type TreePrintExportEligibilityInput = {
  mode: TreePrintProductionMode
  largeFormatPlan?: TreePrintLargeFormatPlan | null
  onePageSummary?: TreePrintScaleSummary | null
  svgReady?: boolean
  printDocumentReady?: boolean
  pdfCapability?: TreePrintPdfCapability
}

export function evaluateTreePrintExportEligibility(
  input: TreePrintExportEligibilityInput,
): TreePrintExportEligibility {
  const svgBlockers: TreePrintIssue[] = []
  const pdfBlockers: TreePrintIssue[] = []
  const warnings: TreePrintIssue[] = []

  if (input.mode === "ONE_PAGE_OVERVIEW") {
    addOnePageIssues({ input, svgBlockers, pdfBlockers, warnings })
  } else {
    addLargeFormatIssues({ input, svgBlockers, pdfBlockers, warnings })
  }

  if (input.svgReady === false) {
    svgBlockers.push({
      code: "SVG_EXPORT_NODE_NOT_READY",
      severity: "blocker",
      message: "SVG xuất file chưa sẵn sàng trong DOM.",
    })
  }

  if (input.printDocumentReady === false) {
    pdfBlockers.push({
      code: "PRINT_DOCUMENT_NOT_READY",
      severity: "blocker",
      message: "Tài liệu in chưa sẵn sàng trong DOM.",
    })
  }

  if (input.pdfCapability === "unreliable") {
    pdfBlockers.push({
      code: "BROWSER_PDF_CAPABILITY_UNRELIABLE",
      severity: "blocker",
      message: "Trình duyệt hiện tại chưa chứng minh được PDF đúng kích thước bạt.",
    })
  } else if (input.pdfCapability === "unknown") {
    warnings.push({
      code: "BROWSER_PDF_CAPABILITY_UNKNOWN",
      severity: "warning",
      message: "PDF phụ thuộc hộp thoại in của trình duyệt; SVG vẫn là file bàn giao chính.",
    })
  }

  return {
    canExportSvg: svgBlockers.length === 0,
    canPrintPdf: svgBlockers.length === 0 && pdfBlockers.length === 0,
    svgBlockers,
    pdfBlockers,
    warnings,
  }
}

function addOnePageIssues({
  input,
  svgBlockers,
  pdfBlockers,
  warnings,
}: {
  input: TreePrintExportEligibilityInput
  svgBlockers: TreePrintIssue[]
  pdfBlockers: TreePrintIssue[]
  warnings: TreePrintIssue[]
}) {
  const summary = input.onePageSummary
  if (!summary) {
    const issue = {
      code: "ONE_PAGE_SUMMARY_MISSING",
      severity: "blocker" as const,
      message: "Thiếu thông tin khổ giấy cho chế độ tổng quan.",
    }
    svgBlockers.push(issue)
    pdfBlockers.push(issue)
    return
  }

  if (!isFinitePositive(summary.paperWidthMm) || !isFinitePositive(summary.paperHeightMm)) {
    const issue = {
      code: "INVALID_ONE_PAGE_GEOMETRY",
      severity: "blocker" as const,
      message: "Kích thước giấy một trang không hợp lệ.",
    }
    svgBlockers.push(issue)
    pdfBlockers.push(issue)
  }

  if (!summary.isReadable) {
    warnings.push({
      code: "ONE_PAGE_READABILITY_WARNING",
      severity: "warning",
      message: summary.readabilityMessage,
    })
  }

  if (summary.overflowsWidth || summary.overflowsHeight) {
    warnings.push({
      code: "ONE_PAGE_CONTENT_OVERFLOW",
      severity: "warning",
      message: "Bản tổng quan kỹ thuật có nội dung vượt vùng in; không dùng làm hướng sản xuất chính.",
    })
  }
}

function addLargeFormatIssues({
  input,
  svgBlockers,
  pdfBlockers,
  warnings,
}: {
  input: TreePrintExportEligibilityInput
  svgBlockers: TreePrintIssue[]
  pdfBlockers: TreePrintIssue[]
  warnings: TreePrintIssue[]
}) {
  const plan = input.largeFormatPlan
  if (!plan) {
    const issue = {
      code: "LARGE_FORMAT_PLAN_MISSING",
      severity: "blocker" as const,
      message: "Thiếu kế hoạch artboard khổ bạt.",
    }
    svgBlockers.push(issue)
    pdfBlockers.push(issue)
    return
  }

  for (const blocker of plan.blockers) {
    const issue = toTreePrintIssue(blocker)
    svgBlockers.push(issue)
    pdfBlockers.push(issue)
  }

  for (const warning of plan.warnings) {
    warnings.push(toTreePrintIssue(warning))
  }

  if (plan.pageCount !== 1) {
    const issue = {
      code: "LARGE_FORMAT_PAGE_COUNT_NOT_ONE",
      severity: "blocker" as const,
      message: "Khổ bạt phải xuất đúng một artboard liên tục.",
    }
    svgBlockers.push(issue)
    pdfBlockers.push(issue)
  }

  if (!plan.vectorTree) {
    const issue = {
      code: "VECTOR_TREE_NOT_CONFIRMED",
      severity: "blocker" as const,
      message: "Bản xuất chưa được xác nhận là vector.",
    }
    svgBlockers.push(issue)
    pdfBlockers.push(issue)
  }
}

function toTreePrintIssue(issue: TreePrintLargeFormatIssue): TreePrintIssue {
  return {
    code: issue.code,
    severity: issue.severity,
    message: issue.message,
  }
}

function isFinitePositive(value: number) {
  return Number.isFinite(value) && value > 0
}

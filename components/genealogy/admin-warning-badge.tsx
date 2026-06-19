import type { InlineWarningSeverity } from "@/lib/family/inline-warning-types";

const severityLabels: Record<InlineWarningSeverity, string> = {
  info: "Thông tin",
  warning: "Cảnh báo",
  blocking: "Cần xử lý",
};

const severityClasses: Record<InlineWarningSeverity, string> = {
  info: "border-sky-300 bg-sky-50 text-sky-900",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  blocking: "border-red-300 bg-red-50 text-red-900",
};

export function AdminWarningBadge({
  severity,
}: {
  severity: InlineWarningSeverity;
}) {
  return (
    <span
      className={`inline-flex border px-2 py-1 text-xs font-bold ${severityClasses[severity]}`}
      aria-label={`Mức cảnh báo: ${severityLabels[severity]}`}
    >
      {severityLabels[severity]}
    </span>
  );
}

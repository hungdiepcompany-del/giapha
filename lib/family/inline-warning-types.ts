export const INLINE_WARNING_SEVERITIES = [
  "info",
  "warning",
  "blocking",
] as const;

export type InlineWarningSeverity =
  (typeof INLINE_WARNING_SEVERITIES)[number];

export type InlineAdminWarning = {
  code: string;
  severity: InlineWarningSeverity;
  title: string;
  message: string;
  action: string;
};

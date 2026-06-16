import type { ReactNode } from "react";

type StatusCalloutTone = "info" | "success" | "warning" | "danger";

type StatusCalloutProps = {
  children: ReactNode;
  title?: string;
  tone?: StatusCalloutTone;
  className?: string;
};

const toneClasses: Record<StatusCalloutTone, string> = {
  danger: "border-red-200 bg-red-50 text-red-800",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export function StatusCallout({
  children,
  title,
  tone = "info",
  className = "",
}: StatusCalloutProps) {
  return (
    <div
      className={`border px-4 py-3 text-sm leading-6 ${toneClasses[tone]} ${className}`}
    >
      {title ? <div className="font-bold">{title}</div> : null}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}

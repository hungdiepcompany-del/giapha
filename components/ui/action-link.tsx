import Link from "next/link";
import type { ComponentProps } from "react";

type ActionLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "danger";
};

const variantClasses = {
  danger:
    "border-red-700 bg-white text-red-700 hover:bg-red-50",
  primary:
    "border-slate-900 bg-slate-900 text-white hover:bg-slate-700",
  secondary:
    "border-slate-300 bg-white text-slate-900 hover:border-slate-900 hover:bg-slate-50",
};

export function ActionLink({
  className = "",
  variant = "secondary",
  ...props
}: ActionLinkProps) {
  return (
    <Link
      {...props}
      className={`inline-flex min-h-11 items-center justify-center border px-5 py-3 text-sm font-semibold transition ${variantClasses[variant]} ${className}`}
    />
  );
}

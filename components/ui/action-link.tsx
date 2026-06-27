import Link from "next/link";
import type { ComponentProps } from "react";

type ActionLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "danger";
};

const variantClasses = {
  danger:
    "border-red-700 bg-white text-red-700 hover:bg-red-50",
  primary:
    "border-[#245744] bg-[#245744] text-white hover:bg-[#1f4939]",
  secondary:
    "border-stone-300 bg-white text-stone-900 hover:border-[#245744] hover:bg-[#fffaf0] hover:text-[#245744]",
};

export function ActionLink({
  className = "",
  variant = "secondary",
  ...props
}: ActionLinkProps) {
  return (
    <Link
      {...props}
      className={`inline-flex min-h-11 max-w-full items-center justify-center rounded-md border px-5 py-3 text-center text-sm font-semibold transition ${variantClasses[variant]} ${className}`}
    />
  );
}

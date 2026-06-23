import Link from "next/link";
import type { ComponentProps } from "react";

type ActionLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "danger";
};

const variantClasses = {
  danger:
    "border-red-700 bg-white text-red-700 hover:bg-red-50",
  primary:
    "border-stone-900 bg-stone-900 text-white hover:bg-stone-700",
  secondary:
    "border-stone-300 bg-white text-stone-900 hover:border-stone-900 hover:bg-[#fffaf0]",
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

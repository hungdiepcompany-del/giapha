"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  tone?: "primary" | "dark" | "danger";
  disabled?: boolean;
  className?: string;
};

const toneClasses = {
  danger:
    "border-red-700 bg-red-700 text-white hover:bg-red-800 disabled:border-red-200 disabled:bg-red-200 disabled:text-red-700",
  dark:
    "border-stone-900 bg-stone-900 text-white hover:bg-stone-700 disabled:border-stone-300 disabled:bg-stone-300 disabled:text-stone-600",
  primary:
    "border-[#245744] bg-[#245744] text-white hover:bg-[#1f4939] disabled:border-stone-300 disabled:bg-stone-300 disabled:text-stone-600",
};

export function FormSubmitButton({
  idleLabel,
  pendingLabel,
  tone = "primary",
  disabled = false,
  className = "",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`min-h-12 rounded-lg border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${toneClasses[tone]} ${className}`}
      disabled={disabled || pending}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

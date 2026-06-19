"use client";

import { useFormStatus } from "react-dom";

type LineageSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  disabled?: boolean;
};

const buttonClass =
  "min-h-10 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-600";

export function LineageSubmitButton({
  idleLabel,
  pendingLabel,
  disabled = false,
}: LineageSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={buttonClass} disabled={disabled || pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

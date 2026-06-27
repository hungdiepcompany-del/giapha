import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function EmptyState({ title, description, actions }: EmptyStateProps) {
  return (
    <div className="min-w-0 rounded-md border border-dashed border-stone-300 bg-[#fffaf0] p-4 text-stone-700 shadow-sm sm:p-6">
      <h2 className="break-words text-lg font-bold text-stone-950">{title}</h2>
      <p className="mt-2 text-sm leading-6">{description}</p>
      {actions ? (
        <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">{actions}</div>
      ) : null}
    </div>
  );
}

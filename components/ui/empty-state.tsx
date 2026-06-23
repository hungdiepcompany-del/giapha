import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function EmptyState({ title, description, actions }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-stone-300 bg-[#fffaf0] p-6 text-stone-700 shadow-sm">
      <h2 className="text-lg font-bold text-stone-950">{title}</h2>
      <p className="mt-2 text-sm leading-6">{description}</p>
      {actions ? (
        <div className="mt-5 flex flex-wrap gap-3">{actions}</div>
      ) : null}
    </div>
  );
}

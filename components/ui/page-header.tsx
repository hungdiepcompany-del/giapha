import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-5 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-normal text-[#8a4b2a]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-stone-950 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-base leading-7 text-stone-700 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="grid w-full gap-3 sm:flex sm:flex-wrap md:w-auto md:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

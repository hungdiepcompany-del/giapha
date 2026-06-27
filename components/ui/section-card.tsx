import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <section
      className={`min-w-0 rounded-md border border-stone-200 bg-[#fffaf0] p-4 shadow-sm sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

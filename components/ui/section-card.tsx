import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-amber-900/10 bg-[#fff8e8] p-4 shadow-sm sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

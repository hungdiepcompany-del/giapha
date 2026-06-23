import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <section
      className={`border border-stone-200 bg-[#fffaf0] p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type PublicShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/tree", label: "Cây gia phả" },
];

export function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f4efe6] text-stone-900">
      <header className="border-b border-stone-200 bg-[#fffaf0]/95">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-base font-black uppercase tracking-normal text-stone-950"
          >
            WEB GIA PHẢ
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href
                    ? "border border-stone-900 bg-stone-900 px-3 py-2 text-white"
                    : "border border-stone-200 bg-white px-3 py-2 text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="border border-emerald-800 bg-emerald-800 px-3 py-2 text-white transition hover:bg-emerald-900"
            >
              Vào quản trị
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

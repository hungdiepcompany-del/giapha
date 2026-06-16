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
    <div className="min-h-screen bg-[#f6f7f1] text-slate-900">
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.16em] text-slate-950"
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
                    ? "border border-slate-900 bg-slate-900 px-3 py-2 text-white"
                    : "border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="border border-emerald-700 bg-emerald-700 px-3 py-2 text-white transition hover:bg-emerald-800"
            >
              Đăng nhập quản trị
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

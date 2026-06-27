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
      <header className="border-b border-stone-200 bg-[#fffaf0]/95 shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-base font-black uppercase tracking-normal text-stone-950"
          >
            <span className="flex size-10 items-center justify-center rounded-md border border-[#8a4b2a]/30 bg-[#efe0c8] text-sm text-[#6f3b22]">
              Gia
            </span>
            <span>
              WEB GIA PHẢ
              <span className="block text-xs font-semibold normal-case text-stone-600">
                Lưu giữ ký ức gia đình
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href
                    ? "rounded-md border border-stone-900 bg-stone-900 px-3 py-2 text-white"
                    : "rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="rounded-md border border-emerald-800 bg-emerald-800 px-3 py-2 text-white transition hover:bg-emerald-900"
            >
              Vào quản trị
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-stone-200 bg-[#fffaf0]/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm leading-6 text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Không gian lưu giữ gia phả, câu chuyện và dữ liệu gia đình lâu dài.</p>
          <p className="font-semibold text-stone-800">
            Công khai chỉ đọc, quản trị sau đăng nhập.
          </p>
        </div>
      </footer>
    </div>
  );
}

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
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white/90 shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-3 text-base font-bold tracking-normal text-stone-900"
          >
            <span className="flex size-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-sm font-semibold text-amber-800 shadow-sm">
              Gia
            </span>
            <span className="min-w-0 break-words">
              WEB GIA PHẢ
              <span className="block text-sm font-medium text-stone-600">
                Lưu giữ ký ức gia đình
              </span>
            </span>
          </Link>
          <nav className="grid w-full grid-cols-2 gap-2 text-sm font-semibold sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href
                    ? "inline-flex min-h-11 items-center justify-center rounded-full border border-teal-700 bg-teal-700 px-4 py-2 text-center text-white shadow-sm"
                    : "inline-flex min-h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-center text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-center text-stone-700 shadow-sm transition hover:bg-stone-100 sm:col-span-1"
            >
              Vào quản trị
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-stone-200 bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm leading-6 text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Không gian lưu giữ gia phả, câu chuyện và dữ liệu gia đình lâu dài.
          </p>
          <p className="font-semibold text-stone-800">
            Công khai chỉ đọc, quản trị sau đăng nhập.
          </p>
        </div>
      </footer>
    </div>
  );
}

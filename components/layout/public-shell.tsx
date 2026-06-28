"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type PublicShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/tree", label: "Phả đồ" },
];

export function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();

  return (
    <div
      data-ui-phase="A15A2_VIETNAMESE_TRADITIONAL_GENEALOGY_UI"
      data-public-tree-phase="A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI"
      className="min-h-screen bg-[#f5eddf] text-stone-900"
    >
      <header className="border-b border-amber-900/10 bg-[#fff8e8]/95 shadow-sm">
        <div className="border-b border-amber-900/10 bg-[#7a2f24] px-4 py-2 text-center text-sm font-semibold text-amber-50">
          Không gian từ đường số của dòng họ
        </div>
        <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-3 text-base font-bold tracking-normal text-stone-950"
          >
            <span className="flex size-12 items-center justify-center rounded-md border border-amber-900/20 bg-[#f2dfbd] text-sm font-black text-[#7a2f24] shadow-sm">
              Phả
            </span>
            <span className="min-w-0 break-words">
              WEB GIA PHẢ
              <span className="block text-sm font-semibold text-[#245744]">
                Gìn giữ cội nguồn dòng họ
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
                    ? "inline-flex min-h-11 items-center justify-center rounded-full border border-[#245744] bg-[#245744] px-4 py-2 text-center text-white shadow-sm"
                    : "inline-flex min-h-11 items-center justify-center rounded-full border border-amber-900/10 bg-white/80 px-4 py-2 text-center text-stone-700 transition hover:bg-[#f2dfbd] hover:text-stone-950"
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-full border border-[#7a2f24]/20 bg-white/80 px-4 py-2 text-center text-[#7a2f24] shadow-sm transition hover:bg-[#f2dfbd] sm:col-span-1"
            >
              Quản trị gia phả
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-amber-900/10 bg-[#fff8e8]/85">
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

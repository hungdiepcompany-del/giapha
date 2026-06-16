"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
  userEmail?: string | null;
  roles?: string[];
  permissions?: string[];
};

const navItems = [
  { href: "/admin", label: "Tổng quan", exact: true },
  { href: "/admin/people", label: "Thành viên" },
  { href: "/admin/relationships", label: "Quan hệ gia đình" },
  { href: "/admin/tree", label: "Cây gia phả", exact: true },
  { href: "/admin/tree/edit", label: "Chỉnh sửa cây" },
  { href: "/admin/exports", label: "Backup / Export" },
  { href: "/admin/revisions", label: "Lịch sử chỉnh sửa" },
  { href: "/admin/system/status", label: "Trạng thái hệ thống" },
];

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  userEmail,
  roles = [],
  permissions = [],
}: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link
                href="/admin"
                className="text-sm font-bold uppercase tracking-[0.16em] text-slate-950"
              >
                Quản trị GIA PHẢ
              </Link>
              <p className="mt-2 text-sm text-slate-600">
                Quản lý thành viên, quan hệ, cây gia phả, backup và lịch sử sửa đổi.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                {userEmail ?? "Chưa rõ email"}
              </span>
              <span className="border border-emerald-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-900">
                {roles.length > 0 ? roles.join(", ") : "Chưa có role"}
              </span>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="min-h-10 border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 transition hover:border-slate-900"
                >
                  Đăng xuất
                </button>
              </form>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href, item.exact);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "border border-slate-900 bg-slate-900 px-3 py-2 text-white"
                      : "border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            >
              Public
            </Link>
          </nav>

          <div className="grid gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-3">
            <div>
              <span className="font-bold text-slate-800">User:</span>{" "}
              {userEmail ?? "Không rõ"}
            </div>
            <div>
              <span className="font-bold text-slate-800">Roles:</span>{" "}
              {roles.length > 0 ? roles.join(", ") : "Chưa có role"}
            </div>
            <div>
              <span className="font-bold text-slate-800">Permissions:</span>{" "}
              {permissions.length}
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

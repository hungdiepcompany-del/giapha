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

const navGroups = [
  {
    title: "Làm việc hằng ngày",
    items: [
      { href: "/admin", label: "Tổng quan", exact: true },
      { href: "/admin/people", label: "Thành viên" },
      { href: "/admin/relationships", label: "Quan hệ gia đình" },
      { href: "/admin/genealogy", label: "Gia phả Việt Nam" },
    ],
  },
  {
    title: "Cây gia phả",
    items: [
      { href: "/admin/tree", label: "Xem cây", exact: true },
      { href: "/admin/tree/edit", label: "Chỉnh sửa cây" },
      { href: "/admin/preview/public", label: "Xem thử trang công khai" },
    ],
  },
  {
    title: "An toàn dữ liệu",
    items: [
      { href: "/admin/exports", label: "Sao lưu / Xuất dữ liệu" },
      { href: "/admin/backups", label: "Kiểm tra sao lưu thử" },
      { href: "/admin/revisions", label: "Lịch sử chỉnh sửa" },
      { href: "/admin/system/status", label: "Trạng thái hệ thống" },
    ],
  },
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
    <div className="min-h-screen bg-[#f4efe6] text-stone-900 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-stone-200 bg-[#fffaf0] lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-6 px-5 py-5">
          <div>
            <Link
              href="/admin"
              className="block text-base font-black uppercase tracking-normal text-stone-950"
            >
              Quản trị GIA PHẢ
            </Link>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Quản lý thành viên, quan hệ, cây gia phả, sao lưu và lịch sử sửa đổi.
            </p>
          </div>

          <nav className="grid gap-5 text-sm" aria-label="Điều hướng quản trị">
            {navGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-2 text-xs font-bold uppercase tracking-normal text-stone-500">
                  {group.title}
                </div>
                <div className="grid gap-1">
                  {group.items.map((item) => {
                    const active = isActivePath(pathname, item.href, item.exact);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={
                          active
                            ? "border border-stone-900 bg-stone-900 px-3 py-2 font-bold text-white"
                            : "border border-transparent px-3 py-2 font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-[#f6efe2] hover:text-stone-950"
                        }
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <Link
            href="/"
            className="mt-auto inline-flex min-h-10 items-center justify-center border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-900"
          >
            Trang công khai
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-1 text-sm text-stone-600">
              <div>
                <span className="font-bold text-stone-800">Người dùng:</span>{" "}
                {userEmail ?? "Không rõ"}
              </div>
              <div>
                <span className="font-bold text-stone-800">Vai trò:</span>{" "}
                {roles.length > 0 ? roles.join(", ") : "Chưa có vai trò"}
              </div>
              <div>
                <span className="font-bold text-stone-800">Số quyền:</span>{" "}
                {permissions.length}
              </div>
            </div>
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="min-h-10 border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

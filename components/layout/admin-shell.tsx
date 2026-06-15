import Link from "next/link";
import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
  userEmail?: string | null;
  roles?: string[];
  permissions?: string[];
};

export function AdminShell({
  children,
  userEmail,
  roles = [],
  permissions = [],
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/admin" className="text-sm font-bold uppercase tracking-[0.16em]">
            Quản trị GIA PHẢ
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <Link href="/admin" className="underline">
              Tổng quan
            </Link>
            <Link href="/admin/people" className="underline">
              Thành viên
            </Link>
            <Link href="/admin/relationships" className="underline">
              Quan hệ gia đình
            </Link>
            <Link href="/admin/tree" className="underline">
              Cây gia phả
            </Link>
            <Link href="/admin/tree/edit" className="underline">
              Chỉnh sửa cây
            </Link>
            <Link href="/admin/revisions" className="underline">
              Lịch sử chỉnh sửa
            </Link>
            <Link href="/admin/exports" className="underline">
              Backup / Export
            </Link>
            <Link href="/" className="underline">
              Public
            </Link>
            <form action="/auth/logout" method="post">
              <button type="submit" className="font-semibold underline">
                Đăng xuất
              </button>
            </form>
          </nav>
        </div>
        <div className="mx-auto grid max-w-6xl gap-2 border-t border-slate-100 px-6 py-3 text-sm text-slate-700 sm:grid-cols-3">
          <div>
            <span className="font-semibold">Email:</span>{" "}
            {userEmail ?? "Không rõ"}
          </div>
          <div>
            <span className="font-semibold">Roles:</span>{" "}
            {roles.length > 0 ? roles.join(", ") : "Chưa có role"}
          </div>
          <div>
            <span className="font-semibold">Permissions:</span>{" "}
            {permissions.length > 0 ? permissions.length : 0}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

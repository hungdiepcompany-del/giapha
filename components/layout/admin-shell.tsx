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
    title: "Dòng họ",
    description: "Hồ sơ người, quan hệ và metadata phả hệ.",
    items: [
      {
        href: "/admin",
        label: "Tổng quan",
        description: "Việc chính và lối tắt quản trị",
        exact: true,
      },
      {
        href: "/admin/people",
        label: "Thành viên",
        description: "Tra cứu, thêm và sửa hồ sơ",
      },
      {
        href: "/admin/relationships",
        label: "Quan hệ gia đình",
        description: "Nối cha mẹ, con và quan hệ đôi",
      },
      {
        href: "/admin/genealogy",
        label: "Dòng họ / chi / đời",
        description: "Quản lý metadata gia phả Việt Nam",
      },
    ],
  },
  {
    title: "Phả đồ",
    description: "Xem cây trước, chỉnh sửa khi có chủ đích.",
    items: [
      {
        href: "/admin/tree",
        label: "Xem cây",
        description: "Chế độ chỉ đọc cho toàn bộ cây",
        exact: true,
      },
      {
        href: "/admin/tree/edit",
        label: "Chỉnh sửa cây",
        description: "Lưu bố cục và thêm quan hệ có kiểm tra",
      },
    ],
  },
  {
    title: "Website",
    description: "Kiểm tra trang công khai và xuất dữ liệu.",
    items: [
      {
        href: "/admin/preview/public",
        label: "Xem thử website",
        description: "Kiểm tra dữ liệu đã lọc riêng tư",
      },
      {
        href: "/admin/exports",
        label: "Sao lưu / xuất dữ liệu",
        description: "Tải family.json, GEDCOM, ZIP",
      },
    ],
  },
  {
    title: "Quản trị",
    description: "Theo dõi lịch sử, cảnh báo và dry-run.",
    items: [
      {
        href: "/admin/backups",
        label: "Kiểm tra sao lưu thử",
        description: "Dry-run, không tạo backup thật",
      },
      {
        href: "/admin/revisions",
        label: "Lịch sử chỉnh sửa",
        description: "Xem dấu vết thay đổi dữ liệu",
      },
      {
        href: "/admin/system/status",
        label: "Trạng thái hệ thống",
        description: "Chỉ hiển thị có/không, không lộ secret",
      },
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
    <div className="min-h-screen bg-[#f5eddf] text-stone-900 lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="border-b border-amber-900/10 bg-[#fff8e8] shadow-sm lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-6 px-5 py-5">
          <div>
            <Link
              href="/admin"
              className="flex min-w-0 items-center gap-3 text-base font-black uppercase tracking-normal text-stone-950"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#d8c8ad] bg-[#fbf4e8] text-sm text-[#245744] shadow-sm">
                Phả
              </span>
              <span className="min-w-0 break-words">
                Quản trị GIA PHẢ
                <span className="block text-xs font-semibold normal-case text-stone-600">
                  Sổ gia phả nội bộ
                </span>
              </span>
            </Link>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Quản lý hồ sơ, quan hệ, cây gia phả, sao lưu và lịch sử chỉnh sửa
              trong một không gian trang trọng, dễ dùng.
            </p>
          </div>

          <nav className="grid max-h-[52vh] gap-5 overflow-y-auto pr-1 text-sm lg:max-h-none lg:overflow-visible lg:pr-0" aria-label="Điều hướng quản trị">
            {navGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-2 text-xs font-bold uppercase tracking-normal text-stone-500">
                  {group.title}
                </div>
                <p className="mb-2 text-xs leading-5 text-stone-500">
                  {group.description}
                </p>
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
                            ? "block min-h-11 rounded-lg border border-[#245744] bg-[#245744] px-3 py-2 font-bold text-white shadow-sm"
                            : "block min-h-11 rounded-lg border border-transparent px-3 py-2 font-semibold text-stone-700 transition hover:border-[#d8c8ad] hover:bg-[#f2dfbd] hover:text-stone-950"
                        }
                      >
                        <span className="block">{item.label}</span>
                        <span
                          className={
                            active
                              ? "mt-1 block text-xs font-medium text-emerald-50"
                              : "mt-1 block text-xs font-medium text-stone-500"
                          }
                        >
                          {item.description}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <Link
            href="/"
            className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 transition hover:border-[#245744] hover:text-[#245744]"
          >
            Trang công khai
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-amber-900/10 bg-[#fff8e8]/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="grid min-w-0 gap-1 text-sm text-stone-600">
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
                className="min-h-11 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:border-[#245744] hover:text-[#245744]"
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

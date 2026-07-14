import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import { requirePermission } from "@/lib/permissions/require-permission";

export const dynamic = "force-dynamic";

const finalStateItems = [
  "38 gia đình đang hoạt động",
  "68 quan hệ cha/mẹ đang hoạt động",
  "73 quan hệ con đang hoạt động",
  "Không mất quan hệ con",
  "Không phát hiện chu trình tổ tiên",
  "Bằng chứng thực thi và hoàn tác đã được lưu",
];

export default async function A17QCompletedPage() {
  const context = await requirePermission("relationships.view");

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <PageHeader
          eyebrow="A-17Q"
          title="A-17Q đã hoàn tất"
          description="21 nhóm gia đình trùng lặp đã được đối soát và hợp nhất thành công."
        />

        <div className="mt-6 grid gap-6">
          <StatusCallout tone="success">
            Hoàn tất ngày 14/07/2026.
          </StatusCallout>

          <div className="grid gap-4 rounded-md border border-emerald-200 bg-white p-5 text-sm leading-6 text-stone-800">
            <div className="font-bold text-emerald-900">Kết quả cuối cùng</div>
            <ul className="grid gap-2">
              {finalStateItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-emerald-700">
                    -
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center rounded-md border border-[#245744] bg-[#245744] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4636]"
            >
              Quay lại trang quản trị
            </Link>
            <Link
              href="/admin/tree"
              className="inline-flex min-h-11 items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-[#245744] hover:text-[#245744]"
            >
              Xem cây gia phả
            </Link>
            <Link
              href="/admin/revisions"
              className="inline-flex min-h-11 items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-[#245744] hover:text-[#245744]"
            >
              Xem lịch sử đối soát
            </Link>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

const downloads = [
  {
    href: "/admin/exports/download/json",
    title: "Tải family.json",
    description:
      "Bản JSON đầy đủ để giữ ID ổn định, quan hệ, layout cây và manifest.",
  },
  {
    href: "/admin/exports/download/gedcom",
    title: "Tải family.ged",
    description:
      "GEDCOM cơ bản để chuyển sang phần mềm gia phả khác khi cần.",
  },
  {
    href: "/admin/exports/download/zip",
    title: "Tải full-backup.zip",
    description:
      "Gói backup gồm family.json, family.ged, manifest.json và checksums.json.",
  },
];

export default async function AdminExportsPage() {
  const context = await getPermissionContext();
  const canDownload = context.permissions.includes("exports.download");
  const message =
    context.reason === "missing_supabase_config" ||
    context.reason === "missing_admin_config"
      ? "Chưa cấu hình Supabase."
      : "Bạn chưa có quyền tải export/backup.";

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Export/backup foundation
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Backup / Export
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Supabase là hệ thống vận hành, không phải nơi khóa dữ liệu vĩnh viễn.
            Hãy tải backup định kỳ và lưu ở nhiều nơi độc lập.
          </p>
        </div>

        {!canDownload ? (
          <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {message}
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {downloads.map((download) => (
              <div
                key={download.href}
                className="flex flex-col gap-4 border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    {download.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {download.description}
                  </p>
                </div>
                <Link
                  href={download.href}
                  className="inline-flex min-h-11 items-center justify-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  Tải xuống
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
          <h2 className="font-bold text-slate-950">Import foundation</h2>
          <p className="mt-2">
            Phase 8 chưa bật import đầy đủ. Import chỉ được làm sau khi có kiểm
            tra schema_version, preview thay đổi và xác nhận không ghi đè dữ liệu
            đang chạy.
          </p>
        </div>
      </section>
    </AdminShell>
  );
}

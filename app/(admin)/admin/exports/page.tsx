import { AdminShell } from "@/components/layout/admin-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

const downloads = [
  {
    href: "/admin/exports/download/json",
    title: "family.json",
    description:
      "Backup chính: giữ ID ổn định, quan hệ thật, layout cây và metadata để phục hồi dài hạn.",
  },
  {
    href: "/admin/exports/download/gedcom",
    title: "family.ged",
    description:
      "Bản tương thích để mở bằng phần mềm gia phả khác. GEDCOM không thay thế JSON.",
  },
  {
    href: "/admin/exports/download/zip",
    title: "full-backup.zip",
    description:
      "Gói đầy đủ gồm family.json, family.ged, manifest.json và checksums.json.",
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
        <PageHeader
          eyebrow="Nền tảng xuất dữ liệu / sao lưu"
          title="Sao lưu / Xuất dữ liệu"
          description="Supabase là hệ thống vận hành, nhưng JSON/GEDCOM/ZIP là lớp bảo vệ dữ liệu lâu dài."
        />

        <StatusCallout tone="info" className="mt-6">
          Ưu tiên lưu `family.json` định kỳ. GEDCOM dùng để tương thích, ZIP dùng
          khi cần một gói có manifest và checksum.
        </StatusCallout>

        {!canDownload ? (
          <StatusCallout tone="warning" className="mt-6">
            {message}
          </StatusCallout>
        ) : (
          <div className="mt-6 grid gap-4">
            {downloads.map((download) => (
              <SectionCard
                key={download.href}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    {download.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {download.description}
                  </p>
                </div>
                <ActionLink href={download.href} variant="primary">
                  Tải xuống
                </ActionLink>
              </SectionCard>
            ))}
          </div>
        )}

        <SectionCard className="mt-6 text-sm leading-6 text-slate-700">
          <h2 className="font-bold text-slate-950">Nền tảng nhập dữ liệu</h2>
          <p className="mt-2">
            Nhập dữ liệu hiện chỉ xem trước: đọc schema_version, kiểm tra dữ liệu và
            xung đột. Chưa ghi database, chưa ghi đè dữ liệu thật.
          </p>
          <ActionLink href="/admin/exports/import" className="mt-3">
            Nhập / kiểm tra bản sao lưu JSON
          </ActionLink>
        </SectionCard>
      </section>
    </AdminShell>
  );
}

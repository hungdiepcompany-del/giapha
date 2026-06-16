import { AdminShell } from "@/components/layout/admin-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { requirePermission } from "@/lib/permissions/require-permission";

export const dynamic = "force-dynamic";

const modules = [
  {
    href: "/admin/people",
    title: "Thành viên",
    description: "Tạo, sửa, xóa mềm, khôi phục và xem hồ sơ từng người.",
  },
  {
    href: "/admin/relationships",
    title: "Quan hệ gia đình",
    description: "Nối family, cha mẹ, con và quan hệ đôi.",
  },
  {
    href: "/admin/tree",
    title: "Cây gia phả",
    description: "Xem cây từ dữ liệu thật, không chỉnh sửa ở viewer.",
  },
  {
    href: "/admin/exports",
    title: "Backup / Export",
    description: "Tải JSON/GEDCOM/ZIP và kiểm tra import preview.",
  },
  {
    href: "/admin/revisions",
    title: "Lịch sử chỉnh sửa",
    description: "Xem before/after, diff field và audit trail.",
  },
  {
    href: "/admin/system/status",
    title: "Trạng thái hệ thống",
    description: "Kiểm tra cấu hình dạng yes/no, không hiển thị secret.",
  },
];

export default async function AdminPage() {
  const context = await requirePermission("people.view");

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <PageHeader
          eyebrow="Stable Supabase baseline"
          title="Quản trị GIA PHẢ"
          description="Mốc hiện tại đã smoke test Supabase thật. UI polish chỉ làm rõ luồng sử dụng, không đổi schema hay auth."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <SectionCard key={module.href} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {module.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {module.description}
                </p>
              </div>
              <ActionLink href={module.href} className="mt-auto w-fit">
                Mở module
              </ActionLink>
            </SectionCard>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

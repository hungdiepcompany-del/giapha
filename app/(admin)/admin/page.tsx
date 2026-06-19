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
    description: "Nối đơn vị gia đình, cha mẹ, con và quan hệ đôi.",
  },
  {
    href: "/admin/tree",
    title: "Cây gia phả",
    description: "Xem cây từ dữ liệu thật, không chỉnh sửa ở viewer.",
  },
  {
    href: "/admin/exports",
    title: "Sao lưu / Xuất dữ liệu",
    description: "Tải JSON/GEDCOM/ZIP và kiểm tra nhập dữ liệu dạng xem trước.",
  },
  {
    href: "/admin/backups",
    title: "Kiểm tra sao lưu thử",
    description: "Kiểm tra bảng vận hành dry-run, không tạo bản sao lưu production.",
  },
  {
    href: "/admin/revisions",
    title: "Lịch sử chỉnh sửa",
    description: "Xem trước/sau, khác biệt từng trường và dấu vết kiểm toán.",
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
          eyebrow="Nền tảng Supabase ổn định"
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

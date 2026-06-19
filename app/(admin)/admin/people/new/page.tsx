import { createPersonAction } from "@/app/(admin)/admin/people/actions";
import { AdminShell } from "@/components/layout/admin-shell";
import { PersonForm } from "@/components/people/person-form";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type NewPersonPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewPersonPage({ searchParams }: NewPersonPageProps) {
  const params = await searchParams;
  const context = await getPermissionContext();
  const canCreate = context.permissions.includes("people.create");

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <PageHeader
          eyebrow="Nền tảng quản lý thành viên"
          title="Thêm thành viên"
          description="Nhập thông tin theo từng nhóm để dễ kiểm tra trước khi lưu."
        />
        <div className="mt-6">
          {canCreate ? (
            <PersonForm
              action={createPersonAction}
              error={params.error}
              submitLabel="Tạo thành viên"
            />
          ) : (
            <StatusCallout tone="warning">
              {context.reason === "missing_supabase_config"
                ? "Chưa cấu hình Supabase."
                : "Bạn chưa có quyền tạo thành viên."}
            </StatusCallout>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

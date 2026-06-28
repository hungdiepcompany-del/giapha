import { createPersonAction } from "@/app/(admin)/admin/people/actions";
import { AdminShell } from "@/components/layout/admin-shell";
import { PersonForm } from "@/components/people/person-form";
import { ActionLink } from "@/components/ui/action-link";
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
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <PageHeader
          eyebrow="Phiếu ghi thông tin gia tộc"
          title="Thêm thành viên"
          description="Nhập thông tin theo từng nhóm, ưu tiên dữ liệu đã chắc chắn. Các mục chưa rõ có thể bổ sung sau."
          actions={<ActionLink href="/admin/people">Quay lại</ActionLink>}
        />
        <div className="mt-6">
          {canCreate ? (
            <PersonForm
              action={createPersonAction}
              error={params.error}
              submitLabel="Thêm thành viên"
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

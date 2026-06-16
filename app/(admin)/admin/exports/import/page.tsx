import { JsonImportPreviewForm } from "@/components/imports/json-import-preview-form";
import { AdminShell } from "@/components/layout/admin-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const context = await getPermissionContext();
  const configMissing =
    context.reason === "missing_supabase_config" ||
    context.reason === "missing_admin_config";
  const canPreview = configMissing || context.permissions.includes("imports.create");
  const message = configMissing
    ? "Chưa cấu hình Supabase. Trang vẫn cho kiểm tra cấu trúc JSON, nhưng không kiểm tra conflict DB."
    : !context.user
      ? "Bạn cần đăng nhập để kiểm tra import."
      : "Bạn chưa có quyền imports.create.";

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Import JSON foundation"
          title="Kiểm tra backup JSON"
          description="Upload hoặc paste family.json để preview schema, quan hệ, vòng tổ tiên và conflict. Import confirm vẫn disabled."
          actions={<ActionLink href="/admin/exports">Quay lại Backup / Export</ActionLink>}
        />

        {!canPreview ? (
          <StatusCallout tone="warning" className="mt-6">
            {message}
          </StatusCallout>
        ) : (
          <div className="mt-6">
            <StatusCallout tone={configMissing ? "warning" : "info"} className="mb-6">
              {configMissing
                ? message
                : "Preview không ghi dữ liệu vào database. Chỉ bật import thật sau khi có transaction, validation final và log an toàn."}
            </StatusCallout>
            <JsonImportPreviewForm />
          </div>
        )}
      </section>
    </AdminShell>
  );
}

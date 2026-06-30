import { JsonImportPreviewForm } from "@/components/imports/json-import-preview-form";
import { GiaPha4ImportPreviewForm } from "@/components/imports/giapha4-import-preview-form";
import { ImportSessionManifestPanel } from "@/components/imports/import-session-manifest-panel";
import { AdminShell } from "@/components/layout/admin-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import {
  getImportManifest,
  listImportSessions,
} from "@/lib/import/giapha4/manifest-read-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const context = await getPermissionContext();
  const configMissing =
    context.reason === "missing_supabase_config" ||
    context.reason === "missing_admin_config";
  const canPreview = configMissing || context.permissions.includes("imports.create");
  const message = configMissing
    ? "Chưa cấu hình Supabase. Trang vẫn cho kiểm tra cấu trúc JSON, nhưng không kiểm tra xung đột DB."
    : !context.user
      ? "Bạn cần đăng nhập để kiểm tra nhập dữ liệu."
      : "Bạn chưa có quyền imports.create.";
  const importSessionsResult = canPreview
    ? await listImportSessions()
    : null;
  const importManifestResult = importSessionsResult?.sessions[0]
    ? await getImportManifest(importSessionsResult.sessions[0].id)
    : importSessionsResult;

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Nền tảng nhập JSON"
          title="Kiểm tra backup JSON"
          description="Tải lên hoặc dán nội dung family.json để xem trước schema, quan hệ, vòng tổ tiên và xung đột. Xác nhận nhập dữ liệu vẫn đang tắt."
          actions={<ActionLink href="/admin/exports">Quay lại Sao lưu / Xuất dữ liệu</ActionLink>}
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
                : "Xem trước không ghi dữ liệu vào database. Chỉ bật nhập dữ liệu thật sau khi có giao dịch, kiểm tra cuối và log an toàn."}
            </StatusCallout>
            <div className="grid gap-8">
              {importManifestResult ? (
                <ImportSessionManifestPanel result={importManifestResult} />
              ) : null}
              <GiaPha4ImportPreviewForm />
              <JsonImportPreviewForm />
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

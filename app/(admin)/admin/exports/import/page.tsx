import { JsonImportPreviewForm } from "@/components/imports/json-import-preview-form";
import { GiaPha4ImportPreviewForm } from "@/components/imports/giapha4-import-preview-form";
import { GiaPha4ManifestUploadForm } from "@/components/imports/giapha4-manifest-upload-form";
import { ImportSessionManifestPanel } from "@/components/imports/import-session-manifest-panel";
import { AdminShell } from "@/components/layout/admin-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import { getImportManifest } from "@/lib/import/giapha4/manifest-read-service";
import { A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID } from "@/lib/import/giapha4/official-import-service";
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
  const importManifestResult = canPreview
    ? await getImportManifest(A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID)
    : null;
  const strictOfficialImportPermissions = [
    "imports.create",
    "people.create",
    "relationships.create",
    "permissions.manage",
  ] as const;
  const roleCodes = context.roles.map((role) => role.code);
  const missingStrictPermissions = strictOfficialImportPermissions.filter(
    (permission) => !context.permissions.includes(permission),
  );
  const hasOwnerAdminRole = roleCodes.some(
    (role) => role === "OWNER" || role === "ADMIN",
  );
  const a16rPermissionDiagnostic = {
    accountEmail: context.user?.email ?? null,
    userId: context.user?.id ?? null,
    profileId: context.profile?.id ?? null,
    roles: roleCodes,
    visiblePermissionCount: context.permissions.length,
    hasImportsCreate: context.permissions.includes("imports.create"),
    hasPermissionsManage: context.permissions.includes("permissions.manage"),
    hasOwnerAdminRole,
    qualifiesOwnerAdminImportContext:
      hasOwnerAdminRole && missingStrictPermissions.length === 0,
    missingStrictPermissions,
    contextReason: context.reason,
  };

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader
          eyebrow="Nhập dữ liệu an toàn"
          title="Kiểm tra và staging dữ liệu nhập"
          description="Tải lên Gia Phả 4 hoặc kiểm tra family.json trong vùng an toàn. Xác nhận nhập dữ liệu chính thức vẫn đang tắt."
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
            <StatusCallout tone="info" className="mb-6">
              Phiên đang rà soát cho A-16R là phiên đã kiểm toán:{" "}
              {A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}. Không dùng phiên mới nhất
              hoặc family.json backup làm cổng nhập chính thức.
            </StatusCallout>
            <div className="grid gap-8">
              <GiaPha4ManifestUploadForm />
              {importManifestResult ? (
                <ImportSessionManifestPanel
                  result={importManifestResult}
                  a16rPermissionDiagnostic={a16rPermissionDiagnostic}
                />
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

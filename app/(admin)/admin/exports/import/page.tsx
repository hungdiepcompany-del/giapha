import { JsonImportPreviewForm } from "@/components/imports/json-import-preview-form";
import { GiaPha4ImportPreviewForm } from "@/components/imports/giapha4-import-preview-form";
import { GiaPha4ManifestUploadForm } from "@/components/imports/giapha4-manifest-upload-form";
import { ImportSessionManifestPanel } from "@/components/imports/import-session-manifest-panel";
import { AdminShell } from "@/components/layout/admin-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import { getImportManifest } from "@/lib/import/giapha4/manifest-read-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

const HISTORICAL_A16R_AUDIT_SESSION_ID =
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

type AdminImportPageProps = {
  searchParams?: Promise<{
    sessionId?: string | string[];
  }>;
};

function firstSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeImportSessionId(value: string | string[] | undefined) {
  const raw = firstSearchParam(value)?.trim() ?? null;
  if (!raw) return { raw, sessionId: null, invalid: false };

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      raw,
    );

  return {
    raw,
    sessionId: isUuid ? raw : null,
    invalid: !isUuid,
  };
}

export default async function AdminImportPage({
  searchParams,
}: AdminImportPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedSession = normalizeImportSessionId(
    resolvedSearchParams?.sessionId,
  );
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
  const importManifestResult =
    canPreview && selectedSession.sessionId
      ? await getImportManifest(selectedSession.sessionId)
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
          description="Tải lên Gia Phả 4 theo session staging rõ ràng. Xác nhận nhập chính thức vẫn khóa trong phase này."
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
                : "Preview chỉ đọc staging/import metadata. Không tạo thành viên, quan hệ, layout cây, revision hoặc official import."}
            </StatusCallout>

            {selectedSession.invalid ? (
              <StatusCallout tone="warning" className="mb-6">
                Session ID trong URL không hợp lệ. Trang không tự chọn phiên mới
                nhất và không đọc session lịch sử thay thế.
              </StatusCallout>
            ) : null}

            {!selectedSession.sessionId && !selectedSession.invalid ? (
              <StatusCallout tone="info" className="mb-6">
                Chưa chọn phiên nhập. Sau khi upload staging thành công, trang sẽ
                chuyển sang URL có sessionId cụ thể. Refresh, tab mới và
                back/forward đều dựa trên session trong URL.
              </StatusCallout>
            ) : null}

            <div className="grid gap-8">
              <GiaPha4ManifestUploadForm />
              {importManifestResult ? (
                <ImportSessionManifestPanel
                  result={importManifestResult}
                  currentSessionId={selectedSession.sessionId}
                  a16rPermissionDiagnostic={a16rPermissionDiagnostic}
                />
              ) : null}

              <details className="rounded-lg border border-stone-200 bg-white p-5">
                <summary className="cursor-pointer text-sm font-semibold text-stone-950">
                  Công cụ cũ và lịch sử kiểm toán
                </summary>
                <div className="mt-4 grid gap-6">
                  <StatusCallout tone="info">
                    Session A-16R lịch sử {HISTORICAL_A16R_AUDIT_SESSION_ID} chỉ
                    là bằng chứng kiểm toán. Workflow runtime hiện tại không dùng
                    session này làm gate.
                  </StatusCallout>
                  <GiaPha4ImportPreviewForm />
                  <JsonImportPreviewForm />
                </div>
              </details>
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

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
    ? "Chua cau hinh Supabase. Trang van cho kiem tra cau truc JSON, nhung khong kiem tra xung dot DB."
    : !context.user
      ? "Ban can dang nhap de kiem tra nhap du lieu."
      : "Ban chua co quyen imports.create.";
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
          eyebrow="Nhap du lieu an toan"
          title="Kiem tra va staging du lieu nhap"
          description="Tai len Gia Pha 4 theo session staging ro rang. Xac nhan nhap chinh thuc van khoa trong phase nay."
          actions={<ActionLink href="/admin/exports">Quay lai Sao luu / Xuat du lieu</ActionLink>}
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
                : "Preview chi doc staging/import metadata, không ghi dữ liệu. Khong tao thanh vien, quan he, layout cay, revision hoac official import."}
            </StatusCallout>

            {selectedSession.invalid ? (
              <StatusCallout tone="warning" className="mb-6">
                Session ID trong URL khong hop le. Trang khong tu chon phien moi
                nhat va khong doc session lich su thay the.
              </StatusCallout>
            ) : null}

            {!selectedSession.sessionId && !selectedSession.invalid ? (
              <StatusCallout tone="info" className="mb-6">
                Chua chon phien nhap. Sau khi upload staging thanh cong, trang se
                chuyen sang URL co sessionId cu the. Refresh, tab moi va
                back/forward deu dua tren session trong URL.
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
                  Cong cu cu va lich su kiem toan
                </summary>
                <div className="mt-4 grid gap-6">
                  <StatusCallout tone="info">
                    Session A-16R lich su {HISTORICAL_A16R_AUDIT_SESSION_ID} chi
                    la bang chung kiem toan. Workflow runtime hien tai khong dung
                    session nay lam gate.
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

import { redirect } from "next/navigation";

import { BackupOperatorDryRunPanel } from "@/components/admin/backup-operator-dry-run-panel";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

export const BACKUP_OPERATOR_UI_PERMISSION_GUARD =
  "BACKUP_OPERATOR_UI_PERMISSION_GUARD";

const REQUIRED_VIEW_PERMISSION = "backup.operator.view";
const FALLBACK_VIEW_PERMISSION = "permissions.manage";

type BackupOperatorViewPermission =
  | typeof REQUIRED_VIEW_PERMISSION
  | typeof FALLBACK_VIEW_PERMISSION;

function encodeReason(reason: string) {
  return encodeURIComponent(reason.replace(/\s+/g, "_").toLowerCase());
}

export default async function AdminBackupsPage() {
  const context = await getPermissionContext();

  if (!context.user) {
    redirect(`/auth/login?reason=${encodeReason(context.reason ?? "login_required")}`);
  }

  const permissions = context.permissions as readonly string[];
  const hasRequiredPermission = permissions.includes(REQUIRED_VIEW_PERMISSION);
  const hasFallbackPermission = permissions.includes(FALLBACK_VIEW_PERMISSION);

  if (!hasRequiredPermission && !hasFallbackPermission) {
    redirect("/unauthorized?reason=missing_backup_operator_view");
  }

  const permissionSource: BackupOperatorViewPermission = hasRequiredPermission
    ? REQUIRED_VIEW_PERMISSION
    : FALLBACK_VIEW_PERMISSION;

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <PageHeader
          eyebrow="Kiểm tra thử cho vận hành sao lưu"
          title="Kiểm tra sao lưu thử"
          description="Bảng vận hành dùng để kiểm tra contract dry-run của dịch vụ sao lưu nội bộ. Trang này không tạo bản sao lưu production, không tải lên storage, không phục hồi dữ liệu và không gọi Worker thật."
        />

        <StatusCallout tone="warning" className="mt-6">
          Chỉ kiểm tra thử. Không tạo bản sao lưu production. Không tải lên storage.
          Không phục hồi dữ liệu. Không gọi Worker thật.
        </StatusCallout>

        <div className="mt-6">
          <BackupOperatorDryRunPanel
            permissionGuard={BACKUP_OPERATOR_UI_PERMISSION_GUARD}
            permissionSource={permissionSource}
          />
        </div>
      </section>
    </AdminShell>
  );
}

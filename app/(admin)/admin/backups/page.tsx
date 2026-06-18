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
          eyebrow="Backup operator dry-run"
          title="Backup dry-run"
          description="Operator panel for checking the local backup service dry-run contract. This page does not create production backup, upload storage, restore data or call the real worker."
        />

        <StatusCallout tone="warning" className="mt-6">
          Dry-run only. No production backup. No storage upload. No restore. No
          real worker call.
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

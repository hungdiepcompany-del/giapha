import { BackupOperatorDryRunPanel } from "@/components/admin/backup-operator-dry-run-panel";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import { requirePermission } from "@/lib/permissions/require-permission";

export const dynamic = "force-dynamic";

export default async function AdminBackupsPage() {
  const context = await requirePermission("exports.download");

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
          <BackupOperatorDryRunPanel />
        </div>
      </section>
    </AdminShell>
  );
}

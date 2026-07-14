import { A17QAuthenticatedDryRunClient } from "@/components/reconciliation/a17q-authenticated-dry-run-client";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import {
  A17Q_AUTHENTICATED_DRY_RUN_PAGE,
  A17Q_AUTHENTICATED_DRY_RUN_ROUTE,
  A17Q_AUTHENTICATED_DRY_RUN_RPC_NAME,
  getA17QAuthenticatedDryRunGate,
} from "@/lib/reconciliation/a17q-authenticated-dry-run";

export const dynamic = "force-dynamic";

export default async function A17QAuthenticatedDryRunPage() {
  const gate = await getA17QAuthenticatedDryRunGate();

  return (
    <AdminShell
      userEmail={gate.userEmail}
      roles={gate.roles}
      permissions={gate.permissions}
    >
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <PageHeader
          eyebrow="A-17Q"
          title="Authenticated reconciliation dry-run"
          description="Owner/admin cookie-session caller for the A-17Q dry-run RPC. The non-dry-run branch is not exposed from this page."
        />

        <div className="mt-6 grid gap-6">
          <StatusCallout tone={gate.canRunDryRun ? "success" : "warning"}>
            ROUTE={A17Q_AUTHENTICATED_DRY_RUN_PAGE}; RPC=
            {A17Q_AUTHENTICATED_DRY_RUN_RPC_NAME}; DRY_RUN_ONLY=YES
          </StatusCallout>

          <A17QAuthenticatedDryRunClient
            endpoint={A17Q_AUTHENTICATED_DRY_RUN_ROUTE}
            gate={gate}
          />
        </div>
      </section>
    </AdminShell>
  );
}

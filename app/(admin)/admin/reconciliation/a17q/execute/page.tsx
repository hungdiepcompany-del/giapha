import { A17QAuthenticatedExecutionClient } from "@/components/reconciliation/a17q-authenticated-execution-client";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import {
  A17Q_AUTHENTICATED_EXECUTION_CONFIRMATION_PHRASE,
  A17Q_AUTHENTICATED_EXECUTION_PAGE,
  A17Q_AUTHENTICATED_EXECUTION_ROUTE,
  A17Q_AUTHENTICATED_EXECUTION_RPC_NAME,
  getA17QAuthenticatedExecutionGate,
} from "@/lib/reconciliation/a17q-authenticated-execution";

export const dynamic = "force-dynamic";

export default async function A17QAuthenticatedExecutionPage() {
  const gate = await getA17QAuthenticatedExecutionGate();

  return (
    <AdminShell
      userEmail={gate.userEmail}
      roles={gate.roles}
      permissions={gate.permissions}
    >
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <PageHeader
          eyebrow="A-17Q"
          title="Authenticated reconciliation execution"
          description="Owner/admin cookie-session caller for one approved A-17Q reconciliation execution. The RPC is never called on page load."
        />

        <div className="mt-6 grid gap-6">
          <StatusCallout tone={gate.canRunExecution ? "warning" : "danger"}>
            ROUTE={A17Q_AUTHENTICATED_EXECUTION_PAGE}; RPC=
            {A17Q_AUTHENTICATED_EXECUTION_RPC_NAME}; DRY_RUN_ONLY=NO;
            PAGE_LOAD_RPC_CALL_COUNT=0
          </StatusCallout>

          <A17QAuthenticatedExecutionClient
            endpoint={A17Q_AUTHENTICATED_EXECUTION_ROUTE}
            confirmationPhrase={A17Q_AUTHENTICATED_EXECUTION_CONFIRMATION_PHRASE}
            gate={gate}
          />
        </div>
      </section>
    </AdminShell>
  );
}

import { A17QAuthenticatedExecutionClient } from "@/components/reconciliation/a17q-authenticated-execution-client";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import {
  A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES,
  A17Q_AUTHENTICATED_EXECUTION_CONFIRMATION_PHRASE,
  A17Q_AUTHENTICATED_EXECUTION_IDEMPOTENCY_KEY,
  A17Q_AUTHENTICATED_EXECUTION_OWNER_APPROVAL_MARKER,
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

          <div className="grid gap-4 rounded-md border border-red-200 bg-white p-4 text-sm leading-6 text-stone-800">
            <div className="font-bold text-red-800">
              Immutable execution contract
            </div>
            <div className="grid gap-2 font-mono text-xs">
              <div className="break-all">
                OWNER_APPROVAL_MARKER=
                {A17Q_AUTHENTICATED_EXECUTION_OWNER_APPROVAL_MARKER}
              </div>
              <div className="break-all">
                DECISION_PACK_SHA256=
                {A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES.decisionPackSha256}
              </div>
              <div className="break-all">
                APPROVED_GROUP_PLAN_SHA256=
                {
                  A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES
                    .approvedGroupPlanSha256
                }
              </div>
              <div className="break-all">
                ROLE_CORRECTION_PLAN_SHA256=
                {
                  A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES
                    .roleCorrectionPlanSha256
                }
              </div>
              <div className="break-all">
                EXCLUDED_SCOPE_SHA256=
                {A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES.excludedScopeSha256}
              </div>
              <div className="break-all">
                FORECAST_SHA256=
                {A17Q_AUTHENTICATED_EXECUTION_APPROVED_HASHES.forecastSha256}
              </div>
              <div className="break-all">
                EXECUTION_IDEMPOTENCY_KEY=
                {A17Q_AUTHENTICATED_EXECUTION_IDEMPOTENCY_KEY}
              </div>
              <div>P_DRY_RUN_ONLY=false</div>
            </div>
            <div className="grid gap-1 rounded-md bg-stone-100 p-3 font-mono text-xs text-stone-800">
              <div>EXPECTED_GROUP_COUNT=21</div>
              <div>EXPECTED_SURVIVOR_COUNT=21</div>
              <div>EXPECTED_VOID_FAMILY_COUNT=36</div>
              <div>EXPECTED_CHILD_MOVE_COUNT=36</div>
              <div>EXPECTED_PARENT_DEACTIVATION_COUNT=72</div>
              <div>EXPECTED_CHILD_LOSS_COUNT=0</div>
              <div>EXPECTED_POST_STATE=38 / 68 / 73</div>
            </div>
          </div>

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

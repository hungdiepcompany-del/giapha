"use client";

import { useState } from "react";

import type {
  A17QAuthenticatedDryRunGate,
  A17QAuthenticatedDryRunResult,
} from "@/lib/reconciliation/a17q-authenticated-dry-run";

type A17QDryRunClientProps = {
  endpoint: string;
  gate: A17QAuthenticatedDryRunGate;
};

function summarizeBool(value: boolean) {
  return value ? "YES" : "NO";
}

export function A17QAuthenticatedDryRunClient({
  endpoint,
  gate,
}: A17QDryRunClientProps) {
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<A17QAuthenticatedDryRunResult | null>(
    null,
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const canSubmit = gate.canRunDryRun && !submitting && !hasSubmitted;

  async function submitDryRun() {
    if (!canSubmit) return;

    setSubmitting(true);
    setClientError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const payload = (await response.json().catch(() => null)) as
        | A17QAuthenticatedDryRunResult
        | null;

      if (payload) {
        setResult(payload);
      }
      if (!response.ok) {
        setClientError(`A17Q_DRY_RUN_POST_REJECTED_HTTP_${response.status}`);
      }
      setHasSubmitted(true);
    } catch {
      setClientError("A17Q_DRY_RUN_POST_FAILED_CLIENT_SIDE");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 rounded-md border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-800">
        <div>AUTHENTICATED_IDENTITY_VISIBLE={summarizeBool(gate.authenticated)}</div>
        <div>PROFILE_VISIBLE={summarizeBool(gate.profileVisible)}</div>
        <div>ROLE_VISIBLE={summarizeBool(gate.roleVisible)}</div>
        <div>OWNER_ADMIN_ROLE_VISIBLE={summarizeBool(gate.ownerAdminRoleVisible)}</div>
        <div>PERMISSION_COUNT={gate.permissionCount}</div>
        <div>
          REQUIRED_PERMISSIONS_PRESENT=
          {summarizeBool(gate.requiredPermissionsPresent)}
        </div>
      </div>

      {gate.blockedReasons.length > 0 ? (
        <div className="grid gap-1 rounded-md border border-amber-200 bg-white p-4 text-sm leading-6 text-amber-900">
          {gate.blockedReasons.map((reason) => (
            <div key={reason} className="break-all">
              {reason}
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
        onClick={submitDryRun}
        className={
          canSubmit
            ? "inline-flex min-h-12 items-center justify-center rounded-md border border-[#245744] bg-[#245744] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f4939] sm:w-fit"
            : "inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-md border border-stone-300 bg-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 sm:w-fit"
        }
      >
        {submitting
          ? "Running A-17Q dry-run..."
          : hasSubmitted
            ? "A-17Q dry-run request sent"
            : "Run A-17Q authenticated dry-run"}
      </button>

      {clientError ? (
        <div className="rounded-md border border-red-200 bg-white p-3 text-sm font-semibold text-red-800">
          {clientError}
        </div>
      ) : null}

      {result ? (
        <div className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-800">
          <div>STATUS={result.status}</div>
          <div>DRY_RUN_ONLY={summarizeBool(result.dryRunOnly)}</div>
          <div>RPC_NAME={result.rpcName}</div>
          <pre className="max-h-[34rem] overflow-auto rounded-md bg-stone-950 p-4 text-xs leading-5 text-stone-50">
            {JSON.stringify(result.rpcResult, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

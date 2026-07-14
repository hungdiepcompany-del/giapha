"use client";

import { useMemo, useState } from "react";

import type {
  A17QAuthenticatedExecutionGate,
  A17QAuthenticatedExecutionResult,
} from "@/lib/reconciliation/a17q-authenticated-execution";

type A17QExecutionClientProps = {
  endpoint: string;
  confirmationPhrase: string;
  gate: A17QAuthenticatedExecutionGate;
};

type ConfirmationKey =
  | "confirmBackupReviewed"
  | "confirmRollbackReviewed"
  | "confirmAuditReviewed"
  | "confirmExcludedScopeReviewed";

function summarizeBool(value: boolean) {
  return value ? "YES" : "NO";
}

const confirmationItems: Array<{
  key: ConfirmationKey;
  label: string;
}> = [
  {
    key: "confirmBackupReviewed",
    label: "Backup evidence reviewed",
  },
  {
    key: "confirmRollbackReviewed",
    label: "Rollback manifest contract reviewed",
  },
  {
    key: "confirmAuditReviewed",
    label: "Audit evidence contract reviewed",
  },
  {
    key: "confirmExcludedScopeReviewed",
    label: "Excluded and deleted scope reviewed",
  },
];

export function A17QAuthenticatedExecutionClient({
  endpoint,
  confirmationPhrase,
  gate,
}: A17QExecutionClientProps) {
  const [typedPhrase, setTypedPhrase] = useState("");
  const [confirmations, setConfirmations] = useState<
    Record<ConfirmationKey, boolean>
  >({
    confirmBackupReviewed: false,
    confirmRollbackReviewed: false,
    confirmAuditReviewed: false,
    confirmExcludedScopeReviewed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<A17QAuthenticatedExecutionResult | null>(
    null,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const allReviewConfirmationsAccepted = useMemo(
    () => Object.values(confirmations).every(Boolean),
    [confirmations],
  );
  const exactPhraseAccepted = typedPhrase === confirmationPhrase;
  const canSubmit =
    gate.canRunExecution &&
    exactPhraseAccepted &&
    allReviewConfirmationsAccepted &&
    !submitting &&
    !hasSubmitted;

  function updateConfirmation(key: ConfirmationKey, value: boolean) {
    setConfirmations((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submitExecution() {
    if (!canSubmit) return;

    setSubmitting(true);
    setClientError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationPhrase: typedPhrase,
          ...confirmations,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | A17QAuthenticatedExecutionResult
        | null;

      if (payload) {
        setResult(payload);
      }
      if (!response.ok) {
        setClientError(`A17Q_EXECUTION_POST_REJECTED_HTTP_${response.status}`);
      }
      setHasSubmitted(true);
    } catch {
      setClientError("A17Q_EXECUTION_POST_FAILED_CLIENT_SIDE");
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

      <div className="grid gap-4 rounded-md border border-red-200 bg-white p-4 text-sm leading-6 text-stone-800">
        <label className="grid gap-2 font-semibold">
          Confirmation phrase
          <input
            value={typedPhrase}
            onChange={(event) => setTypedPhrase(event.target.value)}
            className="min-h-12 rounded-md border border-stone-300 px-3 py-2 font-mono text-sm font-semibold text-stone-900 outline-none transition focus:border-[#245744]"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <div className="break-all rounded-md bg-stone-100 px-3 py-2 font-mono text-xs font-semibold text-stone-800">
          REQUIRED_CONFIRMATION={confirmationPhrase}
        </div>
        <div className="grid gap-2">
          {confirmationItems.map((item) => (
            <label
              key={item.key}
              className="flex min-h-11 items-center gap-3 rounded-md border border-stone-200 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={confirmations[item.key]}
                onChange={(event) =>
                  updateConfirmation(item.key, event.target.checked)
                }
                className="h-4 w-4"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
        onClick={submitExecution}
        className={
          canSubmit
            ? "inline-flex min-h-12 items-center justify-center rounded-md border border-red-700 bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 sm:w-fit"
            : "inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-md border border-stone-300 bg-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 sm:w-fit"
        }
      >
        {submitting
          ? "Executing A-17Q reconciliation..."
          : hasSubmitted
            ? "A-17Q execution request sent"
            : "Execute A-17Q reconciliation once"}
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
          <div>CONFIRMATION_PHRASE_ACCEPTED={summarizeBool(result.confirmationPhraseAccepted)}</div>
          <div>REVIEW_CONFIRMATIONS_ACCEPTED={summarizeBool(result.reviewConfirmationsAccepted)}</div>
          <div>RPC_NAME={result.rpcName}</div>
          <pre className="max-h-[34rem] overflow-auto rounded-md bg-stone-950 p-4 text-xs leading-5 text-stone-50">
            {JSON.stringify(result.rpcResult, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

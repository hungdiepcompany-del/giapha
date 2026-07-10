"use client";

import { useState } from "react";

type A16BCAction =
  | "mark_ready_for_owner_approval"
  | "approve_for_db_write";

type A16BCConfirmationBody = {
  action: A16BCAction;
  confirmSessionId: string;
  confirmMarker: string;
  confirmNoValidationErrors: boolean;
  confirmNoDryRunBlockers: boolean;
  confirmDuplicateDecisionsComplete: boolean;
  confirmRelationshipAmbiguityClear: boolean;
  confirmReviewPackReady: boolean;
  confirmNoOfficialImportExecution: boolean;
  confirmRollbackReviewed: boolean;
  confirmAuditReviewed: boolean;
};

type TransitionResult = {
  ok?: unknown;
  action?: unknown;
  previousSessionState?: unknown;
  nextSessionState?: unknown;
  writeManifestStatus?: unknown;
  message?: unknown;
  blockedReasons?: unknown;
};

function summarizeResult(result: TransitionResult) {
  return {
    ok: result.ok === true,
    action: typeof result.action === "string" ? result.action : "UNKNOWN",
    previousSessionState:
      typeof result.previousSessionState === "string"
        ? result.previousSessionState
        : null,
    nextSessionState:
      typeof result.nextSessionState === "string"
        ? result.nextSessionState
        : null,
    writeManifestStatus:
      typeof result.writeManifestStatus === "string"
        ? result.writeManifestStatus
        : null,
    message: typeof result.message === "string" ? result.message : null,
    blockedReasons: Array.isArray(result.blockedReasons)
      ? result.blockedReasons.filter((reason) => typeof reason === "string")
      : [],
  };
}

export function A16BCOwnerApprovalStateClient({
  routePath,
  readyConfirmation,
  dbWriteConfirmation,
  canMarkReady,
  canApproveDbWrite,
  lockedReasons,
}: {
  routePath: string;
  readyConfirmation: A16BCConfirmationBody;
  dbWriteConfirmation: A16BCConfirmationBody;
  canMarkReady: boolean;
  canApproveDbWrite: boolean;
  lockedReasons: readonly string[];
}) {
  const [confirmedAction, setConfirmedAction] = useState<A16BCAction | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof summarizeResult> | null>(
    null,
  );
  const selectedBody =
    confirmedAction === "mark_ready_for_owner_approval"
      ? readyConfirmation
      : confirmedAction === "approve_for_db_write"
        ? dbWriteConfirmation
        : null;
  const submitAllowed =
    Boolean(selectedBody) &&
    !submitting &&
    !hasSubmitted &&
    ((confirmedAction === "mark_ready_for_owner_approval" && canMarkReady) ||
      (confirmedAction === "approve_for_db_write" && canApproveDbWrite));

  async function submitTransition() {
    if (!selectedBody || !submitAllowed) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(routePath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedBody),
      });
      const payload = (await response.json().catch(() => ({}))) as TransitionResult;
      setResult(summarizeResult(payload));
      setHasSubmitted(true);

      if (!response.ok) {
        setSubmitError(`A16BC_STATE_TRANSITION_REJECTED_HTTP_${response.status}`);
      }
    } catch {
      setSubmitError("A16BC_STATE_TRANSITION_FAILED_CLIENT_SIDE");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 rounded-md border border-amber-200 bg-white p-3 text-sm leading-6 text-stone-800">
        <div className="font-semibold text-stone-950">
          A-16BC owner approval state transition
        </div>
        <label className="flex items-start gap-2">
          <input
            type="radio"
            name="a16bc-owner-approval-state"
            checked={confirmedAction === "mark_ready_for_owner_approval"}
            disabled={!canMarkReady || submitting || hasSubmitted}
            onChange={() => setConfirmedAction("mark_ready_for_owner_approval")}
            className="mt-1 h-4 w-4"
          />
          <span>
            Move audited session from preview_generated to
            ready_for_owner_approval. This does not execute official import.
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input
            type="radio"
            name="a16bc-owner-approval-state"
            checked={confirmedAction === "approve_for_db_write"}
            disabled={!canApproveDbWrite || submitting || hasSubmitted}
            onChange={() => setConfirmedAction("approve_for_db_write")}
            className="mt-1 h-4 w-4"
          />
          <span>
            Move audited session from ready_for_owner_approval to
            owner_approved_for_db_write. This still does not execute official
            import.
          </span>
        </label>
      </div>

      {!canMarkReady && !canApproveDbWrite ? (
        <div className="rounded-md border border-rose-200 bg-white p-3 text-sm leading-6 text-rose-900">
          <div className="font-semibold">A-16BC state transition is locked.</div>
          {lockedReasons.slice(0, 10).map((reason) => (
            <div key={reason} className="break-all">
              {reason}
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        disabled={!submitAllowed}
        aria-disabled={!submitAllowed}
        onClick={submitTransition}
        className={
          submitAllowed
            ? "inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 sm:w-fit"
            : "inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-amber-200 bg-white px-5 py-3 text-sm font-semibold text-amber-900 sm:w-fit"
        }
      >
        {submitting
          ? "Dang gui A-16BC..."
          : hasSubmitted
            ? "Da gui mot yeu cau A-16BC"
            : "Gui xac nhan state A-16BC"}
      </button>

      {submitError ? (
        <div className="rounded-md border border-rose-200 bg-white p-3 text-sm font-semibold text-rose-900">
          {submitError}
        </div>
      ) : null}

      {result ? (
        <div className="grid gap-1 rounded-md border border-stone-200 bg-white p-3 text-sm leading-6 text-stone-800">
          <div>ok: {String(result.ok)}</div>
          <div>action: {result.action}</div>
          <div>previousSessionState: {result.previousSessionState ?? "none"}</div>
          <div>nextSessionState: {result.nextSessionState ?? "none"}</div>
          <div>writeManifestStatus: {result.writeManifestStatus ?? "none"}</div>
          {result.message ? <div>{result.message}</div> : null}
          {result.blockedReasons.map((reason) => (
            <div key={reason} className="break-all">
              {reason}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

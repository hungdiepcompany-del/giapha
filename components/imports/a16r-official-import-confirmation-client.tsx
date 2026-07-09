"use client";

import { useState } from "react";

type OfficialImportConfirmationBody = {
  confirmMarker: string;
  confirmSessionId: string;
  confirmNoValidationErrors: boolean;
  confirmNoDryRunBlockers: boolean;
  confirmDuplicateDecisionsComplete: boolean;
  confirmA16TApplyVerified: boolean;
  confirmA16ULockedBranchReady: boolean;
  confirmA16VApplyVerified: boolean;
  confirmA16VRealTransactionBranchReady: boolean;
  confirmRuntimeExecutionEnablementMarker: string;
  confirmProductionUiVisible: boolean;
  confirmProductionDeployReady: boolean;
  confirmRollbackReviewed: boolean;
  confirmAuditReviewed: boolean;
};

type SubmitResult = {
  status?: unknown;
  message?: unknown;
  canRunOfficialImport?: unknown;
  importedPeopleCount?: unknown;
  importedRelationshipsCount?: unknown;
  warningsCount?: unknown;
  blockedReasons?: unknown;
};

function summarizeResult(result: SubmitResult) {
  const blockedReasons = Array.isArray(result.blockedReasons)
    ? result.blockedReasons.filter((reason) => typeof reason === "string")
    : [];

  return {
    status: typeof result.status === "string" ? result.status : "UNKNOWN",
    message: typeof result.message === "string" ? result.message : null,
    canRunOfficialImport:
      typeof result.canRunOfficialImport === "boolean"
        ? result.canRunOfficialImport
        : null,
    importedPeopleCount:
      typeof result.importedPeopleCount === "number"
        ? result.importedPeopleCount
        : null,
    importedRelationshipsCount:
      typeof result.importedRelationshipsCount === "number"
        ? result.importedRelationshipsCount
        : null,
    warningsCount:
      typeof result.warningsCount === "number" ? result.warningsCount : null,
    blockedReasons,
  };
}

export function A16ROfficialImportConfirmationClient({
  sessionId,
  routePath,
  confirmationText,
  confirmationBody,
  canSubmit,
  lockedReasons,
}: {
  sessionId: string;
  routePath: string;
  confirmationText: string;
  confirmationBody: OfficialImportConfirmationBody;
  canSubmit: boolean;
  lockedReasons: readonly string[];
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof summarizeResult> | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitAllowed = canSubmit && confirmed && !submitting && !hasSubmitted;

  async function submitOfficialImport() {
    if (!submitAllowed) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(routePath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(confirmationBody),
      });
      const payload = (await response.json().catch(() => ({}))) as SubmitResult;
      setResult(summarizeResult(payload));
      setHasSubmitted(true);

      if (!response.ok) {
        setSubmitError(`OFFICIAL_IMPORT_POST_REJECTED_HTTP_${response.status}`);
      }
    } catch {
      setSubmitError("OFFICIAL_IMPORT_POST_FAILED_CLIENT_SIDE");
    } finally {
      setSubmitting(false);
    }
  }

  if (!canSubmit) {
    return (
      <div className="grid gap-3">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-900 sm:w-fit"
        >
          Xac nhan nhap chinh thuc - dang khoa
        </button>
        <div className="rounded-md border border-rose-200 bg-white p-3 text-sm leading-6 text-rose-900">
          <div className="font-semibold">
            A-16R official import remains locked for session {sessionId}.
          </div>
          {lockedReasons.slice(0, 8).map((reason) => (
            <div key={reason} className="break-all">
              {reason}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <label className="grid gap-2 rounded-md border border-amber-200 bg-white p-3 text-sm leading-6 text-stone-800">
        <span className="font-semibold text-stone-950">
          Final owner/admin confirmation before official import POST
        </span>
        <span className="break-all">{confirmationText}</span>
        <span className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={confirmed}
            disabled={submitting || hasSubmitted}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            I confirm the audited A-16R session ID {sessionId} and understand
            this button submits exactly one approved official import request.
          </span>
        </span>
      </label>

      <button
        type="button"
        disabled={!submitAllowed}
        aria-disabled={!submitAllowed}
        onClick={submitOfficialImport}
        className={
          submitAllowed
            ? "inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 sm:w-fit"
            : "inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-amber-200 bg-white px-5 py-3 text-sm font-semibold text-amber-900 sm:w-fit"
        }
      >
        {submitting
          ? "Dang gui xac nhan..."
          : hasSubmitted
            ? "Da gui mot yeu cau"
            : "Gui xac nhan nhap chinh thuc A-16R"}
      </button>

      {submitError ? (
        <div className="rounded-md border border-rose-200 bg-white p-3 text-sm font-semibold text-rose-900">
          {submitError}
        </div>
      ) : null}

      {result ? (
        <div className="grid gap-1 rounded-md border border-stone-200 bg-white p-3 text-sm leading-6 text-stone-800">
          <div>Status: {result.status}</div>
          <div>
            canRunOfficialImport:{" "}
            {result.canRunOfficialImport === null
              ? "unknown"
              : String(result.canRunOfficialImport)}
          </div>
          {result.importedPeopleCount !== null ? (
            <div>Imported people count: {result.importedPeopleCount}</div>
          ) : null}
          {result.importedRelationshipsCount !== null ? (
            <div>
              Imported relationships count: {result.importedRelationshipsCount}
            </div>
          ) : null}
          {result.warningsCount !== null ? (
            <div>Warnings count: {result.warningsCount}</div>
          ) : null}
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

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  ImportWarningGroupKey,
  ImportWarningReviewGroup,
} from "@/lib/import/giapha4/warning-review-service";

type SubmitResult = {
  ok?: unknown;
  warningGroup?: unknown;
  acknowledgedCount?: unknown;
  pendingWarningCount?: unknown;
  blockedReasons?: unknown;
  message?: unknown;
};

type Notice = {
  tone: "success" | "error";
  message: string;
  reasons: string[];
};

function summarizeResult(result: SubmitResult) {
  return {
    ok: result.ok === true,
    warningGroup:
      typeof result.warningGroup === "string" ? result.warningGroup : null,
    acknowledgedCount:
      typeof result.acknowledgedCount === "number"
        ? result.acknowledgedCount
        : 0,
    pendingWarningCount:
      typeof result.pendingWarningCount === "number"
        ? result.pendingWarningCount
        : 0,
    message: typeof result.message === "string" ? result.message : null,
    blockedReasons: Array.isArray(result.blockedReasons)
      ? result.blockedReasons.filter((reason) => typeof reason === "string")
      : [],
  };
}

export function WarningGroupReviewClient({
  sessionId,
  manifestId,
  stagingVersion,
  groups,
}: {
  sessionId: string;
  manifestId: string | null;
  stagingVersion: string | null;
  groups: ImportWarningReviewGroup[];
}) {
  const router = useRouter();
  const [submittingGroup, setSubmittingGroup] =
    useState<ImportWarningGroupKey | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  if (groups.length === 0) return null;

  async function acknowledgeGroup(group: ImportWarningReviewGroup) {
    if (!manifestId || !stagingVersion || submittingGroup) return;

    setNotice(null);
    setSubmittingGroup(group.groupKey);

    try {
      const response = await fetch(
        `/api/admin/import-sessions/${sessionId}/warnings/acknowledge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirmSessionId: sessionId,
            confirmManifestId: manifestId,
            confirmStagingVersion: stagingVersion,
            confirmWarningGroup: group.groupKey,
            confirmPolicyApplied: group.policyApplied,
            confirmNoOfficialImportExecution: true,
          }),
        },
      );
      const payload = summarizeResult(
        (await response.json().catch(() => ({}))) as SubmitResult,
      );

      if (!response.ok || !payload.ok) {
        setNotice({
          tone: "error",
          message:
            payload.message ??
            `WARNING_GROUP_ACK_REJECTED_HTTP_${response.status}`,
          reasons: payload.blockedReasons,
        });
        return;
      }

      setNotice({
        tone: "success",
        message:
          payload.message ??
          `Da xac nhan ${payload.acknowledgedCount} warning.`,
        reasons: [],
      });
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        message: "WARNING_GROUP_ACK_CLIENT_SIDE_FAILED",
        reasons: [],
      });
    } finally {
      setSubmittingGroup(null);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3">
        {groups.map((group) => {
          const canSubmit =
            Boolean(manifestId) &&
            Boolean(stagingVersion) &&
            group.openCount + group.heldCount > 0 &&
            submittingGroup === null;
          return (
            <div
              key={`${group.groupKey}-${group.warningCode}`}
              className="rounded-md border border-amber-200 bg-white p-3 text-sm leading-6 text-stone-800"
            >
              <div className="font-bold text-stone-950">{group.titleVi}</div>
              <div>
                Code: {group.warningCode}. Total: {group.count}. Pending:{" "}
                {group.openCount + group.heldCount}. Acknowledged:{" "}
                {group.acknowledgedCount + group.resolvedCount}.
              </div>
              <div className="break-all text-stone-600">
                Policy: {group.policyApplied}
              </div>
              {group.rowIndexes.length > 0 ? (
                <div className="text-stone-600">
                  Rows: {group.rowIndexes.slice(0, 16).join(", ")}
                  {group.rowIndexes.length > 16 ? "..." : ""}
                </div>
              ) : null}
              <button
                type="button"
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
                onClick={() => acknowledgeGroup(group)}
                className={
                  canSubmit
                    ? "mt-3 inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 sm:w-fit"
                    : "mt-3 inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-500 sm:w-fit"
                }
              >
                {submittingGroup === group.groupKey
                  ? "Dang xac nhan..."
                  : group.openCount + group.heldCount > 0
                    ? "Xac nhan nhom warning"
                    : "Nhom da duoc xac nhan"}
              </button>
            </div>
          );
        })}
      </div>

      {notice ? (
        <div
          className={
            notice.tone === "success"
              ? "rounded-md border border-emerald-200 bg-white p-3 text-sm leading-6 text-emerald-900"
              : "rounded-md border border-rose-200 bg-white p-3 text-sm leading-6 text-rose-900"
          }
        >
          <div className="font-semibold">{notice.message}</div>
          {notice.reasons.map((reason) => (
            <div key={reason} className="break-all">
              {reason}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

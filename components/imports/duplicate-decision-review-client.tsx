"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import type { ImportDuplicateCandidatePreview } from "@/lib/import/giapha4/manifest-read-service";

const decisionOptions = [
  { value: "unresolved", label: "Chưa quyết định" },
  { value: "create_new", label: "Tạo người mới" },
  { value: "link_existing", label: "Liên kết với người đã có" },
  { value: "ignore_candidate", label: "Bỏ qua ứng viên" },
  { value: "needs_review", label: "Cần rà soát thêm" },
] as const;

type OwnerDecision = (typeof decisionOptions)[number]["value"];

type DuplicateDecisionSaveResult = {
  ok: boolean;
  duplicateId: string;
  ownerDecision: OwnerDecision | null;
  decidedAt: string | null;
  unresolvedDuplicateCount: number;
  needsReviewDuplicateCount: number;
  diagnosticCode?: string;
  canProceedToOfficialImport: false;
  canRunOfficialImport: false;
  message: string;
};

type SaveNotice = {
  tone: "success" | "error";
  text: string;
  diagnosticCode?: string;
};

function getDuplicateDecisionLabel(ownerDecision: string) {
  const labels: Record<string, string> = {
    unresolved: "Chưa quyết định",
    create_new: "Tạo người mới",
    link_existing: "Liên kết người đã có",
    needs_review: "Cần rà soát thêm",
    ignore_candidate: "Bỏ qua ứng viên",
    hold: "Cần rà soát thêm",
    skip: "Bỏ qua ứng viên",
  };

  return labels[ownerDecision] ?? ownerDecision;
}

function getMatchStrengthLabel(matchStrength: string) {
  const labels: Record<string, string> = {
    strong: "Rất giống",
    medium: "Có khả năng trùng",
    weak: "Dấu hiệu yếu",
    ambiguous: "Chưa rõ",
  };

  return labels[matchStrength] ?? matchStrength;
}

function isBlockingDuplicateDecision(ownerDecision: string) {
  return ownerDecision === "unresolved" || ownerDecision === "needs_review" || ownerDecision === "hold";
}

function getExistingPersonSummary(candidate: ImportDuplicateCandidatePreview) {
  if (!candidate.existingPersonId) return "Chưa gắn hồ sơ hiện hữu.";
  return `Có hồ sơ hiện hữu: ${candidate.existingPersonId.slice(0, 8)}...`;
}

function isOwnerDecision(value: string): value is OwnerDecision {
  return decisionOptions.some((option) => option.value === value);
}

function normalizeInitialDecision(value: string): OwnerDecision {
  if (value === "hold") return "needs_review";
  if (value === "skip") return "ignore_candidate";
  return isOwnerDecision(value) ? value : "unresolved";
}

type DraftState = Record<
  string,
  {
    ownerDecision: OwnerDecision;
    decisionNote: string;
  }
>;

function createInitialDrafts(candidates: ImportDuplicateCandidatePreview[]) {
  return Object.fromEntries(
    candidates.map((candidate) => [
      candidate.id,
      {
        ownerDecision:
          normalizeInitialDecision(candidate.ownerDecision) === "link_existing" &&
          !candidate.existingPersonId
            ? "unresolved"
            : normalizeInitialDecision(candidate.ownerDecision),
        decisionNote: candidate.decisionNote ?? "",
      },
    ]),
  ) as DraftState;
}

function getVisibleDecisionOptions(candidate: ImportDuplicateCandidatePreview) {
  return decisionOptions.filter(
    (option) => option.value !== "link_existing" || Boolean(candidate.existingPersonId),
  );
}

function buildDuplicateListKey(
  sessionId: string,
  candidates: ImportDuplicateCandidatePreview[],
) {
  return `${sessionId}:${candidates.map((candidate) => candidate.id).join("|")}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function DuplicateDecisionReviewClient({
  sessionId,
  duplicateCandidates,
  totalDuplicateCandidates,
}: {
  sessionId: string;
  duplicateCandidates: ImportDuplicateCandidatePreview[];
  totalDuplicateCandidates: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const incomingDuplicateListKey = useMemo(
    () => buildDuplicateListKey(sessionId, duplicateCandidates),
    [sessionId, duplicateCandidates],
  );
  const [candidates, setCandidates] = useState(duplicateCandidates);
  const [drafts, setDrafts] = useState(() => createInitialDrafts(duplicateCandidates));
  const [activeSessionId] = useState(sessionId);
  const [activeDuplicateListKey] = useState(incomingDuplicateListKey);
  const [saveNotice, setSaveNotice] = useState<SaveNotice | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  const currentUnresolvedCount = useMemo(
    () =>
      candidates.filter((candidate) =>
        isBlockingDuplicateDecision(candidate.ownerDecision),
      ).length,
    [candidates],
  );
  const isStaleDuplicateList =
    activeSessionId !== sessionId || activeDuplicateListKey !== incomingDuplicateListKey;

  if (totalDuplicateCandidates === 0) return null;

  async function saveDecision(candidate: ImportDuplicateCandidatePreview) {
    const draft = drafts[candidate.id];
    if (!draft) return;

    setSaveNotice(null);
    setLastSavedId(null);

    if (isStaleDuplicateList) {
      setSaveNotice({
        tone: "error",
        text: "Danh sách ứng viên trùng đã cũ, vui lòng tải lại phiên nhập.",
        diagnosticCode: "DUPLICATE_DECISION_NOT_IN_SESSION",
      });
      return;
    }

    if (!isUuid(candidate.id)) {
      setSaveNotice({
        tone: "error",
        text: "Mã ứng viên trùng không hợp lệ. Vui lòng tải lại phiên nhập trước khi lưu.",
        diagnosticCode: "DUPLICATE_DECISION_NOT_IN_SESSION",
      });
      return;
    }

    const response = await fetch(
      `/api/admin/import-sessions/${sessionId}/duplicates/${candidate.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerDecision: draft.ownerDecision,
          decisionNote: draft.decisionNote,
        }),
      },
    );
    const result = (await response.json()) as DuplicateDecisionSaveResult;

    if (!response.ok || !result.ok || !result.ownerDecision) {
      setSaveNotice({
        tone: "error",
        text: result.message || "Chưa lưu được quyết định ứng viên trùng.",
        diagnosticCode: result.diagnosticCode,
      });
      return;
    }

    setCandidates((current) =>
      current.map((item) =>
        item.id === result.duplicateId
          ? {
              ...item,
              ownerDecision: result.ownerDecision ?? item.ownerDecision,
              decisionNote: draft.decisionNote.trim() || null,
              decidedAt: result.decidedAt,
            }
          : item,
      ),
    );
    setSaveNotice({
      tone: "success",
      text: result.message,
      diagnosticCode: result.diagnosticCode,
    });
    setLastSavedId(result.duplicateId);
    startTransition(() => router.refresh());
  }

  return (
    <section className="grid gap-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div className="grid gap-2">
        <div className="text-sm font-semibold uppercase tracking-normal text-amber-900">
          A-16Q-DUP - Rà soát trùng
        </div>
        <h3 className="text-base font-bold text-stone-950">
          Ứng viên trùng cần quyết định
        </h3>
        <p className="text-sm leading-6 text-stone-700">
          Quyết định này chỉ lưu ở vùng staging, chưa ghi vào cây gia phả thật.
          Owner vẫn cần xử lý hết ứng viên trùng trước khi xét nhập chính thức.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Tổng ứng viên trùng"
          value={totalDuplicateCandidates}
        />
        <MetricCard
          label="Chưa có quyết định"
          value={currentUnresolvedCount}
        />
        <MetricCard label="Đang hiển thị" value={candidates.length} />
        <MetricCard label="Có thể nhập chính thức" value={0} />
      </div>

      {isStaleDuplicateList ? (
        <div className="rounded-md border border-rose-200 bg-white p-3 text-sm font-semibold text-rose-900">
          Danh sách ứng viên trùng đã cũ, vui lòng tải lại phiên nhập.
        </div>
      ) : null}

      {saveNotice ? (
        <div
          className={
            saveNotice.tone === "success"
              ? "rounded-md border border-teal-200 bg-white p-3 text-sm font-semibold text-teal-900"
              : "rounded-md border border-rose-200 bg-white p-3 text-sm font-semibold text-rose-900"
          }
        >
          <div>{saveNotice.text}</div>
          {saveNotice.diagnosticCode && saveNotice.tone === "error" ? (
            <div className="mt-1 text-xs font-semibold uppercase tracking-normal text-rose-700">
              Mã chẩn đoán: {saveNotice.diagnosticCode}
            </div>
          ) : null}
        </div>
      ) : null}

      {currentUnresolvedCount > 0 ? (
        <div className="rounded-md border border-amber-200 bg-white p-3 text-sm leading-6 text-amber-950">
          Còn ứng viên trùng chưa quyết định. Nút nhập chính thức vẫn khóa.
        </div>
      ) : null}

      <div className="grid gap-2">
        {candidates.slice(0, 20).map((candidate) => {
          const draft = drafts[candidate.id] ?? {
            ownerDecision: normalizeInitialDecision(candidate.ownerDecision),
            decisionNote: candidate.decisionNote ?? "",
          };
          const visibleDecisionOptions = getVisibleDecisionOptions(candidate);

          return (
            <div
              key={candidate.id}
              className="rounded-md border border-amber-200 bg-white p-3 text-sm leading-6 text-stone-800"
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_minmax(260px,340px)]">
                <div>
                  <div className="font-bold text-stone-950">
                    Dòng {candidate.sourceRowIndex}:{" "}
                    {getDuplicateDecisionLabel(candidate.ownerDecision)}
                  </div>
                  <div className="text-stone-600">
                    Độ giống: {getMatchStrengthLabel(candidate.matchStrength)}.
                    {candidate.matchReasonCodes.length > 0
                      ? ` Lý do: ${candidate.matchReasonCodes.join(", ")}.`
                      : " Chưa có mã lý do."}
                  </div>
                  <div className="text-stone-600">
                    {getExistingPersonSummary(candidate)}
                  </div>
                  {candidate.decisionNote ? (
                    <div className="text-stone-600">
                      Ghi chú quyết định: {candidate.decisionNote}
                    </div>
                  ) : null}
                  {lastSavedId === candidate.id ? (
                    <div className="mt-1 font-semibold text-teal-800">
                      Đã lưu quyết định
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <label className="grid gap-1 text-sm font-semibold text-stone-800">
                    Quyết định
                    <select
                      value={draft.ownerDecision}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [candidate.id]: {
                            ...draft,
                            ownerDecision: event.target.value as OwnerDecision,
                          },
                        }))
                      }
                      className="min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-950"
                    >
                      {visibleDecisionOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-stone-800">
                    Ghi chú quyết định
                    <textarea
                      value={draft.decisionNote}
                      maxLength={500}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [candidate.id]: {
                            ...draft,
                            decisionNote: event.target.value,
                          },
                        }))
                      }
                      className="min-h-20 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-950"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => void saveDecision(candidate)}
                    disabled={isPending || isStaleDuplicateList}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-teal-700 bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500"
                  >
                    Lưu quyết định
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-normal text-stone-600">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-stone-950">{value}</div>
    </div>
  );
}

import "server-only";

import {
  getImportManifest,
  type ImportDuplicateCandidatePreview,
  type ImportManifestReadResult,
} from "@/lib/import/giapha4/manifest-read-service";

export const A16Q_DUPLICATE_DECISION_REVIEW_MARKER =
  "A16Q_DUPLICATE_CANDIDATE_OWNER_DECISION_REVIEW";

export const A16Q_DUPLICATE_DECISION_RLS_BLOCKER =
  "A16Q_DUP_STATUS=BLOCKED_DUPLICATE_DECISION_RLS_UPDATE_MISSING";

const blockingDuplicateDecisions = new Set([
  "unresolved",
  "needs_review",
  "hold",
]);

const finalDuplicateDecisions = new Set([
  "create_new",
  "link_existing",
  "ignore_candidate",
  "skip",
]);

export type DuplicateDecisionSummary = {
  totalDuplicateCandidates: number;
  unresolvedDuplicateCandidates: number;
  needsReviewDuplicateCandidates: number;
  finalizedDuplicateCandidates: number;
  canRunOfficialImport: false;
  officialImportBlocked: true;
};

export type DuplicateDecisionReviewCandidate = {
  id: string;
  sourceRowIndex: number;
  sourcePersonFingerprint: string;
  existingPersonId: string | null;
  existingPersonSummary: string;
  matchStrength: string;
  matchReasonCodes: string[];
  ownerDecision: string;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
  blocksOfficialImport: boolean;
};

export type DuplicateDecisionReviewResult = {
  ok: boolean;
  httpStatus: ImportManifestReadResult["httpStatus"];
  marker: typeof A16Q_DUPLICATE_DECISION_REVIEW_MARKER;
  sessionId: string;
  readOnly: true;
  stagingOnly: true;
  canEditDecisions: false;
  canRunOfficialImport: false;
  officialImportButtonDisabled: true;
  editBlockedReasons: string[];
  totalDuplicateCandidates: number;
  unresolvedDuplicateCandidates: number;
  candidates: DuplicateDecisionReviewCandidate[];
  message: string;
};

export function isBlockingDuplicateDecision(ownerDecision: string) {
  return blockingDuplicateDecisions.has(ownerDecision);
}

export function isFinalDuplicateDecision(ownerDecision: string) {
  return finalDuplicateDecisions.has(ownerDecision);
}

export function buildDuplicateDecisionSummary(
  manifest: ImportManifestReadResult,
): DuplicateDecisionSummary {
  const totalDuplicateCandidates =
    manifest.session?.duplicateCandidateCount ?? manifest.duplicateCandidates.length;
  const unresolvedDuplicateCandidates = manifest.duplicateCandidates.filter((item) =>
    isBlockingDuplicateDecision(item.ownerDecision),
  ).length;
  const needsReviewDuplicateCandidates = manifest.duplicateCandidates.filter(
    (item) => item.ownerDecision === "needs_review" || item.ownerDecision === "hold",
  ).length;
  const finalizedDuplicateCandidates = manifest.duplicateCandidates.filter((item) =>
    isFinalDuplicateDecision(item.ownerDecision),
  ).length;

  return {
    totalDuplicateCandidates,
    unresolvedDuplicateCandidates,
    needsReviewDuplicateCandidates,
    finalizedDuplicateCandidates,
    canRunOfficialImport: false,
    officialImportBlocked: true,
  };
}

function summarizeExistingPerson(candidate: ImportDuplicateCandidatePreview) {
  if (!candidate.existingPersonId) return "Chưa gắn hồ sơ hiện hữu.";
  return `Có hồ sơ hiện hữu: ${candidate.existingPersonId.slice(0, 8)}...`;
}

function mapCandidate(
  candidate: ImportDuplicateCandidatePreview,
): DuplicateDecisionReviewCandidate {
  return {
    id: candidate.id,
    sourceRowIndex: candidate.sourceRowIndex,
    sourcePersonFingerprint: candidate.sourcePersonFingerprint,
    existingPersonId: candidate.existingPersonId,
    existingPersonSummary: summarizeExistingPerson(candidate),
    matchStrength: candidate.matchStrength,
    matchReasonCodes: candidate.matchReasonCodes,
    ownerDecision: candidate.ownerDecision,
    decidedBy: candidate.decidedBy,
    decidedAt: candidate.decidedAt,
    decisionNote: candidate.decisionNote,
    createdAt: candidate.createdAt,
    blocksOfficialImport: isBlockingDuplicateDecision(candidate.ownerDecision),
  };
}

export function buildDuplicateDecisionReviewFromManifest(
  manifest: ImportManifestReadResult,
  sessionId: string,
): DuplicateDecisionReviewResult {
  const summary = buildDuplicateDecisionSummary(manifest);
  const candidates = manifest.duplicateCandidates.map(mapCandidate);
  const editBlockedReasons = [
    "Thiếu policy UPDATE an toàn cho import_duplicate_candidates.",
    "SQL candidate A-16Q-DUP chưa được owner apply và verify.",
    "Màn này chỉ đọc staging; chưa ghi owner_decision, decided_by, decided_at hoặc decision_note.",
  ];

  return {
    ok: manifest.ok,
    httpStatus: manifest.httpStatus,
    marker: A16Q_DUPLICATE_DECISION_REVIEW_MARKER,
    sessionId,
    readOnly: true,
    stagingOnly: true,
    canEditDecisions: false,
    canRunOfficialImport: false,
    officialImportButtonDisabled: true,
    editBlockedReasons,
    totalDuplicateCandidates: summary.totalDuplicateCandidates,
    unresolvedDuplicateCandidates: summary.unresolvedDuplicateCandidates,
    candidates,
    message: manifest.ok
      ? "Đã đọc ứng viên trùng ở chế độ chỉ đọc. Cổng nhập chính thức vẫn khóa cho đến khi owner xử lý hết ứng viên trùng."
      : manifest.message,
  };
}

export async function getDuplicateDecisionReview(sessionId: string) {
  const manifest = await getImportManifest(sessionId);
  return buildDuplicateDecisionReviewFromManifest(manifest, sessionId);
}

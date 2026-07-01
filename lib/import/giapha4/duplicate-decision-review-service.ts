import "server-only";

import {
  getImportManifest,
  type ImportDuplicateCandidatePreview,
  type ImportManifestReadResult,
} from "@/lib/import/giapha4/manifest-read-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

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

const allowedOwnerDecisions = new Set([
  "unresolved",
  "create_new",
  "link_existing",
  "ignore_candidate",
  "needs_review",
]);

export type DuplicateOwnerDecision =
  | "unresolved"
  | "create_new"
  | "link_existing"
  | "ignore_candidate"
  | "needs_review";

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
  readOnly: false;
  stagingOnly: true;
  canEditDecisions: true;
  canRunOfficialImport: false;
  officialImportButtonDisabled: true;
  editBlockedReasons: string[];
  totalDuplicateCandidates: number;
  unresolvedDuplicateCandidates: number;
  candidates: DuplicateDecisionReviewCandidate[];
  message: string;
};

export type DuplicateDecisionUpdateResult = {
  ok: boolean;
  httpStatus: 200 | 400 | 401 | 403 | 404 | 409 | 422 | 503;
  marker: typeof A16Q_DUPLICATE_DECISION_REVIEW_MARKER;
  stagingOnly: true;
  peopleWrite: false;
  relationshipWrite: false;
  realGenealogyWrite: false;
  canProceedToOfficialImport: false;
  canRunOfficialImport: false;
  duplicateId: string;
  ownerDecision: DuplicateOwnerDecision | null;
  decidedAt: string | null;
  unresolvedDuplicateCount: number;
  needsReviewDuplicateCount: number;
  message: string;
};

type DuplicateCandidateDecisionRow = {
  id: string;
  import_session_id: string;
  existing_person_id: string | null;
  owner_decision: string;
  decided_at: string | null;
};

type DuplicateDecisionCountRow = {
  owner_decision: string;
};

function duplicateUpdateResult(
  overrides: Partial<DuplicateDecisionUpdateResult>,
): DuplicateDecisionUpdateResult {
  return {
    ok: false,
    httpStatus: 503,
    marker: A16Q_DUPLICATE_DECISION_REVIEW_MARKER,
    stagingOnly: true,
    peopleWrite: false,
    relationshipWrite: false,
    realGenealogyWrite: false,
    canProceedToOfficialImport: false,
    canRunOfficialImport: false,
    duplicateId: "",
    ownerDecision: null,
    decidedAt: null,
    unresolvedDuplicateCount: 0,
    needsReviewDuplicateCount: 0,
    message: "Chưa lưu được quyết định ứng viên trùng.",
    ...overrides,
  };
}

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
  const editBlockedReasons: string[] = [];

  return {
    ok: manifest.ok,
    httpStatus: manifest.httpStatus,
    marker: A16Q_DUPLICATE_DECISION_REVIEW_MARKER,
    sessionId,
    readOnly: false,
    stagingOnly: true,
    canEditDecisions: true,
    canRunOfficialImport: false,
    officialImportButtonDisabled: true,
    editBlockedReasons,
    totalDuplicateCandidates: summary.totalDuplicateCandidates,
    unresolvedDuplicateCandidates: summary.unresolvedDuplicateCandidates,
    candidates,
    message: manifest.ok
      ? "Đã đọc ứng viên trùng. Có thể lưu quyết định vào vùng staging; cổng nhập chính thức vẫn khóa."
      : manifest.message,
  };
}

export async function getDuplicateDecisionReview(sessionId: string) {
  const manifest = await getImportManifest(sessionId);
  return buildDuplicateDecisionReviewFromManifest(manifest, sessionId);
}

function normalizeDecision(value: unknown): DuplicateOwnerDecision | null {
  if (typeof value !== "string") return null;
  if (!allowedOwnerDecisions.has(value)) return null;
  return value as DuplicateOwnerDecision;
}

function normalizeDecisionNote(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 500);
}

function countBlockingDecisions(rows: DuplicateDecisionCountRow[]) {
  return {
    unresolvedDuplicateCount: rows.filter(
      (row) => row.owner_decision === "unresolved",
    ).length,
    needsReviewDuplicateCount: rows.filter(
      (row) => row.owner_decision === "needs_review" || row.owner_decision === "hold",
    ).length,
  };
}

export async function updateDuplicateOwnerDecision(input: {
  sessionId: string;
  duplicateId: string;
  ownerDecision: unknown;
  decisionNote: unknown;
}): Promise<DuplicateDecisionUpdateResult> {
  const ownerDecision = normalizeDecision(input.ownerDecision);
  const decisionNote = normalizeDecisionNote(input.decisionNote);

  if (!ownerDecision) {
    return duplicateUpdateResult({
      httpStatus: 400,
      duplicateId: input.duplicateId,
      message: "Quyết định ứng viên trùng không hợp lệ.",
    });
  }

  const context = await getPermissionContext();
  const configMissing =
    context.reason === "missing_supabase_config" ||
    context.reason === "missing_admin_config";

  if (!configMissing && !context.user) {
    return duplicateUpdateResult({
      httpStatus: 401,
      duplicateId: input.duplicateId,
      ownerDecision,
      message: "Bạn cần đăng nhập để lưu quyết định ứng viên trùng.",
    });
  }

  if (
    !configMissing &&
    context.user &&
    !context.permissions.includes("imports.create")
  ) {
    return duplicateUpdateResult({
      httpStatus: 403,
      duplicateId: input.duplicateId,
      ownerDecision,
      message: "Bạn chưa có quyền imports.create để lưu quyết định staging.",
    });
  }

  if (configMissing || !context.profile) {
    return duplicateUpdateResult({
      httpStatus: 503,
      duplicateId: input.duplicateId,
      ownerDecision,
      message:
        "Chưa đủ cấu hình Supabase hoặc hồ sơ đăng nhập để lưu quyết định.",
    });
  }

  const supabase = await maybeCreateServerSupabaseClient();
  if (!supabase) {
    return duplicateUpdateResult({
      httpStatus: 503,
      duplicateId: input.duplicateId,
      ownerDecision,
      message: "Chưa cấu hình Supabase nên chưa thể lưu quyết định.",
    });
  }

  const { data: existingRow, error: readError } = await supabase
    .from("import_duplicate_candidates")
    .select("id, import_session_id, existing_person_id, owner_decision, decided_at")
    .eq("id", input.duplicateId)
    .eq("import_session_id", input.sessionId)
    .maybeSingle<DuplicateCandidateDecisionRow>();

  if (readError) {
    return duplicateUpdateResult({
      httpStatus: 503,
      duplicateId: input.duplicateId,
      ownerDecision,
      message:
        "Không đọc được ứng viên trùng. RLS hoặc quyền staging có thể chưa sẵn sàng.",
    });
  }

  if (!existingRow) {
    return duplicateUpdateResult({
      httpStatus: 404,
      duplicateId: input.duplicateId,
      ownerDecision,
      message:
        "Không tìm thấy ứng viên trùng trong phiên nhập này hoặc bạn không có quyền truy cập.",
    });
  }

  if (ownerDecision === "link_existing" && !existingRow.existing_person_id) {
    return duplicateUpdateResult({
      httpStatus: 422,
      duplicateId: input.duplicateId,
      ownerDecision,
      message:
        "Chỉ được chọn liên kết người đã có khi ứng viên trùng đã có hồ sơ hiện hữu.",
    });
  }

  const decidedAt = new Date().toISOString();
  const { data: updatedRow, error: updateError } = await supabase
    .from("import_duplicate_candidates")
    .update({
      owner_decision: ownerDecision,
      decided_by: context.profile.id,
      decided_at: decidedAt,
      decision_note: decisionNote,
    })
    .eq("id", input.duplicateId)
    .eq("import_session_id", input.sessionId)
    .select("id, owner_decision, decided_at")
    .maybeSingle<Pick<DuplicateCandidateDecisionRow, "id" | "owner_decision" | "decided_at">>();

  if (updateError || !updatedRow) {
    return duplicateUpdateResult({
      httpStatus: 409,
      duplicateId: input.duplicateId,
      ownerDecision,
      message:
        "Chưa lưu được quyết định. RLS UPDATE có thể chưa được apply hoặc row không thuộc phiên nhập này.",
    });
  }

  const { data: countRows, error: countError } = await supabase
    .from("import_duplicate_candidates")
    .select("owner_decision")
    .eq("import_session_id", input.sessionId)
    .returns<DuplicateDecisionCountRow[]>();

  if (countError) {
    return duplicateUpdateResult({
      ok: true,
      httpStatus: 200,
      duplicateId: updatedRow.id,
      ownerDecision: updatedRow.owner_decision as DuplicateOwnerDecision,
      decidedAt: updatedRow.decided_at,
      message:
        "Đã lưu quyết định staging, nhưng chưa đọc lại được tổng số ứng viên trùng.",
    });
  }

  const counts = countBlockingDecisions(countRows ?? []);

  return duplicateUpdateResult({
    ok: true,
    httpStatus: 200,
    duplicateId: updatedRow.id,
    ownerDecision: updatedRow.owner_decision as DuplicateOwnerDecision,
    decidedAt: updatedRow.decided_at,
    unresolvedDuplicateCount: counts.unresolvedDuplicateCount,
    needsReviewDuplicateCount: counts.needsReviewDuplicateCount,
    message:
      "Đã lưu quyết định ứng viên trùng vào vùng staging. Chưa ghi vào cây gia phả thật.",
  });
}

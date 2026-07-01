import "server-only";

import { buildDryRunMappingPreview } from "@/lib/import/giapha4/dry-run-mapping-preview-service";
import { buildImportReviewPackFromManifest } from "@/lib/import/giapha4/import-review-pack-service";
import {
  getImportManifest,
  type ImportManifestReadResult,
} from "@/lib/import/giapha4/manifest-read-service";
import { buildManifestValidationReview } from "@/lib/import/giapha4/manifest-validation-service";
import { A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER } from "@/lib/import/giapha4/official-import-preflight-gate";
import type { PermissionContext } from "@/lib/permissions/permission-service";

export const A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_MARKER =
  "A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE";

export const A16P_TRANSACTION_HELPER_MISSING_BLOCKER =
  "A16P_BLOCKED_TRANSACTION_HELPER_MISSING";

export const A16P_TX_TRANSACTION_RPC_NAME =
  "public.a16p_tx_execute_giapha4_official_import";

export const A16P_TX_TRANSACTION_HELPER_NOT_APPLIED_BLOCKER =
  "BLOCKED_TRANSACTION_HELPER_NOT_APPLIED";

export type OfficialImportCandidateStatus =
  | "BLOCKED"
  | "CANDIDATE_READY_NOT_EXECUTED"
  | "WOULD_IMPORT"
  | "IMPORT_COMPLETED";

export type OfficialImportConfirmation = {
  confirmMarker?: unknown;
  confirmSessionId?: unknown;
  confirmNoValidationErrors?: unknown;
  confirmRollbackReviewed?: unknown;
  confirmAuditReviewed?: unknown;
};

export type OfficialImportCandidateResult = {
  ok: false;
  marker: typeof A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_MARKER;
  requiredMarker: typeof A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER;
  status: OfficialImportCandidateStatus;
  sessionId: string;
  importedPeopleCount: 0;
  importedRelationshipCount: 0;
  skippedCount: number;
  blockedReasons: string[];
  rollbackManifestPreview: {
    available: boolean;
    status: "BLOCKED";
    reason: string;
    wouldTrackCreatedPeople: number;
    wouldTrackCreatedRelationships: number;
  };
  auditManifestPreview: {
    available: boolean;
    status: "BLOCKED";
    reason: string;
    actorProfileId: string | null;
    sourceFileHash: string | null;
  };
  canRunOfficialImport: false;
  piiPrinted: false;
  transactionStatus:
    | "BLOCKED_TRANSACTION_HELPER_MISSING"
    | "BLOCKED_TRANSACTION_HELPER_NOT_APPLIED";
  transactionRpcName: typeof A16P_TX_TRANSACTION_RPC_NAME;
  message: string;
};

function isConfirmed(value: unknown) {
  return value === true;
}

function validateConfirmation(
  sessionId: string,
  confirmation: OfficialImportConfirmation,
) {
  const reasons: string[] = [];

  if (confirmation.confirmMarker !== A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER) {
    reasons.push("confirmMarker không khớp marker session-specific A-16R.");
  }
  if (confirmation.confirmSessionId !== sessionId) {
    reasons.push("confirmSessionId không khớp phiên import đang được yêu cầu.");
  }
  if (!isConfirmed(confirmation.confirmNoValidationErrors)) {
    reasons.push("Chưa xác nhận không còn lỗi validation.");
  }
  if (!isConfirmed(confirmation.confirmRollbackReviewed)) {
    reasons.push("Chưa xác nhận đã rà soát rollback.");
  }
  if (!isConfirmed(confirmation.confirmAuditReviewed)) {
    reasons.push("Chưa xác nhận đã rà soát audit/revision.");
  }

  return reasons;
}

function hasStrictOfficialImportPermission(context: PermissionContext) {
  return (
    context.permissions.includes("imports.create") &&
    context.permissions.includes("people.create") &&
    context.permissions.includes("relationships.create") &&
    context.permissions.includes("permissions.manage")
  );
}

function buildNoGoReasons(params: {
  manifest: ImportManifestReadResult;
  confirmation: OfficialImportConfirmation;
  actor: PermissionContext;
}) {
  const validation = buildManifestValidationReview(params.manifest);
  const dryRun = buildDryRunMappingPreview(params.manifest);
  const reviewPack = buildImportReviewPackFromManifest(params.manifest);
  const reasons: string[] = [
    A16P_TRANSACTION_HELPER_MISSING_BLOCKER,
    A16P_TX_TRANSACTION_HELPER_NOT_APPLIED_BLOCKER,
    "Chưa có RPC/transaction helper an toàn để ghi people, relationships, audit và rollback trong một transaction.",
  ];

  if (!params.actor.user) {
    reasons.push("Người dùng chưa đăng nhập.");
  }
  if (!hasStrictOfficialImportPermission(params.actor)) {
    reasons.push(
      "Thiếu bộ quyền chặt cho nhập chính thức: imports.create, people.create, relationships.create và permissions.manage.",
    );
  }
  if (!params.manifest.ok || !params.manifest.session) {
    reasons.push("Không đọc được import manifest staging hợp lệ.");
  }
  if (params.manifest.session?.status && params.manifest.session.status !== "staged") {
    reasons.push("Import session không ở trạng thái staged để xét nhập chính thức.");
  }
  if (validation.summary.errorCount > 0) {
    reasons.push("Còn lỗi validation trong staging.");
  }
  if (dryRun.summary.blockedByErrorCount > 0) {
    reasons.push("Dry-run preview còn lỗi chặn.");
  }
  if (reviewPack.readiness !== "READY_FOR_OWNER_REVIEW") {
    reasons.push("Review pack chưa sẵn sàng cho owner review.");
  }
  if (params.manifest.duplicateCandidates.some((item) => item.ownerDecision === "pending")) {
    reasons.push("Còn duplicate/conflict chưa có quyết định owner.");
  }
  if (
    params.manifest.relationshipsPreview.some(
      (item) => item.ambiguityStatus && item.ambiguityStatus !== "clear",
    )
  ) {
    reasons.push("Còn quan hệ staging chưa rõ hoặc parent reference chưa được xử lý.");
  }

  reasons.push(...validateConfirmation(params.manifest.session?.id ?? "", params.confirmation));

  return {
    validation,
    dryRun,
    reviewPack,
    reasons: [...new Set(reasons)],
  };
}

export function buildOfficialImportRuntimeCandidate(params: {
  manifest: ImportManifestReadResult;
  confirmation: OfficialImportConfirmation;
  actor: PermissionContext;
}): OfficialImportCandidateResult {
  const sessionId = params.manifest.session?.id ?? String(params.confirmation.confirmSessionId ?? "");
  const { dryRun, reasons } = buildNoGoReasons(params);

  return {
    ok: false,
    marker: A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_MARKER,
    requiredMarker: A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER,
    status: "BLOCKED",
    sessionId,
    importedPeopleCount: 0,
    importedRelationshipCount: 0,
    skippedCount: params.manifest.peoplePreview.length,
    blockedReasons: reasons,
    rollbackManifestPreview: {
      available: false,
      status: "BLOCKED",
      reason: A16P_TRANSACTION_HELPER_MISSING_BLOCKER,
      wouldTrackCreatedPeople: dryRun.summary.proposedPeopleCount,
      wouldTrackCreatedRelationships: dryRun.summary.proposedRelationshipCount,
    },
    auditManifestPreview: {
      available: false,
      status: "BLOCKED",
      reason: A16P_TRANSACTION_HELPER_MISSING_BLOCKER,
      actorProfileId: params.actor.profile?.id ?? null,
      sourceFileHash: params.manifest.session?.sourceFileHash ?? null,
    },
    canRunOfficialImport: false,
    piiPrinted: false,
    transactionStatus: "BLOCKED_TRANSACTION_HELPER_NOT_APPLIED",
    transactionRpcName: A16P_TX_TRANSACTION_RPC_NAME,
    message:
      "Ứng viên nhập chính thức đã được chuẩn bị nhưng chưa thể chạy vì thiếu transaction helper all-or-nothing.",
  };
}

export async function getOfficialImportRuntimeCandidate(params: {
  sessionId: string;
  confirmation: OfficialImportConfirmation;
  actor: PermissionContext;
}) {
  const manifest = await getImportManifest(params.sessionId);

  return buildOfficialImportRuntimeCandidate({
    manifest,
    confirmation: params.confirmation,
    actor: params.actor,
  });
}

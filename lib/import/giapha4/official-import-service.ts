import "server-only";

import { buildDryRunMappingPreview } from "@/lib/import/giapha4/dry-run-mapping-preview-service";
import { buildDuplicateDecisionSummary } from "@/lib/import/giapha4/duplicate-decision-review-service";
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

export const A16S_OFFICIAL_IMPORT_TRANSACTION_EXECUTION_BRANCH_MARKER =
  "A16S_OFFICIAL_IMPORT_TRANSACTION_EXECUTION_BRANCH";

export const A16S_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT_BLOCKER =
  "A16S_BLOCKED_SCHEMA_AUDIT_ROLLBACK_IDEMPOTENCY_INSUFFICIENT";

export const A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA_MARKER =
  "A16T_OFFICIAL_IMPORT_AUDIT_ROLLBACK_IDEMPOTENCY_SCHEMA_CANDIDATE";

export const A16T_SCHEMA_CANDIDATE_NOT_APPLIED_BLOCKER =
  "A16T_BLOCKED_SCHEMA_CANDIDATE_NOT_APPLIED";

export const A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH_MARKER =
  "A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH_CANDIDATE";

export const A16U_LOCKED_RUNTIME_WIRING_MARKER =
  "A16U_LOCKED_RUNTIME_WIRING";

export const A16U_VERIFY_RUNBOOK_MARKER = "A16U_VERIFY_RUNBOOK";

export const A16U_LOCKED_RUNTIME_GUARD =
  "A16U_LOCKED_RUNTIME_GUARD_A16R_RETRY_REQUIRED";

export const A16U_REQUIRED_SESSION_ID =
  "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

export const A16U_REQUIRED_A16R_RETRY_MARKER =
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

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
    | "BLOCKED_TRANSACTION_HELPER_NOT_APPLIED"
    | "A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED";
  transactionRpcName: typeof A16P_TX_TRANSACTION_RPC_NAME;
  transactionBranchContract: {
    marker: typeof A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH_MARKER;
    sqlCandidateRequired: false;
    allOrNothing: true;
    idempotencyGuard: "import_session_id";
    auditBatchTable: "official_import_batches";
    rollbackManifestTable: "official_import_rollback_manifests";
    canRunOfficialImport: false;
    requiredExecutionMarker: typeof A16U_REQUIRED_A16R_RETRY_MARKER;
  };
  auditBatchContract: {
    table: "official_import_batches";
    expectedFields: [
      "import_session_id",
      "idempotency_key",
      "created_people_count",
      "created_relationship_count",
    ];
  };
  rollbackManifestContract: {
    table: "official_import_rollback_manifests";
    expectedFields: ["import_batch_id", "import_session_id", "created_people_ids"];
  };
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

  if (confirmation.confirmMarker !== A16U_REQUIRED_A16R_RETRY_MARKER) {
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
  const duplicateDecisionSummary = buildDuplicateDecisionSummary(params.manifest);
  const reasons: string[] = [
    A16U_LOCKED_RUNTIME_GUARD,
    "Nhánh transaction A-16U đã chuẩn bị contract all-or-nothing nhưng vẫn khóa chạy thật đến phase A-16R-RUN-RETRY riêng.",
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
  if (params.manifest.session?.id && params.manifest.session.id !== A16U_REQUIRED_SESSION_ID) {
    reasons.push("Phiên import không khớp session đã được preflight cho A-16U.");
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
  if (duplicateDecisionSummary.unresolvedDuplicateCandidates > 0) {
    reasons.push("Còn ứng viên trùng chưa có quyết định owner.");
  }
  if (duplicateDecisionSummary.needsReviewDuplicateCandidates > 0) {
    reasons.push("Còn ứng viên trùng đang ở trạng thái cần chủ nhà rà soát.");
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
      available: true,
      status: "BLOCKED",
      reason: A16U_LOCKED_RUNTIME_GUARD,
      wouldTrackCreatedPeople: dryRun.summary.proposedPeopleCount,
      wouldTrackCreatedRelationships: dryRun.summary.proposedRelationshipCount,
    },
    auditManifestPreview: {
      available: true,
      status: "BLOCKED",
      reason: A16U_LOCKED_RUNTIME_GUARD,
      actorProfileId: params.actor.profile?.id ?? null,
      sourceFileHash: params.manifest.session?.sourceFileHash ?? null,
    },
    canRunOfficialImport: false,
    piiPrinted: false,
    transactionStatus: "A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED",
    transactionRpcName: A16P_TX_TRANSACTION_RPC_NAME,
    transactionBranchContract: {
      marker: A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH_MARKER,
      sqlCandidateRequired: false,
      allOrNothing: true,
      idempotencyGuard: "import_session_id",
      auditBatchTable: "official_import_batches",
      rollbackManifestTable: "official_import_rollback_manifests",
      canRunOfficialImport: false,
      requiredExecutionMarker: A16U_REQUIRED_A16R_RETRY_MARKER,
    },
    auditBatchContract: {
      table: "official_import_batches",
      expectedFields: [
        "import_session_id",
        "idempotency_key",
        "created_people_count",
        "created_relationship_count",
      ],
    },
    rollbackManifestContract: {
      table: "official_import_rollback_manifests",
      expectedFields: ["import_batch_id", "import_session_id", "created_people_ids"],
    },
    message:
      "Nhánh transaction A-16U đã sẵn sàng ở trạng thái khóa, vẫn chưa chạy nhập chính thức và phải chờ marker A-16R-RUN-RETRY riêng.",
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

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

export const A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_MARKER =
  "A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_CANDIDATE";

export const A16V_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED_BLOCKER =
  "A16V_BLOCKED_REAL_TRANSACTION_BRANCH_NOT_APPLIED_OR_VERIFIED";

export const A16R_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY_BLOCKER =
  "A16R_BLOCKED_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY";

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
  confirmNoDryRunBlockers?: unknown;
  confirmDuplicateDecisionsComplete?: unknown;
  confirmA16TApplyVerified?: unknown;
  confirmA16ULockedBranchReady?: unknown;
  confirmA16VApplyVerified?: unknown;
  confirmA16VRealTransactionBranchReady?: unknown;
  confirmProductionUiVisible?: unknown;
  confirmProductionDeployReady?: unknown;
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
    | "A16U_LOCKED_TRANSACTION_BRANCH_READY_NOT_EXECUTED"
    | "A16V_OWNER_VERIFIED_RUNTIME_STILL_DISABLED";
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
  realTransactionExecutionBranchCandidate: {
    marker: typeof A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_MARKER;
    sqlCandidateStatus: "OWNER_APPLIED_VERIFIED";
    verificationEvidenceSource: "docs/PLAN_A16V_APPLY_VERIFY.md";
    canonicalRpcName: typeof A16P_TX_TRANSACTION_RPC_NAME;
    allOrNothing: true;
    idempotencyGuard: "import_session_id";
    auditBatchTable: "official_import_batches";
    rollbackManifestTable: "official_import_rollback_manifests";
    canRunOfficialImport: false;
    blocker: typeof A16R_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY_BLOCKER;
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
    reasons.push("confirmMarker khÃ´ng khá»›p marker session-specific A-16R.");
  }
  if (confirmation.confirmSessionId !== sessionId) {
    reasons.push("confirmSessionId khÃ´ng khá»›p phiÃªn import Ä‘ang Ä‘Æ°á»£c yÃªu cáº§u.");
  }
  if (!isConfirmed(confirmation.confirmNoValidationErrors)) {
    reasons.push("ChÆ°a xÃ¡c nháº­n khÃ´ng cÃ²n lá»—i validation.");
  }
  if (!isConfirmed(confirmation.confirmNoDryRunBlockers)) {
    reasons.push("ChÃ†Â°a xÃƒÂ¡c nhÃ¡ÂºÂ­n dry-run blockers bÃ¡ÂºÂ±ng 0.");
  }
  if (!isConfirmed(confirmation.confirmDuplicateDecisionsComplete)) {
    reasons.push("ChÃ†Â°a xÃƒÂ¡c nhÃ¡ÂºÂ­n duplicate unresolved/needs_review bÃ¡ÂºÂ±ng 0.");
  }
  if (!isConfirmed(confirmation.confirmA16TApplyVerified)) {
    reasons.push("ChÃ†Â°a xÃƒÂ¡c nhÃ¡ÂºÂ­n A-16T schema Ã„â€˜ÃƒÂ£ apply/verify PASS.");
  }
  if (!isConfirmed(confirmation.confirmA16ULockedBranchReady)) {
    reasons.push("ChÃ†Â°a xÃƒÂ¡c nhÃ¡ÂºÂ­n A-16U locked transaction branch Ã„â€˜ÃƒÂ£ ready.");
  }
  if (!isConfirmed(confirmation.confirmA16VApplyVerified)) {
    reasons.push("Chưa xác nhận A-16V đã owner apply/verify PASS.");
  }
  if (!isConfirmed(confirmation.confirmA16VRealTransactionBranchReady)) {
    reasons.push("Chưa xác nhận A-16V real transaction branch ready.");
  }
  if (!isConfirmed(confirmation.confirmProductionUiVisible)) {
    reasons.push("ChÃ†Â°a xÃƒÂ¡c nhÃ¡ÂºÂ­n production UI nhÃ¡ÂºÂ­p Excel Ã„â€˜ÃƒÂ£ hiÃ¡Â»Æ’n thÃ¡Â»â€¹.");
  }
  if (!isConfirmed(confirmation.confirmProductionDeployReady)) {
    reasons.push("Chưa xác nhận production đã deploy bản A-16V.");
  }
  if (!isConfirmed(confirmation.confirmRollbackReviewed)) {
    reasons.push("ChÆ°a xÃ¡c nháº­n Ä‘Ã£ rÃ  soÃ¡t rollback.");
  }
  if (!isConfirmed(confirmation.confirmAuditReviewed)) {
    reasons.push("ChÆ°a xÃ¡c nháº­n Ä‘Ã£ rÃ  soÃ¡t audit/revision.");
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
    A16R_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY_BLOCKER,
    "A-16V đã có owner apply/verify PASS nhưng runtime execution vẫn chưa được bật; route/service chưa được phép gọi RPC nhập chính thức.",
  ];

  if (!params.actor.user) {
    reasons.push("NgÆ°á»i dÃ¹ng chÆ°a Ä‘Äƒng nháº­p.");
  }
  if (!hasStrictOfficialImportPermission(params.actor)) {
    reasons.push(
      "Thiáº¿u bá»™ quyá»n cháº·t cho nháº­p chÃ­nh thá»©c: imports.create, people.create, relationships.create vÃ  permissions.manage.",
    );
  }
  if (!params.manifest.ok || !params.manifest.session) {
    reasons.push("KhÃ´ng Ä‘á»c Ä‘Æ°á»£c import manifest staging há»£p lá»‡.");
  }
  if (params.manifest.session?.status && params.manifest.session.status !== "staged") {
    reasons.push("Import session khÃ´ng á»Ÿ tráº¡ng thÃ¡i staged Ä‘á»ƒ xÃ©t nháº­p chÃ­nh thá»©c.");
  }
  if (params.manifest.session?.id && params.manifest.session.id !== A16U_REQUIRED_SESSION_ID) {
    reasons.push("PhiÃªn import khÃ´ng khá»›p session Ä‘Ã£ Ä‘Æ°á»£c preflight cho A-16U.");
  }
  if (validation.summary.errorCount > 0) {
    reasons.push("CÃ²n lá»—i validation trong staging.");
  }
  if (dryRun.summary.blockedByErrorCount > 0) {
    reasons.push("Dry-run preview cÃ²n lá»—i cháº·n.");
  }
  if (reviewPack.readiness !== "READY_FOR_OWNER_REVIEW") {
    reasons.push("Review pack chÆ°a sáºµn sÃ ng cho owner review.");
  }
  if (duplicateDecisionSummary.unresolvedDuplicateCandidates > 0) {
    reasons.push("CÃ²n á»©ng viÃªn trÃ¹ng chÆ°a cÃ³ quyáº¿t Ä‘á»‹nh owner.");
  }
  if (duplicateDecisionSummary.needsReviewDuplicateCandidates > 0) {
    reasons.push("CÃ²n á»©ng viÃªn trÃ¹ng Ä‘ang á»Ÿ tráº¡ng thÃ¡i cáº§n chá»§ nhÃ  rÃ  soÃ¡t.");
  }
  if (
    params.manifest.relationshipsPreview.some(
      (item) => item.ambiguityStatus && item.ambiguityStatus !== "clear",
    )
  ) {
    reasons.push("CÃ²n quan há»‡ staging chÆ°a rÃµ hoáº·c parent reference chÆ°a Ä‘Æ°á»£c xá»­ lÃ½.");
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
    transactionStatus: "A16V_OWNER_VERIFIED_RUNTIME_STILL_DISABLED",
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
    realTransactionExecutionBranchCandidate: {
      marker: A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH_MARKER,
      sqlCandidateStatus: "OWNER_APPLIED_VERIFIED",
      verificationEvidenceSource: "docs/PLAN_A16V_APPLY_VERIFY.md",
      canonicalRpcName: A16P_TX_TRANSACTION_RPC_NAME,
      allOrNothing: true,
      idempotencyGuard: "import_session_id",
      auditBatchTable: "official_import_batches",
      rollbackManifestTable: "official_import_rollback_manifests",
      canRunOfficialImport: false,
      blocker: A16R_RUNTIME_EXECUTION_NOT_ENABLED_AFTER_A16V_VERIFY_BLOCKER,
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
      "A-16V đã owner apply/verify PASS, nhưng runtime nhập chính thức vẫn khóa và chưa gọi RPC. Cần phase enablement riêng trước khi chạy A-16R.",
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

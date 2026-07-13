import "server-only";

import { buildDryRunMappingPreview } from "@/lib/import/giapha4/dry-run-mapping-preview-service";
import { buildDuplicateDecisionSummary } from "@/lib/import/giapha4/duplicate-decision-review-service";
import {
  getImportManifest,
  type ImportManifestReadResult,
} from "@/lib/import/giapha4/manifest-read-service";
import { buildManifestValidationReview } from "@/lib/import/giapha4/manifest-validation-service";

export const A16I5_IMPORT_REVIEW_PACK_GATE_MARKER =
  "A16I5_IMPORT_REVIEW_PACK_OFFICIAL_IMPORT_GATE";

export type ImportReviewPackReadiness =
  | "READY_FOR_OWNER_REVIEW"
  | "NOT_READY";

export type ImportReviewPack = {
  marker: typeof A16I5_IMPORT_REVIEW_PACK_GATE_MARKER;
  previewOnly: true;
  canProceedToOfficialImport: false;
  readyForOfficialImport: false;
  readiness: ImportReviewPackReadiness;
  sessionId: string | null;
  sourceFileExtension: string | null;
  sourceFileSizeBytes: number | null;
  sourceFileHash: string | null;
  parseSummary: Record<string, unknown> | null;
  validationSummary: {
    peopleCount: number;
    relationshipCount: number;
    peoplePreviewCount: number;
    relationshipPreviewCount: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    topIssueCodes: string[];
  };
  dryRunSummary: {
    proposedPeopleCount: number;
    proposedPeoplePreviewCount: number;
    proposedRelationshipCount: number;
    proposedRelationshipPreviewCount: number;
    blockedByErrorCount: number;
    warningCount: number;
    sourceChildRelationshipCount: number;
    canonicalFamilyGroupCount: number;
    plannedNewFamilyCount: number;
    plannedReusedFamilyCount: number;
    plannedParentMembershipCount: number;
    plannedChildMembershipCount: number;
    duplicateParentRowsRemoved: number;
    duplicateChildRowsRemoved: number;
    ownerReviewFamilyGroupCount: number;
    blockedFamilyGroupCount: number;
  };
  duplicateDecisionSummary: {
    totalDuplicateCandidates: number;
    unresolvedDuplicateCandidates: number;
    needsReviewDuplicateCandidates: number;
    finalizedDuplicateCandidates: number;
    canRunOfficialImport: false;
  };
  ownerReviewNotes: string[];
};

function getFileExtension(fileName: string | null) {
  if (!fileName) return null;
  const match = fileName.match(/\.([a-z0-9]+)$/i);
  return match ? `.${match[1].toLowerCase()}` : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function extractParseSummary(result: ImportManifestReadResult) {
  const session = result.session ?? null;
  const reviewSummary = asRecord(session?.reviewSummary);
  const parseSummary = asRecord(reviewSummary?.parse_summary);
  return parseSummary;
}

export function buildImportReviewPackFromManifest(
  result: ImportManifestReadResult,
): ImportReviewPack {
  const session = result.session ?? null;
  const validation = buildManifestValidationReview(result);
  const dryRunPreview = buildDryRunMappingPreview(result);
  const duplicateDecisionSummary = buildDuplicateDecisionSummary(result);
  const parseSummary = extractParseSummary(result);
  const topIssueCodes = validation.issues
    .map((issue) => issue.code)
    .filter((code, index, list) => list.indexOf(code) === index)
    .slice(0, 12);
  const isReadyForOwnerReview =
    Boolean(result.ok && session) &&
    validation.summary.errorCount === 0 &&
    dryRunPreview.summary.blockedByErrorCount === 0 &&
    duplicateDecisionSummary.unresolvedDuplicateCandidates === 0 &&
    duplicateDecisionSummary.needsReviewDuplicateCandidates === 0 &&
    dryRunPreview.summary.proposedPeopleCount > 0;

  return {
    marker: A16I5_IMPORT_REVIEW_PACK_GATE_MARKER,
    previewOnly: true,
    canProceedToOfficialImport: false,
    readyForOfficialImport: false,
    readiness: isReadyForOwnerReview ? "READY_FOR_OWNER_REVIEW" : "NOT_READY",
    sessionId: session?.id ?? null,
    sourceFileExtension: getFileExtension(session?.sourceFileName ?? null),
    sourceFileSizeBytes: session?.sourceFileSizeBytes ?? null,
    sourceFileHash: session?.sourceFileHash ?? null,
    parseSummary,
    validationSummary: {
      peopleCount: validation.summary.peopleCount,
      relationshipCount: validation.summary.relationshipCount,
      peoplePreviewCount: validation.summary.peoplePreviewCount,
      relationshipPreviewCount: validation.summary.relationshipPreviewCount,
      errorCount: validation.summary.errorCount,
      warningCount: validation.summary.warningCount,
      infoCount: validation.summary.infoCount,
      topIssueCodes,
    },
    dryRunSummary: {
      proposedPeopleCount: dryRunPreview.summary.proposedPeopleCount,
      proposedPeoplePreviewCount:
        dryRunPreview.summary.proposedPeoplePreviewCount,
      proposedRelationshipCount: dryRunPreview.summary.proposedRelationshipCount,
      proposedRelationshipPreviewCount:
        dryRunPreview.summary.proposedRelationshipPreviewCount,
      blockedByErrorCount: dryRunPreview.summary.blockedByErrorCount,
      warningCount: dryRunPreview.summary.warningCount,
      sourceChildRelationshipCount:
        dryRunPreview.summary.groupedFamilyImportPlan.sourceChildRelationshipCount,
      canonicalFamilyGroupCount:
        dryRunPreview.summary.groupedFamilyImportPlan.canonicalFamilyGroupCount,
      plannedNewFamilyCount:
        dryRunPreview.summary.groupedFamilyImportPlan.plannedNewFamilyCount,
      plannedReusedFamilyCount:
        dryRunPreview.summary.groupedFamilyImportPlan.plannedReusedFamilyCount,
      plannedParentMembershipCount:
        dryRunPreview.summary.groupedFamilyImportPlan.plannedParentMembershipCount,
      plannedChildMembershipCount:
        dryRunPreview.summary.groupedFamilyImportPlan.plannedChildMembershipCount,
      duplicateParentRowsRemoved:
        dryRunPreview.summary.groupedFamilyImportPlan.duplicateParentRowsRemoved,
      duplicateChildRowsRemoved:
        dryRunPreview.summary.groupedFamilyImportPlan.duplicateChildRowsRemoved,
      ownerReviewFamilyGroupCount:
        dryRunPreview.summary.groupedFamilyImportPlan.ownerReviewFamilyGroupCount,
      blockedFamilyGroupCount:
        dryRunPreview.summary.groupedFamilyImportPlan.blockedFamilyGroupCount,
    },
    duplicateDecisionSummary,
    ownerReviewNotes: [
      "Gói rà soát này chỉ đọc dữ liệu import staging.",
      "Ứng viên trùng phải có quyết định cuối cùng trước khi xét nhập chính thức.",
      "Chưa ghi thành viên thật, quan hệ thật, layout cây hoặc revision.",
      "Chưa mở bước nhập chính thức; cần phase riêng và phê duyệt owner.",
    ],
  };
}

export async function getImportReviewPack(sessionId: string) {
  const result = await getImportManifest(sessionId);
  return {
    ok: result.ok,
    httpStatus: result.httpStatus,
    message: result.message,
    pack: buildImportReviewPackFromManifest(result),
  };
}

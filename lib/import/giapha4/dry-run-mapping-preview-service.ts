import "server-only";

import {
  buildA17OGroupedImportPreviewCounts,
  type A17OGroupedImportPlanCounts,
} from "@/lib/import/giapha4/canonical-family-grouping";
import {
  A16K_AUDITED_DRY_RUN_SESSION_ID,
  A16K_IMPORT_DRY_RUN_REQUIRED_MARKER,
  getImportDryRunApprovalGate,
} from "@/lib/import/giapha4/import-dry-run-approval-gate";
import {
  getImportManifest,
  type ImportManifestReadResult,
  type ImportPersonCandidatePreview,
  type ImportRelationshipCandidatePreview,
} from "@/lib/import/giapha4/manifest-read-service";
import {
  buildManifestValidationReview,
  type ManifestValidationIssue,
} from "@/lib/import/giapha4/manifest-validation-service";

export const A16L_DRY_RUN_MAPPING_PREVIEW_MARKER =
  "A16L_DRY_RUN_MAPPING_PREVIEW_FROM_MANIFEST_STAGING";

export const A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_MARKER =
  "A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY";

export const A16L_DRY_RUN_APPROVAL_MARKER =
  "APPROVE_A16K_IMPORT_DRY_RUN_GATE";

const approvalMarker: typeof A16K_IMPORT_DRY_RUN_REQUIRED_MARKER =
  A16L_DRY_RUN_APPROVAL_MARKER;

export type ProposedPersonPayload = {
  sourceRowIndex: number;
  sourceFingerprint: string;
  externalId: string | null;
  fullName: string;
  displayName: string | null;
  alternateName: string | null;
  gender: string;
  birthDateText: string | null;
  deathDateText: string | null;
  memorialLunarDate: string | null;
  ageAtDeath: number | null;
  isLiving: boolean | null;
  birthPlace: string | null;
  homeTown: string | null;
  branchName: string | null;
  generationNumber: number | null;
  visibility: string;
  sourceReference: {
    source: "import_write_manifests.approved_scope.person_candidates";
    fingerprint: string;
    rowNumber: number;
  };
  relatedIssues: ManifestValidationIssue[];
};

export type ProposedRelationshipPayload = {
  sourceRowIndex: number;
  relationshipType: string;
  relationshipLabelVi: string;
  sourcePersonFingerprint: string;
  relatedPersonFingerprint: string | null;
  targetExistingPersonId: string | null;
  confidence: string;
  ambiguityStatus: string;
  sourceReference: {
    source: "import_relationship_candidates";
    fingerprint: string;
    rowNumber: number;
  };
  relatedIssues: ManifestValidationIssue[];
};

export type DryRunMappingPreviewSummary = {
  stagedPeopleCount: number;
  stagedPeoplePreviewCount: number;
  proposedPeopleCount: number;
  proposedPeoplePreviewCount: number;
  proposedPeopleExportCount?: number;
  stagedRelationshipCount: number;
  stagedRelationshipPreviewCount: number;
  proposedRelationshipCount: number;
  proposedRelationshipPreviewCount: number;
  proposedRelationshipExportCount?: number;
  blockedByErrorCount: number;
  warningCount: number;
  canProceedToOfficialImport: false;
  exportCapped?: false;
  groupedFamilyImportPlan: A17OGroupedImportPlanCounts & {
    previewExplanationVi: "Các anh, chị, em có cùng cha mẹ sẽ được nhập vào cùng một gia đình.";
    dryRunSourceOnly: true;
    groupedExecutorMutationCall: false;
  };
};

export type DryRunMappingPreviewResult = {
  ok: boolean;
  status: ImportManifestReadResult["status"];
  httpStatus: ImportManifestReadResult["httpStatus"];
  marker:
    | typeof A16L_DRY_RUN_MAPPING_PREVIEW_MARKER
    | typeof A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_MARKER;
  sourceMarker?: typeof A16L_DRY_RUN_MAPPING_PREVIEW_MARKER;
  approvalMarker: typeof A16K_IMPORT_DRY_RUN_REQUIRED_MARKER;
  dryRunPreviewOnly: true;
  auditExportOnly?: true;
  fullRelationshipAuditExport?: true;
  readOnly: true;
  dbWrite: false;
  peopleWrite: false;
  relationshipWrite: false;
  treeLayoutWrite: false;
  revisionWrite: false;
  canProceedToOfficialImport: false;
  officialImportOpen: false;
  sessionId: string | null;
  message: string;
  summary: DryRunMappingPreviewSummary;
  proposedPeople: ProposedPersonPayload[];
  proposedRelationships: ProposedRelationshipPayload[];
  issues: ManifestValidationIssue[];
};

export type DryRunMappingPreviewOptions = {
  auditExport?: "relationships-full";
};

function issueMatchesPerson(
  issue: ManifestValidationIssue,
  person: ImportPersonCandidatePreview,
) {
  return (
    issue.entityType === "person" &&
    (issue.entityKey === person.fingerprint ||
      issue.rowNumber === person.sourceRowIndex)
  );
}

function issueMatchesRelationship(
  issue: ManifestValidationIssue,
  relationship: ImportRelationshipCandidatePreview,
) {
  return (
    issue.entityType === "relationship" &&
    (issue.entityKey === relationship.id ||
      issue.rowNumber === relationship.sourceRowIndex)
  );
}

function mapPerson(
  person: ImportPersonCandidatePreview,
  issues: ManifestValidationIssue[],
): ProposedPersonPayload {
  return {
    sourceRowIndex: person.sourceRowIndex,
    sourceFingerprint: person.fingerprint,
    externalId: person.externalId,
    fullName: person.fullName,
    displayName: person.displayName,
    alternateName: person.alternateName,
    gender: person.gender,
    birthDateText: person.birthDateText,
    deathDateText: person.deathDateText,
    memorialLunarDate: person.memorialLunarDate,
    ageAtDeath: person.ageAtDeath,
    isLiving: person.isLiving,
    birthPlace: person.birthPlace,
    homeTown: person.homeTown,
    branchName: person.branchName,
    generationNumber: person.generationNumber,
    visibility: person.visibility,
    sourceReference: {
      source: "import_write_manifests.approved_scope.person_candidates",
      fingerprint: person.fingerprint,
      rowNumber: person.sourceRowIndex,
    },
    relatedIssues: issues.filter((issue) => issueMatchesPerson(issue, person)),
  };
}

function mapRelationship(
  relationship: ImportRelationshipCandidatePreview,
  issues: ManifestValidationIssue[],
): ProposedRelationshipPayload {
  return {
    sourceRowIndex: relationship.sourceRowIndex,
    relationshipType: relationship.relationshipType,
    relationshipLabelVi: relationship.relationshipLabelVi,
    sourcePersonFingerprint: relationship.sourcePersonFingerprint,
    relatedPersonFingerprint: relationship.relatedPersonFingerprint,
    targetExistingPersonId: relationship.targetExistingPersonId,
    confidence: relationship.confidence,
    ambiguityStatus: relationship.ambiguityStatus,
    sourceReference: {
      source: "import_relationship_candidates",
      fingerprint: relationship.id,
      rowNumber: relationship.sourceRowIndex,
    },
    relatedIssues: issues.filter((issue) =>
      issueMatchesRelationship(issue, relationship),
    ),
  };
}

export function buildDryRunMappingPreview(
  manifest: ImportManifestReadResult,
  options: DryRunMappingPreviewOptions = {},
): DryRunMappingPreviewResult {
  const fullRelationshipAuditExport =
    options.auditExport === "relationships-full";
  const validation = buildManifestValidationReview(manifest);
  const blockedByErrorCount = validation.summary.errorCount;
  const warningCount = validation.summary.warningCount;

  const proposedPeople = manifest.ok
    ? manifest.peoplePreview.map((person) => mapPerson(person, validation.issues))
    : [];
  const proposedRelationships = manifest.ok
    ? manifest.relationshipsPreview.map((relationship) =>
        mapRelationship(relationship, validation.issues),
      )
    : [];
  const sessionId = manifest.session?.id ?? null;
  const stagedPeopleCount =
    manifest.session?.personCandidateCount ?? manifest.peoplePreview.length;
  const stagedRelationshipCount =
    manifest.session?.relationshipCandidateCount ??
    manifest.relationshipsPreview.length;
  const groupedFamilyImportPlan = buildA17OGroupedImportPreviewCounts(manifest);

  const result: DryRunMappingPreviewResult = {
    ok: manifest.ok,
    status: manifest.status,
    httpStatus: manifest.httpStatus,
    marker: fullRelationshipAuditExport
      ? A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_MARKER
      : A16L_DRY_RUN_MAPPING_PREVIEW_MARKER,
    approvalMarker,
    dryRunPreviewOnly: true,
    readOnly: true,
    dbWrite: false,
    peopleWrite: false,
    relationshipWrite: false,
    treeLayoutWrite: false,
    revisionWrite: false,
    canProceedToOfficialImport: false,
    officialImportOpen: false,
    sessionId,
    message:
      blockedByErrorCount > 0
        ? "Không thể dry-run vì còn lỗi dữ liệu staging."
        : "Đã tạo bản xem trước dry-run ở chế độ chỉ đọc.",
    summary: {
      stagedPeopleCount,
      stagedPeoplePreviewCount: manifest.peoplePreview.length,
      proposedPeopleCount: stagedPeopleCount,
      proposedPeoplePreviewCount: proposedPeople.length,
      stagedRelationshipCount,
      stagedRelationshipPreviewCount: manifest.relationshipsPreview.length,
      proposedRelationshipCount: stagedRelationshipCount,
      proposedRelationshipPreviewCount: proposedRelationships.length,
      blockedByErrorCount,
      warningCount,
      canProceedToOfficialImport: false,
      groupedFamilyImportPlan: {
        ...groupedFamilyImportPlan,
        previewExplanationVi:
          "Các anh, chị, em có cùng cha mẹ sẽ được nhập vào cùng một gia đình.",
        dryRunSourceOnly: true,
        groupedExecutorMutationCall: false,
      },
    },
    proposedPeople,
    proposedRelationships,
    issues: validation.issues,
  };

  if (fullRelationshipAuditExport) {
    result.sourceMarker = A16L_DRY_RUN_MAPPING_PREVIEW_MARKER;
    result.auditExportOnly = true;
    result.fullRelationshipAuditExport = true;
    result.summary.proposedPeopleExportCount = proposedPeople.length;
    result.summary.proposedRelationshipExportCount =
      proposedRelationships.length;
    result.summary.exportCapped = false;
  }

  return result;
}

export async function getDryRunMappingPreview(
  sessionId: string,
  options: DryRunMappingPreviewOptions = {},
): Promise<DryRunMappingPreviewResult> {
  const fullRelationshipAuditExport =
    options.auditExport === "relationships-full";
  if (fullRelationshipAuditExport) {
    const dryRunGate = getImportDryRunApprovalGate(sessionId);
    const sessionMatchesAudited = sessionId === A16K_AUDITED_DRY_RUN_SESSION_ID;

    if (!sessionMatchesAudited || !dryRunGate.dryRunGate.canRunDryRun) {
      const manifest = await getImportManifest(sessionId);
      return {
        ...buildDryRunMappingPreview(manifest, options),
        ok: false,
        status: manifest.status === "ready" ? "forbidden" : manifest.status,
        httpStatus: 403,
        message:
          "Full relationship audit export is locked to the A-16K audited dry-run session.",
      };
    }
  }

  const manifest = await getImportManifest(sessionId, {
    fullAuditExport: fullRelationshipAuditExport,
  });
  return buildDryRunMappingPreview(manifest, options);
}

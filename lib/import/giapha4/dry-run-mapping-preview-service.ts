import "server-only";

import {
  A16K_IMPORT_DRY_RUN_REQUIRED_MARKER,
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
  proposedPeopleCount: number;
  stagedRelationshipCount: number;
  proposedRelationshipCount: number;
  blockedByErrorCount: number;
  warningCount: number;
  canProceedToOfficialImport: false;
};

export type DryRunMappingPreviewResult = {
  ok: boolean;
  status: ImportManifestReadResult["status"];
  httpStatus: ImportManifestReadResult["httpStatus"];
  marker: typeof A16L_DRY_RUN_MAPPING_PREVIEW_MARKER;
  approvalMarker: typeof A16K_IMPORT_DRY_RUN_REQUIRED_MARKER;
  dryRunPreviewOnly: true;
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
): DryRunMappingPreviewResult {
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

  return {
    ok: manifest.ok,
    status: manifest.status,
    httpStatus: manifest.httpStatus,
    marker: A16L_DRY_RUN_MAPPING_PREVIEW_MARKER,
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
      stagedPeopleCount: manifest.peoplePreview.length,
      proposedPeopleCount: proposedPeople.length,
      stagedRelationshipCount: manifest.relationshipsPreview.length,
      proposedRelationshipCount: proposedRelationships.length,
      blockedByErrorCount,
      warningCount,
      canProceedToOfficialImport: false,
    },
    proposedPeople,
    proposedRelationships,
    issues: validation.issues,
  };
}

export async function getDryRunMappingPreview(
  sessionId: string,
): Promise<DryRunMappingPreviewResult> {
  const manifest = await getImportManifest(sessionId);
  return buildDryRunMappingPreview(manifest);
}

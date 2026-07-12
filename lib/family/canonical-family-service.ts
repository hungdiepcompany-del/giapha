import "server-only";

import { buildCanonicalFamilyIdentity } from "@/lib/family/canonical-family-identity";
import type { CanonicalFamilyRepository } from "@/lib/family/canonical-family-repository";
import type {
  CanonicalFamilyDecision,
  CanonicalFamilyIdentityInput,
  CanonicalFamilyLookupResult,
  CanonicalFamilyMutationPlan,
  LegacyFamilyCandidate,
} from "@/lib/family/canonical-family-types";
import type { CanonicalFamilyBlocker } from "@/lib/family/canonical-family-errors";

export type CanonicalFamilyReuseDecisionInput = {
  identityStatus: "VALID" | "OWNER_REVIEW_REQUIRED" | "BLOCKED_AMBIGUOUS";
  lookup: CanonicalFamilyLookupResult | null;
  legacyCandidates: LegacyFamilyCandidate[];
  missingPersonCount: number;
  metadataConflict: boolean;
  relationshipPeriodAmbiguous: boolean;
};

export function decideCanonicalFamilyReuseOrCreate(
  input: CanonicalFamilyReuseDecisionInput,
): CanonicalFamilyDecision {
  if (input.missingPersonCount > 0 || input.identityStatus === "BLOCKED_AMBIGUOUS") {
    return "BLOCKED_AMBIGUOUS";
  }

  if (input.lookup?.status === "BLOCKED_INVARIANT_VIOLATION") {
    return "BLOCKED_INVARIANT_VIOLATION";
  }

  if (
    input.identityStatus === "OWNER_REVIEW_REQUIRED" ||
    input.lookup?.status === "OWNER_REVIEW_REQUIRED" ||
    input.legacyCandidates.length > 0 ||
    input.metadataConflict ||
    input.relationshipPeriodAmbiguous
  ) {
    return "OWNER_REVIEW_REQUIRED";
  }

  if (input.lookup?.status === "FOUND") {
    if (input.lookup.family.canonicalStatus === "merged") {
      return "OWNER_REVIEW_REQUIRED";
    }
    if (input.lookup.family.canonicalStatus === "voided") {
      return "OWNER_REVIEW_REQUIRED";
    }
    return "REUSE_CANONICAL";
  }

  return "CREATE_NEW_CANONICAL";
}

function blocker(code: CanonicalFamilyBlocker["code"]): CanonicalFamilyBlocker {
  return {
    code,
    operation: "PLAN_CANONICAL_FAMILY_MUTATION",
  };
}

export async function planCanonicalFamilyMutation(params: {
  repository: CanonicalFamilyRepository;
  input: CanonicalFamilyIdentityInput;
  childIds?: string[];
  metadataConflict?: boolean;
  relationshipPeriodAmbiguous?: boolean;
}): Promise<CanonicalFamilyMutationPlan> {
  const identity = buildCanonicalFamilyIdentity(params.input);
  const parentIds = identity.payload?.parentIds ?? [];
  const children = params.childIds ?? [];
  const blockers: CanonicalFamilyBlocker[] =
    identity.status === "VALID" ? [] : identity.blockers;
  const peopleValidation = await params.repository.validatePeopleExist([
    ...parentIds,
    ...children,
  ]);

  if (peopleValidation.status === "MISSING_PERSON_REFERENCE") {
    blockers.push({
      ...blocker("CANONICAL_FAMILY_PERSON_REFERENCE_MISSING"),
      counts: { missingPersonCount: peopleValidation.missingPersonIds.length },
    });
  }

  const lookup =
    identity.status === "VALID"
      ? await params.repository.findCanonicalByKey(identity.canonicalKey)
      : null;
  const legacyCandidates =
    identity.status === "VALID"
      ? await params.repository.findLegacyCandidatesByParentSet(parentIds)
      : [];

  if (legacyCandidates.length > 0) {
    blockers.push({
      ...blocker("CANONICAL_FAMILY_LEGACY_DUPLICATE_REVIEW_REQUIRED"),
      counts: { legacyCandidateCount: legacyCandidates.length },
    });
  }

  if (lookup?.status === "BLOCKED_INVARIANT_VIOLATION") {
    blockers.push(blocker("CANONICAL_FAMILY_MULTIPLE_ACTIVE_CANONICAL_MATCHES"));
  }

  if (params.metadataConflict) {
    blockers.push(blocker("CANONICAL_FAMILY_METADATA_CONFLICT"));
  }

  if (params.relationshipPeriodAmbiguous) {
    blockers.push(blocker("CANONICAL_FAMILY_RELATIONSHIP_PERIOD_AMBIGUOUS"));
  }

  if (lookup?.status === "FOUND" && lookup.family.canonicalStatus === "merged") {
    blockers.push(blocker("CANONICAL_FAMILY_MERGED_RECORD_NOT_REUSABLE"));
  }

  if (lookup?.status === "FOUND" && lookup.family.canonicalStatus === "voided") {
    blockers.push(blocker("CANONICAL_FAMILY_VOIDED_RECORD_NOT_REUSABLE"));
  }

  const decision = decideCanonicalFamilyReuseOrCreate({
    identityStatus: identity.status,
    lookup,
    legacyCandidates,
    missingPersonCount:
      peopleValidation.status === "MISSING_PERSON_REFERENCE"
        ? peopleValidation.missingPersonIds.length
        : 0,
    metadataConflict: params.metadataConflict === true,
    relationshipPeriodAmbiguous: params.relationshipPeriodAmbiguous === true,
  });

  return {
    decision,
    canonicalKey: identity.status === "VALID" ? identity.canonicalKey : null,
    familyToReuseId:
      decision === "REUSE_CANONICAL" && lookup?.status === "FOUND"
        ? lookup.family.id
        : null,
    familyCreateInput:
      decision === "CREATE_NEW_CANONICAL" && identity.status === "VALID"
        ? {
            canonicalKey: identity.canonicalKey,
            canonicalStatus: "canonical",
            visibility: "family",
          }
        : null,
    parentMembershipsToEnsure:
      identity.status === "VALID" ? identity.payload.parentIds.map((personId) => ({
        personId,
        parentRole:
          params.input.parents.find((parent) => parent.personId === personId)
            ?.parentRole ?? "unknown",
        relationshipType:
          params.input.parents.find((parent) => parent.personId === personId)
            ?.relationshipType ?? "unknown",
      })) : [],
    childMembershipsToEnsure: children.map((personId) => ({
      personId,
      relationshipType: "biological",
    })),
    coupleMetadataPlan: null,
    warnings:
      identity.status === "VALID"
        ? identity.diagnostics.filter(
            (entry) => entry.code === "CANONICAL_FAMILY_TRANSACTION_EXECUTOR_REQUIRED",
          )
        : [],
    blockers,
    transactionExecutorRequired: true,
  };
}

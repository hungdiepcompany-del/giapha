import type {
  ChildRelationshipType,
  CoupleRelationshipStatus,
  ParentRelationshipType,
  ParentRole,
  RelationshipDatePrecision,
  RelationshipVisibility,
} from "@/lib/family/relationship-types";
import type {
  CanonicalFamilyBlocker,
  CanonicalFamilyDiagnostic,
  CanonicalFamilyWarning,
} from "@/lib/family/canonical-family-errors";

export const CANONICAL_FAMILY_IDENTITY_VERSION = 1 as const;
export const CANONICAL_FAMILY_IDENTITY_PREFIX = "canonical-family:v1" as const;

export type CanonicalFamilyIdentityVersion =
  typeof CANONICAL_FAMILY_IDENTITY_VERSION;

export type CanonicalFamilyParentInput = {
  personId: string | null | undefined;
  parentRole?: ParentRole | null;
  relationshipType?: ParentRelationshipType | null;
  active?: boolean;
  deletedAt?: string | null;
};

export type CanonicalFamilyChildInput = {
  personId: string;
  relationshipType?: ChildRelationshipType | null;
};

export type CanonicalFamilyRelationshipPeriod = {
  startDate: string | null;
  startDatePrecision: RelationshipDatePrecision | null;
  endDate: string | null;
  endDatePrecision: RelationshipDatePrecision | null;
};

export type CanonicalFamilyIdentityInput = {
  parents: CanonicalFamilyParentInput[];
  unionIdentity?: string | null;
  relationshipPeriod?: CanonicalFamilyRelationshipPeriod | null;
};

export type NormalizedCanonicalParent = {
  personId: string;
  parentRole: ParentRole;
  relationshipType: ParentRelationshipType;
};

export type CanonicalFamilyIdentityPayload = {
  version: CanonicalFamilyIdentityVersion;
  parentIds: string[];
  unionIdentity: string | null;
  relationshipPeriod: CanonicalFamilyRelationshipPeriod | null;
};

export type ParentSetNormalizationResult =
  | {
      status: "VALID";
      parents: NormalizedCanonicalParent[];
      parentIds: string[];
      warnings: CanonicalFamilyWarning[];
      diagnostics: CanonicalFamilyDiagnostic[];
    }
  | {
      status: "OWNER_REVIEW_REQUIRED" | "BLOCKED_AMBIGUOUS";
      parents: NormalizedCanonicalParent[];
      parentIds: string[];
      warnings: CanonicalFamilyWarning[];
      blockers: CanonicalFamilyBlocker[];
      diagnostics: CanonicalFamilyDiagnostic[];
    };

export type CanonicalFamilyIdentityResult =
  | {
      status: "VALID";
      canonicalKey: string;
      serializedPayload: string;
      payload: CanonicalFamilyIdentityPayload;
      diagnostics: CanonicalFamilyDiagnostic[];
    }
  | {
      status: "OWNER_REVIEW_REQUIRED" | "BLOCKED_AMBIGUOUS";
      canonicalKey: null;
      serializedPayload: null;
      payload: null;
      blockers: CanonicalFamilyBlocker[];
      diagnostics: CanonicalFamilyDiagnostic[];
    };

export type CanonicalFamilyRecord = {
  id: string;
  canonicalKey: string;
  canonicalStatus: "canonical" | "legacy_unreviewed" | "merged" | "voided" | "owner_review_required";
  mergedIntoFamilyId: string | null;
  visibility?: RelationshipVisibility;
  deletedAt: string | null;
};

export type LegacyFamilyCandidate = {
  id: string;
  parentIds: string[];
  childCount: number;
  canonicalStatus: CanonicalFamilyRecord["canonicalStatus"] | null;
  deletedAt: string | null;
  metadataConflict?: boolean;
};

export type CanonicalFamilyLookupResult =
  | { status: "FOUND"; family: CanonicalFamilyRecord }
  | { status: "NOT_FOUND" }
  | { status: "OWNER_REVIEW_REQUIRED"; candidates: CanonicalFamilyRecord[] }
  | {
      status: "BLOCKED_INVARIANT_VIOLATION";
      code: "CANONICAL_FAMILY_MULTIPLE_ACTIVE_CANONICAL_MATCHES";
      candidates: CanonicalFamilyRecord[];
    };

export type CanonicalFamilyDecision =
  | "REUSE_CANONICAL"
  | "CREATE_NEW_CANONICAL"
  | "OWNER_REVIEW_REQUIRED"
  | "BLOCKED_AMBIGUOUS"
  | "BLOCKED_INVARIANT_VIOLATION";

export type CanonicalFamilyCreateInput = {
  canonicalKey: string;
  canonicalStatus: "canonical";
  visibility: RelationshipVisibility;
};

export type ParentMembershipPlan = {
  personId: string;
  parentRole: ParentRole;
  relationshipType: ParentRelationshipType;
};

export type ChildMembershipPlan = {
  personId: string;
  relationshipType: ChildRelationshipType;
};

export type CoupleMetadataPlan = {
  person1Id: string;
  person2Id: string;
  relationshipStatus: CoupleRelationshipStatus;
  relationshipPeriod: CanonicalFamilyRelationshipPeriod | null;
} | null;

export type CanonicalFamilyMutationPlan = {
  decision: CanonicalFamilyDecision;
  canonicalKey: string | null;
  familyToReuseId: string | null;
  familyCreateInput: CanonicalFamilyCreateInput | null;
  parentMembershipsToEnsure: ParentMembershipPlan[];
  childMembershipsToEnsure: ChildMembershipPlan[];
  coupleMetadataPlan: CoupleMetadataPlan;
  warnings: CanonicalFamilyWarning[];
  blockers: CanonicalFamilyBlocker[];
  transactionExecutorRequired: true;
};

import "server-only";

import type {
  CanonicalFamilyLookupResult,
  LegacyFamilyCandidate,
  NormalizedCanonicalParent,
} from "@/lib/family/canonical-family-types";

export type CanonicalFamilyPeopleValidationResult =
  | { status: "VALID"; missingPersonIds: [] }
  | { status: "MISSING_PERSON_REFERENCE"; missingPersonIds: string[] };

export type CanonicalFamilyMembershipSnapshot = {
  familyId: string;
  parents: NormalizedCanonicalParent[];
  childIds: string[];
};

export interface CanonicalFamilyRepository {
  findCanonicalByKey(key: string): Promise<CanonicalFamilyLookupResult>;
  findLegacyCandidatesByParentSet(
    parentIds: string[],
  ): Promise<LegacyFamilyCandidate[]>;
  validatePeopleExist(
    personIds: string[],
  ): Promise<CanonicalFamilyPeopleValidationResult>;
  readFamilyMemberships(
    familyId: string,
  ): Promise<CanonicalFamilyMembershipSnapshot | null>;
}

export type CanonicalFamilyTransactionExecutorRequired = {
  readonly status: "TRANSACTION_EXECUTOR_REQUIRED";
  readonly reason: "A17M_PLAN_ONLY_NO_MUTATION_EXECUTOR";
};

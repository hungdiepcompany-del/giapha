import "server-only";

import { createHash } from "node:crypto";

import {
  buildCanonicalFamilyIdentity,
  stableCanonicalJson,
} from "@/lib/family/canonical-family-identity";
import type { ParentRole } from "@/lib/family/relationship-types";
import type {
  ImportManifestReadResult,
  ImportPersonCandidatePreview,
} from "@/lib/import/giapha4/manifest-read-service";

export const A17O_CANONICAL_IMPORT_GROUP_KEY_VERSION =
  "a17o-import-family-group:v1" as const;

export const A17O_IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE = true as const;

export const A17O_GROUPED_PLAN_CONTRACT_VERSION = 1 as const;

export const A17O_GROUPED_IMPORT_TRANSACTION_EXECUTOR_SUPPORT_REQUIRED =
  "A17O_BLOCKED_IMPORT_TRANSACTION_EXECUTOR_GROUPED_FAMILY_SUPPORT_REQUIRED" as const;

export type A17OImportRelationshipCandidate = {
  relationshipType: string;
  sourcePersonFingerprint: string | null | undefined;
  relatedPersonFingerprint: string | null | undefined;
  ambiguityStatus: string | null | undefined;
  ownerDecision?: string | null;
  parentRole?: ParentRole | null;
  sourceRowIndex?: number | null;
};

export type A17OCanonicalImportFamilyGroup = {
  groupKey: string;
  parentFingerprints: string[];
  childFingerprints: string[];
  parentRoles: Record<string, ParentRole>;
  sourceReferenceHashes: string[];
};

export type A17OCanonicalImportFamilyGroupingPlan = {
  status: "READY_FOR_GROUPED_EXECUTOR" | "OWNER_REVIEW_REQUIRED" | "BLOCKED";
  groupKeyVersion: typeof A17O_CANONICAL_IMPORT_GROUP_KEY_VERSION;
  childIdIncludedInGroupKey: false;
  parentInputOrderAffectsGroupKey: false;
  runtimeActive: typeof A17O_IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE;
  executorBlocker: typeof A17O_GROUPED_IMPORT_TRANSACTION_EXECUTOR_SUPPORT_REQUIRED;
  groups: A17OCanonicalImportFamilyGroup[];
  blockers: string[];
  counts: {
    inputRelationshipRows: number;
    groupedFamilyCount: number;
    childMembershipCount: number;
    parentMembershipCount: number;
    duplicateParentRowsDeduplicated: number;
    duplicateChildRowsDeduplicated: number;
  };
};

export type A17OGroupedImportPlanPerson = {
  sourcePersonFingerprint: string;
  personId: string;
};

export type A17OGroupedImportPlanFamilyGroup = {
  groupKey: string;
  canonicalKey: string;
  identityVersion: typeof A17O_GROUPED_PLAN_CONTRACT_VERSION;
  familyAction: "CREATE" | "REUSE";
  targetFamilyId: string | null;
  expectedFamilyUpdatedAt: string | null;
  sourceReferenceHashes: string[];
  parentMemberships: {
    personId: string;
    role: ParentRole;
    relationshipType: "biological" | "adoptive" | "step" | "guardian" | "unknown";
  }[];
  childMemberships: {
    personId: string;
    relationshipType: "biological" | "adoptive" | "step" | "foster" | "unknown";
  }[];
};

export type A17OGroupedImportPlanCounts = {
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

export type A17OGroupedImportPlan = {
  contractVersion: typeof A17O_GROUPED_PLAN_CONTRACT_VERSION;
  sessionId: string;
  approvalMarker: string;
  actorProfileId: string;
  idempotencyKey: string;
  mutationPlanHash: string;
  people: A17OGroupedImportPlanPerson[];
  familyGroups: A17OGroupedImportPlanFamilyGroup[];
  auditSummary: A17OGroupedImportPlanCounts & {
    safeSourceReferenceHashes: string[];
    groupingRuntimeActive: true;
    childIdIncludedInGroupKey: false;
    parentInputOrderAffectsGroupKey: false;
  };
};

export type A17OGroupedImportPlanBuildResult =
  | {
      ok: true;
      status: "READY_FOR_GROUPED_EXECUTOR";
      groupedPlan: A17OGroupedImportPlan;
      mutationPlanHash: string;
      idempotencyKey: string;
      counts: A17OGroupedImportPlanCounts;
      blockedReasons: [];
    }
  | {
      ok: false;
      status: "OWNER_REVIEW_REQUIRED" | "BLOCKED";
      groupedPlan: null;
      mutationPlanHash: null;
      idempotencyKey: null;
      counts: A17OGroupedImportPlanCounts;
      blockedReasons: string[];
    };

export type A17OGroupedImportReuseDecision = {
  groupKey: string;
  targetFamilyId: string;
  expectedFamilyUpdatedAt?: string | null;
};

function normalizeToken(value: string | null | undefined) {
  const normalized = (value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeParentRole(value: ParentRole | null | undefined): ParentRole {
  if (value === "father" || value === "mother" || value === "parent") {
    return value;
  }

  return "unknown";
}

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function deterministicUuid(seed: string) {
  const hex = sha256Hex(seed).slice(0, 32).split("");
  hex[12] = "4";
  const variant = Number.parseInt(hex[16], 16);
  hex[16] = ((variant & 0x3) | 0x8).toString(16);
  const value = hex.join("");
  return [
    value.slice(0, 8),
    value.slice(8, 12),
    value.slice(12, 16),
    value.slice(16, 20),
    value.slice(20, 32),
  ].join("-");
}

function normalizeRelationshipType(
  value: string | null | undefined,
): "biological" | "adoptive" | "step" | "guardian" | "foster" | "unknown" {
  if (
    value === "biological" ||
    value === "adoptive" ||
    value === "step" ||
    value === "guardian" ||
    value === "foster"
  ) {
    return value;
  }

  return "unknown";
}

function sourceReferenceHash(parts: Record<string, unknown>) {
  return sha256Hex(stableCanonicalJson(parts));
}

export function buildA17OCanonicalImportGroupKey(parentFingerprints: string[]) {
  const normalizedParents = Array.from(
    new Set(parentFingerprints.map(normalizeToken).filter(Boolean) as string[]),
  ).sort();

  const serialized = JSON.stringify({
    version: A17O_CANONICAL_IMPORT_GROUP_KEY_VERSION,
    parentFingerprints: normalizedParents,
  });
  const digest = createHash("sha256").update(serialized).digest("hex");

  return {
    groupKey: `${A17O_CANONICAL_IMPORT_GROUP_KEY_VERSION}:${digest}`,
    parentFingerprints: normalizedParents,
    serialized,
  };
}

export function buildA17OCanonicalImportFamilyGroupingPlan(input: {
  relationships: A17OImportRelationshipCandidate[];
  legacyDuplicateGroupKeys?: string[];
}): A17OCanonicalImportFamilyGroupingPlan {
  const blockers: string[] = [];
  const childParents = new Map<
    string,
    Map<string, { role: ParentRole; sourceRowIndexes: Set<number> }>
  >();
  let duplicateParentRowsDeduplicated = 0;

  for (const relationship of input.relationships) {
    if (relationship.relationshipType !== "parent_child") continue;

    const parentFingerprint = normalizeToken(relationship.sourcePersonFingerprint);
    const childFingerprint = normalizeToken(relationship.relatedPersonFingerprint);
    const ownerDecision = relationship.ownerDecision ?? "unresolved";

    if (
      relationship.ambiguityStatus !== "clear" ||
      ownerDecision === "hold" ||
      ownerDecision === "skip" ||
      !parentFingerprint ||
      !childFingerprint ||
      parentFingerprint === childFingerprint
    ) {
      blockers.push("A17O_AMBIGUOUS_PARENT_SET_FAILS_CLOSED");
      continue;
    }

    const parents = childParents.get(childFingerprint) ?? new Map();
    if (parents.has(parentFingerprint)) {
      duplicateParentRowsDeduplicated += 1;
    }
    const existing = parents.get(parentFingerprint);
    const sourceRowIndexes = existing?.sourceRowIndexes ?? new Set<number>();
    if (typeof relationship.sourceRowIndex === "number") {
      sourceRowIndexes.add(relationship.sourceRowIndex);
    }
    parents.set(parentFingerprint, {
      role: existing?.role ?? normalizeParentRole(relationship.parentRole),
      sourceRowIndexes,
    });
    childParents.set(childFingerprint, parents);
  }

  const groupsByKey = new Map<string, A17OCanonicalImportFamilyGroup>();
  const seenChildGroupPairs = new Set<string>();
  let duplicateChildRowsDeduplicated = 0;

  for (const [childFingerprint, parents] of childParents) {
    const parentFingerprints = Array.from(parents.keys()).sort();
    if (parentFingerprints.length === 0 || parentFingerprints.length > 2) {
      blockers.push("A17O_AMBIGUOUS_PARENT_SET_FAILS_CLOSED");
      continue;
    }

    const { groupKey } = buildA17OCanonicalImportGroupKey(parentFingerprints);
    const parentRoles = Object.fromEntries(
      parentFingerprints.map((parentFingerprint) => [
        parentFingerprint,
        parents.get(parentFingerprint)?.role ?? "unknown",
      ]),
    ) as Record<string, ParentRole>;
    const group =
      groupsByKey.get(groupKey) ?? {
        groupKey,
        parentFingerprints,
        childFingerprints: [],
        parentRoles,
        sourceReferenceHashes: [],
      };

    const childGroupPair = `${groupKey}:${childFingerprint}`;
    if (seenChildGroupPairs.has(childGroupPair)) {
      duplicateChildRowsDeduplicated += 1;
    } else {
      group.childFingerprints.push(childFingerprint);
      seenChildGroupPairs.add(childGroupPair);
    }

    for (const parentFingerprint of parentFingerprints) {
      const parent = parents.get(parentFingerprint);
      for (const sourceRowIndex of parent?.sourceRowIndexes ?? []) {
        group.sourceReferenceHashes.push(
          sourceReferenceHash({
            relationshipType: "parent_child",
            parentFingerprint,
            childFingerprint,
            sourceRowIndex,
          }),
        );
      }
    }

    groupsByKey.set(groupKey, group);
  }

  const legacyDuplicateGroupKeys = new Set(input.legacyDuplicateGroupKeys ?? []);
  for (const group of groupsByKey.values()) {
    if (legacyDuplicateGroupKeys.has(group.groupKey)) {
      blockers.push("A17O_LEGACY_DUPLICATE_REQUIRES_REVIEW");
    }
  }

  const groups = Array.from(groupsByKey.values()).sort((a, b) =>
    a.groupKey.localeCompare(b.groupKey),
  ).map((group) => ({
    ...group,
    childFingerprints: [...group.childFingerprints].sort(),
    sourceReferenceHashes: Array.from(new Set(group.sourceReferenceHashes)).sort(),
  }));
  const hasLegacyReview = blockers.includes("A17O_LEGACY_DUPLICATE_REQUIRES_REVIEW");
  const hasHardBlocker = blockers.some(
    (blocker) => blocker !== "A17O_LEGACY_DUPLICATE_REQUIRES_REVIEW",
  );

  return {
    status: hasHardBlocker
      ? "BLOCKED"
      : hasLegacyReview
        ? "OWNER_REVIEW_REQUIRED"
        : "READY_FOR_GROUPED_EXECUTOR",
    groupKeyVersion: A17O_CANONICAL_IMPORT_GROUP_KEY_VERSION,
    childIdIncludedInGroupKey: false,
    parentInputOrderAffectsGroupKey: false,
    runtimeActive: A17O_IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE,
    executorBlocker: A17O_GROUPED_IMPORT_TRANSACTION_EXECUTOR_SUPPORT_REQUIRED,
    groups,
    blockers: Array.from(new Set(blockers)).sort(),
    counts: {
      inputRelationshipRows: input.relationships.length,
      groupedFamilyCount: groups.length,
      childMembershipCount: groups.reduce(
        (count, group) => count + group.childFingerprints.length,
        0,
      ),
      parentMembershipCount: groups.reduce(
        (count, group) => count + group.parentFingerprints.length,
        0,
      ),
      duplicateParentRowsDeduplicated,
      duplicateChildRowsDeduplicated,
    },
  };
}

function buildPersonPlan(
  sessionId: string,
  people: ImportPersonCandidatePreview[],
): {
  peoplePlan: A17OGroupedImportPlanPerson[];
  fingerprintToPersonId: Map<string, string>;
} {
  const fingerprintToPersonId = new Map<string, string>();

  const peoplePlan = people
    .map((person) => ({
      sourcePersonFingerprint: person.fingerprint,
      personId: deterministicUuid(
        stableCanonicalJson({
          contractVersion: A17O_GROUPED_PLAN_CONTRACT_VERSION,
          sessionId,
          sourcePersonFingerprint: person.fingerprint,
          sourceRowIndex: person.sourceRowIndex,
        }),
      ),
    }))
    .sort((a, b) =>
      a.sourcePersonFingerprint.localeCompare(b.sourcePersonFingerprint),
    );

  for (const person of peoplePlan) {
    fingerprintToPersonId.set(person.sourcePersonFingerprint, person.personId);
  }

  return { peoplePlan, fingerprintToPersonId };
}

function zeroGroupedCounts(): A17OGroupedImportPlanCounts {
  return {
    sourceChildRelationshipCount: 0,
    canonicalFamilyGroupCount: 0,
    plannedNewFamilyCount: 0,
    plannedReusedFamilyCount: 0,
    plannedParentMembershipCount: 0,
    plannedChildMembershipCount: 0,
    duplicateParentRowsRemoved: 0,
    duplicateChildRowsRemoved: 0,
    ownerReviewFamilyGroupCount: 0,
    blockedFamilyGroupCount: 0,
  };
}

export function buildA17OGroupedImportPreviewCounts(
  manifest: ImportManifestReadResult,
): A17OGroupedImportPlanCounts {
  if (!manifest.ok) return zeroGroupedCounts();

  const grouping = buildA17OCanonicalImportFamilyGroupingPlan({
    relationships: manifest.relationshipsPreview.map((relationship) => ({
      relationshipType: relationship.relationshipType,
      sourcePersonFingerprint: relationship.sourcePersonFingerprint,
      relatedPersonFingerprint: relationship.relatedPersonFingerprint,
      ambiguityStatus: relationship.ambiguityStatus,
      ownerDecision: relationship.ownerDecision,
      sourceRowIndex: relationship.sourceRowIndex,
    })),
  });

  return {
    sourceChildRelationshipCount: grouping.counts.childMembershipCount,
    canonicalFamilyGroupCount: grouping.counts.groupedFamilyCount,
    plannedNewFamilyCount:
      grouping.status === "READY_FOR_GROUPED_EXECUTOR"
        ? grouping.counts.groupedFamilyCount
        : 0,
    plannedReusedFamilyCount: 0,
    plannedParentMembershipCount: grouping.counts.parentMembershipCount,
    plannedChildMembershipCount: grouping.counts.childMembershipCount,
    duplicateParentRowsRemoved: grouping.counts.duplicateParentRowsDeduplicated,
    duplicateChildRowsRemoved: grouping.counts.duplicateChildRowsDeduplicated,
    ownerReviewFamilyGroupCount:
      grouping.status === "OWNER_REVIEW_REQUIRED"
        ? grouping.counts.groupedFamilyCount
        : 0,
    blockedFamilyGroupCount:
      grouping.status === "BLOCKED" ? grouping.counts.groupedFamilyCount : 0,
  };
}

export function buildA17OGroupedOfficialImportPlan(params: {
  manifest: ImportManifestReadResult;
  sessionId: string;
  approvalMarker: string;
  actorProfileId: string;
  reuseDecisions?: A17OGroupedImportReuseDecision[];
}): A17OGroupedImportPlanBuildResult {
  const counts = buildA17OGroupedImportPreviewCounts(params.manifest);
  if (!params.manifest.ok || !params.manifest.session) {
    return {
      ok: false,
      status: "BLOCKED",
      groupedPlan: null,
      mutationPlanHash: null,
      idempotencyKey: null,
      counts,
      blockedReasons: ["A17O_R_IMPORT_MANIFEST_NOT_READY"],
    };
  }

  const grouping = buildA17OCanonicalImportFamilyGroupingPlan({
    relationships: params.manifest.relationshipsPreview.map((relationship) => ({
      relationshipType: relationship.relationshipType,
      sourcePersonFingerprint: relationship.sourcePersonFingerprint,
      relatedPersonFingerprint: relationship.relatedPersonFingerprint,
      ambiguityStatus: relationship.ambiguityStatus,
      ownerDecision: relationship.ownerDecision,
      sourceRowIndex: relationship.sourceRowIndex,
    })),
  });

  if (grouping.status !== "READY_FOR_GROUPED_EXECUTOR") {
    return {
      ok: false,
      status: grouping.status,
      groupedPlan: null,
      mutationPlanHash: null,
      idempotencyKey: null,
      counts,
      blockedReasons: grouping.blockers,
    };
  }

  const { peoplePlan, fingerprintToPersonId } = buildPersonPlan(
    params.sessionId,
    params.manifest.peoplePreview,
  );
  const reuseByGroupKey = new Map(
    (params.reuseDecisions ?? []).map((decision) => [decision.groupKey, decision]),
  );
  const familyGroups: A17OGroupedImportPlanFamilyGroup[] = [];
  const blockedReasons: string[] = [];

  for (const group of grouping.groups) {
    const parentMemberships = group.parentFingerprints
      .map((fingerprint) => {
        const personId = fingerprintToPersonId.get(fingerprint);
        if (!personId) {
          blockedReasons.push("A17O_R_PARENT_PERSON_PLAN_MISSING");
          return null;
        }

        return {
          personId,
          role: group.parentRoles[fingerprint] ?? "unknown",
          relationshipType: normalizeRelationshipType("unknown") as
            | "biological"
            | "adoptive"
            | "step"
            | "guardian"
            | "unknown",
        };
      })
      .filter(Boolean) as A17OGroupedImportPlanFamilyGroup["parentMemberships"];
    const childMemberships = group.childFingerprints
      .map((fingerprint) => {
        const personId = fingerprintToPersonId.get(fingerprint);
        if (!personId) {
          blockedReasons.push("A17O_R_CHILD_PERSON_PLAN_MISSING");
          return null;
        }

        return {
          personId,
          relationshipType: normalizeRelationshipType("unknown") as
            | "biological"
            | "adoptive"
            | "step"
            | "foster"
            | "unknown",
        };
      })
      .filter(Boolean) as A17OGroupedImportPlanFamilyGroup["childMemberships"];

    const identity = buildCanonicalFamilyIdentity({
      parents: parentMemberships.map((parent) => ({
        personId: parent.personId,
        parentRole: parent.role,
        relationshipType: parent.relationshipType,
      })),
      unionIdentity: null,
      relationshipPeriod: null,
    });

    if (identity.status !== "VALID" || !identity.canonicalKey) {
      blockedReasons.push("A17O_R_CANONICAL_FAMILY_IDENTITY_INVALID");
      continue;
    }

    const reuseDecision = reuseByGroupKey.get(group.groupKey);
    familyGroups.push({
      groupKey: group.groupKey,
      canonicalKey: identity.canonicalKey,
      identityVersion: A17O_GROUPED_PLAN_CONTRACT_VERSION,
      familyAction: reuseDecision ? "REUSE" : "CREATE",
      targetFamilyId: reuseDecision?.targetFamilyId ?? null,
      expectedFamilyUpdatedAt: reuseDecision?.expectedFamilyUpdatedAt ?? null,
      sourceReferenceHashes: group.sourceReferenceHashes,
      parentMemberships,
      childMemberships,
    });
  }

  if (blockedReasons.length > 0 || familyGroups.length === 0) {
    return {
      ok: false,
      status: "BLOCKED",
      groupedPlan: null,
      mutationPlanHash: null,
      idempotencyKey: null,
      counts,
      blockedReasons: Array.from(new Set(blockedReasons)).sort(),
    };
  }

  const normalizedCounts: A17OGroupedImportPlanCounts = {
    ...counts,
    plannedNewFamilyCount: familyGroups.filter(
      (group) => group.familyAction === "CREATE",
    ).length,
    plannedReusedFamilyCount: familyGroups.filter(
      (group) => group.familyAction === "REUSE",
    ).length,
  };
  const basePlan = {
    contractVersion: A17O_GROUPED_PLAN_CONTRACT_VERSION,
    sessionId: params.sessionId,
    approvalMarker: params.approvalMarker,
    actorProfileId: params.actorProfileId,
    idempotencyKey: "PENDING",
    mutationPlanHash: "0".repeat(64),
    people: peoplePlan,
    familyGroups: familyGroups.sort((a, b) => a.groupKey.localeCompare(b.groupKey)),
    auditSummary: {
      ...normalizedCounts,
      safeSourceReferenceHashes: Array.from(
        new Set(familyGroups.flatMap((group) => group.sourceReferenceHashes)),
      ).sort(),
      groupingRuntimeActive: true,
      childIdIncludedInGroupKey: false,
      parentInputOrderAffectsGroupKey: false,
    },
  } satisfies A17OGroupedImportPlan;
  const mutationPlanHash = sha256Hex(stableCanonicalJson(basePlan));
  const idempotencyKey = `A17O:${sha256Hex(
    stableCanonicalJson({
      sessionId: params.sessionId,
      approvalMarker: params.approvalMarker,
      mutationPlanHash,
    }),
  ).slice(0, 48)}`;
  const groupedPlan = {
    ...basePlan,
    idempotencyKey,
    mutationPlanHash,
  };

  return {
    ok: true,
    status: "READY_FOR_GROUPED_EXECUTOR",
    groupedPlan,
    mutationPlanHash,
    idempotencyKey,
    counts: normalizedCounts,
    blockedReasons: [],
  };
}

import "server-only";

import { createHash } from "node:crypto";

import type { ParentRole } from "@/lib/family/relationship-types";

export const A17O_CANONICAL_IMPORT_GROUP_KEY_VERSION =
  "a17o-import-family-group:v1" as const;

export const A17O_IMPORTER_CANONICAL_GROUPING_RUNTIME_ACTIVE = false as const;

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
      };

    const childGroupPair = `${groupKey}:${childFingerprint}`;
    if (seenChildGroupPairs.has(childGroupPair)) {
      duplicateChildRowsDeduplicated += 1;
    } else {
      group.childFingerprints.push(childFingerprint);
      seenChildGroupPairs.add(childGroupPair);
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
  );
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

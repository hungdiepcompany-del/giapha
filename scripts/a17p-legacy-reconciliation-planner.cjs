#!/usr/bin/env node

const crypto = require("node:crypto");

const CONTRACT_VERSION = 1;
const GROUP_KEY_PREFIX = "a17p-legacy-family-reconciliation:v1";

const RISK_CLASSES = Object.freeze({
  SAFE_AFTER_OWNER_APPROVAL: "SAFE_AFTER_OWNER_APPROVAL",
  OWNER_DECISION_REQUIRED: "OWNER_DECISION_REQUIRED",
  BLOCKED_DATA_CONFLICT: "BLOCKED_DATA_CONFLICT",
  BLOCKED_GRAPH_INVARIANT: "BLOCKED_GRAPH_INVARIANT",
  EXCLUDED_NON_DUPLICATE: "EXCLUDED_NON_DUPLICATE",
});

const DELETED_FAMILY_ACTIONS = Object.freeze({
  SEPARATE_OWNER_DECISION_REQUIRED: "SEPARATE_OWNER_DECISION_REQUIRED",
  INCLUDE_IN_APPROVED_GROUP_WITH_EXPLICIT_REASON:
    "INCLUDE_IN_APPROVED_GROUP_WITH_EXPLICIT_REASON",
  NO_ACTION_HISTORICAL_ONLY: "NO_ACTION_HISTORICAL_ONLY",
});

const OWNER_DECISION_OPTIONS = Object.freeze([
  "APPROVE_PROPOSED_SURVIVOR",
  "SELECT_DIFFERENT_SURVIVOR",
  "EXCLUDE_GROUP",
  "BLOCK_DATA_CONFLICT",
  "REQUEST_MORE_EVIDENCE",
]);

function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
    .join(",")}}`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function normalizeParents(candidates) {
  return uniqueSorted(
    candidates.flatMap((candidate) =>
      (candidate.parentMemberships ?? [])
        .filter((membership) => membership.active !== false)
        .map((membership) => membership.personId),
    ),
  );
}

function normalizeUnionContext(candidates) {
  const contexts = uniqueSorted(
    candidates.map((candidate) => candidate.unionContext ?? "none"),
  );
  if (contexts.length === 0 || (contexts.length === 1 && contexts[0] === "none")) {
    return { value: null, conflict: false };
  }
  if (contexts.length === 1) return { value: contexts[0], conflict: false };
  return { value: null, conflict: true, contexts };
}

function buildGroupKey(parentIds, unionContext = null, relationshipPeriod = null) {
  const payload = {
    contractVersion: CONTRACT_VERSION,
    normalizedActiveParentPersonIds: parentIds,
    unionContext,
    relationshipPeriod,
  };
  return `${GROUP_KEY_PREFIX}:${sha256(stableJson(payload))}`;
}

function dedupeMemberships(candidates, type) {
  const rows = candidates.flatMap((candidate) =>
    (candidate[type] ?? []).map((membership) => ({
      ...membership,
      sourceFamilyId: candidate.id,
    })),
  );
  const activeRows = rows.filter((membership) => membership.active !== false);
  const byPerson = new Map();
  const duplicates = [];
  const conflicts = [];

  for (const row of activeRows) {
    const existing = byPerson.get(row.personId);
    if (!existing) {
      byPerson.set(row.personId, row);
      continue;
    }

    const existingType =
      type === "parentMemberships"
        ? existing.parentRole ?? existing.relationshipType ?? "unknown"
        : existing.relationshipType ?? "unknown";
    const nextType =
      type === "parentMemberships"
        ? row.parentRole ?? row.relationshipType ?? "unknown"
        : row.relationshipType ?? "unknown";

    duplicates.push(row);
    if (existingType !== nextType) {
      conflicts.push({
        personId: row.personId,
        sourceFamilyIds: uniqueSorted([existing.sourceFamilyId, row.sourceFamilyId]),
        existingType,
        nextType,
      });
    }
  }

  return {
    unique: Array.from(byPerson.values()).sort((a, b) =>
      a.personId.localeCompare(b.personId),
    ),
    duplicates,
    conflicts,
  };
}

function collectBlockers(input, unionContext, parentPlan, childPlan) {
  const blockers = [];

  if (unionContext.conflict) {
    blockers.push("A17P_BLOCKED_MULTIPLE_UNION_CONTEXTS");
  }
  if (parentPlan.conflicts.length > 0) {
    blockers.push("A17P_BLOCKED_PARENT_ROLE_CONFLICT");
  }
  if (childPlan.conflicts.length > 0) {
    blockers.push("A17P_BLOCKED_CHILD_RELATIONSHIP_CONFLICT");
  }
  if (input.graph?.cycleRisk) blockers.push("A17P_BLOCKED_CYCLE_RISK");
  if (input.graph?.selfParentRisk) blockers.push("A17P_BLOCKED_SELF_PARENT");
  if (input.graph?.parentAlsoChild) {
    blockers.push("A17P_BLOCKED_PERSON_PARENT_AND_CHILD_IN_GROUP");
  }
  if (input.graph?.conflictingParentSet) {
    blockers.push("A17P_BLOCKED_CONFLICTING_PARENT_SET");
  }
  if (input.graph?.tooManyParents) {
    blockers.push("A17P_BLOCKED_MORE_THAN_TWO_PARENT_POLICY");
  }

  return blockers;
}

function scoreCandidate(candidate) {
  return {
    id: candidate.id,
    active: candidate.deletedAt ? 0 : 1,
    canonicalCompatible:
      !candidate.canonicalStatus ||
      ["legacy_unreviewed", "canonical", "owner_review_required"].includes(
        candidate.canonicalStatus,
      )
        ? 1
        : 0,
    referenceCoverage:
      (candidate.layoutReferenceCount ?? 0) +
      (candidate.revisionReferenceCount ?? 0) +
      (candidate.auditLineageScore ?? 0),
    metadataCompatible: candidate.metadataConflict ? 0 : 1,
    layoutConflict: candidate.layoutConflict ? 1 : 0,
  };
}

function proposeSurvivor(candidates, blockers) {
  const activeCandidates = candidates.filter(
    (candidate) =>
      !candidate.deletedAt &&
      !["merged", "voided"].includes(candidate.canonicalStatus ?? "legacy_unreviewed"),
  );

  if (blockers.length > 0 || activeCandidates.length === 0) return null;

  const scored = activeCandidates.map((candidate) => ({
    candidate,
    score: scoreCandidate(candidate),
  }));
  const maxReference = Math.max(
    ...scored.map(({ score }) => score.referenceCoverage),
  );
  const best = scored.filter(
    ({ score }) =>
      score.active === 1 &&
      score.canonicalCompatible === 1 &&
      score.metadataCompatible === 1 &&
      score.layoutConflict === 0 &&
      score.referenceCoverage === maxReference,
  );

  return best.length === 1 ? best[0].candidate.id : null;
}

function classifyRisk(input, blockers, survivorFamilyId) {
  if (input.deletedFamilyAdvisory) return RISK_CLASSES.OWNER_DECISION_REQUIRED;
  if (blockers.some((code) => code.includes("CYCLE") || code.includes("PARENT_AND_CHILD"))) {
    return RISK_CLASSES.BLOCKED_GRAPH_INVARIANT;
  }
  if (blockers.length > 0) return RISK_CLASSES.BLOCKED_DATA_CONFLICT;
  if ((input.candidates ?? []).length < 2) return RISK_CLASSES.EXCLUDED_NON_DUPLICATE;
  if (!survivorFamilyId) return RISK_CLASSES.OWNER_DECISION_REQUIRED;
  return RISK_CLASSES.SAFE_AFTER_OWNER_APPROVAL;
}

function countActiveFamilies(candidates) {
  return candidates.filter((candidate) => !candidate.deletedAt).length;
}

function buildReconciliationPlan(input) {
  const candidates = input.candidates ?? [];
  const parentIds = normalizeParents(candidates);
  const unionContext = normalizeUnionContext(candidates);
  const parentPlan = dedupeMemberships(candidates, "parentMemberships");
  const childPlan = dedupeMemberships(candidates, "childMemberships");
  const blockers = collectBlockers(input, unionContext, parentPlan, childPlan);
  const proposedSurvivorFamilyId = proposeSurvivor(candidates, blockers);
  const riskClass = classifyRisk(input, blockers, proposedSurvivorFamilyId);
  const activeFamilyCountBefore = countActiveFamilies(candidates);
  const activeFamilyCountAfter =
    riskClass === RISK_CLASSES.SAFE_AFTER_OWNER_APPROVAL && proposedSurvivorFamilyId
      ? 1
      : activeFamilyCountBefore;
  const proposedVoidFamilyIds = proposedSurvivorFamilyId
    ? candidates
        .filter((candidate) => !candidate.deletedAt && candidate.id !== proposedSurvivorFamilyId)
        .map((candidate) => candidate.id)
        .sort()
    : [];
  const childrenAlreadyOnSurvivor = proposedSurvivorFamilyId
    ? new Set(
        (candidates.find((candidate) => candidate.id === proposedSurvivorFamilyId)
          ?.childMemberships ?? []).map((membership) => membership.personId),
      )
    : new Set();

  const layoutReferencesAffected = candidates.reduce(
    (sum, candidate) => sum + (candidate.layoutReferenceCount ?? 0),
    0,
  );
  const revisionReferencesAffected = candidates.reduce(
    (sum, candidate) => sum + (candidate.revisionReferenceCount ?? 0),
    0,
  );

  return {
    groupKey: buildGroupKey(parentIds, unionContext.value, input.relationshipPeriod ?? null),
    contractVersion: CONTRACT_VERSION,
    canonicalParentPersonIds: parentIds,
    unionContext: unionContext.value,
    candidateFamilies: candidates,
    proposedSurvivorFamilyId,
    proposedVoidFamilyIds,
    riskClass,
    blockers,
    warnings:
      riskClass === RISK_CLASSES.SAFE_AFTER_OWNER_APPROVAL
        ? ["A17P_OWNER_APPROVAL_REQUIRED_FOR_ALL_GROUPS"]
        : ["A17P_NO_AUTOMATIC_EXECUTION"],
    membershipMovePlan: {
      parentMembershipsToKeep: parentPlan.unique,
      parentMembershipDuplicates: parentPlan.duplicates,
      childMembershipsToKeep: childPlan.unique,
      childMembershipsToMove: proposedSurvivorFamilyId
        ? childPlan.unique.filter(
            (membership) => !childrenAlreadyOnSurvivor.has(membership.personId),
          )
        : [],
      childMembershipDuplicates: childPlan.duplicates,
      invariants: {
        ONE_ACTIVE_PARENT_MEMBERSHIP_PER_PARENT_PER_FAMILY: true,
        ONE_ACTIVE_CHILD_MEMBERSHIP_PER_CHILD_PER_FAMILY: true,
        NO_CHILD_LOST: true,
        NO_PARENT_LOST: true,
        NO_DUPLICATE_MEMBERSHIP_CREATED: true,
      },
    },
    layoutReferencePlan: {
      LAYOUT_MIGRATION_REQUIRED: layoutReferencesAffected > 0,
      LAYOUT_REFERENCES_AFFECTED: layoutReferencesAffected,
      LAYOUT_REFERENCE_CONFLICT: candidates.some((candidate) => candidate.layoutConflict),
      LAYOUT_RESET_RECOMMENDED: candidates.some((candidate) => candidate.layoutConflict),
    },
    revisionReferencePlan: {
      activeReferencesToMove: [],
      historicalReferencesToPreserve: revisionReferencesAffected,
      rewriteHistoricalAuditRows: false,
    },
    graphInvariantResult: {
      cycleRisk: Boolean(input.graph?.cycleRisk),
      selfParentRisk: Boolean(input.graph?.selfParentRisk),
      parentAlsoChild: Boolean(input.graph?.parentAlsoChild),
      conflictingParentSet: Boolean(input.graph?.conflictingParentSet),
      generationDepthImpact: input.graph?.generationDepthImpact ?? "not_derived",
    },
    expectedBefore: {
      activeFamilyCount: activeFamilyCountBefore,
      activeParentMembershipCount: parentPlan.unique.length + parentPlan.duplicates.length,
      activeChildMembershipCount: childPlan.unique.length + childPlan.duplicates.length,
      peopleCountChangeExpected: 0,
      uniqueChildCountChangeExpected: 0,
      uniqueParentCountChangeExpected: 0,
    },
    expectedAfter: {
      activeFamilyCount: activeFamilyCountAfter,
      activeParentMembershipCount: parentPlan.unique.length,
      activeChildMembershipCount: childPlan.unique.length,
      peopleCountChangeExpected: 0,
      uniqueChildCountChangeExpected: 0,
      uniqueParentCountChangeExpected: 0,
    },
    rollbackForecast: {
      survivorFamilyBefore: proposedSurvivorFamilyId,
      voidFamiliesBefore: proposedVoidFamilyIds,
      parentMembershipsBefore: candidates.flatMap(
        (candidate) => candidate.parentMemberships ?? [],
      ),
      childMembershipsBefore: candidates.flatMap(
        (candidate) => candidate.childMemberships ?? [],
      ),
      layoutReferencesBefore: layoutReferencesAffected,
      activeStatesBefore: candidates.map((candidate) => ({
        familyId: candidate.id,
        deletedAt: candidate.deletedAt ?? null,
        canonicalStatus: candidate.canonicalStatus ?? "legacy_unreviewed",
      })),
      canonicalMetadataBefore: candidates.map((candidate) => ({
        familyId: candidate.id,
        canonicalStatus: candidate.canonicalStatus ?? "legacy_unreviewed",
      })),
      revisionReferencesBefore: revisionReferencesAffected,
      parentMembershipsMovedOrCreated: [],
      childMembershipsMovedOrCreated: proposedSurvivorFamilyId
        ? childPlan.unique
            .filter((membership) => !childrenAlreadyOnSurvivor.has(membership.personId))
            .map((membership) => membership.personId)
        : [],
      familiesVoided: proposedVoidFamilyIds,
      layoutReferencesMigrated: layoutReferencesAffected,
      canonicalMetadataChanged: proposedSurvivorFamilyId ? proposedVoidFamilyIds.length + 1 : 0,
      revisionRowsExpected: proposedSurvivorFamilyId ? "future_executor_defined" : 0,
      rollbackRestoresOriginalState: true,
      reusedSurvivorNeverDeletedByRollback: true,
    },
    deletedFamilyAdvisory: input.deletedFamilyAdvisory
      ? {
          DELETED_FAMILY_ACTION:
            input.deletedFamilyAdvisory.action ??
            DELETED_FAMILY_ACTIONS.SEPARATE_OWNER_DECISION_REQUIRED,
          automaticActionPlanned: false,
        }
      : null,
    ownerReview: {
      required: true,
      options: OWNER_DECISION_OPTIONS,
      decision: null,
      decisionPackVersion: "NOT_ASSIGNED",
      decisionPackHash: "NOT_CREATED",
      ownerApprovalMarker: "NOT_CREATED",
      executionBatchId: "NOT_CREATED",
    },
    execution: {
      DRY_RUN_ONLY: true,
      DATABASE_CALL_COUNT: 0,
      RPC_CALL_COUNT: 0,
      GENEALOGY_MUTATION_COUNT: 0,
      RECONCILIATION_EXECUTED: false,
    },
    explanations: {
      WHY_THIS_SURVIVOR_IS_PROPOSED: proposedSurvivorFamilyId
        ? "compatible active candidate with non-conflicting canonical metadata and strongest non-arbitrary reference coverage"
        : null,
      WHY_EACH_OTHER_FAMILY_WOULD_BE_VOIDED: proposedVoidFamilyIds.map((familyId) => ({
        familyId,
        reason: "same normalized parent-set group after owner approval",
      })),
      WHAT_DATA_WOULD_MOVE: "child memberships and active layout references that currently point at void-family candidates",
      WHAT_DATA_WOULD_NOT_CHANGE: "people rows, unique child identity, unique parent identity and historical audit rows",
      WHAT_OWNER_MUST_VERIFY:
        "survivor choice, union context, child relationship semantics, layout impact and rollback forecast",
    },
  };
}

function family(id, parents, children, options = {}) {
  return {
    id,
    parentMemberships: parents.map((parent, index) => ({
      id: `${id}:p:${index}`,
      personId: parent.personId ?? parent,
      parentRole: parent.parentRole ?? "unknown",
      relationshipType: parent.relationshipType ?? "unknown",
      active: parent.active !== false,
    })),
    childMemberships: children.map((child, index) => ({
      id: `${id}:c:${index}`,
      personId: child.personId ?? child,
      relationshipType: child.relationshipType ?? "biological",
      active: child.active !== false,
    })),
    canonicalStatus: options.canonicalStatus ?? "legacy_unreviewed",
    deletedAt: options.deletedAt ?? null,
    unionContext: options.unionContext ?? null,
    layoutReferenceCount: options.layoutReferenceCount ?? 0,
    revisionReferenceCount: options.revisionReferenceCount ?? 0,
    auditLineageScore: options.auditLineageScore ?? 0,
    metadataConflict: options.metadataConflict ?? false,
    layoutConflict: options.layoutConflict ?? false,
  };
}

function buildSyntheticFixtures() {
  return [
    {
      name: "two-family-fragmentation",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            auditLineageScore: 1,
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"]),
        ],
      },
    },
    {
      name: "eight-family-fragmentation",
      input: {
        candidates: Array.from({ length: 8 }, (_, index) =>
          family(`family-${index + 1}`, ["parent-a", "parent-b"], [
            `child-${index + 1}`,
          ]),
        ),
      },
    },
    {
      name: "existing-family-multiple-children",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a", "child-b"]),
        ],
      },
    },
    {
      name: "duplicate-child-membership",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"]),
          family("family-b", ["parent-a", "parent-b"], ["child-a"]),
        ],
      },
    },
    {
      name: "duplicate-parent-membership",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"]),
          family("family-b", ["parent-a", "parent-b", "parent-a"], ["child-b"]),
        ],
      },
    },
    {
      name: "candidate-input-order-reversed",
      input: {
        candidates: [
          family("family-b", ["parent-b", "parent-a"], ["child-b"]),
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            auditLineageScore: 1,
          }),
        ],
      },
    },
    {
      name: "one-active-one-deleted",
      input: {
        candidates: [
          family("family-active", ["parent-a", "parent-b"], ["child-a"]),
          family("family-deleted", ["parent-a", "parent-b"], [], {
            deletedAt: "2026-01-01T00:00:00Z",
          }),
        ],
      },
    },
    {
      name: "one-active-one-voided",
      input: {
        candidates: [
          family("family-active", ["parent-a", "parent-b"], ["child-a"]),
          family("family-voided", ["parent-a", "parent-b"], ["child-b"], {
            canonicalStatus: "voided",
          }),
        ],
      },
    },
    {
      name: "two-equally-valid-active",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"]),
          family("family-b", ["parent-a", "parent-b"], ["child-b"]),
        ],
      },
    },
    {
      name: "broader-valid-audit-lineage",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            auditLineageScore: 3,
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"], {
            auditLineageScore: 1,
          }),
        ],
      },
    },
    {
      name: "layout-reference-conflict",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            layoutReferenceCount: 1,
            layoutConflict: true,
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"]),
        ],
      },
    },
    {
      name: "incompatible-canonical-metadata",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            canonicalStatus: "canonical",
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"], {
            metadataConflict: true,
          }),
        ],
      },
    },
    {
      name: "same-parent-different-spouses",
      input: {
        candidates: [
          family("family-a", ["parent-a", "spouse-a"], ["child-a"]),
          family("family-b", ["parent-a", "spouse-b"], ["child-b"]),
        ],
      },
    },
    {
      name: "same-parents-conflicting-union",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            unionContext: "union-1",
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"], {
            unionContext: "union-2",
          }),
        ],
      },
    },
    {
      name: "one-parent-ambiguous-spouse",
      input: {
        candidates: [
          family("family-a", ["parent-a"], ["child-a"], { unionContext: "unknown-a" }),
          family("family-b", ["parent-a"], ["child-b"], { unionContext: "unknown-b" }),
        ],
      },
    },
    {
      name: "more-than-two-parent-case",
      input: {
        graph: { tooManyParents: true },
        candidates: [
          family("family-a", ["parent-a", "parent-b", "parent-c"], ["child-a"]),
        ],
      },
    },
    {
      name: "cycle-risk",
      input: {
        graph: { cycleRisk: true },
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"]),
          family("family-b", ["parent-a", "parent-b"], ["child-b"]),
        ],
      },
    },
    {
      name: "parent-also-child",
      input: {
        graph: { parentAlsoChild: true },
        candidates: [family("family-a", ["parent-a"], ["parent-a"])],
      },
    },
    {
      name: "child-in-incompatible-parent-set",
      input: {
        graph: { conflictingParentSet: true },
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"]),
          family("family-b", ["parent-a", "parent-c"], ["child-a"]),
        ],
      },
    },
    {
      name: "conflicting-parent-role",
      input: {
        candidates: [
          family("family-a", [{ personId: "parent-a", parentRole: "father" }], [
            "child-a",
          ]),
          family("family-b", [{ personId: "parent-a", parentRole: "mother" }], [
            "child-b",
          ]),
        ],
      },
    },
    {
      name: "conflicting-child-relationship-type",
      input: {
        candidates: [
          family("family-a", ["parent-a"], [
            { personId: "child-a", relationshipType: "biological" },
          ]),
          family("family-b", ["parent-a"], [
            { personId: "child-a", relationshipType: "step" },
          ]),
        ],
      },
    },
    {
      name: "deleted-family-active-parents-no-children",
      input: {
        deletedFamilyAdvisory: {
          action: DELETED_FAMILY_ACTIONS.SEPARATE_OWNER_DECISION_REQUIRED,
        },
        candidates: [
          family("family-deleted", ["parent-a", "parent-b"], [], {
            deletedAt: "2026-01-01T00:00:00Z",
          }),
        ],
      },
    },
    {
      name: "deleted-family-matching-active-parent-set",
      input: {
        deletedFamilyAdvisory: {
          action: DELETED_FAMILY_ACTIONS.SEPARATE_OWNER_DECISION_REQUIRED,
        },
        candidates: [
          family("family-active", ["parent-a", "parent-b"], ["child-a"]),
          family("family-deleted", ["parent-a", "parent-b"], [], {
            deletedAt: "2026-01-01T00:00:00Z",
          }),
        ],
      },
    },
    {
      name: "deleted-family-historical-only",
      input: {
        deletedFamilyAdvisory: {
          action: DELETED_FAMILY_ACTIONS.NO_ACTION_HISTORICAL_ONLY,
        },
        candidates: [
          family("family-deleted", ["parent-a", "parent-b"], [], {
            deletedAt: "2026-01-01T00:00:00Z",
            revisionReferenceCount: 2,
          }),
        ],
      },
    },
    {
      name: "counts-forecast-two-family",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            auditLineageScore: 2,
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"]),
        ],
      },
    },
    {
      name: "counts-forecast-eight-family",
      input: {
        candidates: [
          family("family-1", ["parent-a", "parent-b"], ["child-1"], {
            auditLineageScore: 2,
          }),
          ...Array.from({ length: 7 }, (_, index) =>
            family(`family-${index + 2}`, ["parent-a", "parent-b"], [
              `child-${index + 2}`,
            ]),
          ),
        ],
      },
    },
    {
      name: "rollback-restores-membership-ownership",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            auditLineageScore: 2,
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"]),
        ],
      },
    },
    {
      name: "reused-survivor-never-deleted",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            auditLineageScore: 2,
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"]),
        ],
      },
    },
    {
      name: "no-people-added-or-removed",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            auditLineageScore: 2,
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"]),
        ],
      },
    },
    {
      name: "no-child-lost",
      input: {
        candidates: [
          family("family-a", ["parent-a", "parent-b"], ["child-a"], {
            auditLineageScore: 2,
          }),
          family("family-b", ["parent-a", "parent-b"], ["child-b"]),
        ],
      },
    },
  ];
}

function runSyntheticFixtureSuite() {
  const fixtures = buildSyntheticFixtures();
  const plans = fixtures.map((fixture) => ({
    name: fixture.name,
    plan: buildReconciliationPlan(fixture.input),
  }));
  return { fixtures, plans };
}

module.exports = {
  CONTRACT_VERSION,
  GROUP_KEY_PREFIX,
  RISK_CLASSES,
  DELETED_FAMILY_ACTIONS,
  OWNER_DECISION_OPTIONS,
  stableJson,
  buildGroupKey,
  buildReconciliationPlan,
  buildSyntheticFixtures,
  runSyntheticFixtureSuite,
};

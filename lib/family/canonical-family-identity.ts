import "server-only";

import { createHash } from "node:crypto";

import type { ParentRole } from "@/lib/family/relationship-types";
import {
  CANONICAL_FAMILY_IDENTITY_PREFIX,
  CANONICAL_FAMILY_IDENTITY_VERSION,
  type CanonicalFamilyIdentityInput,
  type CanonicalFamilyIdentityPayload,
  type CanonicalFamilyIdentityResult,
  type NormalizedCanonicalParent,
  type ParentSetNormalizationResult,
} from "@/lib/family/canonical-family-types";
import type {
  CanonicalFamilyBlocker,
  CanonicalFamilyDiagnostic,
} from "@/lib/family/canonical-family-errors";

const VALID_PARENT_ID = /^[A-Za-z0-9][A-Za-z0-9:_-]*$/;

function diagnostic(
  code: CanonicalFamilyDiagnostic["code"],
  flags?: Record<string, boolean>,
): CanonicalFamilyDiagnostic {
  return {
    code,
    operation: "NORMALIZE_PARENT_SET",
    flags,
  };
}

function normalizeText(value: string | null | undefined) {
  const normalized = (value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

export function stableCanonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableCanonicalJson(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableCanonicalJson(record[key])}`)
    .join(",")}}`;
}

export function normalizeCanonicalParentSet(
  parents: CanonicalFamilyIdentityInput["parents"],
): ParentSetNormalizationResult {
  const diagnostics: CanonicalFamilyDiagnostic[] = [];
  const blockers: CanonicalFamilyBlocker[] = [];
  const activeParents = parents.filter(
    (parent) => parent.active !== false && !parent.deletedAt,
  );
  const normalized: NormalizedCanonicalParent[] = [];
  const seen = new Set<string>();

  for (const parent of activeParents) {
    const personId = normalizeText(parent.personId);

    if (!personId || !VALID_PARENT_ID.test(personId)) {
      blockers.push(
        diagnostic("CANONICAL_FAMILY_INVALID_PARENT_ID", {
          hasParentId: Boolean(personId),
        }),
      );
      continue;
    }

    if (seen.has(personId)) {
      blockers.push(
        diagnostic("CANONICAL_FAMILY_DUPLICATE_PARENT_ID", {
          duplicateParentIdPresent: true,
        }),
      );
      continue;
    }

    seen.add(personId);
    normalized.push({
      personId,
      parentRole: parent.parentRole ?? "unknown",
      relationshipType: parent.relationshipType ?? "unknown",
    });
  }

  normalized.sort((a, b) => a.personId.localeCompare(b.personId));

  const parentIds = normalized.map((parent) => parent.personId);

  if (parentIds.length === 0) {
    blockers.push(diagnostic("CANONICAL_FAMILY_ZERO_PARENT_AMBIGUOUS"));
  }

  if (parentIds.length > 2) {
    blockers.push(
      diagnostic("CANONICAL_FAMILY_TOO_MANY_PARENTS", {
        tooManyParents: true,
      }),
    );
  }

  const semanticRoles = normalized
    .map((parent) => parent.parentRole)
    .filter((role): role is Exclude<ParentRole, "parent" | "unknown"> => {
      return role === "father" || role === "mother";
    });
  if (new Set(semanticRoles).size !== semanticRoles.length) {
    blockers.push(
      diagnostic("CANONICAL_FAMILY_CONFLICTING_PARENT_ROLE", {
        repeatedSemanticParentRole: true,
      }),
    );
  }

  diagnostics.push(
    {
      code: "CANONICAL_FAMILY_TRANSACTION_EXECUTOR_REQUIRED",
      operation: "PLAN_CANONICAL_FAMILY_MUTATION",
      counts: {
        inputParentCount: parents.length,
        activeParentCount: activeParents.length,
        normalizedParentCount: normalized.length,
      },
    },
    ...blockers,
  );

  if (blockers.length > 0) {
    return {
      status:
        parentIds.length > 2 || blockers.some((blocker) => blocker.code === "CANONICAL_FAMILY_CONFLICTING_PARENT_ROLE")
          ? "OWNER_REVIEW_REQUIRED"
          : "BLOCKED_AMBIGUOUS",
      parents: normalized,
      parentIds,
      warnings: [],
      blockers,
      diagnostics,
    };
  }

  return {
    status: "VALID",
    parents: normalized,
    parentIds,
    warnings: [],
    diagnostics,
  };
}

export function buildCanonicalFamilyIdentity(
  input: CanonicalFamilyIdentityInput,
): CanonicalFamilyIdentityResult {
  const normalized = normalizeCanonicalParentSet(input.parents);

  if (normalized.status !== "VALID") {
    return {
      status: normalized.status,
      canonicalKey: null,
      serializedPayload: null,
      payload: null,
      blockers: normalized.blockers,
      diagnostics: normalized.diagnostics,
    };
  }

  const payload: CanonicalFamilyIdentityPayload = {
    version: CANONICAL_FAMILY_IDENTITY_VERSION,
    parentIds: normalized.parentIds,
    unionIdentity: normalizeText(input.unionIdentity),
    relationshipPeriod: input.relationshipPeriod ?? null,
  };
  const serializedPayload = stableCanonicalJson(payload);
  const digest = createHash("sha256").update(serializedPayload).digest("hex");

  return {
    status: "VALID",
    canonicalKey: `${CANONICAL_FAMILY_IDENTITY_PREFIX}:${digest}`,
    serializedPayload,
    payload,
    diagnostics: normalized.diagnostics.map((entry) => ({
      ...entry,
      operation:
        entry.operation === "NORMALIZE_PARENT_SET"
          ? "BUILD_CANONICAL_IDENTITY"
          : entry.operation,
    })),
  };
}

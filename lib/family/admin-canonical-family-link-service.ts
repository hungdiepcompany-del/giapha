import "server-only";

import { planCanonicalFamilyMutation } from "@/lib/family/canonical-family-service";
import type { CanonicalFamilyRepository } from "@/lib/family/canonical-family-repository";
import type {
  CanonicalFamilyMutationPlan,
  CanonicalFamilyParentInput,
  ChildMembershipPlan,
  NormalizedCanonicalParent,
  ParentMembershipPlan,
} from "@/lib/family/canonical-family-types";
import type {
  ChildRelationshipType,
  ParentRelationshipType,
  ParentRole,
} from "@/lib/family/relationship-types";

export type AdminCanonicalFamilyPermission =
  | "relationships.create"
  | "people.create";

export type AdminCanonicalFamilyActorContext = {
  authUserId: string | null;
  profileId: string | null;
  permissions: AdminCanonicalFamilyPermission[];
};

export type AdminCanonicalFamilyLinkResultCode =
  | "PARENT_LINK_CREATED"
  | "PARENT_LINK_ALREADY_EXISTS"
  | "CHILD_LINK_CREATED"
  | "CHILD_LINK_ALREADY_EXISTS"
  | "CANONICAL_FAMILY_REUSED"
  | "CANONICAL_FAMILY_CREATED"
  | "OWNER_REVIEW_REQUIRED"
  | "BLOCKED_AMBIGUOUS"
  | "BLOCKED_CYCLE"
  | "BLOCKED_PERMISSION"
  | "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED";

export type AdminCanonicalFamilyLinkResult = {
  ok: boolean;
  code: AdminCanonicalFamilyLinkResultCode;
  message: string;
  canonicalKey: string | null;
  familyId: string | null;
  mutationExecuted: false;
  transactionExecutorRequired: boolean;
  diagnostics: {
    operation:
      | "ADMIN_PARENT_CANONICAL_LINK"
      | "ADMIN_CHILD_CANONICAL_LINK";
    blockerCode?: string;
    parentCount?: number;
    childCount?: number;
    familyCandidateCount?: number;
  };
};

export type AdminFamilyMembershipContext = {
  familyId: string;
  canonicalStatus:
    | "canonical"
    | "legacy_unreviewed"
    | "merged"
    | "voided"
    | "owner_review_required"
    | null;
  deletedAt: string | null;
  parents: NormalizedCanonicalParent[];
  childIds: string[];
};

export type AdminCanonicalFamilyTransactionExecutor = (params: {
  plan: CanonicalFamilyMutationPlan;
  actorProfileId: string;
  parentMemberships: ParentMembershipPlan[];
  childMemberships: ChildMembershipPlan[];
  sourceAction: "admin_tree_add_parent" | "admin_tree_add_child";
}) => Promise<AdminCanonicalFamilyLinkResult>;

export type AdminCanonicalFamilyLinkDependencies = {
  actor: AdminCanonicalFamilyActorContext;
  repository: CanonicalFamilyRepository;
  transactionExecutor?: AdminCanonicalFamilyTransactionExecutor;
  wouldCreateCycle(params: {
    parentId: string;
    childId: string;
  }): Promise<boolean>;
};

export type AdminParentLinkInput = {
  childId: string;
  parentId: string;
  parentRole: ParentRole;
  relationshipType: ParentRelationshipType;
  childFamilies: AdminFamilyMembershipContext[];
  createNewPersonBeforeLink?: boolean;
};

export type AdminChildLinkInput = {
  childId: string;
  parents: CanonicalFamilyParentInput[];
  childRelationshipType: ChildRelationshipType;
  parentFamilyContexts: AdminFamilyMembershipContext[];
  explicitFamilyId?: string | null;
  createNewPersonBeforeLink?: boolean;
};

const VIETNAMESE_MESSAGES: Record<AdminCanonicalFamilyLinkResultCode, string> = {
  PARENT_LINK_CREATED: "Đã gắn cha/mẹ vào gia đình chuẩn.",
  PARENT_LINK_ALREADY_EXISTS: "Quan hệ cha/mẹ đã tồn tại, không cần tạo thêm.",
  CHILD_LINK_CREATED: "Đã gắn con vào gia đình chuẩn.",
  CHILD_LINK_ALREADY_EXISTS: "Quan hệ con đã tồn tại, không cần tạo thêm.",
  CANONICAL_FAMILY_REUSED: "Đã dùng lại gia đình chuẩn hiện có.",
  CANONICAL_FAMILY_CREATED: "Đã tạo gia đình chuẩn mới.",
  OWNER_REVIEW_REQUIRED:
    "Cần chủ gia phả xem lại trước khi sửa quan hệ gia đình này.",
  BLOCKED_AMBIGUOUS:
    "Không thể xác định an toàn gia đình cần dùng, thao tác đã dừng.",
  BLOCKED_CYCLE: "Quan hệ này tạo vòng lặp tổ tiên nên đã bị chặn.",
  BLOCKED_PERMISSION: "Bạn không có đủ quyền để sửa quan hệ gia đình.",
  BLOCKED_TRANSACTION_EXECUTOR_REQUIRED:
    "Thao tác cần transaction an toàn trước khi được bật.",
};

function result(params: {
  code: AdminCanonicalFamilyLinkResultCode;
  operation: AdminCanonicalFamilyLinkResult["diagnostics"]["operation"];
  canonicalKey?: string | null;
  familyId?: string | null;
  blockerCode?: string;
  parentCount?: number;
  childCount?: number;
  familyCandidateCount?: number;
}): AdminCanonicalFamilyLinkResult {
  return {
    ok:
      params.code === "PARENT_LINK_CREATED" ||
      params.code === "PARENT_LINK_ALREADY_EXISTS" ||
      params.code === "CHILD_LINK_CREATED" ||
      params.code === "CHILD_LINK_ALREADY_EXISTS" ||
      params.code === "CANONICAL_FAMILY_REUSED" ||
      params.code === "CANONICAL_FAMILY_CREATED",
    code: params.code,
    message: VIETNAMESE_MESSAGES[params.code],
    canonicalKey: params.canonicalKey ?? null,
    familyId: params.familyId ?? null,
    mutationExecuted: false,
    transactionExecutorRequired:
      params.code === "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
    diagnostics: {
      operation: params.operation,
      blockerCode: params.blockerCode,
      parentCount: params.parentCount,
      childCount: params.childCount,
      familyCandidateCount: params.familyCandidateCount,
    },
  };
}

function hasCreatePermission(deps: AdminCanonicalFamilyLinkDependencies) {
  return (
    Boolean(deps.actor.authUserId) &&
    Boolean(deps.actor.profileId) &&
    deps.actor.permissions.includes("relationships.create")
  );
}

function activeFamilies(families: AdminFamilyMembershipContext[]) {
  return families.filter((family) => {
    return !family.deletedAt && family.canonicalStatus !== "merged" && family.canonicalStatus !== "voided";
  });
}

function uniqueParents(
  parents: CanonicalFamilyParentInput[],
): CanonicalFamilyParentInput[] {
  const seen = new Set<string>();
  const normalized: CanonicalFamilyParentInput[] = [];

  for (const parent of parents) {
    const personId = parent.personId?.trim();
    if (!personId || seen.has(personId)) continue;
    seen.add(personId);
    normalized.push(parent);
  }

  return normalized;
}

async function failIfCycle(params: {
  deps: AdminCanonicalFamilyLinkDependencies;
  parents: CanonicalFamilyParentInput[];
  childId: string;
}) {
  for (const parent of params.parents) {
    const parentId = parent.personId;
    if (!parentId) continue;
    if (parentId === params.childId) return true;
    if (
      await params.deps.wouldCreateCycle({
        parentId,
        childId: params.childId,
      })
    ) {
      return true;
    }
  }

  return false;
}

function mapPlanBlocker(
  plan: CanonicalFamilyMutationPlan,
): AdminCanonicalFamilyLinkResultCode | null {
  if (
    plan.decision === "OWNER_REVIEW_REQUIRED" ||
    plan.blockers.some((entry) => {
      return entry.code === "CANONICAL_FAMILY_LEGACY_DUPLICATE_REVIEW_REQUIRED";
    })
  ) {
    return "OWNER_REVIEW_REQUIRED";
  }

  if (
    plan.decision === "BLOCKED_AMBIGUOUS" ||
    plan.decision === "BLOCKED_INVARIANT_VIOLATION"
  ) {
    return "BLOCKED_AMBIGUOUS";
  }

  return null;
}

function transactionBlocked(params: {
  operation: AdminCanonicalFamilyLinkResult["diagnostics"]["operation"];
  plan: CanonicalFamilyMutationPlan;
}) {
  return result({
    code: "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
    operation: params.operation,
    canonicalKey: params.plan.canonicalKey,
    familyId: params.plan.familyToReuseId,
    blockerCode: "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
    parentCount: params.plan.parentMembershipsToEnsure.length,
    childCount: params.plan.childMembershipsToEnsure.length,
  });
}

export async function planAndExecuteAdminParentLink(
  deps: AdminCanonicalFamilyLinkDependencies,
  input: AdminParentLinkInput,
): Promise<AdminCanonicalFamilyLinkResult> {
  const operation = "ADMIN_PARENT_CANONICAL_LINK";
  if (!hasCreatePermission(deps)) {
    return result({ code: "BLOCKED_PERMISSION", operation });
  }

  if (input.createNewPersonBeforeLink && !deps.transactionExecutor) {
    return result({
      code: "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
      operation,
      blockerCode: "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
    });
  }

  if (input.parentId === input.childId) {
    return result({ code: "BLOCKED_CYCLE", operation });
  }

  const candidateFamilies = activeFamilies(input.childFamilies);
  if (candidateFamilies.length > 1) {
    return result({
      code: "OWNER_REVIEW_REQUIRED",
      operation,
      blockerCode: "MULTIPLE_CHILD_FAMILY_CONTEXTS",
      familyCandidateCount: candidateFamilies.length,
    });
  }

  const existingFamily = candidateFamilies[0] ?? null;
  if (
    existingFamily?.parents.some((parent) => {
      return parent.personId === input.parentId;
    })
  ) {
    return result({
      code: "PARENT_LINK_ALREADY_EXISTS",
      operation,
      familyId: existingFamily.familyId,
    });
  }

  const parents = uniqueParents([
    ...(existingFamily?.parents ?? []),
    {
      personId: input.parentId,
      parentRole: input.parentRole,
      relationshipType: input.relationshipType,
    },
  ]);

  if (await failIfCycle({ deps, parents, childId: input.childId })) {
    return result({ code: "BLOCKED_CYCLE", operation });
  }

  const plan = await planCanonicalFamilyMutation({
    repository: deps.repository,
    input: { parents },
    childIds: [input.childId],
  });
  const blocker = mapPlanBlocker(plan);
  if (blocker) {
    return result({
      code: blocker,
      operation,
      canonicalKey: plan.canonicalKey,
      familyId: plan.familyToReuseId,
      blockerCode: plan.blockers[0]?.code ?? blocker,
      parentCount: plan.parentMembershipsToEnsure.length,
      childCount: plan.childMembershipsToEnsure.length,
    });
  }

  if (!deps.transactionExecutor) {
    return transactionBlocked({ operation, plan });
  }

  return deps.transactionExecutor({
    plan,
    actorProfileId: deps.actor.profileId!,
    parentMemberships: plan.parentMembershipsToEnsure,
    childMemberships: plan.childMembershipsToEnsure,
    sourceAction: "admin_tree_add_parent",
  });
}

export async function planAndExecuteAdminChildLink(
  deps: AdminCanonicalFamilyLinkDependencies,
  input: AdminChildLinkInput,
): Promise<AdminCanonicalFamilyLinkResult> {
  const operation = "ADMIN_CHILD_CANONICAL_LINK";
  if (!hasCreatePermission(deps)) {
    return result({ code: "BLOCKED_PERMISSION", operation });
  }

  if (input.createNewPersonBeforeLink && !deps.transactionExecutor) {
    return result({
      code: "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
      operation,
      blockerCode: "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
    });
  }

  const matchingContext = input.explicitFamilyId
    ? input.parentFamilyContexts.find((family) => {
        return family.familyId === input.explicitFamilyId;
      }) ?? null
    : null;
  const usableContexts = activeFamilies(input.parentFamilyContexts);

  if (!matchingContext && usableContexts.length > 1) {
    return result({
      code: "OWNER_REVIEW_REQUIRED",
      operation,
      blockerCode: "MULTIPLE_SPOUSE_CONTEXTS",
      familyCandidateCount: usableContexts.length,
    });
  }

  const selectedContext = matchingContext ?? usableContexts[0] ?? null;
  if (selectedContext?.childIds.includes(input.childId)) {
    return result({
      code: "CHILD_LINK_ALREADY_EXISTS",
      operation,
      familyId: selectedContext.familyId,
    });
  }

  const parents = uniqueParents(selectedContext?.parents ?? input.parents);
  if (await failIfCycle({ deps, parents, childId: input.childId })) {
    return result({ code: "BLOCKED_CYCLE", operation });
  }

  const plan = await planCanonicalFamilyMutation({
    repository: deps.repository,
    input: { parents },
    childIds: [input.childId],
  });
  const blocker = mapPlanBlocker(plan);
  if (blocker) {
    return result({
      code: blocker,
      operation,
      canonicalKey: plan.canonicalKey,
      familyId: plan.familyToReuseId,
      blockerCode: plan.blockers[0]?.code ?? blocker,
      parentCount: plan.parentMembershipsToEnsure.length,
      childCount: plan.childMembershipsToEnsure.length,
    });
  }

  if (!deps.transactionExecutor) {
    return transactionBlocked({ operation, plan });
  }

  return deps.transactionExecutor({
    plan,
    actorProfileId: deps.actor.profileId!,
    parentMemberships: plan.parentMembershipsToEnsure,
    childMemberships: [
      {
        personId: input.childId,
        relationshipType: input.childRelationshipType,
      },
    ],
    sourceAction: "admin_tree_add_child",
  });
}

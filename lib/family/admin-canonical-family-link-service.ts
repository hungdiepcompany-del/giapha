import "server-only";

import { createHash } from "node:crypto";

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
  | "relationships.update"
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
  | "BLOCKED_CONCURRENT_MODIFICATION"
  | "BLOCKED_IDEMPOTENCY_CONFLICT"
  | "BLOCKED_INVALID_REFERENCE"
  | "BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED"
  | "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED";

export type AdminCanonicalFamilyLinkResult = {
  ok: boolean;
  code: AdminCanonicalFamilyLinkResultCode;
  message: string;
  canonicalKey: string | null;
  familyId: string | null;
  mutationExecuted: boolean;
  transactionExecutorRequired: boolean;
  idempotentReplay: boolean;
  diagnostics: {
    operation:
      | "ADMIN_PARENT_CANONICAL_LINK"
      | "ADMIN_CHILD_CANONICAL_LINK";
    blockerCode?: string;
    parentCount?: number;
    childCount?: number;
    familyCandidateCount?: number;
    familyCreated?: boolean;
    familyReused?: boolean;
    idempotentReplay?: boolean;
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
  updatedAt?: string | null;
  parents: NormalizedCanonicalParent[];
  childIds: string[];
};

export type AdminCanonicalFamilyTransactionExecutor = (params: {
  plan: CanonicalFamilyMutationPlan;
  actorProfileId: string;
  parentMemberships: ParentMembershipPlan[];
  childMemberships: ChildMembershipPlan[];
  sourceAction: "admin_tree_add_parent" | "admin_tree_add_child";
  familyAction: "CREATE" | "REUSE";
  targetFamilyId: string | null;
  expectedFamilyUpdatedAt: string | null;
  allowCanonicalMetadataUpdate: boolean;
  idempotencyKey: string;
  mutationPlanHash: string;
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

export const ADMIN_CANONICAL_FAMILY_VIETNAMESE_MESSAGES: Record<
  AdminCanonicalFamilyLinkResultCode,
  string
> = {
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
  BLOCKED_CONCURRENT_MODIFICATION:
    "Dữ liệu gia đình vừa thay đổi. Vui lòng tải lại trang và thử lại.",
  BLOCKED_IDEMPOTENCY_CONFLICT:
    "Yêu cầu này không khớp với lần gửi trước. Vui lòng tải lại trang và thử lại.",
  BLOCKED_INVALID_REFERENCE:
    "Thành viên hoặc gia đình cần gắn không còn hợp lệ.",
  BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED:
    "Chưa thể tạo thành viên mới kèm quan hệ trong cùng một giao dịch an toàn.",
  BLOCKED_TRANSACTION_EXECUTOR_REQUIRED:
    "Thao tác cần transaction an toàn trước khi được bật.",
};

export function buildAdminCanonicalFamilyLinkResult(params: {
  code: AdminCanonicalFamilyLinkResultCode;
  operation: AdminCanonicalFamilyLinkResult["diagnostics"]["operation"];
  canonicalKey?: string | null;
  familyId?: string | null;
  blockerCode?: string;
  parentCount?: number;
  childCount?: number;
  familyCandidateCount?: number;
  mutationExecuted?: boolean;
  transactionExecutorRequired?: boolean;
  familyCreated?: boolean;
  familyReused?: boolean;
  idempotentReplay?: boolean;
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
    message: ADMIN_CANONICAL_FAMILY_VIETNAMESE_MESSAGES[params.code],
    canonicalKey: params.canonicalKey ?? null,
    familyId: params.familyId ?? null,
    mutationExecuted: params.mutationExecuted ?? false,
    transactionExecutorRequired:
      params.transactionExecutorRequired ??
      params.code === "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
    idempotentReplay: params.idempotentReplay ?? false,
    diagnostics: {
      operation: params.operation,
      blockerCode: params.blockerCode,
      parentCount: params.parentCount,
      childCount: params.childCount,
      familyCandidateCount: params.familyCandidateCount,
      familyCreated: params.familyCreated,
      familyReused: params.familyReused,
      idempotentReplay: params.idempotentReplay,
    },
  };
}

function hasCreatePermission(deps: AdminCanonicalFamilyLinkDependencies) {
  return (
    Boolean(deps.actor.authUserId) &&
    Boolean(deps.actor.profileId) &&
    deps.actor.permissions.includes("relationships.create") &&
    deps.actor.permissions.includes("relationships.update")
  );
}

function activeFamilies(families: AdminFamilyMembershipContext[]) {
  return families.filter((family) => {
    return (
      !family.deletedAt &&
      family.canonicalStatus !== "merged" &&
      family.canonicalStatus !== "voided"
    );
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
  return buildAdminCanonicalFamilyLinkResult({
    code: "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
    operation: params.operation,
    canonicalKey: params.plan.canonicalKey,
    familyId: params.plan.familyToReuseId,
    blockerCode: "BLOCKED_TRANSACTION_EXECUTOR_REQUIRED",
    parentCount: params.plan.parentMembershipsToEnsure.length,
    childCount: params.plan.childMembershipsToEnsure.length,
    mutationExecuted: false,
  });
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableJson(entryValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function hashAdminCanonicalMutationPlan(value: unknown) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function buildPlanIdentity(params: {
  operationType: "ADD_PARENT" | "ADD_CHILD";
  actorProfileId: string;
  plan: CanonicalFamilyMutationPlan;
  familyAction: "CREATE" | "REUSE";
  targetFamilyId: string | null;
  expectedFamilyUpdatedAt: string | null;
  allowCanonicalMetadataUpdate: boolean;
  parentMemberships: ParentMembershipPlan[];
  childMemberships: ChildMembershipPlan[];
  sourceAction: "admin_tree_add_parent" | "admin_tree_add_child";
}) {
  const parents = params.parentMemberships
    .map((parent) => ({
      personId: parent.personId,
      parentRole: parent.parentRole,
      relationshipType: parent.relationshipType,
    }))
    .sort((left, right) => left.personId.localeCompare(right.personId));
  const children = params.childMemberships
    .map((child) => ({
      personId: child.personId,
      relationshipType: child.relationshipType,
    }))
    .sort((left, right) => left.personId.localeCompare(right.personId));

  return {
    version: "a17n-r-admin-parent-child:v1",
    operationType: params.operationType,
    actorProfileId: params.actorProfileId,
    familyAction: params.familyAction,
    targetFamilyId: params.targetFamilyId,
    expectedFamilyUpdatedAt: params.expectedFamilyUpdatedAt,
    allowCanonicalMetadataUpdate: params.allowCanonicalMetadataUpdate,
    canonicalKey: params.plan.canonicalKey,
    canonicalIdentityVersion: 1,
    parents,
    children,
    sourceAction: params.sourceAction,
  };
}

export function buildAdminCanonicalMutationExecutorIdentity(params: {
  operationType: "ADD_PARENT" | "ADD_CHILD";
  actorProfileId: string;
  plan: CanonicalFamilyMutationPlan;
  familyAction: "CREATE" | "REUSE";
  targetFamilyId: string | null;
  expectedFamilyUpdatedAt: string | null;
  allowCanonicalMetadataUpdate: boolean;
  parentMemberships: ParentMembershipPlan[];
  childMemberships: ChildMembershipPlan[];
  sourceAction: "admin_tree_add_parent" | "admin_tree_add_child";
}) {
  const identity = buildPlanIdentity(params);
  const mutationPlanHash = hashAdminCanonicalMutationPlan(identity);
  const keyHash = mutationPlanHash.slice(0, 32);

  return {
    idempotencyKey: `a17n-r:${params.operationType}:${keyHash}`,
    mutationPlanHash,
  };
}

async function executePlan(params: {
  deps: AdminCanonicalFamilyLinkDependencies;
  operation: AdminCanonicalFamilyLinkResult["diagnostics"]["operation"];
  operationType: "ADD_PARENT" | "ADD_CHILD";
  plan: CanonicalFamilyMutationPlan;
  parentMemberships: ParentMembershipPlan[];
  childMemberships: ChildMembershipPlan[];
  sourceAction: "admin_tree_add_parent" | "admin_tree_add_child";
  familyAction: "CREATE" | "REUSE";
  targetFamilyId: string | null;
  expectedFamilyUpdatedAt: string | null;
  allowCanonicalMetadataUpdate: boolean;
}) {
  if (!params.deps.transactionExecutor) {
    return transactionBlocked({
      operation: params.operation,
      plan: params.plan,
    });
  }

  const actorProfileId = params.deps.actor.profileId!;
  const identity = buildAdminCanonicalMutationExecutorIdentity({
    operationType: params.operationType,
    actorProfileId,
    plan: params.plan,
    familyAction: params.familyAction,
    targetFamilyId: params.targetFamilyId,
    expectedFamilyUpdatedAt: params.expectedFamilyUpdatedAt,
    allowCanonicalMetadataUpdate: params.allowCanonicalMetadataUpdate,
    parentMemberships: params.parentMemberships,
    childMemberships: params.childMemberships,
    sourceAction: params.sourceAction,
  });

  return params.deps.transactionExecutor({
    plan: params.plan,
    actorProfileId,
    parentMemberships: params.parentMemberships,
    childMemberships: params.childMemberships,
    sourceAction: params.sourceAction,
    familyAction: params.familyAction,
    targetFamilyId: params.targetFamilyId,
    expectedFamilyUpdatedAt: params.expectedFamilyUpdatedAt,
    allowCanonicalMetadataUpdate: params.allowCanonicalMetadataUpdate,
    idempotencyKey: identity.idempotencyKey,
    mutationPlanHash: identity.mutationPlanHash,
  });
}

export async function planAndExecuteAdminParentLink(
  deps: AdminCanonicalFamilyLinkDependencies,
  input: AdminParentLinkInput,
): Promise<AdminCanonicalFamilyLinkResult> {
  const operation = "ADMIN_PARENT_CANONICAL_LINK";
  if (!hasCreatePermission(deps)) {
    return buildAdminCanonicalFamilyLinkResult({
      code: "BLOCKED_PERMISSION",
      operation,
    });
  }

  if (input.createNewPersonBeforeLink) {
    return buildAdminCanonicalFamilyLinkResult({
      code: "BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED",
      operation,
      blockerCode: "BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED",
    });
  }

  if (input.parentId === input.childId) {
    return buildAdminCanonicalFamilyLinkResult({ code: "BLOCKED_CYCLE", operation });
  }

  const candidateFamilies = activeFamilies(input.childFamilies);
  if (candidateFamilies.length > 1) {
    return buildAdminCanonicalFamilyLinkResult({
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
    return buildAdminCanonicalFamilyLinkResult({
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
    return buildAdminCanonicalFamilyLinkResult({ code: "BLOCKED_CYCLE", operation });
  }

  const plan = await planCanonicalFamilyMutation({
    repository: deps.repository,
    input: { parents },
    childIds: [input.childId],
  });
  const blocker = mapPlanBlocker(plan);
  if (blocker) {
    return buildAdminCanonicalFamilyLinkResult({
      code: blocker,
      operation,
      canonicalKey: plan.canonicalKey,
      familyId: plan.familyToReuseId,
      blockerCode: plan.blockers[0]?.code ?? blocker,
      parentCount: plan.parentMembershipsToEnsure.length,
      childCount: plan.childMembershipsToEnsure.length,
    });
  }

  const familyAction =
    plan.familyToReuseId || existingFamily?.familyId ? "REUSE" : "CREATE";
  const targetFamilyId = plan.familyToReuseId ?? existingFamily?.familyId ?? null;
  const expectedFamilyUpdatedAt =
    existingFamily && targetFamilyId === existingFamily.familyId
      ? existingFamily.updatedAt ?? null
      : null;

  return executePlan({
    deps,
    operation,
    operationType: "ADD_PARENT",
    plan,
    parentMemberships: plan.parentMembershipsToEnsure,
    childMemberships: plan.childMembershipsToEnsure,
    sourceAction: "admin_tree_add_parent",
    familyAction,
    targetFamilyId,
    expectedFamilyUpdatedAt,
    allowCanonicalMetadataUpdate: Boolean(existingFamily),
  });
}

export async function planAndExecuteAdminChildLink(
  deps: AdminCanonicalFamilyLinkDependencies,
  input: AdminChildLinkInput,
): Promise<AdminCanonicalFamilyLinkResult> {
  const operation = "ADMIN_CHILD_CANONICAL_LINK";
  if (!hasCreatePermission(deps)) {
    return buildAdminCanonicalFamilyLinkResult({
      code: "BLOCKED_PERMISSION",
      operation,
    });
  }

  if (input.createNewPersonBeforeLink) {
    return buildAdminCanonicalFamilyLinkResult({
      code: "BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED",
      operation,
      blockerCode: "BLOCKED_NEW_PERSON_TRANSACTION_CONTRACT_REQUIRED",
    });
  }

  const matchingContext = input.explicitFamilyId
    ? input.parentFamilyContexts.find((family) => {
        return family.familyId === input.explicitFamilyId;
      }) ?? null
    : null;
  const usableContexts = activeFamilies(input.parentFamilyContexts);

  if (!matchingContext && usableContexts.length > 1) {
    return buildAdminCanonicalFamilyLinkResult({
      code: "OWNER_REVIEW_REQUIRED",
      operation,
      blockerCode: "MULTIPLE_SPOUSE_CONTEXTS",
      familyCandidateCount: usableContexts.length,
    });
  }

  const selectedContext = matchingContext ?? usableContexts[0] ?? null;
  if (selectedContext?.childIds.includes(input.childId)) {
    return buildAdminCanonicalFamilyLinkResult({
      code: "CHILD_LINK_ALREADY_EXISTS",
      operation,
      familyId: selectedContext.familyId,
    });
  }

  const parents = uniqueParents(selectedContext?.parents ?? input.parents);
  if (await failIfCycle({ deps, parents, childId: input.childId })) {
    return buildAdminCanonicalFamilyLinkResult({ code: "BLOCKED_CYCLE", operation });
  }

  const plan = await planCanonicalFamilyMutation({
    repository: deps.repository,
    input: { parents },
    childIds: [input.childId],
  });
  const blocker = mapPlanBlocker(plan);
  if (blocker) {
    return buildAdminCanonicalFamilyLinkResult({
      code: blocker,
      operation,
      canonicalKey: plan.canonicalKey,
      familyId: plan.familyToReuseId,
      blockerCode: plan.blockers[0]?.code ?? blocker,
      parentCount: plan.parentMembershipsToEnsure.length,
      childCount: plan.childMembershipsToEnsure.length,
    });
  }

  const familyAction =
    plan.familyToReuseId || selectedContext?.familyId ? "REUSE" : "CREATE";
  const targetFamilyId = plan.familyToReuseId ?? selectedContext?.familyId ?? null;
  const expectedFamilyUpdatedAt =
    selectedContext && targetFamilyId === selectedContext.familyId
      ? selectedContext.updatedAt ?? null
      : null;
  const childMemberships: ChildMembershipPlan[] = [
    {
      personId: input.childId,
      relationshipType: input.childRelationshipType,
    },
  ];

  return executePlan({
    deps,
    operation,
    operationType: "ADD_CHILD",
    plan,
    parentMemberships: plan.parentMembershipsToEnsure,
    childMemberships,
    sourceAction: "admin_tree_add_child",
    familyAction,
    targetFamilyId,
    expectedFamilyUpdatedAt,
    allowCanonicalMetadataUpdate: Boolean(selectedContext),
  });
}

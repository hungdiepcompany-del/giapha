import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildAdminCanonicalFamilyLinkResult,
  type AdminCanonicalFamilyLinkResultCode,
  type AdminCanonicalFamilyTransactionExecutor,
} from "@/lib/family/admin-canonical-family-link-service";

const RPC_NAME = "execute_admin_canonical_family_parent_child_write";

type RpcResult = {
  status?: string;
  operation_type?: "ADD_PARENT" | "ADD_CHILD";
  family_id?: string | null;
  family_created?: boolean;
  parent_membership_created?: boolean;
  child_membership_created?: boolean;
  idempotent_replay?: boolean;
  blocker_code?: string | null;
  parent_membership_count_before?: number;
  parent_membership_count_after?: number;
  child_membership_count_before?: number;
  child_membership_count_after?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toBoolean(value: unknown) {
  return value === true;
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function sanitizeStatus(value: unknown): AdminCanonicalFamilyLinkResultCode {
  if (
    value === "PARENT_LINK_CREATED" ||
    value === "PARENT_LINK_ALREADY_EXISTS" ||
    value === "CHILD_LINK_CREATED" ||
    value === "CHILD_LINK_ALREADY_EXISTS" ||
    value === "OWNER_REVIEW_REQUIRED" ||
    value === "BLOCKED_AMBIGUOUS" ||
    value === "BLOCKED_CYCLE" ||
    value === "BLOCKED_PERMISSION" ||
    value === "BLOCKED_CONCURRENT_MODIFICATION" ||
    value === "BLOCKED_IDEMPOTENCY_CONFLICT" ||
    value === "BLOCKED_INVALID_REFERENCE"
  ) {
    return value;
  }

  return "BLOCKED_INVALID_REFERENCE";
}

function validateRpcPayload(value: unknown): RpcResult | null {
  if (!isRecord(value)) return null;
  if (typeof value.status !== "string") return null;

  return value as RpcResult;
}

function mapRpcTransportFailure(
  operation: "ADMIN_PARENT_CANONICAL_LINK" | "ADMIN_CHILD_CANONICAL_LINK",
) {
  return buildAdminCanonicalFamilyLinkResult({
    code: "BLOCKED_INVALID_REFERENCE",
    operation,
    blockerCode: "RPC_TRANSPORT_FAILURE",
  });
}

export function createAdminCanonicalFamilyTransactionExecutor(
  supabase: SupabaseClient,
): AdminCanonicalFamilyTransactionExecutor {
  return async (params) => {
    const operationType =
      params.sourceAction === "admin_tree_add_parent" ? "ADD_PARENT" : "ADD_CHILD";
    const operation =
      operationType === "ADD_PARENT"
        ? "ADMIN_PARENT_CANONICAL_LINK"
        : "ADMIN_CHILD_CANONICAL_LINK";

    if (!params.idempotencyKey || !params.mutationPlanHash) {
      return buildAdminCanonicalFamilyLinkResult({
        code: "BLOCKED_IDEMPOTENCY_CONFLICT",
        operation,
        blockerCode: "IDEMPOTENCY_KEY_AND_PLAN_HASH_REQUIRED",
      });
    }

    if (!params.plan.canonicalKey || params.childMemberships.length !== 1) {
      return buildAdminCanonicalFamilyLinkResult({
        code: "BLOCKED_INVALID_REFERENCE",
        operation,
        blockerCode: "INVALID_MUTATION_PLAN",
      });
    }

    const { data, error } = await supabase.rpc(RPC_NAME, {
      p_operation_type: operationType,
      p_idempotency_key: params.idempotencyKey,
      p_actor_profile_id: params.actorProfileId,
      p_family_action: params.familyAction,
      p_target_family_id: params.targetFamilyId,
      p_expected_family_updated_at: params.expectedFamilyUpdatedAt,
      p_allow_canonical_metadata_update: params.allowCanonicalMetadataUpdate,
      p_canonical_key: params.plan.canonicalKey,
      p_canonical_identity_version: 1,
      p_parent_person_ids: params.parentMemberships.map((parent) => parent.personId),
      p_parent_roles: params.parentMemberships.map((parent) => parent.parentRole),
      p_parent_relationship_types: params.parentMemberships.map(
        (parent) => parent.relationshipType,
      ),
      p_child_person_id: params.childMemberships[0].personId,
      p_child_relationship_type: params.childMemberships[0].relationshipType,
      p_source_action: params.sourceAction,
      p_mutation_plan_hash: params.mutationPlanHash,
    });

    if (error) {
      return mapRpcTransportFailure(operation);
    }

    const payload = validateRpcPayload(data);
    if (!payload) {
      return buildAdminCanonicalFamilyLinkResult({
        code: "BLOCKED_INVALID_REFERENCE",
        operation,
        blockerCode: "RPC_RETURN_SHAPE_INVALID",
      });
    }

    const code = sanitizeStatus(payload.status);
    const familyCreated = toBoolean(payload.family_created);
    const idempotentReplay = toBoolean(payload.idempotent_replay);
    const mutationExecuted =
      code === "PARENT_LINK_CREATED" || code === "CHILD_LINK_CREATED";

    return buildAdminCanonicalFamilyLinkResult({
      code,
      operation,
      familyId: typeof payload.family_id === "string" ? payload.family_id : null,
      blockerCode:
        typeof payload.blocker_code === "string" ? payload.blocker_code : undefined,
      parentCount: toNumber(payload.parent_membership_count_after),
      childCount: toNumber(payload.child_membership_count_after),
      mutationExecuted,
      familyCreated,
      familyReused: Boolean(payload.family_id) && !familyCreated,
      idempotentReplay,
    });
  };
}

import "server-only";

import type {
  A17OGroupedImportPlan,
  A17OGroupedImportPlanCounts,
} from "@/lib/import/giapha4/canonical-family-grouping";
import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

export const A17O_GROUPED_OFFICIAL_IMPORT_RPC_NAME =
  "public.a17o_tx_execute_grouped_giapha4_official_import" as const;

export const A17O_GROUPED_OFFICIAL_IMPORT_RPC_FUNCTION_NAME =
  "a17o_tx_execute_grouped_giapha4_official_import" as const;

export type A17OGroupedOfficialImportSupabaseClient = {
  rpc: (
    functionName:
      | "current_profile_id"
      | typeof A17O_GROUPED_OFFICIAL_IMPORT_RPC_FUNCTION_NAME,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message?: string } | null }>;
  from: (table: "import_sessions") => {
    select: (columns: "created_by") => {
      eq: (
        column: "id",
        value: string,
      ) => {
        maybeSingle: <T>() => Promise<{
          data: T | null;
          error: { message?: string } | null;
        }>;
      };
    };
  };
};

export type A17OGroupedOfficialImportExecutorInput = {
  sessionId: string;
  confirmMarker: string;
  manifestHash: string | null;
  reviewPackHash: string | null;
  groupedPlan: A17OGroupedImportPlan;
  idempotencyKey: string;
  mutationPlanHash: string;
  confirmValidationErrorsResolved: true;
  confirmRollbackReviewed: true;
  confirmAuditReviewed: true;
  dryRunOnly: false;
  expectedCounts: A17OGroupedImportPlanCounts;
  sameRunRpcClient?: A17OGroupedOfficialImportSupabaseClient | null;
};

export type A17OGroupedOfficialImportExecutorResult = {
  ok: boolean;
  status: "IMPORT_COMPLETED" | "IDEMPOTENT_REPLAY" | "BLOCKED";
  importedPeopleCount: number;
  importedRelationshipCount: number;
  skippedCount: number;
  warningsCount: number;
  auditBatchId: string | null;
  rollbackManifestCount: number;
  idempotencyKey: string | null;
  mutationPlanHash: string | null;
  familyGroupCount: number;
  createdFamilyCount: number;
  reusedFamilyCount: number;
  createdParentMembershipCount: number;
  existingParentMembershipCount: number;
  createdChildMembershipCount: number;
  existingChildMembershipCount: number;
  blockedReasons: string[];
  piiPrinted: false;
};

type JsonRecord = Record<string, unknown>;

function toRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonRecord;
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toStringOrNull(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function blocked(reason: string): A17OGroupedOfficialImportExecutorResult {
  return {
    ok: false,
    status: "BLOCKED",
    importedPeopleCount: 0,
    importedRelationshipCount: 0,
    skippedCount: 0,
    warningsCount: 0,
    auditBatchId: null,
    rollbackManifestCount: 0,
    idempotencyKey: null,
    mutationPlanHash: null,
    familyGroupCount: 0,
    createdFamilyCount: 0,
    reusedFamilyCount: 0,
    createdParentMembershipCount: 0,
    existingParentMembershipCount: 0,
    createdChildMembershipCount: 0,
    existingChildMembershipCount: 0,
    blockedReasons: [reason],
    piiPrinted: false,
  };
}

function validateGroupedRpcResult(params: {
  payload: JsonRecord | null;
  input: A17OGroupedOfficialImportExecutorInput;
}): A17OGroupedOfficialImportExecutorResult {
  const { payload, input } = params;
  if (!payload) return blocked("A17O_R_BLOCKED_INVALID_GROUPED_RPC_RESULT");

  const status = payload.status;
  const isReplay = payload.idempotent_replay === true;
  const approvedStatus =
    status === "IMPORT_COMPLETED" || (status === "IMPORT_COMPLETED" && isReplay);
  if (payload.ok !== true || !approvedStatus) {
    return {
      ...blocked("A17O_R_BLOCKED_GROUPED_RPC_NOT_SUCCESS"),
      blockedReasons: Array.isArray(payload.blocked_reasons)
        ? payload.blocked_reasons.map(String)
        : ["A17O_R_BLOCKED_GROUPED_RPC_NOT_SUCCESS"],
    };
  }

  if (payload.executor_contract_version !== 1) {
    return blocked("A17O_R_BLOCKED_GROUPED_RPC_CONTRACT_VERSION_MISMATCH");
  }
  if (payload.import_session_id !== input.sessionId) {
    return blocked("A17O_R_BLOCKED_GROUPED_RPC_SESSION_MISMATCH");
  }
  if (String(payload.mutation_plan_hash ?? "").toLowerCase() !== input.mutationPlanHash) {
    return blocked("A17O_R_BLOCKED_GROUPED_RPC_PLAN_HASH_MISMATCH");
  }

  const familyGroupCount = toNumber(payload.family_group_count);
  const createdFamilyCount = toNumber(payload.created_family_count);
  const reusedFamilyCount = toNumber(payload.reused_family_count);
  const createdParentMembershipCount = toNumber(
    payload.created_parent_membership_count,
  );
  const existingParentMembershipCount = toNumber(
    payload.existing_parent_membership_count,
  );
  const createdChildMembershipCount = toNumber(
    payload.created_child_membership_count,
  );
  const existingChildMembershipCount = toNumber(
    payload.existing_child_membership_count,
  );
  const parentMembershipCount =
    createdParentMembershipCount + existingParentMembershipCount;
  const childMembershipCount =
    createdChildMembershipCount + existingChildMembershipCount;

  if (
    familyGroupCount !== input.expectedCounts.canonicalFamilyGroupCount ||
    createdFamilyCount + reusedFamilyCount !== familyGroupCount ||
    parentMembershipCount !== input.expectedCounts.plannedParentMembershipCount ||
    childMembershipCount !== input.expectedCounts.plannedChildMembershipCount
  ) {
    return blocked("A17O_R_BLOCKED_GROUPED_RPC_COUNT_MISMATCH");
  }

  return {
    ok: true,
    status: isReplay ? "IDEMPOTENT_REPLAY" : "IMPORT_COMPLETED",
    importedPeopleCount: toNumber(payload.created_people_count),
    importedRelationshipCount: toNumber(payload.created_relationship_count),
    skippedCount: 0,
    warningsCount: 0,
    auditBatchId: toStringOrNull(payload.audit_batch_id),
    rollbackManifestCount: toNumber(payload.rollback_manifest_count),
    idempotencyKey: toStringOrNull(payload.idempotency_key),
    mutationPlanHash: toStringOrNull(payload.mutation_plan_hash),
    familyGroupCount,
    createdFamilyCount,
    reusedFamilyCount,
    createdParentMembershipCount,
    existingParentMembershipCount,
    createdChildMembershipCount,
    existingChildMembershipCount,
    blockedReasons: [],
    piiPrinted: false,
  };
}

export async function executeA17OGroupedOfficialImportWithSupabase(
  input: A17OGroupedOfficialImportExecutorInput,
): Promise<A17OGroupedOfficialImportExecutorResult> {
  const supabase =
    input.sameRunRpcClient ?? (await maybeCreateServerSupabaseClient());
  if (!supabase) {
    return blocked("A17O_R_BLOCKED_SUPABASE_SERVER_CLIENT_UNAVAILABLE");
  }

  const rpcClient =
    supabase as unknown as A17OGroupedOfficialImportSupabaseClient;
  const { data, error } = await rpcClient.rpc(
    A17O_GROUPED_OFFICIAL_IMPORT_RPC_FUNCTION_NAME,
    {
      p_import_session_id: input.sessionId,
      p_confirm_marker: input.confirmMarker,
      p_confirm_manifest_hash: input.manifestHash,
      p_confirm_review_pack_hash: input.reviewPackHash,
      p_grouped_plan: input.groupedPlan,
      p_idempotency_key: input.idempotencyKey,
      p_mutation_plan_hash: input.mutationPlanHash,
      p_confirm_validation_errors_resolved:
        input.confirmValidationErrorsResolved,
      p_confirm_rollback_reviewed: input.confirmRollbackReviewed,
      p_confirm_audit_reviewed: input.confirmAuditReviewed,
      p_dry_run_only: input.dryRunOnly,
    },
  );

  if (error) {
    return blocked("A17O_R_BLOCKED_GROUPED_TRANSACTION_RPC_FAILED");
  }

  return validateGroupedRpcResult({
    payload: toRecord(data),
    input,
  });
}

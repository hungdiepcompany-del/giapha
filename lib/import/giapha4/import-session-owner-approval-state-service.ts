import "server-only";

import { buildDryRunMappingPreview } from "@/lib/import/giapha4/dry-run-mapping-preview-service";
import { buildDuplicateDecisionSummary } from "@/lib/import/giapha4/duplicate-decision-review-service";
import { buildImportReviewPackFromManifest } from "@/lib/import/giapha4/import-review-pack-service";
import {
  getImportManifest,
  type ImportManifestReadResult,
  type ImportWriteManifestPreview,
} from "@/lib/import/giapha4/manifest-read-service";
import { buildManifestValidationReview } from "@/lib/import/giapha4/manifest-validation-service";
import {
  A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID,
} from "@/lib/import/giapha4/official-import-service";
import type { PermissionContext } from "@/lib/permissions/permission-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";

export const A16BC_OWNER_APPROVAL_STATE_TRANSITION_MARKER =
  "A16BC_OWNER_APPROVAL_STATE_TRANSITION_CANDIDATE";

export const A16BC_READY_FOR_OWNER_APPROVAL_MARKER =
  `APPROVE_A16BC_READY_FOR_OWNER_APPROVAL_FOR_SESSION_${A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}` as const;

export const A16BC_OWNER_APPROVED_FOR_DB_WRITE_MARKER =
  `APPROVE_A16BC_OWNER_APPROVED_FOR_DB_WRITE_FOR_SESSION_${A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}` as const;

export const A16BC_OWNER_APPROVAL_STATE_ROUTE =
  `/api/admin/import-sessions/${A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}/owner-approval-state` as const;

export type A16BCOwnerApprovalAction =
  | "mark_ready_for_owner_approval"
  | "approve_for_db_write";

export type A16BCOwnerApprovalConfirmation = {
  action?: unknown;
  confirmSessionId?: unknown;
  confirmMarker?: unknown;
  confirmNoValidationErrors?: unknown;
  confirmNoDryRunBlockers?: unknown;
  confirmDuplicateDecisionsComplete?: unknown;
  confirmRelationshipAmbiguityClear?: unknown;
  confirmReviewPackReady?: unknown;
  confirmNoOfficialImportExecution?: unknown;
  confirmRollbackReviewed?: unknown;
  confirmAuditReviewed?: unknown;
};

export type A16BCOwnerApprovalTransitionResult = {
  ok: boolean;
  marker: typeof A16BC_OWNER_APPROVAL_STATE_TRANSITION_MARKER;
  sessionId: string;
  action: A16BCOwnerApprovalAction | null;
  previousSessionState: string | null;
  nextSessionState: string | null;
  writeManifestStatus: string | null;
  officialImportPostCalled: false;
  rpcCalled: false;
  realGenealogyWrite: false;
  canRunOfficialImport: false;
  blockedReasons: string[];
  httpStatus: 200 | 400 | 401 | 403 | 404 | 409 | 422 | 503;
  message: string;
};

function baseResult(
  overrides: Partial<A16BCOwnerApprovalTransitionResult>,
): A16BCOwnerApprovalTransitionResult {
  return {
    ok: false,
    marker: A16BC_OWNER_APPROVAL_STATE_TRANSITION_MARKER,
    sessionId: A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID,
    action: null,
    previousSessionState: null,
    nextSessionState: null,
    writeManifestStatus: null,
    officialImportPostCalled: false,
    rpcCalled: false,
    realGenealogyWrite: false,
    canRunOfficialImport: false,
    blockedReasons: [],
    httpStatus: 409,
    message:
      "A-16BC owner approval state transition is blocked. No official import was executed.",
    ...overrides,
  };
}

function normalizeAction(value: unknown): A16BCOwnerApprovalAction | null {
  if (
    value === "mark_ready_for_owner_approval" ||
    value === "approve_for_db_write"
  ) {
    return value;
  }
  return null;
}

function isConfirmed(value: unknown) {
  return value === true;
}

function hasStrictOwnerAdminContext(context: PermissionContext) {
  const roleCodes = context.roles.map((role) => role.code);
  return (
    Boolean(context.user && context.profile) &&
    (roleCodes.includes("OWNER") || roleCodes.includes("ADMIN")) &&
    context.permissions.includes("imports.create") &&
    context.permissions.includes("people.create") &&
    context.permissions.includes("relationships.create") &&
    context.permissions.includes("permissions.manage")
  );
}

function expectedMarkerForAction(action: A16BCOwnerApprovalAction) {
  return action === "mark_ready_for_owner_approval"
    ? A16BC_READY_FOR_OWNER_APPROVAL_MARKER
    : A16BC_OWNER_APPROVED_FOR_DB_WRITE_MARKER;
}

function buildGateReasons(params: {
  action: A16BCOwnerApprovalAction;
  sessionId: string;
  confirmation: A16BCOwnerApprovalConfirmation;
  manifest: ImportManifestReadResult;
  actor: PermissionContext;
}) {
  const reasons: string[] = [];
  const validation = buildManifestValidationReview(params.manifest);
  const dryRun = buildDryRunMappingPreview(params.manifest);
  const reviewPack = buildImportReviewPackFromManifest(params.manifest);
  const duplicateSummary = buildDuplicateDecisionSummary(params.manifest);
  const relationshipAmbiguityClear = params.manifest.relationshipsPreview.every(
    (item) => !item.ambiguityStatus || item.ambiguityStatus === "clear",
  );
  const sessionState = params.manifest.session?.status ?? null;

  if (!hasStrictOwnerAdminContext(params.actor)) {
    reasons.push("A16BC_BLOCKED_OWNER_ADMIN_STRICT_PERMISSION_CONTEXT_MISSING");
  }
  if (params.sessionId !== A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID) {
    reasons.push("A16BC_BLOCKED_AUDITED_SESSION_MISMATCH");
  }
  if (params.confirmation.confirmSessionId !== params.sessionId) {
    reasons.push("A16BC_BLOCKED_CONFIRM_SESSION_ID_MISMATCH");
  }
  if (params.confirmation.confirmMarker !== expectedMarkerForAction(params.action)) {
    reasons.push("A16BC_BLOCKED_CONFIRM_MARKER_MISSING_OR_MISMATCHED");
  }
  if (!isConfirmed(params.confirmation.confirmNoValidationErrors)) {
    reasons.push("A16BC_BLOCKED_VALIDATION_ERRORS_NOT_CONFIRMED_CLEAR");
  }
  if (!isConfirmed(params.confirmation.confirmNoDryRunBlockers)) {
    reasons.push("A16BC_BLOCKED_DRY_RUN_BLOCKERS_NOT_CONFIRMED_CLEAR");
  }
  if (!isConfirmed(params.confirmation.confirmDuplicateDecisionsComplete)) {
    reasons.push("A16BC_BLOCKED_DUPLICATE_DECISIONS_NOT_CONFIRMED_COMPLETE");
  }
  if (!isConfirmed(params.confirmation.confirmRelationshipAmbiguityClear)) {
    reasons.push("A16BC_BLOCKED_RELATIONSHIP_AMBIGUITY_NOT_CONFIRMED_CLEAR");
  }
  if (!isConfirmed(params.confirmation.confirmReviewPackReady)) {
    reasons.push("A16BC_BLOCKED_REVIEW_PACK_NOT_CONFIRMED_READY");
  }
  if (!isConfirmed(params.confirmation.confirmNoOfficialImportExecution)) {
    reasons.push("A16BC_BLOCKED_NO_OFFICIAL_IMPORT_EXECUTION_NOT_CONFIRMED");
  }
  if (!isConfirmed(params.confirmation.confirmRollbackReviewed)) {
    reasons.push("A16BC_BLOCKED_ROLLBACK_NOT_REVIEWED");
  }
  if (!isConfirmed(params.confirmation.confirmAuditReviewed)) {
    reasons.push("A16BC_BLOCKED_AUDIT_NOT_REVIEWED");
  }
  if (!params.manifest.ok || !params.manifest.session) {
    reasons.push("A16BC_BLOCKED_IMPORT_MANIFEST_NOT_READABLE");
  }
  if (validation.summary.errorCount > 0) {
    reasons.push("A16BC_BLOCKED_VALIDATION_ERRORS_PRESENT");
  }
  if (dryRun.summary.blockedByErrorCount > 0) {
    reasons.push("A16BC_BLOCKED_DRY_RUN_BLOCKERS_PRESENT");
  }
  if (reviewPack.readiness !== "READY_FOR_OWNER_REVIEW") {
    reasons.push("A16BC_BLOCKED_REVIEW_PACK_NOT_READY");
  }
  if (duplicateSummary.unresolvedDuplicateCandidates > 0) {
    reasons.push("A16BC_BLOCKED_DUPLICATE_UNRESOLVED_PRESENT");
  }
  if (duplicateSummary.needsReviewDuplicateCandidates > 0) {
    reasons.push("A16BC_BLOCKED_DUPLICATE_NEEDS_REVIEW_PRESENT");
  }
  if (!relationshipAmbiguityClear) {
    reasons.push("A16BC_BLOCKED_RELATIONSHIP_AMBIGUITY_PRESENT");
  }
  if (
    params.action === "mark_ready_for_owner_approval" &&
    sessionState !== "preview_generated"
  ) {
    reasons.push("A16BC_BLOCKED_READY_TRANSITION_REQUIRES_PREVIEW_GENERATED");
  }
  if (
    params.action === "approve_for_db_write" &&
    sessionState !== "ready_for_owner_approval"
  ) {
    reasons.push("A16BC_BLOCKED_DB_WRITE_TRANSITION_REQUIRES_READY_FOR_OWNER_APPROVAL");
  }

  return {
    reasons: [...new Set(reasons)],
    latestWriteManifest: params.manifest.writeManifests[0] ?? null,
  };
}

function transitionReviewSummary(params: {
  manifest: ImportManifestReadResult;
  action: A16BCOwnerApprovalAction;
  marker: string;
}) {
  const previous = params.manifest.session?.reviewSummary ?? {};
  return {
    ...previous,
    a16bc_owner_approval_state: {
      marker: A16BC_OWNER_APPROVAL_STATE_TRANSITION_MARKER,
      action: params.action,
      approval_marker: params.marker,
      official_import_post_called: false,
      rpc_called: false,
      real_genealogy_write: false,
    },
  };
}

async function updateReadyForOwnerApproval(params: {
  sessionId: string;
  manifest: ImportManifestReadResult;
  profileId: string;
  marker: string;
}) {
  const admin = maybeCreateAdminSupabaseClient();
  if (!admin) {
    return { errorMessage: "A16BC_BLOCKED_ADMIN_SUPABASE_CLIENT_UNAVAILABLE" };
  }

  const { error } = await admin
    .from("import_sessions")
    .update({
      status: "ready_for_owner_approval",
      review_summary: transitionReviewSummary({
        manifest: params.manifest,
        action: "mark_ready_for_owner_approval",
        marker: params.marker,
      }),
      updated_by: params.profileId,
    })
    .eq("id", params.sessionId)
    .eq("status", "preview_generated");

  return { errorMessage: error?.message ?? null };
}

async function updateOwnerApprovedForDbWrite(params: {
  sessionId: string;
  manifest: ImportManifestReadResult;
  profileId: string;
  marker: string;
  writeManifest: ImportWriteManifestPreview;
}) {
  const admin = maybeCreateAdminSupabaseClient();
  if (!admin) {
    return { errorMessage: "A16BC_BLOCKED_ADMIN_SUPABASE_CLIENT_UNAVAILABLE" };
  }
  const approvedAt = new Date().toISOString();

  if (params.writeManifest.status !== "owner_approved") {
    const { error: writeManifestError } = await admin
      .from("import_write_manifests")
      .update({
        status: "owner_approved",
        approval_marker: params.marker,
        approved_by: params.profileId,
        approved_at: approvedAt,
      })
      .eq("id", params.writeManifest.id)
      .in("status", ["draft", "ready_for_apply"]);

    if (writeManifestError) {
      return { errorMessage: writeManifestError.message };
    }
  }

  const { error: sessionError } = await admin
    .from("import_sessions")
    .update({
      status: "owner_approved_for_db_write",
      approval_marker: params.marker,
      approved_by: params.profileId,
      approved_at: approvedAt,
      review_summary: transitionReviewSummary({
        manifest: params.manifest,
        action: "approve_for_db_write",
        marker: params.marker,
      }),
      updated_by: params.profileId,
    })
    .eq("id", params.sessionId)
    .eq("status", "ready_for_owner_approval");

  return { errorMessage: sessionError?.message ?? null };
}

export async function transitionImportSessionOwnerApprovalState(input: {
  sessionId: string;
  confirmation: A16BCOwnerApprovalConfirmation;
}): Promise<A16BCOwnerApprovalTransitionResult> {
  const action = normalizeAction(input.confirmation.action);
  if (!action) {
    return baseResult({
      action: null,
      sessionId: input.sessionId,
      httpStatus: 400,
      blockedReasons: ["A16BC_BLOCKED_INVALID_ACTION"],
      message: "A-16BC transition action is invalid.",
    });
  }

  const actor = await getPermissionContext();
  if (!actor.user) {
    return baseResult({
      action,
      sessionId: input.sessionId,
      httpStatus: 401,
      blockedReasons: ["A16BC_BLOCKED_UNAUTHENTICATED"],
      message: "Owner/admin login is required before A-16BC state transition.",
    });
  }

  if (!hasStrictOwnerAdminContext(actor)) {
    return baseResult({
      action,
      sessionId: input.sessionId,
      httpStatus: 403,
      blockedReasons: ["A16BC_BLOCKED_OWNER_ADMIN_STRICT_PERMISSION_CONTEXT_MISSING"],
      message:
        "OWNER/ADMIN context with imports.create, people.create, relationships.create and permissions.manage is required.",
    });
  }

  const manifest = await getImportManifest(input.sessionId);
  if (!manifest.ok || !manifest.session) {
    return baseResult({
      action,
      sessionId: input.sessionId,
      httpStatus: manifest.httpStatus === 404 ? 404 : 503,
      blockedReasons: ["A16BC_BLOCKED_IMPORT_MANIFEST_NOT_READABLE"],
      message: "Import manifest is not readable for A-16BC state transition.",
    });
  }

  const marker = expectedMarkerForAction(action);
  const gate = buildGateReasons({
    action,
    sessionId: input.sessionId,
    confirmation: input.confirmation,
    manifest,
    actor,
  });

  if (action === "approve_for_db_write" && !gate.latestWriteManifest) {
    gate.reasons.push("A16BC_BLOCKED_WRITE_MANIFEST_MISSING");
  }

  if (gate.reasons.length > 0 || !actor.profile) {
    return baseResult({
      action,
      sessionId: input.sessionId,
      previousSessionState: manifest.session.status,
      writeManifestStatus: gate.latestWriteManifest?.status ?? null,
      httpStatus: 422,
      blockedReasons: gate.reasons,
      message:
        "A-16BC state transition gates are not satisfied. No official import was executed.",
    });
  }

  const updateResult =
    action === "mark_ready_for_owner_approval"
      ? await updateReadyForOwnerApproval({
          sessionId: input.sessionId,
          manifest,
          profileId: actor.profile.id,
          marker,
        })
      : await updateOwnerApprovedForDbWrite({
          sessionId: input.sessionId,
          manifest,
          profileId: actor.profile.id,
          marker,
          writeManifest: gate.latestWriteManifest!,
        });

  if (updateResult.errorMessage) {
    return baseResult({
      action,
      sessionId: input.sessionId,
      previousSessionState: manifest.session.status,
      writeManifestStatus: gate.latestWriteManifest?.status ?? null,
      httpStatus: 409,
      blockedReasons: [
        "A16BC_BLOCKED_STATE_TRANSITION_UPDATE_FAILED",
        updateResult.errorMessage,
      ],
      message:
        "A-16BC state transition update failed. No official import was executed.",
    });
  }

  return baseResult({
    ok: true,
    action,
    sessionId: input.sessionId,
    previousSessionState: manifest.session.status,
    nextSessionState:
      action === "mark_ready_for_owner_approval"
        ? "ready_for_owner_approval"
        : "owner_approved_for_db_write",
    writeManifestStatus:
      action === "approve_for_db_write"
        ? "owner_approved"
        : gate.latestWriteManifest?.status ?? null,
    httpStatus: 200,
    message:
      action === "mark_ready_for_owner_approval"
        ? "A-16BC moved the audited session to ready_for_owner_approval. Official import was not executed."
        : "A-16BC moved the audited session to owner_approved_for_db_write. Official import was not executed.",
  });
}

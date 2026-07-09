import { NextResponse } from "next/server";

import {
  A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER,
  A16U_REQUIRED_A16R_RETRY_MARKER,
  getOfficialImportRuntimeCandidate,
  type OfficialImportConfirmation,
} from "@/lib/import/giapha4/official-import-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

const A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED =
  process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === "true";

const A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED =
  process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === "true";

const lockedResponse = {
  ok: false,
  status: "LOCKED",
  message: "Nhập chính thức chưa được bật trong môi trường này.",
  canRunOfficialImport: false,
};

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

function jsonError(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

function parseConfirmation(value: unknown): OfficialImportConfirmation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const body = value as Record<string, unknown>;

  return {
    confirmMarker: body.confirmMarker,
    confirmSessionId: body.confirmSessionId,
    confirmNoValidationErrors: body.confirmNoValidationErrors,
    confirmNoDryRunBlockers: body.confirmNoDryRunBlockers,
    confirmDuplicateDecisionsComplete: body.confirmDuplicateDecisionsComplete,
    confirmA16TApplyVerified: body.confirmA16TApplyVerified,
    confirmA16ULockedBranchReady: body.confirmA16ULockedBranchReady,
    confirmA16VApplyVerified: body.confirmA16VApplyVerified,
    confirmA16VRealTransactionBranchReady:
      body.confirmA16VRealTransactionBranchReady,
    confirmRuntimeExecutionEnablementMarker:
      body.confirmRuntimeExecutionEnablementMarker,
    confirmProductionUiVisible: body.confirmProductionUiVisible,
    confirmProductionDeployReady: body.confirmProductionDeployReady,
    confirmRollbackReviewed: body.confirmRollbackReviewed,
    confirmAuditReviewed: body.confirmAuditReviewed,
  };
}

function missingConfirmationReasons(
  sessionId: string,
  confirmation: OfficialImportConfirmation,
) {
  const reasons: string[] = [];

  if (confirmation.confirmMarker !== A16U_REQUIRED_A16R_RETRY_MARKER) {
    reasons.push("Thiếu hoặc sai confirmMarker.");
  }
  if (confirmation.confirmSessionId !== sessionId) {
    reasons.push("confirmSessionId không khớp phiên nhập.");
  }
  if (confirmation.confirmNoValidationErrors !== true) {
    reasons.push("Chưa xác nhận không còn lỗi validation.");
  }
  if (confirmation.confirmNoDryRunBlockers !== true) {
    reasons.push("ChÆ°a xÃ¡c nháº­n dry-run blockers báº±ng 0.");
  }
  if (confirmation.confirmDuplicateDecisionsComplete !== true) {
    reasons.push("ChÆ°a xÃ¡c nháº­n duplicate unresolved/needs_review báº±ng 0.");
  }
  if (confirmation.confirmA16TApplyVerified !== true) {
    reasons.push("ChÆ°a xÃ¡c nháº­n A-16T apply/verify PASS.");
  }
  if (confirmation.confirmA16ULockedBranchReady !== true) {
    reasons.push("ChÆ°a xÃ¡c nháº­n A-16U locked branch ready.");
  }
  if (confirmation.confirmA16VApplyVerified !== true) {
    reasons.push("Chưa xác nhận A-16V apply/verify PASS.");
  }
  if (confirmation.confirmA16VRealTransactionBranchReady !== true) {
    reasons.push("Chưa xác nhận A-16V real transaction branch ready.");
  }
  if (
    confirmation.confirmRuntimeExecutionEnablementMarker !==
    A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER
  ) {
    reasons.push(
      "Thiếu marker APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY để xét bật runtime execution sau A-16V.",
    );
  }
  if (confirmation.confirmProductionUiVisible !== true) {
    reasons.push("ChÆ°a xÃ¡c nháº­n production UI nháº­p Excel Ä‘Ã£ hiá»ƒn thá»‹.");
  }
  if (confirmation.confirmProductionDeployReady !== true) {
    reasons.push("Chưa xác nhận production đã deploy bản A-16V.");
  }
  if (confirmation.confirmRollbackReviewed !== true) {
    reasons.push("Chưa xác nhận đã rà soát rollback.");
  }
  if (confirmation.confirmAuditReviewed !== true) {
    reasons.push("Chưa xác nhận đã rà soát audit.");
  }

  return reasons;
}

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const permissionContext = await getPermissionContext();

  if (!permissionContext.user) {
    return jsonError(401, {
      ok: false,
      status: "UNAUTHENTICATED",
      message: "Bạn cần đăng nhập để yêu cầu ứng viên nhập chính thức.",
      canRunOfficialImport: false,
    });
  }

  const hasStrictPermission =
    permissionContext.permissions.includes("imports.create") &&
    permissionContext.permissions.includes("people.create") &&
    permissionContext.permissions.includes("relationships.create") &&
    permissionContext.permissions.includes("permissions.manage");

  if (!hasStrictPermission) {
    return jsonError(403, {
      ok: false,
      status: "FORBIDDEN",
      message:
        "Bạn chưa có đủ quyền để yêu cầu ứng viên nhập chính thức Gia Phả 4.",
      canRunOfficialImport: false,
    });
  }

  if (!A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED) {
    return jsonError(423, lockedResponse);
  }

  let rawBody: unknown = {};
  try {
    rawBody = await request.json();
  } catch {
    rawBody = {};
  }

  const confirmation = parseConfirmation(rawBody);
  const confirmationReasons = missingConfirmationReasons(sessionId, confirmation);

  if (confirmationReasons.length > 0) {
    return jsonError(422, {
      ok: false,
      status: "PRECONDITION_FAILED",
      message:
        "Chưa đủ xác nhận để xét ứng viên nhập chính thức. Chưa chạy nhập chính thức.",
      blockedReasons: confirmationReasons,
      canRunOfficialImport: false,
    });
  }

  const result = await getOfficialImportRuntimeCandidate({
    sessionId,
    confirmation,
    actor: permissionContext,
    executionBranchEnabled: A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED,
  });

  return jsonError(result.status === "BLOCKED" ? 409 : 200, result);
}

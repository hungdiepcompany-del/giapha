import { NextResponse } from "next/server";

import {
  A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER,
  buildA16ROfficialImportSessionMarker,
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
  message: "Nhap chinh thuc chua duoc bat trong moi truong nay.",
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

  if (confirmation.confirmMarker !== buildA16ROfficialImportSessionMarker(sessionId)) {
    reasons.push("confirmMarker khong khop marker nhap chinh thuc cua session hien tai.");
  }
  if (confirmation.confirmSessionId !== sessionId) {
    reasons.push("confirmSessionId khong khop phien nhap.");
  }
  if (confirmation.confirmNoValidationErrors !== true) {
    reasons.push("Chua xac nhan validation errors bang 0.");
  }
  if (confirmation.confirmNoDryRunBlockers !== true) {
    reasons.push("Chua xac nhan dry-run blockers bang 0.");
  }
  if (confirmation.confirmDuplicateDecisionsComplete !== true) {
    reasons.push("Chua xac nhan duplicate unresolved/needs_review bang 0.");
  }
  if (confirmation.confirmA16TApplyVerified !== true) {
    reasons.push("Chua xac nhan A-16T apply/verify PASS.");
  }
  if (confirmation.confirmA16ULockedBranchReady !== true) {
    reasons.push("Chua xac nhan A-16U locked branch ready.");
  }
  if (confirmation.confirmA16VApplyVerified !== true) {
    reasons.push("Chua xac nhan A-16V apply/verify PASS.");
  }
  if (confirmation.confirmA16VRealTransactionBranchReady !== true) {
    reasons.push("Chua xac nhan A-16V real transaction branch ready.");
  }
  if (
    confirmation.confirmRuntimeExecutionEnablementMarker !==
    A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER
  ) {
    reasons.push(
      "Thieu marker APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY.",
    );
  }
  if (confirmation.confirmProductionUiVisible !== true) {
    reasons.push("Chua xac nhan production UI nhap Excel da hien thi.");
  }
  if (confirmation.confirmProductionDeployReady !== true) {
    reasons.push("Chua xac nhan production da deploy ban A-16V.");
  }
  if (confirmation.confirmRollbackReviewed !== true) {
    reasons.push("Chua xac nhan rollback da duoc review.");
  }
  if (confirmation.confirmAuditReviewed !== true) {
    reasons.push("Chua xac nhan audit da duoc review.");
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
      message: "Can dang nhap de yeu cau ung vien nhap chinh thuc.",
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
        "Thieu quyen strict de yeu cau ung vien nhap chinh thuc Gia Pha 4.",
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
        "Chua du xac nhan de xet ung vien nhap chinh thuc. Chua chay official import.",
      blockedReasons: confirmationReasons,
      canRunOfficialImport: false,
    });
  }

  if (!A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED) {
    return jsonError(423, {
      ok: false,
      status: "LOCKED",
      message: "Nhap chinh thuc chua mo execution branch trong runtime.",
      blockedReasons: ["A16AR_LOCKED_EXECUTION_BRANCH_ENV_DISABLED"],
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

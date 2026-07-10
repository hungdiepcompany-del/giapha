import { NextResponse } from "next/server";

import {
  transitionImportSessionOwnerApprovalState,
  type A16BCOwnerApprovalConfirmation,
} from "@/lib/import/giapha4/import-session-owner-approval-state-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

function parseConfirmation(value: unknown): A16BCOwnerApprovalConfirmation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const body = value as Record<string, unknown>;

  return {
    action: body.action,
    confirmSessionId: body.confirmSessionId,
    confirmMarker: body.confirmMarker,
    confirmNoValidationErrors: body.confirmNoValidationErrors,
    confirmNoDryRunBlockers: body.confirmNoDryRunBlockers,
    confirmDuplicateDecisionsComplete: body.confirmDuplicateDecisionsComplete,
    confirmRelationshipAmbiguityClear: body.confirmRelationshipAmbiguityClear,
    confirmReviewPackReady: body.confirmReviewPackReady,
    confirmNoOfficialImportExecution: body.confirmNoOfficialImportExecution,
    confirmRollbackReviewed: body.confirmRollbackReviewed,
    confirmAuditReviewed: body.confirmAuditReviewed,
  };
}

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;

  let rawBody: unknown = {};
  try {
    rawBody = await request.json();
  } catch {
    rawBody = {};
  }

  const result = await transitionImportSessionOwnerApprovalState({
    sessionId,
    confirmation: parseConfirmation(rawBody),
  });

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

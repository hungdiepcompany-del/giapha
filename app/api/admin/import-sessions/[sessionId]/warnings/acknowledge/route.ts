import { NextResponse } from "next/server";

import {
  acknowledgeImportWarningGroup,
  type WarningGroupAcknowledgementConfirmation,
} from "@/lib/import/giapha4/warning-review-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

function parseConfirmation(value: unknown): WarningGroupAcknowledgementConfirmation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const body = value as Record<string, unknown>;

  return {
    confirmSessionId: body.confirmSessionId,
    confirmManifestId: body.confirmManifestId,
    confirmStagingVersion: body.confirmStagingVersion,
    confirmWarningGroup: body.confirmWarningGroup,
    confirmPolicyApplied: body.confirmPolicyApplied,
    confirmNoOfficialImportExecution: body.confirmNoOfficialImportExecution,
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

  const result = await acknowledgeImportWarningGroup({
    sessionId,
    confirmation: parseConfirmation(rawBody),
  });

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

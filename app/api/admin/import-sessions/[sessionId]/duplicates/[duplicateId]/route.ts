import { NextResponse } from "next/server";

import { updateDuplicateOwnerDecision } from "@/lib/import/giapha4/duplicate-decision-review-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
    duplicateId: string;
  }>;
};

function jsonError(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId, duplicateId } = await context.params;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const result = await updateDuplicateOwnerDecision({
    sessionId,
    duplicateId,
    ownerDecision: payload.ownerDecision,
    decisionNote: payload.decisionNote,
  });

  return jsonError(result.httpStatus, result);
}

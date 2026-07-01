import { NextResponse } from "next/server";

import { getDuplicateDecisionReview } from "@/lib/import/giapha4/duplicate-decision-review-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const result = await getDuplicateDecisionReview(sessionId);

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

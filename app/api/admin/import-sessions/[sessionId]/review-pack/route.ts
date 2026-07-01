import { NextResponse } from "next/server";

import { getImportReviewPack } from "@/lib/import/giapha4/import-review-pack-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const result = await getImportReviewPack(sessionId);

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

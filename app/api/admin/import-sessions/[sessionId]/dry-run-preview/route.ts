import { NextResponse } from "next/server";

import { getDryRunMappingPreview } from "@/lib/import/giapha4/dry-run-mapping-preview-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const result = await getDryRunMappingPreview(sessionId);

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

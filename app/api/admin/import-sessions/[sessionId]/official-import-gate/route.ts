import { NextResponse } from "next/server";

import { getOfficialImportPreflightGate } from "@/lib/import/giapha4/official-import-preflight-gate";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const result = await getOfficialImportPreflightGate(sessionId);

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

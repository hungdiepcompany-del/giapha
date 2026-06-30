import { NextResponse } from "next/server";

import { getImportSession } from "@/lib/import/giapha4/manifest-read-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const result = await getImportSession(sessionId);

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

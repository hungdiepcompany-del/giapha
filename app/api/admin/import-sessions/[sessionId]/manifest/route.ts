import { NextResponse } from "next/server";

import { getImportManifest } from "@/lib/import/giapha4/manifest-read-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const result = await getImportManifest(sessionId);

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

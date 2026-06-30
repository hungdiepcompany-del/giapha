import { NextResponse } from "next/server";

import { validateImportManifestStaging } from "@/lib/import/giapha4/manifest-validation-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const result = await validateImportManifestStaging(sessionId);

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

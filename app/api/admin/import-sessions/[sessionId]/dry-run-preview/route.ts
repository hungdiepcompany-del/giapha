import { NextResponse } from "next/server";

import { getDryRunMappingPreview } from "@/lib/import/giapha4/dry-run-mapping-preview-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const auditExport = new URL(request.url).searchParams.get("auditExport");
  const result = await getDryRunMappingPreview(
    sessionId,
    auditExport === "relationships-full"
      ? { auditExport: "relationships-full" }
      : undefined,
  );

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

import { NextResponse } from "next/server";

import { getImportDryRunApprovalGate } from "@/lib/import/giapha4/import-dry-run-approval-gate";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;

  return NextResponse.json({
    sessionId,
    ...getImportDryRunApprovalGate(sessionId),
  });
}

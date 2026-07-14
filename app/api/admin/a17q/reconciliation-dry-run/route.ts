import { NextResponse } from "next/server";

import { executeA17QAuthenticatedProductionDryRun } from "@/lib/reconciliation/a17q-authenticated-dry-run";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await executeA17QAuthenticatedProductionDryRun();
  const status = result.status === "BLOCKED" ? 403 : 200;

  return NextResponse.json(result, { status });
}

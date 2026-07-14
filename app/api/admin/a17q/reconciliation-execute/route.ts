import { NextResponse } from "next/server";

import {
  executeA17QAuthenticatedSingleExecution,
  type A17QAuthenticatedExecutionRequest,
} from "@/lib/reconciliation/a17q-authenticated-execution";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as
    | A17QAuthenticatedExecutionRequest
    | null;
  const result = await executeA17QAuthenticatedSingleExecution(body ?? {});
  const status =
    result.status === "BLOCKED"
      ? 403
      : result.status === "CONFIRMATION_REQUIRED"
        ? 400
        : 200;

  return NextResponse.json(result, { status });
}

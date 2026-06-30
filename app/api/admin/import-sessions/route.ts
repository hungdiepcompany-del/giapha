import { NextResponse } from "next/server";

import { listImportSessions } from "@/lib/import/giapha4/manifest-read-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await listImportSessions();

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

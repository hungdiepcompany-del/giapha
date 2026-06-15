import { NextResponse } from "next/server";

import { buildFullBackupZip } from "@/lib/family/zip-backup-exporter";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status = 403) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status },
  );
}

export async function GET() {
  const result = await buildFullBackupZip({ action: "download" });

  if (!result.ok) {
    return errorResponse(result.error, result.reason === "missing_admin_config" ? 500 : 403);
  }

  return new NextResponse(new Uint8Array(result.data.content), {
    headers: {
      "Content-Type": result.data.mime_type,
      "Content-Disposition": `attachment; filename="${result.data.file_name}"`,
      "X-Content-Type-Options": "nosniff",
      "X-Checksum-SHA256": result.data.checksum,
    },
  });
}

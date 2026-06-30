import { NextResponse } from "next/server";

import { uploadGiaPha4ManifestStaging } from "@/lib/import/giapha4/manifest-upload-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await uploadGiaPha4ManifestStaging(formData);

  return NextResponse.json(result, {
    status: result.httpStatus,
  });
}

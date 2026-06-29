import { NextResponse } from "next/server";

import { previewGiaPha4ExcelImport } from "@/lib/import/giapha4/preview";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await previewGiaPha4ExcelImport(formData);

  return NextResponse.json(result.data, {
    status: result.status,
  });
}

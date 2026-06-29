import { getPermissionContext } from "@/lib/permissions/permission-service";
import {
  GIAPHA4_PREVIEW_MAX_BYTES,
  type GiaPha4PreviewResult,
} from "@/lib/import/giapha4/types";
import { createGiaPha4MissingParserPreview, parseGiaPha4ExcelPreview } from "./parser";

export type GiaPha4PreviewServiceResult =
  | {
      ok: true;
      status: 200;
      data: GiaPha4PreviewResult;
    }
  | {
      ok: false;
      status: 400 | 401 | 403 | 413;
      data: GiaPha4PreviewResult;
    };

function isFileLike(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    "name" in value
  );
}

function withError(
  status: GiaPha4PreviewServiceResult extends infer Result
    ? Result extends { ok: false; status: infer Status }
      ? Status
      : never
    : never,
  message: string,
): GiaPha4PreviewServiceResult {
  const preview = createGiaPha4MissingParserPreview({
    fileKind: "missing",
    fileSizeBytes: 0,
  });

  return {
    ok: false,
    status,
    data: {
      ...preview,
      status: "error",
      message,
      summary: {
        ...preview.summary,
        status: "error",
      },
      warnings: [
        ...preview.warnings,
        {
          severity: "error",
          code: "REQUEST_NOT_ACCEPTED",
          message,
        },
      ],
    },
  };
}

export async function previewGiaPha4ExcelImport(
  formData: FormData,
): Promise<GiaPha4PreviewServiceResult> {
  const context = await getPermissionContext();
  const configMissing =
    context.reason === "missing_supabase_config" ||
    context.reason === "missing_admin_config";

  if (!configMissing && !context.user) {
    return withError(401, "Bạn cần đăng nhập để xem trước dữ liệu Gia Phả 4.0.");
  }

  if (
    !configMissing &&
    context.user &&
    !context.permissions.includes("imports.create")
  ) {
    return withError(403, "Bạn chưa có quyền imports.create.");
  }

  const file = formData.get("giapha4_excel_file");

  if (!isFileLike(file) || file.size <= 0) {
    return withError(400, "Vui lòng chọn file Excel .xls hoặc .xlsx.");
  }

  if (file.size > GIAPHA4_PREVIEW_MAX_BYTES) {
    return withError(
      413,
      "File vượt quá giới hạn 5MB cho khung xem trước A-16B.",
    );
  }

  const preview = await parseGiaPha4ExcelPreview(file);

  return {
    ok: true,
    status: 200,
    data: preview,
  };
}

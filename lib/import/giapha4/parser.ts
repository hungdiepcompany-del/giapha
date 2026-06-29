import {
  A16B_GIAPHA4_PREVIEW_MARKER,
  A16B_PREVIEW_RUNTIME_STATUS,
  type GiaPha4PreviewResult,
  type GiaPha4PreviewWarning,
} from "@/lib/import/giapha4/types";

type GiaPha4FileMetadata = {
  fileKind: "xls" | "xlsx" | "unsupported" | "missing";
  fileSizeBytes: number;
};

function createWarning(message: string, code: string): GiaPha4PreviewWarning {
  return {
    severity: "warning",
    code,
    message,
  };
}

export function detectGiaPha4FileKind(fileName: string | null): GiaPha4FileMetadata["fileKind"] {
  if (!fileName) return "missing";

  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".xlsx")) return "xlsx";
  if (lowerName.endsWith(".xls")) return "xls";

  return "unsupported";
}

export function createGiaPha4MissingParserPreview(
  metadata: GiaPha4FileMetadata,
): GiaPha4PreviewResult {
  const warnings = [
    createWarning(
      "Chưa có thư viện đọc Excel trong dự án, nên A-16B chỉ tạo khung xem trước an toàn và chưa phân tích dòng dữ liệu.",
      "SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY",
    ),
    createWarning(
      "Không ghi database, không lưu file lâu dài và không in dữ liệu cá nhân trong log.",
      "PREVIEW_ONLY_NO_DB_WRITE",
    ),
  ];

  if (metadata.fileKind === "unsupported") {
    warnings.push(
      createWarning(
        "File chưa đúng định dạng .xls hoặc .xlsx.",
        "UNSUPPORTED_EXCEL_FILE_TYPE",
      ),
    );
  }

  return {
    marker: A16B_GIAPHA4_PREVIEW_MARKER,
    status: "safe_skip_missing_excel_parser_dependency",
    runtime_status: A16B_PREVIEW_RUNTIME_STATUS,
    preview_only: true,
    db_write: false,
    printed_pii: false,
    stored_file: false,
    parser_dependency_available: false,
    message:
      "Chưa thể đọc file Excel vì dự án chưa có thư viện parser được owner phê duyệt.",
    summary: {
      status: "safe_skip_missing_excel_parser_dependency",
      file_kind: metadata.fileKind,
      file_size_bytes: metadata.fileSizeBytes,
      rows_read: 0,
      persons_count: 0,
      relationships_count: 0,
      warnings_count: warnings.length,
      duplicate_candidates_count: 0,
      unmapped_columns_count: 0,
      db_write: false,
      can_import_real_data: false,
    },
    personsPreview: [],
    relationshipsPreview: [],
    warnings,
    duplicateCandidates: [],
    unmappedColumns: [],
    disabledImportMessage:
      "Nhập dữ liệu thật sẽ được mở ở phase sau sau khi owner phê duyệt.",
  };
}

export async function parseGiaPha4ExcelPreview(file: File | null): Promise<GiaPha4PreviewResult> {
  const metadata: GiaPha4FileMetadata = {
    fileKind: detectGiaPha4FileKind(file?.name ?? null),
    fileSizeBytes: file?.size ?? 0,
  };

  return createGiaPha4MissingParserPreview(metadata);
}

export const A16B_GIAPHA4_PREVIEW_MARKER =
  "A16B_GIAPHA4_EXCEL_IMPORT_PREVIEW_RUNTIME_UI";

export const A16B_PREVIEW_RUNTIME_STATUS =
  "SAFE_SKIP_MISSING_EXCEL_PARSER_DEPENDENCY";

export const GIAPHA4_PREVIEW_MAX_BYTES = 5 * 1024 * 1024;

export type GiaPha4PreviewStatus =
  | "ready"
  | "safe_skip_missing_excel_parser_dependency"
  | "error";

export type GiaPha4PreviewWarningSeverity = "info" | "warning" | "error";

export type GiaPha4PreviewWarning = {
  severity: GiaPha4PreviewWarningSeverity;
  code: string;
  message: string;
  source_row?: number;
  column?: string;
};

export type GiaPha4PersonPreview = {
  source_row: number;
  full_name: string;
  display_name?: string;
  gender: "male" | "female" | "other" | "unknown";
  birth_date?: string;
  death_date?: string;
  is_living?: boolean;
  birth_place?: string;
  home_town?: string;
  branch_name?: string;
  generation_number?: number;
  notes_private?: string;
  visibility: "family";
};

export type GiaPha4RelationshipPreview = {
  source_row: number;
  relation_type: "father" | "mother" | "spouse" | "child" | "unknown";
  from_person_key: string;
  to_person_key: string;
  confidence: "strong" | "medium" | "weak" | "ambiguous";
  review_required: boolean;
};

export type GiaPha4DuplicateCandidate = {
  source_rows: number[];
  confidence: "strong" | "medium" | "weak";
  reason: string;
};

export type GiaPha4PreviewSummary = {
  status: GiaPha4PreviewStatus;
  file_kind: "xls" | "xlsx" | "unsupported" | "missing";
  file_size_bytes: number;
  rows_read: number;
  persons_count: number;
  relationships_count: number;
  warnings_count: number;
  duplicate_candidates_count: number;
  unmapped_columns_count: number;
  db_write: false;
  can_import_real_data: false;
};

export type GiaPha4PreviewResult = {
  marker: typeof A16B_GIAPHA4_PREVIEW_MARKER;
  status: GiaPha4PreviewStatus;
  runtime_status: typeof A16B_PREVIEW_RUNTIME_STATUS;
  preview_only: true;
  db_write: false;
  printed_pii: false;
  stored_file: false;
  parser_dependency_available: false;
  message: string;
  summary: GiaPha4PreviewSummary;
  personsPreview: GiaPha4PersonPreview[];
  relationshipsPreview: GiaPha4RelationshipPreview[];
  warnings: GiaPha4PreviewWarning[];
  duplicateCandidates: GiaPha4DuplicateCandidate[];
  unmappedColumns: string[];
  disabledImportMessage: string;
};

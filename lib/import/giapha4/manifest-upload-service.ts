import "server-only";

import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";
import {
  A16I_GIAPHA4_STAGING_PARSER_MARKER,
  A16I_MAPPING_VERSION,
  A16I_PARSER_VERSION,
  GIAPHA4_STAGING_MAX_BYTES,
  parseGiaPha4XlsxForStaging,
  type GiaPha4ParseSummary,
  type GiaPha4StagedDuplicateCandidate,
  type GiaPha4StagedPersonCandidate,
  type GiaPha4StagedRelationshipCandidate,
  type GiaPha4StagingWarning,
} from "@/lib/import/giapha4/xlsx-staging-parser";

export const A16I_UPLOAD_PARSE_MANIFEST_STAGING_MARKER =
  "A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING";

export type GiaPha4ManifestUploadSummary = {
  sessionId: string | null;
  status: "completed" | "failed";
  sourceFileHash: string | null;
  previewManifestHash: string | null;
  rowCount: number;
  personCandidateCount: number;
  relationshipCandidateCount: number;
  duplicateCandidateCount: number;
  warningCount: number;
  unmappedColumnCount: number;
  heldRowCount: number;
  fileFormat: "xlsx" | "xls_unsupported" | "unsupported" | "missing";
  parseSummary: GiaPha4ParseSummary | null;
};

export type GiaPha4ManifestUploadResult = {
  ok: boolean;
  httpStatus: 200 | 400 | 401 | 403 | 413 | 503;
  marker: typeof A16I_UPLOAD_PARSE_MANIFEST_STAGING_MARKER;
  parserMarker: typeof A16I_GIAPHA4_STAGING_PARSER_MARKER;
  stagingOnly: true;
  canImport: false;
  dbWrite: false;
  peopleWrite: false;
  relationshipWrite: false;
  treeLayoutWrite: false;
  revisionWrite: false;
  message: string;
  summary: GiaPha4ManifestUploadSummary;
  warnings: Array<{
    warningCode: string;
    severity: string;
    rowIndex: number | null;
    columnKey: string | null;
    messageVi: string;
  }>;
};

type ImportSessionInsert = {
  source_type: "giapha4_excel";
  source_file_name: string | null;
  source_file_size_bytes: number;
  source_file_hash: string | null;
  preview_manifest_hash: string | null;
  mapping_version: string;
  parser_version: string;
  status: "preview_generated" | "rejected_needs_fix";
  row_count: number;
  person_candidate_count: number;
  relationship_candidate_count: number;
  warning_count: number;
  duplicate_candidate_count: number;
  unmapped_column_count: number;
  held_row_count: number;
  review_summary: Record<string, unknown>;
  privacy_summary: Record<string, unknown>;
  created_by: string | null;
  updated_by: string | null;
};

type ImportSessionRow = {
  id: string;
};

function emptySummary(
  status: GiaPha4ManifestUploadSummary["status"] = "failed",
): GiaPha4ManifestUploadSummary {
  return {
    sessionId: null,
    status,
    sourceFileHash: null,
    previewManifestHash: null,
    rowCount: 0,
    personCandidateCount: 0,
    relationshipCandidateCount: 0,
    duplicateCandidateCount: 0,
    warningCount: 0,
    unmappedColumnCount: 0,
    heldRowCount: 0,
    fileFormat: "missing",
    parseSummary: null,
  };
}

function result(
  overrides: Partial<GiaPha4ManifestUploadResult>,
): GiaPha4ManifestUploadResult {
  return {
    ok: false,
    httpStatus: 503,
    marker: A16I_UPLOAD_PARSE_MANIFEST_STAGING_MARKER,
    parserMarker: A16I_GIAPHA4_STAGING_PARSER_MARKER,
    stagingOnly: true,
    canImport: false,
    dbWrite: false,
    peopleWrite: false,
    relationshipWrite: false,
    treeLayoutWrite: false,
    revisionWrite: false,
    message: "Không đọc được file Gia Phả 4.",
    summary: emptySummary(),
    warnings: [],
    ...overrides,
  };
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    "name" in value &&
    "arrayBuffer" in value
  );
}

function normalizeWarnings(warnings: GiaPha4StagingWarning[]) {
  return warnings.map((warning) => ({
    warningCode: warning.warningCode,
    severity: warning.severity,
    rowIndex: warning.rowIndex,
    columnKey: warning.columnKey,
    messageVi: warning.messageVi,
  }));
}

function toWarningRows(sessionId: string, warnings: GiaPha4StagingWarning[]) {
  return warnings.map((warning) => ({
    import_session_id: sessionId,
    warning_code: warning.warningCode,
    severity: warning.severity,
    row_index: warning.rowIndex,
    column_key: warning.columnKey,
    message_vi: warning.messageVi,
    review_status: "open",
  }));
}

function toRelationshipRows(
  sessionId: string,
  relationships: GiaPha4StagedRelationshipCandidate[],
) {
  return relationships.map((candidate) => ({
    import_session_id: sessionId,
    relationship_type: candidate.relationshipType,
    source_row_index: candidate.sourceRowIndex,
    source_person_fingerprint: candidate.sourcePersonFingerprint,
    related_row_index: candidate.relatedRowIndex,
    related_person_fingerprint: candidate.relatedPersonFingerprint,
    target_existing_person_id: null,
    relationship_label_vi: candidate.relationshipLabelVi,
    confidence: candidate.confidence,
    ambiguity_status: candidate.ambiguityStatus,
    owner_decision: "unresolved",
  }));
}

function toDuplicateRows(
  sessionId: string,
  duplicates: GiaPha4StagedDuplicateCandidate[],
) {
  return duplicates.map((candidate) => ({
    import_session_id: sessionId,
    source_row_index: candidate.sourceRowIndex,
    source_person_fingerprint: candidate.sourcePersonFingerprint,
    existing_person_id: null,
    match_strength: candidate.matchStrength,
    match_reason_codes: candidate.matchReasonCodes,
    owner_decision: "unresolved",
  }));
}

function buildDraftWriteManifest(input: {
  sessionId: string;
  manifestHash: string;
  personCandidates: GiaPha4StagedPersonCandidate[];
  relationshipCandidates: GiaPha4StagedRelationshipCandidate[];
  heldRowCount: number;
  createdBy: string | null;
}) {
  return {
    import_session_id: input.sessionId,
    manifest_hash: input.manifestHash,
    approval_marker: `A16I_STAGING_ONLY_NOT_APPROVED:${input.manifestHash.slice(
      0,
      16,
    )}`,
    status: "draft",
    approved_scope: {
      stage: "A-16I",
      mapping_stage: "A-16I3",
      staging_only: true,
      real_import_enabled: false,
      official_import_cta: "disabled",
      person_candidates: input.personCandidates,
      mapping_summary: {
        sheet_detected: true,
        people_candidate_count: input.personCandidates.length,
        parent_relationship_candidate_count: input.relationshipCandidates.length,
      },
    },
    planned_counts: {
      people: input.personCandidates.length,
      relationships: input.relationshipCandidates.length,
      real_people_writes: 0,
      real_relationship_writes: 0,
      tree_layout_writes: 0,
      revision_writes: 0,
    },
    held_rows_summary: {
      held_row_count: input.heldRowCount,
      relationship_review_required: input.relationshipCandidates.filter(
        (candidate) => candidate.ambiguityStatus !== "clear",
      ).length,
    },
    rollback_plan: {
      real_records_created: false,
      message:
        "A-16I chỉ tạo manifest staging; không có bản ghi people/relationship/layout/revision thật để rollback.",
    },
    created_record_ids: {},
    created_by: input.createdBy,
  };
}

async function insertInitialSession(input: {
  supabase: Awaited<ReturnType<typeof maybeCreateServerSupabaseClient>>;
  file: File;
  sourceFileHash: string | null;
  profileId: string | null;
}) {
  if (!input.supabase) return { id: null, errorMessage: "missing_supabase" };

  const payload: ImportSessionInsert = {
    source_type: "giapha4_excel",
    source_file_name: input.file.name,
    source_file_size_bytes: input.file.size,
    source_file_hash: input.sourceFileHash,
    preview_manifest_hash: null,
    mapping_version: A16I_MAPPING_VERSION,
    parser_version: A16I_PARSER_VERSION,
    status: "preview_generated",
    row_count: 0,
    person_candidate_count: 0,
    relationship_candidate_count: 0,
    warning_count: 0,
    duplicate_candidate_count: 0,
    unmapped_column_count: 0,
    held_row_count: 0,
    review_summary: {
      stage: "A-16I",
      staging_only: true,
      created_before_parse: true,
    },
    privacy_summary: {
      raw_file_stored: false,
      docs_include_real_rows: false,
      official_import_open: false,
    },
    created_by: input.profileId,
    updated_by: input.profileId,
  };

  const { data, error } = await input.supabase
    .from("import_sessions")
    .insert(payload)
    .select("id")
    .single<ImportSessionRow>();

  return {
    id: data?.id ?? null,
    errorMessage: error?.message ?? null,
  };
}

export async function uploadGiaPha4ManifestStaging(
  formData: FormData,
): Promise<GiaPha4ManifestUploadResult> {
  const context = await getPermissionContext();
  const configMissing =
    context.reason === "missing_supabase_config" ||
    context.reason === "missing_admin_config";

  if (!configMissing && !context.user) {
    return result({
      httpStatus: 401,
      message: "Bạn cần đăng nhập để tải lên file Gia Phả 4.",
    });
  }

  if (
    !configMissing &&
    context.user &&
    !context.permissions.includes("imports.create")
  ) {
    return result({
      httpStatus: 403,
      message: "Bạn chưa có quyền imports.create để tạo manifest staging.",
    });
  }

  if (configMissing) {
    return result({
      httpStatus: 503,
      message:
        "Chưa cấu hình Supabase nên chưa thể tạo manifest staging từ file Gia Phả 4.",
    });
  }

  const supabase = await maybeCreateServerSupabaseClient();
  if (!supabase) {
    return result({
      httpStatus: 503,
      message:
        "Chưa cấu hình Supabase nên chưa thể tạo manifest staging từ file Gia Phả 4.",
    });
  }

  const file = formData.get("giapha4_manifest_file");
  if (!isFileLike(file) || file.size <= 0) {
    return result({
      httpStatus: 400,
      message: "Vui lòng chọn file Gia Phả 4 định dạng .xlsx.",
    });
  }

  if (file.size > GIAPHA4_STAGING_MAX_BYTES) {
    return result({
      httpStatus: 413,
      message: "File vượt quá giới hạn 5MB cho A-16I staging upload.",
    });
  }

  const parseResult = await parseGiaPha4XlsxForStaging(file);
  const sessionInsert = await insertInitialSession({
    supabase,
    file,
    sourceFileHash: parseResult.sourceFileHash,
    profileId: context.profile?.id ?? null,
  });

  if (!sessionInsert.id) {
    return result({
      httpStatus: 503,
      message:
        "Không tạo được import session staging. Bảng có thể đang được RLS bảo vệ hoặc bạn chưa có quyền ghi staging.",
      warnings: parseResult.ok ? normalizeWarnings(parseResult.warnings) : normalizeWarnings(parseResult.warnings),
      summary: {
        ...emptySummary(),
        sourceFileHash: parseResult.sourceFileHash,
        fileFormat: file.name.toLowerCase().endsWith(".xls")
          ? "xls_unsupported"
          : file.name.toLowerCase().endsWith(".xlsx")
            ? "xlsx"
            : "unsupported",
        parseSummary: null,
      },
    });
  }

  if (!parseResult.ok) {
    await supabase
      .from("import_sessions")
      .update({
        status: "rejected_needs_fix",
        source_file_hash: parseResult.sourceFileHash,
        warning_count: parseResult.warnings.length,
        review_summary: {
          stage: "A-16I",
          staging_only: true,
          parse_status: "failed",
          error_code: parseResult.errorCode,
        },
        updated_by: context.profile?.id ?? null,
      })
      .eq("id", sessionInsert.id);

    if (parseResult.warnings.length > 0) {
      await supabase
        .from("import_session_warnings")
        .insert(toWarningRows(sessionInsert.id, parseResult.warnings));
    }

    return result({
      httpStatus: 400,
      message: parseResult.messageVi,
      warnings: normalizeWarnings(parseResult.warnings),
      summary: {
        ...emptySummary(),
        sessionId: sessionInsert.id,
        sourceFileHash: parseResult.sourceFileHash,
        warningCount: parseResult.warnings.length,
        fileFormat: file.name.toLowerCase().endsWith(".xls")
          ? "xls_unsupported"
          : "unsupported",
        parseSummary: null,
      },
    });
  }

  const warningRows = toWarningRows(sessionInsert.id, parseResult.warnings);
  const relationshipRows = toRelationshipRows(
    sessionInsert.id,
    parseResult.relationshipCandidates,
  );
  const duplicateRows = toDuplicateRows(
    sessionInsert.id,
    parseResult.duplicateCandidates,
  );
  const writeManifest = buildDraftWriteManifest({
    sessionId: sessionInsert.id,
    manifestHash: parseResult.previewManifestHash,
    personCandidates: parseResult.personCandidates,
    relationshipCandidates: parseResult.relationshipCandidates,
    heldRowCount: parseResult.heldRowCount,
    createdBy: context.profile?.id ?? null,
  });

  const writeResults = await Promise.all([
    warningRows.length > 0
      ? supabase.from("import_session_warnings").insert(warningRows)
      : Promise.resolve({ error: null }),
    relationshipRows.length > 0
      ? supabase.from("import_relationship_candidates").insert(relationshipRows)
      : Promise.resolve({ error: null }),
    duplicateRows.length > 0
      ? supabase.from("import_duplicate_candidates").insert(duplicateRows)
      : Promise.resolve({ error: null }),
    supabase.from("import_write_manifests").insert(writeManifest),
  ]);
  const firstWriteError = writeResults.find((item) => item.error)?.error;

  if (firstWriteError) {
    await supabase
      .from("import_sessions")
      .update({
        status: "rejected_needs_fix",
        warning_count: parseResult.warnings.length + 1,
        review_summary: {
          stage: "A-16I",
          staging_only: true,
          parse_status: "parsed_but_manifest_write_failed",
        },
        updated_by: context.profile?.id ?? null,
      })
      .eq("id", sessionInsert.id);

    return result({
      httpStatus: 503,
      message:
        "Đã đọc file nhưng chưa ghi đủ manifest staging. Không có dữ liệu nào được nhập vào cây gia phả thật.",
      warnings: [
        ...normalizeWarnings(parseResult.warnings),
        {
          warningCode: "A16I_MANIFEST_STAGING_WRITE_FAILED",
          severity: "blocker",
          rowIndex: null,
          columnKey: null,
          messageVi:
            "Ghi manifest staging thất bại, có thể do RLS hoặc quyền ghi staging chưa mở.",
        },
      ],
      summary: {
        ...emptySummary(),
        sessionId: sessionInsert.id,
        sourceFileHash: parseResult.sourceFileHash,
        previewManifestHash: parseResult.previewManifestHash,
        fileFormat: "xlsx",
      },
    });
  }

  const updateResult = await supabase
    .from("import_sessions")
    .update({
      preview_manifest_hash: parseResult.previewManifestHash,
      status: "preview_generated",
      row_count: parseResult.rowCount,
      person_candidate_count: parseResult.personCandidates.length,
      relationship_candidate_count: parseResult.relationshipCandidates.length,
      warning_count: parseResult.warnings.length,
      duplicate_candidate_count: parseResult.duplicateCandidates.length,
      unmapped_column_count: parseResult.unmappedColumns.length,
      held_row_count: parseResult.heldRowCount,
      review_summary: {
        stage: "A-16I",
        mapping_stage: "A-16I3",
        staging_only: true,
        parse_status: "completed",
        sheet_name: parseResult.sheetName,
        header_row_index: parseResult.headerRowIndex,
        parse_summary: parseResult.parseSummary,
        person_candidates_in_write_manifest: true,
        official_import_open: false,
      },
      privacy_summary: {
        raw_file_stored: false,
        raw_source_rows_stored: false,
        normalized_candidates_stored_for_owner_review: true,
        official_import_open: false,
      },
      updated_by: context.profile?.id ?? null,
    })
    .eq("id", sessionInsert.id);

  if (updateResult.error) {
    return result({
      httpStatus: 503,
      message:
        "Đã ghi manifest staging nhưng chưa cập nhật được summary phiên nhập.",
      warnings: normalizeWarnings(parseResult.warnings),
      summary: {
        ...emptySummary(),
        sessionId: sessionInsert.id,
        sourceFileHash: parseResult.sourceFileHash,
        previewManifestHash: parseResult.previewManifestHash,
        fileFormat: "xlsx",
        parseSummary: parseResult.parseSummary,
      },
    });
  }

  return result({
    ok: true,
    httpStatus: 200,
    message:
      "Đã tạo manifest staging. Dữ liệu chỉ nằm trong vùng staging, chưa nhập vào cây gia phả thật.",
    warnings: normalizeWarnings(parseResult.warnings),
    summary: {
      sessionId: sessionInsert.id,
      status: "completed",
      sourceFileHash: parseResult.sourceFileHash,
      previewManifestHash: parseResult.previewManifestHash,
      rowCount: parseResult.rowCount,
      personCandidateCount: parseResult.personCandidates.length,
      relationshipCandidateCount: parseResult.relationshipCandidates.length,
      duplicateCandidateCount: parseResult.duplicateCandidates.length,
      warningCount: parseResult.warnings.length,
      unmappedColumnCount: parseResult.unmappedColumns.length,
      heldRowCount: parseResult.heldRowCount,
      fileFormat: "xlsx",
      parseSummary: parseResult.parseSummary,
    },
  });
}

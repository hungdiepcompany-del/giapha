import "server-only";

import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

export const A16G_IMPORT_MANIFEST_READ_MARKER =
  "A16G_IMPORT_SESSION_READ_MANIFEST_RUNTIME";

export type ImportManifestReadStatus =
  | "ready"
  | "empty"
  | "not_found"
  | "unauthenticated"
  | "forbidden"
  | "unavailable";

export type ImportSessionSummary = {
  id: string;
  sourceType: string;
  sourceFileName: string | null;
  sourceFileSizeBytes: number | null;
  sourceFileHash: string | null;
  previewManifestHash: string | null;
  mappingVersion: string;
  parserVersion: string | null;
  status: string;
  clanId: string | null;
  branchId: string | null;
  rowCount: number;
  personCandidateCount: number;
  relationshipCandidateCount: number;
  warningCount: number;
  duplicateCandidateCount: number;
  unmappedColumnCount: number;
  heldRowCount: number;
  approvalMarker: string | null;
  reviewSummary: Record<string, unknown>;
  privacySummary: Record<string, unknown>;
  retentionUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ImportSessionWarningPreview = {
  id: string;
  warningCode: string;
  severity: string;
  rowIndex: number | null;
  columnKey: string | null;
  messageVi: string;
  reviewStatus: string;
  createdAt: string;
};

export type ImportDuplicateCandidatePreview = {
  id: string;
  sourceRowIndex: number;
  sourcePersonFingerprint: string;
  existingPersonId: string | null;
  matchStrength: string;
  matchReasonCodes: string[];
  ownerDecision: string;
  decisionNote: string | null;
  createdAt: string;
};

export type ImportRelationshipCandidatePreview = {
  id: string;
  relationshipType: string;
  sourceRowIndex: number;
  sourcePersonFingerprint: string;
  relatedRowIndex: number | null;
  relatedPersonFingerprint: string | null;
  targetExistingPersonId: string | null;
  relationshipLabelVi: string;
  confidence: string;
  ambiguityStatus: string;
  ownerDecision: string;
  decisionNote: string | null;
  createdAt: string;
};

export type ImportWriteManifestPreview = {
  id: string;
  manifestHash: string;
  approvalMarker: string;
  status: string;
  approvedScope: Record<string, unknown>;
  plannedCounts: Record<string, unknown>;
  heldRowsSummary: Record<string, unknown>;
  rollbackPlan: Record<string, unknown>;
  createdRecordIds: Record<string, unknown>;
  createdAt: string;
};

export type ImportPersonCandidatePreview = {
  sourceRowIndex: number;
  fingerprint: string;
  externalId: string | null;
  fullName: string;
  displayName: string | null;
  alternateName: string | null;
  gender: string;
  birthDateText: string | null;
  deathDateText: string | null;
  memorialLunarDate: string | null;
  ageAtDeath: number | null;
  isLiving: boolean | null;
  birthPlace: string | null;
  homeTown: string | null;
  branchName: string | null;
  generationNumber: number | null;
  shortBio: string | null;
  notesPrivate: string | null;
  visibility: string;
  rawMetadata: Record<string, unknown>;
};

export type ImportManifestSummary = {
  warningCount: number;
  duplicateCandidateCount: number;
  relationshipCandidateCount: number;
  writeManifestCount: number;
  canImport: false;
  message: string;
};

export type ImportManifestReadResult = {
  ok: boolean;
  status: ImportManifestReadStatus;
  httpStatus: 200 | 401 | 403 | 404 | 503;
  marker: typeof A16G_IMPORT_MANIFEST_READ_MARKER;
  previewOnly: true;
  canImport: false;
  dbWrite: false;
  peopleWrite: false;
  relationshipWrite: false;
  message: string;
  sessions: ImportSessionSummary[];
  session: ImportSessionSummary | null;
  manifestSummary: ImportManifestSummary;
  warnings: ImportSessionWarningPreview[];
  peoplePreview: ImportPersonCandidatePreview[];
  duplicateCandidates: ImportDuplicateCandidatePreview[];
  relationshipsPreview: ImportRelationshipCandidatePreview[];
  writeManifests: ImportWriteManifestPreview[];
};

type ImportSessionRow = {
  id: string;
  source_type: string;
  source_file_name: string | null;
  source_file_size_bytes: number | null;
  source_file_hash: string | null;
  preview_manifest_hash: string | null;
  mapping_version: string;
  parser_version: string | null;
  status: string;
  clan_id: string | null;
  branch_id: string | null;
  row_count: number;
  person_candidate_count: number;
  relationship_candidate_count: number;
  warning_count: number;
  duplicate_candidate_count: number;
  unmapped_column_count: number;
  held_row_count: number;
  approval_marker: string | null;
  review_summary: Record<string, unknown> | null;
  privacy_summary: Record<string, unknown> | null;
  retention_until: string | null;
  created_at: string;
  updated_at: string;
};

type ImportSessionWarningRow = {
  id: string;
  warning_code: string;
  severity: string;
  row_index: number | null;
  column_key: string | null;
  message_vi: string;
  review_status: string;
  created_at: string;
};

type ImportDuplicateCandidateRow = {
  id: string;
  source_row_index: number;
  source_person_fingerprint: string;
  existing_person_id: string | null;
  match_strength: string;
  match_reason_codes: string[] | null;
  owner_decision: string;
  decision_note: string | null;
  created_at: string;
};

type ImportRelationshipCandidateRow = {
  id: string;
  relationship_type: string;
  source_row_index: number;
  source_person_fingerprint: string;
  related_row_index: number | null;
  related_person_fingerprint: string | null;
  target_existing_person_id: string | null;
  relationship_label_vi: string;
  confidence: string;
  ambiguity_status: string;
  owner_decision: string;
  decision_note: string | null;
  created_at: string;
};

type ImportWriteManifestRow = {
  id: string;
  manifest_hash: string;
  approval_marker: string;
  status: string;
  approved_scope: Record<string, unknown> | null;
  planned_counts: Record<string, unknown> | null;
  held_rows_summary: Record<string, unknown> | null;
  rollback_plan: Record<string, unknown> | null;
  created_record_ids: Record<string, unknown> | null;
  created_at: string;
};

const emptyManifestSummary: ImportManifestSummary = {
  warningCount: 0,
  duplicateCandidateCount: 0,
  relationshipCandidateCount: 0,
  writeManifestCount: 0,
  canImport: false,
  message: "Chưa có dữ liệu manifest.",
};

function baseResult(
  overrides: Partial<ImportManifestReadResult>,
): ImportManifestReadResult {
  return {
    ok: false,
    status: "unavailable",
    httpStatus: 503,
    marker: A16G_IMPORT_MANIFEST_READ_MARKER,
    previewOnly: true,
    canImport: false,
    dbWrite: false,
    peopleWrite: false,
    relationshipWrite: false,
    message: "Chưa đọc được manifest dữ liệu.",
    sessions: [],
    session: null,
    manifestSummary: emptyManifestSummary,
    warnings: [],
    peoplePreview: [],
    duplicateCandidates: [],
    relationshipsPreview: [],
    writeManifests: [],
    ...overrides,
  };
}

function isPersonCandidatePreview(
  value: unknown,
): value is ImportPersonCandidatePreview {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ImportPersonCandidatePreview>;
  return (
    typeof candidate.sourceRowIndex === "number" &&
    typeof candidate.fingerprint === "string" &&
    typeof candidate.fullName === "string"
  );
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function booleanOrNull(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizePersonCandidatePreview(
  candidate: ImportPersonCandidatePreview,
): ImportPersonCandidatePreview {
  return {
    sourceRowIndex: candidate.sourceRowIndex,
    fingerprint: candidate.fingerprint,
    externalId: stringOrNull(candidate.externalId),
    fullName: candidate.fullName,
    displayName: stringOrNull(candidate.displayName),
    alternateName: stringOrNull(candidate.alternateName),
    gender: typeof candidate.gender === "string" ? candidate.gender : "unknown",
    birthDateText: stringOrNull(candidate.birthDateText),
    deathDateText: stringOrNull(candidate.deathDateText),
    memorialLunarDate: stringOrNull(candidate.memorialLunarDate),
    ageAtDeath: numberOrNull(candidate.ageAtDeath),
    isLiving: booleanOrNull(candidate.isLiving),
    birthPlace: stringOrNull(candidate.birthPlace),
    homeTown: stringOrNull(candidate.homeTown),
    branchName: stringOrNull(candidate.branchName),
    generationNumber: numberOrNull(candidate.generationNumber),
    shortBio: stringOrNull(candidate.shortBio),
    notesPrivate: stringOrNull(candidate.notesPrivate),
    visibility:
      typeof candidate.visibility === "string" && candidate.visibility.trim()
        ? candidate.visibility
        : "family",
    rawMetadata:
      candidate.rawMetadata &&
      typeof candidate.rawMetadata === "object" &&
      !Array.isArray(candidate.rawMetadata)
        ? candidate.rawMetadata
        : {},
  };
}

function extractPeoplePreview(writeManifests: ImportWriteManifestPreview[]) {
  const people: ImportPersonCandidatePreview[] = [];

  for (const manifest of writeManifests) {
    const candidates = manifest.approvedScope.person_candidates;
    if (!Array.isArray(candidates)) continue;

    for (const candidate of candidates) {
      if (isPersonCandidatePreview(candidate)) {
        people.push(normalizePersonCandidatePreview(candidate));
      }
      if (people.length >= 100) return people;
    }
  }

  return people;
}

function mapSession(row: ImportSessionRow): ImportSessionSummary {
  return {
    id: row.id,
    sourceType: row.source_type,
    sourceFileName: row.source_file_name,
    sourceFileSizeBytes: row.source_file_size_bytes,
    sourceFileHash: row.source_file_hash,
    previewManifestHash: row.preview_manifest_hash,
    mappingVersion: row.mapping_version,
    parserVersion: row.parser_version,
    status: row.status,
    clanId: row.clan_id,
    branchId: row.branch_id,
    rowCount: row.row_count,
    personCandidateCount: row.person_candidate_count,
    relationshipCandidateCount: row.relationship_candidate_count,
    warningCount: row.warning_count,
    duplicateCandidateCount: row.duplicate_candidate_count,
    unmappedColumnCount: row.unmapped_column_count,
    heldRowCount: row.held_row_count,
    approvalMarker: row.approval_marker,
    reviewSummary: row.review_summary ?? {},
    privacySummary: row.privacy_summary ?? {},
    retentionUntil: row.retention_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function permissionDeniedResult(message: string, httpStatus: 401 | 403) {
  return baseResult({
    status: httpStatus === 401 ? "unauthenticated" : "forbidden",
    httpStatus,
    message,
  });
}

async function ensureReadAccess() {
  const context = await getPermissionContext();
  const configMissing =
    context.reason === "missing_supabase_config" ||
    context.reason === "missing_admin_config";

  if (!configMissing && !context.user) {
    return {
      ok: false as const,
      result: permissionDeniedResult(
        "Bạn cần đăng nhập để xem phiên nhập dữ liệu.",
        401,
      ),
    };
  }

  if (
    !configMissing &&
    context.user &&
    !context.permissions.includes("imports.create")
  ) {
    return {
      ok: false as const,
      result: permissionDeniedResult(
        "Bạn chưa có quyền xem manifest nhập dữ liệu.",
        403,
      ),
    };
  }

  const supabase = await maybeCreateServerSupabaseClient();

  if (!supabase) {
    return {
      ok: false as const,
      result: baseResult({
        status: "unavailable",
        httpStatus: 503,
        message:
          "Chưa cấu hình Supabase nên chưa đọc được phiên nhập dữ liệu.",
      }),
    };
  }

  return { ok: true as const, supabase };
}

export async function listImportSessions(): Promise<ImportManifestReadResult> {
  const access = await ensureReadAccess();
  if (!access.ok) return access.result;

  const { data, error } = await access.supabase
    .from("import_sessions")
    .select(
      "id, source_type, source_file_name, source_file_size_bytes, source_file_hash, preview_manifest_hash, mapping_version, parser_version, status, clan_id, branch_id, row_count, person_candidate_count, relationship_candidate_count, warning_count, duplicate_candidate_count, unmapped_column_count, held_row_count, approval_marker, review_summary, privacy_summary, retention_until, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<ImportSessionRow[]>();

  if (error) {
    return baseResult({
      status: "unavailable",
      httpStatus: 503,
      message:
        "Không đọc được phiên nhập dữ liệu. Bảng có thể đang được RLS bảo vệ hoặc manifest chưa sẵn sàng.",
    });
  }

  const sessions = (data ?? []).map(mapSession);

  if (sessions.length === 0) {
    return baseResult({
      ok: true,
      status: "empty",
      httpStatus: 200,
      message: "Chưa có phiên nhập dữ liệu.",
      sessions,
    });
  }

  return baseResult({
    ok: true,
    status: "ready",
    httpStatus: 200,
    message:
      "Đã đọc danh sách phiên nhập dữ liệu. Dữ liệu chỉ là bản xem trước, chưa được nhập vào cây gia phả.",
    sessions,
  });
}

export async function getImportSession(
  sessionId: string,
): Promise<ImportManifestReadResult> {
  const access = await ensureReadAccess();
  if (!access.ok) return access.result;

  const { data, error } = await access.supabase
    .from("import_sessions")
    .select(
      "id, source_type, source_file_name, source_file_size_bytes, source_file_hash, preview_manifest_hash, mapping_version, parser_version, status, clan_id, branch_id, row_count, person_candidate_count, relationship_candidate_count, warning_count, duplicate_candidate_count, unmapped_column_count, held_row_count, approval_marker, review_summary, privacy_summary, retention_until, created_at, updated_at",
    )
    .eq("id", sessionId)
    .maybeSingle<ImportSessionRow>();

  if (error) {
    return baseResult({
      status: "unavailable",
      httpStatus: 503,
      message:
        "Không đọc được phiên nhập dữ liệu. Bảng có thể đang được RLS bảo vệ hoặc manifest chưa sẵn sàng.",
    });
  }

  if (!data) {
    return baseResult({
      status: "not_found",
      httpStatus: 404,
      message:
        "Không tìm thấy phiên nhập hoặc bạn không có quyền truy cập.",
    });
  }

  return baseResult({
    ok: true,
    status: "ready",
    httpStatus: 200,
    message:
      "Đã đọc chi tiết phiên nhập dữ liệu. Chưa mở bước xác nhận nhập chính thức.",
    session: mapSession(data),
  });
}

export async function getImportManifest(
  sessionId: string,
): Promise<ImportManifestReadResult> {
  const sessionResult = await getImportSession(sessionId);
  if (!sessionResult.ok || !sessionResult.session) return sessionResult;

  const access = await ensureReadAccess();
  if (!access.ok) return access.result;

  const [warningsResult, duplicatesResult, relationshipsResult, writeManifestsResult] =
    await Promise.all([
      access.supabase
        .from("import_session_warnings")
        .select(
          "id, warning_code, severity, row_index, column_key, message_vi, review_status, created_at",
        )
        .eq("import_session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(100)
        .returns<ImportSessionWarningRow[]>(),
      access.supabase
        .from("import_duplicate_candidates")
        .select(
          "id, source_row_index, source_person_fingerprint, existing_person_id, match_strength, match_reason_codes, owner_decision, decision_note, created_at",
        )
        .eq("import_session_id", sessionId)
        .order("source_row_index", { ascending: true })
        .limit(100)
        .returns<ImportDuplicateCandidateRow[]>(),
      access.supabase
        .from("import_relationship_candidates")
        .select(
          "id, relationship_type, source_row_index, source_person_fingerprint, related_row_index, related_person_fingerprint, target_existing_person_id, relationship_label_vi, confidence, ambiguity_status, owner_decision, decision_note, created_at",
        )
        .eq("import_session_id", sessionId)
        .order("source_row_index", { ascending: true })
        .limit(100)
        .returns<ImportRelationshipCandidateRow[]>(),
      access.supabase
        .from("import_write_manifests")
        .select(
          "id, manifest_hash, approval_marker, status, approved_scope, planned_counts, held_rows_summary, rollback_plan, created_record_ids, created_at",
        )
        .eq("import_session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<ImportWriteManifestRow[]>(),
    ]);

  const firstError =
    warningsResult.error ??
    duplicatesResult.error ??
    relationshipsResult.error ??
    writeManifestsResult.error;

  if (firstError) {
    return baseResult({
      status: "unavailable",
      httpStatus: 503,
      session: sessionResult.session,
      message:
        "Không đọc được manifest dữ liệu. Bảng có thể đang được RLS bảo vệ hoặc manifest chưa sẵn sàng.",
    });
  }

  const warnings = (warningsResult.data ?? []).map((row) => ({
    id: row.id,
    warningCode: row.warning_code,
    severity: row.severity,
    rowIndex: row.row_index,
    columnKey: row.column_key,
    messageVi: row.message_vi,
    reviewStatus: row.review_status,
    createdAt: row.created_at,
  }));
  const duplicateCandidates = (duplicatesResult.data ?? []).map((row) => ({
    id: row.id,
    sourceRowIndex: row.source_row_index,
    sourcePersonFingerprint: row.source_person_fingerprint,
    existingPersonId: row.existing_person_id,
    matchStrength: row.match_strength,
    matchReasonCodes: row.match_reason_codes ?? [],
    ownerDecision: row.owner_decision,
    decisionNote: row.decision_note,
    createdAt: row.created_at,
  }));
  const relationshipsPreview = (relationshipsResult.data ?? []).map((row) => ({
    id: row.id,
    relationshipType: row.relationship_type,
    sourceRowIndex: row.source_row_index,
    sourcePersonFingerprint: row.source_person_fingerprint,
    relatedRowIndex: row.related_row_index,
    relatedPersonFingerprint: row.related_person_fingerprint,
    targetExistingPersonId: row.target_existing_person_id,
    relationshipLabelVi: row.relationship_label_vi,
    confidence: row.confidence,
    ambiguityStatus: row.ambiguity_status,
    ownerDecision: row.owner_decision,
    decisionNote: row.decision_note,
    createdAt: row.created_at,
  }));
  const writeManifests = (writeManifestsResult.data ?? []).map((row) => ({
    id: row.id,
    manifestHash: row.manifest_hash,
    approvalMarker: row.approval_marker,
    status: row.status,
    approvedScope: row.approved_scope ?? {},
    plannedCounts: row.planned_counts ?? {},
    heldRowsSummary: row.held_rows_summary ?? {},
    rollbackPlan: row.rollback_plan ?? {},
    createdRecordIds: row.created_record_ids ?? {},
    createdAt: row.created_at,
  }));
  const peoplePreview = extractPeoplePreview(writeManifests);

  const hasManifestRows =
    warnings.length > 0 ||
    peoplePreview.length > 0 ||
    duplicateCandidates.length > 0 ||
    relationshipsPreview.length > 0 ||
    writeManifests.length > 0;

  return baseResult({
    ok: true,
    status: hasManifestRows ? "ready" : "empty",
    httpStatus: 200,
    session: sessionResult.session,
    manifestSummary: {
      warningCount: warnings.length,
      duplicateCandidateCount: duplicateCandidates.length,
      relationshipCandidateCount:
        sessionResult.session.relationshipCandidateCount,
      writeManifestCount: writeManifests.length,
      canImport: false,
      message: hasManifestRows
        ? "Đã đọc manifest dữ liệu. Dữ liệu bên dưới chỉ là bản xem trước, chưa được nhập vào cây gia phả."
        : "Chưa có dữ liệu manifest.",
    },
    warnings,
    peoplePreview,
    duplicateCandidates,
    relationshipsPreview,
    writeManifests,
    message: hasManifestRows
      ? "Đã đọc manifest dữ liệu. Chưa mở bước xác nhận nhập chính thức."
      : "Chưa có dữ liệu manifest.",
  });
}

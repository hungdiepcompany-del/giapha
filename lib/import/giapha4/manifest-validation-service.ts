import "server-only";

import {
  getImportManifest,
  type ImportManifestReadResult,
  type ImportPersonCandidatePreview,
  type ImportRelationshipCandidatePreview,
  type ImportSessionWarningPreview,
} from "@/lib/import/giapha4/manifest-read-service";

export const A16J_MANIFEST_STAGING_VALIDATION_MARKER =
  "A16J_MANIFEST_STAGING_REVIEW_VALIDATION_WARNINGS";

export type ManifestValidationSeverity = "error" | "warning" | "info";

export type ManifestValidationIssue = {
  code: string;
  severity: ManifestValidationSeverity;
  entityType: "session" | "person" | "relationship" | "parse_warning";
  entityKey: string | null;
  rowNumber: number | null;
  field: string | null;
  titleVi: string;
  messageVi: string;
  suggestionVi: string;
};

export type ManifestValidationSummary = {
  peopleCount: number;
  relationshipCount: number;
  peoplePreviewCount: number;
  relationshipPreviewCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  canProceedToDryRun: false;
};

export type ManifestValidationResult = {
  ok: boolean;
  status: ImportManifestReadResult["status"];
  httpStatus: ImportManifestReadResult["httpStatus"];
  marker: typeof A16J_MANIFEST_STAGING_VALIDATION_MARKER;
  stagingOnly: true;
  readOnly: true;
  dbWrite: false;
  canImport: false;
  sessionId: string | null;
  message: string;
  summary: ManifestValidationSummary;
  issues: ManifestValidationIssue[];
};

type DateParts = {
  year: number;
  month: number | null;
  day: number | null;
  precision: "year" | "year_month" | "full";
  calendarType: "solar" | "lunar" | "unknown";
};

type DateOrderDiagnosis =
  | {
      status: "ok";
      code?: never;
      reason?: never;
    }
  | {
      status: "warning";
      code:
        | "death_same_year_incomplete_precision"
        | "death_date_calendar_mismatch_needs_review"
        | "death_date_calendar_unknown_needs_review";
    }
  | {
      status: "error";
      code: "death_before_birth";
      reason: "year_before_birth" | "full_date_before_birth";
    };

export const A16Q_FIX2_ROW95_SANITIZED_REGRESSION_CASE = {
  marker: "A16Q_FIX2_ROW95_SANITIZED_REGRESSION_CASE",
  rowNumber: 95,
  pii: "redacted",
  birth: {
    calendarType: "solar",
    precision: "year",
  },
  death: {
    calendarType: "unknown",
    precision: "year",
  },
  expected: {
    code: "death_date_calendar_unknown_needs_review",
    severity: "warning",
    blocker: false,
  },
} as const;

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeCalendarType(value: unknown): DateParts["calendarType"] {
  if (typeof value !== "string") return "unknown";
  const text = normalizeText(value);
  if (text === "solar" || text.includes("duong lich")) return "solar";
  if (text === "lunar" || text.includes("am lich")) return "lunar";
  return "unknown";
}

function readRawMetadataText(
  person: ImportPersonCandidatePreview,
  key: string,
): string | null {
  const value = person.rawMetadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function inferBirthDateCalendar(
  person: ImportPersonCandidatePreview,
): DateParts["calendarType"] {
  const stored = normalizeCalendarType(readRawMetadataText(person, "birth_date_calendar"));
  return stored === "unknown" ? "solar" : stored;
}

function inferDeathDateCalendar(
  person: ImportPersonCandidatePreview,
): DateParts["calendarType"] {
  const stored = normalizeCalendarType(readRawMetadataText(person, "death_date_calendar"));
  if (stored !== "unknown") return stored;
  return normalizeCalendarType(readRawMetadataText(person, "death_date_header"));
}

function parseDateParts(
  value: string | null | undefined,
  calendarType: DateParts["calendarType"],
): DateParts | null {
  const text = (value ?? "").trim();
  if (!text) return null;

  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(text);
  if (!match) return null;

  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : null;
  const day = match[3] ? Number(match[3]) : null;

  if (year < 1 || year > 9999) return null;
  if (month !== null && (month < 1 || month > 12)) return null;
  if (day !== null && (day < 1 || day > 31)) return null;

  const precision =
    month === null ? "year" : day === null ? "year_month" : "full";

  return { year, month, day, precision, calendarType };
}

function isFullDatePrecision(value: DateParts) {
  return value.precision === "full";
}

function compareFullDateParts(left: DateParts, right: DateParts) {
  if (left.year !== right.year) return left.year - right.year;
  if (left.month !== right.month) return Number(left.month) - Number(right.month);
  return Number(left.day) - Number(right.day);
}

function hasSameKnownCalendar(left: DateParts, right: DateParts) {
  return left.calendarType !== "unknown" && left.calendarType === right.calendarType;
}

function diagnoseDeathBeforeBirth(
  birthParts: DateParts | null,
  deathParts: DateParts | null,
): DateOrderDiagnosis {
  if (!birthParts || !deathParts) return { status: "ok" };

  if (deathParts.calendarType === "unknown") {
    return {
      status: "warning",
      code: "death_date_calendar_unknown_needs_review",
    };
  }

  if (!hasSameKnownCalendar(birthParts, deathParts)) {
    return {
      status: "warning",
      code: "death_date_calendar_mismatch_needs_review",
    };
  }

  if (deathParts.year < birthParts.year) {
    return {
      status: "error",
      code: "death_before_birth",
      reason: "year_before_birth",
    };
  }

  if (
    deathParts.year === birthParts.year &&
    (!isFullDatePrecision(birthParts) || !isFullDatePrecision(deathParts))
  ) {
    return {
      status: "warning",
      code: "death_same_year_incomplete_precision",
    };
  }

  if (
    isFullDatePrecision(birthParts) &&
    isFullDatePrecision(deathParts) &&
    compareFullDateParts(deathParts, birthParts) < 0
  ) {
    return {
      status: "error",
      code: "death_before_birth",
      reason: "full_date_before_birth",
    };
  }

  return { status: "ok" };
}

function issue(
  severity: ManifestValidationSeverity,
  code: string,
  entityType: ManifestValidationIssue["entityType"],
  entityKey: string | null,
  rowNumber: number | null,
  field: string | null,
  titleVi: string,
  messageVi: string,
  suggestionVi: string,
): ManifestValidationIssue {
  return {
    code,
    severity,
    entityType,
    entityKey,
    rowNumber,
    field,
    titleVi,
    messageVi,
    suggestionVi,
  };
}

function mapParseWarning(
  warning: ImportSessionWarningPreview,
): ManifestValidationIssue {
  const severity: ManifestValidationSeverity =
    warning.severity === "blocker" || warning.severity === "error"
      ? "error"
      : warning.severity === "info"
        ? "info"
        : "warning";

  return issue(
    severity,
    `parse_warning_${normalizeText(warning.warningCode).replace(/[^a-z0-9]+/g, "_")}`,
    "parse_warning",
    warning.id,
    warning.rowIndex,
    warning.columnKey,
    "Cảnh báo từ parser",
    warning.messageVi,
    "Kiểm tra lại dòng/cột nguồn trong file Gia Phả 4 trước khi xin mở bước nhập chính thức.",
  );
}

function validatePerson(
  person: ImportPersonCandidatePreview,
): ManifestValidationIssue[] {
  const issues: ManifestValidationIssue[] = [];
  const rowNumber = person.sourceRowIndex;
  const key = person.fingerprint || `row-${rowNumber}`;
  const normalizedName = normalizeText(person.fullName);

  if (!person.fingerprint.trim()) {
    issues.push(
      issue(
        "error",
        "missing_person_fingerprint",
        "person",
        key,
        rowNumber,
        "fingerprint",
        "Thiếu mã staging của thành viên",
        "Một dòng thành viên chưa có fingerprint staging để đối chiếu an toàn.",
        "Tải lại file hoặc kiểm tra bước parser trước khi review tiếp.",
      ),
    );
  }

  if (!normalizedName || normalizedName.length < 2) {
    issues.push(
      issue(
        "error",
        "invalid_person_name",
        "person",
        key,
        rowNumber,
        "fullName",
        "Tên thành viên chưa hợp lệ",
        "Họ tên staging đang trống hoặc quá ngắn để owner review.",
        "Bổ sung họ tên rõ ràng trong file nguồn rồi upload lại staging.",
      ),
    );
  }

  if (!person.displayName?.trim()) {
    issues.push(
      issue(
        "info",
        "missing_display_name",
        "person",
        key,
        rowNumber,
        "displayName",
        "Chưa có tên hiển thị riêng",
        "Dòng này chưa có tên hiển thị riêng; hệ thống chỉ đang dùng họ tên staging để review.",
        "Nếu cần tên gọi ngắn hơn, bổ sung cột tên hiển thị trong file nguồn.",
      ),
    );
  }

  const birthParts = parseDateParts(
    person.birthDateText,
    inferBirthDateCalendar(person),
  );
  const deathParts = parseDateParts(
    person.deathDateText,
    inferDeathDateCalendar(person),
  );

  if (person.birthDateText && !birthParts) {
    issues.push(
      issue(
        "warning",
        "invalid_birth_date",
        "person",
        key,
        rowNumber,
        "birthDateText",
        "Ngày sinh chưa chuẩn",
        "Ngày sinh staging chưa theo dạng YYYY, YYYY-MM hoặc YYYY-MM-DD.",
        "Chuẩn hóa ngày sinh trước khi owner duyệt nhập thật.",
      ),
    );
  }

  if (person.deathDateText && !deathParts) {
    issues.push(
      issue(
        "warning",
        "invalid_death_date",
        "person",
        key,
        rowNumber,
        "deathDateText",
        "Ngày mất chưa chuẩn",
        "Ngày mất staging chưa theo dạng YYYY, YYYY-MM hoặc YYYY-MM-DD.",
        "Chuẩn hóa ngày mất hoặc để trống nếu chưa rõ.",
      ),
    );
  }

  if (birthParts && birthParts.precision !== "full") {
    issues.push(
      issue(
        "warning",
        "birth_date_precision_needs_review",
        "person",
        key,
        rowNumber,
        "birthDateText",
        "Ngày sinh cần rà soát độ chính xác",
        "Ngày sinh staging chỉ có năm hoặc thiếu ngày/tháng nên chưa đủ chính xác để kết luận theo thứ tự ngày.",
        "Owner cần xác nhận thêm ngày/tháng nếu muốn dùng ngày sinh trong các kiểm tra chính xác.",
      ),
    );
  }

  if (deathParts && deathParts.precision !== "full") {
    issues.push(
      issue(
        "warning",
        "death_date_precision_needs_review",
        "person",
        key,
        rowNumber,
        "deathDateText",
        "Ngày mất cần rà soát độ chính xác",
        "Ngày mất staging chỉ có năm hoặc thiếu ngày/tháng nên chưa đủ chính xác để kết luận theo thứ tự ngày.",
        "Owner cần xác nhận thêm ngày/tháng nếu muốn dùng ngày mất trong các kiểm tra chính xác.",
      ),
    );
  }

  const dateOrderDiagnosis = diagnoseDeathBeforeBirth(birthParts, deathParts);

  if (dateOrderDiagnosis.code === "death_date_calendar_mismatch_needs_review") {
    issues.push(
      issue(
        "warning",
        "death_date_calendar_mismatch_needs_review",
        "person",
        key,
        rowNumber,
        "deathDateText",
        "Ngày mất khác hệ lịch với ngày sinh",
        "Ngày sinh được hiểu là dương lịch, còn ngày mất có thể thuộc hệ lịch khác nên không so sánh trực tiếp như cùng một lịch.",
        "Chủ nhà cần xác nhận ngày mất là âm lịch hay dương lịch trước khi kết luận thứ tự ngày chính xác.",
      ),
    );
  }

  if (dateOrderDiagnosis.code === "death_date_calendar_unknown_needs_review") {
    issues.push(
      issue(
        "warning",
        "death_date_calendar_unknown_needs_review",
        "person",
        key,
        rowNumber,
        "deathDateText",
        "Ngày mất cần xác nhận hệ lịch",
        "Trong gia phả Việt, ngày mất hoặc ngày giỗ có thể là âm lịch; khi chưa rõ hệ lịch thì không kết luận ngày mất trước ngày sinh bằng so sánh trực tiếp.",
        "Chủ nhà cần xác nhận ngày mất là âm lịch hay dương lịch trước khi nhập chính thức.",
      ),
    );
  }

  if (
    dateOrderDiagnosis.status === "error" &&
    dateOrderDiagnosis.reason === "year_before_birth"
  ) {
    issues.push(
      issue(
        "error",
        "death_before_birth",
        "person",
        key,
        rowNumber,
        "deathDateText",
        "Ngày mất trước ngày sinh",
        "Dữ liệu staging có ngày mất nhỏ hơn ngày sinh.",
        "Kiểm tra lại năm/ngày tháng trong file nguồn trước khi tiếp tục.",
      ),
    );
  }

  if (dateOrderDiagnosis.code === "death_same_year_incomplete_precision") {
    issues.push(
      issue(
        "warning",
        "death_same_year_incomplete_precision",
        "person",
        key,
        rowNumber,
        "deathDateText",
        "Ngày mất cùng năm sinh cần rà soát",
        "Ngày sinh/ngày mất cùng năm nhưng thiếu ngày/tháng hoặc khác/chưa rõ hệ lịch, nên không thể kết luận ngày mất trước ngày sinh.",
        "Owner đã xác nhận trường hợp mất cùng năm sinh có thể hợp lệ; bổ sung ngày/tháng và hệ lịch nếu cần kiểm tra chính xác hơn.",
      ),
    );
  }

  if (
    dateOrderDiagnosis.status === "error" &&
    dateOrderDiagnosis.reason === "full_date_before_birth"
  ) {
    issues.push(
      issue(
        "error",
        "death_before_birth",
        "person",
        key,
        rowNumber,
        "deathDateText",
        "Ngày mất trước ngày sinh",
        "Dữ liệu staging có ngày mất nhỏ hơn ngày sinh và cả hai ngày đều đủ ngày/tháng/năm.",
        "Kiểm tra lại ngày tháng đầy đủ trong file nguồn trước khi tiếp tục.",
      ),
    );
  }

  if (person.isLiving === true && person.deathDateText?.trim()) {
    issues.push(
      issue(
        "warning",
        "living_status_conflict",
        "person",
        key,
        rowNumber,
        "isLiving",
        "Mâu thuẫn trạng thái còn sống",
        "Dòng staging vừa đánh dấu còn sống vừa có ngày mất.",
        "Chọn một trạng thái đúng trong file nguồn rồi upload lại staging.",
      ),
    );
  }

  return issues;
}

function validateDuplicatePeople(
  people: ImportPersonCandidatePreview[],
): ManifestValidationIssue[] {
  const groups = new Map<string, ImportPersonCandidatePreview[]>();

  for (const person of people) {
    const name = normalizeText(person.fullName);
    if (!name) continue;
    const birth = (person.birthDateText ?? "").trim();
    const homeTown = normalizeText(person.homeTown);
    const key = `${name}|${birth}|${homeTown}`;
    const group = groups.get(key) ?? [];
    group.push(person);
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .filter((group) => group.length > 1)
    .slice(0, 20)
    .map((group) =>
      issue(
        "warning",
        "duplicate_person_candidate",
        "person",
        group.map((person) => person.fingerprint).join(","),
        group[0]?.sourceRowIndex ?? null,
        "fullName",
        "Có thể trùng thành viên staging",
        `Tìm thấy ${group.length} dòng có họ tên/ngày sinh/quê quán giống hoặc rất gần nhau trong staging.`,
        "Owner cần đối chiếu thủ công; A-16J không tự gộp và không tự sửa dữ liệu.",
      ),
    );
}

function validateRelationship(
  relationship: ImportRelationshipCandidatePreview,
  personFingerprints: Set<string>,
): ManifestValidationIssue[] {
  const issues: ManifestValidationIssue[] = [];
  const key = relationship.id;
  const rowNumber = relationship.sourceRowIndex;
  const sourceFingerprint = relationship.sourcePersonFingerprint.trim();
  const targetFingerprint = relationship.relatedPersonFingerprint?.trim() ?? "";

  if (!sourceFingerprint) {
    issues.push(
      issue(
        "error",
        "missing_relationship_source",
        "relationship",
        key,
        rowNumber,
        "sourcePersonFingerprint",
        "Thiếu thành viên nguồn của quan hệ",
        "Quan hệ staging chưa có fingerprint của người nguồn.",
        "Kiểm tra lại dòng quan hệ trong file nguồn hoặc parser staging.",
      ),
    );
  }

  if (!targetFingerprint) {
    issues.push(
      issue(
        "error",
        "missing_relationship_target",
        "relationship",
        key,
        rowNumber,
        "relatedPersonFingerprint",
        "Thiếu thành viên đích của quan hệ",
        "Quan hệ staging chưa trỏ được tới người liên quan.",
        "Kiểm tra lại cột cha/mẹ/vợ/chồng/con trong file nguồn.",
      ),
    );
  }

  if (sourceFingerprint && !personFingerprints.has(sourceFingerprint)) {
    issues.push(
      issue(
        "error",
        "relationship_source_not_found",
        "relationship",
        key,
        rowNumber,
        "sourcePersonFingerprint",
        "Thành viên nguồn không có trong staging",
        "Quan hệ staging đang trỏ tới một fingerprint nguồn không nằm trong danh sách người staging.",
        "Kiểm tra lại manifest staging hoặc upload lại file nguồn trước khi xin mở nhập chính thức.",
      ),
    );
  }

  if (targetFingerprint && !personFingerprints.has(targetFingerprint)) {
    issues.push(
      issue(
        "error",
        "relationship_target_not_found",
        "relationship",
        key,
        rowNumber,
        "relatedPersonFingerprint",
        "Thành viên đích không có trong staging",
        "Quan hệ staging đang trỏ tới một người liên quan không nằm trong danh sách người staging.",
        "Kiểm tra lại cột cha/mẹ/vợ/chồng/con trong file nguồn hoặc bổ sung người còn thiếu rồi upload lại staging.",
      ),
    );
  }

  if (targetFingerprint && sourceFingerprint === targetFingerprint) {
    issues.push(
      issue(
        "error",
        "self_relationship_candidate",
        "relationship",
        key,
        rowNumber,
        "relatedPersonFingerprint",
        "Quan hệ tự trỏ tới chính mình",
        "Một quan hệ staging đang nối một người với chính người đó.",
        "Sửa dòng nguồn để tránh tạo quan hệ sai khi mở phase nhập thật.",
      ),
    );
  }

  if (!["parent_child", "spouse_couple", "branch_membership"].includes(relationship.relationshipType)) {
    issues.push(
      issue(
        "warning",
        "unknown_relationship_type",
        "relationship",
        key,
        rowNumber,
        "relationshipType",
        "Loại quan hệ chưa nhận diện",
        `Loại quan hệ ${relationship.relationshipType} chưa nằm trong danh sách review của A-16J.`,
        "Đưa loại quan hệ này vào mapping riêng trước khi mở import thật.",
      ),
    );
  }

  if (relationship.ambiguityStatus && relationship.ambiguityStatus !== "clear") {
    issues.push(
      issue(
        "warning",
        "ambiguous_relationship_candidate",
        "relationship",
        key,
        rowNumber,
        "ambiguityStatus",
        "Quan hệ cần đối chiếu",
        "Parser đánh dấu quan hệ này chưa rõ hoặc cần owner kiểm tra thêm.",
        "Đối chiếu thủ công trong file nguồn; A-16J không tự quyết định quan hệ.",
      ),
    );
  }

  return issues;
}

function validateDuplicateRelationships(
  relationships: ImportRelationshipCandidatePreview[],
): ManifestValidationIssue[] {
  const groups = new Map<string, ImportRelationshipCandidatePreview[]>();

  for (const relationship of relationships) {
    const key = [
      relationship.relationshipType,
      relationship.sourcePersonFingerprint,
      relationship.relatedPersonFingerprint ?? "",
    ].join("|");
    const group = groups.get(key) ?? [];
    group.push(relationship);
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .filter((group) => group.length > 1)
    .slice(0, 20)
    .map((group) =>
      issue(
        "warning",
        "duplicate_relationship_candidate",
        "relationship",
        group.map((relationship) => relationship.id).join(","),
        group[0]?.sourceRowIndex ?? null,
        "relationshipType",
        "Có thể trùng quan hệ staging",
        `Tìm thấy ${group.length} quan hệ staging trùng nguồn/đích/loại quan hệ.`,
        "Owner cần kiểm tra trước khi mở phase nhập thật; A-16J không tự xóa trùng.",
      ),
    );
}

function summarize(
  peopleCount: number,
  relationshipCount: number,
  peoplePreviewCount: number,
  relationshipPreviewCount: number,
  issues: ManifestValidationIssue[],
): ManifestValidationSummary {
  return {
    peopleCount,
    relationshipCount,
    peoplePreviewCount,
    relationshipPreviewCount,
    errorCount: issues.filter((item) => item.severity === "error").length,
    warningCount: issues.filter((item) => item.severity === "warning").length,
    infoCount: issues.filter((item) => item.severity === "info").length,
    canProceedToDryRun: false,
  };
}

export function buildManifestValidationReview(
  manifest: ImportManifestReadResult,
): ManifestValidationResult {
  const issues: ManifestValidationIssue[] = [];
  const sessionId = manifest.session?.id ?? null;

  if (!manifest.ok) {
    const summary = summarize(0, 0, 0, 0, issues);

    return {
      ok: false,
      status: manifest.status,
      httpStatus: manifest.httpStatus,
      marker: A16J_MANIFEST_STAGING_VALIDATION_MARKER,
      stagingOnly: true,
      readOnly: true,
      dbWrite: false,
      canImport: false,
      sessionId,
      message: manifest.message,
      summary,
      issues,
    };
  }

  if (!manifest.session) {
    issues.push(
      issue(
        "info",
        "no_import_session_selected",
        "session",
        null,
        null,
        null,
        "Chưa có phiên staging để kiểm tra",
        "Hiện chưa có import session hoặc chưa chọn session để review.",
        "Tải file Gia Phả 4 vào staging trước khi kiểm tra cảnh báo.",
      ),
    );
  }

  if (manifest.status === "empty") {
    issues.push(
      issue(
        "info",
        "empty_manifest_staging",
        "session",
        sessionId,
        null,
        null,
        "Manifest staging đang trống",
        "Phiên hiện tại chưa có người, quan hệ hoặc warning staging để kiểm tra.",
        "Upload lại file hoặc kiểm tra quyền đọc các bảng import manifest.",
      ),
    );
  }

  if (manifest.session && manifest.peoplePreview.length === 0) {
    issues.push(
      issue(
        "error",
        "no_people_rows",
        "session",
        manifest.session.id,
        null,
        "peoplePreview",
        "Chưa có người staging",
        "Không tìm thấy thành viên staging trong manifest đọc được.",
        "Kiểm tra sheet/cột nguồn và upload lại trước khi xin mở nhập chính thức.",
      ),
    );
  }

  for (const warning of manifest.warnings) {
    issues.push(mapParseWarning(warning));
  }

  for (const person of manifest.peoplePreview) {
    issues.push(...validatePerson(person));
  }

  issues.push(...validateDuplicatePeople(manifest.peoplePreview));

  const personFingerprints = new Set(
    manifest.peoplePreview
      .map((person) => person.fingerprint.trim())
      .filter(Boolean),
  );

  for (const relationship of manifest.relationshipsPreview) {
    issues.push(...validateRelationship(relationship, personFingerprints));
  }

  issues.push(...validateDuplicateRelationships(manifest.relationshipsPreview));

  if (manifest.peoplePreview.length > 0 && manifest.relationshipsPreview.length === 0) {
    issues.push(
      issue(
        "info",
        "no_relationship_rows",
        "session",
        sessionId,
        null,
        "relationshipsPreview",
        "Chưa có quan hệ staging",
        "Manifest có người staging nhưng chưa có quan hệ staging để review.",
        "Nếu file nguồn có quan hệ, kiểm tra mapping cha/mẹ/vợ/chồng/con.",
      ),
    );
  }

  const summary = summarize(
    manifest.session?.personCandidateCount ?? manifest.peoplePreview.length,
    manifest.session?.relationshipCandidateCount ??
      manifest.relationshipsPreview.length,
    manifest.peoplePreview.length,
    manifest.relationshipsPreview.length,
    issues,
  );

  return {
    ok: true,
    status: manifest.status,
    httpStatus: 200,
    marker: A16J_MANIFEST_STAGING_VALIDATION_MARKER,
    stagingOnly: true,
    readOnly: true,
    dbWrite: false,
    canImport: false,
    sessionId,
    message:
      "Đã kiểm tra dữ liệu staging ở chế độ chỉ đọc. Dữ liệu này vẫn chưa được nhập vào cây gia phả thật.",
    summary,
    issues,
  };
}

export async function validateImportManifestStaging(
  sessionId: string,
): Promise<ManifestValidationResult> {
  const manifest = await getImportManifest(sessionId);
  return buildManifestValidationReview(manifest);
}

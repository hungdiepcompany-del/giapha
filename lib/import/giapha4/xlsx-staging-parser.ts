import "server-only";

import JSZip from "jszip";

import { sha256Hex } from "@/lib/family/checksum";
import {
  isGiaPha4NullPlaceholder,
  normalizeGiaPha4DateText,
  normalizeGiaPha4Gender,
  normalizeGiaPha4NullableText,
  normalizeGiaPha4Text,
  parseGiaPha4Generation,
  parseGiaPha4PositiveNumber,
} from "@/lib/import/giapha4/normalize";
import { detectGiaPha4FileKind } from "@/lib/import/giapha4/parser";

export const A16I_GIAPHA4_STAGING_PARSER_MARKER =
  "A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING";
export const A16I3_GIAPHA4_COLUMN_MAPPING_MARKER =
  "A16I3_GIAPHA4_XLSX_COLUMN_MAPPING_HARDENING";

export const A16I_MAPPING_VERSION = "a16i3-giapha4-manifest-staging-v2";
export const A16I_PARSER_VERSION = "a16i3-jszip-xlsx-thanh-vien-v2";
export const GIAPHA4_STAGING_MAX_BYTES = 5 * 1024 * 1024;

export type GiaPha4StagingWarning = {
  warningCode: string;
  severity: "info" | "warning" | "blocker";
  rowIndex: number | null;
  columnKey: string | null;
  messageVi: string;
};

export type GiaPha4ParseSummary = {
  sheetName: string;
  peopleRowsRead: number;
  peopleRowsMapped: number;
  parentRelationshipsMapped: number;
  skippedParentRelationships: number;
  warningCount: number;
  errorCount: number;
};

export type GiaPha4StagedPersonCandidate = {
  sourceRowIndex: number;
  fingerprint: string;
  externalId: string;
  fullName: string;
  displayName: string | null;
  alternateName: string | null;
  gender: "male" | "female" | "other" | "unknown";
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
  visibility: "family";
  rawMetadata: Record<string, string | number | null>;
};

export type GiaPha4StagedRelationshipCandidate = {
  relationshipType: "parent_child" | "spouse_couple";
  sourceRowIndex: number;
  sourcePersonFingerprint: string;
  relatedRowIndex: number | null;
  relatedPersonFingerprint: string | null;
  relationshipLabelVi: string;
  confidence: "strong" | "medium" | "weak" | "ambiguous";
  ambiguityStatus: "clear" | "ambiguous" | "missing_reference" | "conflicting";
  sourceExternalId?: string;
  parentExternalId?: string;
  parentRole?: "father" | "mother";
  sourceLabelVi?: string | null;
};

export type GiaPha4StagedDuplicateCandidate = {
  sourceRowIndex: number;
  sourcePersonFingerprint: string;
  matchStrength: "strong" | "medium" | "weak" | "ambiguous";
  matchReasonCodes: string[];
};

export type GiaPha4StagingParseResult =
  | {
      ok: true;
      sheetName: string;
      headerRowIndex: number;
      rowCount: number;
      sourceFileHash: string;
      previewManifestHash: string;
      personCandidates: GiaPha4StagedPersonCandidate[];
      relationshipCandidates: GiaPha4StagedRelationshipCandidate[];
      duplicateCandidates: GiaPha4StagedDuplicateCandidate[];
      warnings: GiaPha4StagingWarning[];
      unmappedColumns: string[];
      heldRowCount: number;
      parseSummary: GiaPha4ParseSummary;
    }
  | {
      ok: false;
      sourceFileHash: string;
      errorCode: string;
      messageVi: string;
      warnings: GiaPha4StagingWarning[];
    };

type WorkbookSheet = {
  name: string;
  rows: string[][];
};

type HeaderKey =
  | "externalId"
  | "fullName"
  | "generationNumber"
  | "alternateName"
  | "gender"
  | "birthDate"
  | "maritalStatus"
  | "phone"
  | "education"
  | "occupation"
  | "province"
  | "district"
  | "ward"
  | "currentAddress"
  | "shortBio"
  | "deathDate"
  | "memorialLunarDate"
  | "ageAtDeath"
  | "worshipPlace"
  | "caretaker"
  | "burialPlace"
  | "fatherName"
  | "fatherExternalId"
  | "motherName"
  | "motherExternalId";

type HeaderMapping = {
  headerRowIndex: number;
  columnToKey: Map<number, HeaderKey>;
  unmappedColumns: string[];
};

const MAIN_MEMBER_SHEET_NAME = "Thành viên";

const HEADER_ALIASES: Record<HeaderKey, string[]> = {
  externalId: ["Mã GP", "Ma GP", "Mã gia phả", "Ma gia pha"],
  fullName: ["Họ tên", "Ho ten", "Họ và tên", "Ho va ten"],
  generationNumber: ["Đời thứ", "Doi thu", "Đời", "Doi"],
  alternateName: ["Tên khác", "Ten khac"],
  gender: ["Giới tính", "Gioi tinh"],
  birthDate: ["Ngày Sinh", "Ngay Sinh", "Ngày sinh", "Ngay sinh"],
  maritalStatus: ["Hôn nhân", "Hon nhan"],
  phone: ["Số điện thoại", "So dien thoai"],
  education: ["Học vấn", "Hoc van"],
  occupation: ["Nghề nghiệp", "Nghe nghiep"],
  province: ["Tỉnh/Thành Phố", "Tinh/Thanh Pho", "Tỉnh/Thành phố"],
  district: ["Quận/Huyện", "Quan/Huyen"],
  ward: ["Phường/Xã", "Phuong/Xa"],
  currentAddress: ["Địa chỉ hiện tại", "Dia chi hien tai"],
  shortBio: ["Tiểu sử", "Tieu su"],
  deathDate: ["Ngày mất (Dương lịch)", "Ngay mat (Duong lich)", "Ngày mất"],
  memorialLunarDate: ["Ngày giỗ (Âm lịch)", "Ngay gio (Am lich)", "Ngày giỗ"],
  ageAtDeath: [
    "Hưởng Thọ/Dương (Tuổi)",
    "Huong Tho/Duong (Tuoi)",
    "Hưởng thọ",
  ],
  worshipPlace: ["Thờ cúng tại", "Tho cung tai"],
  caretaker: ["Người phụ trách", "Nguoi phu trach"],
  burialPlace: ["Mộ táng", "Mo tang"],
  fatherName: ["Tên Bố", "Ten Bo", "Tên Cha", "Ten Cha"],
  fatherExternalId: ["Mã GP Bố", "Ma GP Bo", "Mã GP Cha", "Ma GP Cha"],
  motherName: ["Tên Mẹ", "Ten Me"],
  motherExternalId: ["Mã GP Mẹ", "Ma GP Me"],
};

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function getXmlAttribute(xml: string, attributeName: string) {
  const pattern = new RegExp(`\\b${attributeName}="([^"]*)"`);
  const match = xml.match(pattern);
  return match ? decodeXml(match[1]) : null;
}

function normalizeHeader(value: string) {
  return normalizeGiaPha4Text(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeSourceKey(value: unknown) {
  return normalizeGiaPha4NullableText(value).replace(/\s+/g, "");
}

function isValidParentExternalId(value: unknown, childExternalId: string) {
  const normalized = normalizeSourceKey(value);
  return Boolean(normalized && normalized !== childExternalId);
}

function columnLettersToIndex(cellRef: string) {
  const letters = cellRef.match(/^[A-Z]+/i)?.[0] ?? "";
  let index = 0;
  for (const letter of letters.toUpperCase()) {
    index = index * 26 + letter.charCodeAt(0) - 64;
  }
  return Math.max(0, index - 1);
}

function extractTextFromXml(xml: string) {
  const values: string[] = [];
  const textPattern = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
  for (const match of xml.matchAll(textPattern)) {
    values.push(decodeXml(match[1]));
  }
  return values.join("");
}

function parseSharedStrings(xml: string) {
  const sharedStrings: string[] = [];
  const itemPattern = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  for (const match of xml.matchAll(itemPattern)) {
    sharedStrings.push(extractTextFromXml(match[1]));
  }
  return sharedStrings;
}

function normalizeZipPath(target: string) {
  const parts: string[] = [];
  for (const part of target.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}

function parseWorkbookSheets(
  workbookXml: string,
  workbookRelsXml: string,
): Array<{ name: string; path: string }> {
  const relationshipTargets = new Map<string, string>();
  const relPattern = /<Relationship\b([^>]*)\/?>/g;
  for (const match of workbookRelsXml.matchAll(relPattern)) {
    const id = getXmlAttribute(match[1], "Id");
    const target = getXmlAttribute(match[1], "Target");
    if (id && target) {
      const targetPath = target.startsWith("/")
        ? target.slice(1)
        : `xl/${target}`;
      relationshipTargets.set(id, normalizeZipPath(targetPath));
    }
  }

  const sheets: Array<{ name: string; path: string }> = [];
  const sheetPattern = /<sheet\b([^>]*)\/?>/g;
  for (const match of workbookXml.matchAll(sheetPattern)) {
    const name = getXmlAttribute(match[1], "name");
    const relId = getXmlAttribute(match[1], "r:id");
    const path = relId ? relationshipTargets.get(relId) : null;
    if (name && path) sheets.push({ name, path });
  }

  return sheets;
}

function parseSheetRows(xml: string, sharedStrings: string[]) {
  const rows: string[][] = [];
  const rowPattern = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  for (const rowMatch of xml.matchAll(rowPattern)) {
    const row: string[] = [];
    const cellPattern = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
    for (const cellMatch of rowMatch[1].matchAll(cellPattern)) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const cellRef = getXmlAttribute(attrs, "r") ?? "";
      const columnIndex = columnLettersToIndex(cellRef);
      const cellType = getXmlAttribute(attrs, "t");
      const rawValue = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? "";
      const inlineValue = body.match(/<is\b[^>]*>([\s\S]*?)<\/is>/)?.[1] ?? "";

      let value = "";
      if (cellType === "s") {
        value = sharedStrings[Number.parseInt(rawValue, 10)] ?? "";
      } else if (cellType === "inlineStr") {
        value = extractTextFromXml(inlineValue);
      } else {
        value = decodeXml(rawValue);
      }

      row[columnIndex] = normalizeGiaPha4Text(value);
    }
    rows.push(row);
  }
  return rows;
}

async function readWorkbook(buffer: Uint8Array): Promise<WorkbookSheet[]> {
  const zip = await JSZip.loadAsync(buffer);
  const workbookXml = await zip.file("xl/workbook.xml")?.async("string");
  const workbookRelsXml = await zip
    .file("xl/_rels/workbook.xml.rels")
    ?.async("string");
  const sharedStringsXml = await zip
    .file("xl/sharedStrings.xml")
    ?.async("string");

  if (!workbookXml || !workbookRelsXml) {
    throw new Error("WORKBOOK_STRUCTURE_NOT_RECOGNIZED");
  }

  const sharedStrings = sharedStringsXml
    ? parseSharedStrings(sharedStringsXml)
    : [];
  const sheets = parseWorkbookSheets(workbookXml, workbookRelsXml);
  const parsedSheets: WorkbookSheet[] = [];

  for (const sheet of sheets) {
    const sheetXml = await zip.file(sheet.path)?.async("string");
    if (!sheetXml) continue;
    parsedSheets.push({
      name: sheet.name,
      rows: parseSheetRows(sheetXml, sharedStrings),
    });
  }

  return parsedSheets;
}

function buildAliasMap() {
  const aliasToKey = new Map<string, HeaderKey>();
  for (const [key, aliases] of Object.entries(HEADER_ALIASES) as Array<
    [HeaderKey, string[]]
  >) {
    for (const alias of aliases) aliasToKey.set(normalizeHeader(alias), key);
  }
  return aliasToKey;
}

function findHeaderMapping(sheet: WorkbookSheet): HeaderMapping | null {
  const aliasToKey = buildAliasMap();

  for (const [rowIndex, row] of sheet.rows.slice(0, 20).entries()) {
    const columnToKey = new Map<number, HeaderKey>();
    const unmappedColumns: string[] = [];

    for (const [columnIndex, value] of row.entries()) {
      const normalized = normalizeHeader(value);
      if (!normalized) continue;
      const key = aliasToKey.get(normalized);
      if (key) {
        columnToKey.set(columnIndex, key);
      } else {
        unmappedColumns.push(value);
      }
    }

    const mappedKeys = [...columnToKey.values()];
    if (mappedKeys.includes("externalId") && mappedKeys.includes("fullName")) {
      return {
        headerRowIndex: rowIndex,
        columnToKey,
        unmappedColumns,
      };
    }
  }

  return null;
}

function getCellValue(row: string[], mapping: HeaderMapping, key: HeaderKey) {
  for (const [columnIndex, mappedKey] of mapping.columnToKey.entries()) {
    if (mappedKey === key) return normalizeGiaPha4NullableText(row[columnIndex]);
  }
  return "";
}

function getRawCellValue(row: string[], mapping: HeaderMapping, key: HeaderKey) {
  for (const [columnIndex, mappedKey] of mapping.columnToKey.entries()) {
    if (mappedKey === key) return normalizeGiaPha4Text(row[columnIndex]);
  }
  return "";
}

function parseLiving(deathDateText: string | null) {
  return deathDateText ? false : null;
}

function personFingerprint(input: {
  externalId: string;
  fullName: string;
  birthDateText: string | null;
  deathDateText: string | null;
  generationNumber: number | null;
}) {
  return sha256Hex(
    [
      "giapha4-person",
      normalizeHeader(input.externalId),
      normalizeHeader(input.fullName),
      input.birthDateText ?? "",
      input.deathDateText ?? "",
      input.generationNumber ?? "",
    ].join("|"),
  );
}

function externalIdFingerprint(externalId: string) {
  return sha256Hex(`giapha4-external-id:${normalizeHeader(externalId)}`);
}

function createWarning(
  warningCode: string,
  messageVi: string,
  severity: GiaPha4StagingWarning["severity"] = "warning",
  rowIndex: number | null = null,
  columnKey: string | null = null,
): GiaPha4StagingWarning {
  return { warningCode, severity, rowIndex, columnKey, messageVi };
}

function selectMemberSheet(sheets: WorkbookSheet[]) {
  return (
    sheets.find(
      (sheet) => normalizeHeader(sheet.name) === normalizeHeader(MAIN_MEMBER_SHEET_NAME),
    ) ?? null
  );
}

function buildRawMetadata(row: string[], mapping: HeaderMapping) {
  return {
    marital_status: getCellValue(row, mapping, "maritalStatus") || null,
    phone: getCellValue(row, mapping, "phone") || null,
    education: getCellValue(row, mapping, "education") || null,
    occupation: getCellValue(row, mapping, "occupation") || null,
    province: getCellValue(row, mapping, "province") || null,
    district: getCellValue(row, mapping, "district") || null,
    ward: getCellValue(row, mapping, "ward") || null,
    current_address: getCellValue(row, mapping, "currentAddress") || null,
    worship_place: getCellValue(row, mapping, "worshipPlace") || null,
    caretaker: getCellValue(row, mapping, "caretaker") || null,
    burial_place: getCellValue(row, mapping, "burialPlace") || null,
  };
}

function mapMemberRowToStagingPerson(input: {
  row: string[];
  mapping: HeaderMapping;
  sourceRowIndex: number;
  warnings: GiaPha4StagingWarning[];
}): GiaPha4StagedPersonCandidate | null {
  const externalId = normalizeSourceKey(getRawCellValue(input.row, input.mapping, "externalId"));
  const fullName = getCellValue(input.row, input.mapping, "fullName");

  if (!externalId) {
    input.warnings.push(
      createWarning(
        "A16I3_MISSING_EXTERNAL_ID",
        "Dòng thiếu Mã GP nên chưa tạo ứng viên người.",
        "blocker",
        input.sourceRowIndex,
        "external_id",
      ),
    );
    return null;
  }

  if (!fullName) {
    input.warnings.push(
      createWarning(
        "A16I3_MISSING_FULL_NAME",
        "Dòng thiếu họ tên nên chưa tạo ứng viên người.",
        "blocker",
        input.sourceRowIndex,
        "full_name",
      ),
    );
    return null;
  }

  const birthDate = normalizeGiaPha4DateText(
    getRawCellValue(input.row, input.mapping, "birthDate"),
  );
  const deathDate = normalizeGiaPha4DateText(
    getRawCellValue(input.row, input.mapping, "deathDate"),
  );
  const generation = parseGiaPha4Generation(
    getCellValue(input.row, input.mapping, "generationNumber"),
  );
  const generationText = getCellValue(input.row, input.mapping, "generationNumber");
  const alternateName = getCellValue(input.row, input.mapping, "alternateName");
  const ageAtDeath =
    parseGiaPha4PositiveNumber(getCellValue(input.row, input.mapping, "ageAtDeath")) ??
    null;

  if (birthDate.warning) {
    input.warnings.push(
      createWarning(
        "A16I3_BIRTH_DATE_NEEDS_REVIEW",
        birthDate.warning,
        "warning",
        input.sourceRowIndex,
        "birth_date",
      ),
    );
  }

  if (deathDate.warning) {
    input.warnings.push(
      createWarning(
        "A16I3_DEATH_DATE_NEEDS_REVIEW",
        deathDate.warning,
        "warning",
        input.sourceRowIndex,
        "death_date",
      ),
    );
  }

  if (generationText && !generation) {
    input.warnings.push(
      createWarning(
        "A16I3_GENERATION_NEEDS_REVIEW",
        "Đời thứ chưa phải số nguyên dương nên cần rà soát.",
        "warning",
        input.sourceRowIndex,
        "generation_number",
      ),
    );
  }

  const rawMetadata = buildRawMetadata(input.row, input.mapping);
  const candidate: GiaPha4StagedPersonCandidate = {
    sourceRowIndex: input.sourceRowIndex,
    fingerprint: "",
    externalId,
    fullName,
    displayName: alternateName || fullName,
    alternateName: alternateName || null,
    gender: normalizeGiaPha4Gender(getCellValue(input.row, input.mapping, "gender")),
    birthDateText: birthDate.value ?? null,
    deathDateText: deathDate.value ?? null,
    memorialLunarDate:
      getCellValue(input.row, input.mapping, "memorialLunarDate") || null,
    ageAtDeath,
    isLiving: parseLiving(deathDate.value ?? null),
    birthPlace: rawMetadata.province,
    homeTown:
      [rawMetadata.province, rawMetadata.district, rawMetadata.ward]
        .filter(Boolean)
        .join(", ") || null,
    branchName: null,
    generationNumber: generation ?? null,
    shortBio: getCellValue(input.row, input.mapping, "shortBio") || null,
    notesPrivate:
      [rawMetadata.burial_place, rawMetadata.worship_place, rawMetadata.caretaker]
        .filter(Boolean)
        .join(" | ") || null,
    visibility: "family",
    rawMetadata,
  };

  candidate.fingerprint = personFingerprint(candidate);
  return candidate;
}

function buildParentRelationshipCandidates(input: {
  person: GiaPha4StagedPersonCandidate;
  row: string[];
  mapping: HeaderMapping;
  personByExternalId: Map<string, GiaPha4StagedPersonCandidate>;
  warnings: GiaPha4StagingWarning[];
}) {
  const candidates: GiaPha4StagedRelationshipCandidate[] = [];
  let skippedParentRelationships = 0;

  const addParentCandidate = (
    role: "father" | "mother",
    externalIdKey: "fatherExternalId" | "motherExternalId",
    nameKey: "fatherName" | "motherName",
  ) => {
    const parentExternalId = normalizeSourceKey(
      getRawCellValue(input.row, input.mapping, externalIdKey),
    );
    const parentName = getCellValue(input.row, input.mapping, nameKey);
    const roleLabel = role === "father" ? "Bố" : "Mẹ";

    if (!isValidParentExternalId(parentExternalId, input.person.externalId)) {
      if (!isGiaPha4NullPlaceholder(parentExternalId)) {
        input.warnings.push(
          createWarning(
            "A16I3_PARENT_REFERENCE_SKIPPED",
            `${roleLabel} có Mã GP không hợp lệ hoặc trùng với Mã GP của người con nên đã bỏ qua quan hệ này.`,
            "warning",
            input.person.sourceRowIndex,
            externalIdKey,
          ),
        );
      }
      skippedParentRelationships += 1;
      return;
    }

    const matched = input.personByExternalId.get(parentExternalId) ?? null;
    candidates.push({
      relationshipType: "parent_child",
      sourceRowIndex: input.person.sourceRowIndex,
      sourcePersonFingerprint: matched?.fingerprint ?? externalIdFingerprint(parentExternalId),
      relatedRowIndex: input.person.sourceRowIndex,
      relatedPersonFingerprint: input.person.fingerprint,
      relationshipLabelVi: `${roleLabel}: ${parentName || parentExternalId}`,
      confidence: matched ? "strong" : "ambiguous",
      ambiguityStatus: matched ? "clear" : "missing_reference",
      sourceExternalId: input.person.externalId,
      parentExternalId,
      parentRole: role,
      sourceLabelVi: parentName || null,
    });
  };

  addParentCandidate("father", "fatherExternalId", "fatherName");
  addParentCandidate("mother", "motherExternalId", "motherName");

  return { candidates, skippedParentRelationships };
}

export async function parseGiaPha4XlsxForStaging(
  file: File,
): Promise<GiaPha4StagingParseResult> {
  const fileKind = detectGiaPha4FileKind(file.name);
  const buffer = new Uint8Array(await file.arrayBuffer());
  const sourceFileHash = sha256Hex(buffer);

  if (fileKind === "xls") {
    return {
      ok: false,
      sourceFileHash,
      errorCode: "A16I_XLS_NOT_SUPPORTED_WITHOUT_PARSER_DEPENDENCY",
      messageVi:
        "A-16I hiện chỉ đọc được .xlsx bằng thư viện có sẵn. File .xls cần chuyển sang .xlsx hoặc mở phase thêm parser riêng.",
      warnings: [
        createWarning(
          "A16I_XLS_NOT_SUPPORTED_WITHOUT_PARSER_DEPENDENCY",
          "File .xls chưa được đọc trong A-16I vì repo chưa có parser binary .xls được phê duyệt.",
          "blocker",
        ),
      ],
    };
  }

  if (fileKind !== "xlsx") {
    return {
      ok: false,
      sourceFileHash,
      errorCode: "A16I_UNSUPPORTED_FILE_TYPE",
      messageVi: "Vui lòng chọn file Gia Phả 4 định dạng .xlsx.",
      warnings: [
        createWarning(
          "A16I_UNSUPPORTED_FILE_TYPE",
          "File chưa đúng định dạng .xlsx.",
          "blocker",
        ),
      ],
    };
  }

  let sheets: WorkbookSheet[];
  try {
    sheets = await readWorkbook(buffer);
  } catch {
    return {
      ok: false,
      sourceFileHash,
      errorCode: "A16I_WORKBOOK_STRUCTURE_NOT_RECOGNIZED",
      messageVi: "Không đọc được cấu trúc workbook Gia Phả 4.",
      warnings: [
        createWarning(
          "A16I_WORKBOOK_STRUCTURE_NOT_RECOGNIZED",
          "Không nhận diện được workbook/sheet/header từ file đã tải lên.",
          "blocker",
        ),
      ],
    };
  }

  const sheet = selectMemberSheet(sheets);
  if (!sheet) {
    return {
      ok: false,
      sourceFileHash,
      errorCode: "A16I3_MEMBER_SHEET_MISSING",
      messageVi: 'Không tìm thấy sheet "Thành viên" trong file Gia Phả 4.',
      warnings: [
        createWarning(
          "A16I3_MEMBER_SHEET_MISSING",
          'File .xlsx cần có sheet "Thành viên" để đọc danh sách thành viên.',
          "blocker",
        ),
      ],
    };
  }

  const mapping = findHeaderMapping(sheet);
  if (!mapping) {
    // A16I_HEADER_NOT_RECOGNIZED remains as a compatibility marker for the original A-16I checker.
    return {
      ok: false,
      sourceFileHash,
      errorCode: "A16I3_REQUIRED_HEADERS_MISSING",
      messageVi: 'Sheet "Thành viên" cần có tối thiểu cột "Mã GP" và "Họ tên".',
      warnings: [
        createWarning(
          "A16I3_REQUIRED_HEADERS_MISSING",
          'Không tìm thấy đủ header bắt buộc "Mã GP" và "Họ tên" trong sheet "Thành viên".',
          "blocker",
        ),
      ],
    };
  }

  const warnings: GiaPha4StagingWarning[] = [
    createWarning(
      "A16I3_MEMBER_SHEET_DETECTED",
      'Đã nhận diện sheet "Thành viên" và header Gia Phả 4.',
      "info",
      mapping.headerRowIndex + 1,
      "sheet",
    ),
  ];
  const personCandidates: GiaPha4StagedPersonCandidate[] = [];
  let heldRowCount = 0;
  let peopleRowsRead = 0;

  for (
    let rowIndex = mapping.headerRowIndex + 1;
    rowIndex < sheet.rows.length;
    rowIndex += 1
  ) {
    const row = sheet.rows[rowIndex] ?? [];
    if (row.every((value) => !normalizeGiaPha4NullableText(value))) continue;

    peopleRowsRead += 1;
    const sourceRowIndex = rowIndex + 1;
    const candidate = mapMemberRowToStagingPerson({
      row,
      mapping,
      sourceRowIndex,
      warnings,
    });

    if (!candidate) {
      heldRowCount += 1;
      continue;
    }

    personCandidates.push(candidate);
  }

  const personByExternalId = new Map<string, GiaPha4StagedPersonCandidate>();
  const personByName = new Map<string, GiaPha4StagedPersonCandidate[]>();
  for (const person of personCandidates) {
    personByExternalId.set(person.externalId, person);
    const key = normalizeHeader(person.fullName);
    personByName.set(key, [...(personByName.get(key) ?? []), person]);
  }

  const relationshipCandidates: GiaPha4StagedRelationshipCandidate[] = [];
  let skippedParentRelationships = 0;
  for (const person of personCandidates) {
    const row = sheet.rows[person.sourceRowIndex - 1] ?? [];
    const result = buildParentRelationshipCandidates({
      person,
      row,
      mapping,
      personByExternalId,
      warnings,
    });
    relationshipCandidates.push(...result.candidates);
    skippedParentRelationships += result.skippedParentRelationships;
  }

  const duplicateCandidates: GiaPha4StagedDuplicateCandidate[] = [];
  for (const sameNamePeople of personByName.values()) {
    if (sameNamePeople.length < 2) continue;
    for (const person of sameNamePeople) {
      duplicateCandidates.push({
        sourceRowIndex: person.sourceRowIndex,
        sourcePersonFingerprint: person.fingerprint,
        matchStrength: "weak",
        matchReasonCodes: ["same_full_name_in_source_file"],
      });
    }
  }

  const missingParentReferenceCount = relationshipCandidates.filter(
    (candidate) => candidate.ambiguityStatus === "missing_reference",
  ).length;
  if (missingParentReferenceCount > 0) {
    warnings.push(
      createWarning(
        "A16I3_PARENT_REFERENCE_MISSING",
        "Một số Mã GP Bố/Mẹ không tìm thấy trong sheet Thành viên và cần owner rà soát.",
        "warning",
      ),
    );
  }

  for (const column of mapping.unmappedColumns) {
    warnings.push(
      createWarning(
        "A16I_UNMAPPED_COLUMN",
        `Cột "${column}" chưa được map trong A-16I3.`,
        "info",
        mapping.headerRowIndex + 1,
        "unmapped_column",
      ),
    );
  }

  const errorCount = warnings.filter((item) => item.severity === "blocker").length;
  const parseSummary: GiaPha4ParseSummary = {
    sheetName: sheet.name,
    peopleRowsRead,
    peopleRowsMapped: personCandidates.length,
    parentRelationshipsMapped: relationshipCandidates.length,
    skippedParentRelationships,
    warningCount: warnings.filter((item) => item.severity === "warning").length,
    errorCount,
  };

  const manifestForHash = {
    marker: A16I_GIAPHA4_STAGING_PARSER_MARKER,
    mappingMarker: A16I3_GIAPHA4_COLUMN_MAPPING_MARKER,
    mappingVersion: A16I_MAPPING_VERSION,
    parserVersion: A16I_PARSER_VERSION,
    parseSummary,
    personCandidates,
    relationshipCandidates,
    duplicateCandidates,
    warnings,
  };

  return {
    ok: true,
    sheetName: sheet.name,
    headerRowIndex: mapping.headerRowIndex + 1,
    rowCount: personCandidates.length,
    sourceFileHash,
    previewManifestHash: sha256Hex(JSON.stringify(manifestForHash)),
    personCandidates,
    relationshipCandidates,
    duplicateCandidates,
    warnings,
    unmappedColumns: mapping.unmappedColumns,
    heldRowCount,
    parseSummary,
  };
}

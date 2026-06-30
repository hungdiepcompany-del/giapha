import "server-only";

import JSZip from "jszip";

import { sha256Hex } from "@/lib/family/checksum";
import {
  normalizeGiaPha4DateText,
  normalizeGiaPha4Gender,
  normalizeGiaPha4Text,
  parseGiaPha4Generation,
} from "@/lib/import/giapha4/normalize";
import { detectGiaPha4FileKind } from "@/lib/import/giapha4/parser";

export const A16I_GIAPHA4_STAGING_PARSER_MARKER =
  "A16I_UPLOAD_PARSE_GIAPHA4_MANIFEST_STAGING";

export const A16I_MAPPING_VERSION = "a16i-giapha4-manifest-staging-v1";
export const A16I_PARSER_VERSION = "a16i-jszip-xlsx-v1";
export const GIAPHA4_STAGING_MAX_BYTES = 5 * 1024 * 1024;

export type GiaPha4StagingWarning = {
  warningCode: string;
  severity: "info" | "warning" | "blocker";
  rowIndex: number | null;
  columnKey: string | null;
  messageVi: string;
};

export type GiaPha4StagedPersonCandidate = {
  sourceRowIndex: number;
  fingerprint: string;
  fullName: string;
  displayName: string | null;
  gender: "male" | "female" | "other" | "unknown";
  birthDateText: string | null;
  deathDateText: string | null;
  isLiving: boolean | null;
  birthPlace: string | null;
  homeTown: string | null;
  branchName: string | null;
  generationNumber: number | null;
  shortBio: string | null;
  notesPrivate: string | null;
  visibility: "family";
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
  | "fullName"
  | "displayName"
  | "gender"
  | "birthDate"
  | "deathDate"
  | "isLiving"
  | "birthPlace"
  | "homeTown"
  | "branchName"
  | "generationNumber"
  | "father"
  | "mother"
  | "spouse"
  | "children"
  | "shortBio"
  | "notesPrivate";

type HeaderMapping = {
  headerRowIndex: number;
  columnToKey: Map<number, HeaderKey>;
  unmappedColumns: string[];
};

const HEADER_ALIASES: Record<HeaderKey, string[]> = {
  fullName: [
    "ho ten",
    "ho va ten",
    "hoten",
    "ten",
    "ten thanh vien",
    "thanh vien",
    "full name",
    "name",
  ],
  displayName: [
    "ten thuong goi",
    "biet danh",
    "ten goi",
    "phap danh",
    "ten khac",
    "display name",
  ],
  gender: ["gioi tinh", "phai", "nam nu", "gender", "sex"],
  birthDate: ["ngay sinh", "nam sinh", "sinh", "birth date", "birth"],
  deathDate: ["ngay mat", "nam mat", "mat", "death date", "death"],
  isLiving: ["con song", "da mat", "trang thai", "tinh trang"],
  birthPlace: ["noi sinh", "sinh tai", "birth place"],
  homeTown: ["que quan", "nguyen quan", "home town"],
  branchName: ["chi", "nhanh", "chi nhanh", "branch"],
  generationNumber: ["doi", "the he", "doi thu", "generation"],
  father: ["cha", "bo", "father"],
  mother: ["me", "mother"],
  spouse: ["vo chong", "vo", "chong", "phoi ngau", "spouse"],
  children: ["con", "cac con", "children", "child"],
  shortBio: ["tieu su", "tom tat", "short bio", "bio"],
  notesPrivate: ["ghi chu", "ghi chu rieng", "note", "notes"],
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
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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

  const sharedStrings = sharedStringsXml ? parseSharedStrings(sharedStringsXml) : [];
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

function findHeaderMapping(sheet: WorkbookSheet): HeaderMapping | null {
  const aliasToKey = new Map<string, HeaderKey>();
  for (const [key, aliases] of Object.entries(HEADER_ALIASES) as Array<
    [HeaderKey, string[]]
  >) {
    for (const alias of aliases) aliasToKey.set(normalizeHeader(alias), key);
  }

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

    const hasIdentity = [...columnToKey.values()].includes("fullName");
    if (hasIdentity && columnToKey.size >= 2) {
      return {
        headerRowIndex: rowIndex,
        columnToKey,
        unmappedColumns,
      };
    }
  }

  return null;
}

function getCellValue(
  row: string[],
  mapping: HeaderMapping,
  key: HeaderKey,
) {
  for (const [columnIndex, mappedKey] of mapping.columnToKey.entries()) {
    if (mappedKey === key) return normalizeGiaPha4Text(row[columnIndex]);
  }
  return "";
}

function splitRelationNames(value: string) {
  return normalizeGiaPha4Text(value)
    .split(/[;\n,]+/g)
    .map((item) => normalizeGiaPha4Text(item))
    .filter(Boolean);
}

function parseLiving(value: string, deathDateText: string | null) {
  if (deathDateText) return false;
  const normalized = normalizeHeader(value);
  if (!normalized) return null;
  if (["con song", "song", "dang song", "alive"].includes(normalized)) return true;
  if (["da mat", "mat", "qua doi", "deceased", "dead"].includes(normalized)) {
    return false;
  }
  return null;
}

function personFingerprint(input: {
  fullName: string;
  birthDateText: string | null;
  deathDateText: string | null;
  generationNumber: number | null;
  branchName: string | null;
}) {
  return sha256Hex(
    [
      normalizeHeader(input.fullName),
      input.birthDateText ?? "",
      input.deathDateText ?? "",
      input.generationNumber ?? "",
      normalizeHeader(input.branchName ?? ""),
    ].join("|"),
  );
}

function relatedNameFingerprint(name: string) {
  return sha256Hex(`related-name:${normalizeHeader(name)}`);
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

function selectBestSheet(sheets: WorkbookSheet[]) {
  for (const sheet of sheets) {
    const mapping = findHeaderMapping(sheet);
    if (mapping) return { sheet, mapping };
  }
  return null;
}

function buildRelationshipCandidates(
  person: GiaPha4StagedPersonCandidate,
  row: string[],
  mapping: HeaderMapping,
  personByName: Map<string, GiaPha4StagedPersonCandidate[]>,
) {
  const candidates: GiaPha4StagedRelationshipCandidate[] = [];

  const addCandidate = (
    relationKind: "father" | "mother" | "spouse" | "children",
    relatedName: string,
  ) => {
    const matches = personByName.get(normalizeHeader(relatedName)) ?? [];
    const matched = matches.length === 1 ? matches[0] : null;
    const isMissing = matches.length === 0;
    const isAmbiguous = matches.length > 1;
    const relationshipType =
      relationKind === "spouse" ? "spouse_couple" : "parent_child";
    const prefixByKind = {
      father: "Cha",
      mother: "Mẹ",
      spouse: "Vợ/chồng",
      children: "Con",
    } as const;

    candidates.push({
      relationshipType,
      sourceRowIndex: person.sourceRowIndex,
      sourcePersonFingerprint: person.fingerprint,
      relatedRowIndex: matched?.sourceRowIndex ?? null,
      relatedPersonFingerprint: matched?.fingerprint ?? relatedNameFingerprint(relatedName),
      relationshipLabelVi: `${prefixByKind[relationKind]}: ${relatedName}`,
      confidence: matched ? "medium" : "ambiguous",
      ambiguityStatus: matched
        ? "clear"
        : isMissing
          ? "missing_reference"
          : isAmbiguous
            ? "ambiguous"
            : "ambiguous",
    });
  };

  for (const father of splitRelationNames(getCellValue(row, mapping, "father"))) {
    addCandidate("father", father);
  }
  for (const mother of splitRelationNames(getCellValue(row, mapping, "mother"))) {
    addCandidate("mother", mother);
  }
  for (const spouse of splitRelationNames(getCellValue(row, mapping, "spouse"))) {
    addCandidate("spouse", spouse);
  }
  for (const child of splitRelationNames(getCellValue(row, mapping, "children"))) {
    addCandidate("children", child);
  }

  return candidates;
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

  const selected = selectBestSheet(sheets);
  if (!selected) {
    return {
      ok: false,
      sourceFileHash,
      errorCode: "A16I_HEADER_NOT_RECOGNIZED",
      messageVi: "Không nhận diện được header Gia Phả 4 trong workbook.",
      warnings: [
        createWarning(
          "A16I_HEADER_NOT_RECOGNIZED",
          "Không tìm thấy dòng header có cột họ tên và dữ liệu Gia Phả 4 tối thiểu.",
          "blocker",
        ),
      ],
    };
  }

  const { sheet, mapping } = selected;
  const warnings: GiaPha4StagingWarning[] = [];
  const personCandidates: GiaPha4StagedPersonCandidate[] = [];
  let heldRowCount = 0;

  for (let rowIndex = mapping.headerRowIndex + 1; rowIndex < sheet.rows.length; rowIndex += 1) {
    const row = sheet.rows[rowIndex] ?? [];
    if (row.every((value) => !normalizeGiaPha4Text(value))) continue;

    const fullName = getCellValue(row, mapping, "fullName");
    const sourceRowIndex = rowIndex + 1;

    if (!fullName) {
      heldRowCount += 1;
      warnings.push(
        createWarning(
          "A16I_MISSING_FULL_NAME",
          "Dòng thiếu họ tên nên chỉ giữ lại dưới dạng cảnh báo, chưa tạo ứng viên người.",
          "blocker",
          sourceRowIndex,
          "full_name",
        ),
      );
      continue;
    }

    const birthDate = normalizeGiaPha4DateText(getCellValue(row, mapping, "birthDate"));
    const deathDate = normalizeGiaPha4DateText(getCellValue(row, mapping, "deathDate"));
    const generation = parseGiaPha4Generation(
      getCellValue(row, mapping, "generationNumber"),
    );
    const generationText = getCellValue(row, mapping, "generationNumber");

    if (birthDate.warning) {
      warnings.push(
        createWarning(
          "A16I_BIRTH_DATE_NEEDS_REVIEW",
          birthDate.warning,
          "warning",
          sourceRowIndex,
          "birth_date",
        ),
      );
    }
    if (deathDate.warning) {
      warnings.push(
        createWarning(
          "A16I_DEATH_DATE_NEEDS_REVIEW",
          deathDate.warning,
          "warning",
          sourceRowIndex,
          "death_date",
        ),
      );
    }
    if (generationText && !generation) {
      warnings.push(
        createWarning(
          "A16I_GENERATION_NEEDS_REVIEW",
          "Đời/thế hệ chưa phải số nguyên dương nên cần rà soát.",
          "warning",
          sourceRowIndex,
          "generation_number",
        ),
      );
    }

    const candidate: GiaPha4StagedPersonCandidate = {
      sourceRowIndex,
      fingerprint: "",
      fullName,
      displayName: getCellValue(row, mapping, "displayName") || null,
      gender: normalizeGiaPha4Gender(getCellValue(row, mapping, "gender")),
      birthDateText: birthDate.value ?? null,
      deathDateText: deathDate.value ?? null,
      isLiving: parseLiving(
        getCellValue(row, mapping, "isLiving"),
        deathDate.value ?? null,
      ),
      birthPlace: getCellValue(row, mapping, "birthPlace") || null,
      homeTown: getCellValue(row, mapping, "homeTown") || null,
      branchName: getCellValue(row, mapping, "branchName") || null,
      generationNumber: generation ?? null,
      shortBio: getCellValue(row, mapping, "shortBio") || null,
      notesPrivate: getCellValue(row, mapping, "notesPrivate") || null,
      visibility: "family",
    };
    candidate.fingerprint = personFingerprint(candidate);
    personCandidates.push(candidate);
  }

  const personByName = new Map<string, GiaPha4StagedPersonCandidate[]>();
  for (const person of personCandidates) {
    const key = normalizeHeader(person.fullName);
    personByName.set(key, [...(personByName.get(key) ?? []), person]);
  }

  const relationshipCandidates: GiaPha4StagedRelationshipCandidate[] = [];
  for (const person of personCandidates) {
    const row = sheet.rows[person.sourceRowIndex - 1] ?? [];
    relationshipCandidates.push(
      ...buildRelationshipCandidates(person, row, mapping, personByName),
    );
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

  const ambiguousRelationshipCount = relationshipCandidates.filter(
    (candidate) => candidate.ambiguityStatus !== "clear",
  ).length;
  if (ambiguousRelationshipCount > 0) {
    warnings.push(
      createWarning(
        "A16I_RELATIONSHIP_REFERENCE_NEEDS_REVIEW",
        "Một số quan hệ cha/mẹ/vợ/chồng/con chưa khớp chắc chắn với một dòng trong file và cần owner rà soát.",
        "warning",
      ),
    );
  }

  for (const column of mapping.unmappedColumns) {
    warnings.push(
      createWarning(
        "A16I_UNMAPPED_COLUMN",
        `Cột "${column}" chưa được map trong A-16I.`,
        "info",
        mapping.headerRowIndex + 1,
        "unmapped_column",
      ),
    );
  }

  const manifestForHash = {
    marker: A16I_GIAPHA4_STAGING_PARSER_MARKER,
    mappingVersion: A16I_MAPPING_VERSION,
    parserVersion: A16I_PARSER_VERSION,
    sheetName: sheet.name,
    rowCount: personCandidates.length,
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
  };
}

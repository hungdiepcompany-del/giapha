import "server-only";

import {
  buildImportReviewPackFromManifest,
  type ImportReviewPack,
} from "@/lib/import/giapha4/import-review-pack-service";
import {
  getImportManifest,
  type ImportManifestReadResult,
} from "@/lib/import/giapha4/manifest-read-service";

export const A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_MARKER =
  "A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE";

export const A16P_REQUIRED_OFFICIAL_IMPORT_MARKER =
  "APPROVE_A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE";

export type OfficialImportPreflightGate = {
  marker: typeof A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_MARKER;
  sessionId: string | null;
  readOnly: true;
  canOpenOfficialImport: false;
  officialImportEnabled: false;
  requiredFutureMarker: typeof A16P_REQUIRED_OFFICIAL_IMPORT_MARKER;
  requiredBeforeRuntime: string[];
  noGoReasons: string[];
  message: string;
  reviewPackReadiness: ImportReviewPack["readiness"];
};

const requiredBeforeRuntime = [
  "Owner rà soát số lượng staging đã đọc từ UI.",
  "Validation errors phải được xử lý hoặc owner chấp nhận no-go.",
  "Duplicate/conflict phải có quyết định owner.",
  "Thiết kế rollback phải được chấp nhận.",
  "Thiết kế audit/revision phải được chấp nhận.",
  "Thiết kế transaction all-or-nothing phải được chấp nhận.",
  "Phase runtime riêng phải được phê duyệt bằng marker tương lai.",
];

export function buildOfficialImportPreflightGateFromManifest(
  manifest: ImportManifestReadResult,
): OfficialImportPreflightGate {
  const reviewPack = buildImportReviewPackFromManifest(manifest);
  const noGoReasons: string[] = [
    "A-16N chỉ là cổng khóa read-only, chưa mở nhập chính thức.",
    `Thiếu marker tương lai ${A16P_REQUIRED_OFFICIAL_IMPORT_MARKER}.`,
  ];

  if (!manifest.ok || !manifest.session) {
    noGoReasons.push("Chưa có import session staging hợp lệ để owner rà soát.");
  }
  if (reviewPack.validationSummary.errorCount > 0) {
    noGoReasons.push("Còn lỗi validation trong dữ liệu staging.");
  }
  if (reviewPack.dryRunSummary.blockedByErrorCount > 0) {
    noGoReasons.push("Dry-run preview còn lỗi chặn.");
  }
  if (reviewPack.readiness !== "READY_FOR_OWNER_REVIEW") {
    noGoReasons.push("Review pack chưa ở trạng thái sẵn sàng để owner rà soát.");
  }

  return {
    marker: A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_MARKER,
    sessionId: manifest.session?.id ?? null,
    readOnly: true,
    canOpenOfficialImport: false,
    officialImportEnabled: false,
    requiredFutureMarker: A16P_REQUIRED_OFFICIAL_IMPORT_MARKER,
    requiredBeforeRuntime,
    noGoReasons,
    message:
      "Nhập chính thức chưa được mở. Dữ liệu staging đã đọc được nhưng chưa ghi vào cây gia phả thật.",
    reviewPackReadiness: reviewPack.readiness,
  };
}

export async function getOfficialImportPreflightGate(sessionId: string) {
  const manifest = await getImportManifest(sessionId);

  return {
    ok: manifest.ok,
    httpStatus: manifest.httpStatus,
    message: manifest.message,
    gate: buildOfficialImportPreflightGateFromManifest(manifest),
  };
}

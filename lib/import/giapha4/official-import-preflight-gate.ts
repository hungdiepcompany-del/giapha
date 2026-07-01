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

export const A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER =
  "APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_<SESSION_ID>";

export type OfficialImportPreflightGate = {
  marker: typeof A16N_LOCKED_OFFICIAL_IMPORT_PREFLIGHT_GATE_MARKER;
  sessionId: string | null;
  readOnly: true;
  canOpenOfficialImport: false;
  officialImportEnabled: false;
  requiredFutureMarker: typeof A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER;
  requiredBeforeRuntime: string[];
  noGoReasons: string[];
  message: string;
  reviewPackReadiness: ImportReviewPack["readiness"];
};

const requiredBeforeRuntime = [
  "Phải có session id cụ thể cho phiên nhập được duyệt.",
  "Validation errors phải bằng 0.",
  "Dry-run blockers phải bằng 0.",
  "Rollback plan phải được owner rà soát.",
  "Audit/revision plan phải được owner rà soát.",
  "Owner phải phê duyệt phase chạy thật bằng marker session-specific A-16R.",
];

export function buildOfficialImportPreflightGateFromManifest(
  manifest: ImportManifestReadResult,
): OfficialImportPreflightGate {
  const reviewPack = buildImportReviewPackFromManifest(manifest);
  const noGoReasons: string[] = [
    "Runtime candidate và transaction helper đã được chuẩn bị/verify, nhưng chưa có phê duyệt thực thi cho phiên nhập cụ thể.",
    `Marker tiếp theo phải là ${A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER}.`,
  ];

  if (!manifest.ok || !manifest.session) {
    noGoReasons.push("Chưa có import session staging hợp lệ để owner rà soát.");
  }
  if (reviewPack.validationSummary.errorCount > 0) {
    noGoReasons.push("Validation errors chưa bằng 0.");
  }
  if (reviewPack.dryRunSummary.blockedByErrorCount > 0) {
    noGoReasons.push("Dry-run blockers chưa bằng 0.");
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
    requiredFutureMarker: A16R_REQUIRED_OFFICIAL_IMPORT_SESSION_MARKER,
    requiredBeforeRuntime,
    noGoReasons,
    message:
      "Nhập chính thức vẫn đang khóa. Runtime và transaction helper đã được chuẩn bị, nhưng chưa có phê duyệt thực thi cho phiên nhập cụ thể. Cần xác nhận session id, lỗi dữ liệu = 0, dry-run không còn blocker, rollback/audit đã rà soát trước khi mở phase chạy thật.",
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

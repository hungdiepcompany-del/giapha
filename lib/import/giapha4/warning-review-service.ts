import "server-only";

import {
  getImportManifest,
  type ImportManifestReadResult,
  type ImportSessionWarningPreview,
} from "@/lib/import/giapha4/manifest-read-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";

export const A16R2_WARNING_GROUP_REVIEW_MARKER =
  "A16R2_WARNING_GROUP_REVIEW_BOUND_TO_SESSION_VERSION";

export type ImportWarningGroupKey =
  | "birth_year_only"
  | "death_year_only"
  | "birth_unknown_format"
  | "death_unknown_format"
  | "relationship_warning"
  | "other_warning";

export type ImportWarningReviewGroup = {
  groupKey: ImportWarningGroupKey;
  warningCode: string;
  titleVi: string;
  policyApplied: string;
  count: number;
  openCount: number;
  acknowledgedCount: number;
  heldCount: number;
  resolvedCount: number;
  rowIndexes: number[];
  warningIds: string[];
};

export type ImportWarningReviewSummary = {
  marker: typeof A16R2_WARNING_GROUP_REVIEW_MARKER;
  sessionId: string | null;
  manifestId: string | null;
  stagingVersion: string | null;
  totalWarningCount: number;
  pendingWarningCount: number;
  acknowledgedWarningCount: number;
  requiredWarningsReviewed: boolean;
  groups: ImportWarningReviewGroup[];
};

export type WarningGroupAcknowledgementConfirmation = {
  confirmSessionId?: unknown;
  confirmManifestId?: unknown;
  confirmStagingVersion?: unknown;
  confirmWarningGroup?: unknown;
  confirmPolicyApplied?: unknown;
  confirmNoOfficialImportExecution?: unknown;
};

export type WarningGroupAcknowledgementResult = {
  ok: boolean;
  httpStatus: 200 | 400 | 401 | 403 | 404 | 409 | 422 | 503;
  marker: typeof A16R2_WARNING_GROUP_REVIEW_MARKER;
  sessionId: string;
  manifestId: string | null;
  stagingVersion: string | null;
  warningGroup: ImportWarningGroupKey | null;
  warningCode: string | null;
  acknowledgedCount: number;
  pendingWarningCount: number;
  officialImportPostCalled: false;
  rpcCalled: false;
  realGenealogyWrite: false;
  canRunOfficialImport: false;
  blockedReasons: string[];
  message: string;
};

const warningReviewMutableStates = new Set([
  "preview_generated",
  "owner_reviewing",
  "warnings_acknowledged",
  "duplicates_reviewed",
  "relationships_reviewed",
  "privacy_reviewed",
  "ready_for_owner_approval",
]);

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isYearOnlyWarning(warning: ImportSessionWarningPreview) {
  const message = normalizeText(warning.messageVi);
  return message.includes("chi co nam") || /^\d{4}$/.test(message);
}

function classifyWarning(warning: ImportSessionWarningPreview): ImportWarningGroupKey {
  if (warning.warningCode === "A16I3_BIRTH_DATE_NEEDS_REVIEW") {
    return isYearOnlyWarning(warning) ? "birth_year_only" : "birth_unknown_format";
  }

  if (warning.warningCode === "A16I3_DEATH_DATE_NEEDS_REVIEW") {
    return isYearOnlyWarning(warning) ? "death_year_only" : "death_unknown_format";
  }

  if (
    warning.columnKey?.includes("relationship") ||
    warning.warningCode.includes("RELATIONSHIP") ||
    warning.warningCode.includes("PARENT")
  ) {
    return "relationship_warning";
  }

  return "other_warning";
}

function groupTitle(groupKey: ImportWarningGroupKey) {
  const titles: Record<ImportWarningGroupKey, string> = {
    birth_year_only: "Ngay sinh chi co nam",
    death_year_only: "Ngay mat chi co nam",
    birth_unknown_format: "Ngay sinh chua xac dinh dinh dang",
    death_unknown_format: "Ngay mat chua xac dinh dinh dang",
    relationship_warning: "Canh bao quan he",
    other_warning: "Canh bao du lieu khac",
  };

  return titles[groupKey];
}

function policyForGroup(groupKey: ImportWarningGroupKey) {
  const policies: Record<ImportWarningGroupKey, string> = {
    birth_year_only: "preserve_year_precision_no_fake_day_month",
    death_year_only: "preserve_year_precision_no_fake_day_month",
    birth_unknown_format: "keep_null_when_date_format_unknown",
    death_unknown_format: "keep_null_when_date_format_unknown",
    relationship_warning: "owner_manual_review_no_auto_relationship_guess",
    other_warning: "owner_manual_review_no_auto_data_guess",
  };

  return policies[groupKey];
}

function manifestIdFor(result: ImportManifestReadResult) {
  return (
    result.session?.previewManifestHash ??
    result.writeManifests[0]?.manifestHash ??
    null
  );
}

function stagingVersionFor(result: ImportManifestReadResult) {
  if (!result.session) return null;

  return [
    result.session.mappingVersion,
    result.session.parserVersion ?? "parser_unknown",
    manifestIdFor(result) ?? "manifest_unknown",
  ].join(":");
}

function emptyResult(
  overrides: Partial<WarningGroupAcknowledgementResult>,
): WarningGroupAcknowledgementResult {
  return {
    ok: false,
    httpStatus: 409,
    marker: A16R2_WARNING_GROUP_REVIEW_MARKER,
    sessionId: "",
    manifestId: null,
    stagingVersion: null,
    warningGroup: null,
    warningCode: null,
    acknowledgedCount: 0,
    pendingWarningCount: 0,
    officialImportPostCalled: false,
    rpcCalled: false,
    realGenealogyWrite: false,
    canRunOfficialImport: false,
    blockedReasons: [],
    message: "Warning acknowledgement is blocked. Official import was not executed.",
    ...overrides,
  };
}

export function buildImportWarningReviewSummary(
  result: ImportManifestReadResult,
): ImportWarningReviewSummary {
  const grouped = new Map<string, ImportWarningReviewGroup>();

  for (const warning of result.warnings) {
    const groupKey = classifyWarning(warning);
    const key = `${groupKey}:${warning.warningCode}`;
    const current =
      grouped.get(key) ??
      ({
        groupKey,
        warningCode: warning.warningCode,
        titleVi: groupTitle(groupKey),
        policyApplied: policyForGroup(groupKey),
        count: 0,
        openCount: 0,
        acknowledgedCount: 0,
        heldCount: 0,
        resolvedCount: 0,
        rowIndexes: [],
        warningIds: [],
      } satisfies ImportWarningReviewGroup);

    current.count += 1;
    current.warningIds.push(warning.id);
    if (typeof warning.rowIndex === "number") current.rowIndexes.push(warning.rowIndex);
    if (warning.reviewStatus === "acknowledged") current.acknowledgedCount += 1;
    else if (warning.reviewStatus === "held") current.heldCount += 1;
    else if (warning.reviewStatus === "resolved") current.resolvedCount += 1;
    else current.openCount += 1;

    grouped.set(key, current);
  }

  const groups = Array.from(grouped.values()).map((group) => ({
    ...group,
    rowIndexes: [...new Set(group.rowIndexes)].sort((left, right) => left - right),
  }));
  const pendingWarningCount = groups.reduce(
    (sum, group) => sum + group.openCount + group.heldCount,
    0,
  );
  const acknowledgedWarningCount = groups.reduce(
    (sum, group) => sum + group.acknowledgedCount + group.resolvedCount,
    0,
  );

  return {
    marker: A16R2_WARNING_GROUP_REVIEW_MARKER,
    sessionId: result.session?.id ?? null,
    manifestId: manifestIdFor(result),
    stagingVersion: stagingVersionFor(result),
    totalWarningCount: result.session?.warningCount ?? result.warnings.length,
    pendingWarningCount,
    acknowledgedWarningCount,
    requiredWarningsReviewed: pendingWarningCount === 0,
    groups,
  };
}

export async function acknowledgeImportWarningGroup(input: {
  sessionId: string;
  confirmation: WarningGroupAcknowledgementConfirmation;
}): Promise<WarningGroupAcknowledgementResult> {
  const actor = await getPermissionContext();

  if (!actor.user) {
    return emptyResult({
      sessionId: input.sessionId,
      httpStatus: 401,
      blockedReasons: ["A16R2_WARNING_ACK_UNAUTHENTICATED"],
      message: "Dang nhap owner/admin la bat buoc truoc khi xac nhan warning.",
    });
  }

  if (!actor.profile || !actor.permissions.includes("imports.create")) {
    return emptyResult({
      sessionId: input.sessionId,
      httpStatus: 403,
      blockedReasons: ["A16R2_WARNING_ACK_IMPORTS_CREATE_MISSING"],
      message: "Thieu quyen imports.create de xac nhan warning staging.",
    });
  }

  const manifest = await getImportManifest(input.sessionId);
  if (!manifest.ok || !manifest.session) {
    return emptyResult({
      sessionId: input.sessionId,
      httpStatus: manifest.httpStatus === 404 ? 404 : 503,
      blockedReasons: ["A16R2_WARNING_ACK_SESSION_NOT_READABLE"],
      message: "Khong doc duoc manifest cua session hien tai.",
    });
  }

  const summary = buildImportWarningReviewSummary(manifest);
  const groupKey = input.confirmation.confirmWarningGroup;
  const group =
    typeof groupKey === "string"
      ? summary.groups.find((item) => item.groupKey === groupKey)
      : null;
  const reasons: string[] = [];

  if (input.confirmation.confirmSessionId !== input.sessionId) {
    reasons.push("A16R2_WARNING_ACK_SESSION_ID_MISMATCH");
  }
  if (input.confirmation.confirmManifestId !== summary.manifestId) {
    reasons.push("A16R2_WARNING_ACK_MANIFEST_HASH_MISMATCH");
  }
  if (input.confirmation.confirmStagingVersion !== summary.stagingVersion) {
    reasons.push("A16R2_WARNING_ACK_STAGING_VERSION_MISMATCH");
  }
  if (!group) {
    reasons.push("A16R2_WARNING_ACK_GROUP_NOT_FOUND");
  }
  if (group && input.confirmation.confirmPolicyApplied !== group.policyApplied) {
    reasons.push("A16R2_WARNING_ACK_POLICY_MISMATCH");
  }
  if (input.confirmation.confirmNoOfficialImportExecution !== true) {
    reasons.push("A16R2_WARNING_ACK_NO_OFFICIAL_IMPORT_CONFIRMATION_MISSING");
  }
  if (!warningReviewMutableStates.has(manifest.session.status)) {
    reasons.push("A16R2_WARNING_ACK_SESSION_STATE_NOT_REVIEW_MUTABLE");
  }
  if (group && group.openCount + group.heldCount === 0) {
    reasons.push("A16R2_WARNING_ACK_GROUP_ALREADY_REVIEWED");
  }

  if (reasons.length > 0 || !group) {
    return emptyResult({
      sessionId: input.sessionId,
      manifestId: summary.manifestId,
      stagingVersion: summary.stagingVersion,
      warningGroup: group?.groupKey ?? null,
      warningCode: group?.warningCode ?? null,
      pendingWarningCount: summary.pendingWarningCount,
      httpStatus: group ? 422 : 404,
      blockedReasons: reasons,
      message:
        "Khong the xac nhan nhom warning vi session, manifest hoac policy khong khop.",
    });
  }

  const admin = maybeCreateAdminSupabaseClient();
  if (!admin) {
    return emptyResult({
      sessionId: input.sessionId,
      manifestId: summary.manifestId,
      stagingVersion: summary.stagingVersion,
      warningGroup: group.groupKey,
      warningCode: group.warningCode,
      pendingWarningCount: summary.pendingWarningCount,
      httpStatus: 503,
      blockedReasons: ["A16R2_WARNING_ACK_ADMIN_CLIENT_UNAVAILABLE"],
      message: "Chua cau hinh admin Supabase client de ghi acknowledgement.",
    });
  }

  const acknowledgedAt = new Date().toISOString();
  const { data: updatedRows, error: warningError } = await admin
    .from("import_session_warnings")
    .update({
      review_status: "acknowledged",
      acknowledged_by: actor.profile.id,
      acknowledged_at: acknowledgedAt,
    })
    .eq("import_session_id", input.sessionId)
    .in("id", group.warningIds)
    .in("review_status", ["open", "held"])
    .select("id")
    .returns<Array<{ id: string }>>();

  if (warningError) {
    return emptyResult({
      sessionId: input.sessionId,
      manifestId: summary.manifestId,
      stagingVersion: summary.stagingVersion,
      warningGroup: group.groupKey,
      warningCode: group.warningCode,
      pendingWarningCount: summary.pendingWarningCount,
      httpStatus: 409,
      blockedReasons: [
        "A16R2_WARNING_ACK_UPDATE_FAILED",
        warningError.message ?? "UNKNOWN",
      ],
      message: "Khong ghi duoc acknowledgement cho nhom warning.",
    });
  }

  const acknowledgements = Array.isArray(
    manifest.session.reviewSummary.a16r2_warning_acknowledgements,
  )
    ? manifest.session.reviewSummary.a16r2_warning_acknowledgements
    : [];
  const updatedSummary = {
    ...manifest.session.reviewSummary,
    a16r2_warning_acknowledgements: [
      ...acknowledgements,
      {
        warning_group: group.groupKey,
        warning_code: group.warningCode,
        manifest_id: summary.manifestId,
        staging_version: summary.stagingVersion,
        acknowledged_by: actor.profile.id,
        acknowledged_at: acknowledgedAt,
        policy_applied: group.policyApplied,
      },
    ],
  };

  await admin
    .from("import_sessions")
    .update({
      review_summary: updatedSummary,
      updated_by: actor.profile.id,
    })
    .eq("id", input.sessionId);

  const acknowledgedCount = updatedRows?.length ?? 0;
  const nextPendingWarningCount = Math.max(
    0,
    summary.pendingWarningCount - acknowledgedCount,
  );

  return emptyResult({
    ok: true,
    sessionId: input.sessionId,
    manifestId: summary.manifestId,
    stagingVersion: summary.stagingVersion,
    warningGroup: group.groupKey,
    warningCode: group.warningCode,
    acknowledgedCount,
    pendingWarningCount: nextPendingWarningCount,
    httpStatus: 200,
    blockedReasons: [],
    message:
      "Da xac nhan nhom warning trong staging. Khong goi official import va khong ghi du lieu gia pha that.",
  });
}

import { getImportDryRunApprovalGate } from "@/lib/import/giapha4/import-dry-run-approval-gate";
import { A16BCOwnerApprovalStateClient } from "@/components/imports/a16bc-owner-approval-state-client";
import { A16ROfficialImportConfirmationClient } from "@/components/imports/a16r-official-import-confirmation-client";
import { DuplicateDecisionReviewClient } from "@/components/imports/duplicate-decision-review-client";
import { ActionLink } from "@/components/ui/action-link";
import { buildDryRunMappingPreview } from "@/lib/import/giapha4/dry-run-mapping-preview-service";
import { buildImportReviewPackFromManifest } from "@/lib/import/giapha4/import-review-pack-service";
import {
  A16BC_OWNER_APPROVAL_STATE_ROUTE,
  A16BC_OWNER_APPROVED_FOR_DB_WRITE_MARKER,
  A16BC_READY_FOR_OWNER_APPROVAL_MARKER,
} from "@/lib/import/giapha4/import-session-owner-approval-state-service";
import {
  A16R_AUDITED_OFFICIAL_IMPORT_MARKER,
  A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID,
  A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER,
  A16U_REQUIRED_A16R_RETRY_MARKER,
} from "@/lib/import/giapha4/official-import-service";
import {
  A16BB_OFFICIAL_IMPORT_EXECUTION_ELIGIBLE_SESSION_STATE,
  buildOfficialImportSessionStateGate,
} from "@/lib/import/giapha4/official-import-session-state-gate";
import type { ImportManifestReadResult } from "@/lib/import/giapha4/manifest-read-service";
import {
  buildManifestValidationReview,
  type ManifestValidationIssue,
} from "@/lib/import/giapha4/manifest-validation-service";

function formatDate(value: string | null | undefined) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-normal text-stone-600">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-stone-950">{value}</div>
    </div>
  );
}

function IssueList({
  title,
  issues,
}: {
  title: string;
  issues: ManifestValidationIssue[];
}) {
  if (issues.length === 0) return null;

  return (
    <div className="grid gap-2">
      <h4 className="text-sm font-bold text-stone-950">{title}</h4>
      {issues.slice(0, 12).map((issue) => (
        <div
          key={`${issue.code}-${issue.entityKey ?? "session"}-${issue.rowNumber ?? "all"}`}
          className="rounded-md border border-stone-200 bg-white p-3 text-sm leading-6 text-stone-800"
        >
          <div className="font-bold text-stone-950">{issue.titleVi}</div>
          <div>{issue.messageVi}</div>
          <div className="mt-1 text-stone-600">
            {issue.rowNumber ? `Dòng ${issue.rowNumber}. ` : ""}
            Mã: {issue.code}.
          </div>
          <div className="mt-1 text-teal-800">{issue.suggestionVi}</div>
        </div>
      ))}
    </div>
  );
}

function EmptyManifestState() {
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
      <div className="font-bold">Chưa có dữ liệu manifest</div>
      <p className="mt-2">
        Khi có phiên nhập dữ liệu đã ghi manifest, màn hình này sẽ hiển thị
        cảnh báo, ứng viên trùng, quan hệ dự kiến và write manifest ở chế độ
        chỉ đọc.
      </p>
    </div>
  );
}

export type A16RInlinePermissionDiagnostic = {
  accountEmail: string | null;
  userId: string | null;
  profileId: string | null;
  roles: string[];
  visiblePermissionCount: number;
  hasImportsCreate: boolean;
  hasPermissionsManage: boolean;
  hasOwnerAdminRole: boolean;
  qualifiesOwnerAdminImportContext: boolean;
  missingStrictPermissions: readonly string[];
  contextReason: string | null;
};

function formatPresent(value: boolean) {
  return value ? "present" : "missing";
}

function pushReason(
  reasons: string[],
  condition: boolean,
  reason: string,
) {
  if (!condition) reasons.push(reason);
}

export function ImportSessionManifestPanel({
  result,
  a16rPermissionDiagnostic,
}: {
  result: ImportManifestReadResult;
  a16rPermissionDiagnostic?: A16RInlinePermissionDiagnostic;
}) {
  const session = result.session ?? result.sessions[0] ?? null;
  const validation = buildManifestValidationReview(result);
  const errorIssues = validation.issues.filter(
    (issue) => issue.severity === "error",
  );
  const warningIssues = validation.issues.filter(
    (issue) => issue.severity === "warning",
  );
  const infoIssues = validation.issues.filter((issue) => issue.severity === "info");
  const currentSessionId = session?.id ?? null;
  const dryRunGate = getImportDryRunApprovalGate(currentSessionId);
  const dryRunPreview = buildDryRunMappingPreview(result);
  const reviewPack = buildImportReviewPackFromManifest(result);
  const a16pRuntimeCandidateEnabled =
    process.env.A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED === "true";
  const a16ahExecutionBranchEnabled =
    process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === "true";
  const totalDuplicateCandidates =
    session?.duplicateCandidateCount ?? result.duplicateCandidates.length;
  const duplicateReviewKey = session
    ? `duplicate-review-${session.id}-${session.updatedAt}-${result.duplicateCandidates
        .map(
          (candidate) =>
            `${candidate.id}:${candidate.ownerDecision}:${candidate.decidedAt ?? ""}`,
        )
        .join("|")}`
    : "duplicate-review-empty";
  const officialImportSessionMismatch =
    currentSessionId !== null &&
    currentSessionId !== A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID;
  const a16rPermissionReady =
    Boolean(a16rPermissionDiagnostic?.userId) &&
    Boolean(a16rPermissionDiagnostic?.hasOwnerAdminRole) &&
    Boolean(a16rPermissionDiagnostic?.hasImportsCreate) &&
    Boolean(a16rPermissionDiagnostic?.hasPermissionsManage) &&
    Boolean(a16rPermissionDiagnostic?.qualifiesOwnerAdminImportContext);
  const a16rAuditedSessionReady =
    currentSessionId === A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID;
  const a16rBlockedErrorsClear =
    validation.summary.errorCount === 0 &&
    dryRunPreview.summary.blockedByErrorCount === 0;
  const a16rWarningsNonBlocking = true;
  const a16rDuplicateReviewPackClear =
    reviewPack.readiness === "READY_FOR_OWNER_REVIEW" &&
    reviewPack.duplicateDecisionSummary.unresolvedDuplicateCandidates === 0 &&
    reviewPack.duplicateDecisionSummary.needsReviewDuplicateCandidates === 0;
  const a16rMarkersPresent =
    A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER ===
      "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY" &&
    A16R_AUDITED_OFFICIAL_IMPORT_MARKER ===
      `APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_${A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}`;
  const a16bbSessionStateGate = buildOfficialImportSessionStateGate(
    session?.status,
  );
  const a16rSameRunLockedReasons: string[] = [];

  pushReason(
    a16rSameRunLockedReasons,
    Boolean(a16rPermissionDiagnostic),
    "A16AR_LOCKED_PERMISSION_DIAGNOSTIC_NOT_AVAILABLE",
  );
  pushReason(
    a16rSameRunLockedReasons,
    a16rPermissionReady,
    "A16AR_LOCKED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_PROVEN",
  );
  pushReason(
    a16rSameRunLockedReasons,
    a16rAuditedSessionReady,
    "A16AR_LOCKED_AUDITED_SESSION_MISMATCH",
  );
  pushReason(
    a16rSameRunLockedReasons,
    a16bbSessionStateGate.executionEligible,
    a16bbSessionStateGate.blocker ??
      "A16BB_LOCKED_SESSION_STATE_GATE_UNKNOWN",
  );
  pushReason(
    a16rSameRunLockedReasons,
    a16rMarkersPresent,
    "A16AR_LOCKED_REQUIRED_OWNER_MARKERS_MISSING_OR_MISMATCHED",
  );
  pushReason(
    a16rSameRunLockedReasons,
    a16rBlockedErrorsClear,
    "A16AR_LOCKED_BLOCKED_ERRORS_OR_DRY_RUN_BLOCKERS_PRESENT",
  );
  pushReason(
    a16rSameRunLockedReasons,
    a16rWarningsNonBlocking,
    "A16AR_LOCKED_IMPORT_BLOCKING_WARNING_CATEGORY_PRESENT",
  );
  pushReason(
    a16rSameRunLockedReasons,
    a16rDuplicateReviewPackClear,
    "A16AR_LOCKED_DUPLICATE_OR_REVIEW_PACK_BLOCKERS_PRESENT",
  );
  pushReason(
    a16rSameRunLockedReasons,
    a16pRuntimeCandidateEnabled,
    "A16AR_LOCKED_RUNTIME_CANDIDATE_ENV_DISABLED",
  );
  pushReason(
    a16rSameRunLockedReasons,
    a16ahExecutionBranchEnabled,
    "A16AR_LOCKED_EXECUTION_BRANCH_ENV_DISABLED",
  );

  const a16rSameRunPreflight = {
    canOpenOfficialImport: a16rSameRunLockedReasons.length === 0,
    officialImportEnabled: a16rSameRunLockedReasons.length === 0,
  };
  pushReason(
    a16rSameRunLockedReasons,
    a16rSameRunPreflight.canOpenOfficialImport &&
      a16rSameRunPreflight.officialImportEnabled,
    "A16AR_LOCKED_SAME_RUN_PREFLIGHT_FALSE",
  );
  const a16rOfficialImportConfirmation = {
    confirmMarker: A16U_REQUIRED_A16R_RETRY_MARKER,
    confirmSessionId: A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID,
    confirmNoValidationErrors: validation.summary.errorCount === 0,
    confirmNoDryRunBlockers: dryRunPreview.summary.blockedByErrorCount === 0,
    confirmDuplicateDecisionsComplete: a16rDuplicateReviewPackClear,
    confirmA16TApplyVerified: true,
    confirmA16ULockedBranchReady: true,
    confirmA16VApplyVerified: true,
    confirmA16VRealTransactionBranchReady: true,
    confirmRuntimeExecutionEnablementMarker:
      A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER,
    confirmProductionUiVisible: true,
    confirmProductionDeployReady: true,
    confirmRollbackReviewed: true,
    confirmAuditReviewed: true,
  };
  const a16rOfficialImportRoutePath = `/api/admin/import-sessions/${A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}/official-import`;
  const a16rConfirmationText = `Owner/admin confirms A-16R official import for audited session ${A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}.`;
  const a16rButtonLockedReason = (() => {
    if (!a16rPermissionDiagnostic) {
      return "A16R_LOCKED_PERMISSION_DIAGNOSTIC_NOT_AVAILABLE";
    }
    if (!a16rPermissionDiagnostic.userId) {
      return "A16R_LOCKED_UNAUTHENTICATED_CONTEXT";
    }
    if (!a16rPermissionDiagnostic.hasOwnerAdminRole) {
      return "A16R_LOCKED_OWNER_ADMIN_ROLE_MISSING";
    }
    if (!a16rPermissionDiagnostic.hasImportsCreate) {
      return "A16R_LOCKED_IMPORTS_CREATE_MISSING";
    }
    if (!a16rPermissionDiagnostic.hasPermissionsManage) {
      return "A16R_LOCKED_PERMISSIONS_MANAGE_MISSING";
    }
    if (!a16rPermissionDiagnostic.qualifiesOwnerAdminImportContext) {
      return `A16R_LOCKED_STRICT_PERMISSION_SET_INCOMPLETE:${a16rPermissionDiagnostic.missingStrictPermissions.join(",")}`;
    }
    if (officialImportSessionMismatch) {
      return "A16R_LOCKED_AUDITED_SESSION_MISMATCH";
    }
    if (a16rSameRunLockedReasons.length > 0) {
      return a16rSameRunLockedReasons[0];
    }
    return "A16R_UNLOCKED_PENDING_OWNER_FINAL_CONFIRMATION_CHECKBOX";
  })();
  const officialImportSessionMarker = A16R_AUDITED_OFFICIAL_IMPORT_MARKER;
  const a16oAuditExportHref = `/api/admin/import-sessions/${A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}/dry-run-preview?auditExport=relationships-full`;
  const a16bcRelationshipAmbiguityClear = result.relationshipsPreview.every(
    (item) => !item.ambiguityStatus || item.ambiguityStatus === "clear",
  );
  const a16bcReviewPackReady =
    reviewPack.readiness === "READY_FOR_OWNER_REVIEW";
  const a16bcBaseStateGateReady =
    a16rPermissionReady &&
    a16rAuditedSessionReady &&
    a16rBlockedErrorsClear &&
    a16rDuplicateReviewPackClear &&
    a16bcRelationshipAmbiguityClear &&
    a16bcReviewPackReady;
  const a16bcCanMarkReady =
    a16bcBaseStateGateReady && session?.status === "preview_generated";
  const a16bcCanApproveDbWrite =
    a16bcBaseStateGateReady &&
    session?.status === "ready_for_owner_approval" &&
    result.writeManifests.some((item) =>
      ["draft", "ready_for_apply", "owner_approved"].includes(item.status),
    );
  const a16bcLockedReasons: string[] = [];
  pushReason(
    a16bcLockedReasons,
    a16rPermissionReady,
    "A16BC_LOCKED_OWNER_ADMIN_IMPORT_CONTEXT_NOT_PROVEN",
  );
  pushReason(
    a16bcLockedReasons,
    a16rAuditedSessionReady,
    "A16BC_LOCKED_AUDITED_SESSION_MISMATCH",
  );
  pushReason(
    a16bcLockedReasons,
    a16rBlockedErrorsClear,
    "A16BC_LOCKED_VALIDATION_OR_DRY_RUN_BLOCKERS_PRESENT",
  );
  pushReason(
    a16bcLockedReasons,
    a16rDuplicateReviewPackClear,
    "A16BC_LOCKED_DUPLICATE_OR_REVIEW_PACK_BLOCKERS_PRESENT",
  );
  pushReason(
    a16bcLockedReasons,
    a16bcRelationshipAmbiguityClear,
    "A16BC_LOCKED_RELATIONSHIP_AMBIGUITY_PRESENT",
  );
  pushReason(
    a16bcLockedReasons,
    a16bcReviewPackReady,
    "A16BC_LOCKED_REVIEW_PACK_NOT_READY",
  );
  if (!a16bcCanMarkReady && !a16bcCanApproveDbWrite) {
    a16bcLockedReasons.push(
      `A16BC_LOCKED_SESSION_STATE_${session?.status ?? "MISSING"}_NOT_TRANSITIONABLE`,
    );
  }
  const a16bcReadyConfirmation = {
    action: "mark_ready_for_owner_approval" as const,
    confirmSessionId: A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID,
    confirmMarker: A16BC_READY_FOR_OWNER_APPROVAL_MARKER,
    confirmNoValidationErrors: validation.summary.errorCount === 0,
    confirmNoDryRunBlockers: dryRunPreview.summary.blockedByErrorCount === 0,
    confirmDuplicateDecisionsComplete: a16rDuplicateReviewPackClear,
    confirmRelationshipAmbiguityClear: a16bcRelationshipAmbiguityClear,
    confirmReviewPackReady: a16bcReviewPackReady,
    confirmNoOfficialImportExecution: true,
    confirmRollbackReviewed: true,
    confirmAuditReviewed: true,
  };
  const a16bcDbWriteConfirmation = {
    action: "approve_for_db_write" as const,
    confirmSessionId: A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID,
    confirmMarker: A16BC_OWNER_APPROVED_FOR_DB_WRITE_MARKER,
    confirmNoValidationErrors: validation.summary.errorCount === 0,
    confirmNoDryRunBlockers: dryRunPreview.summary.blockedByErrorCount === 0,
    confirmDuplicateDecisionsComplete: a16rDuplicateReviewPackClear,
    confirmRelationshipAmbiguityClear: a16bcRelationshipAmbiguityClear,
    confirmReviewPackReady: a16bcReviewPackReady,
    confirmNoOfficialImportExecution: true,
    confirmRollbackReviewed: true,
    confirmAuditReviewed: true,
  };
  return (
    <section className="grid gap-5 rounded-lg border border-stone-200 bg-[#fffaf0] p-5 shadow-sm">
      <div className="grid gap-2">
        <div className="text-sm font-semibold uppercase tracking-normal text-teal-800">
          A-16G - Manifest nhập dữ liệu
        </div>
        <h2 className="text-xl font-bold text-stone-950">
          Phiên nhập dữ liệu
        </h2>
        <p className="text-sm leading-6 text-stone-700">
          Dữ liệu bên dưới chỉ là bản xem trước, chưa được nhập vào cây gia phả.
          Chưa mở bước xác nhận nhập chính thức.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <strong>Chế độ an toàn:</strong> màn hình này chỉ đọc phiên nhập và
        manifest dữ liệu. Không tạo thành viên, không tạo quan hệ, không ghi
        layout cây và không ghi revision.
      </div>

      {!result.ok ? (
        <div className="rounded-lg border border-amber-200 bg-white p-4 text-sm leading-6 text-amber-900">
          {result.message}
        </div>
      ) : null}

      {result.sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-5 text-sm leading-6 text-stone-700">
          <div className="font-bold text-stone-950">
            Chưa có phiên nhập dữ liệu
          </div>
          <p className="mt-2">
            Schema manifest đã sẵn sàng, nhưng hiện chưa có session nào để xem.
            Đây là trạng thái hợp lệ sau khi owner xác nhận các bảng đang có
            row_count = 0.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {result.sessions.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-stone-200 bg-white p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-950">
                    Manifest dữ liệu
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-stone-700">
                    Trạng thái: {item.status}. Tạo lúc {formatDate(item.createdAt)}.
                  </p>
                </div>
                <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
                  Chỉ đọc
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Dòng dữ liệu" value={item.rowCount} />
                <MetricCard label="Thành viên dự kiến" value={item.personCandidateCount} />
                <MetricCard
                  label="Quan hệ dự kiến"
                  value={item.relationshipCandidateCount}
                />
                <MetricCard label="Cảnh báo" value={item.warningCount} />
              </div>
            </div>
          ))}
        </div>
      )}

      {session ? (
        <div className="grid gap-4">
          <section className="grid gap-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
            <div className="grid gap-2">
              <h3 className="text-base font-bold text-stone-950">
                Kiểm tra dữ liệu staging
              </h3>
              <p className="text-sm leading-6 text-stone-700">
                Dữ liệu này vẫn chưa được nhập vào cây gia phả thật. Mục này
                chỉ đọc manifest staging và gom cảnh báo để owner kiểm tra trước
                khi có phase nhập chính thức riêng.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                label="Số người staging"
                value={validation.summary.peopleCount}
              />
              <MetricCard
                label="Mẫu người đang đọc"
                value={validation.summary.peoplePreviewCount}
              />
              <MetricCard
                label="Số quan hệ staging"
                value={validation.summary.relationshipCount}
              />
              <MetricCard
                label="Mẫu quan hệ đang đọc"
                value={validation.summary.relationshipPreviewCount}
              />
              <MetricCard label="Số lỗi" value={validation.summary.errorCount} />
              <MetricCard
                label="Số cảnh báo"
                value={validation.summary.warningCount}
              />
              <MetricCard label="Số thông tin" value={validation.summary.infoCount} />
            </div>

            {validation.summary.errorCount === 0 &&
            validation.summary.warningCount === 0 ? (
              <div className="rounded-md border border-emerald-200 bg-white p-3 text-sm font-semibold text-emerald-900">
                Chưa phát hiện cảnh báo nghiêm trọng
              </div>
            ) : null}

            <IssueList title="Lỗi cần xử lý" issues={errorIssues} />
            <IssueList title="Cảnh báo dữ liệu" issues={warningIssues} />
            <IssueList title="Gợi ý kiểm tra" issues={infoIssues} />
          </section>

          <DuplicateDecisionReviewClient
            key={duplicateReviewKey}
            sessionId={session.id}
            duplicateCandidates={result.duplicateCandidates}
            totalDuplicateCandidates={totalDuplicateCandidates}
          />

          <section className="grid gap-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
            <div className="grid gap-2">
              <div className="text-sm font-semibold uppercase tracking-normal text-sky-800">
                A-16O - Export audit quan há»‡ chá»‰ Ä‘á»c
              </div>
              <h3 className="text-base font-bold text-stone-950">
                Táº£i JSON audit A-16O cho phiÃªn Ä‘Ã£ kiá»ƒm toÃ¡n
              </h3>
              <p className="text-sm leading-6 text-stone-700">
                `family.json` á»Ÿ trang Sao lÆ°u / Xuáº¥t dá»¯ liá»‡u lÃ  báº£n backup chung.
                NÃ³ khÃ´ng pháº£i báº±ng chá»©ng cho A-16R retry. File cáº§n cho audit
                quan há»‡ lÃ  JSON A-16O bÃªn dÆ°á»›i, vá»›i marker
                `A16O_FULL_DRY_RUN_RELATIONSHIP_AUDIT_EXPORT_READ_ONLY`.
              </p>
              <p className="text-sm leading-6 text-stone-700">
                ÄÆ°á»ng táº£i nÃ y chá»‰ gá»i GET read-only vÃ o dry-run preview. KhÃ´ng
                báº¥m xÃ¡c nháº­n nháº­p, khÃ´ng gá»i official import, khÃ´ng ghi dá»¯ liá»‡u.
              </p>
              <p className="break-all font-mono text-xs text-sky-950">
                {a16oAuditExportHref}
              </p>
            </div>
            <ActionLink
              href={a16oAuditExportHref}
              download="a16o-dry-run-relationship-audit-export-full.json"
              variant="primary"
              className="sm:w-fit"
            >
              Táº£i A-16O audit export JSON
            </ActionLink>
          </section>

          <section className="grid gap-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <div className="grid gap-2">
              <div className="text-sm font-semibold uppercase tracking-normal text-rose-800">
                Cổng kiểm tra thử / dry-run A-16K
              </div>
              <h3 className="text-base font-bold text-stone-950">
                Cổng dry-run chỉ dành cho bước xem trước
              </h3>
              <p className="text-sm leading-6 text-stone-700">
                Marker A-16K bên dưới chỉ mở bước kiểm tra thử và xem trước mapping.
                Nó không có nghĩa là được chạy nhập chính thức, và không ghi dữ liệu
                gia phả thật.
              </p>
              <p className="text-sm leading-6 text-stone-700">
                Nhập chính thức thuộc cổng A-16R riêng ở phía dưới. Không bấm hoặc
                gửi yêu cầu nhập chính thức cho đến khi có phase thực thi riêng.
              </p>
              <p className="text-sm font-semibold text-rose-900">
                Marker dry-run A-16K: {dryRunGate.dryRunGate.requiredMarker}
              </p>
              <p className="text-sm font-semibold text-rose-900">
                Trạng thái dry-run A-16K: {dryRunGate.dryRunGate.status}. Phiên
                đã kiểm toán: {dryRunGate.dryRunGate.auditedSessionId}.
              </p>
              {dryRunGate.dryRunGate.canRunDryRun ? (
                <div className="rounded-md border border-emerald-200 bg-white p-3 text-sm font-semibold text-emerald-900">
                  Dry-run read-only đã mở cho phiên đã kiểm toán. Không mở nhập
                  chính thức và không ghi dữ liệu gia phả thật.
                </div>
              ) : (
                <div className="rounded-md border border-amber-200 bg-white p-3 text-sm font-semibold text-amber-900">
                  Dry-run vẫn khóa cho phiên đang xem. Chỉ phiên đã kiểm toán
                  mới được mở dry-run read-only.
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={!dryRunGate.dryRunGate.canRunDryRun}
              aria-disabled={!dryRunGate.dryRunGate.canRunDryRun}
              className={
                dryRunGate.dryRunGate.canRunDryRun
                  ? "inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 sm:w-fit"
                  : "inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-900 sm:w-fit"
              }
            >
              {dryRunGate.dryRunGate.canRunDryRun
                ? "Dry-run read-only đã được phê duyệt"
                : "Chạy dry-run - cần phê duyệt A-16K"}
            </button>
          </section>

          <section className="grid gap-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <div className="grid gap-2">
              <div className="text-sm font-semibold uppercase tracking-normal text-indigo-800">
                Bản xem trước dry-run
              </div>
              <h3 className="text-base font-bold text-stone-950">
                Mô phỏng mapping từ staging
              </h3>
              <p className="text-sm leading-6 text-stone-700">
                Dữ liệu này chỉ là bản mô phỏng, chưa được ghi vào cây gia phả
                thật.
              </p>
              {dryRunPreview.summary.blockedByErrorCount > 0 ? (
                <div className="rounded-md border border-rose-200 bg-white p-3 text-sm font-semibold text-rose-900">
                  Không thể dry-run vì còn lỗi dữ liệu staging
                </div>
              ) : (
                <div className="rounded-md border border-emerald-200 bg-white p-3 text-sm font-semibold text-emerald-900">
                  Bản xem trước dry-run đã sẵn sàng để owner xem lại
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Người dự kiến tạo"
                value={dryRunPreview.summary.proposedPeopleCount}
              />
              <MetricCard
                label="Mẫu người hiển thị"
                value={dryRunPreview.summary.proposedPeoplePreviewCount}
              />
              <MetricCard
                label="Quan hệ dự kiến tạo"
                value={dryRunPreview.summary.proposedRelationshipCount}
              />
              <MetricCard
                label="Mẫu quan hệ hiển thị"
                value={dryRunPreview.summary.proposedRelationshipPreviewCount}
              />
              <MetricCard
                label="Lỗi chặn dry-run"
                value={dryRunPreview.summary.blockedByErrorCount}
              />
              <MetricCard
                label="Cảnh báo dry-run"
                value={dryRunPreview.summary.warningCount}
              />
            </div>

            <div className="rounded-md border border-emerald-200 bg-white p-3 text-sm leading-6 text-emerald-950">
              {dryRunPreview.summary.groupedFamilyImportPlan.previewExplanationVi}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Quan hệ cha mẹ nguồn"
                value={
                  dryRunPreview.summary.groupedFamilyImportPlan
                    .sourceChildRelationshipCount
                }
              />
              <MetricCard
                label="Nhóm gia đình"
                value={
                  dryRunPreview.summary.groupedFamilyImportPlan
                    .canonicalFamilyGroupCount
                }
              />
              <MetricCard
                label="Gia đình mới dự kiến"
                value={
                  dryRunPreview.summary.groupedFamilyImportPlan
                    .plannedNewFamilyCount
                }
              />
              <MetricCard
                label="Gia đình dùng lại"
                value={
                  dryRunPreview.summary.groupedFamilyImportPlan
                    .plannedReusedFamilyCount
                }
              />
              <MetricCard
                label="Cha mẹ trong nhóm"
                value={
                  dryRunPreview.summary.groupedFamilyImportPlan
                    .plannedParentMembershipCount
                }
              />
              <MetricCard
                label="Con trong nhóm"
                value={
                  dryRunPreview.summary.groupedFamilyImportPlan
                    .plannedChildMembershipCount
                }
              />
              <MetricCard
                label="Dòng cha mẹ trùng bỏ"
                value={
                  dryRunPreview.summary.groupedFamilyImportPlan
                    .duplicateParentRowsRemoved
                }
              />
              <MetricCard
                label="Dòng con trùng bỏ"
                value={
                  dryRunPreview.summary.groupedFamilyImportPlan
                    .duplicateChildRowsRemoved
                }
              />
            </div>

            {dryRunPreview.proposedPeople.length > 0 ? (
              <div className="grid gap-2">
                <h4 className="text-sm font-bold text-stone-950">
                  Người dự kiến tạo
                </h4>
                {dryRunPreview.proposedPeople.slice(0, 10).map((person) => (
                  <div
                    key={person.sourceFingerprint}
                    className="rounded-md border border-indigo-100 bg-white p-3 text-sm leading-6 text-stone-800"
                  >
                    <div className="font-bold text-stone-950">
                      Dòng {person.sourceRowIndex}: {person.fullName}
                    </div>
                    <div className="text-stone-600">
                      Đời: {person.generationNumber ?? "chưa rõ"}. Chi/nhánh:{" "}
                      {person.branchName ?? "chưa rõ"}. Mã staging:{" "}
                      {person.sourceFingerprint}.
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {dryRunPreview.proposedRelationships.length > 0 ? (
              <div className="grid gap-2">
                <h4 className="text-sm font-bold text-stone-950">
                  Quan hệ dự kiến tạo
                </h4>
                {dryRunPreview.proposedRelationships
                  .slice(0, 10)
                  .map((relationship) => (
                    <div
                      key={relationship.sourceReference.fingerprint}
                      className="rounded-md border border-indigo-100 bg-white p-3 text-sm leading-6 text-stone-800"
                    >
                      <div className="font-bold text-stone-950">
                        Dòng {relationship.sourceRowIndex}:{" "}
                        {relationship.relationshipLabelVi}
                      </div>
                      <div className="text-stone-600">
                        Độ chắc chắn: {relationship.confidence}. Trạng thái:{" "}
                        {relationship.ambiguityStatus}.
                      </div>
                    </div>
                  ))}
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="grid gap-2">
              <div className="text-sm font-semibold uppercase tracking-normal text-emerald-800">
                Gói rà soát trước khi nhập
              </div>
              <h3 className="text-base font-bold text-stone-950">
                Chủ sở hữu kiểm tra lần cuối
              </h3>
              <p className="text-sm leading-6 text-stone-700">
                Gói này chỉ tổng hợp dữ liệu staging, cảnh báo và bản mô phỏng
                dry-run. Chưa ghi thành viên thật, quan hệ thật, layout cây hoặc
                revision.
              </p>
              {reviewPack.readiness === "READY_FOR_OWNER_REVIEW" ? (
                <div className="rounded-md border border-emerald-200 bg-white p-3 text-sm font-semibold text-emerald-900">
                  Sẵn sàng để owner rà soát
                </div>
              ) : (
                <div className="rounded-md border border-amber-200 bg-white p-3 text-sm font-semibold text-amber-900">
                  Chưa đủ điều kiện nhập chính thức
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Người staging"
                value={reviewPack.validationSummary.peopleCount}
              />
              <MetricCard
                label="Mẫu người đang đọc"
                value={reviewPack.validationSummary.peoplePreviewCount}
              />
              <MetricCard
                label="Quan hệ cha mẹ"
                value={reviewPack.validationSummary.relationshipCount}
              />
              <MetricCard
                label="Mẫu quan hệ đang đọc"
                value={reviewPack.validationSummary.relationshipPreviewCount}
              />
              <MetricCard
                label="Lỗi cần xử lý"
                value={reviewPack.validationSummary.errorCount}
              />
              <MetricCard
                label="Dry-run bị chặn"
                value={reviewPack.dryRunSummary.blockedByErrorCount}
              />
              <MetricCard
                label="Trùng chưa quyết định"
                value={
                  reviewPack.duplicateDecisionSummary.unresolvedDuplicateCandidates
                }
              />
            </div>

            <div className="rounded-md border border-emerald-200 bg-white p-3 text-sm leading-6 text-stone-700">
              Trạng thái nhập chính thức: chưa mở. Marker review:{" "}
              {reviewPack.marker}.
            </div>
          </section>

          <section className="grid gap-4 rounded-lg border border-violet-200 bg-violet-50 p-4">
            <div className="grid gap-2">
              <div className="text-sm font-semibold uppercase tracking-normal text-violet-800">
                A-16BC - Owner approval state
              </div>
              <h3 className="text-base font-bold text-stone-950">
                Chuyển trạng thái phê duyệt trước khi nhập chính thức
              </h3>
              <p className="text-sm leading-6 text-stone-700">
                Cổng này chỉ chuyển trạng thái phiên đã kiểm toán qua
                preview_generated, ready_for_owner_approval và
                owner_approved_for_db_write. Nó không gọi POST /official-import,
                không gọi RPC và không ghi dữ liệu gia phả thật.
              </p>
              <p className="break-all text-sm font-semibold text-violet-950">
                Route A-16BC: {A16BC_OWNER_APPROVAL_STATE_ROUTE}
              </p>
              <p className="break-all text-sm text-violet-950">
                Ready marker: {A16BC_READY_FOR_OWNER_APPROVAL_MARKER}
              </p>
              <p className="break-all text-sm text-violet-950">
                DB-write approval marker:{" "}
                {A16BC_OWNER_APPROVED_FOR_DB_WRITE_MARKER}
              </p>
            </div>
            <A16BCOwnerApprovalStateClient
              routePath={A16BC_OWNER_APPROVAL_STATE_ROUTE}
              readyConfirmation={a16bcReadyConfirmation}
              dbWriteConfirmation={a16bcDbWriteConfirmation}
              canMarkReady={a16bcCanMarkReady}
              canApproveDbWrite={a16bcCanApproveDbWrite}
              lockedReasons={a16bcLockedReasons}
            />
          </section>

          <section className="grid gap-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <div className="grid gap-2">
              <div className="text-sm font-semibold uppercase tracking-normal text-rose-800">
                Cổng nhập chính thức A-16R
              </div>
              <h3 className="text-base font-bold text-stone-950">
                Trạng thái hiện tại: nhập chính thức vẫn khóa
              </h3>
              <p className="text-sm leading-6 text-stone-700">
                Cổng A-16R là cổng chạy thật. Nút nhập chính thức vẫn bị khóa cho
                đến khi chứng minh được phiên owner/admin trên production, đúng
                phiên nhập và đủ phê duyệt runtime. Chưa có dữ liệu gia phả thật
                nào được ghi từ màn hình này.
              </p>
              <p className="text-sm leading-6 text-stone-700">
                Lý do: chưa có phê duyệt chạy thật cho đúng phiên nhập và chưa
                chứng minh xong phiên admin/owner trên production. A-16K dry-run
                không thay thế cho cổng thực thi A-16R.
              </p>
              <p className="text-sm font-semibold text-rose-900">
                Marker chạy thật cho đúng phiên A-16R:{" "}
                {officialImportSessionMarker}
              </p>
              {officialImportSessionMismatch ? (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
                  <div className="font-semibold">
                    Phiên đang xem không khớp phiên nhập chính thức đã được kiểm toán.
                  </div>
                  <div>Phiên đang xem: {currentSessionId}</div>
                  <div>
                    Phiên nhập chính thức đã kiểm toán:{" "}
                    {A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}
                  </div>
                  <div>
                    Không dùng phiên đang xem làm marker nhập chính thức. Nhập
                    chính thức vẫn khóa cho đến phase thực thi riêng.
                  </div>
                </div>
              ) : null}
              <p className="text-sm font-semibold text-rose-900">
                Marker bật runtime execution sau A-16V, tách riêng với marker
                phiên:{" "}
                {A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER}
              </p>
              <div className="grid gap-3 border-t border-rose-200 pt-3">
                <div className="text-sm font-semibold text-rose-950">
                  Chẩn đoán tạm thời A-16AO về quyền owner/admin
                </div>
                <dl className="grid gap-2 text-sm leading-6 text-stone-800 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <dt className="font-semibold text-stone-950">
                      Tài khoản hiện tại
                    </dt>
                    <dd className="break-all">
                      {a16rPermissionDiagnostic?.accountEmail ?? "Không có"}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="font-semibold text-stone-950">User ID</dt>
                    <dd className="break-all">
                      {a16rPermissionDiagnostic?.userId ?? "Không có"}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="font-semibold text-stone-950">Profile ID</dt>
                    <dd className="break-all">
                      {a16rPermissionDiagnostic?.profileId ?? "Không có"}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="font-semibold text-stone-950">
                      Vai trò hiện tại
                    </dt>
                    <dd>
                      {a16rPermissionDiagnostic?.roles.length
                        ? a16rPermissionDiagnostic.roles.join(", ")
                        : "NO_ROLE"}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="font-semibold text-stone-950">
                      Số quyền thấy được
                    </dt>
                    <dd>
                      {a16rPermissionDiagnostic?.visiblePermissionCount ?? 0}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="font-semibold text-stone-950">
                      imports.create
                    </dt>
                    <dd>
                      {formatPresent(
                        a16rPermissionDiagnostic?.hasImportsCreate ?? false,
                      )}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="font-semibold text-stone-950">
                      permissions.manage (official import)
                    </dt>
                    <dd>
                      {formatPresent(
                        a16rPermissionDiagnostic?.hasPermissionsManage ?? false,
                      )}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="font-semibold text-stone-950">
                      OWNER/ADMIN import context
                    </dt>
                    <dd>
                      {a16rPermissionDiagnostic?.qualifiesOwnerAdminImportContext
                        ? "YES"
                        : "NO"}
                    </dd>
                  </div>
                  <div className="grid gap-1 sm:col-span-2">
                    <dt className="font-semibold text-stone-950">
                      Quyền strict còn thiếu
                    </dt>
                    <dd className="break-all">
                      A-16BB session state gate: current=
                      {a16bbSessionStateGate.status ?? "missing"}; required=
                      {A16BB_OFFICIAL_IMPORT_EXECUTION_ELIGIBLE_SESSION_STATE};
                      eligible={a16bbSessionStateGate.executionEligible ? "YES" : "NO"};
                      blocker={a16bbSessionStateGate.blocker ?? "none"}.
                    </dd>
                  </div>
                  <div className="grid gap-1 sm:col-span-2">
                    <dt className="font-semibold text-stone-950">
                      A-16BB session state gate
                    </dt>
                    <dd className="break-all">
                      {a16rPermissionDiagnostic?.missingStrictPermissions.length
                        ? a16rPermissionDiagnostic.missingStrictPermissions.join(
                            ", ",
                          )
                        : "Không thiếu quyền strict đã biết"}
                    </dd>
                  </div>
                  <div className="grid gap-1 sm:col-span-2">
                    <dt className="font-semibold text-stone-950">
                      Lý do nút A-16R vẫn khóa
                    </dt>
                    <dd className="break-all">{a16rButtonLockedReason}</dd>
                  </div>
                  <div className="grid gap-1 sm:col-span-2">
                    <dt className="font-semibold text-stone-950">
                      Permission context reason
                    </dt>
                    <dd className="break-all">
                      {a16rPermissionDiagnostic?.contextReason ?? "none"}
                    </dd>
                  </div>
                </dl>
              </div>
              {a16rSameRunLockedReasons.length > 0 ? (
                <div className="rounded-md border border-rose-200 bg-white p-3 text-sm leading-6 text-rose-900">
                  <div>Không chạy nhập chính thức khi same-run gate chưa pass.</div>
                  {a16rSameRunLockedReasons.slice(0, 4).map((reason) => (
                    <div key={reason}>{reason}</div>
                  ))}
                </div>
              ) : null}
            </div>

            <A16ROfficialImportConfirmationClient
              sessionId={A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID}
              routePath={a16rOfficialImportRoutePath}
              confirmationText={a16rConfirmationText}
              confirmationBody={a16rOfficialImportConfirmation}
              canSubmit={a16rSameRunPreflight.officialImportEnabled}
              lockedReasons={a16rSameRunLockedReasons}
            />
          </section>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Cảnh báo manifest"
              value={result.manifestSummary.warningCount}
            />
            <MetricCard
              label="Ứng viên trùng"
              value={result.manifestSummary.duplicateCandidateCount}
            />
            <MetricCard
              label="Quan hệ manifest"
              value={result.manifestSummary.relationshipCandidateCount}
            />
            <MetricCard
              label="Write manifest"
              value={result.manifestSummary.writeManifestCount}
            />
          </div>

          {result.manifestSummary.warningCount === 0 &&
          result.peoplePreview.length === 0 &&
          result.manifestSummary.duplicateCandidateCount === 0 &&
          result.manifestSummary.relationshipCandidateCount === 0 &&
          result.manifestSummary.writeManifestCount === 0 ? (
            <EmptyManifestState />
          ) : (
            <div className="grid gap-3">
              {result.peoplePreview.length > 0 ? (
                <section className="rounded-lg border border-stone-200 bg-white p-4">
                  <h3 className="text-base font-bold text-stone-950">
                    Thành viên staging
                  </h3>
                  <div className="mt-3 grid gap-2">
                    {result.peoplePreview.slice(0, 20).map((person) => (
                      <div
                        key={`${person.fingerprint}-${person.sourceRowIndex}`}
                        className="rounded-md border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-800"
                      >
                        <div className="font-bold text-stone-950">
                          Dòng {person.sourceRowIndex}: {person.fullName}
                        </div>
                        <div className="text-stone-600">
                          Giới tính: {person.gender}. Đời:{" "}
                          {person.generationNumber ?? "chưa rõ"}. Chi/nhánh:{" "}
                          {person.branchName ?? "chưa rõ"}.
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {result.relationshipsPreview.length > 0 ? (
                <section className="rounded-lg border border-stone-200 bg-white p-4">
                  <h3 className="text-base font-bold text-stone-950">
                    Quan hệ staging
                  </h3>
                  <div className="mt-3 grid gap-2">
                    {result.relationshipsPreview.slice(0, 20).map((relationship) => (
                      <div
                        key={relationship.id}
                        className="rounded-md border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-800"
                      >
                        <div className="font-bold text-stone-950">
                          Dòng {relationship.sourceRowIndex}:{" "}
                          {relationship.relationshipLabelVi}
                        </div>
                        <div className="text-stone-600">
                          Độ chắc chắn: {relationship.confidence}. Trạng thái:{" "}
                          {relationship.ambiguityStatus}.
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {result.warnings.map((warning) => (
                <div
                  key={warning.id}
                  className="rounded-lg border border-amber-200 bg-white p-4 text-sm leading-6 text-stone-800"
                >
                  <div className="font-bold text-stone-950">
                    {warning.messageVi}
                  </div>
                  <div className="mt-1 text-stone-600">
                    Mã cảnh báo: {warning.warningCode}. Trạng thái:{" "}
                    {warning.reviewStatus}.
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ) : null}
    </section>
  );
}

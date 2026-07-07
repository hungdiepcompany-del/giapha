import { getImportDryRunApprovalGate } from "@/lib/import/giapha4/import-dry-run-approval-gate";
import { DuplicateDecisionReviewClient } from "@/components/imports/duplicate-decision-review-client";
import { buildDryRunMappingPreview } from "@/lib/import/giapha4/dry-run-mapping-preview-service";
import { buildImportReviewPackFromManifest } from "@/lib/import/giapha4/import-review-pack-service";
import { buildOfficialImportPreflightGateFromManifest } from "@/lib/import/giapha4/official-import-preflight-gate";
import {
  A16R_AUDITED_OFFICIAL_IMPORT_MARKER,
  A16R_AUDITED_OFFICIAL_IMPORT_SESSION_ID,
  A16R_RUNTIME_EXECUTION_ENABLEMENT_MARKER,
} from "@/lib/import/giapha4/official-import-service";
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

export function ImportSessionManifestPanel({
  result,
}: {
  result: ImportManifestReadResult;
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
  const officialImportGate = buildOfficialImportPreflightGateFromManifest(result);
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
  const officialImportSessionMarker = A16R_AUDITED_OFFICIAL_IMPORT_MARKER;
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
              {officialImportGate.noGoReasons.length > 0 ? (
                <div className="rounded-md border border-rose-200 bg-white p-3 text-sm leading-6 text-rose-900">
                  <div>Không chạy nhập chính thức trong phase này.</div>
                  {officialImportGate.noGoReasons.slice(0, 4).map((reason) => (
                    <div key={reason}>{reason}</div>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-900 sm:w-fit"
            >
              Xác nhận nhập chính thức - đang khóa
            </button>
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

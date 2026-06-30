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
                label="Số quan hệ staging"
                value={validation.summary.relationshipCount}
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

          <button
            type="button"
            disabled
            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-stone-300 bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-500 sm:w-fit"
          >
            Xác nhận nhập chính thức — chưa mở
          </button>
        </div>
      ) : null}
    </section>
  );
}

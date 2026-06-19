"use client";

import { useActionState } from "react";

import { previewImportAction } from "@/app/(admin)/admin/exports/import/actions";
import { initialImportPreviewActionState } from "@/app/(admin)/admin/exports/import/state";
import type {
  ImportPreview,
  ImportValidationIssue,
} from "@/lib/family/import-types";

function SummaryGrid({ preview }: { preview: ImportPreview }) {
  const rows = [
    ["Phiên bản schema", preview.summary.schema_version ?? "-"],
    ["Ứng dụng", preview.summary.app_name ?? "-"],
    ["Thời điểm xuất", preview.summary.exported_at ?? "-"],
    ["Thành viên", preview.summary.people_count],
    ["Đơn vị gia đình", preview.summary.family_count],
    ["Cha/mẹ trong gia đình", preview.summary.family_parent_count],
    ["Con trong gia đình", preview.summary.family_child_count],
    ["Quan hệ đôi", preview.summary.couple_relationship_count],
    ["Bố cục cây", preview.summary.tree_layout_count],
    ["Nút trên cây", preview.summary.tree_layout_node_count],
  ];

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {rows.map(([label, value]) => (
        <div key={label} className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </div>
          <div className="mt-1 break-words text-sm font-bold text-slate-950">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function IssueList({ issues }: { issues: ImportValidationIssue[] }) {
  if (issues.length === 0) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Không phát hiện lỗi cấu trúc trong family.json.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Mức</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Path</th>
            <th className="px-4 py-3">Nội dung</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, index) => (
            <tr key={`${issue.code}-${index}`} className="border-t border-slate-200">
              <td className="px-4 py-3 font-semibold text-slate-950">
                {issue.severity}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">
                {issue.code}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-700">
                {issue.path ?? "-"}
              </td>
              <td className="px-4 py-3 text-slate-700">{issue.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConflictList({ preview }: { preview: ImportPreview }) {
  if (preview.conflict_check_status === "unavailable") {
    return (
      <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {preview.conflict_check_message ?? "Chưa kiểm tra được xung đột DB."}
      </div>
    );
  }

  if (preview.conflicts.length === 0) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Không phát hiện xung đột ID/slug trong DB hiện tại.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {preview.conflicts.map((conflict, index) => (
        <div
          key={`${conflict.kind}-${conflict.id ?? conflict.value ?? index}`}
          className="border border-red-200 bg-red-50 p-4 text-sm text-red-900"
        >
          <div className="font-mono text-xs">{conflict.kind}</div>
          <div className="mt-1">{conflict.message}</div>
        </div>
      ))}
    </div>
  );
}

export function JsonImportPreviewForm() {
  const [state, formAction, isPending] = useActionState(
    previewImportAction,
    initialImportPreviewActionState,
  );

  return (
    <div className="grid gap-6">
      <form action={formAction} className="grid gap-4 border border-slate-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Tải lên family.json
            </span>
            <input
              type="file"
              name="family_json_file"
              accept="application/json,.json"
              className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
            />
          </label>
          <div className="border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            Phase 10 chỉ đọc file để xem trước và kiểm tra. Nút xác nhận nhập dữ liệu bị
            khóa vì chưa có giao dịch và kiểm tra phục hồi đầy đủ.
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Hoặc paste nội dung family.json
          </span>
          <textarea
            name="family_json_text"
            rows={12}
            className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-950 outline-none focus:border-slate-900"
            placeholder='{"schema_version":"1.0.0","people":[]}'
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
          >
            {isPending ? "Đang kiểm tra..." : "Kiểm tra file"}
          </button>
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-500"
          >
            Xác nhận nhập dữ liệu
          </button>
        </div>
      </form>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
              : "border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          }
        >
          {state.message}
        </div>
      ) : null}

      {state.preview ? (
        <div className="grid gap-6">
          <section className="grid gap-3">
            <h2 className="text-lg font-bold text-slate-950">Tóm tắt file</h2>
            <SummaryGrid preview={state.preview} />
          </section>

          <section className="grid gap-3">
            <h2 className="text-lg font-bold text-slate-950">Kết quả kiểm tra</h2>
            <IssueList issues={state.preview.issues} />
          </section>

          <section className="grid gap-3">
            <h2 className="text-lg font-bold text-slate-950">Xung đột DB</h2>
            <ConflictList preview={state.preview} />
          </section>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useMemo, useState, type FormEvent } from "react";

import type { GiaPha4PreviewResult } from "@/lib/import/giapha4/types";

type PreviewState =
  | {
      status: "idle";
      data: null;
      message: null;
    }
  | {
      status: "loading";
      data: null;
      message: string;
    }
  | {
      status: "success" | "error";
      data: GiaPha4PreviewResult | null;
      message: string;
    };

const initialState: PreviewState = {
  status: "idle",
  data: null,
  message: null,
};

function formatBytes(value: number) {
  if (value <= 0) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function SummaryCards({ preview }: { preview: GiaPha4PreviewResult }) {
  const rows = [
    ["Số dòng đọc được", preview.summary.rows_read],
    ["Thành viên dự kiến", preview.summary.persons_count],
    ["Quan hệ dự kiến", preview.summary.relationships_count],
    ["Cảnh báo", preview.summary.warnings_count],
    ["Ứng viên trùng", preview.summary.duplicate_candidates_count],
    ["Cột chưa map", preview.summary.unmapped_columns_count],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-normal text-stone-600">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-950">{value}</div>
        </div>
      ))}
    </div>
  );
}

function EmptyPreviewTable({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="text-base font-bold text-stone-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-700">{description}</p>
    </section>
  );
}

export function GiaPha4ImportPreviewForm() {
  const [state, setState] = useState<PreviewState>(initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const selectedFileSummary = useMemo(() => {
    if (!selectedFile) return "Chưa chọn file Excel.";
    const extension = selectedFile.name.toLowerCase().endsWith(".xlsx")
      ? ".xlsx"
      : selectedFile.name.toLowerCase().endsWith(".xls")
        ? ".xls"
        : "không rõ";

    return `Đã chọn file ${extension}, dung lượng ${formatBytes(selectedFile.size)}. Tên file không hiển thị để tránh lộ dữ liệu gia đình.`;
  }, [selectedFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setState({
        status: "error",
        data: null,
        message: "Vui lòng chọn file Excel .xls hoặc .xlsx.",
      });
      return;
    }

    setState({
      status: "loading",
      data: null,
      message: "Đang kiểm tra file ở chế độ xem trước...",
    });

    const formData = new FormData();
    formData.append("giapha4_excel_file", selectedFile);

    try {
      const response = await fetch("/api/admin/import/giapha4/preview", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as GiaPha4PreviewResult;

      setState({
        status: response.ok ? "success" : "error",
        data,
        message: data.message,
      });
    } catch {
      setState({
        status: "error",
        data: null,
        message: "Không gọi được API xem trước. Vui lòng thử lại sau.",
      });
    }
  }

  return (
    <div className="grid gap-6 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="grid gap-2">
        <div className="text-sm font-semibold uppercase tracking-normal text-teal-800">
          A-16B - Xem trước Excel Gia Phả 4.0
        </div>
        <h2 className="text-xl font-bold text-stone-950">
          Xem trước dữ liệu từ file Excel iPhone
        </h2>
        <p className="text-sm leading-6 text-stone-700">
          Luồng này chỉ kiểm tra file và chuẩn bị preview. Phase hiện tại không
          ghi database, không lưu file lâu dài và không có nút nhập dữ liệu thật.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="block rounded-lg border border-dashed border-teal-300 bg-teal-50 p-4">
          <span className="text-sm font-semibold text-stone-900">
            Chọn file Excel Gia Phả 4.0
          </span>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="mt-3 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950"
          />
          <span className="mt-2 block text-sm text-stone-700">
            {selectedFileSummary}
          </span>
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={state.status === "loading"}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-teal-800 bg-teal-800 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300"
          >
            {state.status === "loading" ? "Đang xem trước..." : "Xem trước dữ liệu"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setState(initialState);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800"
          >
            Tải lại file
          </button>
          <button
            type="button"
            disabled
            title="Nhập dữ liệu thật sẽ được mở ở phase sau sau khi owner phê duyệt."
            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-stone-300 bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-500"
          >
            Nhập dữ liệu thật
          </button>
        </div>
      </form>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"
              : "rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
          }
        >
          {state.message}
        </div>
      ) : null}

      {state.data ? (
        <div className="grid gap-5">
          <SummaryCards preview={state.data} />

          <section className="rounded-lg border border-stone-200 bg-white p-4">
            <h3 className="text-base font-bold text-stone-950">Cảnh báo</h3>
            <div className="mt-3 grid gap-2">
              {state.data.warnings.map((warning) => (
                <div
                  key={warning.code}
                  className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                >
                  <div className="font-mono text-xs">{warning.code}</div>
                  <div className="mt-1">{warning.message}</div>
                </div>
              ))}
            </div>
          </section>

          <EmptyPreviewTable
            title="Bảng preview thành viên"
            description="Chưa có parser Excel được phê duyệt nên chưa đọc dòng thành viên. Khi mở A-16C/A16B tiếp theo, bảng này sẽ hiển thị họ tên, đời/thế hệ, năm sinh/mất và ghi chú riêng ở chế độ preview."
          />
          <EmptyPreviewTable
            title="Bảng preview quan hệ"
            description="Quan hệ cha, mẹ, vợ/chồng và con chưa được phân tích trong phase này. Hệ thống không tự nối quan hệ mơ hồ."
          />
          <EmptyPreviewTable
            title="Ứng viên trùng và cột chưa map"
            description="Chưa chạy duplicate detection vì chưa có parser Excel. Không auto merge, không auto delete và không auto link quan hệ khi thiếu xác nhận."
          />
        </div>
      ) : null}
    </div>
  );
}

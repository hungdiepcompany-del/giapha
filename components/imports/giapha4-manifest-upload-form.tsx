"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { GiaPha4ManifestUploadResult } from "@/lib/import/giapha4/manifest-upload-service";

type UploadState =
  | {
      status: "idle";
      message: string | null;
      data: GiaPha4ManifestUploadResult | null;
    }
  | {
      status: "loading";
      message: string;
      data: null;
    }
  | {
      status: "success" | "error";
      message: string;
      data: GiaPha4ManifestUploadResult | null;
    };

const initialState: UploadState = {
  status: "idle",
  message: null,
  data: null,
};

function formatBytes(value: number) {
  if (value <= 0) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
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

export function GiaPha4ManifestUploadForm() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>(initialState);

  const selectedFileSummary = useMemo(() => {
    if (!selectedFile) return "Chưa chọn file.";
    const lowerName = selectedFile.name.toLowerCase();
    const extension = lowerName.endsWith(".xlsx")
      ? ".xlsx"
      : lowerName.endsWith(".xls")
        ? ".xls"
        : "không rõ";

    return `Đã chọn file ${extension}, dung lượng ${formatBytes(selectedFile.size)}.`;
  }, [selectedFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setState({
        status: "error",
        message: "Vui lòng chọn file Gia Phả 4 định dạng .xlsx.",
        data: null,
      });
      return;
    }

    setState({
      status: "loading",
      message: "Đang đọc file...",
      data: null,
    });

    const formData = new FormData();
    formData.append("giapha4_manifest_file", selectedFile);

    try {
      const response = await fetch("/api/admin/import-sessions/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as GiaPha4ManifestUploadResult;

      setState({
        status: response.ok ? "success" : "error",
        message: data.message,
        data,
      });

      if (response.ok) router.refresh();
    } catch {
      setState({
        status: "error",
        message: "Không đọc được file Gia Phả 4.",
        data: null,
      });
    }
  }

  const messageTone =
    state.status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <section className="grid gap-5 rounded-lg border border-stone-200 bg-[#fffaf0] p-5 shadow-sm">
      <div className="grid gap-2">
        <div className="text-sm font-semibold uppercase tracking-normal text-teal-800">
          A-16I - Upload staging
        </div>
        <h2 className="text-xl font-bold text-stone-950">
          Tải lên file Gia Phả 4
        </h2>
        <p className="text-sm leading-6 text-stone-700">
          Chỉ ghi vào vùng staging, chưa nhập vào cây gia phả thật.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="block rounded-lg border border-dashed border-teal-300 bg-teal-50 p-4">
          <span className="text-sm font-semibold text-stone-900">
            Chọn file
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
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
            {state.status === "loading"
              ? "Đang đọc file..."
              : "Đọc file và tạo manifest"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setState(initialState);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800"
          >
            Chọn lại
          </button>
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-stone-300 bg-stone-100 px-5 py-3 text-sm font-semibold text-stone-500"
          >
            Xác nhận nhập chính thức — chưa mở
          </button>
        </div>
      </form>

      {state.message ? (
        <div className={`rounded-lg border p-4 text-sm leading-6 ${messageTone}`}>
          {state.status === "success"
            ? "Đã tạo manifest staging"
            : "Không đọc được file Gia Phả 4"}
          <div className="mt-1">{state.message}</div>
        </div>
      ) : null}

      {state.data ? (
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Dòng staging"
              value={state.data.summary.rowCount}
            />
            <MetricCard
              label="Thành viên staging"
              value={state.data.summary.personCandidateCount}
            />
            <MetricCard
              label="Quan hệ staging"
              value={state.data.summary.relationshipCandidateCount}
            />
            <MetricCard
              label="Cảnh báo"
              value={state.data.summary.warningCount}
            />
          </div>

          {state.data.summary.parseSummary ? (
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
              <div className="font-bold">Đã nhận diện sheet Thành viên</div>
              <div className="mt-1">
                Đã đọc mã Gia Phả 4 cho{" "}
                {state.data.summary.parseSummary.peopleRowsMapped} thành viên.
                Quan hệ cha/mẹ được tạo từ Mã GP Bố/Mã GP Mẹ:{" "}
                {state.data.summary.parseSummary.parentRelationshipsMapped}.
              </div>
              <div className="mt-1">
                Dữ liệu này vẫn chỉ nằm ở staging, chưa nhập vào cây gia phả
                thật.
              </div>
            </div>
          ) : null}

          {state.data.warnings.length > 0 ? (
            <div className="grid gap-2">
              {state.data.warnings.slice(0, 6).map((warning, index) => (
                <div
                  key={`${warning.warningCode}-${warning.rowIndex ?? index}`}
                  className="rounded-md border border-amber-200 bg-white p-3 text-sm leading-6 text-amber-950"
                >
                  <div className="font-semibold">{warning.messageVi}</div>
                  <div className="text-xs text-amber-800">
                    {warning.warningCode}
                    {warning.rowIndex ? ` - dòng ${warning.rowIndex}` : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

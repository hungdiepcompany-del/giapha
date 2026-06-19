"use client";

type TreeEditorToolbarProps = {
  nodeCount: number;
  positionsJson: string;
  saveAction: (formData: FormData) => void | Promise<void>;
  resetAction: (formData: FormData) => void | Promise<void>;
  onFitView: () => void;
  onAutoLayout: () => void;
};

export function TreeEditorToolbar({
  nodeCount,
  positionsJson,
  saveAction,
  resetAction,
  onFitView,
  onAutoLayout,
}: TreeEditorToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="text-sm font-bold text-slate-950">
          Trình sửa cây gia phả
        </div>
        <div className="mt-1 text-sm leading-6 text-slate-600">
          {nodeCount} nút. Kéo node chỉ lưu layout UI, không sửa quan hệ thật.
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onFitView}
          className="min-h-11 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
        >
          Vừa khung nhìn
        </button>
        <button
          type="button"
          onClick={onAutoLayout}
          className="min-h-11 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
        >
          Tự xếp bố cục
        </button>
        <form action={saveAction}>
          <input type="hidden" name="return_to" value="/admin/tree/edit" />
          <input type="hidden" name="positions_json" value={positionsJson} />
          <button
            type="submit"
            className="min-h-11 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Lưu layout
          </button>
        </form>
        <form action={resetAction}>
          <input type="hidden" name="return_to" value="/admin/tree/edit" />
          <button
            type="submit"
            className="min-h-11 border border-red-700 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            Đặt lại bố cục
          </button>
        </form>
      </div>
    </div>
  );
}

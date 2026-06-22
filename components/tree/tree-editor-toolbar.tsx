"use client";

type TreeEditorToolbarProps = {
  nodeCount: number;
  positionsJson: string;
  saveAction: (formData: FormData) => void | Promise<void>;
  resetAction: (formData: FormData) => void | Promise<void>;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAutoLayout: () => void;
};

export function TreeEditorToolbar({
  nodeCount,
  positionsJson,
  saveAction,
  resetAction,
  onFitView,
  onZoomIn,
  onZoomOut,
  onAutoLayout,
}: TreeEditorToolbarProps) {
  const secondaryButton =
    "min-h-10 border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900";

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-4">
      <div>
        <div className="text-base font-bold text-slate-950">Cây gia phả</div>
        <div className="mt-1 text-sm leading-6 text-slate-600">
          {nodeCount} thẻ đang hiển thị. Kéo thẻ chỉ đổi bố cục, không thay đổi
          quan hệ gia đình.
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onFitView} className={secondaryButton}>
          Vừa màn hình
        </button>
        <button type="button" onClick={onZoomIn} className={secondaryButton}>
          Phóng to
        </button>
        <button type="button" onClick={onZoomOut} className={secondaryButton}>
          Thu nhỏ
        </button>
        <button type="button" onClick={onAutoLayout} className={secondaryButton}>
          Sắp xếp lại cây
        </button>
        <form action={saveAction}>
          <input type="hidden" name="return_to" value="/admin/tree/edit" />
          <input type="hidden" name="positions_json" value={positionsJson} />
          <button
            type="submit"
            className="min-h-10 border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Lưu bố cục
          </button>
        </form>
        <form action={resetAction}>
          <input type="hidden" name="return_to" value="/admin/tree/edit" />
          <button type="submit" className={secondaryButton}>
            Khôi phục bố cục tự động
          </button>
        </form>
      </div>
    </div>
  );
}

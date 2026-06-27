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
    "min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-900 transition hover:border-[#245744] hover:text-[#245744]";

  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 bg-[#fffaf0] p-4">
      <div>
        <div className="text-base font-bold text-stone-950">
          Cây gia phả · Chế độ chỉnh sửa
        </div>
        <div className="mt-1 text-sm leading-6 text-stone-600">
          {nodeCount} thẻ đang hiển thị. Kéo thẻ chỉ đổi bố cục, không thay đổi
          quan hệ gia đình. Bấm một người để mở bảng chi tiết bên phải.
        </div>
      </div>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
        Sau khi kéo thẻ, bấm “Lưu bố cục” để ghi vị trí mới. Các nút thêm
        người thân nằm trong bảng chi tiết bên phải và dùng action hiện có.
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onFitView}
          className={secondaryButton}
          title="Đưa toàn bộ cây vào khung nhìn"
          aria-label="Vừa màn hình"
        >
          Vừa màn hình
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          className={secondaryButton}
          title="Phóng to cây gia phả"
          aria-label="Phóng to"
        >
          Phóng to
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className={secondaryButton}
          title="Thu nhỏ cây gia phả"
          aria-label="Thu nhỏ"
        >
          Thu nhỏ
        </button>
        <button
          type="button"
          onClick={onAutoLayout}
          className={secondaryButton}
          title="Đưa cây về giữa và sắp xếp lại tự động"
          aria-label="Đưa cây về giữa"
        >
          Đưa cây về giữa
        </button>
        <form action={saveAction}>
          <input type="hidden" name="return_to" value="/admin/tree/edit" />
          <input type="hidden" name="positions_json" value={positionsJson} />
          <button
            type="submit"
            className="min-h-11 rounded-md border border-[#245744] bg-[#245744] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1f4939]"
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

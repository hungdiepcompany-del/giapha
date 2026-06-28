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
    "min-h-11 rounded-lg border border-stone-200 bg-white px-3 py-2 text-center text-sm font-semibold text-stone-800 shadow-sm transition hover:border-[#245744] hover:text-[#245744]";

  return (
    <div className="flex flex-col gap-3 border-b border-stone-200 bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="break-words text-base font-bold text-stone-950">
            Công cụ chỉnh sửa phả đồ
          </div>
          <div className="mt-1 text-sm leading-6 text-stone-600">
            {nodeCount} thẻ đang hiển thị. Kéo thẻ chỉ đổi bố cục giao diện,
            không thay đổi quan hệ gia đình.
          </div>
        </div>
        <div className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
          Chế độ chỉnh sửa
        </div>
      </div>

      <div className="grid gap-2 md:flex md:flex-wrap md:items-center md:justify-between">
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={onFitView}
            className={secondaryButton}
            title="Đưa toàn bộ cây vào khung nhìn"
            aria-label="Căn giữa"
          >
            Căn giữa
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
            aria-label="Sắp xếp lại"
          >
            Sắp xếp lại
          </button>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
          <form action={saveAction}>
            <input type="hidden" name="return_to" value="/admin/tree/edit" />
            <input type="hidden" name="positions_json" value={positionsJson} />
            <button
              type="submit"
              className="min-h-11 w-full rounded-lg border border-[#245744] bg-[#245744] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f4939] sm:w-auto"
            >
              Lưu bố cục
            </button>
          </form>
          <form action={resetAction}>
            <input type="hidden" name="return_to" value="/admin/tree/edit" />
            <button type="submit" className={secondaryButton}>
              Khôi phục tự động
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
        Chọn một thành viên để mở bảng thao tác: Thêm cha, Thêm mẹ, Thêm
        vợ/chồng, Thêm con, Sửa hồ sơ hoặc kiểm tra trước khi xóa mềm.
      </div>
    </div>
  );
}

"use client";

type FamilyTreeToolbarProps = {
  searchQuery: string;
  searchStatus: string | null;
  personCount: number;
  nodeCount: number;
  onSearchChange: (value: string) => void;
  onFocusSearch: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetLayout: () => void;
};

export function FamilyTreeToolbar({
  searchQuery,
  searchStatus,
  personCount,
  nodeCount,
  onSearchChange,
  onFocusSearch,
  onFitView,
  onZoomIn,
  onZoomOut,
  onResetLayout,
}: FamilyTreeToolbarProps) {
  const secondaryButton =
    "min-h-11 rounded-full border border-amber-900/15 bg-white/90 px-3 py-2 text-center text-sm font-semibold text-stone-900 shadow-sm transition hover:border-[#245744] hover:bg-[#f6efe2] hover:text-[#245744]";

  return (
    <div className="flex flex-col gap-3 border-b border-amber-900/10 bg-[#fff8e8]/95 p-3 backdrop-blur sm:p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="text-base font-bold text-stone-950">Tìm trong phả đồ</div>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
          Kéo để di chuyển cây, cuộn để phóng to hoặc thu nhỏ, bấm vào một
          người để xem thông tin. Dùng nút “Vừa màn hình” hoặc “Đưa cây về giữa”
          khi muốn căn giữa phả đồ.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(220px,380px)_auto]">
          <label className="block">
            <span className="text-sm font-semibold text-stone-800">
              Tìm người trong cây
            </span>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onFocusSearch();
                }
              }}
              className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base outline-none transition focus:border-[#245744] focus:ring-2 focus:ring-[#245744]/15"
              placeholder="Nhập họ tên hoặc tên thường gọi"
            />
          </label>
          <button
            type="button"
            onClick={onFocusSearch}
            className="min-h-11 self-end rounded-full border border-[#245744] bg-[#245744] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f4939]"
            title="Đưa người được tìm thấy vào giữa khung nhìn"
          >
            Tìm người
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
        <div className="rounded-full border border-amber-900/10 bg-white px-3 py-2 text-center text-sm font-semibold text-stone-700 shadow-sm">
          {personCount} người / {nodeCount} nút
        </div>
        {searchStatus ? (
          <div
            aria-live="polite"
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900"
          >
            {searchStatus}
          </div>
        ) : null}
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
          onClick={onResetLayout}
          className={secondaryButton}
          title="Đưa cây về giữa và sắp xếp lại trong chế độ xem"
          aria-label="Đưa cây về giữa"
        >
          Đưa cây về giữa
        </button>
      </div>
    </div>
  );
}

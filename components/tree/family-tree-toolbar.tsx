"use client";

type FamilyTreeToolbarProps = {
  searchQuery: string;
  searchStatus: string | null;
  personCount: number;
  nodeCount: number;
  onSearchChange: (value: string) => void;
  onFocusSearch: () => void;
  onFitView: () => void;
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
  onResetLayout,
}: FamilyTreeToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 bg-[#fffaf0] p-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="text-base font-bold text-stone-950">Tìm trong cây</div>
        <p className="mt-1 max-w-xl text-sm leading-6 text-stone-600">
          Nhập tên để đưa người thân vào giữa khung nhìn. Có thể kéo nền để di
          chuyển và cuộn để phóng to hoặc thu nhỏ.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(220px,360px)_auto]">
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
              className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base outline-none focus:border-stone-900"
              placeholder="Nhập họ tên hoặc tên thường gọi"
            />
          </label>
          <button
            type="button"
            onClick={onFocusSearch}
            className="min-h-11 self-end rounded-md border border-stone-900 bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Tìm người
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700">
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
          className="min-h-11 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
          title="Đưa toàn bộ cây vào khung nhìn"
        >
          Vừa màn hình
        </button>
        <button
          type="button"
          onClick={onResetLayout}
          className="min-h-11 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
          title="Sắp xếp lại cây tự động trong chế độ xem"
        >
          Sắp xếp lại
        </button>
      </div>
    </div>
  );
}

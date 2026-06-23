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
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="text-base font-bold text-slate-950">Tìm trong cây</div>
        <div className="mt-1 grid gap-2 sm:grid-cols-[minmax(220px,360px)_auto]">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
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
            className="mt-1 min-h-11 w-full border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            placeholder="Nhập họ tên hoặc tên hiển thị"
          />
        </label>
        <button
          type="button"
          onClick={onFocusSearch}
          className="min-h-11 self-end border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Tìm
        </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {personCount} người / {nodeCount} nút
        </div>
        {searchStatus ? (
          <div
            aria-live="polite"
            className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900"
          >
            {searchStatus}
          </div>
        ) : null}
        <button
          type="button"
          onClick={onFitView}
          className="min-h-11 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
        >
          Vừa khung nhìn
        </button>
        <button
          type="button"
          onClick={onResetLayout}
          className="min-h-11 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
        >
          Đặt lại bố cục
        </button>
      </div>
    </div>
  );
}

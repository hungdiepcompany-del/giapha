import { AdminWarningBadge } from "@/components/genealogy/admin-warning-badge";
import type { InlineAdminWarning } from "@/lib/family/inline-warning-types";

export function AdminWarningList({
  warnings,
  title = "Cảnh báo trong phạm vi đang xem",
  emptyMessage = "Chưa có cảnh báo từ dữ liệu đang hiển thị. Trạng thái này không có nghĩa là toàn bộ cây đã được quét.",
  className = "",
}: {
  warnings: InlineAdminWarning[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}) {
  return (
    <section
      className={`border border-slate-200 bg-white p-4 ${className}`}
      aria-label={title}
    >
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      {warnings.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {warnings.map((item) => (
            <li
              key={item.code}
              className="border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <AdminWarningBadge severity={item.severity} />
                <h3 className="text-sm font-bold text-slate-950">
                  {item.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {item.message}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Việc tiếp theo: {item.action}
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Cảnh báo này chỉ dùng dữ liệu đã tải trên trang quản trị, không lưu
        trạng thái và không hiển thị trên trang công khai.
      </p>
    </section>
  );
}

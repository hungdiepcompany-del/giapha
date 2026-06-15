import Link from "next/link";

export function FamilyTreeEmptyState() {
  return (
    <div className="border border-slate-200 bg-white p-6 text-slate-700">
      <h2 className="text-lg font-bold text-slate-950">Chưa có dữ liệu cây</h2>
      <p className="mt-2 text-sm">
        Cây sẽ xuất hiện sau khi có thành viên và quan hệ gia đình chưa bị xóa
        mềm.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/admin/people"
          className="inline-flex min-h-11 items-center border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
        >
          Mở thành viên
        </Link>
        <Link
          href="/admin/relationships"
          className="inline-flex min-h-11 items-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Mở quan hệ gia đình
        </Link>
      </div>
    </div>
  );
}

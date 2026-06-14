import { AdminShell } from "@/components/layout/admin-shell";

const futureModules = [
  "Thành viên",
  "Quan hệ gia đình",
  "Cây gia phả",
  "Lịch sử chỉnh sửa",
  "Backup/Export",
];

export default function AdminPage() {
  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="space-y-3 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Phase 1 foundation
          </p>
          <h1 className="text-3xl font-bold text-slate-950">
            Quản trị GIA PHẢ
          </h1>
        </div>

        <div className="mt-8">
          <h2 className="text-base font-semibold text-slate-900">
            Các module tương lai
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {futureModules.map((moduleName) => (
              <li
                key={moduleName}
                className="border border-slate-200 bg-white px-4 py-3 text-slate-700"
              >
                {moduleName}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AdminShell>
  );
}

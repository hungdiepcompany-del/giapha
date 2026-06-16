import { AdminShell } from "@/components/layout/admin-shell";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

const foundationChecks = [
  "npm run check:foundation",
  "npm run check:auth-permissions",
  "npm run check:people",
  "npm run check:relationships",
  "npm run check:tree-viewer",
  "npm run check:tree-editor",
  "npm run check:public-privacy",
  "npm run check:export-backup",
  "npm run check:revisions",
  "npm run check:import-json",
  "npm run check:env:safe",
  "npm run check:migrations",
  "npm run typecheck",
  "npm run lint",
  "npm run build",
];

function statusLabel(value: boolean) {
  return value ? "yes" : "no";
}

export default async function AdminSystemStatusPage() {
  const context = await getPermissionContext();
  const canView =
    context.permissions.includes("settings.manage") ||
    context.permissions.includes("permissions.manage");
  const configStatus = [
    {
      label: "Supabase URL configured",
      value: statusLabel(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)),
    },
    {
      label: "Anon key configured",
      value: statusLabel(Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)),
    },
    {
      label: "Service role configured server-side",
      value: statusLabel(Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)),
    },
  ];

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Supabase integration gate
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            System status
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Trang này chỉ hiển thị trạng thái cấu hình dạng yes/no và danh sách
            check nền. Không hiển thị secret và không query dữ liệu nhạy cảm.
          </p>
        </div>

        {!canView ? (
          <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Cần quyền settings.manage hoặc permissions.manage để xem system
            status.
          </div>
        ) : (
          <div className="mt-6 grid gap-6">
            <div className="grid gap-3 md:grid-cols-3">
              {configStatus.map((item) => (
                <div
                  key={item.label}
                  className="border border-slate-200 bg-white p-4"
                >
                  <div className="text-sm font-semibold text-slate-700">
                    {item.label}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-950">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-slate-200 bg-white p-5">
              <h2 className="text-base font-bold text-slate-950">
                Foundation checks
              </h2>
              <ul className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                {foundationChecks.map((check) => (
                  <li key={check} className="font-mono">
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

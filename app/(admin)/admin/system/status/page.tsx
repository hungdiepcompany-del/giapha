import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
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
  return value ? "Có" : "Không";
}

export default async function AdminSystemStatusPage() {
  const context = await getPermissionContext();
  const canView =
    context.permissions.includes("settings.manage") ||
    context.permissions.includes("permissions.manage");
  const configStatus = [
    {
      label: "Đã cấu hình Supabase URL",
      value: statusLabel(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)),
    },
    {
      label: "Đã cấu hình anon key",
      value: statusLabel(Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)),
    },
    {
      label: "Đã cấu hình service role phía server",
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
        <PageHeader
          eyebrow="Cổng kiểm tra tích hợp Supabase"
          title="Trạng thái hệ thống"
          description="Trang này chỉ hiển thị trạng thái cấu hình dạng có/không và danh sách check nền. Không hiển thị secret và không query dữ liệu nhạy cảm."
        />

        {!canView ? (
          <StatusCallout tone="warning" className="mt-6">
            Cần quyền settings.manage hoặc permissions.manage để xem trạng thái
            hệ thống.
          </StatusCallout>
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
                Các lệnh kiểm tra nền tảng
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

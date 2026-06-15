import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { PublicTreeShell } from "@/components/public/public-tree-shell";
import { getPublicFamilyTreeGraph } from "@/lib/family/public-family-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

export default async function AdminPublicPreviewPage() {
  const context = await getPermissionContext();
  const canPreview =
    context.permissions.includes("settings.manage") ||
    context.permissions.includes("people.view");
  const result = canPreview
    ? await getPublicFamilyTreeGraph()
    : {
        ok: false as const,
        error:
          context.reason === "missing_supabase_config"
            ? "Chưa cấu hình Supabase."
            : "Bạn chưa có quyền xem preview public.",
      };

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Public privacy preview
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Người ngoài sẽ thấy gì
            </h1>
          </div>
          <Link
            href="/tree"
            className="inline-flex min-h-11 items-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Mở public tree
          </Link>
        </div>

        <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Preview này dùng cùng public service với `/tree`, không dùng dữ liệu
          admin chưa sanitize.
        </div>

        <div className="mt-6">
          <PublicTreeShell result={result} />
        </div>
      </section>
    </AdminShell>
  );
}

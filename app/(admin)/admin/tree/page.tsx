import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { FamilyTreeErrorState } from "@/components/tree/family-tree-error-state";
import { FamilyTreeViewer } from "@/components/tree/family-tree-viewer";
import { getAdminFamilyTreeGraph } from "@/lib/family/tree-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

export default async function AdminTreePage() {
  const context = await getPermissionContext();
  const canViewTree = context.permissions.includes("tree.view");
  const canEditLayout = context.permissions.includes("tree.edit_layout");
  const result = canViewTree
    ? await getAdminFamilyTreeGraph()
    : {
        ok: false as const,
        error:
          context.reason === "missing_supabase_config"
            ? "Chưa cấu hình Supabase."
            : "Bạn chưa có quyền xem cây gia phả.",
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
              Tree viewer foundation
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Cây gia phả
            </h1>
          </div>
          {canEditLayout ? (
            <Link
              href="/admin/tree/edit"
              className="inline-flex min-h-11 items-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Chỉnh sửa cây
            </Link>
          ) : null}
        </div>

        <div className="mt-6">
          {result.ok ? (
            <FamilyTreeViewer graph={result.data} />
          ) : (
            <FamilyTreeErrorState message={result.error} />
          )}
        </div>
      </section>
    </AdminShell>
  );
}

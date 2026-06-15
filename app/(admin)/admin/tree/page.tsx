import { AdminShell } from "@/components/layout/admin-shell";
import { FamilyTreeErrorState } from "@/components/tree/family-tree-error-state";
import { FamilyTreeViewer } from "@/components/tree/family-tree-viewer";
import { getAdminFamilyTreeGraph } from "@/lib/family/tree-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

export default async function AdminTreePage() {
  const context = await getPermissionContext();
  const canViewTree = context.permissions.includes("tree.view");
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
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Tree viewer foundation
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Cây gia phả
          </h1>
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

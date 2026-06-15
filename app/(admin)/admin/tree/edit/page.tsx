import { AdminShell } from "@/components/layout/admin-shell";
import { FamilyTreeEditor } from "@/components/tree/family-tree-editor";
import { FamilyTreeErrorState } from "@/components/tree/family-tree-error-state";
import {
  addChildFromTreeAction,
  addParentFromTreeAction,
  addSpouseFromTreeAction,
  resetTreeLayoutAction,
  saveTreeLayoutAction,
} from "@/app/(admin)/admin/tree/edit/actions";
import { applySavedLayoutToGraph } from "@/lib/family/tree-layout-service";
import { getAdminFamilyTreeGraph } from "@/lib/family/tree-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

type AdminTreeEditPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AdminTreeEditPage({
  searchParams,
}: AdminTreeEditPageProps) {
  const query = await searchParams;
  const context = await getPermissionContext();
  const canViewTree = context.permissions.includes("tree.view");
  const canEditLayout = context.permissions.includes("tree.edit_layout");
  const canCreateRelationships = context.permissions.includes(
    "relationships.create",
  );
  const graphResult =
    canViewTree && canEditLayout
      ? await getAdminFamilyTreeGraph()
      : {
          ok: false as const,
          error:
            context.reason === "missing_supabase_config"
              ? "Chưa cấu hình Supabase."
              : !canViewTree
                ? "Bạn chưa có quyền xem cây gia phả."
                : "Bạn chưa có quyền chỉnh sửa layout cây.",
        };
  const result = graphResult.ok
    ? await applySavedLayoutToGraph(graphResult.data)
    : graphResult;

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Tree editor foundation
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Chỉnh sửa cây
          </h1>
        </div>

        {query.error ? (
          <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {query.error}
          </div>
        ) : null}

        {query.saved ? (
          <div className="mt-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Đã lưu thay đổi: {query.saved}
          </div>
        ) : null}

        <div className="mt-6">
          {result.ok ? (
            <FamilyTreeEditor
              graph={result.data}
              canCreateRelationships={canCreateRelationships}
              saveLayoutAction={saveTreeLayoutAction}
              resetLayoutAction={resetTreeLayoutAction}
              addParentAction={addParentFromTreeAction}
              addSpouseAction={addSpouseFromTreeAction}
              addChildAction={addChildFromTreeAction}
            />
          ) : (
            <FamilyTreeErrorState message={result.error} />
          )}
        </div>
      </section>
    </AdminShell>
  );
}

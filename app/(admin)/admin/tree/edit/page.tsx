import { addChildFromTreeAction, addParentFromTreeAction, addSpouseFromTreeAction, resetTreeLayoutAction, saveTreeLayoutAction } from "@/app/(admin)/admin/tree/edit/actions";
import { AdminShell } from "@/components/layout/admin-shell";
import { FamilyTreeEditor } from "@/components/tree/family-tree-editor";
import { FamilyTreeErrorState } from "@/components/tree/family-tree-error-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
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
        <PageHeader
          eyebrow="Nền tảng chỉnh sửa cây gia phả"
          title="Chỉnh sửa cây"
          description="Bấm một nút thành viên để mở bảng chi tiết, kéo nút để chỉnh bố cục UI, rồi bấm lưu bố cục. Quan hệ thật chỉ đổi qua form có chủ đích."
        />

        {query.error ? (
          <StatusCallout tone="danger" className="mt-6">
            {query.error}
          </StatusCallout>
        ) : null}

        {query.saved ? (
          <StatusCallout tone="success" className="mt-6">
            Đã lưu thay đổi: {query.saved}
          </StatusCallout>
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

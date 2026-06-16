import { AdminShell } from "@/components/layout/admin-shell";
import { FamilyTreeErrorState } from "@/components/tree/family-tree-error-state";
import { FamilyTreeViewer } from "@/components/tree/family-tree-viewer";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
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
        <PageHeader
          eyebrow="Tree viewer foundation"
          title="Cây gia phả"
          description="Viewer chỉ đọc dữ liệu quan hệ thật. Dùng tìm kiếm, fit view và reset layout để xem nhanh toàn bộ cây."
          actions={
            canEditLayout ? (
              <ActionLink href="/admin/tree/edit" variant="primary">
                Chỉnh sửa cây
              </ActionLink>
            ) : null
          }
        />

        <StatusCallout tone="info" className="mt-6">
          Trang này không sửa quan hệ. Nếu cần kéo node hoặc lưu layout, vào
          chế độ chỉnh sửa cây.
        </StatusCallout>

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

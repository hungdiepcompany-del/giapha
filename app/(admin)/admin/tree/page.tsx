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
      <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10">
        <PageHeader
          eyebrow="Nền tảng xem cây gia phả"
          title="Phả đồ gia đình"
          description="Màn hình xem chỉ đọc dữ liệu quan hệ thật. Dùng tìm kiếm, căn giữa, phóng to và thu nhỏ để xem nhanh toàn bộ cây."
          actions={
            canEditLayout ? (
              <ActionLink href="/admin/tree/edit" variant="primary">
                Mở công cụ chỉnh sửa
              </ActionLink>
            ) : null
          }
        />

        <StatusCallout tone="info" className="mt-6">
          Trang này không sửa quan hệ. Nếu cần kéo thẻ, lưu layout hoặc thêm
          người thân, hãy vào chế độ chỉnh sửa cây.
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

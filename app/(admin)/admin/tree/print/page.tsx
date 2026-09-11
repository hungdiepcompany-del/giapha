import { AdminShell } from "@/components/layout/admin-shell";
import { TreePrintWorkspace } from "@/components/tree-print/tree-print-workspace";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import { getAdminFamilyTreeGraph } from "@/lib/family/tree-service";
import { layoutFamilyTreeGraph } from "@/lib/family/tree-layout-elk";
import { getPermissionContext } from "@/lib/permissions/permission-service";

export const dynamic = "force-dynamic";

function safePrintError(reason?: string) {
  if (reason === "missing_supabase_config" || reason === "missing_admin_config") {
    return "Chưa cấu hình Supabase.";
  }

  if (reason === "anonymous") {
    return "Không đủ quyền truy cập bản in.";
  }

  return "Không thể tạo bản xem trước cây gia phả.";
}

export default async function AdminTreePrintPage() {
  const context = await getPermissionContext();
  const canViewTree = context.permissions.includes("tree.view");
  const graphResult = canViewTree
    ? await getAdminFamilyTreeGraph()
    : {
        ok: false as const,
        reason: context.reason ?? "missing_tree.view",
      };
  const layoutedGraph = graphResult.ok
    ? await layoutFamilyTreeGraph(graphResult.data)
    : null;

  return (
    <AdminShell
      userEmail={context.user?.email}
      roles={context.roles.map((role) => role.code)}
      permissions={context.permissions}
    >
      <section data-tree-print-page="true" className="mx-auto w-full max-w-[1800px] px-3 py-5 sm:px-5 sm:py-7">
        <div data-tree-print-screen-preview="true">
          <PageHeader
          eyebrow="Bản in vector"
          title="Xem bản in toàn cây"
          description="Không gian xem trước chỉ đọc để kiểm tra toàn bộ phả đồ bằng SVG, phóng to sâu không mờ và xem chẩn đoán bố cục."
          actions={
            <ActionLink href="/admin/tree" variant="secondary">
              Quay lại xem cây
            </ActionLink>
          }
          />
        </div>

        <div data-tree-print-route-content="true" className="mt-6">
          {!graphResult.ok ? (
            <StatusCallout tone="danger">
              {safePrintError(graphResult.reason)}
            </StatusCallout>
          ) : layoutedGraph && layoutedGraph.nodes.length > 0 ? (
            <TreePrintWorkspace graph={layoutedGraph} />
          ) : (
            <StatusCallout tone="info">
              Chưa có dữ liệu gia phả để hiển thị.
            </StatusCallout>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

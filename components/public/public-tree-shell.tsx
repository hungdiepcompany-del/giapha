import { PublicShell } from "@/components/layout/public-shell";
import { FamilyTreeEmptyState } from "@/components/tree/family-tree-empty-state";
import { FamilyTreeErrorState } from "@/components/tree/family-tree-error-state";
import { FamilyTreeViewer } from "@/components/tree/family-tree-viewer";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCallout } from "@/components/ui/status-callout";
import type { FamilyTreeGraph } from "@/lib/family/tree-types";

type PublicTreeShellProps = {
  result:
    | {
        ok: true;
        data: FamilyTreeGraph;
      }
    | {
        ok: false;
        error: string;
      };
};

function publicTreeErrorMessage(error: string) {
  if (!error.trim()) {
    return "Không tìm thấy gia phả được yêu cầu hoặc bạn chưa có quyền xem.";
  }

  if (
    error.toLowerCase().includes("supabase") ||
    error.toLowerCase().includes("permission") ||
    error.toLowerCase().includes("policy") ||
    error.toLowerCase().includes("relation")
  ) {
    return "Cây gia phả công khai chưa sẵn sàng hiển thị. Gia đình có thể đang cập nhật dữ liệu hoặc quyền xem.";
  }

  return error;
}

export function PublicTreeShell({ result }: PublicTreeShellProps) {
  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <PageHeader
          eyebrow="Cây gia phả công khai"
          title="Khám phá cây gia phả"
          description="Chế độ công khai chỉ đọc và đã lọc dữ liệu riêng tư. Người còn sống không hiển thị thông tin nhạy cảm."
        />

        <StatusCallout tone="info" title="Cách xem cây" className="mt-6">
          Kéo nền để di chuyển, cuộn để phóng to hoặc thu nhỏ, dùng ô tìm kiếm
          để tập trung vào một người. Trang này không cho chỉnh sửa cây hoặc lưu
          bố cục.
        </StatusCallout>

        <div className="mt-6">
          {result.ok ? (
            result.data.nodes.length > 0 ? (
              <FamilyTreeViewer graph={result.data} />
            ) : (
              <FamilyTreeEmptyState mode="public" />
            )
          ) : (
            <FamilyTreeErrorState message={publicTreeErrorMessage(result.error)} />
          )}
        </div>
      </section>
    </PublicShell>
  );
}

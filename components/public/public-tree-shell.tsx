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

export function PublicTreeShell({ result }: PublicTreeShellProps) {
  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <PageHeader
          eyebrow="Cây gia phả công khai"
          title="Cây gia phả công khai"
          description="Chế độ công khai chỉ đọc và đã lọc dữ liệu riêng tư. Người còn sống không hiển thị thông tin nhạy cảm."
        />

        <StatusCallout tone="info" className="mt-6">
          Dùng ô tìm kiếm trong toolbar để tập trung vào một người. Trang này
          không cho chỉnh sửa cây hoặc lưu layout.
        </StatusCallout>

        <div className="mt-6">
          {result.ok ? (
            result.data.nodes.length > 0 ? (
              <FamilyTreeViewer graph={result.data} />
            ) : (
              <FamilyTreeEmptyState />
            )
          ) : (
            <FamilyTreeErrorState message={result.error} />
          )}
        </div>
      </section>
    </PublicShell>
  );
}

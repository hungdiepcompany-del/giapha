import { PublicShell } from "@/components/layout/public-shell";
import { FamilyTreeEmptyState } from "@/components/tree/family-tree-empty-state";
import { FamilyTreeErrorState } from "@/components/tree/family-tree-error-state";
import { FamilyTreeViewer } from "@/components/tree/family-tree-viewer";
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
    return "Gia phả này đang được giới hạn quyền xem.";
  }

  if (
    error.toLowerCase().includes("supabase") ||
    error.toLowerCase().includes("permission") ||
    error.toLowerCase().includes("policy") ||
    error.toLowerCase().includes("relation")
  ) {
    return "Không thể tải phả đồ. Vui lòng thử lại sau.";
  }

  return error;
}

function publicTreeStats(graph: FamilyTreeGraph) {
  const generationCount = new Set(
    graph.nodes
      .filter((node) => node.kind === "person" && node.generationNumber)
      .map((node) => (node.kind === "person" ? node.generationNumber : null)),
  ).size;

  return [
    ["Thành viên", graph.meta.personCount.toLocaleString("vi-VN")],
    ["Thế hệ", generationCount > 0 ? generationCount.toLocaleString("vi-VN") : "Chưa rõ"],
    ["Nhánh quan hệ", graph.meta.familyCount.toLocaleString("vi-VN")],
    ["Dữ liệu", "Công khai đã lọc"],
  ];
}

export function PublicTreeShell({ result }: PublicTreeShellProps) {
  const stats = result.ok ? publicTreeStats(result.data) : [];

  return (
    <PublicShell>
      <section
        data-ui-phase="A15A3_VIETNAMESE_HERITAGE_PUBLIC_TREE_VIEW_UI"
        className="mx-auto w-full max-w-[1760px] px-3 py-6 sm:px-5 sm:py-6"
      >
        <div className="overflow-hidden rounded-xl border border-amber-900/15 bg-[#fff8e8] shadow-sm">
          <div className="border-b border-amber-900/10 bg-[linear-gradient(135deg,#7a2f24,#8a4b2a_52%,#245744)] px-4 py-5 text-amber-50 sm:px-6 sm:py-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-normal text-amber-100">
                  Phả đồ công khai
                </p>
                <h1 className="mt-2 break-words text-2xl font-black leading-tight sm:text-4xl">
                  Gia phả dòng họ
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-amber-50/90">
                  Không gian gia tộc số để con cháu cùng xem cội nguồn, các đời
                  nối tiếp và quan hệ thân tộc đã được gia đình cho phép công khai.
                </p>
              </div>
              {stats.length > 0 ? (
                <dl className="grid gap-2 sm:grid-cols-2 lg:w-[440px]">
                  {stats.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-amber-100/20 bg-white/10 px-3 py-2 backdrop-blur"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-normal text-amber-100">
                        {label}
                      </dt>
                      <dd className="mt-1 text-base font-bold text-white">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 border-b border-amber-900/10 bg-[#fffaf0] px-4 py-3 text-sm leading-6 text-stone-700 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <p>
              <span className="font-bold text-stone-950">Cách xem phả đồ: </span>
              Kéo nền để di chuyển, cuộn để phóng to hoặc thu nhỏ, dùng ô tìm
              kiếm để tập trung vào một người. Trang này không cho chỉnh sửa cây
              hoặc lưu bố cục.
            </p>
            <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#245744]/20 bg-white px-4 py-2 text-center font-semibold text-[#245744]">
              Công khai chỉ đọc
            </span>
          </div>
        </div>

        <div className="mt-3">
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

import { PublicShell } from "@/components/layout/public-shell";
import { ActionLink } from "@/components/ui/action-link";
import { SectionCard } from "@/components/ui/section-card";

type PublicHomeProps = {
  peopleCount?: number;
  treeNodeCount?: number;
};

export function PublicHome({ peopleCount, treeNodeCount }: PublicHomeProps) {
  return (
    <PublicShell>
      <section className="mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-7xl content-center gap-8 px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Gia phả số cho gia đình
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
              WEB GIA PHẢ
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              Lưu giữ thành viên, quan hệ và cây gia phả theo cách có phân quyền,
              có lịch sử chỉnh sửa và luôn có thể xuất dữ liệu ra JSON/GEDCOM/ZIP.
            </p>
            <div className="flex flex-wrap gap-3">
              <ActionLink href="/tree" variant="primary">
                Xem cây gia phả
              </ActionLink>
              <ActionLink href="/auth/login">Đăng nhập quản trị</ActionLink>
            </div>
          </div>

          <SectionCard className="grid gap-4">
            <div>
              <div className="text-3xl font-bold text-slate-950">
                {peopleCount ?? 0}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                người đang hiển thị public
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <div className="text-3xl font-bold text-slate-950">
                {treeNodeCount ?? 0}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                node cây đã lọc riêng tư
              </div>
            </div>
            <div className="border-t border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
              Người còn sống được bảo vệ: public mode không hiển thị ghi chú nội
              bộ hoặc thông tin nhạy cảm.
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 border-t border-slate-200 pt-8 text-sm leading-6 text-slate-700 md:grid-cols-3">
          <div>
            <h2 className="font-bold text-slate-950">Dữ liệu sống lâu dài</h2>
            <p className="mt-2">
              JSON là bản bảo toàn chính, GEDCOM để tương thích với hệ khác.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-950">Readonly public</h2>
            <p className="mt-2">
              Trang public chỉ xem, không có thao tác chỉnh sửa.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-slate-950">Quản trị có phân quyền</h2>
            <p className="mt-2">
              Các thay đổi gia phả nằm sau đăng nhập và permission.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

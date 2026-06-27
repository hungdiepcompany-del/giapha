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
      <section className="border-b border-stone-200 bg-[#fbf4e8]">
        <div className="mx-auto grid min-h-[calc(100vh-164px)] w-full max-w-7xl content-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-16">
          <div className="space-y-7">
            <p className="text-sm font-semibold uppercase tracking-normal text-[#8a4b2a]">
              Không gian gia phả cho cả gia đình
            </p>
            <h1 className="max-w-3xl break-words text-3xl font-bold tracking-normal text-stone-950 sm:text-5xl">
              Lưu giữ ký ức gia đình, kết nối các thế hệ
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-700">
              WEB GIA PHẢ giúp gia đình lưu thông tin dòng họ, xem cây gia phả
              trực quan, quản lý quyền riêng tư và giữ dữ liệu có thể xuất ra
              khi cần lưu trữ lâu dài.
            </p>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <ActionLink href="/tree" variant="primary">
                Khám phá cây gia phả
              </ActionLink>
              <ActionLink href="/auth/login">Đăng nhập quản trị</ActionLink>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-stone-600">
              Trang công khai chỉ để xem. Việc thêm, sửa hoặc xuất dữ liệu đầy
              đủ nằm trong khu vực quản trị và cần quyền phù hợp.
            </p>
          </div>

          <div className="rounded-md border border-[#8a4b2a]/20 bg-[#fffaf0] p-4 shadow-sm sm:p-5">
            <div className="rounded-md border border-stone-200 bg-[#fbf4e8] p-4 sm:p-5">
              <p className="text-sm font-semibold uppercase text-[#8a4b2a]">
                Sổ gia phả công khai
              </p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-md border border-stone-200 bg-white/70 p-4">
                  <div className="text-3xl font-bold text-stone-950">
                    {peopleCount ?? 0}
                  </div>
                  <div className="mt-1 text-sm text-stone-600">
                    người đang hiển thị công khai
                  </div>
                </div>
                <div className="rounded-md border border-stone-200 bg-white/70 p-4">
                  <div className="text-3xl font-bold text-stone-950">
                    {treeNodeCount ?? 0}
                  </div>
                  <div className="mt-1 text-sm text-stone-600">
                    nút cây đã lọc riêng tư
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
                Người còn sống được bảo vệ: chế độ công khai không hiển thị ghi
                chú nội bộ hoặc thông tin nhạy cảm.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 text-sm leading-6 text-stone-700 md:grid-cols-2 lg:grid-cols-4">
          <SectionCard>
            <h2 className="font-bold text-stone-950">Lưu giữ dòng họ</h2>
            <p className="mt-2">
              Ghi nhận thành viên, chi nhánh, đời thứ và câu chuyện gia đình
              theo cách dễ đọc.
            </p>
          </SectionCard>
          <SectionCard>
            <h2 className="font-bold text-stone-950">Xem cây trực quan</h2>
            <p className="mt-2">
              Theo dõi quan hệ gia đình bằng cây tương tác, chỉ đọc ở chế độ
              công khai.
            </p>
          </SectionCard>
          <SectionCard>
            <h2 className="font-bold text-stone-950">Bảo vệ riêng tư</h2>
            <p className="mt-2">
              Thông tin công khai đã được lọc; người còn sống không lộ chi tiết
              nhạy cảm.
            </p>
          </SectionCard>
          <SectionCard>
            <h2 className="font-bold text-stone-950">Dữ liệu lâu dài</h2>
            <p className="mt-2">
              Quản trị viên có thể xuất JSON/GEDCOM/ZIP để lưu trữ và chuyển hệ
              thống khi cần.
            </p>
          </SectionCard>
        </div>
      </section>
    </PublicShell>
  );
}

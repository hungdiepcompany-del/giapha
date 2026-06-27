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
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto grid min-h-[calc(100vh-164px)] w-full max-w-7xl content-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-16">
          <div className="space-y-7">
            <p className="inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-amber-100">
              Không gian gia phả cho cả gia đình
            </p>
            <h1 className="max-w-3xl break-words text-3xl font-bold tracking-normal text-stone-900 sm:text-5xl">
              Lưu giữ ký ức, kết nối các thế hệ.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">
              Cội nguồn yêu thương của dòng họ, được gìn giữ trong một không
              gian ấm áp, dễ đọc và an toàn cho mọi thành viên gia đình.
            </p>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <ActionLink
                href="/tree"
                variant="primary"
                className="rounded-full border-teal-700 bg-teal-700 px-6 text-base shadow-sm hover:bg-teal-800"
              >
                Xem cây gia phả
              </ActionLink>
              <ActionLink
                href="/auth/login"
                className="rounded-full border-stone-200 text-stone-700 shadow-sm hover:bg-stone-100"
              >
                Đăng nhập quản trị
              </ActionLink>
            </div>
            <p className="max-w-2xl text-base leading-7 text-stone-600">
              Trang công khai chỉ để xem. Các thao tác quản trị và xuất dữ liệu
              đầy đủ luôn nằm sau đăng nhập và quyền phù hợp.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-md sm:p-5">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 shadow-sm sm:p-5">
              <p className="text-sm font-semibold text-amber-800">
                Sổ gia phả công khai
              </p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-xl border border-stone-200 bg-white/90 p-4 shadow-sm">
                  <div className="text-3xl font-bold text-teal-800">
                    {peopleCount ?? 0}
                  </div>
                  <div className="mt-1 text-base text-stone-600">
                    người đang hiển thị công khai
                  </div>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white/90 p-4 shadow-sm">
                  <div className="text-3xl font-bold text-teal-800">
                    {treeNodeCount ?? 0}
                  </div>
                  <div className="mt-1 text-base text-stone-600">
                    nút cây đã lọc riêng tư
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4 text-base leading-7 text-stone-700">
                Người còn sống được bảo vệ: chế độ công khai không hiển thị ghi
                chú nội bộ hoặc thông tin nhạy cảm.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 text-base leading-7 text-stone-600 md:grid-cols-2 lg:grid-cols-4">
            <SectionCard className="rounded-2xl border-stone-200 bg-white/90 shadow-sm">
              <h2 className="font-bold text-stone-900">Lưu giữ dòng họ</h2>
              <p className="mt-2">
                Ghi nhận thành viên, chi nhánh, đời thứ và câu chuyện gia đình
                theo cách rõ ràng, dễ đọc.
              </p>
            </SectionCard>
            <SectionCard className="rounded-2xl border-stone-200 bg-white/90 shadow-sm">
              <h2 className="font-bold text-stone-900">Xem cây trực quan</h2>
              <p className="mt-2">
                Theo dõi quan hệ gia đình bằng cây tương tác, chỉ đọc ở chế độ
                công khai.
              </p>
            </SectionCard>
            <SectionCard className="rounded-2xl border-stone-200 bg-white/90 shadow-sm">
              <h2 className="font-bold text-stone-900">Bảo vệ riêng tư</h2>
              <p className="mt-2">
                Thông tin công khai đã được lọc; người còn sống không lộ chi
                tiết nhạy cảm.
              </p>
            </SectionCard>
            <SectionCard className="rounded-2xl border-stone-200 bg-white/90 shadow-sm">
              <h2 className="font-bold text-stone-900">Dữ liệu lâu dài</h2>
              <p className="mt-2">
                Quản trị viên có thể xuất JSON/GEDCOM/ZIP để lưu trữ và chuyển
                hệ thống khi cần.
              </p>
            </SectionCard>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

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
      <section className="border-b border-amber-900/10 bg-[#f5eddf]">
        <div className="mx-auto grid min-h-[calc(100vh-196px)] w-full max-w-7xl content-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-14">
          <div className="space-y-7">
            <p className="inline-flex rounded-full border border-[#7a2f24]/20 bg-[#fff8e8] px-4 py-2 text-sm font-semibold text-[#7a2f24] shadow-sm">
              Gia phả dòng họ Việt Nam
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
                className="rounded-full border-[#245744] bg-[#245744] px-6 text-base shadow-sm hover:bg-[#1f4939]"
              >
                Xem phả đồ
              </ActionLink>
              <ActionLink
                href="/auth/login"
                className="rounded-full border-[#7a2f24]/20 text-[#7a2f24] shadow-sm hover:bg-[#f2dfbd]"
              >
                Đăng nhập quản trị
              </ActionLink>
            </div>
            <p className="max-w-2xl text-base leading-7 text-stone-600">
              Trang công khai chỉ để xem. Các thao tác quản trị và xuất dữ liệu
              đầy đủ luôn nằm sau đăng nhập và quyền phù hợp.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-900/10 bg-[#fff8e8]/90 p-4 shadow-md sm:p-5">
            <div className="rounded-xl border border-amber-900/10 bg-[#f2dfbd]/45 p-4 shadow-sm sm:p-5">
              <p className="text-sm font-semibold text-[#7a2f24]">
                Bìa sổ phả hệ
              </p>
              <div className="mt-3 rounded-xl border border-[#7a2f24]/20 bg-[#fff8e8] p-4 text-center shadow-sm">
                <div className="text-sm font-semibold text-stone-600">
                  Dòng họ
                </div>
                <div className="mt-1 text-3xl font-black text-[#245744]">
                  Gia phả
                </div>
                <div className="mt-2 text-sm leading-6 text-stone-600">
                  Kết nối thủy tổ, chi nhánh và từng thế hệ trong một phả đồ
                  dễ nhìn.
                </div>
              </div>
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
              <div className="mt-5 rounded-xl border border-[#7a2f24]/15 bg-[#fff8e8] p-4 text-base leading-7 text-stone-700">
                Người còn sống được bảo vệ: chế độ công khai không hiển thị ghi
                chú nội bộ hoặc thông tin nhạy cảm.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5eddf]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 text-base leading-7 text-stone-600 md:grid-cols-2 lg:grid-cols-4">
            <SectionCard className="rounded-xl border-amber-900/10 bg-[#fff8e8]/95 shadow-sm">
              <h2 className="font-bold text-stone-900">Lưu giữ dòng họ</h2>
              <p className="mt-2">
                Ghi nhận thành viên, chi nhánh, đời thứ và câu chuyện gia đình
                theo cách rõ ràng, dễ đọc.
              </p>
            </SectionCard>
            <SectionCard className="rounded-xl border-amber-900/10 bg-[#fff8e8]/95 shadow-sm">
              <h2 className="font-bold text-stone-900">Xem phả đồ trực quan</h2>
              <p className="mt-2">
                Theo dõi quan hệ gia đình bằng cây tương tác, chỉ đọc ở chế độ
                công khai.
              </p>
            </SectionCard>
            <SectionCard className="rounded-xl border-amber-900/10 bg-[#fff8e8]/95 shadow-sm">
              <h2 className="font-bold text-stone-900">Bảo vệ riêng tư</h2>
              <p className="mt-2">
                Thông tin công khai đã được lọc; người còn sống không lộ chi
                tiết nhạy cảm.
              </p>
            </SectionCard>
            <SectionCard className="rounded-xl border-amber-900/10 bg-[#fff8e8]/95 shadow-sm">
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

import { PublicShell } from "@/components/layout/public-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import type { PublicPerson } from "@/lib/privacy/privacy-types";

type PublicPersonProfileProps = {
  person: PublicPerson;
};

const PHASE_MARKER = "A15A5_MEMBER_PROFILE_PERSON_DETAIL_VIETNAMESE_HERITAGE_UI";

function PublicField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-lg border border-amber-900/10 bg-white/70 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-base font-semibold text-stone-950">
        {value || "Chưa cập nhật"}
      </dd>
    </div>
  );
}

function initialOf(person: PublicPerson) {
  return (person.display_name || person.full_name || person.label || "TV")
    .trim()
    .slice(0, 1)
    .toLocaleUpperCase("vi");
}

export function PublicPersonProfile({ person }: PublicPersonProfileProps) {
  const yearRange =
    !person.is_living && (person.birth_year || person.death_year)
      ? `${person.birth_year ?? "Chưa rõ năm sinh"} - ${
          person.death_year ?? "Chưa rõ năm mất"
        }`
      : null;
  const generationLabel = person.generation_number
    ? `Đời thứ ${person.generation_number}`
    : null;

  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <span className="sr-only">{PHASE_MARKER}</span>
        <span className="sr-only">Đang tải hồ sơ thành viên</span>
        <PageHeader
          eyebrow="Hồ sơ thành viên"
          title={person.label}
          description="Hồ sơ công khai chỉ hiển thị phần thông tin gia đình đã cho phép chia sẻ."
          actions={<ActionLink href="/tree">Quay lại phả đồ</ActionLink>}
        />

        <div className="mt-6 overflow-hidden rounded-2xl border border-amber-900/15 bg-[#fff8e8] shadow-sm">
          <div className="border-b border-amber-900/10 bg-[linear-gradient(135deg,#7f1d1d,#245744)] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-amber-100/60 bg-amber-50 text-3xl font-bold text-stone-950 shadow-sm">
                {initialOf(person)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-100">
                  Gia phả dòng họ
                </p>
                <h2 className="mt-2 break-words text-2xl font-bold sm:text-3xl">
                  {person.label}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
                  <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1">
                    {person.is_living ? "Còn sống" : "Đã mất"}
                  </span>
                  <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1">
                    {generationLabel ?? "Chưa cập nhật đời thứ"}
                  </span>
                  <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1">
                    {person.branch_name ?? "Chưa cập nhật chi nhánh"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <SectionCard className="bg-[#fffdf6]">
              <h2 className="text-lg font-bold text-stone-950">
                Thông tin cơ bản
              </h2>
              <dl className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">
                <PublicField
                  label="Trạng thái"
                  value={person.is_living ? "Còn sống" : "Đã mất"}
                />
                <PublicField label="Năm sinh - năm mất" value={yearRange} />
                <PublicField label="Đời / thế hệ" value={generationLabel} />
                <PublicField label="Chi / nhánh" value={person.branch_name} />
              </dl>
            </SectionCard>

            <SectionCard className="bg-[#fffdf6]">
              <h2 className="text-lg font-bold text-stone-950">
                Gia đình & quan hệ
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                Quan hệ gia đình chi tiết được xem trong phả đồ để bảo đảm đúng
                ngữ cảnh dòng họ.
              </p>
              <div className="mt-4 grid gap-3">
                <ActionLink href="/tree">Xem trong phả đồ</ActionLink>
                <div className="rounded-lg border border-amber-900/10 bg-white/70 px-4 py-3 text-sm leading-6 text-stone-700">
                  Chưa cập nhật quan hệ công khai riêng cho hồ sơ này.
                </div>
              </div>
            </SectionCard>

            <div className="lg:col-span-2">
              {person.is_living ? (
                <StatusCallout
                  tone="success"
                  title="Quyền riêng tư người còn sống"
                >
                  Thông tin chi tiết của người còn sống được ẩn ở chế độ công
                  khai. Gia đình có thể cập nhật thêm trong khu vực quản trị.
                </StatusCallout>
              ) : (
                <StatusCallout
                  tone="info"
                  title="Thông tin đang được hoàn thiện"
                >
                  Nếu hồ sơ còn thiếu năm sinh, chi nhánh hoặc đời thứ, nghĩa là
                  gia đình đang tiếp tục đối chiếu tư liệu.
                </StatusCallout>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SectionCard>
            <h2 className="text-lg font-bold text-stone-950">Ghi chú</h2>
            <p className="mt-3 text-sm leading-6 text-stone-700">
              Chưa cập nhật tiểu sử công khai. Khi gia đình xác minh tư liệu,
              phần này có thể bổ sung câu chuyện, công đức hoặc mốc đời quan
              trọng.
            </p>
          </SectionCard>

          <SectionCard>
            <h2 className="text-lg font-bold text-stone-950">Quyền riêng tư</h2>
            <p className="mt-3 text-sm leading-6 text-stone-700">
              Hồ sơ này đang ở phạm vi công khai. Những dữ liệu nhạy cảm, ghi
              chú nội bộ và thông tin người còn sống vẫn được giới hạn theo
              quyền xem của gia đình.
            </p>
          </SectionCard>
        </div>
      </section>
    </PublicShell>
  );
}

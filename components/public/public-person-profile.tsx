import { PublicShell } from "@/components/layout/public-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import type { PublicPerson } from "@/lib/privacy/privacy-types";

type PublicPersonProfileProps = {
  person: PublicPerson;
};

function PublicField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <dt className="font-bold text-stone-950">{label}</dt>
      <dd className="mt-1 text-stone-700">
        {value || "Thông tin này đang được gia đình cập nhật"}
      </dd>
    </div>
  );
}

export function PublicPersonProfile({ person }: PublicPersonProfileProps) {
  const yearRange =
    !person.is_living && (person.birth_year || person.death_year)
      ? `${person.birth_year ?? "Chưa rõ năm sinh"} - ${
          person.death_year ?? "Chưa rõ năm mất"
        }`
      : null;

  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6">
        <PageHeader
          eyebrow="Hồ sơ công khai"
          title={person.label}
          description="Hồ sơ công khai chỉ hiển thị phần thông tin được phép chia sẻ với người xem."
          actions={<ActionLink href="/tree">Quay lại cây gia phả</ActionLink>}
        />

        <div className="mt-6 grid gap-5">
          <SectionCard>
            <h2 className="text-lg font-bold text-stone-950">
              Thông tin chính
            </h2>
            <dl className="mt-4 grid gap-4 text-sm leading-6 sm:grid-cols-2">
              <PublicField
                label="Trạng thái"
                value={person.is_living ? "Còn sống" : "Đã mất"}
              />
              <PublicField label="Năm sinh - năm mất" value={yearRange} />
              <PublicField label="Đời thứ" value={person.generation_number} />
              <PublicField label="Chi/nhánh" value={person.branch_name} />
            </dl>
          </SectionCard>

          {person.is_living ? (
            <StatusCallout tone="success" title="Bảo vệ thông tin người còn sống">
              Thông tin chi tiết của người còn sống được ẩn ở chế độ công khai.
              Gia đình có thể cập nhật thêm trong khu vực quản trị.
            </StatusCallout>
          ) : (
            <StatusCallout tone="info" title="Thông tin đang được hoàn thiện">
              Nếu hồ sơ còn thiếu năm sinh, chi nhánh hoặc đời thứ, nghĩa là gia
              đình đang tiếp tục đối chiếu tư liệu.
            </StatusCallout>
          )}
        </div>
      </section>
    </PublicShell>
  );
}

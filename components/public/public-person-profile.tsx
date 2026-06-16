import { PublicShell } from "@/components/layout/public-shell";
import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusCallout } from "@/components/ui/status-callout";
import type { PublicPerson } from "@/lib/privacy/privacy-types";

type PublicPersonProfileProps = {
  person: PublicPerson;
};

export function PublicPersonProfile({ person }: PublicPersonProfileProps) {
  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-3xl px-6 py-10">
        <PageHeader
          eyebrow="Public profile"
          title={person.label}
          description="Hồ sơ public chỉ hiển thị phần thông tin được phép công khai."
        />

        <SectionCard className="mt-6">
          <dl className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <dt className="font-bold text-slate-950">Trạng thái</dt>
              <dd className="mt-1">
                {person.is_living ? "Còn sống" : "Đã mất"}
              </dd>
            </div>
            {person.generation_number ? (
              <div>
                <dt className="font-bold text-slate-950">Đời thứ</dt>
                <dd className="mt-1">{person.generation_number}</dd>
              </div>
            ) : null}
            {person.branch_name ? (
              <div>
                <dt className="font-bold text-slate-950">Chi/nhánh</dt>
                <dd className="mt-1">{person.branch_name}</dd>
              </div>
            ) : null}
            {!person.is_living && (person.birth_year || person.death_year) ? (
              <div>
                <dt className="font-bold text-slate-950">
                  Năm sinh - năm mất
                </dt>
                <dd className="mt-1">
                  {person.birth_year ?? "?"} - {person.death_year ?? "?"}
                </dd>
              </div>
            ) : null}
          </dl>

          {person.is_living ? (
            <StatusCallout tone="success" className="mt-6">
              Thông tin chi tiết của người còn sống được ẩn ở public mode.
            </StatusCallout>
          ) : null}

          <ActionLink href="/tree" className="mt-6">
            Quay lại cây
          </ActionLink>
        </SectionCard>
      </section>
    </PublicShell>
  );
}

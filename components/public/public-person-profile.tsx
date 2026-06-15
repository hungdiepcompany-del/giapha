import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";
import type { PublicPerson } from "@/lib/privacy/privacy-types";

type PublicPersonProfileProps = {
  person: PublicPerson;
};

export function PublicPersonProfile({ person }: PublicPersonProfileProps) {
  return (
    <PublicShell>
      <section className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Public profile
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            {person.label}
          </h1>
        </div>

        <div className="mt-6 border border-slate-200 bg-white p-6">
          <dl className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <dt className="font-bold text-slate-950">Trạng thái</dt>
              <dd className="mt-1">{person.is_living ? "Còn sống" : "Đã mất"}</dd>
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
                <dt className="font-bold text-slate-950">Năm sinh - năm mất</dt>
                <dd className="mt-1">
                  {person.birth_year ?? "?"} - {person.death_year ?? "?"}
                </dd>
              </div>
            ) : null}
          </dl>

          {person.is_living ? (
            <div className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Thông tin chi tiết của người còn sống được ẩn ở public mode.
            </div>
          ) : null}

          <Link
            href="/tree"
            className="mt-6 inline-flex min-h-11 items-center border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
          >
            Quay lại cây
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

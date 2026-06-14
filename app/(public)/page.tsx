import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";

export default function PublicHomePage() {
  return (
    <PublicShell>
      <section className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-4xl flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Project foundation
          </p>
          <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
            WEB GIA PHẢ
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Mục tiêu: lưu giữ dữ liệu gia phả lâu dài, có public/private mode
            và backup JSON/GEDCOM/ZIP.
          </p>
        </div>

        <div>
          <Link
            href="/auth/login"
            className="inline-flex min-h-11 items-center justify-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Đăng nhập
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

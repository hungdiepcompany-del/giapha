import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";

type PublicHomeProps = {
  peopleCount?: number;
  treeNodeCount?: number;
};

export function PublicHome({ peopleCount, treeNodeCount }: PublicHomeProps) {
  return (
    <PublicShell>
      <section className="mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-5xl content-center gap-8 px-6 py-16">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Public/private foundation
          </p>
          <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
            WEB GIA PHẢ
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Lưu giữ gia phả lâu dài bằng dữ liệu có phân quyền, lịch sử chỉnh
            sửa và lớp bảo vệ export JSON/GEDCOM/ZIP ở các phase sau.
          </p>
        </div>

        <div className="grid gap-4 border border-slate-200 bg-white p-5 text-sm text-slate-700 sm:grid-cols-3">
          <div>
            <div className="font-bold text-slate-950">
              {peopleCount ?? 0} người public
            </div>
            <div className="mt-1">Chỉ dữ liệu visibility public.</div>
          </div>
          <div>
            <div className="font-bold text-slate-950">
              {treeNodeCount ?? 0} node cây
            </div>
            <div className="mt-1">Cây readonly đã lọc riêng tư.</div>
          </div>
          <div>
            <div className="font-bold text-slate-950">Bảo vệ người còn sống</div>
            <div className="mt-1">Không hiện ngày sinh đầy đủ hoặc ghi chú nội bộ.</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/tree"
            className="inline-flex min-h-11 items-center justify-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Xem cây gia phả
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex min-h-11 items-center justify-center border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
          >
            Đăng nhập quản trị
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

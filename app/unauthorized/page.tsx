import Link from "next/link";

type UnauthorizedPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function UnauthorizedPage({
  searchParams,
}: UnauthorizedPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-12">
      <div className="border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
          Không đủ quyền
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Không có quyền truy cập
        </h1>
        <p className="mt-4 leading-7 text-slate-700">
          Tài khoản hiện tại chưa có quyền phù hợp để truy cập khu vực này.
        </p>
        {params.reason ? (
          <p className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Lý do: {params.reason}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/auth/login" className="underline">
            Quay lại đăng nhập
          </Link>
          <Link href="/" className="underline">
            Trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}

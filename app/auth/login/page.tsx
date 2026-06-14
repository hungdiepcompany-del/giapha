import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-12">
      <div className="border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Supabase Auth
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Đăng nhập</h1>
        <p className="mt-4 leading-7 text-slate-700">
          Supabase Auth sẽ được hoàn thiện ở phase sau.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-semibold text-slate-900 underline"
        >
          Về trang public
        </Link>
      </div>
    </main>
  );
}

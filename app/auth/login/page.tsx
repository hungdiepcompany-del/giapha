import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { getPublicSupabaseConfig } from "@/lib/supabase/client";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    reason?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isConfigured = Boolean(getPublicSupabaseConfig());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const reason = params.error ?? params.reason;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-12">
      <div className="border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Supabase Auth
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Đăng nhập</h1>
        <p className="mt-4 leading-7 text-slate-700">
          Nhập email để nhận magic link đăng nhập qua Supabase Auth.
        </p>
        <LoginForm
          appUrl={appUrl}
          isConfigured={isConfigured}
          initialReason={reason}
        />
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

import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { getPublicSupabaseConfig } from "@/lib/supabase/client";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    error_code?: string;
    reason?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isConfigured = Boolean(getPublicSupabaseConfig());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const reason = params.error_code ?? params.error ?? params.reason;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-5xl content-center gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
            Đăng nhập an toàn
          </p>
          <h1 className="text-4xl font-bold text-slate-950">
            Đăng nhập quản trị gia phả
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-700">
            Dùng Google để vào nhanh, hoặc gửi magic link nếu muốn đăng nhập bằng email.
            Cả hai cách đều kiểm tra phiên đăng nhập trước khi vào trang quản trị.
          </p>
          <div className="grid gap-3 text-sm text-slate-700">
            <div className="border border-emerald-200 bg-emerald-50 p-4">
              Google phù hợp khi magic link bị giới hạn gửi email hoặc link cũ hết hạn.
            </div>
            <div className="border border-slate-200 bg-white p-4">
              Magic link vẫn được giữ để dự phòng và không yêu cầu mật khẩu.
            </div>
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Chọn cách đăng nhập
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Nếu đăng nhập không thành công, trang sẽ hiển thị hướng xử lý để thử lại.
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
      </div>
    </main>
  );
}

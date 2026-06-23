"use client";

import { type FormEvent, useMemo, useState } from "react";

import { createClientSupabaseClient } from "@/lib/supabase/client";

type LoginFormProps = {
  appUrl: string;
  isConfigured: boolean;
  initialReason?: string;
};

const LOGIN_REASON_MESSAGES: Record<string, string> = {
  access_denied:
    "Bạn đã hủy hoặc chưa cấp quyền đăng nhập Google. Vui lòng thử lại.",
  auth_callback_failed:
    "Không thể hoàn tất phiên đăng nhập. Vui lòng thử đăng nhập lại.",
  missing_auth_code:
    "Đường dẫn đăng nhập không hợp lệ hoặc đã thiếu mã xác thực.",
  otp_expired:
    "Magic link đã hết hạn. Vui lòng gửi lại link đăng nhập mới.",
  provider_disabled:
    "Google OAuth chưa được bật trong Supabase Dashboard.",
  email_rate_limit:
    "Hệ thống gửi email đang giới hạn tần suất. Vui lòng chờ một lát rồi gửi lại magic link.",
  invalid_email:
    "Email chưa đúng định dạng. Vui lòng kiểm tra lại địa chỉ email.",
};

function getLoginReasonMessage(reason: string) {
  return (
    LOGIN_REASON_MESSAGES[reason] ??
    "Không thể đăng nhập với lỗi chưa xác định. Vui lòng thử lại."
  );
}

export function LoginForm({
  appUrl,
  isConfigured,
  initialReason,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [googleStatus, setGoogleStatus] = useState<
    "idle" | "redirecting" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const initialReasonMessage = useMemo(
    () => (initialReason ? getLoginReasonMessage(initialReason) : null),
    [initialReason],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isConfigured) {
      setStatus("error");
      setMessage("Thiếu cấu hình Supabase trong biến môi trường.");
      return;
    }

    setStatus("sending");
    setMessage(null);

    try {
      const supabase = createClientSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${appUrl.replace(/\/$/, "")}/auth/callback`,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(getLoginReasonMessage(error.code ?? "auth_callback_failed"));
        return;
      }

      setStatus("sent");
      setMessage("Đã gửi magic link. Vui lòng kiểm tra email.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? "Không thể gửi magic link lúc này. Vui lòng kiểm tra kết nối và thử lại."
          : "Không thể gửi magic link lúc này. Vui lòng thử lại.",
      );
    }
  }

  async function handleGoogleSignIn() {
    if (!isConfigured) {
      setGoogleStatus("error");
      setMessage("Thiếu cấu hình Supabase trong biến môi trường.");
      return;
    }

    setGoogleStatus("redirecting");
    setStatus("idle");
    setMessage(null);

    try {
      const supabase = createClientSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setGoogleStatus("error");
        setMessage(getLoginReasonMessage(error.code ?? "auth_callback_failed"));
      }
    } catch (error) {
      setGoogleStatus("error");
      setMessage(
        error instanceof Error
          ? "Không thể bắt đầu đăng nhập Google. Vui lòng thử lại."
          : "Không thể bắt đầu đăng nhập Google.",
      );
    }
  }

  const isBusy = status === "sending" || googleStatus === "redirecting";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {!isConfigured ? (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Thiếu cấu hình Supabase. Cần khai báo `NEXT_PUBLIC_SUPABASE_URL` và
          `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
        </div>
      ) : null}

      {initialReasonMessage ? (
        <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {initialReasonMessage}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={!isConfigured || isBusy}
        className="inline-flex min-h-11 w-full items-center justify-center border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {googleStatus === "redirecting"
          ? "Đang chuyển sang Google..."
          : "Đăng nhập với Google"}
      </button>

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-normal text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>hoặc</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <label className="block text-sm font-semibold text-slate-800" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={!isConfigured || isBusy}
        className="min-h-11 w-full border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-900 disabled:bg-slate-100"
      />

      <button
        type="submit"
        disabled={!isConfigured || isBusy}
        className="inline-flex min-h-11 items-center justify-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
      >
        {status === "sending" ? "Đang gửi..." : "Gửi magic link"}
      </button>

      {message ? (
        <p
          className={
            status === "error" || googleStatus === "error"
              ? "text-sm text-red-700"
              : "text-sm text-emerald-700"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

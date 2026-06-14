"use client";

import { useState } from "react";

import { createClientSupabaseClient } from "@/lib/supabase/client";

type LoginFormProps = {
  appUrl: string;
  isConfigured: boolean;
  initialReason?: string;
};

export function LoginForm({
  appUrl,
  isConfigured,
  initialReason,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        setMessage(error.message);
        return;
      }

      setStatus("sent");
      setMessage("Đã gửi magic link. Vui lòng kiểm tra email.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Không thể gửi link.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {!isConfigured ? (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Thiếu cấu hình Supabase. Cần khai báo `NEXT_PUBLIC_SUPABASE_URL` và
          `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
        </div>
      ) : null}

      {initialReason ? (
        <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Lý do: {initialReason}
        </div>
      ) : null}

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
        disabled={!isConfigured || status === "sending"}
        className="min-h-11 w-full border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-900 disabled:bg-slate-100"
      />

      <button
        type="submit"
        disabled={!isConfigured || status === "sending"}
        className="inline-flex min-h-11 items-center justify-center border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
      >
        {status === "sending" ? "Đang gửi..." : "Gửi magic link"}
      </button>

      {message ? (
        <p
          className={
            status === "error"
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

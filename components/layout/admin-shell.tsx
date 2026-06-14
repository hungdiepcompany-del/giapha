import Link from "next/link";
import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/admin" className="text-sm font-bold uppercase tracking-[0.16em]">
            Quản trị GIA PHẢ
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/" className="underline">
              Public
            </Link>
            <Link href="/auth/login" className="underline">
              Đăng nhập
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

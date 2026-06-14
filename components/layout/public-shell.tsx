import Link from "next/link";
import type { ReactNode } from "react";

type PublicShellProps = {
  children: ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f3] text-slate-900">
      <header className="border-b border-slate-200 bg-white/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.16em]">
            WEB GIA PHẢ
          </Link>
          <Link href="/auth/login" className="text-sm font-semibold underline">
            Đăng nhập
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

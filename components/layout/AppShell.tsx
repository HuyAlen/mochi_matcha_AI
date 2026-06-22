"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import BottomNav from "@/components/layout/BottomNav";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fff7fb] text-slate-950">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#fff7fb]">
        <header className="sticky top-0 z-30 border-b border-pink-100/70 bg-[#fff7fb]/92 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex min-w-0 items-center gap-3 rounded-3xl text-left transition active:scale-[0.98]"
            aria-label="Go to dashboard"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-pink-100">
              🎀
            </div>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-black tracking-tight text-slate-950">
                Mochi & Matcha AI
              </p>
              <p className="truncate text-xs font-bold text-slate-400">
                AI Parenting Companion
              </p>
            </div>
          </button>
        </header>

        <main className="px-4 pb-[calc(7.75rem+env(safe-area-inset-bottom))] pt-4">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

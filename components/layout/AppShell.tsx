"use client";

import type { ReactNode } from "react";
import { LogOut } from "lucide-react";

import { useAuthStore } from "@/store/authStore";

import BottomNav from "./BottomNav";
import Header from "./Header";
import FloatingLiveTimer from "../timer/FloatingLiveTimer";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    try {
      await logout();

      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff7fb]">
      <div className="mx-auto min-h-screen max-w-md overflow-hidden border-x border-pink-100 bg-linear-to-b from-pink-50 via-white to-purple-50 shadow-[0_0_40px_rgba(236,72,153,0.08)]">
        <div className="relative">
          <Header />

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-2xl border border-pink-100 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:bg-pink-50 hover:text-pink-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <main className="px-4 pb-40 pt-4">{children}</main>

        <FloatingLiveTimer />

        <BottomNav />
      </div>
    </div>
  );
}

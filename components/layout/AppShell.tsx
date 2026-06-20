import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import FloatingLiveTimer from "../timer/FloatingLiveTimer";
import Header from "./Header";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#fff7fb]">
      <div className="mx-auto min-h-screen max-w-md overflow-hidden border-x border-pink-100 bg-linear-to-b from-pink-50 via-white to-purple-50 shadow-[0_0_40px_rgba(236,72,153,0.08)]">
        <Header />

        <main className="px-4 pb-40 pt-4">{children}</main>

        <FloatingLiveTimer />

        <BottomNav />
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

import AuthGuard from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/store/authStore";

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
          <p className="text-sm text-slate-500">
            Đang khởi tạo phiên đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return <AuthGuard>{children}</AuthGuard>;
}

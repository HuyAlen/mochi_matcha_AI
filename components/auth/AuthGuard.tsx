"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

const PUBLIC_ROUTES = ["/login", "/test-supabase"];

type Props = {
  children: ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading || !initialized) return;

    if (!session && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (session && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [session, loading, initialized, isPublicRoute, pathname, router]);

  if (loading || !initialized) return null;

  if (!session && !isPublicRoute) return null;

  return <>{children}</>;
}

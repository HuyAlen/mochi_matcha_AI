"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

const PUBLIC_ROUTES = ["/login", "/test-supabase"];

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (user && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [user, loading, isPublicRoute, pathname, router]);

  return <>{children}</>;
}

"use client";

import { useAuthStore } from "@/store/authStore";

export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    try {
      await logout();
      window.location.assign("/login");
    } catch (error) {
      console.error("Logout failed", error);
      window.location.assign("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center justify-center gap-2 rounded-3xl bg-white px-5 py-3.5 text-sm font-black text-rose-500 shadow-sm ring-1 ring-rose-100 transition active:scale-[0.99]"
    >
      <span className="text-lg">🚪</span>
      Đăng xuất
    </button>
  );
}

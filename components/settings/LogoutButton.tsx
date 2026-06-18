"use client";

export default function LogoutButton() {
  function handleLogout() {
    window.localStorage.removeItem("mind-ai-auth");
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-white px-5 py-4 font-black text-rose-500 shadow-sm ring-1 ring-rose-100 transition active:scale-[0.99]"
    >
      <span className="text-xl">🚪</span>
      Đăng xuất
    </button>
  );
}

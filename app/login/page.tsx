"use client";

import { Heart, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";

type AuthMode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!email.trim()) {
        setError("Vui lòng nhập email.");
        return;
      }

      if (password.length < 6) {
        setError("Mật khẩu cần tối thiểu 6 ký tự.");
        return;
      }

      if (isLogin) {
        await login(email.trim(), password);
        router.replace("/dashboard");
        return;
      }

      await register(email.trim(), password);
      setMessage(
        "Đăng ký thành công. Nếu Supabase bật xác nhận email, hãy kiểm tra hộp thư trước khi đăng nhập.",
      );
      setMode("login");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center justify-center">
        <section className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-pink-100/60">
          <div className="border-b border-slate-100 bg-gradient-to-br from-white to-pink-50 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-lg shadow-pink-200">
                <Heart className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-pink-500">
                  Mind AI
                </p>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
                </h1>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-pink-100 bg-white/80 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Đồng bộ dữ liệu chăm sóc bé
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Đăng nhập để lưu hồ sơ Mochi & Matcha, nhật ký theo dõi và
                    lịch tiêm lên Supabase.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-pink-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-100">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-pink-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-100">
                <Lock className="h-5 w-5 text-slate-400" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(isLogin ? "register" : "login");
                setError("");
                setMessage("");
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              {isLogin
                ? "Chưa có tài khoản? Đăng ký"
                : "Đã có tài khoản? Đăng nhập"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

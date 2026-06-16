import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="min-w-0">
          <p className="text-xs font-bold text-pink-500">Mind AI</p>
          <h1 className="mt-0.5 truncate text-base font-black leading-tight text-slate-900">
            AI chăm sóc song sinh
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/reminders"
            className="flex size-10 items-center justify-center rounded-full bg-pink-50 text-base shadow-sm ring-1 ring-pink-100"
            aria-label="Nhắc nhở"
          >
            🔔
          </Link>

          <Link
            href="/settings"
            className="flex h-10 items-center justify-center rounded-full bg-pink-50 px-3 text-base shadow-sm ring-1 ring-pink-100"
            aria-label="Hồ sơ"
          >
            🎀🌸
          </Link>
        </div>
      </div>
    </header>
  );
}

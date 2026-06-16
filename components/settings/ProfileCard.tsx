import Link from "next/link";

export default function ProfileCard() {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-pink-100 to-purple-100 text-4xl">
          👩🏻
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-black text-slate-950">Mẹ của Mochi & Matcha</h3>
          <p className="mt-1 text-sm text-slate-500">m***@gmail.com</p>
        </div>

        <Link
          href="/settings"
          className="flex size-9 items-center justify-center rounded-full bg-slate-50 text-slate-500"
          aria-label="Chỉnh sửa hồ sơ"
        >
          ✎
        </Link>
      </div>
    </div>
  );
}

export default function DashboardGreeting() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
      <p className="text-sm font-bold text-pink-500">☀️ Chào mẹ</p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
        Hôm nay của Mochi & Matcha
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-600">
          🎂 8 tháng tuổi
        </span>
        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-600">
          👧 Song sinh nữ
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Theo dõi chăm sóc, ăn dặm, tăng trưởng và nhắc nhở mỗi ngày.
      </p>
    </div>
  );
}

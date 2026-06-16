const activities = [
  ["🥣", "Ăn", "Mochi · Ăn dặm", "1 bữa", "08:00", "bg-blue-50 text-blue-600"],
  [
    "🌙",
    "Ngủ",
    "Matcha · Ngủ",
    "1.5 giờ",
    "09:15",
    "bg-purple-50 text-purple-600",
  ],
  ["🍼", "Sữa", "Mochi · Sữa", "120 ml", "10:30", "bg-pink-50 text-pink-600"],
];

export default function RecentActivityCard() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-950">Nhật ký gần đây</h3>
        <a href="/tracking" className="text-sm font-semibold text-pink-500">
          Xem tất cả
        </a>
      </div>

      <div className="mt-4 space-y-3">
        {activities.map(([icon, chip, title, value, time, chipClass]) => (
          <div
            key={`${title}-${time}`}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-white text-lg">
                {icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${chipClass}`}
                  >
                    {chip}
                  </span>
                  <p className="text-sm font-bold text-slate-800">{title}</p>
                </div>
                <p className="mt-1 text-xs text-slate-400">{time}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-500">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const dates = [10, 11, 12, 13, 14, 15, 16];

export default function TodayCalendarCard() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <button type="button" className="text-slate-400">
          ‹
        </button>
        <h3 className="font-black text-slate-950">Tháng 6, 2026</h3>
        <button type="button" className="text-slate-400">
          ›
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {days.map((day) => (
          <p key={day} className="text-xs font-bold text-slate-400">
            {day}
          </p>
        ))}
        {dates.map((date) => (
          <div
            key={date}
            className={`mx-auto flex size-9 items-center justify-center rounded-full text-sm font-bold ${
              date === 16
                ? "bg-pink-500 text-white shadow-sm"
                : "text-slate-500"
            }`}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
}

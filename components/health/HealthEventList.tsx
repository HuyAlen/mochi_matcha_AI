import { babies } from "@/src/store/babyStore";
import type { HealthEvent } from "@/types/health";

const iconMap = {
  fever: "🌡️",
  cough: "🤧",
  medicine: "💊",
  doctor_visit: "🩺",
  vaccine_reaction: "💉",
};

interface HealthEventListProps {
  events: HealthEvent[];
}

export default function HealthEventList({ events }: HealthEventListProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Nhật ký sức khỏe</h3>

      <div className="mt-4 space-y-3">
        {events.slice(0, 5).map((event) => {
          const baby = babies.find((item) => item.id === event.babyId);

          return (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-xl">
                {iconMap[event.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-800">
                  {baby?.name} · {event.title}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(event.createdAt).toLocaleDateString("vi-VN")}
                  {event.value ? ` · ${event.value}` : ""}
                </p>
                {event.note ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {event.note}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

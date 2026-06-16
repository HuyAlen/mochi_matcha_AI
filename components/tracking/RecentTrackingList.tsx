import { babies } from "@/src/store/babyStore";
import { getTrackingLabel } from "@/src/store/trackingStore";
import type { TrackingEntry } from "@/types/tracking";

interface RecentTrackingListProps {
  entries: TrackingEntry[];
}

export default function RecentTrackingList({
  entries,
}: RecentTrackingListProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-bold text-slate-900">Nhật ký gần đây</h3>

      <div className="mt-3 space-y-3">
        {entries.slice(0, 6).map((entry) => {
          const baby = babies.find((item) => item.id === entry.babyId);

          return (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {baby?.nickname} · {getTrackingLabel(entry.type)}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(entry.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <p className="font-bold text-pink-600">
                {entry.value}
                {entry.unit}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

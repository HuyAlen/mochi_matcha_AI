"use client";

import Link from "next/link";
import { babies } from "@/src/store/babyStore";
import { useTrackingStore } from "@/src/store/trackingStore";
import {
  getReminderTone,
  getSmartReminderResult,
  summarizeReminderPriorities,
  type SmartReminder,
} from "@/services/reminders/smartReminderEngine";

function getReminderHref(quickType: string, babyId: string) {
  const params = new URLSearchParams({
    quick: quickType,
    baby: babyId,
    babyId,
  });

  return `/tracking?${params.toString()}`;
}

function getCardTitle(reminders: SmartReminder[]) {
  const hasHigh = reminders.some((reminder) => reminder.priority === "high");

  if (hasHigh) return "Hôm nay cần làm";
  return "Gợi ý chăm bé";
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNextFeed(
  entries: ReturnType<typeof useTrackingStore.getState>["entries"],
) {
  const now = Date.now();

  return entries
    .filter((entry) => entry.type === "milk" && entry.nextFeedAt)
    .map((entry) => ({
      babyId: entry.babyId,
      nextFeedAt: entry.nextFeedAt!,
    }))
    .filter((entry) => new Date(entry.nextFeedAt).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.nextFeedAt).getTime() - new Date(b.nextFeedAt).getTime(),
    )[0];
}

export default function SmartReminderCard() {
  const entries = useTrackingStore((state) => state.entries);
  const nextFeed = getNextFeed(entries);
  const nextFeedBaby = nextFeed
    ? babies.find((baby) => baby.id === nextFeed.babyId)
    : undefined;

  if (nextFeed && nextFeedBaby) {
    return (
      <section className="rounded-4xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-xl ring-1 ring-pink-100">
            🍼
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-400">
                Smart Reminder
              </p>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-black text-violet-600 ring-1 ring-violet-100">
                Đã hẹn bú
              </span>
            </div>

            <h3 className="mt-1 font-black text-slate-950">
              Cữ bú tiếp theo của {nextFeedBaby.name}
            </h3>

            <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
              Dự kiến nhắc lại lúc{" "}
              <span className="font-black text-pink-500">
                {formatTime(nextFeed.nextFeedAt)}
              </span>
              . Nếu đã cho bé bú sớm hơn, mẹ ghi cữ mới để cập nhật nhắc lại.
            </p>

            <Link
              href={getReminderHref("milk", nextFeedBaby.id)}
              className="mt-3 inline-flex rounded-full bg-pink-500 px-4 py-2 text-xs font-black text-white shadow-sm shadow-pink-200 transition active:scale-[0.98]"
            >
              Ghi cữ bú →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const reminderResult = getSmartReminderResult({
    entries,
    babies: babies.map((baby) => ({
      id: baby.id,
      name: baby.name,
      nickname: baby.nickname,
      avatarEmoji: baby.avatarEmoji,
    })),
    limit: 3,
  });

  const reminders = reminderResult.reminders;

  if (reminderResult.status === "empty") {
    return (
      <section className="rounded-4xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-xl ring-1 ring-pink-100">
            📝
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-400">
                Smart Reminder
              </p>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-600 ring-1 ring-amber-100">
                Cần dữ liệu
              </span>
            </div>

            <h3 className="mt-1 font-black text-slate-950">
              Chưa có dữ liệu hôm nay
            </h3>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
              Mẹ hãy ghi nhận cữ sữa, giấc ngủ hoặc bữa ăn đầu tiên để Mind AI
              nhắc chính xác hơn.
            </p>

            <Link
              href="/tracking"
              className="mt-3 inline-flex rounded-full bg-pink-500 px-4 py-2 text-xs font-black text-white shadow-sm shadow-pink-200 transition active:scale-[0.98]"
            >
              Mở Track →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (reminderResult.status === "stable") {
    return (
      <section className="rounded-4xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl ring-1 ring-emerald-100">
            ✅
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-500">
                Smart Reminder
              </p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600 ring-1 ring-emerald-100">
                Ổn định
              </span>
            </div>

            <h3 className="mt-1 font-black text-slate-950">Mọi thứ đang ổn</h3>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
              Chưa có việc cần nhắc ngay. Tiếp tục ghi nhận đều để Mind AI gợi ý
              chính xác hơn.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-4xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-400">
            Smart Reminder
          </p>
          <h3 className="mt-1 truncate font-black text-slate-950">
            {getCardTitle(reminders)}
          </h3>
        </div>

        <span className="shrink-0 rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-500 ring-1 ring-pink-100">
          {summarizeReminderPriorities(reminders)}
        </span>
      </div>

      <div className="space-y-2">
        {reminders.map((reminder: SmartReminder) => {
          const tone = getReminderTone(reminder.priority);

          return (
            <Link
              key={reminder.id}
              href={getReminderHref(reminder.quickType, reminder.babyId)}
              className={`block rounded-3xl p-3 ring-1 transition active:scale-[0.99] ${tone.card}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-white/80">
                  {reminder.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-sm">
                      {reminder.babyEmoji}
                    </span>
                    <p className="truncate text-sm font-black text-slate-950">
                      {reminder.babyName}
                    </p>
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${tone.dot}`}
                    />
                    <span className="shrink-0 text-[10px] font-black text-slate-400">
                      {tone.label}
                    </span>
                  </div>

                  <h4 className="mt-1 line-clamp-1 text-base font-black leading-tight text-slate-950">
                    {reminder.title}
                  </h4>

                  <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-slate-500">
                    {reminder.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                      {reminder.kind === "milk"
                        ? "Cữ sữa"
                        : reminder.kind === "sleep"
                          ? "Giấc ngủ"
                          : reminder.kind === "diaper"
                            ? "Thay tã"
                            : "Bữa ăn"}
                    </span>

                    <span className="shrink-0 text-xs font-black text-pink-500">
                      {reminder.actionLabel} →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, RotateCcw, Square, X } from "lucide-react";

import { useQuickAddStore } from "@/src/store/quickAddStore";
import { useTimerStore } from "@/src/store/timerStore";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";

const babyNames: Record<BabyId, string> = {
  mochi: "Mochi",
  matcha: "Matcha",
};

const reminderOptions: Array<{ label: string; value: number | null }> = [
  { label: "Không", value: null },
  { label: "2h", value: 120 },
  { label: "2.5h", value: 150 },
  { label: "3h", value: 180 },
  { label: "3.5h", value: 210 },
  { label: "4h", value: 240 },
];

function getInitialNow() {
  return typeof window === "undefined" ? 0 : Date.now();
}

function formatTimeFromMs(value: number) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function getElapsedSeconds(startAt?: string, now = 0) {
  if (!startAt || now <= 0) return 0;

  const startTime = new Date(startAt).getTime();

  if (Number.isNaN(startTime)) return 0;

  return Math.max(0, Math.floor((now - startTime) / 1000));
}

function scheduleFeedNotification({
  babyName,
  nextFeedAt,
}: {
  babyName: string;
  nextFeedAt?: string;
}) {
  if (!nextFeedAt || typeof window === "undefined") return;

  const delay = new Date(nextFeedAt).getTime() - Date.now();
  if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;
  if (!("Notification" in window)) return;

  const showNotification = () => {
    new Notification(`Đến giờ bú của ${babyName}`, {
      body: "Mẹ kiểm tra cữ bú tiếp theo nhé.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `milk-reminder-${babyName}`,
    });
  };

  if (Notification.permission === "granted") {
    window.setTimeout(showNotification, delay);
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        window.setTimeout(showNotification, delay);
      }
    });
  }
}

export default function MilkQuickAdd() {
  const closeModal = useQuickAddStore((s) => s.closeModal);
  const showToast = useQuickAddStore((s) => s.showToast);
  const addEntry = useTrackingStore((s) => s.addEntry);

  const startMilkTimer = useTimerStore((s) => s.startMilkTimer);
  const stopMilkTimer = useTimerStore((s) => s.stopMilkTimer);
  const cancelMilkTimer = useTimerStore((s) => s.cancelMilkTimer);
  const updateMilkTimerDraft = useTimerStore((s) => s.updateMilkTimerDraft);
  const activeMilkSessions = useTimerStore((s) => s.activeMilkSessions);

  const [babyId, setBabyId] = useState<BabyId>("mochi");
  const [amount, setAmount] = useState("120");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [remindAfterMinutes, setRemindAfterMinutes] = useState<number | null>(
    180,
  );
  const [now, setNow] = useState<number>(getInitialNow);

  const activeSession = activeMilkSessions[babyId];
  const isTimerRunning = Boolean(activeSession);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    function handleSetBaby(event: Event) {
      const customEvent = event as CustomEvent<{ babyId?: BabyId }>;
      const nextBabyId = customEvent.detail?.babyId;

      if (nextBabyId !== "mochi" && nextBabyId !== "matcha") return;

      const session = useTimerStore.getState().activeMilkSessions[nextBabyId];

      setBabyId(nextBabyId);
      setAmount(session?.amount ?? "120");
      setNote(session?.note ?? "");
      setRemindAfterMinutes(session?.remindAfterMinutes ?? 180);
    }

    window.addEventListener("mind-ai:set-quick-add-baby", handleSetBaby);

    return () => {
      window.removeEventListener("mind-ai:set-quick-add-baby", handleSetBaby);
    };
  }, []);

  const elapsedSeconds = useMemo(
    () => getElapsedSeconds(activeSession?.startAt, now),
    [activeSession?.startAt, now],
  );

  const nextFeedLabel = useMemo(() => {
    if (!remindAfterMinutes) return "Không nhắc";
    if (now <= 0) return `Sau ${remindAfterMinutes} phút`;

    return `Nhắc lúc ${formatTimeFromMs(now + remindAfterMinutes * 60 * 1000)}`;
  }, [now, remindAfterMinutes]);

  const reminderButtonLabel = useMemo(() => {
    if (!remindAfterMinutes) return "Không nhắc cữ tiếp theo";
    return `Lưu hẹn nhắc • ${nextFeedLabel}`;
  }, [nextFeedLabel, remindAfterMinutes]);

  function buildNextFeedAt() {
    if (!remindAfterMinutes) return undefined;

    return new Date(Date.now() + remindAfterMinutes * 60 * 1000).toISOString();
  }

  function resetForm() {
    setAmount("120");
    setNote("");
    setRemindAfterMinutes(180);
  }

  function syncDraft() {
    if (!isTimerRunning) return;

    updateMilkTimerDraft(babyId, {
      amount,
      note,
      remindAfterMinutes,
    });
  }

  function validateMilkAmount() {
    const milkAmount = Number(amount);

    if (!Number.isFinite(milkAmount) || milkAmount <= 0) {
      showToast("Nhập lượng sữa hợp lệ trước khi bắt đầu", "error");
      return undefined;
    }

    return milkAmount;
  }

  function handleBabyChange(nextBabyId: BabyId) {
    const session = useTimerStore.getState().activeMilkSessions[nextBabyId];

    setBabyId(nextBabyId);
    setAmount(session?.amount ?? "120");
    setNote(session?.note ?? "");
    setRemindAfterMinutes(session?.remindAfterMinutes ?? 180);
  }

  function handleClose() {
    syncDraft();
    closeModal();
  }

  function handleTimerAction() {
    const milkAmount = validateMilkAmount();
    if (!milkAmount || isSaving) return;

    if (!isTimerRunning) {
      startMilkTimer(babyId, undefined, {
        amount: String(milkAmount),
        note,
        remindAfterMinutes,
      });

      window.navigator.vibrate?.(15);
      showToast(`Đang đếm thời gian bú của ${babyNames[babyId]}`);
      return;
    }

    setIsSaving(true);

    const session = stopMilkTimer(babyId);
    const finalDurationMinutes = Math.max(
      1,
      Math.ceil(getElapsedSeconds(session?.startAt, Date.now()) / 60),
    );

    const savedNextFeedAt = buildNextFeedAt();

    addEntry({
      babyId,
      type: "milk",
      value: milkAmount,
      unit: "ml",
      note: note.trim(),
      durationMinutes: finalDurationMinutes,
      remindAfterMinutes: remindAfterMinutes ?? undefined,
      nextFeedAt: savedNextFeedAt,
    });

    if (savedNextFeedAt) {
      scheduleFeedNotification({
        babyName: babyNames[babyId],
        nextFeedAt: savedNextFeedAt,
      });
    }

    window.navigator.vibrate?.(20);

    showToast(
      savedNextFeedAt
        ? `Đã lưu cữ bú ${milkAmount}ml • ${finalDurationMinutes} phút • ${nextFeedLabel}`
        : `Đã lưu cữ bú ${milkAmount}ml • ${finalDurationMinutes} phút • không nhắc`,
    );

    resetForm();
    closeModal();
    setIsSaving(false);
  }

  function handleCancelTimer() {
    cancelMilkTimer(babyId);
    resetForm();
    showToast(`Đã huỷ timer bú của ${babyNames[babyId]}`);
  }

  function handleSaveReminder() {
    if (isSaving) return;

    syncDraft();

    const nextFeedAt = buildNextFeedAt();

    if (nextFeedAt) {
      scheduleFeedNotification({
        babyName: babyNames[babyId],
        nextFeedAt,
      });
    }

    showToast(
      nextFeedAt
        ? `Đã lưu hẹn nhắc cho ${babyNames[babyId]} • ${nextFeedLabel}`
        : `Đã chọn không nhắc cữ tiếp theo cho ${babyNames[babyId]}`,
    );

    closeModal();
  }

  return (
    <div className="flex flex-col overflow-visible">
      <div className="shrink-0 space-y-3 px-1 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-xl ring-1 ring-pink-100">
              🍼
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-black leading-tight text-slate-950">
                Ghi nhận cữ bú
              </h3>
              <p className="mt-0.5 text-xs font-black text-pink-500">
                Hôm nay • {now > 0 ? formatTimeFromMs(now) : "--:--"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-100 transition active:scale-95 disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_104px] gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-black text-slate-600">
              Bé
            </label>
            <select
              value={babyId}
              onChange={(event) =>
                handleBabyChange(event.target.value as BabyId)
              }
              disabled={isSaving}
              className="h-11 w-full rounded-2xl border-0 bg-slate-50 px-4 text-base font-semibold text-slate-900 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-70"
            >
              <option value="mochi">🎀 Mochi</option>
              <option value="matcha">🌸 Matcha</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-black text-slate-600">
              Sữa
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={isSaving}
                className="h-11 w-full rounded-2xl border-0 bg-slate-50 px-3 pr-8 text-base font-black text-slate-900 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-70"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                ml
              </span>
            </div>
          </div>
        </div>

        <section className="rounded-[1.5rem] bg-gradient-to-br from-pink-50 to-white p-3.5 text-center ring-1 ring-pink-100">
          <div className="flex items-center justify-center gap-2">
            <span
              className={[
                "h-2.5 w-2.5 rounded-full",
                isTimerRunning ? "animate-pulse bg-emerald-500" : "bg-pink-300",
              ].join(" ")}
            />
            <p className="text-sm font-black text-slate-700">
              {isTimerRunning ? "Đang bú live" : "Thời gian bé bú"}
            </p>
          </div>

          <div className="mt-1.5 text-[38px] font-black leading-none tracking-tight text-slate-950 tabular-nums">
            {formatTimer(elapsedSeconds)}
          </div>

          <p className="mt-1.5 text-xs font-bold text-slate-400">
            {isTimerRunning
              ? "Đóng popup vẫn tiếp tục đếm live"
              : "Bấm bắt đầu khi bé bắt đầu bú"}
          </p>

          <div className="mt-3 grid grid-cols-[1fr_40px] gap-2">
            <button
              type="button"
              onClick={handleTimerAction}
              disabled={isSaving}
              className={[
                "flex h-10 items-center justify-center gap-2 rounded-2xl font-black text-white shadow-sm transition active:scale-[0.98] disabled:opacity-70",
                isTimerRunning
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-gradient-to-r from-pink-500 to-purple-500",
              ].join(" ")}
            >
              {isTimerRunning ? <Square size={15} /> : <Play size={16} />}
              {isTimerRunning ? "Kết thúc & lưu cữ bú" : "Bắt đầu bú"}
            </button>

            <button
              type="button"
              onClick={handleCancelTimer}
              disabled={isSaving || !isTimerRunning}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-slate-400 ring-1 ring-pink-100 transition active:scale-95 disabled:opacity-25"
              aria-label="Huỷ timer bú"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-black text-slate-600">
              Hẹn nhắc cữ tiếp theo
            </label>

            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-600 ring-1 ring-violet-100">
              {nextFeedLabel}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {reminderOptions.map((option) => {
              const active = remindAfterMinutes === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setRemindAfterMinutes(option.value)}
                  disabled={isSaving}
                  className={[
                    "h-9 rounded-2xl text-[11px] font-black transition active:scale-95 disabled:opacity-60",
                    active
                      ? "bg-violet-500 text-white shadow-sm"
                      : "bg-slate-50 text-slate-500 ring-1 ring-slate-100",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="px-1 pb-2">
        <label className="mb-1.5 block text-sm font-black text-slate-600">
          Ghi chú
        </label>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ví dụ: bú hết bình, bú hơi chậm..."
          rows={1}
          disabled={isSaving}
          className="w-full resize-none rounded-2xl border-0 bg-slate-50 p-3.5 text-base font-semibold text-slate-900 ring-1 ring-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-70"
        />
      </div>

      <div className="-mx-1 bg-white px-1 pt-2">
        <button
          type="button"
          onClick={handleSaveReminder}
          disabled={isSaving}
          className="h-11 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-sm font-black text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Đang lưu..." : reminderButtonLabel}
        </button>
      </div>
    </div>
  );
}

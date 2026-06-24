"use client";

import { useEffect, useRef, useState } from "react";

import ReminderForm from "@/components/reminders/ReminderForm";
import { useQuickAddStore } from "@/src/store/quickAddStore";
import DiaperQuickAdd from "./DiaperQuickAdd";
import MealQuickAdd from "./MealQuickAdd";
import MilkQuickAdd from "./MilkQuickAdd";
import SleepQuickAdd from "./SleepQuickAdd";

type QuickAddModalType = "milk" | "sleep" | "meal" | "diaper" | "reminder";

type QuickAddStoreRuntime = {
  openModal?: (type: QuickAddModalType) => void;
  open?: (type: QuickAddModalType) => void;
  closeModal?: () => void;
  setModalType?: (type: QuickAddModalType | null) => void;
  setIsOpen?: (value: boolean) => void;
};

const quickActions: Array<{
  type: QuickAddModalType;
  label: string;
  description: string;
  icon: string;
  tone: string;
}> = [
  {
    type: "milk",
    label: "Cữ sữa",
    description: "Ghi nhanh lượng sữa",
    icon: "🍼",
    tone: "from-pink-50 to-white text-pink-600 ring-pink-100",
  },
  {
    type: "sleep",
    label: "Giấc ngủ",
    description: "Bắt đầu hoặc ghi giấc ngủ",
    icon: "🌙",
    tone: "from-indigo-50 to-white text-indigo-600 ring-indigo-100",
  },
  {
    type: "meal",
    label: "Ăn dặm",
    description: "Ghi bữa ăn hôm nay",
    icon: "🥣",
    tone: "from-blue-50 to-white text-blue-600 ring-blue-100",
  },
  {
    type: "diaper",
    label: "Tã",
    description: "Theo dõi thay tã",
    icon: "🧷",
    tone: "from-amber-50 to-white text-amber-600 ring-amber-100",
  },
  {
    type: "reminder",
    label: "Reminder",
    description: "Tạo nhắc lịch cho bé",
    icon: "⏰",
    tone: "from-violet-50 to-white text-violet-600 ring-violet-100",
  },
];

function getQuickAddRuntime() {
  return useQuickAddStore as unknown as {
    getState?: () => QuickAddStoreRuntime;
    setState?: (
      state: Partial<{
        isOpen: boolean;
        modalType: QuickAddModalType | null;
      }>,
    ) => void;
  };
}

function openQuickAddModal(type: QuickAddModalType) {
  const store = getQuickAddRuntime();
  const state = store.getState?.();

  if (state?.openModal) {
    state.openModal(type);
    return;
  }

  if (state?.open) {
    state.open(type);
    return;
  }

  if (state?.setModalType && state?.setIsOpen) {
    state.setModalType(type);
    state.setIsOpen(true);
    return;
  }

  store.setState?.({
    isOpen: true,
    modalType: type,
  });
}

function forceCloseQuickAdd() {
  const store = getQuickAddRuntime();
  const state = store.getState?.();

  state?.closeModal?.();
  state?.setModalType?.(null);
  state?.setIsOpen?.(false);

  store.setState?.({
    isOpen: false,
    modalType: null,
  });
}

function dispatchSelectedBaby(babyId?: string) {
  if (!babyId) return;

  window.setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent("mind-ai:set-quick-add-baby", {
        detail: { babyId },
      }),
    );
  }, 0);
}

export default function QuickAddSheet() {
  const { isOpen, modalType, toast } = useQuickAddStore();
  const activeModalType = modalType as QuickAddModalType | null;
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const ignoreNextOpenRef = useRef(false);

  useEffect(() => {
    function handleOpenQuickAdd() {
      if (ignoreNextOpenRef.current) return;

      forceCloseQuickAdd();

      window.setTimeout(() => {
        if (!ignoreNextOpenRef.current) {
          setIsChooserOpen(true);
        }
      }, 0);
    }

    function handleOpenMilkQuickAdd(event: Event) {
      const customEvent = event as CustomEvent<{ babyId?: string }>;

      setIsChooserOpen(false);
      forceCloseQuickAdd();

      window.setTimeout(() => {
        openQuickAddModal("milk");
        dispatchSelectedBaby(customEvent.detail?.babyId);
      }, 0);
    }

    function handleOpenSleepQuickAdd(event: Event) {
      const customEvent = event as CustomEvent<{ babyId?: string }>;

      setIsChooserOpen(false);
      forceCloseQuickAdd();

      window.setTimeout(() => {
        openQuickAddModal("sleep");
        dispatchSelectedBaby(customEvent.detail?.babyId);
      }, 0);
    }

    window.addEventListener("mind-ai:open-quick-add", handleOpenQuickAdd);
    window.addEventListener(
      "mind-ai:open-quick-add-milk",
      handleOpenMilkQuickAdd,
    );
    window.addEventListener(
      "mind-ai:open-quick-add-sleep",
      handleOpenSleepQuickAdd,
    );

    return () => {
      window.removeEventListener("mind-ai:open-quick-add", handleOpenQuickAdd);
      window.removeEventListener(
        "mind-ai:open-quick-add-milk",
        handleOpenMilkQuickAdd,
      );
      window.removeEventListener(
        "mind-ai:open-quick-add-sleep",
        handleOpenSleepQuickAdd,
      );
    };
  }, []);

  function handleCloseAll() {
    ignoreNextOpenRef.current = true;

    setIsChooserOpen(false);
    forceCloseQuickAdd();

    window.setTimeout(() => {
      ignoreNextOpenRef.current = false;
    }, 350);
  }

  function handleSelect(type: QuickAddModalType) {
    ignoreNextOpenRef.current = false;

    setIsChooserOpen(false);
    forceCloseQuickAdd();

    window.setTimeout(() => {
      openQuickAddModal(type);
    }, 0);
  }

  if (!isOpen && !toast && !isChooserOpen) return null;

  return (
    <>
      {isChooserOpen && (
        <>
          <button
            type="button"
            onClick={handleCloseAll}
            className="fixed inset-0 z-[999] cursor-default bg-white/35 backdrop-blur-[1px]"
            aria-label="Đóng chọn nhanh"
          />

          <div className="fixed inset-x-0 bottom-[calc(6.7rem+env(safe-area-inset-bottom))] z-[1000] flex justify-center px-4">
            <div className="relative w-full max-w-[398px] rounded-[32px] bg-white p-4 shadow-2xl ring-1 ring-pink-100">
              <button
                type="button"
                onClick={handleCloseAll}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-lg font-black text-slate-400 ring-1 ring-slate-100 active:scale-95"
                aria-label="Đóng"
              >
                ×
              </button>

              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

              <div className="mb-4 pr-10">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
                  Chọn nhanh
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-950">
                  Ghi hoạt động cho bé
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.type}
                    type="button"
                    onClick={() => handleSelect(action.type)}
                    className={`rounded-[24px] bg-gradient-to-br p-4 text-left shadow-sm ring-1 transition active:scale-[0.98] ${action.tone}`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                      {action.icon}
                    </div>

                    <p className="mt-3 text-sm font-black text-slate-950">
                      {action.label}
                    </p>
                    <p className="mt-1 text-xs font-bold leading-5 text-slate-400">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {isOpen && !isChooserOpen && (
        <>
          <button
            type="button"
            onClick={handleCloseAll}
            className="fixed inset-0 z-[999] cursor-default bg-white/35 backdrop-blur-[1px]"
            aria-label="Đóng form ghi nhanh"
          />

          <div className="fixed inset-x-0 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] top-[calc(env(safe-area-inset-top)+72px)] z-[1000] flex items-end justify-center px-3">
            <div className="relative flex max-h-full w-full max-w-[398px] animate-in flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-100 slide-in-from-bottom duration-300">
              <button
                type="button"
                onClick={handleCloseAll}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-lg font-black text-slate-400 ring-1 ring-slate-100 active:scale-95"
                aria-label="Đóng"
              >
                ×
              </button>

              <div className="shrink-0 px-5 pt-3">
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
              </div>

              <div className="min-h-0 overflow-y-auto px-5 pb-5 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {activeModalType === "milk" && <MilkQuickAdd />}
                {activeModalType === "sleep" && <SleepQuickAdd />}
                {activeModalType === "meal" && <MealQuickAdd />}
                {activeModalType === "diaper" && <DiaperQuickAdd />}
                {activeModalType === "reminder" && <ReminderForm />}
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div
          className={`
            fixed inset-x-0 bottom-[calc(6.7rem+env(safe-area-inset-bottom))]
            z-[1020] flex justify-center px-4 transition-all duration-300
            ${
              toast.isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }
          `}
        >
          <div
            className={`
              flex w-full max-w-[398px] items-center gap-3 rounded-[24px]
              bg-white px-4 py-3 text-sm font-bold shadow-2xl ring-1
              ${
                toast.type === "success"
                  ? "text-emerald-700 ring-emerald-100"
                  : "text-rose-700 ring-rose-100"
              }
            `}
          >
            <span
              className={`
                flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-lg
                ${toast.type === "success" ? "bg-emerald-50" : "bg-rose-50"}
              `}
            >
              {toast.type === "success" ? "✅" : "⚠️"}
            </span>

            <span className="leading-snug">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

import DiaperQuickAdd from "./DiaperQuickAdd";
import MealQuickAdd from "./MealQuickAdd";
import MilkQuickAdd from "./MilkQuickAdd";
import SleepQuickAdd from "./SleepQuickAdd";
import { useQuickAddStore } from "@/src/store/quickAddStore";

type QuickAddType = "milk" | "sleep" | "meal" | "diaper";

type QuickAddStoreRuntime = {
  isOpen?: boolean;
  modalType?: QuickAddType | null;
  closeModal?: () => void;
  openModal?: (type: QuickAddType) => void;
  open?: (type: QuickAddType) => void;
  setModalType?: (type: QuickAddType) => void;
  setIsOpen?: (value: boolean) => void;
};

const quickActions: Array<{
  type: QuickAddType;
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
];

function openQuickAddModal(type: QuickAddType) {
  const store = useQuickAddStore as unknown as {
    getState?: () => QuickAddStoreRuntime;
  };

  const state = store.getState?.();

  if (state?.openModal) {
    state.openModal(type);
    return;
  }

  if (state?.open) {
    state.open(type);
    return;
  }

  state?.setModalType?.(type);
  state?.setIsOpen?.(true);
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
  const { isOpen, modalType, closeModal, toast } = useQuickAddStore();
  const [isChooserOpen, setIsChooserOpen] = useState(false);

  useEffect(() => {
    function handleOpenQuickAdd() {
      setIsChooserOpen(true);
    }

    function handleOpenMilkQuickAdd(event: Event) {
      const customEvent = event as CustomEvent<{ babyId?: string }>;

      setIsChooserOpen(false);
      openQuickAddModal("milk");
      dispatchSelectedBaby(customEvent.detail?.babyId);
    }

    function handleOpenSleepQuickAdd(event: Event) {
      const customEvent = event as CustomEvent<{ babyId?: string }>;

      setIsChooserOpen(false);
      openQuickAddModal("sleep");
      dispatchSelectedBaby(customEvent.detail?.babyId);
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

  function handleCloseChooser() {
    setIsChooserOpen(false);
  }

  function handleSelect(type: QuickAddType) {
    setIsChooserOpen(false);
    openQuickAddModal(type);
  }

  if (!isOpen && !toast && !isChooserOpen) return null;

  return (
    <>
      {isChooserOpen && !isOpen && (
        <>
          <button
            type="button"
            onClick={handleCloseChooser}
            className="fixed inset-0 z-[99] cursor-default bg-slate-950/20 backdrop-blur-[2px]"
            aria-label="Đóng chọn nhanh"
          />

          <div className="fixed inset-x-0 bottom-[calc(6.7rem+env(safe-area-inset-bottom))] z-[100] flex justify-center px-4">
            <div className="w-full max-w-[398px] rounded-[32px] bg-white p-4 shadow-2xl ring-1 ring-pink-100">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

              <div className="mb-4">
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

      {isOpen && (
        <>
          <button
            type="button"
            onClick={closeModal}
            className="fixed inset-0 z-[99] cursor-default bg-slate-950/20 backdrop-blur-[2px]"
            aria-label="Đóng form ghi nhanh"
          />

          <div className="fixed inset-x-0 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] top-[calc(env(safe-area-inset-top)+72px)] z-[100] flex items-end justify-center px-3">
            <div className="flex max-h-full w-full max-w-[398px] animate-in flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-100 slide-in-from-bottom duration-300">
              <div className="shrink-0 px-5 pt-3">
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
              </div>

              <div className="min-h-0 overflow-y-auto px-5 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {modalType === "milk" && <MilkQuickAdd />}
                {modalType === "sleep" && <SleepQuickAdd />}
                {modalType === "meal" && <MealQuickAdd />}
                {modalType === "diaper" && <DiaperQuickAdd />}
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div
          className={`
            fixed inset-x-0 bottom-[calc(6.7rem+env(safe-area-inset-bottom))]
            z-[120] flex justify-center px-4 transition-all duration-300
            ${toast.isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}
          `}
        >
          <div
            className={`
              flex w-full max-w-[398px] items-center gap-3 rounded-[24px]
              bg-white px-4 py-3 text-sm font-bold shadow-2xl ring-1
              ${toast.type === "success" ? "text-emerald-700 ring-emerald-100" : "text-rose-700 ring-rose-100"}
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

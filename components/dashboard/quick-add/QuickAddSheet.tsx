"use client";

import MilkQuickAdd from "./MilkQuickAdd";
import SleepQuickAdd from "./SleepQuickAdd";
import MealQuickAdd from "./MealQuickAdd";
import DiaperQuickAdd from "./DiaperQuickAdd";
import { useQuickAddStore } from "@/src/store/quickAddStore";

export default function QuickAddSheet() {
  const { isOpen, modalType, closeModal, toast } = useQuickAddStore();

  if (!isOpen && !toast) return null;

  return (
    <>
      {isOpen && (
        <>
          <div
            onClick={closeModal}
            className="
              fixed
              inset-0
              z-[99]
              bg-slate-950/20
              backdrop-blur-[2px]
            "
          />

          <div
            className="
              fixed
              inset-x-0
              bottom-20
              z-[100]
              flex
              justify-center
              px-4
            "
          >
            <div
              className="
                w-full
                max-w-md
                animate-in
                slide-in-from-bottom
                duration-300
                rounded-[32px]
                bg-white
                shadow-2xl
                ring-1
                ring-slate-100
              "
            >
              <div className="px-5 pt-3">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
              </div>

              <div className="max-h-[85vh] overflow-y-auto px-5 pb-5">
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
            fixed
            inset-x-0
            bottom-24
            z-[120]
            flex
            justify-center
            px-4
            transition-all
            duration-300
            ${toast.isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}
          `}
        >
          <div
            className={`
              flex
              w-full
              max-w-md
              items-center
              gap-3
              rounded-[24px]
              bg-white
              px-4
              py-3
              text-sm
              font-bold
              shadow-2xl
              ring-1
              ${toast.type === "success" ? "text-emerald-700 ring-emerald-100" : "text-rose-700 ring-rose-100"}
            `}
          >
            <span
              className={`
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-2xl
                text-lg
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

"use client";

import Link from "next/link";
import { useQuickAddStore } from "@/src/store/quickAddStore";
import type { QuickAddType } from "@/src/store/quickAddStore";

const actions: {
  type: QuickAddType;
  icon: string;
  label: string;
}[] = [
  {
    type: "milk",
    icon: "🍼",
    label: "Cho bú",
  },
  {
    type: "sleep",
    icon: "🌙",
    label: "Ngủ",
  },
  {
    type: "meal",
    icon: "🥣",
    label: "Ăn",
  },
  {
    type: "diaper",
    icon: "🧷",
    label: "Tã",
  },
];

export default function QuickActionsCard() {
  const openModal = useQuickAddStore((s) => s.openModal);

  return (
    <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Quick Add
          </p>

          <h3 className="mt-1 font-black text-slate-950">Thao tác nhanh</h3>
        </div>

        <Link href="/tracking" className="text-xs font-black text-pink-500">
          Mở Track
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => openModal(action.type)}
            className="
              rounded-2xl
              bg-slate-50
              px-2
              py-3
              text-center
              ring-1
              ring-slate-100
              transition
              active:scale-[0.98]
            "
          >
            <div className="text-xl">{action.icon}</div>

            <p className="mt-1.5 text-xs font-black text-slate-700">
              {action.label}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

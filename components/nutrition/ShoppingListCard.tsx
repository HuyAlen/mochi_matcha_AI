"use client";

import { useState } from "react";
import { shoppingList } from "@/src/data/nutrition/weeklyMenus";

export default function ShoppingListCard() {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  return (
    <div className="space-y-3">
      {shoppingList.map((item) => {
        const checked = checkedIds.includes(item.id);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setCheckedIds((current) =>
                checked
                  ? current.filter((id) => id !== item.id)
                  : [...current, item.id],
              )
            }
            className="flex w-full items-center justify-between rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100"
          >
            <div>
              <p
                className={`font-black ${
                  checked ? "text-slate-300 line-through" : "text-slate-950"
                }`}
              >
                {item.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {item.amount} · {item.category}
              </p>
            </div>

            <span
              className={`flex size-8 items-center justify-center rounded-full text-sm font-black ${
                checked
                  ? "bg-pink-500 text-white"
                  : "bg-slate-100 text-slate-300"
              }`}
            >
              ✓
            </span>
          </button>
        );
      })}
    </div>
  );
}

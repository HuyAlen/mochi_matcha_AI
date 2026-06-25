"use client";

import { useLayoutEffect } from "react";
import type { ReactNode } from "react";
import { babies } from "@/src/store/babyStore";
import type { BabyId } from "@/types/baby";

type SheetShellProps = {
  eyebrow: string;
  title: string;
  icon: string;
  children: ReactNode;
  onClose: () => void;
};

export type ActivitySheetFormProps = {
  babyId: BabyId;
  onBabyChange: (babyId: BabyId) => void;
  onClose: () => void;
};

function usePreservePageScroll(isOpen: boolean) {
  useLayoutEffect(() => {
    if (!isOpen || typeof window === "undefined") return undefined;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyRight = body.style.right;
    const previousBodyWidth = body.style.width;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverscroll = html.style.overscrollBehavior;
    const previousHtmlScrollBehavior = html.style.scrollBehavior;

    html.style.overscrollBehavior = "none";
    html.style.scrollBehavior = "auto";

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.right = previousBodyRight;
      body.style.width = previousBodyWidth;
      body.style.overflow = previousBodyOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll;
      html.style.scrollBehavior = previousHtmlScrollBehavior;

      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
    };
  }, [isOpen]);
}

export function ActivitySheetShell({
  eyebrow,
  title,
  icon,
  children,
  onClose,
}: SheetShellProps) {
  usePreservePageScroll(true);

  return (
    <div className="fixed inset-0 z-80">
      <button
        type="button"
        aria-label="Đóng popup"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
      />

      <section className="absolute inset-x-0 bottom-0 mx-auto max-h-[72svh] max-w-md overflow-hidden rounded-t-4xl bg-white shadow-2xl ring-1 ring-pink-100 sm:bottom-4 sm:rounded-4xl">
        <div className="sticky top-0 z-10 bg-white px-3.5 pt-2.5 sm:px-4">
          <div className="mx-auto h-1 w-9 rounded-full bg-pink-100" />

          <div className="mt-2.5 flex items-center justify-between gap-3 pb-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-lg">
                {icon}
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-pink-400">
                  {eyebrow}
                </p>
                <h2 className="truncate text-lg font-black leading-tight text-slate-950">
                  {title}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-pink-50 text-base font-light text-pink-500 ring-1 ring-pink-100 active:scale-95"
              aria-label="Đóng"
            >
              ×
            </button>
          </div>
        </div>

        <div className="max-h-[calc(72svh-66px)] overflow-y-auto overscroll-contain px-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4">
          {children}
        </div>
      </section>
    </div>
  );
}

export function BabySelector({
  value,
  onChange,
}: {
  value: BabyId;
  onChange: (babyId: BabyId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-3xl bg-slate-50 p-1">
      {babies.map((baby) => (
        <button
          key={baby.id}
          type="button"
          onClick={() => onChange(baby.id)}
          className={`h-10 rounded-2xl px-3 text-sm font-black transition active:scale-[0.98] ${
            value === baby.id
              ? "bg-pink-500 text-white shadow-sm shadow-pink-100"
              : "text-slate-500"
          }`}
        >
          <span className="mr-1">{baby.avatarEmoji}</span>
          {baby.name}
        </button>
      ))}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  disabled = false,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="h-12 w-full rounded-3xl bg-pink-500 px-5 text-sm font-black text-white shadow-lg shadow-pink-100 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

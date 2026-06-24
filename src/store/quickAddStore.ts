"use client";

import { create } from "zustand";

export type QuickAddType = "milk" | "sleep" | "meal" | "diaper" | "reminder";

export type QuickAddToastType = "success" | "error";

interface QuickAddToast {
  id: number;
  type: QuickAddToastType;
  message: string;
  isVisible: boolean;
}

interface QuickAddState {
  isOpen: boolean;
  modalType: QuickAddType | null;
  toast: QuickAddToast | null;

  openModal: (type: QuickAddType) => void;
  closeModal: () => void;
  showToast: (message: string, type?: QuickAddToastType) => void;
  clearToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useQuickAddStore = create<QuickAddState>((set) => ({
  isOpen: false,
  modalType: null,
  toast: null,

  openModal: (type) =>
    set({
      isOpen: true,
      modalType: type,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      modalType: null,
    }),

  showToast: (message, type = "success") => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    set({
      toast: {
        id: Date.now(),
        type,
        message,
        isVisible: true,
      },
    });

    toastTimer = setTimeout(() => {
      set((state) => ({
        toast: state.toast ? { ...state.toast, isVisible: false } : null,
      }));
    }, 2200);

    setTimeout(() => {
      set((state) => ({
        toast: state.toast?.isVisible === false ? null : state.toast,
      }));
    }, 2600);
  },

  clearToast: () => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    set({
      toast: null,
    });
  },
}));

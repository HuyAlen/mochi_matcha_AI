"use client";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export default function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Thêm ghi nhận nhanh"
      className="fixed bottom-24 left-1/2 z-[60] flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-pink-500 text-3xl font-black text-white shadow-2xl shadow-pink-300/60 ring-8 ring-white transition active:scale-95"
    >
      +
    </button>
  );
}

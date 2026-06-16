interface FloatingAddButtonProps {
  onClick: () => void;
}

export default function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 left-1/2 z-50 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-pink-500 text-3xl font-black text-white shadow-xl shadow-pink-200"
      aria-label="Thêm ghi nhận"
    >
      +
    </button>
  );
}

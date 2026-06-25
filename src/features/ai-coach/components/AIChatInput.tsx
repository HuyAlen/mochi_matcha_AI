interface AIChatInputProps {
  onAsk: (question: string) => void;
}

export default function AIChatInput({ onAsk }: AIChatInputProps) {
  return (
    <form
      className="sticky bottom-24 flex items-center gap-2 rounded-full bg-white p-2 shadow-lg ring-1 ring-pink-100"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const input = form.elements.namedItem("message") as HTMLInputElement;
        const value = input.value.trim();

        if (!value) return;

        onAsk(value);
        input.value = "";
      }}
    >
      <input
        name="message"
        className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-slate-400"
        placeholder="Hỏi Mind AI về Mochi & Matcha..."
      />
      <button
        type="submit"
        className="flex size-11 items-center justify-center rounded-full bg-pink-500 text-white shadow-sm"
      >
        ➤
      </button>
    </form>
  );
}

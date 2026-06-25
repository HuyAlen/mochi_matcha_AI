import type { AIQuickQuestion } from "@/types/ai";

const suggestions: AIQuickQuestion[] = [
  {
    id: "meal-today",
    label: "Hôm nay nên cho 2 bé ăn gì?",
    prompt: "Hôm nay nên cho Mochi và Matcha ăn gì?",
  },
  {
    id: "sleep-compare",
    label: "So sánh giấc ngủ 2 bé",
    prompt: "So sánh giấc ngủ của Mochi và Matcha hôm nay",
  },
  {
    id: "meal-less",
    label: "Vì sao bé ăn ít hơn?",
    prompt: "Vì sao một bé ăn ít hơn bé còn lại?",
  },
  {
    id: "daily-summary",
    label: "Tóm tắt hôm nay",
    prompt: "Tóm tắt tình hình hôm nay của Mochi và Matcha",
  },
];

interface AISuggestionListProps {
  onAsk: (question: string) => void;
}

export default function AISuggestionList({ onAsk }: AISuggestionListProps) {
  return (
    <div>
      <h3 className="font-black text-slate-950">Gợi ý câu hỏi</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onAsk(item.prompt)}
            className="rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-left text-sm font-bold leading-5 text-slate-700 transition hover:bg-pink-100"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

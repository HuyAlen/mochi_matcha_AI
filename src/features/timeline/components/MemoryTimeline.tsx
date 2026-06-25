import MemoryCard from "./MemoryCard";

const memories = [
  {
    title: "Mochi ăn hết bữa sáng",
    date: "16/06/2026",
    baby: "Mochi",
    emoji: "🥣",
    description: "Bé ăn hết cháo yến mạch chuối và rất hợp tác.",
  },
  {
    title: "Matcha ngủ trưa ngon",
    date: "16/06/2026",
    baby: "Matcha",
    emoji: "🌙",
    description: "Bé ngủ trưa 1.5 giờ, thức dậy vui vẻ.",
  },
  {
    title: "Hai bé chơi cùng nhau",
    date: "15/06/2026",
    baby: "Mochi & Matcha",
    emoji: "🎀",
    description: "Mẹ ghi lại khoảnh khắc hai chị em cười với nhau.",
  },
];

export default function MemoryTimeline() {
  return (
    <div className="space-y-3">
      {memories.map((memory) => (
        <MemoryCard key={`${memory.date}-${memory.title}`} {...memory} />
      ))}
    </div>
  );
}

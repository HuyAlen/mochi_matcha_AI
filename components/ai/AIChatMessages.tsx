import type { AIChatMessage } from "@/types/ai";

interface AIChatMessagesProps {
  messages: AIChatMessage[];
}

export default function AIChatMessages({ messages }: AIChatMessagesProps) {
  return (
    <div className="flex-1 space-y-3">
      {messages.slice(1).map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[86%] whitespace-pre-line rounded-3xl px-4 py-3 text-sm leading-6 ${
              message.role === "user"
                ? "bg-pink-500 text-white"
                : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
}

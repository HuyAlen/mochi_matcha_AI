"use client";

import { useMemo, useState } from "react";
import AIChatInput from "@/components/ai/AIChatInput";
import AIChatMessages from "@/components/ai/AIChatMessages";
import AIDataSnapshot from "@/components/ai/AIDataSnapshot";
import AIHeroCard from "@/components/ai/AIHeroCard";
import AIInsightPanel from "@/components/ai/AIInsightPanel";
import AISuggestionList from "@/components/ai/AISuggestionList";
import AITwinSummaryCard from "@/components/ai/AITwinSummaryCard";
import AppShell from "@/components/layout/AppShell";
import {
  answerParentQuestion,
  generatePersonalInsights,
} from "@/src/services/ai/aiInsightEngine";
import { useMealStore } from "@/src/store/mealStore";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { AIChatMessage } from "@/types/ai";
import type { MealEntry } from "@/types/meal";
import type { TrackingEntry } from "@/types/tracking";

export default function AICoachPage() {
  const trackingEntries = useTrackingStore(
    (state: { entries: TrackingEntry[] }) => state.entries,
  );

  const mealEntries = useMealStore(
    (state: { entries: MealEntry[] }) => state.entries,
  );

  const insights = useMemo(
    () => generatePersonalInsights(trackingEntries, mealEntries),
    [trackingEntries, mealEntries],
  );

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "hello",
      role: "ai",
      content: "Xin chào mẹ! Mẹ cần Mind AI giúp gì hôm nay?",
      createdAt: new Date().toISOString(),
    },
  ]);

  function ask(question: string) {
    const answer = answerParentQuestion(question, insights);

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: question,
        createdAt: new Date().toISOString(),
      },
      {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: answer,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  return (
    <AppShell>
      <section className="flex min-h-[calc(100vh-150px)] flex-col space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Mind AI Coach</h2>
          <p className="mt-1 text-sm text-slate-500">
            Hỏi đáp & phân tích cá nhân hóa cho Mochi & Matcha.
          </p>
        </div>

        <AIHeroCard />

        <AITwinSummaryCard insights={insights} />

        <AIDataSnapshot
          trackingEntries={trackingEntries}
          mealEntries={mealEntries}
        />

        <AIInsightPanel insights={insights} />

        <AISuggestionList onAsk={ask} />

        <AIChatMessages messages={messages} />

        <AIChatInput onAsk={ask} />
      </section>
    </AppShell>
  );
}

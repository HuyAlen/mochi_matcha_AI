"use client";

import { useMemo, useRef } from "react";

import AppShell from "@/components/layout/AppShell";
import MemoryComposer from "@/components/memory/MemoryComposer";
import MemoryFilters from "@/components/memory/MemoryFilters";
import MemoryHero from "@/components/memory/MemoryHero";
import MemoryTimeline from "@/components/memory/MemoryTimeline";
import { useMemoryStore } from "@/store/memoryStore";

export default function TimelinePage() {
  const composerRef = useRef<HTMLDivElement | null>(null);

  const memories = useMemoryStore((state) => state.memories);
  const selectedBabyFilter = useMemoryStore(
    (state) => state.selectedBabyFilter,
  );
  const selectedTypeFilter = useMemoryStore(
    (state) => state.selectedTypeFilter,
  );
  const setBabyFilter = useMemoryStore((state) => state.setBabyFilter);
  const setTypeFilter = useMemoryStore((state) => state.setTypeFilter);
  const addMemory = useMemoryStore((state) => state.addMemory);
  const toggleFavorite = useMemoryStore((state) => state.toggleFavorite);
  const deleteMemory = useMemoryStore((state) => state.deleteMemory);

  const filteredMemories = useMemo(() => {
    return memories
      .filter((memory) => {
        if (selectedBabyFilter === "all") return true;
        if (selectedBabyFilter === "both") return memory.babyId === "both";

        return memory.babyId === selectedBabyFilter || memory.babyId === "both";
      })
      .filter((memory) => {
        if (selectedTypeFilter === "all") return true;

        return memory.type === selectedTypeFilter;
      })
      .sort((a, b) => {
        const favoriteScore = Number(b.isFavorite) - Number(a.isFavorite);

        if (favoriteScore !== 0) return favoriteScore;

        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [memories, selectedBabyFilter, selectedTypeFilter]);

  function scrollToComposer() {
    composerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl space-y-5 pb-16">
        <MemoryHero memories={memories} />

        <div ref={composerRef}>
          <MemoryComposer onAdd={addMemory} />
        </div>

        <MemoryFilters
          babyFilter={selectedBabyFilter}
          typeFilter={selectedTypeFilter}
          onBabyChange={setBabyFilter}
          onTypeChange={setTypeFilter}
        />

        <MemoryTimeline
          memories={filteredMemories}
          onCreate={scrollToComposer}
          onToggleFavorite={toggleFavorite}
          onDelete={deleteMemory}
        />
      </main>
    </AppShell>
  );
}

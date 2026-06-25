"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect } from "react";

import { babies, getBabyById, useBabyStore } from "@/src/store/babyStore";
import type { Baby, BabyId } from "@/types/baby";

interface GrowthBabySelectorProps {
  selectedBabyId: BabyId;
  onChange: (babyId: BabyId) => void;
}

const avatarDatabaseName = "mind-ai-avatar-db";
const avatarStoreName = "baby-avatars";

function openAvatarDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(avatarDatabaseName, 1);

    request.onerror = () => reject(new Error("Không mở được Avatar DB."));
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(avatarStoreName)) {
        database.createObjectStore(avatarStoreName);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function loadAvatarFromDatabase(babyId: BabyId) {
  const database = await openAvatarDatabase();

  return new Promise<string>((resolve) => {
    const transaction = database.transaction(avatarStoreName, "readonly");
    const store = transaction.objectStore(avatarStoreName);
    const request = store.get(babyId);

    request.onsuccess = () => {
      database.close();
      const value = request.result;

      resolve(typeof value === "string" ? value : "");
    };

    request.onerror = () => {
      database.close();
      resolve("");
    };
  });
}

function BabyAvatar({ baby }: { baby: Baby }) {
  if (baby.avatarUrl?.startsWith("data:image")) {
    return (
      <img
        src={baby.avatarUrl}
        alt={baby.nickname || baby.name}
        className="h-11 w-11 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
      {baby.avatarEmoji}
    </span>
  );
}

export default function GrowthBabySelector({
  selectedBabyId,
  onChange,
}: GrowthBabySelectorProps) {
  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const updateBabyProfile = useBabyStore((state) => state.updateBabyProfile);
  const source = babyProfiles?.length ? babyProfiles : babies;

  useEffect(() => {
    let isMounted = true;

    (["mochi", "matcha"] as BabyId[]).forEach((babyId) => {
      void loadAvatarFromDatabase(babyId).then((avatarUrl) => {
        if (!isMounted || !avatarUrl) return;

        updateBabyProfile(babyId, { avatarUrl });
      });
    });

    return () => {
      isMounted = false;
    };
  }, [updateBabyProfile]);

  return (
    <section className="grid grid-cols-2 gap-3">
      {(["mochi", "matcha"] as BabyId[]).map((babyId) => {
        const baby = getBabyById(babyId, source);
        const active = selectedBabyId === baby.id;
        const displayName = baby.nickname || baby.name;

        return (
          <button
            key={baby.id}
            type="button"
            onClick={() => onChange(baby.id)}
            className={[
              "rounded-3xl p-3 text-left shadow-sm ring-1 transition",
              active
                ? "bg-pink-500 text-white ring-pink-200 shadow-pink-100"
                : "bg-white text-slate-500 ring-pink-100 hover:bg-pink-50",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <BabyAvatar baby={baby} />
              <p
                className={[
                  "min-w-0 truncate text-base font-black",
                  active ? "text-white" : "text-slate-950",
                ].join(" ")}
              >
                {displayName}
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
}

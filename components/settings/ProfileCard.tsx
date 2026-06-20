"use client";

import Image from "next/image";
import Link from "next/link";

import { useBabyStore } from "@/store/babyStore";
import type { Baby } from "@/types/baby";

function getDisplayName(baby: Baby) {
  return baby.nickname?.trim() || baby.name;
}

function formatBabyAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(birth.getTime())) {
    return "Chưa có ngày sinh";
  }

  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonthLastDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
    ).getDate();
    days += previousMonthLastDay;
  }

  if (months <= 0) {
    return `${Math.max(days, 0)} ngày`;
  }

  return days > 0 ? `${months} tháng ${days} ngày` : `${months} tháng`;
}

function BabyAvatar({ baby }: { baby: Baby }) {
  const label = getDisplayName(baby);

  if (baby.avatarUrl) {
    return (
      <Image
        src={baby.avatarUrl}
        alt={label}
        width={44}
        height={44}
        className="size-11 rounded-2xl object-cover ring-1 ring-white/80"
      />
    );
  }

  return (
    <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-100">
      {baby.avatarEmoji || "👶"}
    </span>
  );
}

export default function ProfileCard() {
  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const selectedBabyId = useBabyStore((state) => state.selectedBabyId);
  const setSelectedBabyId = useBabyStore((state) => state.setSelectedBabyId);

  const babyNames = babyProfiles.map(getDisplayName).join(" & ");
  const activeBaby =
    babyProfiles.find((baby) => baby.id === selectedBabyId) ?? babyProfiles[0];

  return (
    <section className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-pink-50 text-3xl ring-1 ring-pink-100">
            👩🏻
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-400">
              Family Center
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight tracking-tight text-slate-950">
              Mẹ của {babyNames}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Quản lý hồ sơ, sức khỏe và chăm sóc song sinh trong một nơi.
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-sm font-black text-slate-400 ring-1 ring-slate-100 transition active:scale-95"
          aria-label="Cài đặt hồ sơ"
        >
          ⚙️
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-3xl bg-slate-50 p-2 ring-1 ring-slate-100">
        <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-100">
          <p className="text-lg font-black text-slate-950">
            {babyProfiles.length}
          </p>
          <p className="text-[11px] font-bold text-slate-400">bé</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-100">
          <p className="text-lg font-black text-slate-950">6</p>
          <p className="text-[11px] font-bold text-slate-400">mục</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-100">
          <p className="text-lg font-black text-emerald-500">Local</p>
          <p className="text-[11px] font-bold text-slate-400">lưu trữ</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {babyProfiles.map((baby) => {
          const isActive = baby.id === activeBaby.id;

          return (
            <Link
              key={baby.id}
              href="/babies"
              onClick={() => setSelectedBabyId(baby.id)}
              className={`rounded-3xl p-3 transition active:scale-[0.99] ${
                isActive
                  ? "bg-pink-500 text-white shadow-sm shadow-pink-200"
                  : "bg-white text-slate-950 ring-1 ring-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <BabyAvatar baby={baby} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">
                    {getDisplayName(baby)}
                  </p>
                  <p
                    className={`mt-0.5 truncate text-xs font-bold ${
                      isActive ? "text-pink-50" : "text-slate-400"
                    }`}
                  >
                    {formatBabyAge(baby.birthDate)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

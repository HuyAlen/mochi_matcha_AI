"use client";

import { useEffect, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import LogoutButton from "@/components/settings/LogoutButton";
import { useBabyStore } from "@/store/babyStore";
import { useTrackingStore } from "@/store/trackingStore";
import {
  getLastSupabaseSyncAt,
  getSupabaseSyncError,
  getSupabaseSyncStatus,
  SUPABASE_SYNC_EVENT,
  queuePushItems,
} from "@/lib/supabase/sync";

type MenuItem = {
  title: string;
  description: string;
  icon: string;
  badge?: string;
  href?: string;
};

type BabyProfileView = {
  id: string;
  name: string;
  age: string;
  avatarUrl?: string;
  fallbackIcon: string;
  href: string;
};

const careMenu: MenuItem[] = [
  {
    title: "Tăng trưởng",
    description: "Chiều cao, cân nặng và biểu đồ phát triển",
    icon: "📈",
    badge: "Theo dõi",
    href: "/growth",
  },
  {
    title: "Tiêm chủng",
    description: "Lịch tiêm tự động theo ngày sinh của bé",
    icon: "💉",
    badge: "Auto",
    href: "/vaccines",
  },
  {
    title: "Nhắc nhở",
    description: "Lịch uống sữa, ngủ, ăn dặm và chăm bé",
    icon: "🔔",
    badge: "Hôm nay",
    href: "/notifications",
  },
  {
    title: "Thư viện thực đơn ăn dặm",
    description: "Gợi ý món ăn, thực đơn và dinh dưỡng",
    icon: "🥣",
    badge: "Mới",
    href: "/nutrition",
  },
  {
    title: "Sổ ký ức",
    description: "Cột mốc và khoảnh khắc đáng nhớ",
    icon: "📖",
    href: "/memories",
  },
];

const settingsMenu: MenuItem[] = [
  {
    title: "Cài đặt",
    description: "Tài khoản, giao diện và tùy chỉnh ứng dụng",
    icon: "⚙️",
    href: "/settings/account",
  },
];

function buildFamilyMenu(familyName: string): MenuItem[] {
  return [
    {
      title: "Gia đình",
      description: `Thành viên cùng chăm sóc ${familyName}`,
      icon: "👨‍👩‍👧‍👧",
      badge: "4 người",
      href: "/family",
    },
  ];
}

type SyncState =
  | "checking"
  | "synced"
  | "syncing"
  | "pending"
  | "offline"
  | "error";

type SyncInfo = {
  state: SyncState;
  lastSyncText: string;
};

function formatSyncAge(value: string | null) {
  if (!value) return "Chưa có lần đồng bộ thành công";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có lần đồng bộ thành công";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (diffMinutes < 1) return "Vừa đồng bộ";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return `${date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  })} ${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function useSupabaseSyncStatus(): SyncInfo {
  const [syncInfo, setSyncInfo] = useState<SyncInfo>({
    state: "checking",
    lastSyncText: "Đang kiểm tra trạng thái đồng bộ",
  });

  useEffect(() => {
    function refresh() {
      const status = getSupabaseSyncStatus();
      const lastSyncAt = getLastSupabaseSyncAt();
      const errorMessage = getSupabaseSyncError();

      if (status === "offline") {
        setSyncInfo({
          state: "offline",
          lastSyncText: lastSyncAt
            ? `Chờ kết nối mạng • Lần cuối ${formatSyncAge(lastSyncAt)}`
            : "Chờ kết nối mạng",
        });
        return;
      }

      if (status === "syncing") {
        setSyncInfo({
          state: "syncing",
          lastSyncText: "Đang lưu dữ liệu lên Supabase",
        });
        return;
      }

      if (status === "error") {
        setSyncInfo({
          state: "error",
          lastSyncText: errorMessage || "Đồng bộ thất bại",
        });
        return;
      }

      if (lastSyncAt) {
        setSyncInfo({
          state: "synced",
          lastSyncText: formatSyncAge(lastSyncAt),
        });
        return;
      }

      setSyncInfo({
        state: "pending",
        lastSyncText: "Chưa có lần đồng bộ thành công",
      });
    }

    refresh();

    const refreshTimer = window.setInterval(refresh, 60_000);

    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener(SUPABASE_SYNC_EVENT, refresh);

    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(SUPABASE_SYNC_EVENT, refresh);
    };
  }, []);

  return syncInfo;
}

const syncCopy: Record<
  SyncState,
  {
    badge: string;
    title: string;
    description: string;
    className: string;
    badgeClassName: string;
    icon: string;
  }
> = {
  checking: {
    badge: "Kiểm tra",
    title: "Supabase Cloud",
    description: "Đang kiểm tra trạng thái đồng bộ.",
    className: "border-slate-100 bg-white text-slate-600",
    badgeClassName: "bg-slate-100 text-slate-500",
    icon: "↻",
  },
  synced: {
    badge: "Đã đồng bộ",
    title: "Supabase Cloud",
    description: "Trạng thái đồng bộ đã được xác nhận.",
    className: "border-emerald-100 bg-emerald-50/80 text-emerald-700",
    badgeClassName: "bg-emerald-100 text-emerald-700",
    icon: "✓",
  },
  syncing: {
    badge: "Đang đồng bộ",
    title: "Supabase Cloud",
    description: "Đang lưu thay đổi mới nhất lên Cloud.",
    className: "border-sky-100 bg-sky-50/80 text-sky-700",
    badgeClassName: "bg-sky-100 text-sky-700",
    icon: "↻",
  },
  pending: {
    badge: "Chờ đồng bộ",
    title: "Supabase Cloud",
    description: "Chưa có lần đồng bộ thành công.",
    className: "border-amber-100 bg-amber-50/80 text-amber-700",
    badgeClassName: "bg-amber-100 text-amber-700",
    icon: "!",
  },
  offline: {
    badge: "Offline",
    title: "Supabase Cloud",
    description: "Chờ kết nối mạng để đồng bộ.",
    className: "border-amber-100 bg-amber-50/80 text-amber-700",
    badgeClassName: "bg-amber-100 text-amber-700",
    icon: "!",
  },
  error: {
    badge: "Lỗi đồng bộ",
    title: "Supabase Cloud",
    description: "Chưa thể đồng bộ dữ liệu mới nhất.",
    className: "border-rose-100 bg-rose-50/80 text-rose-700",
    badgeClassName: "bg-rose-100 text-rose-700",
    icon: "!",
  },
};

function getBabyId(baby: unknown, fallback: string) {
  const value = baby as Record<string, unknown>;
  return String(value.id ?? value.babyId ?? value.slug ?? fallback);
}

function getBabyName(baby: unknown, fallback: string) {
  const value = baby as Record<string, unknown>;
  const nickname =
    typeof value.nickname === "string" ? value.nickname.trim() : "";
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const displayName =
    typeof value.displayName === "string" ? value.displayName.trim() : "";

  return nickname || name || displayName || fallback;
}

function getBabyAvatarUrl(baby: unknown) {
  const value = baby as Record<string, unknown>;
  const avatar =
    value.avatarUrl ?? value.photoUrl ?? value.imageUrl ?? value.avatar;

  if (
    typeof avatar === "string" &&
    (avatar.startsWith("http") || avatar.startsWith("data:image"))
  ) {
    return avatar;
  }

  return undefined;
}

function getBabyBirthDate(baby: unknown) {
  const value = baby as Record<string, unknown>;
  const birthDate =
    value.birthDate ?? value.birthday ?? value.dob ?? value.dateOfBirth;
  return typeof birthDate === "string" ? birthDate : undefined;
}

function formatBabyAge(birthDate?: string) {
  if (!birthDate) return "Chưa có ngày sinh";

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "Chưa có ngày sinh";

  const today = new Date();
  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    today.getMonth() -
    birth.getMonth();

  let days = today.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 1) return `${Math.max(days, 0)} ngày tuổi`;
  return `${Math.max(months, 0)} tháng ${Math.max(days, 0)} ngày`;
}

function buildBabyProfiles(rawBabies: unknown[]): BabyProfileView[] {
  const source = rawBabies.length
    ? rawBabies
    : [
        {
          id: "mochi",
          name: "Mochi",
          birthDate: "2025-10-16",
          avatarEmoji: "🎀",
        },
        {
          id: "matcha",
          name: "Matcha",
          birthDate: "2025-10-16",
          avatarEmoji: "🌸",
        },
      ];

  return source.slice(0, 2).map((baby, index) => {
    const id = getBabyId(baby, index === 0 ? "mochi" : "matcha");
    const name = getBabyName(baby, index === 0 ? "Mochi" : "Matcha");

    return {
      id,
      name,
      age: formatBabyAge(getBabyBirthDate(baby)),
      avatarUrl: getBabyAvatarUrl(baby),
      fallbackIcon:
        typeof (baby as Record<string, unknown>).avatarEmoji === "string"
          ? String((baby as Record<string, unknown>).avatarEmoji)
          : index === 0
            ? "🎀"
            : "🌸",
      href: `/babies?baby=${encodeURIComponent(id)}`,
    };
  });
}

function HeaderCard({ familyName }: { familyName: string }) {
  return (
    <section className="rounded-[1.8rem] border border-pink-100/80 bg-white/95 p-5 shadow-[0_16px_42px_rgba(236,72,153,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-pink-400">
            Family Center
          </p>
          <h1 className="mt-2 text-[24px] font-black leading-[1.08] tracking-[-0.04em] text-slate-950">
            Gia đình {familyName}
          </h1>
          <p className="mt-2 max-w-[260px] text-[14px] font-semibold leading-6 text-slate-500">
            Quản lý hồ sơ, chăm sóc và cài đặt trong một nơi.
          </p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-pink-50 text-3xl shadow-inner ring-1 ring-pink-100/70">
          👨‍👩‍👧‍👧
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      <span className="text-base leading-none">{icon}</span>
      <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-600">
        {title}
      </h2>
    </div>
  );
}

function BabyAvatar({ baby }: { baby: BabyProfileView }) {
  if (baby.avatarUrl) {
    return (
      <img
        src={baby.avatarUrl}
        alt={baby.name}
        className="h-11 w-11 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-pink-100"
      />
    );
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-50 text-xl shadow-sm ring-1 ring-pink-100">
      {baby.fallbackIcon}
    </span>
  );
}

function TwinProfiles({ babies }: { babies: BabyProfileView[] }) {
  return (
    <section>
      <SectionTitle title="Hồ sơ song sinh" icon="🎀" />
      <div className="grid grid-cols-2 gap-3">
        {babies.map((baby) => (
          <a
            key={baby.id}
            href={baby.href}
            className="min-w-0 rounded-[1.45rem] border border-slate-100 bg-white p-3 text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.045)] transition active:scale-[0.99] active:bg-pink-50"
          >
            <div className="flex items-center gap-2">
              <BabyAvatar baby={baby} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-black">
                  {baby.name}
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-bold text-slate-400">
                  {baby.age}
                </span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function MenuSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: MenuItem[];
}) {
  return (
    <section>
      <SectionTitle title={title} icon={icon} />
      <div className="overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.045)]">
        {items.map((item, index) => (
          <a
            key={item.title}
            href={item.href ?? "#"}
            className={`flex min-h-[62px] items-center gap-3 px-4 py-3 transition active:bg-pink-50 ${
              index > 0 ? "border-t border-slate-100" : ""
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-lg shadow-sm">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[15px] font-black text-slate-950">
                  {item.title}
                </span>
                {item.badge ? (
                  <span className="shrink-0 rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-black text-pink-500">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block truncate text-[12px] font-semibold text-slate-400">
                {item.description}
              </span>
            </span>
            <span className="text-xl font-bold text-slate-300">›</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function SupabaseStatus() {
  const syncInfo = useSupabaseSyncStatus();
  const sync = syncCopy[syncInfo.state];
  const isSynced = syncInfo.state === "synced";
  const statusText = isSynced
    ? `Đã đồng bộ • ${syncInfo.lastSyncText}`
    : syncInfo.lastSyncText || sync.description;

  return (
    <section>
      <SectionTitle title="Đồng bộ" icon="☁️" />
      <div className={`rounded-[1.35rem] border px-4 py-3 ${sync.className}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-base font-black shadow-sm">
            {sync.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="truncate text-[15px] font-black text-slate-950">
                {sync.title}
              </p>
              {isSynced ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[12px] font-black text-emerald-700">
                  ✓
                </span>
              ) : (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${sync.badgeClassName}`}
                >
                  {sync.badge}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[12px] font-bold">
              {statusText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const store = useBabyStore() as unknown as Record<string, unknown>;
  const trackingEntries = useTrackingStore((state) => state.entries);
  const rawBabies = Array.isArray(store.babyProfiles) ? store.babyProfiles : [];
  const babies = buildBabyProfiles(rawBabies);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.onLine) return;

    queuePushItems("baby_profiles", rawBabies as { id: string }[]);
    queuePushItems("tracking_entries", trackingEntries);
  }, [rawBabies, trackingEntries]);
  const familyName = babies.map((baby) => baby.name).join(" & ");
  const familyMenu = buildFamilyMenu(familyName);

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-[430px] px-4 pb-6 pt-3">
        <div className="space-y-4">
          <HeaderCard familyName={familyName} />
          <TwinProfiles babies={babies} />
          <MenuSection title="Chăm sóc bé" icon="♡" items={careMenu} />
          <MenuSection title="Gia đình" icon="👨‍👩‍👧‍👧" items={familyMenu} />
          <MenuSection title="Ứng dụng" icon="⚙️" items={settingsMenu} />
          <SupabaseStatus />
          <div className="pt-1">
            <LogoutButton />
          </div>
        </div>
      </main>
    </AppShell>
  );
}

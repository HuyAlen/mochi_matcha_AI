"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useEffect, useMemo, useState } from "react";

import AppShell from "@/components/layout/AppShell";
import { getBabyById, useBabyStore } from "@/store/babyStore";
import type { Baby, BabyId } from "@/types/baby";

const babyIds: BabyId[] = ["mochi", "matcha"];

const AVATAR_DB_NAME = "mind-ai-avatar-db";
const AVATAR_STORE_NAME = "baby-avatars";

function openAvatarDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AVATAR_DB_NAME, 1);

    request.onerror = () => reject(new Error("Không mở được Avatar DB."));
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(AVATAR_STORE_NAME)) {
        database.createObjectStore(AVATAR_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function saveAvatarToDatabase(babyId: BabyId, avatarUrl: string) {
  const database = await openAvatarDatabase();

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(AVATAR_STORE_NAME, "readwrite");
    const store = transaction.objectStore(AVATAR_STORE_NAME);

    store.put(avatarUrl, babyId);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(new Error("Không lưu được avatar."));
    };
  });
}

async function loadAvatarFromDatabase(babyId: BabyId) {
  const database = await openAvatarDatabase();

  return new Promise<string>((resolve) => {
    const transaction = database.transaction(AVATAR_STORE_NAME, "readonly");
    const store = transaction.objectStore(AVATAR_STORE_NAME);
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

async function deleteAvatarFromDatabase(babyId: BabyId) {
  const database = await openAvatarDatabase();

  return new Promise<void>((resolve) => {
    const transaction = database.transaction(AVATAR_STORE_NAME, "readwrite");
    const store = transaction.objectStore(AVATAR_STORE_NAME);

    store.delete(babyId);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      resolve();
    };
  });
}

function safeText(value: string | number | undefined | null) {
  return value ?? "";
}

function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();

  if (!birthDate || Number.isNaN(birth.getTime())) return "Chưa cập nhật";

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth();

  if (now.getDate() < birth.getDate()) months -= 1;

  if (months < 1) {
    const days = Math.max(
      0,
      Math.floor((now.getTime() - birth.getTime()) / 86_400_000),
    );

    return `${days} ngày tuổi`;
  }

  if (months < 12) return `${months} tháng tuổi`;

  const years = Math.floor(months / 12);
  const remainMonths = months % 12;

  return remainMonths > 0
    ? `${years} tuổi ${remainMonths} tháng`
    : `${years} tuổi`;
}

function formatBirthDate(value: string) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function AvatarPreview({
  src,
  emoji,
  name,
  size = "large",
}: {
  src?: string;
  emoji: string;
  name: string;
  size?: "small" | "large";
}) {
  const sizeClass =
    size === "small" ? "h-7 w-7 text-base" : "h-full w-full text-5xl";

  if (src && src.startsWith("data:image")) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={`${sizeClass} flex items-center justify-center rounded-full bg-pink-50`}
    >
      {emoji}
    </span>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Không đọc được ảnh."));
    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string" && result.startsWith("data:image")) {
        resolve(result);
        return;
      }

      reject(new Error("Ảnh không hợp lệ."));
    };

    reader.readAsDataURL(file);
  });
}

function compressImageDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onerror = () => resolve(dataUrl);
    image.onload = () => {
      const maxSize = 320;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };

    image.src = dataUrl;
  });
}

function Field({
  label,
  value,
  type = "text",
  disabled,
  onChange,
}: {
  label: string;
  value: string | number | undefined | null;
  type?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={safeText(value)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-pink-300 focus:bg-white disabled:text-slate-500"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  disabled,
  rows = 3,
  onChange,
}: {
  label: string;
  value: string | undefined | null;
  disabled: boolean;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <textarea
        value={safeText(value)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-none rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm font-bold leading-6 text-slate-800 outline-none transition focus:border-pink-300 focus:bg-white disabled:text-slate-500"
      />
    </label>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
      <div className="mb-4">
        <h3 className="text-base font-black text-slate-950">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-linear-to-b from-pink-50 to-white p-4 text-center ring-1 ring-pink-100">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
        {icon}
      </div>
      <p className="mt-2 text-xs font-black text-slate-900">{value}</p>
      <p className="mt-0.5 text-[11px] font-bold text-slate-400">{label}</p>
    </div>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-white/80 px-4 py-3 ring-1 ring-pink-100">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-800">
        <span className="mr-1">{icon}</span>
        {value}
      </p>
    </div>
  );
}

export default function BabiesPage() {
  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const selectedBabyId = useBabyStore((state) => state.selectedBabyId);
  const setSelectedBabyId = useBabyStore((state) => state.setSelectedBabyId);
  const updateBabyProfile = useBabyStore((state) => state.updateBabyProfile);

  const selectedBaby = useMemo(
    () => getBabyById(selectedBabyId, babyProfiles),
    [babyProfiles, selectedBabyId],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showAdvancedMedical, setShowAdvancedMedical] = useState(false);
  const [draft, setDraft] = useState<Baby>(() => selectedBaby);

  const profile = isEditing ? draft : selectedBaby;
  const age = useMemo(
    () => calculateAge(profile.birthDate),
    [profile.birthDate],
  );

  useEffect(() => {
    let isMounted = true;

    babyIds.forEach((babyId) => {
      void loadAvatarFromDatabase(babyId).then((avatarUrl) => {
        if (!isMounted || !avatarUrl) return;

        updateBabyProfile(babyId, { avatarUrl });

        if (babyId === selectedBabyId) {
          setDraft((current) =>
            current.id === babyId
              ? {
                  ...current,
                  avatarUrl,
                }
              : current,
          );
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [selectedBabyId, updateBabyProfile]);

  function updateDraft<K extends keyof Baby>(key: K, value: Baby[K]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSelectBaby(babyId: BabyId) {
    const nextBaby = getBabyById(babyId, babyProfiles);

    setSelectedBabyId(babyId);
    setDraft(nextBaby);
    setIsEditing(false);
    setShowAdvancedMedical(false);
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !file.type.startsWith("image/")) return;

    try {
      const rawAvatarUrl = await readFileAsDataUrl(file);

      setDraft((current) => ({
        ...current,
        avatarUrl: rawAvatarUrl,
      }));
      updateBabyProfile(draft.id, { avatarUrl: rawAvatarUrl });

      const compressedAvatarUrl = await compressImageDataUrl(rawAvatarUrl);

      await saveAvatarToDatabase(draft.id, compressedAvatarUrl);

      setDraft((current) => ({
        ...current,
        avatarUrl: compressedAvatarUrl,
      }));
      updateBabyProfile(draft.id, { avatarUrl: compressedAvatarUrl });
    } catch {
      // Giữ avatar hiện tại nếu ảnh upload lỗi.
    }
  }
  function handleSave() {
    updateBabyProfile(draft.id, draft);
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(selectedBaby);
    setIsEditing(false);
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl space-y-5 pb-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
              Baby Profile Pro
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Hồ sơ từng bé
            </h1>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
              Cá nhân hóa hồ sơ, thói quen và dữ liệu chăm sóc riêng cho từng
              bé.
            </p>
          </div>

          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-2xl bg-pink-500 px-4 py-3 text-sm font-black text-white shadow-sm shadow-pink-200"
            >
              Lưu
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(selectedBaby);
                setIsEditing(true);
              }}
              className="rounded-2xl bg-pink-500 px-4 py-3 text-sm font-black text-white shadow-sm shadow-pink-200"
            >
              Sửa
            </button>
          )}
        </header>

        <div className="sticky top-3 z-10 rounded-[1.75rem] bg-white/90 p-2 shadow-sm ring-1 ring-pink-100 backdrop-blur">
          <div className="grid grid-cols-2 gap-2">
            {babyIds.map((babyId) => {
              const baby = getBabyById(babyId, babyProfiles);
              const active = selectedBabyId === babyId;

              return (
                <button
                  key={baby.id}
                  type="button"
                  onClick={() => handleSelectBaby(baby.id)}
                  className={[
                    "rounded-2xl px-4 py-3 text-sm font-black transition",
                    active
                      ? "bg-pink-500 text-white shadow-sm shadow-pink-200"
                      : "bg-pink-50/50 text-slate-500 hover:bg-pink-50",
                  ].join(" ")}
                >
                  <span className="mr-2 inline-flex align-middle">
                    <AvatarPreview
                      src={baby.avatarUrl}
                      emoji={baby.avatarEmoji}
                      name={baby.nickname || baby.name}
                      size="small"
                    />
                  </span>
                  {baby.nickname || baby.name}
                </button>
              );
            })}
          </div>
        </div>

        <section className="overflow-hidden rounded-4xl bg-linear-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm ring-1 ring-pink-100">
          <div className="flex items-start gap-4">
            <label
              htmlFor="baby-avatar-upload"
              className={[
                "relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-4xl bg-white text-5xl shadow-sm ring-1 ring-pink-100",
                isEditing ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              <AvatarPreview
                src={profile.avatarUrl}
                emoji={profile.avatarEmoji}
                name={profile.nickname || profile.name}
              />

              {isEditing ? (
                <span className="absolute inset-x-0 bottom-0 bg-pink-500/90 py-1 text-center text-[10px] font-black text-white">
                  Đổi ảnh
                </span>
              ) : null}
            </label>

            <input
              id="baby-avatar-upload"
              type="file"
              accept="image/*"
              disabled={!isEditing}
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-3xl font-black tracking-tight text-slate-950">
                {profile.nickname || profile.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {profile.name}
              </p>

              {isEditing && profile.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    updateDraft("avatarUrl", "");
                    updateBabyProfile(draft.id, { avatarUrl: "" });
                    void deleteAvatarFromDatabase(draft.id);
                  }}
                  className="mt-3 rounded-2xl bg-white px-4 py-2 text-xs font-black text-pink-500 shadow-sm ring-1 ring-pink-100"
                >
                  Xóa avatar
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoPill
              icon="🎂"
              label="Ngày sinh"
              value={formatBirthDate(profile.birthDate)}
            />
            <InfoPill icon="💗" label="Tuổi hiện tại" value={age} />
          </div>
        </section>

        <section className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
                Quick Stats
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">
                Tổng quan hôm nay
              </h3>
            </div>
            <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-500">
              Demo
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <StatCard icon="🍼" label="Sữa" value="-- ml" />
            <StatCard icon="😴" label="Ngủ" value="-- h" />
            <StatCard icon="🍽️" label="Ăn" value="--" />
            <StatCard icon="🧷" label="Tã" value="--" />
          </div>
        </section>

        <SectionCard
          title="Thông tin cơ bản"
          subtitle="Tên thật, biệt danh và ngày sinh dùng để cá nhân hóa AI Coach."
        >
          <Field
            label="Tên thật"
            value={profile.name}
            disabled={!isEditing}
            onChange={(value) => updateDraft("name", value)}
          />
          <Field
            label="Biệt danh"
            value={profile.nickname}
            disabled={!isEditing}
            onChange={(value) => updateDraft("nickname", value)}
          />
          <Field
            label="Ngày sinh"
            type="date"
            value={profile.birthDate}
            disabled={!isEditing}
            onChange={(value) => updateDraft("birthDate", value)}
          />
        </SectionCard>

        <SectionCard
          title="Sức khỏe"
          subtitle="Chỉ giữ các thông tin thật sự cần dùng hằng ngày."
        >
          <TextAreaField
            label="Dị ứng"
            value={profile.allergies}
            disabled={!isEditing}
            rows={2}
            onChange={(value) => updateDraft("allergies", value)}
          />
          <TextAreaField
            label="Ghi chú y tế"
            value={profile.medicalNotes}
            disabled={!isEditing}
            rows={2}
            onChange={(value) => updateDraft("medicalNotes", value)}
          />

          <button
            type="button"
            onClick={() => setShowAdvancedMedical((current) => !current)}
            className="rounded-2xl bg-pink-50 px-4 py-3 text-left text-sm font-black text-pink-500"
          >
            {showAdvancedMedical
              ? "Ẩn thông tin y tế mở rộng"
              : "Thông tin y tế mở rộng"}
          </button>

          {showAdvancedMedical ? (
            <div className="grid gap-4 rounded-3xl bg-pink-50/40 p-4 ring-1 ring-pink-100">
              <Field
                label="Bác sĩ"
                value={profile.doctor}
                disabled={!isEditing}
                onChange={(value) => updateDraft("doctor", value)}
              />
              <Field
                label="Bệnh viện"
                value={profile.hospital}
                disabled={!isEditing}
                onChange={(value) => updateDraft("hospital", value)}
              />
              <Field
                label="Bảo hiểm"
                value={profile.insurance}
                disabled={!isEditing}
                onChange={(value) => updateDraft("insurance", value)}
              />
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Tính cách & thói quen"
          subtitle="Dữ liệu này giúp app hiểu mỗi bé khác nhau như thế nào."
        >
          <TextAreaField
            label="Thích"
            value={profile.likes}
            disabled={!isEditing}
            rows={2}
            onChange={(value) => updateDraft("likes", value)}
          />
          <TextAreaField
            label="Không thích"
            value={profile.dislikes}
            disabled={!isEditing}
            rows={2}
            onChange={(value) => updateDraft("dislikes", value)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <TextAreaField
              label="Thói quen ngủ"
              value={profile.sleepHabits}
              disabled={!isEditing}
              rows={2}
              onChange={(value) => updateDraft("sleepHabits", value)}
            />
            <TextAreaField
              label="Thói quen ăn"
              value={profile.eatingHabits}
              disabled={!isEditing}
              rows={2}
              onChange={(value) => updateDraft("eatingHabits", value)}
            />
          </div>
          <TextAreaField
            label="Ghi chú chăm sóc"
            value={profile.careNotes}
            disabled={!isEditing}
            rows={2}
            onChange={(value) => updateDraft("careNotes", value)}
          />
        </SectionCard>

        {isEditing ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-2xl bg-white px-4 py-4 text-sm font-black text-slate-500 shadow-sm ring-1 ring-pink-100"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-2xl bg-pink-500 px-4 py-4 text-sm font-black text-white shadow-sm shadow-pink-200"
            >
              Lưu thay đổi
            </button>
          </div>
        ) : null}
      </main>
    </AppShell>
  );
}

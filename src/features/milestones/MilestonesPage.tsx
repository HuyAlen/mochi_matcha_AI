"use client";

import { useMemo, useState } from "react";
import {
  buildMilestoneTimeline,
  generateMilestoneAIInsight,
  getMilestoneSummary,
} from "@/services/milestone/milestoneAnalyzer";
import {
  getMilestoneRecords,
  resetMilestoneRecord,
  updateMilestoneRecord,
} from "@/store/milestoneStore";
import type {
  MilestoneAssessment,
  MilestoneCategory,
  MilestoneRecord,
  MilestoneStatus,
} from "@/types/milestone";

const demoBabies = [
  {
    id: "baby-a",
    name: "Bé A",
    birthDate: "2026-01-01",
  },
  {
    id: "baby-b",
    name: "Bé B",
    birthDate: "2026-01-01",
  },
];

const categoryLabel: Record<MilestoneCategory, string> = {
  motor: "Vận động",
  language: "Ngôn ngữ",
  social: "Xã hội",
  cognitive: "Nhận thức",
};

const statusLabel: Record<MilestoneStatus, string> = {
  not_started: "Chưa ghi nhận",
  observed: "Đã quan sát",
  achieved: "Đã đạt",
};

const assessmentLabel: Record<MilestoneAssessment, string> = {
  early: "Sớm",
  on_track: "Đúng tiến độ",
  watch: "Theo dõi thêm",
  delayed: "Có thể trễ",
};

const assessmentClass: Record<MilestoneAssessment, string> = {
  early: "border-emerald-200 bg-emerald-50 text-emerald-700",
  on_track: "border-sky-200 bg-sky-50 text-sky-700",
  watch: "border-amber-200 bg-amber-50 text-amber-700",
  delayed: "border-rose-200 bg-rose-50 text-rose-700",
};

function formatDate(value?: string) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function MilestonesPage() {
  const [selectedBabyId, setSelectedBabyId] = useState(demoBabies[0].id);
  const [records, setRecords] = useState<MilestoneRecord[]>(() =>
    getMilestoneRecords(),
  );

  const selectedBaby =
    demoBabies.find((baby) => baby.id === selectedBabyId) ?? demoBabies[0];

  const timeline = useMemo(() => {
    return buildMilestoneTimeline({
      babyId: selectedBaby.id,
      birthDate: selectedBaby.birthDate,
      records,
    });
  }, [selectedBaby, records]);

  const summary = useMemo(() => getMilestoneSummary(timeline), [timeline]);

  const aiInsight = useMemo(
    () => generateMilestoneAIInsight(timeline),
    [timeline],
  );

  function handleUpdate(milestoneId: string, status: MilestoneStatus) {
    setRecords(
      updateMilestoneRecord({
        babyId: selectedBaby.id,
        milestoneId,
        status,
      }),
    );
  }

  function handleReset(milestoneId: string) {
    setRecords(
      resetMilestoneRecord({
        babyId: selectedBaby.id,
        milestoneId,
      }),
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-violet-600">
            Sprint 7 · Milestone AI
          </p>

          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Theo dõi mốc phát triển
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Ghi nhận các mốc như lẫy, bò, ngồi, đứng, đi, nói và để AI đánh
                giá tiến độ phát triển của từng bé.
              </p>
            </div>

            <div className="flex rounded-2xl bg-slate-100 p-1">
              {demoBabies.map((baby) => (
                <button
                  key={baby.id}
                  type="button"
                  onClick={() => setSelectedBabyId(baby.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    selectedBabyId === baby.id
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {baby.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Tổng mốc</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {summary.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Đã đạt</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {summary.achieved}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Theo dõi thêm</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {summary.watch}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Có thể trễ</p>
            <p className="mt-2 text-2xl font-bold text-rose-600">
              {summary.delayed}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-violet-700">
            AI Milestone Insight
          </p>
          <h2 className="mt-2 text-lg font-bold text-slate-900">
            {aiInsight.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {aiInsight.message}
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Lưu ý: Đây là phân tích hỗ trợ, không thay thế tư vấn y khoa.
          </p>
        </section>

        <section className="grid gap-4">
          {timeline.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      {categoryLabel[item.category]}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        assessmentClass[item.assessment]
                      }`}
                    >
                      {assessmentLabel[item.assessment]}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Kỳ vọng: {item.expectedFromMonth}–{item.expectedToMonth}{" "}
                    tháng tuổi
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Gợi ý cho ba mẹ
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.parentTip}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                      Trạng thái:{" "}
                      <span className="font-semibold text-slate-900">
                        {statusLabel[item.status]}
                      </span>
                    </p>
                    <p>
                      Ngày ghi nhận:{" "}
                      <span className="font-semibold text-slate-900">
                        {formatDate(item.record?.observedDate)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 md:w-44">
                  <button
                    type="button"
                    onClick={() => handleUpdate(item.id, "observed")}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                  >
                    Đã quan sát
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdate(item.id, "achieved")}
                    className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    Đã đạt
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReset(item.id)}
                    className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

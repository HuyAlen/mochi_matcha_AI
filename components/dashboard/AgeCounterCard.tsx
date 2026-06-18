import { babies } from "@/src/store/babyStore";

function getAgeParts(birthDate?: string) {
  if (!birthDate) {
    return {
      title: "Chưa cập nhật ngày sinh",
      subtitle: "Vào hồ sơ bé để thêm ngày sinh.",
    };
  }

  const birth = new Date(birthDate);
  const now = new Date();

  if (Number.isNaN(birth.getTime())) {
    return {
      title: "Chưa cập nhật ngày sinh",
      subtitle: "Vào hồ sơ bé để thêm ngày sinh.",
    };
  }

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth();

  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 12) {
    return {
      title: `${Math.max(months, 0)} tháng ${Math.max(days, 0)} ngày`,
      subtitle: "Giai đoạn xây dựng thói quen ăn, ngủ và vận động.",
    };
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return {
    title:
      remainingMonths > 0
        ? `${years} tuổi ${remainingMonths} tháng`
        : `${years} tuổi`,
    subtitle: "Theo dõi cột mốc phát triển và lịch chăm sóc định kỳ.",
  };
}

export default function AgeCounterCard() {
  const age = getAgeParts(babies[0]?.birthDate);

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Tuổi hiện tại
          </p>
          <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
            {age.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {age.subtitle}
          </p>
        </div>

        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-2xl ring-1 ring-slate-100">
          🎂
        </div>
      </div>
    </section>
  );
}

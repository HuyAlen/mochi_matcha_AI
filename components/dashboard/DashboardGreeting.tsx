import { babies } from "@/src/store/babyStore";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 11) {
    return {
      label: "Chào buổi sáng",
      icon: "☀️",
      message: "Mẹ cùng bắt đầu một ngày chăm sóc nhẹ nhàng nhé.",
    };
  }

  if (hour < 18) {
    return {
      label: "Chào buổi chiều",
      icon: "🌤️",
      message: "Mẹ nhớ cập nhật các cữ chăm sóc trong ngày nhé.",
    };
  }

  return {
    label: "Chào buổi tối",
    icon: "🌙",
    message: "Cùng xem lại nhịp sinh hoạt hôm nay của hai bé.",
  };
}

function getAgeLabel(birthDate?: string) {
  if (!birthDate) return "Chưa cập nhật tuổi";

  const birth = new Date(birthDate);
  const now = new Date();

  if (Number.isNaN(birth.getTime())) return "Chưa cập nhật tuổi";

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

  if (months <= 0) return `${Math.max(days, 0)} ngày`;
  if (months < 12) return `${months} tháng ${Math.max(days, 0)} ngày`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) return `${years} tuổi`;

  return `${years} tuổi ${remainingMonths} tháng`;
}

export default function DashboardGreeting() {
  const greeting = getGreeting();
  const ageLabel = getAgeLabel(babies[0]?.birthDate);

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-400">
          {greeting.icon} {greeting.label}
        </p>

        <h2 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950">
          Hôm nay của hai bé
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {greeting.message}
        </p>
      </div>
    </section>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 11) {
    return {
      label: "Chào buổi sáng",
      icon: "☀️",
      message: "Bắt đầu ngày mới nhẹ nhàng cùng Mochi và Matcha.",
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

export default function DashboardGreeting() {
  const greeting = getGreeting();

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-pink-100 bg-white px-5 py-6 shadow-[0_18px_45px_rgba(244,114,182,0.10)]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-pink-100/60 blur-2xl" />
      <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-full bg-violet-100/60 blur-2xl" />

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
          {greeting.icon} {greeting.label}
        </p>

        <h2 className="mt-2 max-w-[300px] text-[1.7rem] font-black leading-[1.12] tracking-tight text-slate-950">
          Hôm nay của hai bé
        </h2>

        <p className="mt-4 max-w-[310px] text-sm font-semibold leading-6 text-slate-500">
          {greeting.message}
        </p>
      </div>
    </section>
  );
}

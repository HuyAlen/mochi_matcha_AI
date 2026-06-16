import Link from "next/link";

const actions = [
  { href: "/tracking", icon: "🍼", label: "+ Sữa" },
  { href: "/tracking", icon: "🌙", label: "+ Ngủ" },
  { href: "/nutrition", icon: "🥣", label: "+ Ăn dặm" },
  { href: "/tracking", icon: "🧷", label: "+ Tã" },
];

export default function QuickActionsCard() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="font-black text-slate-950">Thao tác nhanh</h3>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="rounded-2xl bg-pink-50 px-2 py-3 text-center transition hover:bg-pink-100"
          >
            <div className="text-2xl">{action.icon}</div>
            <p className="mt-2 text-xs font-black text-pink-600">
              {action.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

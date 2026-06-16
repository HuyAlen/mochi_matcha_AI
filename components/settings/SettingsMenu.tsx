import Link from "next/link";

const menuItems = [
  { href: "/babies", icon: "👶", label: "Thông tin bé" },
  { href: "/growth", icon: "📈", label: "Growth" },
  { href: "/vaccines", icon: "💉", label: "Vaccines" },
  { href: "/reminders", icon: "🔔", label: "Reminders" },
  { href: "/timeline", icon: "📖", label: "Memory Book" },
  { href: "/family", icon: "👨‍👩‍👧‍👧", label: "Gia đình" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export default function SettingsMenu() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
      {menuItems.map((item, index) => (
        <Link
          key={`${item.href}-${item.label}`}
          href={item.href}
          className={`flex items-center justify-between px-4 py-4 transition hover:bg-pink-50 ${
            index !== menuItems.length - 1 ? "border-b border-slate-100" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-slate-50 text-lg">
              {item.icon}
            </span>
            <span className="text-sm font-bold text-slate-700">
              {item.label}
            </span>
          </div>

          <span className="text-slate-300">›</span>
        </Link>
      ))}
    </div>
  );
}

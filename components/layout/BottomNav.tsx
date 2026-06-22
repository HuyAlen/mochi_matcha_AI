"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Home, LayoutGrid, NotebookPen, Plus } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  activeGroup?: string[];
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Home,
    activeGroup: ["/"],
  },
  {
    href: "/tracking",
    label: "Track",
    icon: NotebookPen,
  },
  {
    href: "/ai-coach",
    label: "Coach",
    icon: Bot,
  },
  {
    href: "/settings",
    label: "More",
    icon: LayoutGrid,
    activeGroup: [
      "/settings",
      "/growth",
      "/vaccines",
      "/reminders",
      "/timeline",
      "/family",
      "/babies",
      "/nutrition",
    ],
  },
];

function isActivePath(pathname: string, item: NavItem) {
  if (item.href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }

  if (item.activeGroup?.length) {
    return item.activeGroup.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();

  function handleQuickAdd() {
    window.dispatchEvent(new CustomEvent("mind-ai:open-quick-add"));
  }

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto w-full max-w-[430px] px-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="pointer-events-auto rounded-[2rem] border border-pink-100 bg-white/95 px-3 py-3 shadow-[0_-10px_34px_rgba(236,72,153,0.14)] backdrop-blur-xl">
          <div className="grid grid-cols-5 items-center gap-1">
            {navItems.slice(0, 2).map((item) => {
              const active = isActivePath(pathname, item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-[58px] flex-col items-center justify-center rounded-2xl text-[11px] font-black transition active:scale-95",
                    active
                      ? "bg-pink-50 text-pink-600 shadow-[inset_0_0_0_1px_rgba(244,114,182,0.16)]"
                      : "text-slate-500 hover:bg-pink-50/70 hover:text-pink-500",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={22} strokeWidth={active ? 3 : 2.5} />
                  <span className="mt-1 leading-none">{item.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleQuickAdd}
              className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-[1.45rem] bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 text-white shadow-[0_12px_30px_rgba(236,72,153,0.35)] ring-4 ring-white transition active:scale-95"
              aria-label="Quick add"
            >
              <Plus size={29} strokeWidth={3} />
            </button>

            {navItems.slice(2).map((item) => {
              const active = isActivePath(pathname, item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex h-[58px] flex-col items-center justify-center rounded-2xl text-[11px] font-black transition active:scale-95",
                    active
                      ? "bg-pink-50 text-pink-600 shadow-[inset_0_0_0_1px_rgba(244,114,182,0.16)]"
                      : "text-slate-500 hover:bg-pink-50/70 hover:text-pink-500",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={22} strokeWidth={active ? 3 : 2.5} />
                  <span className="mt-1 leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

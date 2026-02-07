"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const navItems = [
  { href: "/", icon: "dashboard", label: "Home" },
  { href: "/rota", icon: "calendar_month", label: "Rota" },
  { href: "/alerts", icon: "notifications", label: "Alerts" },
  { href: "/profile", icon: "account_circle", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const unreadCount = useAppStore((s) => s.unreadCount);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const showBadge = item.href === "/alerts" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors relative",
                isActive
                  ? "text-swiis-orange"
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              <span className="material-symbols-outlined text-[24px]">
                {item.icon}
              </span>
              {showBadge && (
                <span className="absolute top-0 right-1 w-4 h-4 bg-swiis-red text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

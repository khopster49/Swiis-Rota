"use client";

import Link from "next/link";
import { useAppStore } from "@/stores/app-store";

export function Header() {
  const { toggleTheme, theme, unreadCount } = useAppStore();

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800">
      <div className="px-4 py-3 flex justify-between items-center max-w-md mx-auto">
        <Link href="/" className="flex items-center">
          <div className="flex flex-col">
            <span className="text-swiis-orange font-black text-2xl tracking-tighter leading-none italic">
              swiis
            </span>
            <span className="text-swiis-blue text-[10px] font-semibold leading-none uppercase tracking-widest">
              Foster Care
            </span>
          </div>
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-xl">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
          <Link
            href="/alerts"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-swiis-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { useAppStore } from "@/stores/app-store";

export default function ProfilePage() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <PageContainer className="p-4 space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
        <Avatar name="Sarah Jenkins" size="lg" className="mx-auto mb-3" />
        <h2 className="text-xl font-bold">Sarah Jenkins</h2>
        <p className="text-sm text-slate-500">Team Lead</p>
        <p className="text-xs text-slate-400 mt-1">sarah.jenkins@swiis.com</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          Settings
        </h3>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <button
            onClick={toggleTheme}
            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                theme === "dark" ? "bg-swiis-orange" : "bg-slate-200"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  theme === "dark" ? "translate-x-4" : ""
                }`}
              />
            </div>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <button className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">notifications</span>
              <span className="text-sm font-medium">Notification Preferences</span>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <button className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">help</span>
              <span className="text-sm font-medium">Help & Support</span>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </button>
        </div>
      </div>

      <button className="w-full py-3 text-sm font-bold text-swiis-red border border-swiis-red/20 rounded-xl hover:bg-swiis-red-light transition-colors">
        Sign Out
      </button>
    </PageContainer>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  calendarStartMonth: Date;
  setCalendarStartMonth: (date: Date) => void;
  navigateCalendarForward: () => void;
  navigateCalendarBackward: () => void;

  staffFilter: string | null;
  shiftTypeFilter: string | null;
  setStaffFilter: (id: string | null) => void;
  setShiftTypeFilter: (type: string | null) => void;

  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

function getThreeMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next === "dark");
          }
          return { theme: next };
        }),

      calendarStartMonth: getThreeMonthStart(),
      setCalendarStartMonth: (date) => set({ calendarStartMonth: date }),
      navigateCalendarForward: () =>
        set((state) => ({
          calendarStartMonth: new Date(
            state.calendarStartMonth.getFullYear(),
            state.calendarStartMonth.getMonth() + 3,
            1
          ),
        })),
      navigateCalendarBackward: () =>
        set((state) => ({
          calendarStartMonth: new Date(
            state.calendarStartMonth.getFullYear(),
            state.calendarStartMonth.getMonth() - 3,
            1
          ),
        })),

      staffFilter: null,
      shiftTypeFilter: null,
      setStaffFilter: (id) => set({ staffFilter: id }),
      setShiftTypeFilter: (type) => set({ shiftTypeFilter: type }),

      unreadCount: 0,
      setUnreadCount: (count) => set({ unreadCount: count }),
    }),
    {
      name: "swiis-rota-store",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

"use client";

import { useState, useCallback, useEffect } from "react";
import { addMonths, isSameMonth, format } from "date-fns";
import { MonthCalendar } from "./month-calendar";
import { DayDetail } from "./day-detail";
import useSWR from "swr";

interface ShiftData {
  id: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  assignment?: {
    primaryStaff: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
      phone?: string | null;
    };
    secondaryStaff: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
      phone?: string | null;
    };
  } | null;
}

interface ThreeMonthViewProps {
  initialStartMonth: Date;
  staffFilter: string | null;
  shiftTypeFilter: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => d.data);

function getMonthLabel(month: Date, now: Date): string | undefined {
  if (isSameMonth(month, now)) return "CURRENT";
  return undefined;
}

export function ThreeMonthView({
  initialStartMonth,
  staffFilter,
  shiftTypeFilter,
}: ThreeMonthViewProps) {
  const [startMonth, setStartMonth] = useState(initialStartMonth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const now = new Date();

  const months = [
    startMonth,
    addMonths(startMonth, 1),
    addMonths(startMonth, 2),
  ];

  // Compute the full date range for the 3-month span
  const from = new Date(months[0].getFullYear(), months[0].getMonth(), 1);
  const to = new Date(months[2].getFullYear(), months[2].getMonth() + 1, 0, 23, 59, 59);

  const { data: shifts = [], isLoading } = useSWR<ShiftData[]>(
    `/api/shifts?from=${from.toISOString()}&to=${to.toISOString()}`,
    fetcher
  );

  // Apply client-side filters
  const filteredShifts = shifts.filter((s) => {
    if (shiftTypeFilter && s.type !== shiftTypeFilter) return false;
    if (staffFilter && s.assignment) {
      const matchesPrimary = s.assignment.primaryStaff.id === staffFilter;
      const matchesSecondary = s.assignment.secondaryStaff.id === staffFilter;
      if (!matchesPrimary && !matchesSecondary) return false;
    }
    if (staffFilter && !s.assignment) return false;
    return true;
  });

  // Shifts for the selected day
  const selectedDayShifts = selectedDate
    ? filteredShifts.filter((s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);
        return start <= dayEnd && end >= dayStart;
      })
    : [];

  const navigateForward = useCallback(() => {
    setStartMonth((prev) => addMonths(prev, 3));
  }, []);

  const navigateBackward = useCallback(() => {
    setStartMonth((prev) => addMonths(prev, -3));
  }, []);

  const handleSelectDay = useCallback((date: Date) => {
    setSelectedDate((prev) =>
      prev && prev.toDateString() === date.toDateString() ? null : date
    );
  }, []);

  return (
    <div className="space-y-4">
      {/* Navigation controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={navigateBackward}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Previous 3 months"
        >
          <span className="material-symbols-outlined text-slate-500">chevron_left</span>
        </button>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {format(months[0], "MMM yyyy")} — {format(months[2], "MMM yyyy")}
        </span>
        <button
          onClick={navigateForward}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Next 3 months"
        >
          <span className="material-symbols-outlined text-slate-500">chevron_right</span>
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-100" />
          <span>Weekday (5pm-9am)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-orange-50 border border-orange-100" />
          <span>Weekend (Fri-Mon)</span>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-swiis-orange border-t-transparent rounded-full" />
        </div>
      )}

      {/* Three months */}
      {!isLoading && (
        <div className="space-y-8">
          {months.map((month) => (
            <MonthCalendar
              key={month.toISOString()}
              month={month}
              shifts={filteredShifts}
              isCurrent={isSameMonth(month, now)}
              label={getMonthLabel(month, now)}
              selectedDate={selectedDate}
              onSelectDay={handleSelectDay}
            />
          ))}
        </div>
      )}

      {/* Selected day detail panel */}
      {selectedDate && (
        <DayDetail
          date={selectedDate}
          shifts={selectedDayShifts}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

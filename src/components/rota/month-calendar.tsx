"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  format,
} from "date-fns";
import { ShiftCell } from "./shift-cell";
import { cn } from "@/lib/utils";

interface ShiftData {
  id: string;
  type: string;
  startTime: string | Date;
  endTime: string | Date;
  assignment?: {
    primaryStaff: { firstName: string; lastName: string };
    secondaryStaff: { firstName: string; lastName: string };
  } | null;
}

interface MonthCalendarProps {
  month: Date;
  shifts: ShiftData[];
  isCurrent: boolean;
  label?: string;
  selectedDate: Date | null;
  onSelectDay: (date: Date) => void;
}

const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

export function MonthCalendar({
  month,
  shifts,
  isCurrent,
  label,
  selectedDate,
  onSelectDay,
}: MonthCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Generate the calendar grid: start from Monday of the first week
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Build a map: date string -> shifts for that day
  const shiftsByDay = useMemo(() => {
    const map = new Map<string, ShiftData[]>();
    for (const day of days) {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayShifts = shifts.filter((s) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        // Shift overlaps with this day
        return start <= dayEnd && end >= dayStart;
      });

      map.set(day.toISOString().slice(0, 10), dayShifts);
    }
    return map;
  }, [days, shifts]);

  return (
    <section
      className={cn(
        "bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border",
        isCurrent
          ? "border-2 border-swiis-orange/20 shadow-md"
          : "border-slate-100 dark:border-slate-800"
      )}
    >
      {/* Month header */}
      <div className="bg-swiis-orange p-4 text-white flex justify-between items-center">
        <h2 className="text-lg font-bold">{format(month, "MMMM yyyy")}</h2>
        {label && (
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-1 rounded",
              isCurrent
                ? "bg-white text-swiis-orange"
                : "bg-white/20 text-white"
            )}
          >
            {label}
          </span>
        )}
      </div>

      {/* Day-of-week headers */}
      <div className="calendar-grid text-center py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        {DAY_HEADERS.map((day, i) => (
          <div
            key={i}
            className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid bg-slate-100 dark:bg-slate-800">
        {days.map((day) => {
          const dateKey = day.toISOString().slice(0, 10);
          const dayShifts = shiftsByDay.get(dateKey) ?? [];
          const isCurrentMonth = isSameMonth(day, month);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

          return (
            <ShiftCell
              key={dateKey}
              date={day}
              shifts={dayShifts}
              isCurrentMonth={isCurrentMonth}
              onSelectDay={onSelectDay}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    </section>
  );
}

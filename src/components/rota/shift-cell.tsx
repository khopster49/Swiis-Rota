"use client";

import { cn } from "@/lib/utils";
import {
  isToday,
  isWeekend,
  isSameDay,
} from "date-fns";

interface ShiftInfo {
  id: string;
  type: string;
  assignment?: {
    primaryStaff: { firstName: string; lastName: string };
    secondaryStaff: { firstName: string; lastName: string };
  } | null;
}

interface ShiftCellProps {
  date: Date;
  shifts: ShiftInfo[];
  isCurrentMonth: boolean;
  onSelectDay: (date: Date) => void;
  isSelected: boolean;
}

function abbreviateName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName.charAt(0)}.`;
}

export function ShiftCell({
  date,
  shifts,
  isCurrentMonth,
  onSelectDay,
  isSelected,
}: ShiftCellProps) {
  const today = isToday(date);
  const weekend = isWeekend(date);
  const hasShifts = shifts.length > 0;
  const dayNumber = date.getDate();

  const weekendShift = shifts.find((s) => s.type === "WEEKEND");
  const weekdayShift = shifts.find((s) => s.type === "WEEKDAY_OVERNIGHT");
  const displayShift = weekendShift || weekdayShift;

  return (
    <button
      onClick={() => onSelectDay(date)}
      className={cn(
        "min-h-[62px] p-1 flex flex-col text-left transition-all relative",
        // Background color based on shift type
        !isCurrentMonth && "opacity-30",
        isCurrentMonth && weekend && hasShifts && "bg-orange-50 dark:bg-orange-900/20",
        isCurrentMonth && !weekend && hasShifts && "bg-blue-50 dark:bg-slate-800/60",
        isCurrentMonth && !hasShifts && "bg-white dark:bg-slate-900",
        // Today highlight
        today && "ring-2 ring-swiis-blue ring-inset z-10 bg-white dark:bg-slate-900",
        // Selected
        isSelected && !today && "ring-2 ring-swiis-orange ring-inset z-10",
        // Border
        "border-b border-r border-slate-100 dark:border-slate-700/50"
      )}
    >
      {/* Date number */}
      <span
        className={cn(
          "text-[10px] font-bold leading-none",
          today && "text-swiis-blue",
          !today && weekend && isCurrentMonth && "text-swiis-orange",
          !today && !weekend && isCurrentMonth && "text-swiis-dark-blue dark:text-slate-300",
          !isCurrentMonth && "text-slate-300 dark:text-slate-600"
        )}
      >
        {dayNumber}
      </span>

      {/* Staff names */}
      {isCurrentMonth && displayShift?.assignment && (
        <div className="flex flex-col gap-0.5 mt-0.5 overflow-hidden flex-1">
          <span
            className={cn(
              "text-[7px] truncate leading-tight",
              weekend ? "font-semibold" : "font-normal"
            )}
          >
            {abbreviateName(
              displayShift.assignment.primaryStaff.firstName,
              displayShift.assignment.primaryStaff.lastName
            )}
          </span>
          <span
            className={cn(
              "text-[7px] truncate leading-tight",
              weekend ? "font-semibold" : "font-normal"
            )}
          >
            {abbreviateName(
              displayShift.assignment.secondaryStaff.firstName,
              displayShift.assignment.secondaryStaff.lastName
            )}
          </span>
        </div>
      )}

      {/* Today label */}
      {today && (
        <span className="text-[6px] font-black uppercase text-swiis-blue mt-auto">
          Today
        </span>
      )}
    </button>
  );
}

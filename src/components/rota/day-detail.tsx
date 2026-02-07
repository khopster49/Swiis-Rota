"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/constants";

interface ShiftData {
  id: string;
  type: string;
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

interface DayDetailProps {
  date: Date;
  shifts: ShiftData[];
  onClose: () => void;
}

export function DayDetail({ date, shifts, onClose }: DayDetailProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 sticky bottom-20 z-30">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">event_note</span>
          Shifts for {format(date, "EEE d MMMM")}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          aria-label="Close detail"
        >
          <span className="material-symbols-outlined text-sm text-slate-400">close</span>
        </button>
      </div>

      {/* Shift list */}
      <div className="p-4 space-y-3">
        {shifts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No shifts scheduled for this day
          </p>
        ) : (
          shifts.map((shift) => {
            const isWeekend = shift.type === "WEEKEND";
            const timeLabel = isWeekend
              ? "Fri 5pm — Mon 9am"
              : `${format(new Date(shift.startTime), "h:mma")} — ${format(new Date(shift.endTime), "h:mma")}`;

            return (
              <div key={shift.id} className="space-y-2">
                {/* Shift type label */}
                <div className="flex items-center justify-between">
                  <Badge variant={isWeekend ? "orange" : "blue"}>
                    {isWeekend ? "Weekend" : "Weekday Overnight"}
                  </Badge>
                  <span className={isWeekend ? "text-[10px] font-bold text-swiis-orange" : "text-[10px] font-bold text-swiis-blue"}>
                    {timeLabel}
                  </span>
                </div>

                {shift.assignment && (
                  <>
                    {/* Primary */}
                    <div className={isWeekend
                      ? "flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border-l-4 border-swiis-orange"
                      : "flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border-l-4 border-swiis-blue"
                    }>
                      <div className={isWeekend ? "bg-swiis-orange/10 p-2 rounded-full" : "bg-swiis-blue/10 p-2 rounded-full"}>
                        <span className={isWeekend ? "material-symbols-outlined text-swiis-orange" : "material-symbols-outlined text-swiis-blue"}>
                          person
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">
                          {shift.assignment.primaryStaff.firstName}{" "}
                          {shift.assignment.primaryStaff.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Primary — {ROLES[shift.assignment.primaryStaff.role as keyof typeof ROLES] ?? shift.assignment.primaryStaff.role}
                        </p>
                      </div>
                      {shift.assignment.primaryStaff.phone && (
                        <a
                          href={`tel:${shift.assignment.primaryStaff.phone}`}
                          className={isWeekend
                            ? "p-2 rounded-full hover:bg-swiis-orange/10 transition-colors"
                            : "p-2 rounded-full hover:bg-swiis-blue/10 transition-colors"
                          }
                          aria-label="Call primary staff"
                        >
                          <span className={isWeekend
                            ? "material-symbols-outlined text-lg text-swiis-orange"
                            : "material-symbols-outlined text-lg text-swiis-blue"
                          }>
                            call
                          </span>
                        </a>
                      )}
                    </div>

                    {/* Secondary */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border-l-4 border-swiis-green">
                      <div className="bg-swiis-green/10 p-2 rounded-full">
                        <span className="material-symbols-outlined text-swiis-green">
                          local_phone
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">
                          {shift.assignment.secondaryStaff.firstName}{" "}
                          {shift.assignment.secondaryStaff.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Secondary — {ROLES[shift.assignment.secondaryStaff.role as keyof typeof ROLES] ?? shift.assignment.secondaryStaff.role}
                        </p>
                      </div>
                      {shift.assignment.secondaryStaff.phone && (
                        <a
                          href={`tel:${shift.assignment.secondaryStaff.phone}`}
                          className="p-2 rounded-full hover:bg-swiis-green/10 transition-colors"
                          aria-label="Call secondary staff"
                        >
                          <span className="material-symbols-outlined text-lg text-swiis-green">
                            call
                          </span>
                        </a>
                      )}
                    </div>
                  </>
                )}

                {shift.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                    {shift.notes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

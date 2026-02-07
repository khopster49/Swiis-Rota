"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface StaffOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface ShiftFilterProps {
  staffFilter: string | null;
  shiftTypeFilter: string | null;
  onStaffFilterChange: (id: string | null) => void;
  onShiftTypeFilterChange: (type: string | null) => void;
}

const shiftTypes = [
  { value: null, label: "All Shifts" },
  { value: "WEEKDAY_OVERNIGHT", label: "Weekday" },
  { value: "WEEKEND", label: "Weekend" },
];

export function ShiftFilter({
  staffFilter,
  shiftTypeFilter,
  onStaffFilterChange,
  onShiftTypeFilterChange,
}: ShiftFilterProps) {
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((d) => setStaff(d.data ?? []));
  }, []);

  const activeFilters = (staffFilter ? 1 : 0) + (shiftTypeFilter ? 1 : 0);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-swiis-blue text-white py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm w-full",
          isOpen && "ring-2 ring-white/50"
        )}
      >
        <span className="material-symbols-outlined text-sm">filter_list</span>
        Filter
        {activeFilters > 0 && (
          <span className="bg-white text-swiis-blue text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {activeFilters}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 space-y-4">
          {/* Shift type filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Shift Type
            </label>
            <div className="flex gap-2">
              {shiftTypes.map((type) => (
                <button
                  key={type.label}
                  onClick={() => onShiftTypeFilterChange(type.value)}
                  className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-lg transition-colors",
                    shiftTypeFilter === type.value
                      ? "bg-swiis-blue text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Staff filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Staff Member
            </label>
            <select
              value={staffFilter ?? ""}
              onChange={(e) =>
                onStaffFilterChange(e.target.value || null)
              }
              className="w-full text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-3 py-2"
            >
              <option value="">All Staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Clear all */}
          {activeFilters > 0 && (
            <button
              onClick={() => {
                onStaffFilterChange(null);
                onShiftTypeFilterChange(null);
              }}
              className="text-xs text-swiis-red font-bold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

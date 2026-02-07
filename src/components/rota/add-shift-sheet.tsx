"use client";

import { useState, useEffect, FormEvent } from "react";
import { format, getDay } from "date-fns";

interface StaffOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface AddShiftSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onShiftCreated: () => void;
}

export function AddShiftSheet({ isOpen, onClose, onShiftCreated }: AddShiftSheetProps) {
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [date, setDate] = useState("");
  const [type, setType] = useState<"WEEKDAY_OVERNIGHT" | "WEEKEND">("WEEKDAY_OVERNIGHT");
  const [primaryStaffId, setPrimaryStaffId] = useState("");
  const [secondaryStaffId, setSecondaryStaffId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((d) => setStaff(d.data ?? []));
  }, []);

  // Auto-detect shift type from selected date
  useEffect(() => {
    if (date) {
      const dayOfWeek = getDay(new Date(date));
      // Friday (5) = Weekend shift
      setType(dayOfWeek === 5 ? "WEEKEND" : "WEEKDAY_OVERNIGHT");
    }
  }, [date]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date || !primaryStaffId || !secondaryStaffId) {
      setError("Please fill in all required fields");
      return;
    }

    if (primaryStaffId === secondaryStaffId) {
      setError("Primary and secondary staff must be different");
      return;
    }

    setIsSubmitting(true);

    const selectedDate = new Date(date);
    let startTime: Date, endTime: Date;

    if (type === "WEEKEND") {
      startTime = new Date(selectedDate);
      startTime.setHours(17, 0, 0, 0);
      endTime = new Date(selectedDate);
      endTime.setDate(endTime.getDate() + 3);
      endTime.setHours(9, 0, 0, 0);
    } else {
      startTime = new Date(selectedDate);
      startTime.setHours(17, 0, 0, 0);
      endTime = new Date(selectedDate);
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(9, 0, 0, 0);
    }

    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          type,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          primaryStaffId,
          secondaryStaffId,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to create shift");
      }

      // Reset form
      setDate("");
      setPrimaryStaffId("");
      setSecondaryStaffId("");
      setNotes("");
      onShiftCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[85dvh] overflow-y-auto">
        <div className="max-w-md mx-auto p-6 space-y-5">
          {/* Handle */}
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto" />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Add New Shift
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
              <span className="material-symbols-outlined text-slate-400">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm"
                required
              />
            </div>

            {/* Auto-detected type */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Shift Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("WEEKDAY_OVERNIGHT")}
                  className={`flex-1 text-xs font-bold px-3 py-2.5 rounded-lg transition-colors ${
                    type === "WEEKDAY_OVERNIGHT"
                      ? "bg-swiis-blue text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Weekday (5pm-9am)
                </button>
                <button
                  type="button"
                  onClick={() => setType("WEEKEND")}
                  className={`flex-1 text-xs font-bold px-3 py-2.5 rounded-lg transition-colors ${
                    type === "WEEKEND"
                      ? "bg-swiis-orange text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Weekend (Fri-Mon)
                </button>
              </div>
            </div>

            {/* Primary staff */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Primary On-Call *
              </label>
              <select
                value={primaryStaffId}
                onChange={(e) => setPrimaryStaffId(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm"
                required
              >
                <option value="">Select staff member</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Secondary staff */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Secondary On-Call *
              </label>
              <select
                value={secondaryStaffId}
                onChange={(e) => setSecondaryStaffId(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm"
                required
              >
                <option value="">Select staff member</option>
                {staff
                  .filter((s) => s.id !== primaryStaffId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes for this shift..."
                rows={2}
                className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 rounded-lg px-3 py-2.5 text-sm resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-swiis-red font-medium bg-swiis-red-light p-2 rounded">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-swiis-orange text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Create Shift
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { format } from "date-fns";

interface StaffOption {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface ShiftInfo {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  assignment?: {
    primaryStaffId: string;
    secondaryStaffId: string;
    primaryStaff: StaffOption;
    secondaryStaff: StaffOption;
  } | null;
}

interface SwapRequestFormProps {
  shift: ShiftInfo;
  currentUserId: string;
  availableStaff: StaffOption[];
  onSubmit: (data: { shiftId: string; requesterId: string; targetStaffId: string; reason?: string }) => Promise<void>;
  onCancel: () => void;
}

export function SwapRequestForm({
  shift,
  currentUserId,
  availableStaff,
  onSubmit,
  onCancel,
}: SwapRequestFormProps) {
  const [targetStaffId, setTargetStaffId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isWeekend = shift.type === "WEEKEND";

  // Filter out the current user and currently assigned staff from options
  const staffOptions = availableStaff.filter(
    (s) =>
      s.id !== currentUserId &&
      s.id !== shift.assignment?.primaryStaffId &&
      s.id !== shift.assignment?.secondaryStaffId
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetStaffId) return;

    setSubmitting(true);
    try {
      await onSubmit({
        shiftId: shift.id,
        requesterId: currentUserId,
        targetStaffId,
        reason: reason.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Shift info */}
      <div className={isWeekend
        ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3"
        : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3"
      }>
        <p className={isWeekend
          ? "text-[10px] font-bold text-swiis-orange uppercase tracking-widest"
          : "text-[10px] font-bold text-swiis-blue uppercase tracking-widest"
        }>
          {isWeekend ? "Weekend Shift" : "Weekday Overnight"}
        </p>
        <p className="text-sm font-bold mt-0.5">
          {format(new Date(shift.startTime), "EEE d MMM")} — {format(new Date(shift.endTime), "EEE d MMM")}
        </p>
        <p className="text-xs text-slate-500">
          {format(new Date(shift.startTime), "h:mma")} — {format(new Date(shift.endTime), "h:mma")}
        </p>
      </div>

      {/* Target staff picker */}
      <div>
        <label htmlFor="targetStaff" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Swap with
        </label>
        <select
          id="targetStaff"
          value={targetStaffId}
          onChange={(e) => setTargetStaffId(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm"
          required
        >
          <option value="">Select a team member...</option>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Reason */}
      <div>
        <label htmlFor="reason" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Reason (optional)
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why do you need to swap this shift?"
          rows={3}
          className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-transform"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!targetStaffId || submitting}
          className="flex-1 bg-swiis-blue text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {submitting ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              Request Swap
            </>
          )}
        </button>
      </div>
    </form>
  );
}

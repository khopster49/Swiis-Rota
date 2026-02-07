"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Avatar } from "@/components/ui/avatar";

interface StaffOption {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

interface ShiftInfo {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
}

interface HandoverFormProps {
  shift: ShiftInfo;
  fromUser: StaffOption;
  toUser: StaffOption;
  onSubmit: (data: {
    shiftId: string;
    fromUserId: string;
    toUserId: string;
    notes: string;
    openItems?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function HandoverForm({
  shift,
  fromUser,
  toUser,
  onSubmit,
  onCancel,
}: HandoverFormProps) {
  const [notes, setNotes] = useState("");
  const [openItems, setOpenItems] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isWeekend = shift.type === "WEEKEND";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        shiftId: shift.id,
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        notes: notes.trim(),
        openItems: openItems.trim() || undefined,
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
          {format(new Date(shift.startTime), "EEE d MMM yyyy")}
        </p>
      </div>

      {/* Handover direction */}
      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2 flex-1">
          <Avatar
            name={`${fromUser.firstName} ${fromUser.lastName}`}
            src={fromUser.avatarUrl ?? undefined}
            size="sm"
          />
          <div>
            <p className="text-sm font-bold">{fromUser.firstName}</p>
            <p className="text-[10px] text-slate-500">Handing over</p>
          </div>
        </div>

        <span className="material-symbols-outlined text-swiis-purple text-xl">arrow_forward</span>

        <div className="flex items-center gap-2 flex-1">
          <Avatar
            name={`${toUser.firstName} ${toUser.lastName}`}
            src={toUser.avatarUrl ?? undefined}
            size="sm"
          />
          <div>
            <p className="text-sm font-bold">{toUser.firstName}</p>
            <p className="text-[10px] text-slate-500">Receiving</p>
          </div>
        </div>
      </div>

      {/* Handover notes */}
      <div>
        <label htmlFor="notes" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Handover Notes *
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Key information for the incoming person: any ongoing situations, calls received, actions taken..."
          rows={4}
          className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm resize-none"
          required
        />
      </div>

      {/* Open items */}
      <div>
        <label htmlFor="openItems" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Open Items (optional)
        </label>
        <textarea
          id="openItems"
          value={openItems}
          onChange={(e) => setOpenItems(e.target.value)}
          placeholder="Outstanding tasks or follow-ups needed, one per line..."
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
          disabled={!notes.trim() || submitting}
          className="flex-1 bg-swiis-purple text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-purple-500/20 disabled:opacity-50"
        >
          {submitting ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <span className="material-symbols-outlined text-base">assignment_turned_in</span>
              Submit Handover
            </>
          )}
        </button>
      </div>
    </form>
  );
}

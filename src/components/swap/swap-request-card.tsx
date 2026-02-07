"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SWAP_STATUS } from "@/lib/constants";

interface SwapRequestCardProps {
  id: string;
  status: string;
  reason?: string | null;
  createdAt: string;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  targetStaff: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  shift: {
    type: string;
    startTime: string;
    endTime: string;
  };
  currentUserId: string;
  canReview: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function SwapRequestCard({
  id,
  status,
  reason,
  createdAt,
  requester,
  targetStaff,
  shift,
  currentUserId,
  canReview,
  onApprove,
  onReject,
  onCancel,
}: SwapRequestCardProps) {
  const statusLabel = SWAP_STATUS[status as keyof typeof SWAP_STATUS] ?? status;
  const isWeekend = shift.type === "WEEKEND";
  const isPending = status === "PENDING";

  const statusVariant =
    status === "APPROVED"
      ? "green"
      : status === "REJECTED"
      ? "red"
      : status === "CANCELLED"
      ? "default"
      : "orange";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-swiis-blue text-lg">swap_horiz</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Swap Request
          </span>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Shift info */}
        <p className={isWeekend
          ? "text-[10px] font-bold text-swiis-orange uppercase tracking-widest"
          : "text-[10px] font-bold text-swiis-blue uppercase tracking-widest"
        }>
          {format(new Date(shift.startTime), "EEE d MMM")} — {isWeekend ? "Weekend" : "Weekday Overnight"}
        </p>

        {/* Swap arrow */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar
              name={`${requester.firstName} ${requester.lastName}`}
              src={requester.avatarUrl ?? undefined}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{requester.firstName} {requester.lastName}</p>
              <p className="text-[10px] text-slate-500">Requester</p>
            </div>
          </div>

          <span className="material-symbols-outlined text-swiis-orange text-xl shrink-0">arrow_forward</span>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar
              name={`${targetStaff.firstName} ${targetStaff.lastName}`}
              src={targetStaff.avatarUrl ?? undefined}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{targetStaff.firstName} {targetStaff.lastName}</p>
              <p className="text-[10px] text-slate-500">Target</p>
            </div>
          </div>
        </div>

        {/* Reason */}
        {reason && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Reason</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">{reason}</p>
          </div>
        )}

        <p className="text-[10px] text-slate-400">
          Requested {format(new Date(createdAt), "d MMM yyyy 'at' h:mma")}
        </p>

        {/* Actions */}
        {isPending && canReview && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onApprove?.(id)}
              className="flex-1 bg-swiis-green text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">check</span>
              Approve
            </button>
            <button
              onClick={() => onReject?.(id)}
              className="flex-1 bg-swiis-red text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Reject
            </button>
          </div>
        )}

        {isPending && requester.id === currentUserId && (
          <button
            onClick={() => onCancel?.(id)}
            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-xl font-bold text-xs active:scale-95 transition-transform"
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
}

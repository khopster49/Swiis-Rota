"use client";

import { format } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface HandoverCardProps {
  id: string;
  notes: string;
  openItems?: string | null;
  completedAt?: string | null;
  createdAt: string;
  fromUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  toUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  currentUserId: string;
  onComplete?: (id: string) => void;
}

export function HandoverCard({
  id,
  notes,
  openItems,
  completedAt,
  createdAt,
  fromUser,
  toUser,
  currentUserId,
  onComplete,
}: HandoverCardProps) {
  const isCompleted = !!completedAt;
  const canAcknowledge = !isCompleted && toUser.id === currentUserId;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-swiis-purple text-lg">assignment_turned_in</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Handover
          </span>
        </div>
        <Badge variant={isCompleted ? "green" : "orange"}>
          {isCompleted ? "Acknowledged" : "Pending"}
        </Badge>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Direction */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar
              name={`${fromUser.firstName} ${fromUser.lastName}`}
              src={fromUser.avatarUrl ?? undefined}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{fromUser.firstName} {fromUser.lastName}</p>
              <p className="text-[10px] text-slate-500">From</p>
            </div>
          </div>

          <span className="material-symbols-outlined text-swiis-purple text-xl shrink-0">arrow_forward</span>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar
              name={`${toUser.firstName} ${toUser.lastName}`}
              src={toUser.avatarUrl ?? undefined}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{toUser.firstName} {toUser.lastName}</p>
              <p className="text-[10px] text-slate-500">To</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{notes}</p>
        </div>

        {/* Open items */}
        {openItems && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">warning</span>
              Open Items
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 whitespace-pre-wrap">{openItems}</p>
          </div>
        )}

        <p className="text-[10px] text-slate-400">
          {format(new Date(createdAt), "d MMM yyyy 'at' h:mma")}
          {completedAt && (
            <> — Acknowledged {format(new Date(completedAt), "d MMM 'at' h:mma")}</>
          )}
        </p>

        {/* Acknowledge button */}
        {canAcknowledge && (
          <button
            onClick={() => onComplete?.(id)}
            className="w-full bg-swiis-purple text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Acknowledge Handover
          </button>
        )}
      </div>
    </div>
  );
}

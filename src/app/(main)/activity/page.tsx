"use client";

import { useState } from "react";
import useSWR from "swr";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const actionIcons: Record<string, { icon: string; bgColor: string; textColor: string }> = {
  SWAP_APPROVED: { icon: "swap_calls", bgColor: "bg-swiis-green-light", textColor: "text-swiis-green" },
  SWAP_REJECTED: { icon: "swap_calls", bgColor: "bg-swiis-red-light", textColor: "text-swiis-red" },
  SWAP_REQUESTED: { icon: "swap_horiz", bgColor: "bg-swiis-blue-light", textColor: "text-swiis-blue" },
  SWAP_CANCELLED: { icon: "cancel", bgColor: "bg-slate-100 dark:bg-slate-700", textColor: "text-slate-500" },
  SHIFT_ASSIGNED: { icon: "event_available", bgColor: "bg-swiis-green-light", textColor: "text-swiis-green" },
  HANDOVER_CREATED: { icon: "assignment_turned_in", bgColor: "bg-swiis-purple-light", textColor: "text-swiis-purple" },
  HANDOVER_COMPLETED: { icon: "task_alt", bgColor: "bg-swiis-orange-light", textColor: "text-swiis-orange" },
};

const defaultIcon = { icon: "notifications_active", bgColor: "bg-swiis-orange-light", textColor: "text-swiis-orange" };

const PAGE_SIZE = 20;

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  metadata?: string | null;
  user: { firstName: string; lastName: string };
}

export default function ActivityPage() {
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isLoading } = useSWR<{ data: ActivityItem[]; total: number }>(
    `/api/activity?limit=${limit}&offset=0`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const activities = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasMore = activities.length < total;

  // Group activities by date
  const grouped = activities.reduce<Record<string, ActivityItem[]>>((acc, activity) => {
    const dateKey = format(new Date(activity.createdAt), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(activity);
    return acc;
  }, {});

  return (
    <PageContainer className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-lg text-slate-500">arrow_back</span>
        </Link>
        <h1 className="text-2xl font-bold text-swiis-dark-blue dark:text-white">
          Activity Feed
        </h1>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-swiis-orange border-t-transparent rounded-full" />
        </div>
      )}

      {!isLoading && activities.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <span className="material-symbols-outlined text-4xl mb-2 block">history</span>
          <p className="text-sm">No activity yet</p>
        </div>
      )}

      {!isLoading && activities.length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, items]) => {
            const dateObj = new Date(dateKey + "T00:00:00");
            const isToday = format(new Date(), "yyyy-MM-dd") === dateKey;
            const dateLabel = isToday
              ? "Today"
              : formatDistanceToNow(dateObj, { addSuffix: true }).includes("day")
              ? format(dateObj, "EEEE d MMMM")
              : formatDistanceToNow(dateObj, { addSuffix: true });

            return (
              <div key={dateKey}>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {dateLabel}
                </h3>
                <div className="space-y-2">
                  {items.map((activity) => {
                    const { icon, bgColor, textColor } =
                      actionIcons[activity.action] ?? defaultIcon;

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700"
                      >
                        <div className={`${bgColor} p-2 rounded ${textColor} shrink-0`}>
                          <span className="material-symbols-outlined text-base">{icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-medium text-slate-400">
                              {activity.user.firstName} {activity.user.lastName}
                            </span>
                            <span className="text-[9px] text-slate-300">·</span>
                            <span className="text-[9px] font-medium text-slate-400">
                              {format(new Date(activity.createdAt), "h:mma")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
              className="w-full py-3 text-center text-xs font-bold text-swiis-blue bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform"
            >
              Load more ({total - activities.length} remaining)
            </button>
          )}
        </div>
      )}
    </PageContainer>
  );
}

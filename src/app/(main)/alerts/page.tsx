"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const typeIcons: Record<string, { icon: string; bgColor: string; textColor: string }> = {
  SWAP_REQUEST: { icon: "swap_calls", bgColor: "bg-swiis-purple-light", textColor: "text-swiis-purple" },
  SHIFT_REMINDER: { icon: "schedule", bgColor: "bg-swiis-blue-light", textColor: "text-swiis-blue" },
  HANDOVER: { icon: "assignment_turned_in", bgColor: "bg-swiis-green-light", textColor: "text-swiis-green" },
  ESCALATION: { icon: "priority_high", bgColor: "bg-swiis-red-light", textColor: "text-swiis-red" },
  GENERAL: { icon: "notifications_active", bgColor: "bg-swiis-orange-light", textColor: "text-swiis-orange" },
};

const defaultTypeIcon = { icon: "notifications", bgColor: "bg-slate-100 dark:bg-slate-700", textColor: "text-slate-500" };

const PAGE_SIZE = 20;

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

export default function AlertsPage() {
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isLoading } = useSWR<{ data: NotificationItem[]; total: number }>(
    `/api/notifications?limit=${limit}&offset=0`,
    fetcher,
    { refreshInterval: 15000 }
  );

  const notifications = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasMore = notifications.length < total;
  const hasUnread = notifications.some((n) => !n.isRead);

  const refreshAll = useCallback(() => {
    mutate((key: unknown) => typeof key === "string" && key.startsWith("/api/notifications"));
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications/mark-read", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    refreshAll();
  }, [refreshAll]);

  const markOneRead = useCallback(
    async (notificationId: string) => {
      await fetch("/api/notifications/mark-read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      refreshAll();
    },
    [refreshAll]
  );

  return (
    <PageContainer className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-swiis-dark-blue dark:text-white">
          Alerts
        </h1>
        {hasUnread && (
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-swiis-blue active:scale-95 transition-transform"
          >
            Mark all read
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-swiis-orange border-t-transparent rounded-full" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <span className="material-symbols-outlined text-4xl mb-2 block">notifications_off</span>
          <p className="text-sm">No notifications yet</p>
        </div>
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const { icon, bgColor, textColor } =
              typeIcons[notification.type] ?? defaultTypeIcon;

            const card = (
              <div
                className={notification.isRead
                  ? "flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 opacity-70"
                  : "flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 border-l-4 border-l-swiis-orange"
                }
              >
                <div className={`${bgColor} p-2 rounded ${textColor} shrink-0`}>
                  <span className="material-symbols-outlined text-base">{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">{notification.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {notification.body}
                  </p>
                  <span className="text-[9px] font-medium text-slate-400 mt-1 block">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markOneRead(notification.id);
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                      aria-label="Mark as read"
                      title="Mark as read"
                    >
                      <span className="material-symbols-outlined text-sm text-swiis-blue">done</span>
                    </button>
                  )}
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-swiis-orange shrink-0" />
                  )}
                </div>
              </div>
            );

            if (notification.actionUrl) {
              return (
                <Link
                  key={notification.id}
                  href={notification.actionUrl}
                  onClick={() => {
                    if (!notification.isRead) markOneRead(notification.id);
                  }}
                  className="block"
                >
                  {card}
                </Link>
              );
            }

            return <div key={notification.id}>{card}</div>;
          })}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
              className="w-full py-3 text-center text-xs font-bold text-swiis-blue bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform"
            >
              Load more ({total - notifications.length} remaining)
            </button>
          )}
        </div>
      )}
    </PageContainer>
  );
}

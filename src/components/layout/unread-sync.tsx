"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { useAppStore } from "@/stores/app-store";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Invisible component that polls unread notification count
 * and syncs it into the Zustand store for the header badge.
 */
export function UnreadSync() {
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);

  const { data } = useSWR<{ data: { count: number } }>(
    "/api/notifications/unread-count",
    fetcher,
    { refreshInterval: 15000 }
  );

  useEffect(() => {
    if (data?.data?.count !== undefined) {
      setUnreadCount(data.data.count);
    }
  }, [data, setUnreadCount]);

  return null;
}

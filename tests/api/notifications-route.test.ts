import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the notification service module
vi.mock("@/services/notification-service", () => ({
  getNotificationsByUser: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
}));

import { GET } from "@/app/api/notifications/route";
import { PUT } from "@/app/api/notifications/mark-read/route";
import { GET as GET_UNREAD } from "@/app/api/notifications/unread-count/route";
import {
  getNotificationsByUser,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "@/services/notification-service";

const mockNotifications = [
  {
    id: "notif-1",
    title: "New Swap Request",
    body: "Sarah requested a swap",
    type: "SWAP_REQUEST",
    isRead: false,
    createdAt: new Date("2026-02-08T10:00:00Z"),
  },
  {
    id: "notif-2",
    title: "Shift Reminder",
    body: "Your shift starts tomorrow",
    type: "SHIFT_REMINDER",
    isRead: true,
    createdAt: new Date("2026-02-07T10:00:00Z"),
  },
];

describe("GET /api/notifications", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns notifications with default pagination", async () => {
    vi.mocked(getNotificationsByUser).mockResolvedValue({
      notifications: mockNotifications,
      total: 2,
    } as never);

    const request = new NextRequest("http://localhost/api/notifications");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(2);
    expect(body.total).toBe(2);
    expect(getNotificationsByUser).toHaveBeenCalledWith("demo-user-1", {
      limit: 20,
      offset: 0,
    });
  });

  it("respects custom limit and offset", async () => {
    vi.mocked(getNotificationsByUser).mockResolvedValue({
      notifications: [mockNotifications[0]],
      total: 2,
    } as never);

    const request = new NextRequest("http://localhost/api/notifications?limit=1&offset=0");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(1);
    expect(getNotificationsByUser).toHaveBeenCalledWith("demo-user-1", {
      limit: 1,
      offset: 0,
    });
  });
});

describe("PUT /api/notifications/mark-read", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marks a single notification as read", async () => {
    vi.mocked(markNotificationRead).mockResolvedValue({
      ...mockNotifications[0],
      isRead: true,
    } as never);

    const request = new NextRequest("http://localhost/api/notifications/mark-read", {
      method: "PUT",
      body: JSON.stringify({ notificationId: "notif-1" }),
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);
    expect(markNotificationRead).toHaveBeenCalledWith("notif-1");
  });

  it("marks all notifications as read", async () => {
    vi.mocked(markAllNotificationsRead).mockResolvedValue({ count: 5 } as never);

    const request = new NextRequest("http://localhost/api/notifications/mark-read", {
      method: "PUT",
      body: JSON.stringify({ all: true }),
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.marked).toBe(5);
    expect(markAllNotificationsRead).toHaveBeenCalledWith("demo-user-1");
  });

  it("returns 400 when no params provided", async () => {
    const request = new NextRequest("http://localhost/api/notifications/mark-read", {
      method: "PUT",
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("MISSING_FIELDS");
  });
});

describe("GET /api/notifications/unread-count", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns unread count", async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(3);

    const response = await GET_UNREAD();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.count).toBe(3);
    expect(getUnreadNotificationCount).toHaveBeenCalledWith("demo-user-1");
  });

  it("returns 0 when no unread notifications", async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0);

    const response = await GET_UNREAD();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.count).toBe(0);
  });
});

import { NextRequest, NextResponse } from "next/server";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/notification-service";

// Demo user - will be replaced by auth
const DEMO_USER_ID = "demo-user-1";

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { notificationId, all } = body;

  if (all) {
    const result = await markAllNotificationsRead(DEMO_USER_ID);
    return NextResponse.json({ data: { marked: result.count } });
  }

  if (notificationId) {
    const notification = await markNotificationRead(notificationId);
    return NextResponse.json({ data: notification });
  }

  return NextResponse.json(
    { error: { code: "MISSING_FIELDS", message: "Provide notificationId or all=true" } },
    { status: 400 }
  );
}

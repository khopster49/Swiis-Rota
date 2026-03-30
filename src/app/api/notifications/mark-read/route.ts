import { NextRequest, NextResponse } from "next/server";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/notification-service";
import { apiError } from "@/lib/api-utils";

// Demo user - will be replaced by Firebase Auth
const DEMO_USER_ID = "demo-user-1";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, all } = body;

    if (all) {
      const result = await markAllNotificationsRead(DEMO_USER_ID);
      return NextResponse.json({ data: { marked: result.count } });
    }

    if (notificationId && typeof notificationId === "string") {
      const notification = await markNotificationRead(notificationId);
      return NextResponse.json({ data: notification });
    }

    return NextResponse.json(
      { error: { code: "MISSING_FIELDS", message: "Provide notificationId or all=true" } },
      { status: 400 }
    );
  } catch (error) {
    return apiError(error);
  }
}

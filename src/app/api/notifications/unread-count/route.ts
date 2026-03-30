import { NextResponse } from "next/server";
import { getUnreadNotificationCount } from "@/services/notification-service";
import { apiError } from "@/lib/api-utils";

// Demo user - will be replaced by Firebase Auth
const DEMO_USER_ID = "demo-user-1";

export async function GET() {
  try {
    const count = await getUnreadNotificationCount(DEMO_USER_ID);
    return NextResponse.json({ data: { count } });
  } catch (error) {
    return apiError(error);
  }
}

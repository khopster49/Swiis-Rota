import { NextResponse } from "next/server";
import { getUnreadNotificationCount } from "@/services/notification-service";

// Demo user - will be replaced by auth
const DEMO_USER_ID = "demo-user-1";

export async function GET() {
  const count = await getUnreadNotificationCount(DEMO_USER_ID);
  return NextResponse.json({ data: { count } });
}

import { NextRequest, NextResponse } from "next/server";
import { getNotificationsByUser } from "@/services/notification-service";

// Demo user - will be replaced by auth
const DEMO_USER_ID = "demo-user-1";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const result = await getNotificationsByUser(DEMO_USER_ID, { limit, offset });
  return NextResponse.json({ data: result.notifications, total: result.total });
}

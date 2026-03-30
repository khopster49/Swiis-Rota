import { NextRequest, NextResponse } from "next/server";
import { getNotificationsByUser } from "@/services/notification-service";
import { apiError, clampPagination } from "@/lib/api-utils";

// Demo user - will be replaced by Firebase Auth
const DEMO_USER_ID = "demo-user-1";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10);
    const rawOffset = parseInt(searchParams.get("offset") ?? "0", 10);
    const { limit, offset } = clampPagination(rawLimit, rawOffset);

    const result = await getNotificationsByUser(DEMO_USER_ID, { limit, offset });
    return NextResponse.json({ data: result.notifications, total: result.total });
  } catch (error) {
    return apiError(error);
  }
}

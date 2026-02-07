import { NextRequest, NextResponse } from "next/server";
import { getRecentActivity, getPaginatedActivity } from "@/services/activity-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  // If pagination params provided, return paginated result
  if (limitParam || offsetParam) {
    const limit = parseInt(limitParam ?? "20", 10);
    const offset = parseInt(offsetParam ?? "0", 10);
    const result = await getPaginatedActivity({ limit, offset });
    return NextResponse.json({ data: result.activities, total: result.total });
  }

  // Default: recent activity for dashboard
  const activity = await getRecentActivity();
  return NextResponse.json({ data: activity });
}

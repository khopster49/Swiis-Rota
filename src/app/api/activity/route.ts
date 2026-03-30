import { NextRequest, NextResponse } from "next/server";
import { getRecentActivity, getPaginatedActivity } from "@/services/activity-service";
import { apiError, clampPagination } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    if (limitParam || offsetParam) {
      const rawLimit = parseInt(limitParam ?? "20", 10);
      const rawOffset = parseInt(offsetParam ?? "0", 10);
      const { limit, offset } = clampPagination(rawLimit, rawOffset);

      const result = await getPaginatedActivity({ limit, offset });
      return NextResponse.json({ data: result.activities, total: result.total });
    }

    const activity = await getRecentActivity();
    return NextResponse.json({ data: activity });
  } catch (error) {
    return apiError(error);
  }
}

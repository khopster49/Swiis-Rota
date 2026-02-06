import { NextResponse } from "next/server";
import { getRecentActivity } from "@/services/activity-service";

export async function GET() {
  const activity = await getRecentActivity();
  return NextResponse.json({ data: activity });
}

import { NextRequest, NextResponse } from "next/server";
import { completeHandover } from "@/services/handover-service";

interface RouteContext {
  params: Promise<{ handoverId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { handoverId } = await context.params;
  const body = await request.json();
  const { action, userId } = body;

  if (action === "COMPLETE" && userId) {
    const handover = await completeHandover(handoverId, userId);
    return NextResponse.json({ data: handover });
  }

  return NextResponse.json(
    { error: { code: "INVALID_ACTION", message: "action must be COMPLETE and userId is required" } },
    { status: 400 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { reviewSwapRequest, cancelSwapRequest } from "@/services/swap-service";

interface RouteContext {
  params: Promise<{ requestId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { requestId } = await context.params;
  const body = await request.json();
  const { action, reviewerId } = body;

  if (!action || !reviewerId) {
    return NextResponse.json(
      { error: { code: "MISSING_FIELDS", message: "action and reviewerId are required" } },
      { status: 400 }
    );
  }

  if (action === "APPROVE" || action === "REJECT") {
    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const swap = await reviewSwapRequest(requestId, status, reviewerId);
    return NextResponse.json({ data: swap });
  }

  if (action === "CANCEL") {
    const swap = await cancelSwapRequest(requestId, reviewerId);
    return NextResponse.json({ data: swap });
  }

  return NextResponse.json(
    { error: { code: "INVALID_ACTION", message: "action must be APPROVE, REJECT, or CANCEL" } },
    { status: 400 }
  );
}

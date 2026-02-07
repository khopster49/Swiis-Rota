import { NextRequest, NextResponse } from "next/server";
import {
  getPendingSwapRequests,
  getSwapRequestsByShift,
  getSwapRequestsByUser,
  createSwapRequest,
} from "@/services/swap-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shiftId = searchParams.get("shiftId");
  const userId = searchParams.get("userId");
  const pending = searchParams.get("pending");

  if (pending === "true") {
    const swaps = await getPendingSwapRequests();
    return NextResponse.json({ data: swaps });
  }

  if (shiftId) {
    const swaps = await getSwapRequestsByShift(shiftId);
    return NextResponse.json({ data: swaps });
  }

  if (userId) {
    const swaps = await getSwapRequestsByUser(userId);
    return NextResponse.json({ data: swaps });
  }

  return NextResponse.json(
    { error: { code: "INVALID_PARAMS", message: "Provide shiftId, userId, or pending=true" } },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { shiftId, requesterId, targetStaffId, reason } = body;

  if (!shiftId || !requesterId || !targetStaffId) {
    return NextResponse.json(
      { error: { code: "MISSING_FIELDS", message: "shiftId, requesterId, and targetStaffId are required" } },
      { status: 400 }
    );
  }

  const swap = await createSwapRequest({ shiftId, requesterId, targetStaffId, reason });
  return NextResponse.json({ data: swap }, { status: 201 });
}

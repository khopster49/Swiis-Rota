import { NextRequest, NextResponse } from "next/server";
import {
  getHandoversByShift,
  getHandoversByUser,
  createHandover,
} from "@/services/handover-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shiftId = searchParams.get("shiftId");
  const userId = searchParams.get("userId");

  if (shiftId) {
    const handovers = await getHandoversByShift(shiftId);
    return NextResponse.json({ data: handovers });
  }

  if (userId) {
    const handovers = await getHandoversByUser(userId);
    return NextResponse.json({ data: handovers });
  }

  return NextResponse.json(
    { error: { code: "INVALID_PARAMS", message: "Provide shiftId or userId" } },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { shiftId, fromUserId, toUserId, notes, openItems } = body;

  if (!shiftId || !fromUserId || !toUserId || !notes) {
    return NextResponse.json(
      { error: { code: "MISSING_FIELDS", message: "shiftId, fromUserId, toUserId, and notes are required" } },
      { status: 400 }
    );
  }

  const handover = await createHandover({ shiftId, fromUserId, toUserId, notes, openItems });
  return NextResponse.json({ data: handover }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import {
  getPendingSwapRequests,
  getSwapRequestsByShift,
  getSwapRequestsByUser,
  createSwapRequest,
} from "@/services/swap-service";
import { apiError } from "@/lib/api-utils";
import { z } from "zod/v4";

const createSwapSchema = z.object({
  shiftId: z.string().min(1),
  requesterId: z.string().min(1),
  targetStaffId: z.string().min(1),
  reason: z.string().optional(),
}).refine((data) => data.requesterId !== data.targetStaffId, {
  message: "Requester and target cannot be the same person",
});

export async function GET(request: NextRequest) {
  try {
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
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSwapSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
        { status: 400 }
      );
    }

    const swap = await createSwapRequest(parsed.data);
    return NextResponse.json({ data: swap }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

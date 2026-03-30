import { NextRequest, NextResponse } from "next/server";
import {
  getHandoversByShift,
  getHandoversByUser,
  createHandover,
} from "@/services/handover-service";
import { apiError } from "@/lib/api-utils";
import { z } from "zod/v4";

const createHandoverSchema = z.object({
  shiftId: z.string().min(1),
  fromUserId: z.string().min(1),
  toUserId: z.string().min(1),
  notes: z.string().min(1, "Notes are required"),
  openItems: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
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
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createHandoverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
        { status: 400 }
      );
    }

    const handover = await createHandover(parsed.data);
    return NextResponse.json({ data: handover }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

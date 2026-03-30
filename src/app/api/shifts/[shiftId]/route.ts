import { NextRequest, NextResponse } from "next/server";
import { getShiftById } from "@/services/shift-service";
import { apiError } from "@/lib/api-utils";

interface RouteContext {
  params: Promise<{ shiftId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { shiftId } = await context.params;
    const shift = await getShiftById(shiftId);

    if (!shift) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Shift not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: shift });
  } catch (error) {
    return apiError(error);
  }
}

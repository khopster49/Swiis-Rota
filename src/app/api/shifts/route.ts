import { NextRequest, NextResponse } from "next/server";
import { getShiftsByDateRange, createShift } from "@/services/shift-service";
import { apiError } from "@/lib/api-utils";
import { z } from "zod/v4";

const createShiftSchema = z.object({
  date: z.string(),
  type: z.enum(["WEEKDAY_OVERNIGHT", "WEEKEND"]),
  startTime: z.string(),
  endTime: z.string(),
  primaryStaffId: z.string().min(1),
  secondaryStaffId: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: { code: "INVALID_PARAMS", message: "from and to query params required" } },
        { status: 400 }
      );
    }

    const shifts = await getShiftsByDateRange(new Date(from), new Date(to));
    return NextResponse.json({ data: shifts });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createShiftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
        { status: 400 }
      );
    }

    const shift = await createShift(parsed.data);
    return NextResponse.json({ data: shift }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

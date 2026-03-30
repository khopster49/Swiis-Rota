import { NextRequest, NextResponse } from "next/server";
import { completeHandover } from "@/services/handover-service";
import { apiError } from "@/lib/api-utils";
import { z } from "zod/v4";

const completeSchema = z.object({
  action: z.literal("COMPLETE"),
  userId: z.string().min(1),
});

interface RouteContext {
  params: Promise<{ handoverId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { handoverId } = await context.params;
    const body = await request.json();
    const parsed = completeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "action must be COMPLETE and userId is required" } },
        { status: 400 }
      );
    }

    const handover = await completeHandover(handoverId, parsed.data.userId);
    return NextResponse.json({ data: handover });
  } catch (error) {
    return apiError(error);
  }
}

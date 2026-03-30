import { NextRequest, NextResponse } from "next/server";
import { reviewSwapRequest, cancelSwapRequest } from "@/services/swap-service";
import { apiError } from "@/lib/api-utils";
import { z } from "zod/v4";

const reviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "CANCEL"]),
  reviewerId: z.string().min(1),
});

interface RouteContext {
  params: Promise<{ requestId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { requestId } = await context.params;
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "action (APPROVE/REJECT/CANCEL) and reviewerId are required" } },
        { status: 400 }
      );
    }

    const { action, reviewerId } = parsed.data;

    if (action === "APPROVE" || action === "REJECT") {
      const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
      const swap = await reviewSwapRequest(requestId, status, reviewerId);
      return NextResponse.json({ data: swap });
    }

    const swap = await cancelSwapRequest(requestId, reviewerId);
    return NextResponse.json({ data: swap });
  } catch (error) {
    return apiError(error);
  }
}

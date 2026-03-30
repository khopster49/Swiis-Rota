import { NextResponse } from "next/server";
import { getCurrentOnCallShift } from "@/services/shift-service";
import { apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const shift = await getCurrentOnCallShift();
    return NextResponse.json({ data: shift });
  } catch (error) {
    return apiError(error);
  }
}

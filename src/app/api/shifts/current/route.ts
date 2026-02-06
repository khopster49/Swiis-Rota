import { NextResponse } from "next/server";
import { getCurrentOnCallShift } from "@/services/shift-service";

export async function GET() {
  const shift = await getCurrentOnCallShift();
  return NextResponse.json({ data: shift });
}

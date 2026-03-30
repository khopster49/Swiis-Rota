import { NextResponse } from "next/server";
import { getAllStaff } from "@/services/staff-service";
import { apiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const staff = await getAllStaff();
    return NextResponse.json({ data: staff });
  } catch (error) {
    return apiError(error);
  }
}

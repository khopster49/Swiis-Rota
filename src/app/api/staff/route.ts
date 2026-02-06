import { NextResponse } from "next/server";
import { getAllStaff } from "@/services/staff-service";

export async function GET() {
  const staff = await getAllStaff();
  return NextResponse.json({ data: staff });
}

import { NextRequest, NextResponse } from "next/server";
import { getShiftsByDateRange } from "@/services/shift-service";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, type, startTime, endTime, primaryStaffId, secondaryStaffId, notes } = body;

  const shift = await prisma.shift.create({
    data: {
      date: new Date(date),
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      notes,
      assignment: {
        create: {
          primaryStaffId,
          secondaryStaffId,
        },
      },
    },
    include: {
      assignment: {
        include: {
          primaryStaff: true,
          secondaryStaff: true,
        },
      },
    },
  });

  return NextResponse.json({ data: shift }, { status: 201 });
}

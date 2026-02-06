import { prisma } from "@/lib/prisma";

export async function getCurrentOnCallShift() {
  const now = new Date();

  const shift = await prisma.shift.findFirst({
    where: {
      startTime: { lte: now },
      endTime: { gte: now },
    },
    include: {
      assignment: {
        include: {
          primaryStaff: true,
          secondaryStaff: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return shift;
}

export async function getShiftsByDateRange(from: Date, to: Date) {
  return prisma.shift.findMany({
    where: {
      OR: [
        // Shifts that start within the range
        { startTime: { gte: from, lte: to } },
        // Shifts that end within the range
        { endTime: { gte: from, lte: to } },
        // Shifts that span the entire range
        { startTime: { lte: from }, endTime: { gte: to } },
      ],
    },
    include: {
      assignment: {
        include: {
          primaryStaff: true,
          secondaryStaff: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getUpcomingShifts(limit = 5) {
  const now = new Date();

  return prisma.shift.findMany({
    where: {
      startTime: { gt: now },
    },
    include: {
      assignment: {
        include: {
          primaryStaff: true,
          secondaryStaff: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
    take: limit,
  });
}

export async function getShiftById(id: string) {
  return prisma.shift.findUnique({
    where: { id },
    include: {
      assignment: {
        include: {
          primaryStaff: true,
          secondaryStaff: true,
        },
      },
      handovers: {
        include: {
          fromUser: true,
          toUser: true,
        },
      },
      swapRequests: {
        include: {
          requester: true,
          targetStaff: true,
        },
      },
    },
  });
}

import { prisma } from "@/lib/prisma";

export async function getAllStaff() {
  return prisma.user.findMany({
    where: { isActive: true },
    orderBy: { firstName: "asc" },
  });
}

export async function getEscalationChain() {
  return prisma.user.findMany({
    where: {
      isActive: true,
      escalationOrder: { not: null },
    },
    orderBy: { escalationOrder: "asc" },
  });
}

export async function getStaffById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getStaffShiftHistory(staffId: string, limit = 10) {
  return prisma.shift.findMany({
    where: {
      assignment: {
        OR: [
          { primaryStaffId: staffId },
          { secondaryStaffId: staffId },
        ],
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
    orderBy: { startTime: "desc" },
    take: limit,
  });
}

export async function getStaffUpcomingShifts(staffId: string, limit = 5) {
  const now = new Date();
  return prisma.shift.findMany({
    where: {
      startTime: { gt: now },
      assignment: {
        OR: [
          { primaryStaffId: staffId },
          { secondaryStaffId: staffId },
        ],
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
    orderBy: { startTime: "asc" },
    take: limit,
  });
}

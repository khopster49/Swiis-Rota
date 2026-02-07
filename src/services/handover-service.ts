import { prisma } from "@/lib/prisma";

export async function getHandoversByShift(shiftId: string) {
  return prisma.handover.findMany({
    where: { shiftId },
    include: {
      fromUser: true,
      toUser: true,
      shift: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getHandoversByUser(userId: string) {
  return prisma.handover.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    include: {
      fromUser: true,
      toUser: true,
      shift: {
        include: {
          assignment: {
            include: { primaryStaff: true, secondaryStaff: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createHandover(data: {
  shiftId: string;
  fromUserId: string;
  toUserId: string;
  notes: string;
  openItems?: string;
}) {
  const handover = await prisma.handover.create({
    data: {
      shiftId: data.shiftId,
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      notes: data.notes,
      openItems: data.openItems,
    },
    include: {
      fromUser: true,
      toUser: true,
      shift: true,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: data.fromUserId,
      action: "HANDOVER_CREATED",
      description: `Created handover notes for ${handover.toUser.firstName} ${handover.toUser.lastName}`,
      metadata: JSON.stringify({ handoverId: handover.id, shiftId: data.shiftId }),
    },
  });

  return handover;
}

export async function completeHandover(handoverId: string, userId: string) {
  const handover = await prisma.handover.update({
    where: { id: handoverId },
    data: { completedAt: new Date() },
    include: {
      fromUser: true,
      toUser: true,
      shift: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId,
      action: "HANDOVER_COMPLETED",
      description: `Acknowledged handover from ${handover.fromUser.firstName} ${handover.fromUser.lastName}`,
      metadata: JSON.stringify({ handoverId: handover.id }),
    },
  });

  return handover;
}

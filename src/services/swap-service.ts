import { prisma } from "@/lib/prisma";

export async function getSwapRequestsByShift(shiftId: string) {
  return prisma.swapRequest.findMany({
    where: { shiftId },
    include: {
      requester: true,
      targetStaff: true,
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

export async function getSwapRequestsByUser(userId: string) {
  return prisma.swapRequest.findMany({
    where: {
      OR: [{ requesterId: userId }, { targetStaffId: userId }],
    },
    include: {
      requester: true,
      targetStaff: true,
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

export async function getPendingSwapRequests() {
  return prisma.swapRequest.findMany({
    where: { status: "PENDING" },
    include: {
      requester: true,
      targetStaff: true,
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

export async function createSwapRequest(data: {
  shiftId: string;
  requesterId: string;
  targetStaffId: string;
  reason?: string;
}) {
  const swap = await prisma.swapRequest.create({
    data: {
      shiftId: data.shiftId,
      requesterId: data.requesterId,
      targetStaffId: data.targetStaffId,
      reason: data.reason,
      status: "PENDING",
    },
    include: {
      requester: true,
      targetStaff: true,
      shift: true,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: data.requesterId,
      action: "SWAP_REQUESTED",
      description: `Requested shift swap for ${swap.shift.type === "WEEKEND" ? "weekend" : "weekday"} shift`,
      metadata: JSON.stringify({ swapRequestId: swap.id, shiftId: data.shiftId }),
    },
  });

  return swap;
}

export async function reviewSwapRequest(
  requestId: string,
  status: "APPROVED" | "REJECTED",
  reviewerId: string
) {
  const swap = await prisma.swapRequest.update({
    where: { id: requestId },
    data: {
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
    include: {
      requester: true,
      targetStaff: true,
      shift: {
        include: {
          assignment: true,
        },
      },
    },
  });

  // If approved, update the shift assignment
  if (status === "APPROVED" && swap.shift.assignment) {
    const assignment = swap.shift.assignment;
    const updateData: { primaryStaffId?: string; secondaryStaffId?: string } = {};

    if (assignment.primaryStaffId === swap.requesterId) {
      updateData.primaryStaffId = swap.targetStaffId;
    } else if (assignment.secondaryStaffId === swap.requesterId) {
      updateData.secondaryStaffId = swap.targetStaffId;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.shiftAssignment.update({
        where: { id: assignment.id },
        data: updateData,
      });
    }
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: reviewerId,
      action: status === "APPROVED" ? "SWAP_APPROVED" : "SWAP_REJECTED",
      description: `${status === "APPROVED" ? "Approved" : "Rejected"} swap request from ${swap.requester.firstName} ${swap.requester.lastName}`,
      metadata: JSON.stringify({ swapRequestId: swap.id }),
    },
  });

  return swap;
}

export async function cancelSwapRequest(requestId: string, userId: string) {
  const swap = await prisma.swapRequest.update({
    where: { id: requestId },
    data: { status: "CANCELLED" },
    include: { requester: true, shift: true },
  });

  await prisma.activityLog.create({
    data: {
      userId,
      action: "SWAP_CANCELLED",
      description: `Cancelled swap request for ${swap.shift.type === "WEEKEND" ? "weekend" : "weekday"} shift`,
      metadata: JSON.stringify({ swapRequestId: swap.id }),
    },
  });

  return swap;
}

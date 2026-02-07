import { prisma } from "@/lib/prisma";

// ---- Queries ----

export async function getNotificationsByUser(
  userId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { notifications, total };
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

// ---- Mutations ----

export async function markNotificationRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

// ---- Trigger helpers ----

export async function createNotification(data: {
  userId: string;
  title: string;
  body: string;
  type: "SHIFT_REMINDER" | "SWAP_REQUEST" | "HANDOVER" | "ESCALATION" | "GENERAL";
  actionUrl?: string;
}) {
  return prisma.notification.create({ data });
}

/**
 * Notify staff when a swap request is created targeting them.
 */
export async function notifySwapRequested(
  targetUserId: string,
  requesterName: string,
  shiftDate: string,
  shiftId: string
) {
  return createNotification({
    userId: targetUserId,
    title: "New Swap Request",
    body: `${requesterName} has requested to swap a shift on ${shiftDate} with you.`,
    type: "SWAP_REQUEST",
    actionUrl: `/rota/${shiftId}`,
  });
}

/**
 * Notify requester when their swap is approved or rejected.
 */
export async function notifySwapReviewed(
  requesterId: string,
  status: "APPROVED" | "REJECTED",
  reviewerName: string,
  shiftId: string
) {
  const statusWord = status === "APPROVED" ? "approved" : "rejected";
  return createNotification({
    userId: requesterId,
    title: `Swap Request ${status === "APPROVED" ? "Approved" : "Rejected"}`,
    body: `${reviewerName} ${statusWord} your swap request.`,
    type: "SWAP_REQUEST",
    actionUrl: `/rota/${shiftId}`,
  });
}

/**
 * Notify the receiving staff member about a new handover.
 */
export async function notifyHandoverCreated(
  toUserId: string,
  fromUserName: string,
  shiftId: string
) {
  return createNotification({
    userId: toUserId,
    title: "New Handover",
    body: `${fromUserName} has submitted handover notes for you to review.`,
    type: "HANDOVER",
    actionUrl: `/rota/${shiftId}`,
  });
}

/**
 * Notify staff about an upcoming shift (e.g. 24h before).
 */
export async function notifyShiftReminder(
  userId: string,
  shiftDate: string,
  shiftType: string
) {
  return createNotification({
    userId,
    title: "Upcoming Shift Reminder",
    body: `You have a ${shiftType === "WEEKEND" ? "weekend" : "weekday overnight"} shift starting ${shiftDate}.`,
    type: "SHIFT_REMINDER",
  });
}

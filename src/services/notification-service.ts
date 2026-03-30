import { collections, docsToJSON, docToJSON, toTimestamp } from "@/lib/firestore";

// ---- Queries ----

export async function getNotificationsByUser(
  userId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  // Get total count
  const countSnap = await collections
    .notifications()
    .where("userId", "==", userId)
    .count()
    .get();
  const total = countSnap.data().count;

  // Get paginated results
  let query = collections
    .notifications()
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc");

  if (offset > 0) {
    // For offset pagination, we fetch offset + limit and skip
    const allSnap = await query.limit(offset + limit).get();
    const notifications = docsToJSON<Record<string, unknown>>(allSnap).slice(offset);
    return { notifications, total };
  }

  const snap = await query.limit(limit).get();
  const notifications = docsToJSON<Record<string, unknown>>(snap);
  return { notifications, total };
}

export async function getUnreadNotificationCount(userId: string) {
  const snap = await collections
    .notifications()
    .where("userId", "==", userId)
    .where("isRead", "==", false)
    .count()
    .get();
  return snap.data().count;
}

// ---- Mutations ----

export async function markNotificationRead(notificationId: string) {
  await collections.notifications().doc(notificationId).update({ isRead: true });
  const doc = await collections.notifications().doc(notificationId).get();
  return docToJSON<Record<string, unknown>>(doc);
}

export async function markAllNotificationsRead(userId: string) {
  const snap = await collections
    .notifications()
    .where("userId", "==", userId)
    .where("isRead", "==", false)
    .get();

  const batch = (await import("@/lib/firestore")).db.batch();
  snap.docs.forEach((doc) => {
    batch.update(doc.ref, { isRead: true });
  });
  await batch.commit();

  return { count: snap.size };
}

// ---- Trigger helpers ----

export async function createNotification(data: {
  userId: string;
  title: string;
  body: string;
  type: "SHIFT_REMINDER" | "SWAP_REQUEST" | "HANDOVER" | "ESCALATION" | "GENERAL";
  actionUrl?: string;
}) {
  const now = new Date().toISOString();
  const ref = collections.notifications().doc();

  await ref.set({
    userId: data.userId,
    title: data.title,
    body: data.body,
    type: data.type,
    isRead: false,
    actionUrl: data.actionUrl || null,
    createdAt: toTimestamp(now),
  });

  return { id: ref.id, ...data, isRead: false, createdAt: now };
}

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

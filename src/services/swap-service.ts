import { format } from "date-fns";
import {
  collections,
  docsToJSON,
  docToJSON,
  toTimestamp,
  getSafeUser,
} from "@/lib/firestore";
import { notifySwapRequested, notifySwapReviewed } from "@/services/notification-service";

async function enrichSwapRequest(swap: Record<string, unknown> & { id: string }) {
  const [requester, targetStaff, shiftDoc] = await Promise.all([
    getSafeUser(swap.requesterId as string),
    getSafeUser(swap.targetStaffId as string),
    collections.shifts().doc(swap.shiftId as string).get(),
  ]);

  const shift = docToJSON<Record<string, unknown>>(shiftDoc);

  return { ...swap, requester, targetStaff, shift };
}

export async function getSwapRequestsByShift(shiftId: string) {
  const snap = await collections
    .swapRequests()
    .where("shiftId", "==", shiftId)
    .orderBy("createdAt", "desc")
    .get();

  const swaps = docsToJSON<Record<string, unknown>>(snap);
  return Promise.all(swaps.map(enrichSwapRequest));
}

export async function getSwapRequestsByUser(userId: string) {
  const [fromSnap, toSnap] = await Promise.all([
    collections.swapRequests().where("requesterId", "==", userId).get(),
    collections.swapRequests().where("targetStaffId", "==", userId).get(),
  ]);

  const allDocs = [
    ...docsToJSON<Record<string, unknown>>(fromSnap),
    ...docsToJSON<Record<string, unknown>>(toSnap),
  ];

  // Deduplicate
  const uniqueMap = new Map<string, Record<string, unknown> & { id: string }>();
  for (const doc of allDocs) {
    uniqueMap.set(doc.id, doc);
  }

  const swaps = [...uniqueMap.values()].sort(
    (a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
  );

  return Promise.all(swaps.map(enrichSwapRequest));
}

export async function getPendingSwapRequests() {
  const snap = await collections
    .swapRequests()
    .where("status", "==", "PENDING")
    .orderBy("createdAt", "desc")
    .get();

  const swaps = docsToJSON<Record<string, unknown>>(snap);
  return Promise.all(swaps.map(enrichSwapRequest));
}

export async function createSwapRequest(data: {
  shiftId: string;
  requesterId: string;
  targetStaffId: string;
  reason?: string;
}) {
  const now = new Date().toISOString();
  const ref = collections.swapRequests().doc();

  await ref.set({
    shiftId: data.shiftId,
    requesterId: data.requesterId,
    targetStaffId: data.targetStaffId,
    status: "PENDING",
    reason: data.reason || null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: toTimestamp(now),
    updatedAt: toTimestamp(now),
  });

  // Fetch created swap with enrichment
  const swap = await enrichSwapRequest({
    id: ref.id,
    shiftId: data.shiftId,
    requesterId: data.requesterId,
    targetStaffId: data.targetStaffId,
    status: "PENDING",
    reason: data.reason || null,
    createdAt: now,
  });

  // Log activity
  const requesterDoc = await getSafeUser(data.requesterId);
  await collections.activityLogs().add({
    userId: data.requesterId,
    action: "SWAP_REQUESTED",
    description: `Requested shift swap for ${(swap.shift as Record<string, unknown>)?.type === "WEEKEND" ? "weekend" : "weekday"} shift`,
    metadata: JSON.stringify({ swapRequestId: ref.id, shiftId: data.shiftId }),
    createdAt: toTimestamp(now),
  });

  // Notify target staff
  const shiftDate = (swap.shift as Record<string, unknown>)?.startTime
    ? format(new Date((swap.shift as Record<string, unknown>).startTime as string), "EEE d MMM")
    : "";

  await notifySwapRequested(
    data.targetStaffId,
    requesterDoc ? `${requesterDoc.firstName} ${requesterDoc.lastName}` : "A staff member",
    shiftDate,
    data.shiftId
  );

  return swap;
}

export async function reviewSwapRequest(
  requestId: string,
  status: "APPROVED" | "REJECTED",
  reviewerId: string
) {
  const now = new Date().toISOString();

  await collections.swapRequests().doc(requestId).update({
    status,
    reviewedBy: reviewerId,
    reviewedAt: toTimestamp(now),
    updatedAt: toTimestamp(now),
  });

  const swapDoc = await collections.swapRequests().doc(requestId).get();
  const swap = docToJSON<Record<string, unknown>>(swapDoc)!;

  // If approved, update the shift assignment
  if (status === "APPROVED") {
    const assignSnap = await collections
      .shiftAssignments()
      .where("shiftId", "==", swap.shiftId)
      .limit(1)
      .get();

    if (!assignSnap.empty) {
      const assignment = docToJSON<Record<string, unknown>>(assignSnap.docs[0])!;
      const updateData: Record<string, string> = {};

      if (assignment.primaryStaffId === swap.requesterId) {
        updateData.primaryStaffId = swap.targetStaffId as string;
      } else if (assignment.secondaryStaffId === swap.requesterId) {
        updateData.secondaryStaffId = swap.targetStaffId as string;
      }

      if (Object.keys(updateData).length > 0) {
        await assignSnap.docs[0].ref.update(updateData);
      }
    }
  }

  // Log activity
  const reviewer = await getSafeUser(reviewerId);
  await collections.activityLogs().add({
    userId: reviewerId,
    action: status === "APPROVED" ? "SWAP_APPROVED" : "SWAP_REJECTED",
    description: `${status === "APPROVED" ? "Approved" : "Rejected"} swap request`,
    metadata: JSON.stringify({ swapRequestId: requestId }),
    createdAt: toTimestamp(now),
  });

  // Notify requester
  await notifySwapReviewed(
    swap.requesterId as string,
    status,
    reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : "A manager",
    swap.shiftId as string
  );

  return enrichSwapRequest(swap);
}

export async function cancelSwapRequest(requestId: string, userId: string) {
  const now = new Date().toISOString();

  await collections.swapRequests().doc(requestId).update({
    status: "CANCELLED",
    updatedAt: toTimestamp(now),
  });

  const swapDoc = await collections.swapRequests().doc(requestId).get();
  const swap = docToJSON<Record<string, unknown>>(swapDoc)!;

  await collections.activityLogs().add({
    userId,
    action: "SWAP_CANCELLED",
    description: `Cancelled swap request for ${(swap as Record<string, unknown>).type === "WEEKEND" ? "weekend" : "weekday"} shift`,
    metadata: JSON.stringify({ swapRequestId: requestId }),
    createdAt: toTimestamp(now),
  });

  return enrichSwapRequest(swap);
}

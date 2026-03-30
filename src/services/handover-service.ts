import {
  collections,
  docsToJSON,
  docToJSON,
  toTimestamp,
  getSafeUser,
} from "@/lib/firestore";
import { notifyHandoverCreated } from "@/services/notification-service";

async function enrichHandover(h: Record<string, unknown> & { id: string }) {
  const [fromUser, toUser, shiftDoc] = await Promise.all([
    getSafeUser(h.fromUserId as string),
    getSafeUser(h.toUserId as string),
    collections.shifts().doc(h.shiftId as string).get(),
  ]);

  const shift = docToJSON<Record<string, unknown>>(shiftDoc);
  return { ...h, fromUser, toUser, shift };
}

export async function getHandoversByShift(shiftId: string) {
  const snap = await collections
    .handovers()
    .where("shiftId", "==", shiftId)
    .orderBy("createdAt", "desc")
    .get();

  const handovers = docsToJSON<Record<string, unknown>>(snap);
  return Promise.all(handovers.map(enrichHandover));
}

export async function getHandoversByUser(userId: string) {
  const [fromSnap, toSnap] = await Promise.all([
    collections.handovers().where("fromUserId", "==", userId).get(),
    collections.handovers().where("toUserId", "==", userId).get(),
  ]);

  const allDocs = [
    ...docsToJSON<Record<string, unknown>>(fromSnap),
    ...docsToJSON<Record<string, unknown>>(toSnap),
  ];

  const uniqueMap = new Map<string, Record<string, unknown> & { id: string }>();
  for (const doc of allDocs) {
    uniqueMap.set(doc.id, doc);
  }

  const handovers = [...uniqueMap.values()].sort(
    (a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
  );

  return Promise.all(handovers.map(enrichHandover));
}

export async function createHandover(data: {
  shiftId: string;
  fromUserId: string;
  toUserId: string;
  notes: string;
  openItems?: string;
}) {
  const now = new Date().toISOString();
  const ref = collections.handovers().doc();

  await ref.set({
    shiftId: data.shiftId,
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    notes: data.notes,
    openItems: data.openItems || null,
    completedAt: null,
    createdAt: toTimestamp(now),
  });

  const handover = await enrichHandover({
    id: ref.id,
    shiftId: data.shiftId,
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    notes: data.notes,
    openItems: data.openItems || null,
    completedAt: null,
    createdAt: now,
  });

  // Log activity
  const fromUser = await getSafeUser(data.fromUserId);
  const toUser = await getSafeUser(data.toUserId);

  await collections.activityLogs().add({
    userId: data.fromUserId,
    action: "HANDOVER_CREATED",
    description: `Created handover notes for ${toUser?.firstName ?? ""} ${toUser?.lastName ?? ""}`,
    metadata: JSON.stringify({ handoverId: ref.id, shiftId: data.shiftId }),
    createdAt: toTimestamp(now),
  });

  // Notify receiving staff
  await notifyHandoverCreated(
    data.toUserId,
    fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : "A staff member",
    data.shiftId
  );

  return handover;
}

export async function completeHandover(handoverId: string, userId: string) {
  const now = new Date().toISOString();

  await collections.handovers().doc(handoverId).update({
    completedAt: toTimestamp(now),
  });

  const doc = await collections.handovers().doc(handoverId).get();
  const handover = docToJSON<Record<string, unknown>>(doc)!;

  const fromUser = await getSafeUser(handover.fromUserId as string);

  await collections.activityLogs().add({
    userId,
    action: "HANDOVER_COMPLETED",
    description: `Acknowledged handover from ${fromUser?.firstName ?? ""} ${fromUser?.lastName ?? ""}`,
    metadata: JSON.stringify({ handoverId }),
    createdAt: toTimestamp(now),
  });

  return enrichHandover(handover);
}

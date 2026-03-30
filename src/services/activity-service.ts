import { collections, docsToJSON, docToJSON, getSafeUser } from "@/lib/firestore";

export async function getRecentActivity(limit = 10) {
  const snap = await collections
    .activityLogs()
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  const logs = docsToJSON<Record<string, unknown>>(snap);

  return Promise.all(
    logs.map(async (log) => {
      const user = await getSafeUser(log.userId as string);
      return { ...log, user };
    })
  );
}

export async function getPaginatedActivity({
  limit = 20,
  offset = 0,
}: { limit?: number; offset?: number } = {}) {
  // Clamp limit to prevent abuse
  const clampedLimit = Math.min(limit, 100);

  const countSnap = await collections.activityLogs().count().get();
  const total = countSnap.data().count;

  let activities: (Record<string, unknown> & { id: string })[];

  if (offset > 0) {
    const allSnap = await collections
      .activityLogs()
      .orderBy("createdAt", "desc")
      .limit(offset + clampedLimit)
      .get();
    activities = docsToJSON<Record<string, unknown>>(allSnap).slice(offset);
  } else {
    const snap = await collections
      .activityLogs()
      .orderBy("createdAt", "desc")
      .limit(clampedLimit)
      .get();
    activities = docsToJSON<Record<string, unknown>>(snap);
  }

  const enriched = await Promise.all(
    activities.map(async (log) => {
      const user = await getSafeUser(log.userId as string);
      return { ...log, user };
    })
  );

  return { activities: enriched, total };
}

export async function getMetrics() {
  const snap = await collections
    .supportMetrics()
    .orderBy("periodEnd", "desc")
    .limit(1)
    .get();

  if (snap.empty) return null;
  return docToJSON<Record<string, unknown>>(snap.docs[0]);
}

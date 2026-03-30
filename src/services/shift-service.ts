import {
  collections,
  docsToJSON,
  docToJSON,
  toTimestamp,
  getSafeUser,
} from "@/lib/firestore";

type ShiftDoc = Record<string, unknown> & {
  date: string;
  type: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type AssignmentDoc = Record<string, unknown> & {
  shiftId: string;
  primaryStaffId: string;
  secondaryStaffId: string;
};

async function enrichShiftWithAssignment(shift: ShiftDoc & { id: string }) {
  const assignSnap = await collections
    .shiftAssignments()
    .where("shiftId", "==", shift.id)
    .limit(1)
    .get();

  if (assignSnap.empty) {
    return { ...shift, assignment: null };
  }

  const assignment = docToJSON<AssignmentDoc>(assignSnap.docs[0])!;
  const [primaryStaff, secondaryStaff] = await Promise.all([
    getSafeUser(assignment.primaryStaffId),
    getSafeUser(assignment.secondaryStaffId),
  ]);

  return {
    ...shift,
    assignment: { ...assignment, primaryStaff, secondaryStaff },
  };
}

export async function getCurrentOnCallShift() {
  const now = toTimestamp(new Date());

  const snap = await collections
    .shifts()
    .where("startTime", "<=", now)
    .orderBy("startTime", "desc")
    .limit(10)
    .get();

  const shifts = docsToJSON<ShiftDoc>(snap);
  const currentShift = shifts.find((s) => {
    const end = new Date(s.endTime);
    return end >= new Date();
  });

  if (!currentShift) return null;
  return enrichShiftWithAssignment(currentShift);
}

export async function getShiftsByDateRange(from: Date, to: Date) {
  const snap = await collections
    .shifts()
    .where("startTime", "<=", toTimestamp(to))
    .orderBy("startTime", "asc")
    .get();

  const allShifts = docsToJSON<ShiftDoc>(snap);

  // Filter: shifts that overlap with the range
  const filtered = allShifts.filter((s) => {
    const end = new Date(s.endTime);
    return end >= from;
  });

  return Promise.all(filtered.map(enrichShiftWithAssignment));
}

export async function getUpcomingShifts(limit = 5) {
  const now = toTimestamp(new Date());

  const snap = await collections
    .shifts()
    .where("startTime", ">", now)
    .orderBy("startTime", "asc")
    .limit(limit)
    .get();

  const shifts = docsToJSON<ShiftDoc>(snap);
  return Promise.all(shifts.map(enrichShiftWithAssignment));
}

export async function getShiftById(id: string) {
  const doc = await collections.shifts().doc(id).get();
  const shift = docToJSON<ShiftDoc>(doc);
  if (!shift) return null;

  const enriched = await enrichShiftWithAssignment(shift);

  // Fetch swap requests
  const swapSnap = await collections
    .swapRequests()
    .where("shiftId", "==", id)
    .orderBy("createdAt", "desc")
    .get();

  const swapRequests = await Promise.all(
    docsToJSON<Record<string, unknown>>(swapSnap).map(async (swap) => {
      const [requester, targetStaff] = await Promise.all([
        getSafeUser(swap.requesterId as string),
        getSafeUser(swap.targetStaffId as string),
      ]);
      return { ...swap, requester, targetStaff };
    })
  );

  // Fetch handovers
  const handoverSnap = await collections
    .handovers()
    .where("shiftId", "==", id)
    .orderBy("createdAt", "desc")
    .get();

  const handovers = await Promise.all(
    docsToJSON<Record<string, unknown>>(handoverSnap).map(async (h) => {
      const [fromUser, toUser] = await Promise.all([
        getSafeUser(h.fromUserId as string),
        getSafeUser(h.toUserId as string),
      ]);
      return { ...h, fromUser, toUser };
    })
  );

  return { ...enriched, swapRequests, handovers };
}

export async function createShift(data: {
  date: string;
  type: string;
  startTime: string;
  endTime: string;
  primaryStaffId: string;
  secondaryStaffId: string;
  notes?: string;
}) {
  const shiftRef = collections.shifts().doc();
  const now = new Date().toISOString();

  await shiftRef.set({
    date: toTimestamp(data.date),
    type: data.type,
    startTime: toTimestamp(data.startTime),
    endTime: toTimestamp(data.endTime),
    notes: data.notes || null,
    createdAt: toTimestamp(now),
    updatedAt: toTimestamp(now),
  });

  const assignRef = collections.shiftAssignments().doc();
  await assignRef.set({
    shiftId: shiftRef.id,
    primaryStaffId: data.primaryStaffId,
    secondaryStaffId: data.secondaryStaffId,
    createdAt: toTimestamp(now),
    updatedAt: toTimestamp(now),
  });

  return getShiftById(shiftRef.id);
}

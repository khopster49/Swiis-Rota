import { collections, docsToJSON, sanitizeUser, docToJSON } from "@/lib/firestore";

export async function getAllStaff() {
  const snap = await collections
    .users()
    .where("isActive", "==", true)
    .orderBy("firstName", "asc")
    .get();

  return docsToJSON<Record<string, unknown>>(snap).map(sanitizeUser);
}

export async function getEscalationChain() {
  const snap = await collections
    .users()
    .where("isActive", "==", true)
    .where("escalationOrder", "!=", null)
    .orderBy("escalationOrder", "asc")
    .get();

  return docsToJSON<Record<string, unknown>>(snap).map(sanitizeUser);
}

export async function getStaffById(id: string) {
  const doc = await collections.users().doc(id).get();
  const data = docToJSON<Record<string, unknown>>(doc);
  if (!data) return null;
  return sanitizeUser(data);
}

export async function getStaffShiftHistory(staffId: string, limit = 10) {
  const { getSafeUser } = await import("@/lib/firestore");

  // Get assignments where this staff is primary or secondary
  const [primarySnap, secondarySnap] = await Promise.all([
    collections.shiftAssignments().where("primaryStaffId", "==", staffId).get(),
    collections.shiftAssignments().where("secondaryStaffId", "==", staffId).get(),
  ]);

  const assignmentDocs = [
    ...docsToJSON<Record<string, unknown>>(primarySnap),
    ...docsToJSON<Record<string, unknown>>(secondarySnap),
  ];

  // Deduplicate by shift ID
  const shiftIds = [...new Set(assignmentDocs.map((a) => a.shiftId as string))];

  if (shiftIds.length === 0) return [];

  // Fetch shifts
  const shifts = await Promise.all(
    shiftIds.slice(0, limit).map(async (shiftId) => {
      const shiftDoc = await collections.shifts().doc(shiftId).get();
      const shift = docToJSON<Record<string, unknown>>(shiftDoc);
      if (!shift) return null;

      const assignment = assignmentDocs.find((a) => a.shiftId === shiftId);
      if (!assignment) return { ...shift, assignment: null };

      const [primaryStaff, secondaryStaff] = await Promise.all([
        getSafeUser(assignment.primaryStaffId as string),
        getSafeUser(assignment.secondaryStaffId as string),
      ]);

      return { ...shift, assignment: { ...assignment, primaryStaff, secondaryStaff } };
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (shifts
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => new Date((b as any).startTime).getTime() - new Date((a as any).startTime).getTime())) as any[];
}

export async function getStaffUpcomingShifts(staffId: string, limit = 5) {
  const { getSafeUser } = await import("@/lib/firestore");

  const [primarySnap, secondarySnap] = await Promise.all([
    collections.shiftAssignments().where("primaryStaffId", "==", staffId).get(),
    collections.shiftAssignments().where("secondaryStaffId", "==", staffId).get(),
  ]);

  const assignmentDocs = [
    ...docsToJSON<Record<string, unknown>>(primarySnap),
    ...docsToJSON<Record<string, unknown>>(secondarySnap),
  ];

  const shiftIds = [...new Set(assignmentDocs.map((a) => a.shiftId as string))];
  if (shiftIds.length === 0) return [];

  const now = new Date();
  const shifts = await Promise.all(
    shiftIds.map(async (shiftId) => {
      const shiftDoc = await collections.shifts().doc(shiftId).get();
      const shift = docToJSON<Record<string, unknown>>(shiftDoc);
      if (!shift) return null;
      if (new Date(shift.startTime as string) <= now) return null;

      const assignment = assignmentDocs.find((a) => a.shiftId === shiftId);
      if (!assignment) return { ...shift, assignment: null };

      const [primaryStaff, secondaryStaff] = await Promise.all([
        getSafeUser(assignment.primaryStaffId as string),
        getSafeUser(assignment.secondaryStaffId as string),
      ]);

      return { ...shift, assignment: { ...assignment, primaryStaff, secondaryStaff } };
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (shifts
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => new Date((a as any).startTime).getTime() - new Date((b as any).startTime).getTime())
    .slice(0, limit)) as any[];
}

import { db } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

// ---- Collection references ----
export const collections = {
  users: () => db.collection("users"),
  shifts: () => db.collection("shifts"),
  shiftAssignments: () => db.collection("shiftAssignments"),
  swapRequests: () => db.collection("swapRequests"),
  handovers: () => db.collection("handovers"),
  activityLogs: () => db.collection("activityLogs"),
  notifications: () => db.collection("notifications"),
  supportMetrics: () => db.collection("supportMetrics"),
} as const;

// ---- Helpers ----

/** Convert Firestore Timestamp fields to ISO strings */
export function docToJSON<T extends Record<string, unknown>>(
  doc: FirebaseFirestore.DocumentSnapshot
): (T & { id: string }) | null {
  if (!doc.exists) return null;
  const data = doc.data()!;
  const result: Record<string, unknown> = { id: doc.id };

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result as T & { id: string };
}

/** Convert multiple docs */
export function docsToJSON<T extends Record<string, unknown>>(
  snapshot: FirebaseFirestore.QuerySnapshot
): (T & { id: string })[] {
  return snapshot.docs
    .map((doc) => docToJSON<T>(doc))
    .filter((d): d is T & { id: string } => d !== null);
}

/** Generate a server timestamp */
export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

/** Convert a Date to Firestore Timestamp */
export function toTimestamp(date: Date | string): Timestamp {
  if (typeof date === "string") {
    return Timestamp.fromDate(new Date(date));
  }
  return Timestamp.fromDate(date);
}

/** Typed user returned from Firestore (no passwordHash) */
export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  escalationOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Safe user fields — never return passwordHash */
export const SAFE_USER_FIELDS: (keyof Omit<SafeUser, "id">)[] = [
  "email",
  "firstName",
  "lastName",
  "role",
  "phone",
  "avatarUrl",
  "isActive",
  "escalationOrder",
  "createdAt",
  "updatedAt",
];

/** Strip sensitive fields from a user doc */
export function sanitizeUser(
  user: Record<string, unknown> & { id: string }
): SafeUser {
  const safe: Record<string, unknown> = { id: user.id };
  for (const field of SAFE_USER_FIELDS) {
    if (user[field] !== undefined) {
      safe[field] = user[field];
    }
  }
  return safe as unknown as SafeUser;
}

/** Fetch a user by ID with safe fields only */
export async function getSafeUser(userId: string): Promise<SafeUser | null> {
  const doc = await collections.users().doc(userId).get();
  const data = docToJSON<Record<string, unknown>>(doc);
  if (!data) return null;
  return sanitizeUser(data);
}

export { db, FieldValue, Timestamp };

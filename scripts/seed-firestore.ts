/**
 * Seed script for Firestore.
 *
 * Usage:
 *   npx tsx scripts/seed-firestore.ts
 *
 * Requires Firebase emulator or a real project configured in .env
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Initialize Firebase Admin
const projectId = process.env.FIREBASE_PROJECT_ID || "swiis-rota-demo";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (getApps().length === 0) {
  if (clientEmail && privateKey) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  } else {
    initializeApp({ projectId });
  }
}

// Connect to emulator if configured
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
}

const db = getFirestore();

function ts(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  isActive: boolean;
  escalationOrder: number | null;
}

async function clearCollection(name: string) {
  const snap = await db.collection(name).get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  if (snap.size > 0) await batch.commit();
  console.log(`  Cleared ${snap.size} docs from ${name}`);
}

async function main() {
  console.log("Seeding Firestore...\n");

  // Clear existing data
  const collectionNames = [
    "notifications",
    "activityLogs",
    "handovers",
    "swapRequests",
    "shiftAssignments",
    "shifts",
    "supportMetrics",
    "users",
  ];

  for (const name of collectionNames) {
    await clearCollection(name);
  }

  console.log("\nCreating staff members...");

  const staffData: (Omit<StaffMember, "id"> & { id?: string })[] = [
    { id: "demo-user-1", email: "sarah.jenkins@swiis.com", firstName: "Sarah", lastName: "Jenkins", role: "MANAGER", phone: "07700900001", isActive: true, escalationOrder: 1 },
    { email: "mark.thompson@swiis.com", firstName: "Mark", lastName: "Thompson", role: "SUPPORT_WORKER", phone: "07700900002", isActive: true, escalationOrder: 2 },
    { email: "rebecca.stone@swiis.com", firstName: "Rebecca", lastName: "Stone", role: "SUPPORT_WORKER", phone: "07700900003", isActive: true, escalationOrder: 3 },
    { email: "keith.morgan@swiis.com", firstName: "Keith", lastName: "Morgan", role: "SUPPORT_WORKER", phone: "07700900004", isActive: true, escalationOrder: 4 },
    { email: "david.lewis@swiis.com", firstName: "David", lastName: "Lewis", role: "MANAGER", phone: "07700900005", isActive: true, escalationOrder: 5 },
    { email: "emma.parker@swiis.com", firstName: "Emma", lastName: "Parker", role: "SUPPORT_WORKER", phone: "07700900006", isActive: true, escalationOrder: null },
    { email: "liam.harris@swiis.com", firstName: "Liam", lastName: "Harris", role: "SUPPORT_WORKER", phone: "07700900007", isActive: true, escalationOrder: null },
    { email: "chloe.foster@swiis.com", firstName: "Chloe", lastName: "Foster", role: "SUPPORT_WORKER", phone: "07700900008", isActive: true, escalationOrder: null },
    { email: "oliver.taylor@swiis.com", firstName: "Oliver", lastName: "Taylor", role: "SUPPORT_WORKER", phone: "07700900009", isActive: true, escalationOrder: null },
    { email: "maya.roberts@swiis.com", firstName: "Maya", lastName: "Roberts", role: "TEAM_LEAD", phone: "07700900010", isActive: true, escalationOrder: null },
  ];

  const staff: StaffMember[] = [];
  for (const s of staffData) {
    const docId = s.id || db.collection("users").doc().id;
    const now = new Date();
    await db.collection("users").doc(docId).set({
      email: s.email,
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role,
      phone: s.phone,
      avatarUrl: null,
      isActive: s.isActive,
      escalationOrder: s.escalationOrder,
      createdAt: ts(now),
      updatedAt: ts(now),
    });
    staff.push({ ...s, id: docId });
  }
  console.log(`Created ${staff.length} staff members`);

  // Generate 3 months of shifts
  console.log("\nCreating shifts...");
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const shiftIds: string[] = [];
  let staffIndex = 0;

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + monthOffset, 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = date.getDay();

      // Weekday overnight shifts (Mon-Fri)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const primary = staff[staffIndex % staff.length];
        const secondary = staff[(staffIndex + 1) % staff.length];

        const startTime = new Date(date);
        startTime.setHours(17, 0, 0, 0);
        const endTime = new Date(date);
        endTime.setDate(endTime.getDate() + 1);
        endTime.setHours(9, 0, 0, 0);

        const shiftRef = db.collection("shifts").doc();
        await shiftRef.set({
          date: ts(date),
          type: "WEEKDAY_OVERNIGHT",
          startTime: ts(startTime),
          endTime: ts(endTime),
          notes: null,
          createdAt: ts(now),
          updatedAt: ts(now),
        });

        await db.collection("shiftAssignments").doc().set({
          shiftId: shiftRef.id,
          primaryStaffId: primary.id,
          secondaryStaffId: secondary.id,
          createdAt: ts(now),
          updatedAt: ts(now),
        });

        shiftIds.push(shiftRef.id);
        if (day % 2 === 0) staffIndex++;
      }

      // Weekend shifts (create on Friday)
      if (dayOfWeek === 5) {
        const primary = staff[(staffIndex + 2) % staff.length];
        const secondary = staff[(staffIndex + 3) % staff.length];

        const startTime = new Date(date);
        startTime.setHours(17, 0, 0, 0);
        const endTime = new Date(date);
        endTime.setDate(endTime.getDate() + 3);
        endTime.setHours(9, 0, 0, 0);

        const shiftRef = db.collection("shifts").doc();
        await shiftRef.set({
          date: ts(date),
          type: "WEEKEND",
          startTime: ts(startTime),
          endTime: ts(endTime),
          notes: null,
          createdAt: ts(now),
          updatedAt: ts(now),
        });

        await db.collection("shiftAssignments").doc().set({
          shiftId: shiftRef.id,
          primaryStaffId: primary.id,
          secondaryStaffId: secondary.id,
          createdAt: ts(now),
          updatedAt: ts(now),
        });

        shiftIds.push(shiftRef.id);
        staffIndex++;
      }
    }
  }
  console.log(`Created ${shiftIds.length} shifts`);

  // Sample swap requests
  if (shiftIds.length > 10) {
    console.log("\nCreating sample swap requests...");
    const david = staff[4];
    const mark = staff[1];
    const sarah = staff[0];
    const rebecca = staff[2];
    const emma = staff[5];
    const liam = staff[6];
    const chloe = staff[7];

    await db.collection("swapRequests").doc().set({
      shiftId: shiftIds[5],
      requesterId: david.id,
      targetStaffId: mark.id,
      status: "APPROVED",
      reason: "Family commitment on this date",
      reviewedBy: sarah.id,
      reviewedAt: ts(now),
      createdAt: ts(now),
      updatedAt: ts(now),
    });

    await db.collection("swapRequests").doc().set({
      shiftId: shiftIds[shiftIds.length - 3],
      requesterId: rebecca.id,
      targetStaffId: emma.id,
      status: "PENDING",
      reason: "Medical appointment, can swap for any shift next week",
      reviewedBy: null,
      reviewedAt: null,
      createdAt: ts(now),
      updatedAt: ts(now),
    });

    await db.collection("swapRequests").doc().set({
      shiftId: shiftIds[8],
      requesterId: liam.id,
      targetStaffId: chloe.id,
      status: "REJECTED",
      reason: "Holiday clash",
      reviewedBy: david.id,
      reviewedAt: ts(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
      createdAt: ts(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
      updatedAt: ts(now),
    });
    console.log("Created 3 swap requests");
  }

  // Sample handovers
  if (shiftIds.length > 10) {
    console.log("Creating sample handovers...");
    const sarah = staff[0];
    const mark = staff[1];
    const keith = staff[3];
    const rebecca = staff[2];
    const emma = staff[5];
    const oliver = staff[8];

    await db.collection("handovers").doc().set({
      shiftId: shiftIds[3],
      fromUserId: sarah.id,
      toUserId: mark.id,
      notes: "Quiet evening. One call from foster carer about bedtime routine - advised and resolved. Emergency phone fully charged.",
      openItems: "Follow up with Carter family re: school transport Monday morning",
      completedAt: ts(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
      createdAt: ts(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    });

    await db.collection("handovers").doc().set({
      shiftId: shiftIds[6],
      fromUserId: keith.id,
      toUserId: rebecca.id,
      notes: "Busy weekend. Two placement queries came in Saturday PM. Emergency placement for 14yo arranged with the Williams family.",
      openItems: "Chase placement confirmation email from Williams family\nUpdate Sarah on Monday morning",
      completedAt: null,
      createdAt: ts(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    });

    await db.collection("handovers").doc().set({
      shiftId: shiftIds[shiftIds.length - 5],
      fromUserId: emma.id,
      toUserId: oliver.id,
      notes: "All quiet tonight. No calls received. Phone battery at 85%.",
      openItems: null,
      completedAt: null,
      createdAt: ts(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    });
    console.log("Created 3 handovers");
  }

  // Activity logs
  console.log("Creating activity logs...");
  const activityData = [
    { userId: staff[4].id, action: "SWAP_APPROVED", description: "Swap request approved - David L. took night shift", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { userId: staff[0].id, action: "SHIFT_ASSIGNED", description: "New shift assignments published for upcoming month", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { userId: staff[3].id, action: "HANDOVER_COMPLETED", description: "Handover notes submitted for weekend shift", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  ];

  for (const a of activityData) {
    await db.collection("activityLogs").doc().set({
      userId: a.userId,
      action: a.action,
      description: a.description,
      metadata: null,
      createdAt: ts(a.createdAt),
    });
  }
  console.log("Created 3 activity logs");

  // Notifications
  console.log("Creating notifications...");
  const sarah = staff[0];
  const notifs = [
    { userId: sarah.id, title: "Swap Request Approved", body: "David M. took your night shift on Oct 14th.", type: "SWAP_REQUEST", isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { userId: sarah.id, title: "Mandatory Update", body: "New escalation procedures uploaded for Bristol region.", type: "GENERAL", isRead: false, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { userId: sarah.id, title: "Upcoming Shift Reminder", body: "You are on-call this Friday 5pm - Monday 9am.", type: "SHIFT_REMINDER", isRead: true, createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
  ];

  for (const n of notifs) {
    await db.collection("notifications").doc().set({
      userId: n.userId,
      title: n.title,
      body: n.body,
      type: n.type,
      isRead: n.isRead,
      actionUrl: null,
      createdAt: ts(n.createdAt),
    });
  }
  console.log("Created 3 notifications");

  // Support metrics
  await db.collection("supportMetrics").doc().set({
    periodStart: ts(new Date(now.getFullYear(), now.getMonth(), 1)),
    periodEnd: ts(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    responseRate: 90,
    avgResponseMins: 12,
    carerSatisfaction: 97,
    placementStability: 79,
    createdAt: ts(now),
  });
  console.log("Created 1 support metric");

  console.log("\n✅ Firestore seed complete!");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

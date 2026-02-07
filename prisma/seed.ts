import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.handover.deleteMany();
  await prisma.swapRequest.deleteMany();
  await prisma.shiftAssignment.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.supportMetric.deleteMany();
  await prisma.user.deleteMany();

  const password = hashSync("password123", 10);

  // Create staff members
  const sarah = await prisma.user.create({
    data: {
      id: "demo-user-1",
      email: "sarah.jenkins@swiis.com",
      passwordHash: password,
      firstName: "Sarah",
      lastName: "Jenkins",
      role: "MANAGER",
      phone: "07700900001",
      isActive: true,
      escalationOrder: 1,
    },
  });

  const mark = await prisma.user.create({
    data: {
      email: "mark.thompson@swiis.com",
      passwordHash: password,
      firstName: "Mark",
      lastName: "Thompson",
      role: "SUPPORT_WORKER",
      phone: "07700900002",
      isActive: true,
      escalationOrder: 2,
    },
  });

  const rebecca = await prisma.user.create({
    data: {
      email: "rebecca.stone@swiis.com",
      passwordHash: password,
      firstName: "Rebecca",
      lastName: "Stone",
      role: "SUPPORT_WORKER",
      phone: "07700900003",
      isActive: true,
      escalationOrder: 3,
    },
  });

  const keith = await prisma.user.create({
    data: {
      email: "keith.morgan@swiis.com",
      passwordHash: password,
      firstName: "Keith",
      lastName: "Morgan",
      role: "SUPPORT_WORKER",
      phone: "07700900004",
      isActive: true,
      escalationOrder: 4,
    },
  });

  const david = await prisma.user.create({
    data: {
      email: "david.lewis@swiis.com",
      passwordHash: password,
      firstName: "David",
      lastName: "Lewis",
      role: "MANAGER",
      phone: "07700900005",
      isActive: true,
      escalationOrder: 5,
    },
  });

  const emma = await prisma.user.create({
    data: {
      email: "emma.parker@swiis.com",
      passwordHash: password,
      firstName: "Emma",
      lastName: "Parker",
      role: "SUPPORT_WORKER",
      phone: "07700900006",
      isActive: true,
    },
  });

  const liam = await prisma.user.create({
    data: {
      email: "liam.harris@swiis.com",
      passwordHash: password,
      firstName: "Liam",
      lastName: "Harris",
      role: "SUPPORT_WORKER",
      phone: "07700900007",
      isActive: true,
    },
  });

  const chloe = await prisma.user.create({
    data: {
      email: "chloe.foster@swiis.com",
      passwordHash: password,
      firstName: "Chloe",
      lastName: "Foster",
      role: "SUPPORT_WORKER",
      phone: "07700900008",
      isActive: true,
    },
  });

  const oliver = await prisma.user.create({
    data: {
      email: "oliver.taylor@swiis.com",
      passwordHash: password,
      firstName: "Oliver",
      lastName: "Taylor",
      role: "SUPPORT_WORKER",
      phone: "07700900009",
      isActive: true,
    },
  });

  const maya = await prisma.user.create({
    data: {
      email: "maya.roberts@swiis.com",
      passwordHash: password,
      firstName: "Maya",
      lastName: "Roberts",
      role: "TEAM_LEAD",
      phone: "07700900010",
      isActive: true,
    },
  });

  const staff = [sarah, mark, rebecca, keith, david, emma, liam, chloe, oliver, maya];

  // Generate 3 months of shifts starting from current month - 1
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const shifts = [];
  let staffIndex = 0;

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + monthOffset, 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...6=Sat

      // Weekday overnight shifts (Mon-Fri)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const primary = staff[staffIndex % staff.length];
        const secondary = staff[(staffIndex + 1) % staff.length];

        const startTime = new Date(date);
        startTime.setHours(17, 0, 0, 0);
        const endTime = new Date(date);
        endTime.setDate(endTime.getDate() + 1);
        endTime.setHours(9, 0, 0, 0);

        const shift = await prisma.shift.create({
          data: {
            date,
            type: "WEEKDAY_OVERNIGHT",
            startTime,
            endTime,
            assignment: {
              create: {
                primaryStaffId: primary.id,
                secondaryStaffId: secondary.id,
              },
            },
          },
        });
        shifts.push(shift);

        // Rotate staff every 2 weekdays
        if (day % 2 === 0) staffIndex++;
      }

      // Weekend shifts (create on Friday only, covers Fri 5pm - Mon 9am)
      if (dayOfWeek === 5) {
        const primary = staff[(staffIndex + 2) % staff.length];
        const secondary = staff[(staffIndex + 3) % staff.length];

        const startTime = new Date(date);
        startTime.setHours(17, 0, 0, 0);
        const endTime = new Date(date);
        endTime.setDate(endTime.getDate() + 3); // Monday
        endTime.setHours(9, 0, 0, 0);

        const shift = await prisma.shift.create({
          data: {
            date,
            type: "WEEKEND",
            startTime,
            endTime,
            assignment: {
              create: {
                primaryStaffId: primary.id,
                secondaryStaffId: secondary.id,
              },
            },
          },
        });
        shifts.push(shift);
        staffIndex++;
      }
    }
  }

  // Create sample swap requests
  if (shifts.length > 10) {
    await prisma.swapRequest.create({
      data: {
        shiftId: shifts[5].id,
        requesterId: david.id,
        targetStaffId: mark.id,
        status: "APPROVED",
        reason: "Family commitment on this date",
        reviewedBy: sarah.id,
        reviewedAt: new Date(),
      },
    });

    // Pending swap request on an upcoming shift
    await prisma.swapRequest.create({
      data: {
        shiftId: shifts[shifts.length - 3].id,
        requesterId: rebecca.id,
        targetStaffId: emma.id,
        status: "PENDING",
        reason: "Medical appointment, can swap for any shift next week",
      },
    });

    // Rejected swap
    await prisma.swapRequest.create({
      data: {
        shiftId: shifts[8].id,
        requesterId: liam.id,
        targetStaffId: chloe.id,
        status: "REJECTED",
        reason: "Holiday clash",
        reviewedBy: david.id,
        reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create sample handovers
  if (shifts.length > 10) {
    await prisma.handover.create({
      data: {
        shiftId: shifts[3].id,
        fromUserId: sarah.id,
        toUserId: mark.id,
        notes: "Quiet evening. One call from foster carer about bedtime routine - advised and resolved. Emergency phone fully charged.",
        openItems: "Follow up with Carter family re: school transport Monday morning",
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.handover.create({
      data: {
        shiftId: shifts[6].id,
        fromUserId: keith.id,
        toUserId: rebecca.id,
        notes: "Busy weekend. Two placement queries came in Saturday PM. Emergency placement for 14yo arranged with the Williams family. Social worker aware.\n\nAll documentation uploaded to case file.",
        openItems: "Chase placement confirmation email from Williams family\nUpdate Sarah on Monday morning about the 14yo placement",
      },
    });

    // Unacknowledged handover on a recent shift
    await prisma.handover.create({
      data: {
        shiftId: shifts[shifts.length - 5].id,
        fromUserId: emma.id,
        toUserId: oliver.id,
        notes: "All quiet tonight. No calls received. Phone battery at 85%.",
      },
    });
  }

  // Create activity logs
  await prisma.activityLog.create({
    data: {
      userId: david.id,
      action: "SWAP_APPROVED",
      description: "Swap request approved - David L. took night shift",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: sarah.id,
      action: "SHIFT_ASSIGNED",
      description: "New shift assignments published for upcoming month",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: keith.id,
      action: "HANDOVER_COMPLETED",
      description: "Handover notes submitted for weekend shift",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: sarah.id,
      title: "Swap Request Approved",
      body: "David M. took your night shift on Oct 14th.",
      type: "SWAP_REQUEST",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: sarah.id,
      title: "Mandatory Update",
      body: "New escalation procedures uploaded for Bristol region.",
      type: "GENERAL",
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: sarah.id,
      title: "Upcoming Shift Reminder",
      body: "You are on-call this Friday 5pm - Monday 9am.",
      type: "SHIFT_REMINDER",
      isRead: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  });

  // Create support metrics
  await prisma.supportMetric.create({
    data: {
      periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      responseRate: 90,
      avgResponseMins: 12,
      carerSatisfaction: 97,
      placementStability: 79,
    },
  });

  console.log("Seed data created successfully!");
  console.log(`Created ${staff.length} staff members`);
  console.log(`Created ${shifts.length} shifts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

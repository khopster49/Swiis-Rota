import { prisma } from "@/lib/prisma";

export async function getRecentActivity(limit = 10) {
  return prisma.activityLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getMetrics() {
  return prisma.supportMetric.findFirst({
    orderBy: { periodEnd: "desc" },
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

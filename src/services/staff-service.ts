import { prisma } from "@/lib/prisma";

export async function getAllStaff() {
  return prisma.user.findMany({
    where: { isActive: true },
    orderBy: { firstName: "asc" },
  });
}

export async function getEscalationChain() {
  return prisma.user.findMany({
    where: {
      isActive: true,
      escalationOrder: { not: null },
    },
    orderBy: { escalationOrder: "asc" },
  });
}

export async function getStaffById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export const SHIFT_RULES = {
  WEEKDAY_OVERNIGHT: {
    label: "Weekday Overnight",
    startHour: 17, // 5pm
    endHour: 9, // 9am next day
    days: [1, 2, 3, 4, 5] as number[], // Mon-Fri
    description: "Mon - Fri: 5pm - 9am",
  },
  WEEKEND: {
    label: "Weekend",
    startDay: 5, // Friday
    startHour: 17, // 5pm Friday
    endDay: 1, // Monday
    endHour: 9, // 9am Monday
    description: "Fri 5pm - Mon 9am",
  },
} as const;

export const ROLES = {
  SUPPORT_WORKER: "Support Worker",
  TEAM_LEAD: "Team Lead",
  MANAGER: "Manager",
  ADMIN: "Admin",
} as const;

export type Role = keyof typeof ROLES;

export const SWAP_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as const;

export type SwapStatus = keyof typeof SWAP_STATUS;

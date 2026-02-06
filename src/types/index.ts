export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SUPPORT_WORKER" | "TEAM_LEAD" | "MANAGER" | "ADMIN";
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  escalationOrder?: number;
}

export interface Shift {
  id: string;
  date: string;
  type: "WEEKDAY_OVERNIGHT" | "WEEKEND";
  startTime: string;
  endTime: string;
  notes?: string;
  assignment?: ShiftAssignment;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  primaryStaffId: string;
  secondaryStaffId: string;
  primaryStaff: User;
  secondaryStaff: User;
}

export interface SwapRequest {
  id: string;
  shiftId: string;
  requesterId: string;
  targetStaffId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason?: string;
  shift: Shift;
  requester: User;
  targetStaff: User;
}

export interface Handover {
  id: string;
  shiftId: string;
  fromUserId: string;
  toUserId: string;
  notes: string;
  openItems?: string;
  completedAt?: string;
  fromUser: User;
  toUser: User;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata?: string;
  createdAt: string;
  user: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "SHIFT_REMINDER" | "SWAP_REQUEST" | "HANDOVER" | "ESCALATION" | "GENERAL";
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface SupportMetric {
  id: string;
  periodStart: string;
  periodEnd: string;
  responseRate: number;
  carerSatisfaction: number;
  placementStability: number;
}

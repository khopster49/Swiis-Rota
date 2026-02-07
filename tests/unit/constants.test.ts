import { describe, it, expect } from "vitest";
import { SHIFT_RULES, ROLES, SWAP_STATUS } from "@/lib/constants";

describe("SHIFT_RULES", () => {
  it("defines weekday overnight shift starting at 5pm", () => {
    expect(SHIFT_RULES.WEEKDAY_OVERNIGHT.startHour).toBe(17);
  });

  it("defines weekday overnight shift ending at 9am", () => {
    expect(SHIFT_RULES.WEEKDAY_OVERNIGHT.endHour).toBe(9);
  });

  it("defines weekday shift for Mon-Fri", () => {
    expect(SHIFT_RULES.WEEKDAY_OVERNIGHT.days).toEqual([1, 2, 3, 4, 5]);
  });

  it("defines weekend shift starting Friday at 5pm", () => {
    expect(SHIFT_RULES.WEEKEND.startDay).toBe(5);
    expect(SHIFT_RULES.WEEKEND.startHour).toBe(17);
  });

  it("defines weekend shift ending Monday at 9am", () => {
    expect(SHIFT_RULES.WEEKEND.endDay).toBe(1);
    expect(SHIFT_RULES.WEEKEND.endHour).toBe(9);
  });

  it("has human-readable descriptions", () => {
    expect(SHIFT_RULES.WEEKDAY_OVERNIGHT.description).toBe("Mon - Fri: 5pm - 9am");
    expect(SHIFT_RULES.WEEKEND.description).toBe("Fri 5pm - Mon 9am");
  });
});

describe("ROLES", () => {
  it("maps all role keys to human-readable labels", () => {
    expect(ROLES.SUPPORT_WORKER).toBe("Support Worker");
    expect(ROLES.TEAM_LEAD).toBe("Team Lead");
    expect(ROLES.MANAGER).toBe("Manager");
    expect(ROLES.ADMIN).toBe("Admin");
  });

  it("contains exactly 4 roles", () => {
    expect(Object.keys(ROLES)).toHaveLength(4);
  });
});

describe("SWAP_STATUS", () => {
  it("maps all status keys to human-readable labels", () => {
    expect(SWAP_STATUS.PENDING).toBe("Pending");
    expect(SWAP_STATUS.APPROVED).toBe("Approved");
    expect(SWAP_STATUS.REJECTED).toBe("Rejected");
    expect(SWAP_STATUS.CANCELLED).toBe("Cancelled");
  });

  it("contains exactly 4 statuses", () => {
    expect(Object.keys(SWAP_STATUS)).toHaveLength(4);
  });
});

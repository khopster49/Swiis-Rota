import { describe, it, expect } from "vitest";
import { SHIFT_RULES } from "@/lib/constants";

/**
 * Tests for shift time calculation logic used throughout the app.
 * These validate the date arithmetic used when creating shifts
 * and determining current on-call status.
 */

describe("Weekday overnight shift time calculation", () => {
  it("creates correct start time (5pm same day)", () => {
    const date = new Date(2026, 1, 9); // Mon Feb 9
    const startTime = new Date(date);
    startTime.setHours(SHIFT_RULES.WEEKDAY_OVERNIGHT.startHour, 0, 0, 0);

    expect(startTime.getHours()).toBe(17);
    expect(startTime.getDate()).toBe(9);
  });

  it("creates correct end time (9am next day)", () => {
    const date = new Date(2026, 1, 9); // Mon Feb 9
    const endTime = new Date(date);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(SHIFT_RULES.WEEKDAY_OVERNIGHT.endHour, 0, 0, 0);

    expect(endTime.getHours()).toBe(9);
    expect(endTime.getDate()).toBe(10);
  });

  it("shift spans overnight correctly", () => {
    const date = new Date(2026, 1, 9);
    const startTime = new Date(date);
    startTime.setHours(17, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(9, 0, 0, 0);

    // Duration should be 16 hours
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    expect(durationHours).toBe(16);
  });
});

describe("Weekend shift time calculation", () => {
  it("creates correct start time (Friday 5pm)", () => {
    const friday = new Date(2026, 1, 6); // Fri Feb 6
    const startTime = new Date(friday);
    startTime.setHours(SHIFT_RULES.WEEKEND.startHour, 0, 0, 0);

    expect(startTime.getDay()).toBe(5); // Friday
    expect(startTime.getHours()).toBe(17);
  });

  it("creates correct end time (Monday 9am, 3 days later)", () => {
    const friday = new Date(2026, 1, 6);
    const endTime = new Date(friday);
    endTime.setDate(endTime.getDate() + 3);
    endTime.setHours(SHIFT_RULES.WEEKEND.endHour, 0, 0, 0);

    expect(endTime.getDay()).toBe(1); // Monday
    expect(endTime.getHours()).toBe(9);
    expect(endTime.getDate()).toBe(9);
  });

  it("weekend shift spans 64 hours (Fri 5pm to Mon 9am)", () => {
    const friday = new Date(2026, 1, 6);
    const startTime = new Date(friday);
    startTime.setHours(17, 0, 0, 0);
    const endTime = new Date(friday);
    endTime.setDate(endTime.getDate() + 3);
    endTime.setHours(9, 0, 0, 0);

    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    expect(durationHours).toBe(64);
  });
});

describe("Date overlap detection (calendar display logic)", () => {
  function shiftsOverlapDay(
    shiftStart: Date,
    shiftEnd: Date,
    day: Date
  ): boolean {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    return shiftStart <= dayEnd && shiftEnd >= dayStart;
  }

  it("weekday shift overlaps its start date", () => {
    const startTime = new Date(2026, 1, 9, 17, 0); // Mon 5pm
    const endTime = new Date(2026, 1, 10, 9, 0); // Tue 9am
    expect(shiftsOverlapDay(startTime, endTime, new Date(2026, 1, 9))).toBe(true);
  });

  it("weekday shift overlaps the next morning", () => {
    const startTime = new Date(2026, 1, 9, 17, 0);
    const endTime = new Date(2026, 1, 10, 9, 0);
    expect(shiftsOverlapDay(startTime, endTime, new Date(2026, 1, 10))).toBe(true);
  });

  it("weekday shift does not overlap two days later", () => {
    const startTime = new Date(2026, 1, 9, 17, 0);
    const endTime = new Date(2026, 1, 10, 9, 0);
    expect(shiftsOverlapDay(startTime, endTime, new Date(2026, 1, 11))).toBe(false);
  });

  it("weekend shift overlaps Friday, Saturday, and Sunday", () => {
    const startTime = new Date(2026, 1, 6, 17, 0); // Fri 5pm
    const endTime = new Date(2026, 1, 9, 9, 0); // Mon 9am

    expect(shiftsOverlapDay(startTime, endTime, new Date(2026, 1, 6))).toBe(true); // Fri
    expect(shiftsOverlapDay(startTime, endTime, new Date(2026, 1, 7))).toBe(true); // Sat
    expect(shiftsOverlapDay(startTime, endTime, new Date(2026, 1, 8))).toBe(true); // Sun
  });

  it("weekend shift overlaps Monday morning", () => {
    const startTime = new Date(2026, 1, 6, 17, 0);
    const endTime = new Date(2026, 1, 9, 9, 0);
    expect(shiftsOverlapDay(startTime, endTime, new Date(2026, 1, 9))).toBe(true); // Mon
  });

  it("weekend shift does not overlap Thursday before", () => {
    const startTime = new Date(2026, 1, 6, 17, 0);
    const endTime = new Date(2026, 1, 9, 9, 0);
    expect(shiftsOverlapDay(startTime, endTime, new Date(2026, 1, 5))).toBe(false);
  });
});

describe("Current on-call determination", () => {
  function isOnCall(shiftStart: Date, shiftEnd: Date, now: Date): boolean {
    return shiftStart <= now && shiftEnd >= now;
  }

  it("returns true during a weekday overnight shift", () => {
    const start = new Date(2026, 1, 9, 17, 0); // Mon 5pm
    const end = new Date(2026, 1, 10, 9, 0); // Tue 9am
    const now = new Date(2026, 1, 9, 22, 0); // Mon 10pm
    expect(isOnCall(start, end, now)).toBe(true);
  });

  it("returns false before a shift starts", () => {
    const start = new Date(2026, 1, 9, 17, 0);
    const end = new Date(2026, 1, 10, 9, 0);
    const now = new Date(2026, 1, 9, 14, 0); // Mon 2pm
    expect(isOnCall(start, end, now)).toBe(false);
  });

  it("returns false after a shift ends", () => {
    const start = new Date(2026, 1, 9, 17, 0);
    const end = new Date(2026, 1, 10, 9, 0);
    const now = new Date(2026, 1, 10, 10, 0); // Tue 10am
    expect(isOnCall(start, end, now)).toBe(false);
  });

  it("returns true at shift boundary (start)", () => {
    const start = new Date(2026, 1, 9, 17, 0);
    const end = new Date(2026, 1, 10, 9, 0);
    expect(isOnCall(start, end, start)).toBe(true);
  });

  it("returns true during a weekend shift on Saturday", () => {
    const start = new Date(2026, 1, 6, 17, 0); // Fri 5pm
    const end = new Date(2026, 1, 9, 9, 0); // Mon 9am
    const now = new Date(2026, 1, 7, 14, 0); // Sat 2pm
    expect(isOnCall(start, end, now)).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the service module
vi.mock("@/services/shift-service", () => ({
  getShiftsByDateRange: vi.fn(),
}));

// Mock prisma for POST handler
vi.mock("@/lib/prisma", () => ({
  prisma: {
    shift: {
      create: vi.fn(),
    },
  },
}));

import { GET, POST } from "@/app/api/shifts/route";
import { getShiftsByDateRange } from "@/services/shift-service";
import { prisma } from "@/lib/prisma";

const mockShifts = [
  {
    id: "shift-1",
    type: "WEEKDAY_OVERNIGHT",
    startTime: new Date("2026-02-09T17:00:00Z"),
    endTime: new Date("2026-02-10T09:00:00Z"),
    assignment: {
      primaryStaff: { firstName: "Sarah", lastName: "Jenkins" },
      secondaryStaff: { firstName: "Tom", lastName: "Clarke" },
    },
  },
];

describe("GET /api/shifts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when from param is missing", async () => {
    const request = new NextRequest("http://localhost/api/shifts?to=2026-03-01");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_PARAMS");
  });

  it("returns 400 when to param is missing", async () => {
    const request = new NextRequest("http://localhost/api/shifts?from=2026-02-01");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_PARAMS");
  });

  it("returns 400 when both params are missing", async () => {
    const request = new NextRequest("http://localhost/api/shifts");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns shifts when valid params provided", async () => {
    vi.mocked(getShiftsByDateRange).mockResolvedValue(mockShifts as never);

    const request = new NextRequest(
      "http://localhost/api/shifts?from=2026-02-01&to=2026-03-01"
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: "shift-1" })]));
  });

  it("passes correct dates to service", async () => {
    vi.mocked(getShiftsByDateRange).mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost/api/shifts?from=2026-02-01&to=2026-03-01"
    );
    await GET(request);

    expect(getShiftsByDateRange).toHaveBeenCalledWith(
      new Date("2026-02-01"),
      new Date("2026-03-01")
    );
  });
});

describe("POST /api/shifts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a shift and returns 201", async () => {
    const newShift = {
      id: "shift-new",
      type: "WEEKDAY_OVERNIGHT",
      date: "2026-02-15",
      startTime: "2026-02-15T17:00:00Z",
      endTime: "2026-02-16T09:00:00Z",
    };
    vi.mocked(prisma.shift.create).mockResolvedValue(newShift as never);

    const request = new NextRequest("http://localhost/api/shifts", {
      method: "POST",
      body: JSON.stringify({
        date: "2026-02-15",
        type: "WEEKDAY_OVERNIGHT",
        startTime: "2026-02-15T17:00:00Z",
        endTime: "2026-02-16T09:00:00Z",
        primaryStaffId: "user-1",
        secondaryStaffId: "user-2",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.id).toBe("shift-new");
  });
});

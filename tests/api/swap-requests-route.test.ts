import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the service module
vi.mock("@/services/swap-service", () => ({
  getPendingSwapRequests: vi.fn(),
  getSwapRequestsByShift: vi.fn(),
  getSwapRequestsByUser: vi.fn(),
  createSwapRequest: vi.fn(),
  reviewSwapRequest: vi.fn(),
  cancelSwapRequest: vi.fn(),
}));

import { GET, POST } from "@/app/api/swap-requests/route";
import { PUT } from "@/app/api/swap-requests/[requestId]/route";
import {
  getPendingSwapRequests,
  getSwapRequestsByShift,
  getSwapRequestsByUser,
  createSwapRequest,
  reviewSwapRequest,
  cancelSwapRequest,
} from "@/services/swap-service";

const mockSwap = {
  id: "swap-1",
  status: "PENDING",
  requester: { id: "user-1", firstName: "Sarah", lastName: "Jenkins" },
  targetStaff: { id: "user-2", firstName: "Tom", lastName: "Clarke" },
};

describe("GET /api/swap-requests", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns pending swaps when pending=true", async () => {
    vi.mocked(getPendingSwapRequests).mockResolvedValue([mockSwap] as never);

    const request = new NextRequest("http://localhost/api/swap-requests?pending=true");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(1);
    expect(getPendingSwapRequests).toHaveBeenCalled();
  });

  it("returns swaps by shiftId", async () => {
    vi.mocked(getSwapRequestsByShift).mockResolvedValue([mockSwap] as never);

    const request = new NextRequest("http://localhost/api/swap-requests?shiftId=shift-1");
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(getSwapRequestsByShift).toHaveBeenCalledWith("shift-1");
  });

  it("returns swaps by userId", async () => {
    vi.mocked(getSwapRequestsByUser).mockResolvedValue([mockSwap] as never);

    const request = new NextRequest("http://localhost/api/swap-requests?userId=user-1");
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(getSwapRequestsByUser).toHaveBeenCalledWith("user-1");
  });

  it("returns 400 when no params provided", async () => {
    const request = new NextRequest("http://localhost/api/swap-requests");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_PARAMS");
  });
});

describe("POST /api/swap-requests", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a swap request and returns 201", async () => {
    vi.mocked(createSwapRequest).mockResolvedValue(mockSwap as never);

    const request = new NextRequest("http://localhost/api/swap-requests", {
      method: "POST",
      body: JSON.stringify({
        shiftId: "shift-1",
        requesterId: "user-1",
        targetStaffId: "user-2",
        reason: "Holiday conflict",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(createSwapRequest).toHaveBeenCalledWith({
      shiftId: "shift-1",
      requesterId: "user-1",
      targetStaffId: "user-2",
      reason: "Holiday conflict",
    });
  });

  it("returns 400 when required fields are missing", async () => {
    const request = new NextRequest("http://localhost/api/swap-requests", {
      method: "POST",
      body: JSON.stringify({ shiftId: "shift-1" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("MISSING_FIELDS");
  });
});

describe("PUT /api/swap-requests/[requestId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("approves a swap request", async () => {
    vi.mocked(reviewSwapRequest).mockResolvedValue({ ...mockSwap, status: "APPROVED" } as never);

    const request = new NextRequest("http://localhost/api/swap-requests/swap-1", {
      method: "PUT",
      body: JSON.stringify({ action: "APPROVE", reviewerId: "user-3" }),
    });

    const response = await PUT(request, { params: Promise.resolve({ requestId: "swap-1" }) });
    expect(response.status).toBe(200);
    expect(reviewSwapRequest).toHaveBeenCalledWith("swap-1", "APPROVED", "user-3");
  });

  it("rejects a swap request", async () => {
    vi.mocked(reviewSwapRequest).mockResolvedValue({ ...mockSwap, status: "REJECTED" } as never);

    const request = new NextRequest("http://localhost/api/swap-requests/swap-1", {
      method: "PUT",
      body: JSON.stringify({ action: "REJECT", reviewerId: "user-3" }),
    });

    const response = await PUT(request, { params: Promise.resolve({ requestId: "swap-1" }) });
    expect(response.status).toBe(200);
    expect(reviewSwapRequest).toHaveBeenCalledWith("swap-1", "REJECTED", "user-3");
  });

  it("cancels a swap request", async () => {
    vi.mocked(cancelSwapRequest).mockResolvedValue({ ...mockSwap, status: "CANCELLED" } as never);

    const request = new NextRequest("http://localhost/api/swap-requests/swap-1", {
      method: "PUT",
      body: JSON.stringify({ action: "CANCEL", reviewerId: "user-1" }),
    });

    const response = await PUT(request, { params: Promise.resolve({ requestId: "swap-1" }) });
    expect(response.status).toBe(200);
    expect(cancelSwapRequest).toHaveBeenCalledWith("swap-1", "user-1");
  });

  it("returns 400 when action is missing", async () => {
    const request = new NextRequest("http://localhost/api/swap-requests/swap-1", {
      method: "PUT",
      body: JSON.stringify({ reviewerId: "user-3" }),
    });

    const response = await PUT(request, { params: Promise.resolve({ requestId: "swap-1" }) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("MISSING_FIELDS");
  });

  it("returns 400 for invalid action", async () => {
    const request = new NextRequest("http://localhost/api/swap-requests/swap-1", {
      method: "PUT",
      body: JSON.stringify({ action: "INVALID", reviewerId: "user-3" }),
    });

    const response = await PUT(request, { params: Promise.resolve({ requestId: "swap-1" }) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_ACTION");
  });
});

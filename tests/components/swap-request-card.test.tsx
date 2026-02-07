import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SwapRequestCard } from "@/components/swap/swap-request-card";

const baseProps = {
  id: "swap-1",
  status: "PENDING",
  reason: "Holiday conflict",
  createdAt: "2026-02-08T10:00:00.000Z",
  requester: {
    id: "user-1",
    firstName: "Sarah",
    lastName: "Jenkins",
    avatarUrl: null,
  },
  targetStaff: {
    id: "user-2",
    firstName: "Tom",
    lastName: "Clarke",
    avatarUrl: null,
  },
  shift: {
    type: "WEEKDAY_OVERNIGHT",
    startTime: "2026-02-09T17:00:00.000Z",
    endTime: "2026-02-10T09:00:00.000Z",
  },
  currentUserId: "user-3",
  canReview: true,
};

describe("SwapRequestCard", () => {
  it("renders swap request header", () => {
    render(<SwapRequestCard {...baseProps} />);
    expect(screen.getByText("Swap Request")).toBeInTheDocument();
  });

  it("renders requester and target names", () => {
    render(<SwapRequestCard {...baseProps} />);
    expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
    expect(screen.getByText("Tom Clarke")).toBeInTheDocument();
  });

  it("renders requester and target role labels", () => {
    render(<SwapRequestCard {...baseProps} />);
    expect(screen.getByText("Requester")).toBeInTheDocument();
    expect(screen.getByText("Target")).toBeInTheDocument();
  });

  it("renders reason when provided", () => {
    render(<SwapRequestCard {...baseProps} />);
    expect(screen.getByText("Holiday conflict")).toBeInTheDocument();
  });

  it("does not render reason section when null", () => {
    render(<SwapRequestCard {...baseProps} reason={null} />);
    expect(screen.queryByText("Reason")).not.toBeInTheDocument();
  });

  it("renders Pending badge for pending status", () => {
    render(<SwapRequestCard {...baseProps} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders Approved badge for approved status", () => {
    render(<SwapRequestCard {...baseProps} status="APPROVED" />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("renders Rejected badge for rejected status", () => {
    render(<SwapRequestCard {...baseProps} status="REJECTED" />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("shows approve/reject buttons for reviewers on pending requests", () => {
    render(<SwapRequestCard {...baseProps} />);
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("hides approve/reject when canReview is false", () => {
    render(<SwapRequestCard {...baseProps} canReview={false} />);
    expect(screen.queryByText("Approve")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();
  });

  it("hides approve/reject for non-pending requests", () => {
    render(<SwapRequestCard {...baseProps} status="APPROVED" />);
    expect(screen.queryByText("Approve")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();
  });

  it("calls onApprove when Approve is clicked", () => {
    const onApprove = vi.fn();
    render(<SwapRequestCard {...baseProps} onApprove={onApprove} />);
    fireEvent.click(screen.getByText("Approve"));
    expect(onApprove).toHaveBeenCalledWith("swap-1");
  });

  it("calls onReject when Reject is clicked", () => {
    const onReject = vi.fn();
    render(<SwapRequestCard {...baseProps} onReject={onReject} />);
    fireEvent.click(screen.getByText("Reject"));
    expect(onReject).toHaveBeenCalledWith("swap-1");
  });

  it("shows Cancel button when requester is current user", () => {
    render(<SwapRequestCard {...baseProps} currentUserId="user-1" canReview={false} />);
    expect(screen.getByText("Cancel Request")).toBeInTheDocument();
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();
    render(
      <SwapRequestCard
        {...baseProps}
        currentUserId="user-1"
        canReview={false}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText("Cancel Request"));
    expect(onCancel).toHaveBeenCalledWith("swap-1");
  });

  it("does not show Cancel button when user is not requester", () => {
    render(<SwapRequestCard {...baseProps} currentUserId="user-3" />);
    expect(screen.queryByText("Cancel Request")).not.toBeInTheDocument();
  });

  it("renders avatar initials for both staff", () => {
    render(<SwapRequestCard {...baseProps} />);
    expect(screen.getByText("SJ")).toBeInTheDocument();
    expect(screen.getByText("TC")).toBeInTheDocument();
  });

  it("renders weekday shift info", () => {
    render(<SwapRequestCard {...baseProps} />);
    expect(screen.getByText(/Weekday Overnight/)).toBeInTheDocument();
  });

  it("renders weekend shift info", () => {
    const weekendProps = {
      ...baseProps,
      shift: {
        type: "WEEKEND",
        startTime: "2026-02-06T17:00:00.000Z",
        endTime: "2026-02-09T09:00:00.000Z",
      },
    };
    render(<SwapRequestCard {...weekendProps} />);
    expect(screen.getByText(/Weekend/)).toBeInTheDocument();
  });
});

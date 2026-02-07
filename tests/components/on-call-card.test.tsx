import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnCallCard } from "@/components/dashboard/on-call-card";

const mockShift = {
  type: "WEEKDAY_OVERNIGHT",
  startTime: "2026-02-09T17:00:00.000Z",
  endTime: "2026-02-10T09:00:00.000Z",
  assignment: {
    primaryStaff: {
      firstName: "Sarah",
      lastName: "Jenkins",
      avatarUrl: null,
      phone: "07700900001",
    },
    secondaryStaff: {
      firstName: "Tom",
      lastName: "Clarke",
      avatarUrl: null,
      phone: "07700900002",
    },
  },
};

describe("OnCallCard", () => {
  it("renders no active shift message when shift is null", () => {
    render(<OnCallCard shift={null} />);
    expect(screen.getByText("No Active Shift")).toBeInTheDocument();
    expect(
      screen.getByText("No one is currently scheduled for on-call duty.")
    ).toBeInTheDocument();
  });

  it("renders no active shift when assignment is null", () => {
    render(
      <OnCallCard shift={{ type: "WEEKEND", startTime: "", endTime: "", assignment: null }} />
    );
    expect(screen.getByText("No Active Shift")).toBeInTheDocument();
  });

  it("renders weekday shift label", () => {
    render(<OnCallCard shift={mockShift} />);
    expect(screen.getByText("Weekday Shift")).toBeInTheDocument();
    expect(screen.getByText("5:00 PM - 9:00 AM")).toBeInTheDocument();
  });

  it("renders weekend shift label", () => {
    const weekendShift = { ...mockShift, type: "WEEKEND" };
    render(<OnCallCard shift={weekendShift} />);
    expect(screen.getByText("Weekend Shift")).toBeInTheDocument();
    expect(screen.getByText("Fri 5:00 PM - Mon 9:00 AM")).toBeInTheDocument();
  });

  it("renders primary and secondary staff names", () => {
    render(<OnCallCard shift={mockShift} />);
    expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
    expect(screen.getByText("Tom Clarke")).toBeInTheDocument();
  });

  it("renders Primary and Secondary labels", () => {
    render(<OnCallCard shift={mockShift} />);
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(screen.getByText("Secondary")).toBeInTheDocument();
  });

  it("renders LIVE badge when shift is active", () => {
    render(<OnCallCard shift={mockShift} />);
    expect(screen.getByText("LIVE")).toBeInTheDocument();
  });

  it("renders phone call links for staff with phone numbers", () => {
    render(<OnCallCard shift={mockShift} />);
    const callPrimary = screen.getByLabelText("Call primary");
    expect(callPrimary).toHaveAttribute("href", "tel:07700900001");
    const callSecondary = screen.getByLabelText("Call secondary");
    expect(callSecondary).toHaveAttribute("href", "tel:07700900002");
  });

  it("renders emergency call button", () => {
    render(<OnCallCard shift={mockShift} />);
    expect(screen.getByText("EMERGENCY CALL")).toBeInTheDocument();
  });

  it("does not render phone link when phone is null", () => {
    const noPhoneShift = {
      ...mockShift,
      assignment: {
        primaryStaff: { ...mockShift.assignment.primaryStaff, phone: null },
        secondaryStaff: { ...mockShift.assignment.secondaryStaff, phone: null },
      },
    };
    render(<OnCallCard shift={noPhoneShift} />);
    expect(screen.queryByLabelText("Call primary")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Call secondary")).not.toBeInTheDocument();
  });

  it("renders avatar initials for staff without avatar URLs", () => {
    render(<OnCallCard shift={mockShift} />);
    expect(screen.getByText("SJ")).toBeInTheDocument();
    expect(screen.getByText("TC")).toBeInTheDocument();
  });
});

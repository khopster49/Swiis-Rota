import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShiftCell } from "@/components/rota/shift-cell";

// Freeze "today" for deterministic tests
const TODAY = new Date(2026, 1, 9); // Mon Feb 9, 2026
vi.useFakeTimers();
vi.setSystemTime(TODAY);

const mockShift = {
  id: "shift-1",
  type: "WEEKDAY_OVERNIGHT",
  assignment: {
    primaryStaff: { firstName: "Sarah", lastName: "Jenkins" },
    secondaryStaff: { firstName: "Tom", lastName: "Clarke" },
  },
};

const weekendShift = {
  id: "shift-2",
  type: "WEEKEND",
  assignment: {
    primaryStaff: { firstName: "Emma", lastName: "Davis" },
    secondaryStaff: { firstName: "James", lastName: "Wright" },
  },
};

describe("ShiftCell", () => {
  it("renders the day number", () => {
    render(
      <ShiftCell
        date={new Date(2026, 1, 15)}
        shifts={[]}
        isCurrentMonth={true}
        onSelectDay={() => {}}
        isSelected={false}
      />
    );
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("renders abbreviated staff names when shift exists", () => {
    render(
      <ShiftCell
        date={new Date(2026, 1, 10)}
        shifts={[mockShift]}
        isCurrentMonth={true}
        onSelectDay={() => {}}
        isSelected={false}
      />
    );
    expect(screen.getByText("Sarah J.")).toBeInTheDocument();
    expect(screen.getByText("Tom C.")).toBeInTheDocument();
  });

  it("renders Today label for today's date", () => {
    render(
      <ShiftCell
        date={TODAY}
        shifts={[]}
        isCurrentMonth={true}
        onSelectDay={() => {}}
        isSelected={false}
      />
    );
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("does not render Today label for other dates", () => {
    render(
      <ShiftCell
        date={new Date(2026, 1, 15)}
        shifts={[]}
        isCurrentMonth={true}
        onSelectDay={() => {}}
        isSelected={false}
      />
    );
    expect(screen.queryByText("Today")).not.toBeInTheDocument();
  });

  it("calls onSelectDay when clicked", () => {
    const onSelectDay = vi.fn();
    const date = new Date(2026, 1, 10);
    render(
      <ShiftCell
        date={date}
        shifts={[]}
        isCurrentMonth={true}
        onSelectDay={onSelectDay}
        isSelected={false}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSelectDay).toHaveBeenCalledWith(date);
  });

  it("does not render staff names when not current month", () => {
    render(
      <ShiftCell
        date={new Date(2026, 0, 31)}
        shifts={[mockShift]}
        isCurrentMonth={false}
        onSelectDay={() => {}}
        isSelected={false}
      />
    );
    expect(screen.queryByText("Sarah J.")).not.toBeInTheDocument();
  });

  it("prefers weekend shift over weekday for display", () => {
    render(
      <ShiftCell
        date={new Date(2026, 1, 7)}
        shifts={[mockShift, weekendShift]}
        isCurrentMonth={true}
        onSelectDay={() => {}}
        isSelected={false}
      />
    );
    // Weekend shift staff should be shown (weekend takes priority)
    expect(screen.getByText("Emma D.")).toBeInTheDocument();
    expect(screen.getByText("James W.")).toBeInTheDocument();
  });

  it("shows weekday shift when no weekend shift present", () => {
    render(
      <ShiftCell
        date={new Date(2026, 1, 10)}
        shifts={[mockShift]}
        isCurrentMonth={true}
        onSelectDay={() => {}}
        isSelected={false}
      />
    );
    expect(screen.getByText("Sarah J.")).toBeInTheDocument();
    expect(screen.getByText("Tom C.")).toBeInTheDocument();
  });

  it("renders no staff names when shifts have no assignment", () => {
    render(
      <ShiftCell
        date={new Date(2026, 1, 10)}
        shifts={[{ id: "shift-3", type: "WEEKDAY_OVERNIGHT", assignment: null }]}
        isCurrentMonth={true}
        onSelectDay={() => {}}
        isSelected={false}
      />
    );
    expect(screen.queryByText(/\./)).not.toBeInTheDocument();
  });
});

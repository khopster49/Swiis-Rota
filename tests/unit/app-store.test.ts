import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/stores/app-store";

describe("AppStore", () => {
  beforeEach(() => {
    // Reset store state between tests
    useAppStore.setState({
      theme: "light",
      staffFilter: null,
      shiftTypeFilter: null,
      unreadCount: 0,
    });
  });

  describe("theme", () => {
    it("defaults to light theme", () => {
      expect(useAppStore.getState().theme).toBe("light");
    });

    it("toggles from light to dark", () => {
      useAppStore.getState().toggleTheme();
      expect(useAppStore.getState().theme).toBe("dark");
    });

    it("toggles from dark back to light", () => {
      useAppStore.getState().setTheme("dark");
      useAppStore.getState().toggleTheme();
      expect(useAppStore.getState().theme).toBe("light");
    });

    it("sets theme directly", () => {
      useAppStore.getState().setTheme("dark");
      expect(useAppStore.getState().theme).toBe("dark");
    });
  });

  describe("filters", () => {
    it("defaults to null staff filter", () => {
      expect(useAppStore.getState().staffFilter).toBeNull();
    });

    it("sets staff filter", () => {
      useAppStore.getState().setStaffFilter("user-1");
      expect(useAppStore.getState().staffFilter).toBe("user-1");
    });

    it("clears staff filter", () => {
      useAppStore.getState().setStaffFilter("user-1");
      useAppStore.getState().setStaffFilter(null);
      expect(useAppStore.getState().staffFilter).toBeNull();
    });

    it("sets shift type filter", () => {
      useAppStore.getState().setShiftTypeFilter("WEEKEND");
      expect(useAppStore.getState().shiftTypeFilter).toBe("WEEKEND");
    });
  });

  describe("unreadCount", () => {
    it("defaults to 0", () => {
      expect(useAppStore.getState().unreadCount).toBe(0);
    });

    it("sets unread count", () => {
      useAppStore.getState().setUnreadCount(5);
      expect(useAppStore.getState().unreadCount).toBe(5);
    });

    it("updates to 0 after clearing", () => {
      useAppStore.getState().setUnreadCount(3);
      useAppStore.getState().setUnreadCount(0);
      expect(useAppStore.getState().unreadCount).toBe(0);
    });
  });

  describe("calendar navigation", () => {
    it("navigates forward by 3 months", () => {
      const initial = useAppStore.getState().calendarStartMonth;
      useAppStore.getState().navigateCalendarForward();
      const next = useAppStore.getState().calendarStartMonth;
      expect(next.getMonth()).toBe((initial.getMonth() + 3) % 12);
    });

    it("navigates backward by 3 months", () => {
      const initial = useAppStore.getState().calendarStartMonth;
      const initialMonth = initial.getMonth();
      useAppStore.getState().navigateCalendarBackward();
      const prev = useAppStore.getState().calendarStartMonth;
      const expectedMonth = (initialMonth - 3 + 12) % 12;
      expect(prev.getMonth()).toBe(expectedMonth);
    });
  });
});

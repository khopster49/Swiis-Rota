import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/stores/app-store";

// Mock next/link as a simple anchor
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  beforeEach(() => {
    useAppStore.setState({
      theme: "light",
      unreadCount: 0,
    });
  });

  it("renders the Swiis branding", () => {
    render(<Header />);
    expect(screen.getByText("swiis")).toBeInTheDocument();
    expect(screen.getByText("Foster Care")).toBeInTheDocument();
  });

  it("renders logo link to home", () => {
    render(<Header />);
    const link = screen.getByText("swiis").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders theme toggle button", () => {
    render(<Header />);
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("toggles theme on button click", () => {
    render(<Header />);
    const button = screen.getByLabelText("Toggle theme");
    fireEvent.click(button);
    expect(useAppStore.getState().theme).toBe("dark");
  });

  it("shows dark_mode icon when in light theme", () => {
    render(<Header />);
    expect(screen.getByText("dark_mode")).toBeInTheDocument();
  });

  it("shows light_mode icon when in dark theme", () => {
    useAppStore.setState({ theme: "dark" });
    render(<Header />);
    expect(screen.getByText("light_mode")).toBeInTheDocument();
  });

  it("does not show unread badge when count is 0", () => {
    render(<Header />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows unread badge with count", () => {
    useAppStore.setState({ unreadCount: 5 });
    render(<Header />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 9+ for large unread counts", () => {
    useAppStore.setState({ unreadCount: 15 });
    render(<Header />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("links to alerts page", () => {
    render(<Header />);
    const alertsLink = screen.getByText("notifications").closest("a");
    expect(alertsLink).toHaveAttribute("href", "/alerts");
  });
});

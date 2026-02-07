import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("renders initials when no src provided", () => {
    render(<Avatar name="Sarah Jenkins" />);
    expect(screen.getByText("SJ")).toBeInTheDocument();
  });

  it("renders single initial for single-word name", () => {
    render(<Avatar name="Sarah" />);
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("limits initials to 2 characters", () => {
    render(<Avatar name="Sarah Jane Jenkins" />);
    expect(screen.getByText("SJ")).toBeInTheDocument();
  });

  it("renders image when src provided", () => {
    render(<Avatar name="Sarah Jenkins" src="/avatar.jpg" />);
    const img = screen.getByAltText("Sarah Jenkins");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/avatar.jpg");
  });

  it("applies sm size class", () => {
    const { container } = render(<Avatar name="Sarah Jenkins" size="sm" />);
    expect(container.firstChild).toHaveClass("w-8", "h-8");
  });

  it("applies md size class by default", () => {
    const { container } = render(<Avatar name="Sarah Jenkins" />);
    expect(container.firstChild).toHaveClass("w-12", "h-12");
  });

  it("applies lg size class", () => {
    const { container } = render(<Avatar name="Sarah Jenkins" size="lg" />);
    expect(container.firstChild).toHaveClass("w-16", "h-16");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Avatar name="Sarah Jenkins" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("generates consistent color for same name", () => {
    const { container: c1 } = render(<Avatar name="Sarah Jenkins" />);
    const { container: c2 } = render(<Avatar name="Sarah Jenkins" />);
    expect(c1.firstChild?.className).toBe(c2.firstChild?.className);
  });
});

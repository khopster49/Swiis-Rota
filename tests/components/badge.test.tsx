import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Pending</Badge>);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("applies default variant styling", () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass("bg-slate-100");
  });

  it("applies orange variant styling", () => {
    const { container } = render(<Badge variant="orange">Orange</Badge>);
    expect(container.firstChild).toHaveClass("text-swiis-orange");
  });

  it("applies green variant styling", () => {
    const { container } = render(<Badge variant="green">Approved</Badge>);
    expect(container.firstChild).toHaveClass("text-swiis-green");
  });

  it("applies red variant styling", () => {
    const { container } = render(<Badge variant="red">Rejected</Badge>);
    expect(container.firstChild).toHaveClass("text-swiis-red");
  });

  it("applies blue variant styling", () => {
    const { container } = render(<Badge variant="blue">Info</Badge>);
    expect(container.firstChild).toHaveClass("text-swiis-blue");
  });

  it("applies purple variant styling", () => {
    const { container } = render(<Badge variant="purple">Handover</Badge>);
    expect(container.firstChild).toHaveClass("text-swiis-purple");
  });

  it("applies custom className", () => {
    const { container } = render(<Badge className="extra-class">Custom</Badge>);
    expect(container.firstChild).toHaveClass("extra-class");
  });

  it("includes base styling classes", () => {
    const { container } = render(<Badge>Base</Badge>);
    expect(container.firstChild).toHaveClass("inline-flex", "items-center", "rounded", "font-bold", "uppercase");
  });
});

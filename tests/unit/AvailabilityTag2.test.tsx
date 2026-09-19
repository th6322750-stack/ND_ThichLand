import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvailabilityTag2 } from "@/components/public-v2/AvailabilityTag2";

describe("AvailabilityTag2", () => {
  // A tag on every card carries no information — "available" is what a
  // visitor already assumes of a listing.
  it("renders nothing for a room that is simply available", () => {
    const { container } = render(<AvailabilityTag2 availability="Còn trống" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("marks a let room so the visitor can skip it", () => {
    render(<AvailabilityTag2 availability="Đã cho thuê" />);
    expect(screen.getByText("Đã cho thuê")).toBeInTheDocument();
  });

  it("answers 'from when?' on the list when the date is known", () => {
    render(<AvailabilityTag2 availability="Sắp trống" availableFrom="cuối tháng 10" />);
    expect(screen.getByText("Sắp trống · cuối tháng 10")).toBeInTheDocument();
  });

  it("falls back to the bare status when no date was entered", () => {
    render(<AvailabilityTag2 availability="Sắp trống" availableFrom={null} />);
    expect(screen.getByText("Sắp trống")).toBeInTheDocument();
  });

  // A move-in date on an already-let room would read as a promise the
  // listing cannot keep.
  it("ignores a stray date on a let room", () => {
    render(<AvailabilityTag2 availability="Đã cho thuê" availableFrom="cuối tháng 10" />);
    expect(screen.getByText("Đã cho thuê")).toBeInTheDocument();
    expect(screen.queryByText(/cuối tháng 10/)).not.toBeInTheDocument();
  });
});

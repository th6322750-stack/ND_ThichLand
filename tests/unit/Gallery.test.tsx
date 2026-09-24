import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Gallery } from "@/components/public/Gallery";

const images = [
  "/assets/placeholders/property-placeholder.svg",
  "/assets/placeholders/project-placeholder.svg",
];

describe("Gallery lightbox", () => {
  it("opens on thumbnail click and navigates with arrow keys, closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Gallery images={images} />);
    await user.click(screen.getAllByRole("button", { name: /xem ảnh/i })[0]!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("locks body scroll while open and restores it on close", async () => {
    const user = userEvent.setup();
    render(<Gallery images={images} />);
    expect(document.body.style.overflow).toBe("");
    await user.click(screen.getAllByRole("button", { name: /xem ảnh/i })[0]!);
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("");
  });
});

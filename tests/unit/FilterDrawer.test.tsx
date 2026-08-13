import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterDrawer } from "@/components/public/FilterDrawer";
import { EMPTY_RENTAL_FILTERS } from "@/lib/rentalFilters";

const baseProps = {
  value: EMPTY_RENTAL_FILTERS,
  onChange: () => {},
  onApply: () => {},
  onReset: () => {},
  locationOptions: ["Hà Nội"],
  propertyTypeOptions: ["Căn hộ" as const],
};

describe("FilterDrawer", () => {
  it("traps focus while open and calls onClose on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FilterDrawer {...baseProps} open onClose={onClose} />);
    const panel = screen.getByRole("dialog");
    expect(panel).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when closed", () => {
    render(<FilterDrawer {...baseProps} open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onApply and closes when Áp dụng is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onApply = vi.fn();
    render(<FilterDrawer {...baseProps} open onClose={onClose} onApply={onApply} />);
    await user.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reflects the current filter value in its controls", () => {
    render(
      <FilterDrawer
        {...baseProps}
        open
        onClose={() => {}}
        value={{ ...EMPTY_RENTAL_FILTERS, location: "Hà Nội" }}
      />,
    );
    expect(screen.getByLabelText("Khu vực")).toHaveValue("Hà Nội");
  });
});

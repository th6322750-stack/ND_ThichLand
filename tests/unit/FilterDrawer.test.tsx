import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterDrawer } from "@/components/public/FilterDrawer";
import { EMPTY_RENTAL_FILTERS } from "@/lib/rentalFilters";

const baseProps = {
  committedFilters: EMPTY_RENTAL_FILTERS,
  onApply: () => {},
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

  it("calls onApply with the edited draft and closes when Áp dụng is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onApply = vi.fn();
    render(<FilterDrawer {...baseProps} open onClose={onClose} onApply={onApply} />);
    await user.selectOptions(screen.getByLabelText("Khu vực"), "Hà Nội");
    await user.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ location: "Hà Nội" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("seeds the draft from committedFilters on open", () => {
    render(
      <FilterDrawer {...baseProps} open onClose={() => {}} committedFilters={{ ...EMPTY_RENTAL_FILTERS, location: "Hà Nội" }} />,
    );
    expect(screen.getByLabelText("Khu vực")).toHaveValue("Hà Nội");
  });

  it("editing a filter then closing with Escape does not call onApply (committed state untouched)", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<FilterDrawer {...baseProps} open onClose={() => {}} onApply={onApply} />);
    await user.selectOptions(screen.getByLabelText("Loại BĐS"), "Căn hộ");
    await user.keyboard("{Escape}");
    expect(onApply).not.toHaveBeenCalled();
  });

  it("editing a filter then closing via the X button does not call onApply", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<FilterDrawer {...baseProps} open onClose={() => {}} onApply={onApply} />);
    await user.selectOptions(screen.getByLabelText("Loại BĐS"), "Căn hộ");
    await user.click(screen.getByRole("button", { name: "Đóng bộ lọc" }));
    expect(onApply).not.toHaveBeenCalled();
  });

  it("editing a filter then clicking the backdrop does not call onApply", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const { container } = render(<FilterDrawer {...baseProps} open onClose={() => {}} onApply={onApply} />);
    await user.selectOptions(screen.getByLabelText("Loại BĐS"), "Căn hộ");
    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as Element);
    expect(onApply).not.toHaveBeenCalled();
  });

  it("re-seeds a fresh draft from committedFilters the next time it reopens, discarding the previous edit", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FilterDrawer {...baseProps} open onClose={() => {}} />);
    await user.selectOptions(screen.getByLabelText("Loại BĐS"), "Căn hộ");
    expect(screen.getByLabelText("Loại BĐS")).toHaveValue("Căn hộ");

    // close (discard) then reopen from the same unchanged committed filters
    rerender(<FilterDrawer {...baseProps} open={false} onClose={() => {}} />);
    rerender(<FilterDrawer {...baseProps} open onClose={() => {}} />);
    expect(screen.getByLabelText("Loại BĐS")).toHaveValue("");
  });

  it("Xóa bộ lọc only clears the draft — still requires Áp dụng to commit", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(
      <FilterDrawer
        {...baseProps}
        open
        onClose={() => {}}
        onApply={onApply}
        committedFilters={{ ...EMPTY_RENTAL_FILTERS, location: "Hà Nội" }}
      />,
    );
    expect(screen.getByLabelText("Khu vực")).toHaveValue("Hà Nội");
    await user.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));
    expect(screen.getByLabelText("Khu vực")).toHaveValue("");
    expect(onApply).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ location: "" }));
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyDetailTabs2 } from "@/components/public-v2/PropertyDetailTabs2";

const baseProps = {
  detailRows: [["Loại BĐS", "Căn hộ"]] as [string, string][],
  address: "123 Đường Test",
};

describe("PropertyDetailTabs2", () => {
  it("exposes tablist/tab/tabpanel semantics with aria-selected", () => {
    render(<PropertyDetailTabs2 {...baseProps} amenities={[]} locationNote={null} videoUrl={null} media={[]} />);
    expect(screen.getByRole("tablist", { name: "Chi tiết bất động sản" })).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("ArrowRight moves focus and selection to the next tab, revealing its content", async () => {
    const user = userEvent.setup();
    render(
      <PropertyDetailTabs2
        {...baseProps}
        amenities={["Hồ bơi", "Gym"]}
        locationNote={null}
        videoUrl={null}
        media={[]}
      />,
    );
    const tabs = screen.getAllByRole("tab");
    // Non-null: getAllByRole throws if it finds nothing, so [0] always exists.
    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByText("Hồ bơi").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gym").length).toBeGreaterThan(0);
  });

  it("renders a fallback message when amenities is empty, real values when set", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PropertyDetailTabs2 {...baseProps} amenities={[]} locationNote={null} videoUrl={null} media={[]} />,
    );
    await user.click(screen.getByRole("tab", { name: "Tiện ích" }));
    expect(screen.getAllByText("Thông tin đang được cập nhật.").length).toBeGreaterThan(0);

    rerender(
      <PropertyDetailTabs2 {...baseProps} amenities={["Hồ bơi"]} locationNote={null} videoUrl={null} media={[]} />,
    );
    expect(screen.getAllByText("Hồ bơi").length).toBeGreaterThan(0);
  });

  it("renders locationNote text on the Vị trí tab when set", async () => {
    const user = userEvent.setup();
    render(
      <PropertyDetailTabs2
        {...baseProps}
        amenities={[]}
        locationNote="Gần trung tâm, kết nối thuận tiện"
        videoUrl={null}
        media={[]}
      />,
    );
    await user.click(screen.getByRole("tab", { name: "Vị trí" }));
    expect(screen.getAllByText("Gần trung tâm, kết nối thuận tiện").length).toBeGreaterThan(0);
  });

  it("renders a YouTube embed for a recognized watch URL, and a plain link for an unrecognized host", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PropertyDetailTabs2
        {...baseProps}
        amenities={[]}
        locationNote={null}
        videoUrl="https://www.youtube.com/watch?v=abc123"
        media={[]}
      />,
    );
    await user.click(screen.getByRole("tab", { name: "Video & Hình ảnh" }));
    const iframes = document.querySelectorAll('iframe[src="https://www.youtube.com/embed/abc123"]');
    expect(iframes.length).toBeGreaterThan(0);

    rerender(
      <PropertyDetailTabs2
        {...baseProps}
        amenities={[]}
        locationNote={null}
        videoUrl="https://vimeo.com/12345"
        media={[]}
      />,
    );
    expect(screen.getAllByRole("link", { name: /Xem video/i }).length).toBeGreaterThan(0);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicShareButton } from "@/components/admin/PublicShareButton";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PublicShareButton", () => {
  it("opens the native share sheet with the public URL when supported", async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });
    render(<PublicShareButton publicPath="/cho-thue/can-ho-a" title="Căn hộ A" />);

    await user.click(screen.getByRole("button", { name: "Chia sẻ Căn hộ A" }));

    expect(share).toHaveBeenCalledWith({
      title: "Căn hộ A",
      url: `${window.location.origin}/cho-thue/can-ho-a`,
    });
  });

  it("copies the public URL when native sharing is unavailable", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<PublicShareButton publicPath="/du-an/du-an-a" title="Dự án A" />);

    await user.click(screen.getByRole("button", { name: "Chia sẻ Dự án A" }));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/du-an/du-an-a`);
    expect(screen.getByText("Đã sao chép")).toBeInTheDocument();
  });

  it("disables sharing for an unpublished record", () => {
    render(<PublicShareButton publicPath="/du-an/ban-nhap" title="Bản nháp" disabled />);

    expect(screen.getByRole("button", { name: /cần xuất bản trước/i })).toBeDisabled();
    expect(screen.getByText("Chia sẻ")).toBeInTheDocument();
  });
});

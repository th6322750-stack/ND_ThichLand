import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BdsForm } from "@/components/admin/BdsForm";

describe("BdsForm", () => {
  it("renders exactly one INTERNAL-ONLY section containing Hoa hồng, Người dẫn, Ghi chú nội bộ", () => {
    render(<BdsForm />);
    const heading = screen.getByText("Thông tin INTERNAL-ONLY");
    const internalSection = heading.closest("section")!;
    expect(internalSection).toHaveTextContent("Hoa hồng");
    expect(internalSection).toHaveTextContent("Người dẫn");
    expect(internalSection).toHaveTextContent("Ghi chú nội bộ");
  });

  it("does not render any Đặt lịch/viewing-request/lead UI", () => {
    render(<BdsForm />);
    expect(screen.queryByText(/đặt lịch xem nhà/i)).not.toBeInTheDocument();
  });
});

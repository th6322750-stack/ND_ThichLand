import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { BdsForm } from "@/components/admin/BdsForm";

const mockRouter = {
  back: () => {},
  forward: () => {},
  refresh: () => {},
  push: () => {},
  replace: () => {},
  prefetch: () => {},
} as unknown as Parameters<typeof AppRouterContext.Provider>[0]["value"];

function renderWithRouter(children: React.ReactNode) {
  return render(<AppRouterContext.Provider value={mockRouter}>{children}</AppRouterContext.Provider>);
}

describe("BdsForm", () => {
  it("renders exactly one internal section containing Hoa hồng, Người dẫn, Ghi chú nội bộ", () => {
    renderWithRouter(<BdsForm />);
    const heading = screen.getByText("Thông tin nội bộ");
    const internalSection = heading.closest("section")!;
    expect(internalSection).toHaveTextContent("Hoa hồng");
    expect(internalSection).toHaveTextContent("Người dẫn");
    expect(internalSection).toHaveTextContent("Ghi chú nội bộ");
    expect(internalSection).toHaveTextContent("Chỉ dùng nội bộ");
    expect(internalSection).not.toHaveTextContent("INTERNAL");
  });

  it("does not render any Đặt lịch/viewing-request/lead UI", () => {
    renderWithRouter(<BdsForm />);
    expect(screen.queryByText(/đặt lịch xem nhà/i)).not.toBeInTheDocument();
  });
});

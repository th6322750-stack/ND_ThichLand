import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Sidebar } from "@/components/admin/Sidebar";

vi.mock("next/headers", () => ({
  cookies: async () => ({ delete: vi.fn(), get: vi.fn(), set: vi.fn(), has: vi.fn() }),
}));

function renderWithRouter(push = vi.fn()) {
  const mockRouter = {
    back: () => {},
    forward: () => {},
    refresh: vi.fn(),
    push,
    replace: () => {},
    prefetch: () => {},
  } as unknown as Parameters<typeof AppRouterContext.Provider>[0]["value"];

  return render(
    <AppRouterContext.Provider value={mockRouter}>
      <Sidebar mobileOpen={false} onMobileClose={() => {}} />
    </AppRouterContext.Provider>,
  );
}

describe("Admin Sidebar", () => {
  it("renders the primary nav items without the redundant Media tab", () => {
    renderWithRouter();
    [
      "Dashboard",
      "Dự án",
      "BĐS cho thuê",
      "Tin tức",
      "Trang Về chúng tôi",
      "Trang Liên hệ",
      "Cài đặt chung",
    ].forEach((label) => {
      expect(screen.getAllByRole("link", { name: label }).length).toBeGreaterThan(0);
    });
    expect(screen.queryByRole("link", { name: "Media" })).not.toBeInTheDocument();
  });

  it("places Dự án above BĐS cho thuê", () => {
    renderWithRouter();
    const firstNav = screen.getAllByRole("navigation", { name: "Điều hướng quản trị" })[0];
    const labels = within(firstNav)
      .getAllByRole("link")
      .map((link) => link.getAttribute("aria-label") ?? link.textContent);

    expect(labels.indexOf("Dự án")).toBeLessThan(labels.indexOf("BĐS cho thuê"));
  });

  it("logs out and navigates to /admin/login when Đăng xuất is clicked", async () => {
    const user = userEvent.setup();
    const push = vi.fn();
    renderWithRouter(push);
    await user.click(screen.getAllByRole("button", { name: "Đăng xuất" })[0]);
    expect(push).toHaveBeenCalledWith("/admin/login");
  });
});

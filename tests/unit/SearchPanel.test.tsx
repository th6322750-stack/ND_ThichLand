import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SearchPanel } from "@/components/public/SearchPanel";

function renderWithRouter(push: (href: string) => void) {
  const mockRouter = {
    back: () => {},
    forward: () => {},
    refresh: () => {},
    push,
    replace: () => {},
    prefetch: () => {},
  } as unknown as Parameters<typeof AppRouterContext.Provider>[0]["value"];

  return render(
    <AppRouterContext.Provider value={mockRouter}>
      <SearchPanel locationOptions={["Hà Nội"]} propertyTypeOptions={["Studio", "Nhà"]} />
    </AppRouterContext.Provider>,
  );
}

describe("SearchPanel", () => {
  it("navigates to /cho-thue with only the supported params the user picked", async () => {
    const user = userEvent.setup();
    const push = vi.fn();
    renderWithRouter(push);

    await user.selectOptions(screen.getByLabelText("Loại BĐS"), "Studio");
    await user.selectOptions(screen.getByLabelText("Khoảng giá"), "duoi-10tr");
    await user.click(screen.getByRole("button", { name: "Tìm kiếm" }));

    expect(push).toHaveBeenCalledTimes(1);
    const href = push.mock.calls[0][0] as string;
    expect(href.startsWith("/cho-thue?")).toBe(true);
    const params = new URLSearchParams(href.split("?")[1]);
    expect(params.get("type")).toBe("Studio");
    expect(params.get("price")).toBe("duoi-10tr");
    expect(params.has("location")).toBe(false);
    expect(params.has("area")).toBe(false);
  });

  it("navigates to the bare /cho-thue route when nothing is selected", async () => {
    const user = userEvent.setup();
    const push = vi.fn();
    renderWithRouter(push);

    await user.click(screen.getByRole("button", { name: "Tìm kiếm" }));

    expect(push).toHaveBeenCalledWith("/cho-thue");
  });
});

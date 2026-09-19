import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { Header } from "@/components/public/Header";

function renderAt(pathname: string) {
  return render(
    <PathnameContext.Provider value={pathname}>
      <Header />
    </PathnameContext.Provider>,
  );
}

describe("Header mobile drawer", () => {
  it("opens on menu click, traps focus, and closes on Escape returning focus to the trigger", async () => {
    const user = userEvent.setup();
    renderAt("/");
    const trigger = screen.getByRole("button", { name: /menu/i });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe("Header active nav", () => {
  it("marks the current route with aria-current=page and no other link", () => {
    renderAt("/cho-thue");
    const links = screen.getAllByRole("link", { name: "Cho thuê" });
    for (const link of links) expect(link).toHaveAttribute("aria-current", "page");
    const home = screen.getAllByRole("link", { name: "Trang chủ" });
    for (const link of home) expect(link).not.toHaveAttribute("aria-current");
  });

  it("marks Cho thuê active for a nested detail route too", () => {
    renderAt("/cho-thue/can-ho-2pn-noi-that-day-du-p301");
    const links = screen.getAllByRole("link", { name: "Cho thuê" });
    for (const link of links) expect(link).toHaveAttribute("aria-current", "page");
  });

  it("marks only Trang chủ active at the root, not every route", () => {
    renderAt("/");
    const home = screen.getAllByRole("link", { name: "Trang chủ" });
    for (const link of home) expect(link).toHaveAttribute("aria-current", "page");
    const rentals = screen.getAllByRole("link", { name: "Cho thuê" });
    for (const link of rentals) expect(link).not.toHaveAttribute("aria-current");
  });
});

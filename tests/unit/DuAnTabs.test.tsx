import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DuAnPage from "@/app/(public-v2)/du-an/page";
import { renderWithNav } from "../helpers/renderWithNav";

describe("/du-an project tabs", () => {
  it("exposes tablist/tab/tabpanel semantics with aria-selected", async () => {
    renderWithNav(await DuAnPage(), "/du-an");
    const tablist = screen.getByRole("tablist", { name: "Lọc dự án theo trạng thái" });
    expect(tablist).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("ArrowRight moves focus and selection to the next tab", async () => {
    const user = userEvent.setup();
    renderWithNav(await DuAnPage(), "/du-an");
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
  });

  it("ArrowLeft wraps from the first tab to the last", async () => {
    const user = userEvent.setup();
    renderWithNav(await DuAnPage(), "/du-an");
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await user.keyboard("{ArrowLeft}");
    expect(tabs[tabs.length - 1]).toHaveFocus();
    expect(tabs[tabs.length - 1]).toHaveAttribute("aria-selected", "true");
  });

  it("Home/End jump to the first/last tab", async () => {
    const user = userEvent.setup();
    renderWithNav(await DuAnPage(), "/du-an");
    const tabs = screen.getAllByRole("tab");
    tabs[1].focus();
    await user.keyboard("{End}");
    expect(tabs[tabs.length - 1]).toHaveFocus();
    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
  });

  it("only the selected tab is in the tab order (roving tabindex)", async () => {
    renderWithNav(await DuAnPage(), "/du-an");
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    expect(tabs[2]).toHaveAttribute("tabindex", "-1");
  });
});
